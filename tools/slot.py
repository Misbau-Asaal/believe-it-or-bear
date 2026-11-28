#!/usr/bin/env python3
"""Print the next go-live time as UTC ISO 8601 (e.g. 2026-11-29T23:00:00Z). Standard library only.

  python3 tools/slot.py                 next 18:00 New York time that is at least 4 hours away
  python3 tools/slot.py --human         the same time written out for people (New York and Malaysia)

Environment overrides: SLOT_TZ (default America/New_York), SLOT_TIME (default 18:00), SLOT_LEAD_HOURS (default 4)."""
import os, sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

def next_slot(now=None):
    tz = ZoneInfo(os.environ.get("SLOT_TZ", "America/New_York"))
    hh, mm = (int(x) for x in os.environ.get("SLOT_TIME", "18:00").split(":"))
    lead = timedelta(hours=float(os.environ.get("SLOT_LEAD_HOURS", "4")))
    now = now or datetime.now(timezone.utc)
    local = now.astimezone(tz)
    for d in range(0, 3):
        day = (local + timedelta(days=d)).date()
        t = datetime(day.year, day.month, day.day, hh, mm, tzinfo=tz)   # zoneinfo picks the right summer/winter offset
        if t - now >= lead: return t.astimezone(timezone.utc)
    raise SystemExit("no slot found")

def human(t):
    ny = t.astimezone(ZoneInfo("America/New_York")).strftime("%a %d %b %H:%M New York")
    my = t.astimezone(ZoneInfo("Asia/Kuala_Lumpur")).strftime("%a %d %b %H:%M Malaysia")
    return f"{ny} ({my})"

if __name__ == "__main__":
    t = next_slot()
    print(human(t) if "--human" in sys.argv else t.strftime("%Y-%m-%dT%H:%M:%SZ"))
