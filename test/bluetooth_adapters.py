"""Synthetic GATT transcripts: no adapter/radio or downloaded code executed."""
import asyncio
from pathlib import Path
import sys
import unittest
from types import SimpleNamespace as Obj

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "bluetooth"))
from models import PROFILES, resolve, discoverable, metadata
from casio_protocol import (SERVICE, REQUEST, FEATURES, SP_REQUEST, SP_DATA,
                            TIME_SERVICE, STANDARD_TIME_SERVICE, CURRENT_TIME, LOCAL_TIME, WritePolicy,
                            ProtocolError, Unsupported, OffsetRequired, encode_time,
                            local_time_offset, sp_records)
from time_session import TimeSession


def frame(records):
    return bytes([len(records)]) + b"".join(len(r).to_bytes(2, "little") + r for r in records)


class Gatt:
    def __init__(self, model="GA-B2100", quick=False, local=b"\x04\x04", wrapped=False):
        self.profile = resolve(model)
        self.services = self
        self.writes, self.callbacks = [], {}
        self.local, self.wrapped = local, wrapped
        self.records = {b"\x1d\x00": bytes.fromhex("1d000003"), b"\x1e\x00": bytes.fromhex("1e000000040402")}
        self.records.update({bytes([0x1D, i]): bytes([0x1D, i, 0, 2]) for i in (2, 4)})
        for i in range(1, 6):
            self.records[bytes([0x1E, i])] = bytes([0x1E, i, 0, 0, 36, 0, 0])
        for register in (0x1F, 0x24):
            for i in range(9):
                self.records[bytes([register, i])] = bytes([register, i]) + bytes([i + 65]) * 18
        chars = [Obj(uuid=REQUEST, properties=["write-without-response"]),
                 Obj(uuid=FEATURES, properties=["write"]),
                 Obj(uuid=SP_REQUEST, properties=["write-without-response"]),
                 Obj(uuid=SP_DATA, properties=["write", "notify"]),
                 Obj(uuid="26eb0030-b012-49a8-b1f8-394fb2032b0f", properties=["notify"])]
        self.chars = {c.uuid: c for c in chars}
        self.full = Obj(characteristics=chars, get_characteristic=self.chars.get)
        time_chars = {CURRENT_TIME: Obj(uuid=CURRENT_TIME, properties=["write"])}
        if local is not None:
            time_chars[LOCAL_TIME] = Obj(uuid=LOCAL_TIME, properties=["read"])
        self.time_chars = time_chars
        self.quick = Obj(get_characteristic=time_chars.get) if quick else None
        self.quick_uuid = TIME_SERVICE
        self.only_quick = quick
        self.sp_replies = {}

    def get_service(self, uuid):
        return {SERVICE: None if self.only_quick else self.full, self.quick_uuid: self.quick}.get(uuid)

    async def start_notify(self, characteristic, callback):
        self.callbacks[characteristic.uuid] = callback

    async def read_gatt_char(self, _characteristic):
        return self.local

    async def write_gatt_char(self, characteristic, payload, response):
        self.writes.append((characteristic.uuid, bytes(payload), response))
        if characteristic.uuid == REQUEST:
            data = self.records[payload]
            if self.wrapped:
                data = b"\x28\x01\x00\x00" + data
            notify = self.chars["26eb0030-b012-49a8-b1f8-394fb2032b0f"]
            self.callbacks[notify.uuid](notify, data)
        if characteristic.uuid == SP_REQUEST:
            # Fragment boundaries deliberately split LE sizes and records.
            reply = self.sp_replies[bytes(payload)]
            notify = self.chars[SP_DATA]
            for offset in range(0, len(reply), 7):
                self.callbacks[SP_DATA](notify, reply[offset:offset + 7])


