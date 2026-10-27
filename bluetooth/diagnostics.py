"""Opt-in local protocol trace; never include addresses or settings contents."""
import json
import os
import sys
from datetime import datetime, timezone


def trace(event, **fields):
    if os.environ.get("ATOMIC_BLUETOOTH_DEBUG") == "1":
        print("[Bluetooth] " + json.dumps({
            "at": datetime.now(timezone.utc).isoformat(), "event": event, **fields,
        }), file=sys.stderr, flush=True)
