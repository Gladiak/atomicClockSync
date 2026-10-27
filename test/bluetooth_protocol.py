import asyncio
from datetime import datetime, timezone
from pathlib import Path
import sys
import time
import unittest
from unittest.mock import patch
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "bluetooth"))
from casio_protocol import FEATURES, REQUEST, READS, ProtocolError, encode_time, home_offset, supported_name
from helper import Worker


class ProtocolTests(unittest.TestCase):
    def test_exact_time_packet_fraction_weekday_and_midnight(self):
        epoch = datetime(2026, 10, 25, 23, 59, 59, 500000, timezone.utc).timestamp() * 1000
        self.assertEqual(encode_time(epoch, 60), bytes.fromhex("09 ea07 0a 1a 00 3b 3b 01 80 01"))
        self.assertEqual(encode_time(epoch, 0)[8], 7)  # Sunday, ISO numbering
        self.assertEqual(encode_time(epoch + 500, 60)[4:8], bytes([26, 1, 0, 0]))

    def test_preserves_home_offset_and_active_dst_including_quarter_hours(self):
        state, zone = bytearray.fromhex("1d000003"), bytearray.fromhex("1e000000040402")
        original = (bytes(state), bytes(zone))
        self.assertEqual(home_offset(state, zone), 120)
        self.assertEqual((bytes(state), bytes(zone)), original)
        state[3] = 2
        self.assertEqual(home_offset(state, zone), 60)
        zone[4] = 0xEC
        self.assertEqual(home_offset(state, zone), -300)
        zone[4] = 23  # Nepal +05:45; independent of computer timezone
        self.assertEqual(home_offset(state, zone), 345)

    def test_unknown_packets_and_calendar_ranges_fail_closed(self):
        for state, zone in [(b"\x1d", b""), (bytes.fromhex("1d010003"), bytes.fromhex("1e000000040402")),
                            (bytes.fromhex("1d000004"), bytes.fromhex("1e000000040402")),
                            (bytes.fromhex("1d000002"), bytes.fromhex("1e0000007f0402"))]:
            with self.assertRaises(ProtocolError):
                home_offset(state, zone)
        for epoch in [float("nan"), float("inf"), 0, 4102444800000]:
            with self.assertRaises(ProtocolError):
                encode_time(epoch, 0)

    def test_model_allowlist(self):
        for name in ["CASIO GA-B2100", "GA-B2100C", "CASIO GA-B2100-1A", "CASIO GBD-200", "CASIO GWG-B1000"]:
            self.assertTrue(supported_name(name))
        for name in [None, "GA-2100", "CASIO GSW-H1000", "CASIO WSD-F30", "CASIO GA-B2100<script>"]:
            self.assertFalse(supported_name(name))


class FakeCharacteristic:
    def __init__(self, uuid):
        self.uuid = uuid
        self.properties = ["write", "write-without-response"] if uuid == REQUEST else ["write", "notify"]


class FakeClient:
    def __init__(self, *_args, **_kwargs):
        self.services = self
        self.writes = []
        self.closed = False
        self.reject = False
        self.hang = False
        self.on_disconnect = _kwargs.get('disconnected_callback', lambda _client: None)
        self.characteristics = [FakeCharacteristic(FEATURES)]
        self.responses = []
        self.read_replies = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        self.closed = True

    def get_service(self, _uuid):
        return self

    def get_characteristic(self, uuid):
        return FakeCharacteristic(uuid)

    async def start_notify(self, _characteristic, callback):
        self.notify = callback

    async def write_gatt_char(self, characteristic, payload, response):
        self.writes.append((characteristic.uuid, bytes(payload)))
        self.responses.append(response)
        if self.hang:
            return
        if characteristic.uuid == REQUEST:
            fixtures = {READS[0]: bytes.fromhex("1d000002"), READS[1]: bytes.fromhex("1e000000040402"),
                        READS[2]: bytes.fromhex("1e010000ec0401"), READS[3]: b"\x1f\x00PARIS" + bytes(13),
                        READS[4]: b"\x1f\x01TOKYO" + bytes(13)}
            reply = b"\xff" if self.reject else fixtures[payload]
            self.read_replies.append(reply)
            self.notify(characteristic, reply)
        elif payload[:1] == b"\x09":
            self.on_disconnect(self)


