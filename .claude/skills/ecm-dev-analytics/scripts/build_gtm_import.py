#!/usr/bin/env python3
"""Build a GTM container import file (Admin > Import Container > Merge).

Usage:
    python build_gtm_import.py spec.json out.json

spec.json describes only what is being added:
{
  "variables": [{"name": "DLV - offer", "key": "offer"}],
  "triggers":  [{"name": "CE - commercial journey",
                 "events": ["journey_selected", "offer_viewed"]}],
  "tags": [{"name": "GA4 - commercial journey events",
            "trigger": "CE - commercial journey",
            "measurement_id": "G-5B9Q2WHCNL",
            "event_name": "{{Event}}",
            "params": {"offer": "{{DLV - offer}}"},
            "notes": "optional"}]
}

Variables are Data Layer Variables (version 2). Triggers are Custom Event
triggers matching the listed event names exactly (built as one anchored
regex). Tags are GA4 Event tags. IDs in the file are placeholders: GTM
reassigns them on import, and "Rename conflicting" keeps existing items
untouched.
"""
import json
import re
import sys

ZERO = {"accountId": "0", "containerId": "0"}


def t(key, value):
    return {"type": "TEMPLATE", "key": key, "value": value}


def build(spec, public_id="GTM-M7DKTZKC"):
    variables, triggers, tags = [], [], []
    trigger_ids = {}
    next_id = 9001

    for v in spec.get("variables", []):
        variables.append({**ZERO, "variableId": str(next_id), "name": v["name"], "type": "v",
            "parameter": [{"type": "INTEGER", "key": "dataLayerVersion", "value": "2"},
                          {"type": "BOOLEAN", "key": "setDefaultValue", "value": "false"},
                          t("name", v["key"])]})
        next_id += 1

    for tr in spec.get("triggers", []):
        events = tr["events"]
        for e in events:
            if not re.fullmatch(r"[A-Za-z0-9_]+", e):
                sys.exit(f"event name {e!r} is not a plain dataLayer event name")
        regex = "^(" + "|".join(events) + ")$"
        trigger_ids[tr["name"]] = str(next_id)
        triggers.append({**ZERO, "triggerId": str(next_id), "name": tr["name"],
            "type": "CUSTOM_EVENT",
            "customEventFilter": [{"type": "MATCH_REGEX",
                "parameter": [t("arg0", "{{_event}}"), t("arg1", regex)]}]})
        next_id += 1

    for tg in spec.get("tags", []):
        if tg["trigger"] not in trigger_ids:
            sys.exit(f"tag {tg['name']!r} names unknown trigger {tg['trigger']!r}")
        table = [{"type": "MAP", "map": [t("parameter", k), t("parameterValue", val)]}
                 for k, val in tg.get("params", {}).items()]
        tag = {**ZERO, "tagId": str(next_id), "name": tg["name"], "type": "gaawe",
            "parameter": [{"type": "BOOLEAN", "key": "sendEcommerceData", "value": "false"},
                          t("eventName", tg.get("event_name", "{{Event}}")),
                          t("measurementIdOverride", tg.get("measurement_id", "G-5B9Q2WHCNL")),
                          {"type": "LIST", "key": "eventSettingsTable", "list": table}],
            "firingTriggerId": [trigger_ids[tg["trigger"]]],
            "tagFiringOption": "ONCE_PER_EVENT",
            "consentSettings": {"consentStatus": "NOT_SET"}}
        if tg.get("notes"):
            tag["notes"] = tg["notes"]
        tags.append(tag)
        next_id += 1

    # Every referenced {{DLV - x}} must be defined here or already exist.
    defined = {v["name"] for v in spec.get("variables", [])}
    for tg in spec.get("tags", []):
        for val in tg.get("params", {}).values():
            for ref in re.findall(r"\{\{(DLV - [^}]+)\}\}", val):
                if ref not in defined:
                    print(f"note: {ref} is not in this file; it must already exist in the container",
                          file=sys.stderr)

    return {"exportFormatVersion": 2, "exportTime": "2026-01-01 00:00:00",
        "containerVersion": {**ZERO, "containerVersionId": "0",
            "container": {**ZERO, "name": "ecm.dev", "publicId": public_id, "usageContext": ["WEB"]},
            "variable": variables,
            "builtInVariable": [{**ZERO, "type": "EVENT", "name": "Event"}],
            "trigger": triggers,
            "tag": tags}}


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    spec = json.load(open(sys.argv[1]))
    json.dump(build(spec), open(sys.argv[2], "w"), indent=2)
    print(f"wrote {sys.argv[2]}")