class RegistryTests(unittest.TestCase):
    def test_explicit_models_suffixes_collisions_and_wearos_exclusion(self):
        self.assertEqual(resolve("CASIO GWG-B1000-1A").module, "5713")
        self.assertEqual(resolve("GA-B2100C").module, "5689")
        self.assertEqual(resolve("GST-B1000").model, "GST-B1000")
        for name in ("GST-B1000D", "CASIO GST-B1000D-1AER", "GST-B1000D-2A", "GST-B1000D-3A"):
            gst = resolve(name)
            self.assertEqual((gst.model, gst.module, gst.instructions), ("GST-B1000", "5748", "gst"))
            self.assertTrue(gst.prefer_current_time)
            self.assertEqual(gst.city_register, 0)
            self.assertFalse(gst.second_dial)
        self.assertEqual(resolve("GST-B100").model, "GST-B100")
        self.assertFalse(resolve("GST-B100").prefer_current_time)
        self.assertIsNone(resolve("GA-B210099"))
        self.assertIsNone(resolve("CASIO GA-B9999"))
        self.assertTrue(discoverable("CASIO GA-B9999"))  # CTS capability discovery only
        for name in ("CASIO GSW-H1000", "WSD-F30", "CASIO WSD-F20", "other watch", None):
            self.assertFalse(discoverable(name))
        self.assertTrue(metadata("GA-B2100")["verified"])
        self.assertTrue(metadata("GWG-B1000")["verified"])
        self.assertGreater(len(PROFILES), 100)

    def test_local_time_info_unknown_is_not_zero_and_quarter_offsets(self):
        for data, expected in ((b"\x17\x00", 345), (b"\xec\x04", -240), (b"\x04\x02", 90)):
            self.assertEqual(local_time_offset(data), expected)
        for data in (b"\x80\x00", b"\x00\xff", b"\x7f\x00", b"", b"\x00\x01"):
            with self.assertRaises(OffsetRequired):
                local_time_offset(data)

    def test_policy_prevents_settings_edits_and_time_replay_for_every_profile(self):
        packet = encode_time(1793102400000, 60)
        for profile in PROFILES.values():
            policy = WritePolicy(profile)
            for key in profile.reads:
                self.assertTrue(policy.permits(REQUEST, key))
                original = key + b"\x00\x01"
                policy.snapshots[key] = original
                self.assertTrue(policy.permits(FEATURES, original))
                self.assertFalse(policy.permits(FEATURES, original[:-1] + b"\x02"))
            for register in (0x13, 0x15, 0x18, 0x30, 0x31):
                self.assertFalse(policy.permits(REQUEST, bytes([register, 0])))
                self.assertFalse(policy.permits(FEATURES, bytes([register]) + bytes(10)))
            self.assertFalse(policy.permits(FEATURES, packet))
            policy.time = (FEATURES, packet)
            self.assertTrue(policy.permits(FEATURES, packet))
            self.assertFalse(policy.permits(FEATURES, packet))
        self.assertFalse(WritePolicy(resolve("GA-B2100")).permits(FEATURES, b"\x21\x00\x01"))

    def test_sp_frames_require_complete_bounded_records(self):
        block = frame([b"\x1d\x00\x01\x02", b"\x24\x00" + bytes(18)])
        for length in range(1, len(block)):
            self.assertIsNone(sp_records(block[:length]))
        self.assertEqual(sp_records(block)[1], b"\x24\x00" + bytes(18))
        for block in (b"\x01\xff\xff", b"\x00", b"\x0d", b"\x01\x01\x00\x00"):
            with self.assertRaises(ProtocolError):
                sp_records(block)


