"""Time adapters selected by model profile and the actual GATT services.

No pairing reset, alarms, sensors, location generation or timezone setters.
All configuration writes originate in byte-for-byte snapshots from this link.
"""
import asyncio
try:
    from asyncio import timeout
except ImportError:
    from async_timeout import timeout

from casio_protocol import (SERVICE, REQUEST, FEATURES, TIME_SERVICE, STANDARD_TIME_SERVICE, CURRENT_TIME,
                            LOCAL_TIME, SP_REQUEST, SP_DATA, ProtocolError, Unsupported,
                            OffsetRequired, WritePolicy, checked_offset, home_offset,
                            local_time_offset, sp_records, unwrap)


class TimeSession:
    def __init__(self, client, profile, manual_offset=None):
        self.client, self.profile = client, profile
        self.manual_offset = manual_offset
        self.policy = WritePolicy(profile)
        self.replies = asyncio.Queue(maxsize=64)
        self.service = client.services.get_service(SERVICE)
        self.time_service = None
        for uuid in (TIME_SERVICE, STANDARD_TIME_SERVICE):
            service = client.services.get_service(uuid)
            char = service.get_characteristic(CURRENT_TIME) if service is not None else None
            if char is not None and any(p in char.properties for p in ("write", "write-without-response")):
                self.time_service = service
                break
        self.time_characteristic = FEATURES
        self.quick = False

    def characteristic(self, uuid):
        services = (self.time_service,) if self.quick and uuid in (CURRENT_TIME, LOCAL_TIME) else (self.service, self.time_service)
        for service in services:
            if service is not None:
                char = service.get_characteristic(uuid)
                if char is not None:
                    return char
        raise Unsupported("Missing time characteristic")

    async def start(self):
        # Keep the hardware-confirmed full GA sequence when available. A
        # dedicated quick-time service is useful on other connection modes,
        # unknown models and SP watches, and changes no configuration at all.
        full_available = bool(self.profile and self.service is not None and
                              self.service.get_characteristic(FEATURES) is not None and
                              self.service.get_characteristic(SP_REQUEST if self.profile.driver == "mip" else REQUEST) is not None)
        if self.time_service is not None and (not full_available or self.profile.driver == "mip" or self.profile.prefer_current_time):
            self.characteristic(CURRENT_TIME)
            self.quick = True
            self.time_characteristic = CURRENT_TIME
            return
        if self.profile is None or self.service is None:
            raise Unsupported("No known time-only adapter for this service")
        self.characteristic(FEATURES)
        self.characteristic(SP_REQUEST if self.profile.driver == "mip" else REQUEST)
        notifications = [char for char in self.service.characteristics
                         if "notify" in char.properties or "indicate" in char.properties]
        if not notifications:
            raise Unsupported("Missing time notifications")

        def notified(characteristic, value):
            if len(value) > 1024 or self.replies.full():
                # Wake the reader with a rejection rather than accept a
                # truncated response after overflowing the bounded queue.
                if self.replies.full():
                    self.replies.get_nowait()
                self.replies.put_nowait(("", b"\xff"))
            else:
                self.replies.put_nowait((getattr(characteristic, "uuid", "").lower(), bytes(value)))
        for char in notifications:
            await self.client.start_notify(char, notified)

    async def write(self, uuid, payload):
        if not self.policy.permits(uuid, payload):
            raise ProtocolError("Write outside time-only policy")
        char = self.characteristic(uuid)
        response = uuid not in (REQUEST, SP_REQUEST)
        if uuid == CURRENT_TIME:
            response = "write" in char.properties
        if ("write" if response else "write-without-response") not in char.properties:
            raise Unsupported("Time characteristic is not writable")
        await self.client.write_gatt_char(char, payload, response=response)

    async def read(self, key):
        await self.write(REQUEST, key)
        async with timeout(5):
            while True:
                _, raw = await self.replies.get()
                data = unwrap(raw, self.profile.driver == "analogue")
                if data[:1] == b"\xff":
                    raise ProtocolError("Watch rejected time initialization")
                if data[:2] == key:
                    if not 4 <= len(data) <= 64:
                        raise ProtocolError("Unknown time record")
                    self.policy.snapshots[key] = data
                    return data

    async def echo(self, key):
        data = await self.read(key)
        await self.write(FEATURES, data)

    def fallback_offset(self):
        return checked_offset(self.manual_offset)

    async def quick_offset(self):
        try:
            char = self.characteristic(LOCAL_TIME)
        except Unsupported:
            return self.fallback_offset()
        if "read" not in char.properties:
            return self.fallback_offset()
        # A failed GATT operation means a connection error, not permission to
        # assume the computer's timezone. Only missing/unknown data uses the
        # explicitly confirmed offset.
        value = bytes(await self.client.read_gatt_char(char))
        try:
            return local_time_offset(value)
        except OffsetRequired:
            return self.fallback_offset()

    async def prepare(self):
        await self.start()
        if self.quick:
            return await self.quick_offset()
        if self.profile.driver == "mip":
            return await self.prepare_mip()
        for key in self.profile.reads:
            await self.echo(key)
        try:
            return home_offset(self.policy.snapshots[b"\x1d\x00"], self.policy.snapshots[b"\x1e\x00"])
        except ProtocolError:
            return self.fallback_offset()

    async def read_sp(self, query, keys):
        self.policy.sp_queries.add(query)
        await self.write(SP_REQUEST, query)
        block = bytearray()
        try:
            async with timeout(5):
                while True:
                    source, fragment = await self.replies.get()
                    if fragment[:1] == b"\xff":
                        raise ProtocolError("Watch rejected SP request")
                    if source != SP_DATA:
                        continue
                    block.extend(fragment)
                    records = sp_records(block)
                    if records is None:
                        continue
                    if [record[:2] for record in records] != keys:
                        raise Unsupported("Incomplete SP settings snapshot")
                    return records
        except (TimeoutError, asyncio.TimeoutError):
            if block:
                raise Unsupported("Firmware omitted required SP records") from None
            raise

    async def prepare_mip(self):
        # SP record counts/fragment sizes vary by firmware. Read the complete
        # current coordinates as well as DST records before allowing any echo.
        # Never replace them with computer coordinates or empty city slots.
        keys1 = [b"\x1d\x00", b"\x1d\x02"] + [bytes([0x24, i]) for i in range(3)]
        records1 = await self.read_sp(bytes.fromhex("051d001d00240024012402"), keys1)
        keys2 = [bytes([0x1E, i]) for i in range(3)]
        records2 = await self.read_sp(bytes.fromhex("031e001e001e00"), keys2)
        keys3 = [bytes([0x1F, i]) for i in (0, 6, 1, 7, 2, 8)]
        records3 = await self.read_sp(bytes([6]) + b"".join(keys3), keys3)
        if any(len(record) != 20 for record in records1[2:] + records3):
            raise Unsupported("Unknown SP city format")
        offset = await self.quick_offset()

        def frame(records):
            return bytes([len(records)]) + b"".join(len(record).to_bytes(2, "little") + record for record in records)
        echoes = [frame(records1[:2]), frame(records2 + records1[2:]), frame(records3)]
        self.policy.sp_echoes.update(echoes)
        for block in echoes:
            await self.write(SP_DATA, block)
        return offset

    async def send_time(self, packet):
        payload = packet[1:] if self.quick else packet
        self.policy.time = (self.time_characteristic, payload)
        await self.write(self.time_characteristic, payload)
        if self.profile and self.profile.second_dial and not self.quick:
            await self.write(FEATURES, b"\x21\x00\x01")
            await self.echo(b"\x1d\x00")
            zones = [await self.read(bytes([0x1E, i])) for i in range(2)]
            for data in zones:
                await self.write(FEATURES, data)
            if self.profile.city_register == 0x1F:
                cities = [await self.read(bytes([0x1F, i])) for i in range(2)]
                for data in cities:
                    await self.write(FEATURES, data)
            await self.write(FEATURES, b"\x21\x01\x01")

    def check_rejection(self):
        while not self.replies.empty():
            _, raw = self.replies.get_nowait()
            if unwrap(raw, bool(self.profile and self.profile.driver == "analogue"))[:1] == b"\xff":
                raise ProtocolError("Watch rejected time update")
