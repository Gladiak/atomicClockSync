"""Casio time-only wire formats and session-bound write policy.

Wire format reference: izivkov/gshock_api, MIT, commit f15ba343f8b805ee209c1c30dab8fc9e82a52995.
See LICENSE.gshock-api.txt. Time configuration is only echoed byte-for-byte
as required by the legacy handshake; no configuration value is changed.
"""
import math
from datetime import datetime, timedelta, timezone
from models import discoverable

SERVICE = "26eb000d-b012-49a8-b1f8-394fb2032b0f"
REQUEST = "26eb002c-b012-49a8-b1f8-394fb2032b0f"
FEATURES = "26eb002d-b012-49a8-b1f8-394fb2032b0f"
SP_REQUEST = "26eb002e-b012-49a8-b1f8-394fb2032b0f"
SP_DATA = "26eb002f-b012-49a8-b1f8-394fb2032b0f"
TIME_SERVICE = "26eb0002-b012-49a8-b1f8-394fb2032b0f"
STANDARD_TIME_SERVICE = "00001805-0000-1000-8000-00805f9b34fb"
CURRENT_TIME = "00002a2b-0000-1000-8000-00805f9b34fb"
LOCAL_TIME = "00002a0f-0000-1000-8000-00805f9b34fb"
READS = (b"\x1d\x00", b"\x1e\x00", b"\x1e\x01", b"\x1f\x00", b"\x1f\x01")


class ProtocolError(Exception):
    pass


class Unsupported(ProtocolError):
    pass


class OffsetRequired(ProtocolError):
    pass


def supported_name(name):
    return discoverable(name)


def checked_offset(value):
    if type(value) is not int or not -720 <= value <= 840 or value % 15:
        raise OffsetRequired("Confirm the watch's current UTC offset")
    return value


def local_time_offset(value):
    """Bluetooth Local Time Information; unknown offset/DST is not UTC."""
    if len(value) != 2 or value[0] == 0x80 or value[1] not in (0, 2, 4, 8):
        raise OffsetRequired("Unknown local time information")
    signed = value[0] if value[0] < 128 else value[0] - 256
    return checked_offset(signed * 15 + value[1] * 15)


def unwrap(value, analogue=False):
    if analogue and value[:1] == b"\x28":
        if len(value) > 4 and value[1] == 1:
            return value[4:]
        if len(value) > 3 and value[1] == 0:
            return value[3:]
        raise ProtocolError("Unknown analogue envelope")
    return value


def sp_records(block):
    """Decode a complete count-prefixed SP frame, never a partial fragment.

    A missing/zero-size record cannot be safely used as a settings snapshot.
    Upper bounds also prevent an untrusted notification allocating unbounded
    storage. Some firmware omits requested records; those layouts fail closed.
    """
    if not block or not 1 <= block[0] <= 12 or len(block) > 1024:
        raise ProtocolError("Invalid SP frame")
    records, position = [], 1
    for _ in range(block[0]):
        if position + 2 > len(block):
            return None
        size = int.from_bytes(block[position:position + 2], "little")
        if not 2 <= size <= 64:
            raise ProtocolError("Invalid SP record size")
        position += 2
        if position + size > len(block):
            return None
        records.append(block[position:position + size])
        position += size
    if position != len(block):
        raise ProtocolError("Trailing SP data")
    return records


class WritePolicy:
    """Only this profile's reads, exact live echoes and one authorized time."""
    def __init__(self, profile):
        self.profile = profile
        self.reads = profile.reads if profile else ()
        self.snapshots = {}
        self.sp_queries = set()
        self.sp_echoes = set()
        self.time = None
        self.time_used = False

    def permits(self, characteristic, payload):
        if characteristic == REQUEST:
            return payload in self.reads
        if characteristic == SP_REQUEST:
            return payload in self.sp_queries
        if characteristic == SP_DATA:
            return payload in self.sp_echoes
        if characteristic in (FEATURES, CURRENT_TIME) and self.time == (characteristic, payload) and not self.time_used:
            self.time_used = True
            return True
        if characteristic == FEATURES:
            if self.profile and self.profile.second_dial and payload in (b"\x21\x00\x01", b"\x21\x01\x01"):
                return True
            return (4 <= len(payload) <= 64 and payload[:2] in self.reads and
                    self.snapshots.get(payload[:2]) == payload)
        return False


def home_offset(state, zone):
    """Preserve the watch's current standard offset and active DST flag.

    Offsets are signed quarter hours. AUTO is retained, not recalculated or
    overwritten: this operation does not install new timezone/DST rules.
    Reject unknown layouts rather than guessing the computer's timezone.
    """
    if len(state) < 4 or state[:2] != READS[0] or state[3] & ~3:
        raise ProtocolError("Unknown DST state")
    if len(zone) < 7 or zone[:2] != READS[1]:
        raise ProtocolError("Unknown home offset")
    signed = lambda value: value if value < 128 else value - 256
    standard, summer = signed(zone[4]) * 15, signed(zone[5]) * 15
    offset = standard + (summer if state[3] & 1 else 0)
    if not -720 <= standard <= 840 or not -120 <= summer <= 120 or not -720 <= offset <= 840:
        raise ProtocolError("Invalid home offset")
    return offset


def encode_time(epoch_ms, offset_minutes):
    if not isinstance(epoch_ms, (float, int)) or not math.isfinite(epoch_ms):
        raise ProtocolError("Invalid reference time")
    if not isinstance(offset_minutes, int) or not -720 <= offset_minutes <= 840:
        raise ProtocolError("Invalid offset")
    dt = datetime.fromtimestamp(epoch_ms / 1000, timezone.utc) + timedelta(minutes=offset_minutes)
    if not 2000 <= dt.year <= 2099:
        raise ProtocolError("Outside the module's calendar range")
    # ISO weekday (Monday=1, Sunday=7), as in GShockAPI TimeIO.kt;
    # fractions are in 1/256 second, never raw milliseconds.
    return bytes([0x09]) + dt.year.to_bytes(2, "little") + bytes([
        dt.month, dt.day, dt.hour, dt.minute, dt.second, dt.isoweekday(),
        dt.microsecond * 256 // 1_000_000, 1,
    ])
