#!/usr/bin/env python3
"""Print the go-live time for an episode as UTC ISO 8601 (e.g. 2026-11-30T23:00:00Z). Standard library only.

  python3 tools/slot.py [NN-name]           the episode's day from episodes/schedule.json at 18:00 New York time,
                                            or the next free day if it has no day or its day is too close / past
  python3 tools/slot.py [NN-name] --human   the same time written out for people (New York and Malaysia)

Without NN-name it reads the episode from the GitHub workflow inputs (GITHUB_EVENT_PATH).
A day is "free" when no other episode in the schedule has it. A slot must be at least 4 hours away.
Environment overrides: SLOT_TZ (default America/New_York), SLOT_TIME (default 18:00), SLOT_LEAD_HOURS (default 4)."""
import json, os, sys
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def schedule():
    try: return json.load(open(os.path.join(ROOT, "episodes", "schedule.json"))).get("days", {})
    except FileNotFoundError: return {}

def at(day, tz, hh, mm): return datetime(day.year, day.month, day.day, hh, mm, tzinfo=tz)

def next_slot(ep="", now=None, days=None):
    tz = ZoneInfo(os.environ.get("SLOT_TZ", "America/New_York"))
    hh, mm = (int(x) for x in os.environ.get("SLOT_TIME", "18:00").split(":"))
    lead = timedelta(hours=float(os.environ.get("SLOT_LEAD_HOURS", "4")))
    now = now or datetime.now(timezone.utc)
    days = schedule() if days is None else days                 # {"2026-11-30": "05-byron-bear", ...}
    mine = [d for d, e in days.items() if e == ep]
    for d in sorted(mine):                                      # the planned day, if it is still far enough away
        t = at(date.fromisoformat(d), tz, hh, mm)
        if t - now >= lead: return t.astimezone(timezone.utc), "planned"
    taken = {d for d, e in days.items() if e != ep}
    local = now.astimezone(tz).date()
    for i in range(0, 60):                                      # otherwise the next day nobody else has
        day = local + timedelta(days=i)
        t = at(day, tz, hh, mm)
        if t - now >= lead and day.isoformat() not in taken: return t.astimezone(timezone.utc), ("moved" if mine else "next free")
    raise SystemExit("no free slot in the next 60 days")

def episode_from_event():
    try: return json.load(open(os.environ["GITHUB_EVENT_PATH"])).get("inputs", {}).get("episode", "")
    except (KeyError, OSError, ValueError): return ""

def human(t):
    ny = t.astimezone(ZoneInfo("America/New_York")).strftime("%a %d %b %H:%M New York")
    my = t.astimezone(ZoneInfo("Asia/Kuala_Lumpur")).strftime("%a %d %b %H:%M Malaysia")
    return f"{ny} ({my})"

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    ep = args[0] if args else episode_from_event()
    t, why = next_slot(ep)
    if "--human" in sys.argv:
        note = {"planned": "its planned day", "moved": "its planned day was too close, so the next free day",
                "next free": "the next free day (not in episodes/schedule.json)"}[why]
        print(f"{human(t)}: {note}")
    else: print(t.strftime("%Y-%m-%dT%H:%M:%SZ"))