class AdapterTests(unittest.IsolatedAsyncioTestCase):
    async def test_mudmaster_5713_only_initializes_home_and_world_time(self):
        gatt = Gatt("GWG-B1000")
        # The real 5713 returned a 15-byte 1d00 record, then timed out when
        # incorrectly asked for 1d02 by the square's six-clock profile.
        # Payload contents below are synthetic, not a real settings capture.
        gatt.records[b"\x1d\x00"] = bytes.fromhex("1d00000303d4762500ffffffffffff")
        session = TimeSession(gatt, gatt.profile)
        self.assertEqual(await session.prepare(), 120)
        expected = [b"\x1d\x00", b"\x1e\x00", b"\x1e\x01", b"\x1f\x00", b"\x1f\x01"]
        self.assertEqual([p for c, p, _ in gatt.writes if c == REQUEST], expected)
        self.assertEqual([p for c, p, _ in gatt.writes if c == FEATURES], [gatt.records[k] for k in expected])
        await session.send_time(encode_time(1793102400000, 120))
        self.assertEqual(len(gatt.writes), 11)
        self.assertEqual(gatt.writes[-1][1][0], 9)
        self.assertFalse(session.policy.permits(REQUEST, b"\x1d\x02"))
        self.assertFalse(session.policy.permits(REQUEST, b"\x1e\x02"))

    async def test_square_still_initializes_all_six_clocks(self):
        gatt = Gatt("GW-B5600")
        session = TimeSession(gatt, gatt.profile)
        await session.prepare()
        expected = ([bytes([0x1D, i]) for i in (0, 2, 4)] +
                    [bytes([0x1E, i]) for i in range(6)] + [bytes([0x1F, i]) for i in range(6)])
        self.assertEqual([p for c, p, _ in gatt.writes if c == REQUEST], expected)

    async def test_no_city_model_does_not_request_world_city_register(self):
        gatt = Gatt("EQB-1000")
        await TimeSession(gatt, gatt.profile).prepare()
        self.assertEqual([p for c, p, _ in gatt.writes if c == REQUEST],
                         [b"\x1d\x00", b"\x1e\x00", b"\x1e\x01"])

    async def test_analogue_envelopes_home_slots_and_second_dial_sequence(self):
        for model, city_register in (("MTG-B1000", 0x1F), ("MTG-B3000", 0x24)):
            gatt = Gatt(model, wrapped=True)
            session = TimeSession(gatt, gatt.profile)
            await session.prepare()
            self.assertIn((REQUEST, bytes([city_register, 0]), False), gatt.writes)
            count = len(gatt.writes)
            await session.send_time(encode_time(1793102400000, 120))
            sent = gatt.writes[count:]
            self.assertEqual(sent[0][1][0], 9)
            self.assertEqual(sent[1][1], b"\x21\x00\x01")
            self.assertEqual(sent[-1][1], b"\x21\x01\x01")
            self.assertTrue(all(p[0] in (9, 0x21, 0x1D, 0x1E, 0x1F) for _, p, _ in sent))
            for c, p, _ in sent:
                if c == FEATURES and p[0] in (0x1D, 0x1E, 0x1F):
                    self.assertEqual(p, gatt.records[p[:2]])

    async def test_quick_time_service_on_unknown_casio_writes_only_ten_time_bytes(self):
        gatt = Gatt("CASIO UNKNOWN-B100", quick=True, local=b"\x17\x00")
        session = TimeSession(gatt, None)
        self.assertEqual(await session.prepare(), 345)
        packet = encode_time(1793102400000, 345)
        await session.send_time(packet)
        self.assertEqual(gatt.writes, [(CURRENT_TIME, packet[1:], True)])

    async def test_quick_service_respects_write_without_response_property(self):
        gatt = Gatt(quick=True)
        gatt.time_chars[CURRENT_TIME].properties = ["write-without-response"]
        session = TimeSession(gatt, gatt.profile)
        await session.prepare()
        await session.send_time(encode_time(1793102400000, 120))
        self.assertFalse(gatt.writes[0][2])

    async def test_standard_bluetooth_current_time_service_is_capability_detected(self):
        gatt = Gatt("CASIO UNKNOWN-B100", quick=True)
        gatt.quick_uuid = STANDARD_TIME_SERVICE
        session = TimeSession(gatt, None)
        self.assertEqual(await session.prepare(), 120)
        packet = encode_time(1793102400000, 120)
        await session.send_time(packet)
        self.assertEqual(gatt.writes, [(CURRENT_TIME, packet[1:], True)])

    async def test_read_only_time_service_cannot_authorize_time(self):
        gatt = Gatt("CASIO UNKNOWN-B100", quick=True)
        gatt.time_chars[CURRENT_TIME].properties = ["read", "notify"]
        with self.assertRaises(Unsupported):
            await TimeSession(gatt, None).prepare()
        self.assertEqual(gatt.writes, [])

    async def test_gst_b1000_prefers_writable_time_service_even_with_full_service_present(self):
        for uuid in (TIME_SERVICE, STANDARD_TIME_SERVICE):
            gatt = Gatt("GST-B1000D", quick=True)
            gatt.only_quick = False
            gatt.quick_uuid = uuid
            session = TimeSession(gatt, gatt.profile)
            self.assertEqual(await session.prepare(), 120)
            packet = encode_time(1793102400000, 120)
            await session.send_time(packet)
            self.assertEqual(gatt.writes, [(CURRENT_TIME, packet[1:], True)])

    async def test_gst_b1000_5748_does_not_query_rejected_city_register(self):
        # A live 5748 trace accepted these three reads/unchanged echoes, then
        # rejected 1f00 with ff81. Keep the device's real reply shape, using
        # synthetic setting values; this does not establish time-write success.
        gatt = Gatt("GST-B1000D")
        gatt.records[b"\x1d\x00"] = bytes.fromhex("1d00000303d4762500ffffffffffff")
        gatt.records[b"\x1f\x00"] = bytes.fromhex("ff8100")
        session = TimeSession(gatt, gatt.profile)
        self.assertEqual(await session.prepare(), 120)
        await session.send_time(encode_time(1793102400000, 120))
        self.assertEqual([p for c, p, _ in gatt.writes if c == REQUEST],
                         [b"\x1d\x00", b"\x1e\x00", b"\x1e\x01"])
        self.assertEqual([p for c, p, _ in gatt.writes if c == FEATURES][:-1],
                         [gatt.records[k] for k in (b"\x1d\x00", b"\x1e\x00", b"\x1e\x01")])
        self.assertEqual(len(gatt.writes), 7)
        self.assertFalse(session.policy.permits(REQUEST, b"\x1f\x00"))
        self.assertFalse(session.policy.permits(FEATURES, bytes.fromhex("1f004142")))
        self.assertFalse(any(p[:1] in (b"\x21", b"\x24") for _, p, _ in gatt.writes))

    async def test_missing_offset_requires_explicit_confirmation_without_writes(self):
        for local in (None, b"\x80\xff"):
            gatt = Gatt(quick=True, local=local)
            with self.assertRaises(OffsetRequired):
                await TimeSession(gatt, gatt.profile).prepare()
            self.assertEqual(gatt.writes, [])
            self.assertEqual(await TimeSession(gatt, gatt.profile, -210).prepare(), -210)
        # A known watch offset takes precedence over a supplied override.
        gatt = Gatt(quick=True)
        self.assertEqual(await TimeSession(gatt, gatt.profile, 0).prepare(), 120)

    async def test_unknown_full_service_does_not_use_a_generic_profile(self):
        gatt = Gatt()
        with self.assertRaises(Unsupported):
            await TimeSession(gatt, None).prepare()
        self.assertEqual(gatt.writes, [])

    def mip_fixture(self):
        gatt = Gatt("GW-BX5600")
        records1 = [gatt.records[k] for k in (b"\x1d\x00", b"\x1d\x02", b"\x24\x00", b"\x24\x01", b"\x24\x02")]
        records2 = [gatt.records[bytes([0x1E, i])] for i in range(3)]
        records3 = [gatt.records[bytes([0x1F, i])] for i in (0, 6, 1, 7, 2, 8)]
        queries = [bytes.fromhex("051d001d00240024012402"), bytes.fromhex("031e001e001e00"), bytes.fromhex("061f001f061f011f071f021f08")]
        gatt.sp_replies = dict(zip(queries, [frame(records1), frame(records2), frame(records3)]))
        return gatt, queries, records1, records2, records3

    async def test_mip_fragment_reassembly_preserves_all_cities_and_coordinates(self):
        gatt, _, one, two, three = self.mip_fixture()
        session = TimeSession(gatt, gatt.profile, 345)
        self.assertEqual(await session.prepare(), 345)
        writes = [p for c, p, _ in gatt.writes if c == SP_DATA]
        self.assertEqual(writes, [frame(one[:2]), frame(two + one[2:]), frame(three)])
        changed = bytearray(writes[1]); changed[-1] ^= 1
        self.assertFalse(session.policy.permits(SP_DATA, bytes(changed)))
        await session.send_time(encode_time(1793102400000, 345))
        self.assertEqual(gatt.writes[-1][0], FEATURES)

    async def test_mip_missing_coordinates_stops_before_any_settings_or_time_write(self):
        gatt, queries, one, _, _ = self.mip_fixture()
        gatt.sp_replies[queries[0]] = frame(one[:2])
        with self.assertRaises(Unsupported):
            await TimeSession(gatt, gatt.profile, 60).prepare()
        self.assertTrue(all(c == SP_REQUEST for c, _, _ in gatt.writes))

    async def test_mip_prefers_dedicated_current_time_service_when_exposed(self):
        gatt = Gatt("GW-BX5600", quick=True)
        session = TimeSession(gatt, gatt.profile)
        await session.prepare()
        await session.send_time(encode_time(1793102400000, 120))
        self.assertEqual([c for c, _, _ in gatt.writes], [CURRENT_TIME])


if __name__ == "__main__":
    unittest.main()