class WorkerTests(unittest.IsolatedAsyncioTestCase):
    async def test_scan_releases_immediately_when_a_watch_is_detected(self):
        class Scanner:
            def __init__(self, detection_callback):
                self.callback = detection_callback
            async def __aenter__(self):
                asyncio.get_running_loop().call_soon(self.callback,
                    SimpleNamespace(address="fixture", name="CASIO GA-B2100"),
                    SimpleNamespace(local_name="CASIO GA-B2100"))
            async def __aexit__(self, *_args):
                pass
        worker = Worker(Scanner, None)
        with patch("helper.emit"):
            result = await asyncio.wait_for(worker.scan(), timeout=0.5)
        self.assertEqual(result["count"], 1)

    async def test_sync_queries_offset_then_only_sends_time_and_disconnects(self):
        client = FakeClient()
        def factory(*_args, **kwargs):
            client.on_disconnect = kwargs['disconnected_callback']; return client
        worker = Worker(None, factory)
        worker.devices["selected"] = (object(), "CASIO GA-B2100")
        worker.request_id = 1
        def receive(event):
            if event.get("event") == "clock":
                worker.clock.set_result((1793102400000, time.monotonic()))
        with patch("helper.emit", receive):
            result = await worker.sync("selected")
        self.assertTrue(result["sent"])
        self.assertEqual(result["offsetMinutes"], 60)
        self.assertEqual([p for _, p in client.writes[0:-1:2]], list(READS))
        self.assertEqual(len(client.writes), 11)
        for index, key in enumerate(READS):
            query, echoed = client.writes[index * 2:index * 2 + 2]
            self.assertEqual(query, (REQUEST, key))
            self.assertEqual(echoed[0], FEATURES)
            self.assertEqual(echoed[1][:2], key)
            self.assertEqual(echoed[1], client.read_replies[index])
            self.assertFalse(client.responses[index * 2])
            self.assertTrue(client.responses[index * 2 + 1])
        self.assertEqual(client.writes[-1][1][0], 9)
        self.assertTrue(client.closed)

    async def test_rejection_sends_no_time_and_disconnects(self):
        client = FakeClient(); client.reject = True
        worker = Worker(None, lambda *_args, **_kwargs: client)
        worker.devices["selected"] = (object(), "CASIO GA-B2100")
        with patch("helper.emit"), self.assertRaises(ProtocolError):
            await worker.sync("selected")
        self.assertEqual(len(client.writes), 1)
        self.assertTrue(client.closed)

    async def test_reads_can_arrive_on_a_separate_notification_characteristic(self):
        client = FakeClient()
        notification = FakeCharacteristic('26eb0030-b012-49a8-b1f8-394fb2032b0f')
        notification.properties = ['notify']
        client.characteristics = [notification]
        worker = Worker(None, lambda *_args, **_kwargs: client)
        worker.devices['selected'] = (object(), 'CASIO GA-B2100')
        def receive(event):
            if event.get('event') == 'clock':
                worker.clock.set_result((1793102400000, time.monotonic()))
                client.on_disconnect = lambda _client: None
        with patch('helper.emit', receive):
            result = await worker.sync('selected')
        self.assertTrue(result['sent'])
        self.assertEqual(len(client.writes), 11)

    async def test_cancellation_during_reads_disconnects_without_a_time_write(self):
        client = FakeClient(); client.hang = True
        worker = Worker(None, lambda *_args, **_kwargs: client)
        worker.devices["selected"] = (object(), "CASIO GA-B2100")
        with patch("helper.emit"):
            task = asyncio.create_task(worker.sync("selected"))
            await asyncio.sleep(0)
            task.cancel()
            with self.assertRaises(asyncio.CancelledError):
                await task
        self.assertTrue(client.closed)
        self.assertTrue(all(uuid == REQUEST for uuid, _ in client.writes))


if __name__ == "__main__":
    unittest.main()
