"""Local JSON-lines BLE worker. No network listener, pairing reset or settings API.

Only the Electron main process talks to this worker. Built with PyInstaller so
distributed applications do not require a Python installation.
"""
import asyncio
import json
import sys
import time
import uuid

try:
    from asyncio import timeout
except ImportError:  # Python 3.10 on the pinned Linux builder.
    from async_timeout import timeout

from casio_protocol import ProtocolError, Unsupported, OffsetRequired, encode_time, supported_name
from models import resolve, metadata
from time_session import TimeSession


def emit(value):
    print(json.dumps(value, separators=(",", ":")), flush=True)


class Worker:
    def __init__(self, scanner, client):
        self.scanner_factory, self.client_factory = scanner, client
        self.devices = {}
        self.task = None
        self.clock = None
        self.request_id = None

    async def scan(self):
        self.devices.clear()
        detected = asyncio.Event()

        def found(device, advertisement):
            name = advertisement.local_name or device.name
            if not supported_name(name) or len(self.devices) >= 64:
                return
            # Addresses stay in this process. Tokens expire on each new scan.
            if any(value[0].address == device.address for value in self.devices.values()):
                return
            token = str(uuid.uuid4())
            self.devices[token] = (device, name[:80])
            emit({"event": "device", "id": self.request_id, "device": {"id": token, "name": name[:80], **metadata(name)}})
            detected.set()

        async with self.scanner_factory(detection_callback=found):
            # Watches only advertise for a short connection window. Release the
            # scanner as soon as a supported device appears, so the user can
            # connect immediately instead of waiting for the watch to show ERR.
            try:
                await asyncio.wait_for(detected.wait(), timeout=10)
            except (TimeoutError, asyncio.TimeoutError):
                pass
        return {"count": len(self.devices)}

    async def sync(self, token, manual_offset=None):
        if token not in self.devices:
            raise ProtocolError("Unknown scan token")
        device, name = self.devices[token]
        if not supported_name(name):
            raise ProtocolError("Unsupported model")
        emit({"event": "stage", "id": self.request_id, "stage": "connecting"})
        disconnected = asyncio.Event()
        async with self.client_factory(device, timeout=15, disconnected_callback=lambda _client: disconnected.set()) as client:
            session = TimeSession(client, resolve(name), manual_offset)
            emit({"event": "stage", "id": self.request_id, "stage": "reading"})
            offset = await session.prepare()
            self.clock = asyncio.get_running_loop().create_future()
            emit({"event": "clock", "id": self.request_id})
            async with timeout(20):
                epoch_ms, received = await self.clock
            packet = encode_time(epoch_ms + (time.monotonic() - received) * 1000, offset)
            emit({"event": "stage", "id": self.request_id, "stage": "sending"})
            # Once a write starts, errors/cancellation cannot prove the watch
            # did not accept it. Never retry a time write automatically.
            self.write_started = True
            await session.send_time(packet)
            # Allow the device to finish its update/automatic disconnect before
            # the host tears down GATT. Do not equate ATT success with watch OK.
            try:
                await asyncio.wait_for(disconnected.wait(), timeout=1)
            except (TimeoutError, asyncio.TimeoutError):
                pass
            session.check_rejection()
            # ATT completion is not a watch-level confirmation. Surface "sent"
            # and ask the user to check the watch instead of claiming accuracy.
            return {"name": name, "offsetMinutes": offset, "sent": True}

    async def run(self, command):
        request_id = command["id"]
        self.request_id = request_id
        self.write_started = False
        result, error = None, None
        try:
            async with timeout(95):
                if command["op"] == "scan":
                    result = await self.scan()
                else:
                    result = await self.sync(command.get("deviceId"), command.get("offsetMinutes"))
        except asyncio.CancelledError:
            error = "uncertain" if self.write_started else "cancelled"
        except OffsetRequired:
            error = "uncertain" if self.write_started else "offset"
        except Unsupported:
            error = "uncertain" if self.write_started else "unsupported"
        except ProtocolError:
            error = "uncertain" if self.write_started else "protocol"
        except (TimeoutError, asyncio.TimeoutError):
            error = "uncertain" if self.write_started else "timeout"
        except Exception as exc:
            # Driver messages differ across OSes. Keep them on stderr for
            # diagnostics; the app translates a stable, actionable error code.
            print(type(exc).__name__ + ": " + str(exc), file=sys.stderr, flush=True)
            error = "uncertain" if self.write_started else "bluetooth"
        finally:
            self.clock = None
        emit({"id": request_id, "ok": error is None, **({"result": result} if error is None else {"code": error})})

    async def listen(self):
        emit({"event": "ready", "version": 1})
        try:
            while True:
                line = await asyncio.to_thread(sys.stdin.buffer.readline, 8193)
                if not line:
                    break
                if len(line) > 8192:
                    break
                try:
                    command = json.loads(line)
                    if not isinstance(command, dict):
                        continue
                    op = command.get("op")
                    if op == "clock" and command.get("id") == self.request_id and self.clock is not None and not self.clock.done():
                        self.clock.set_result((command.get("epochMs"), time.monotonic()))
                    elif op == "cancel":
                        if self.task and not self.task.done():
                            self.task.cancel()
                    elif op in ("scan", "sync") and type(command.get("id")) is int:
                        if self.task and not self.task.done():
                            emit({"id": command["id"], "ok": False, "code": "busy"})
                        else:
                            self.task = asyncio.create_task(self.run(command))
                except (ValueError, TypeError):
                    continue
        finally:
            if self.task and not self.task.done():
                self.task.cancel()
                await self.task


def main():
    if "--self-test" in sys.argv:
        # Exercises the frozen Python runtime and dynamically collected backend
        # imports without accessing the Bluetooth adapter or prompting the OS.
        from bleak import BleakClient, BleakScanner
        from bleak.backends import get_default_backend
        from bleak.backends.client import get_platform_client_backend_type
        from bleak.backends.scanner import get_platform_scanner_backend_type
        get_platform_client_backend_type()
        get_platform_scanner_backend_type()
        emit({"ok": True, "version": 1, "backend": str(get_default_backend())})
        return
    from bleak import BleakClient, BleakScanner
    asyncio.run(Worker(BleakScanner, BleakClient).listen())


if __name__ == "__main__":
    main()
