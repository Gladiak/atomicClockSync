"""Structured local protocol trace; no addresses or settings payloads."""
import json
import sys
from datetime import datetime, timezone


def trace(event, **fields):
    print("[Bluetooth] " + json.dumps({
        "at": datetime.now(timezone.utc).isoformat(), "event": event, **fields,
    }), file=sys.stderr, flush=True)
