"""
AIS Dashboard — Photo Migration Script
=======================================
Extracts imageData objects from scriptIAS.js, scriptIPS.js, scriptIFS.js
and inserts / upserts them into the officer_photos table in Supabase.

Requirements:
    pip install supabase

Usage:
    1. Make sure supabase_schema.sql has been run (officer_photos table exists)
    2. Run:  python migrate_photos.py
"""

import re
import os

# ----------------------------------------------------------------
# CONFIGURATION
# ----------------------------------------------------------------
SUPABASE_URL         = "https://hzfmyelelacosdwqyxos.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Zm15ZWxlbGFjb3Nkd3F5eG9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxMDM1OCwiZXhwIjoyMDkxNTg2MzU4fQ._BCrqFCKeKAUpJncyyPXfr46JJVr71o4Tvb74B86pRU"

BATCH_SIZE = 200   # records per upsert batch
# ----------------------------------------------------------------

from supabase import create_client, Client

client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

JS_FILES = {
    "IAS": os.path.join(SCRIPT_DIR, "scriptIAS.js"),
    "IPS": os.path.join(SCRIPT_DIR, "scriptIPS.js"),
    "IFS": os.path.join(SCRIPT_DIR, "scriptIFS.js"),
}

# Pattern matches entries like "123":"https://example.com/photo.jpg"
PHOTO_PATTERN = re.compile(r'"(\d+)"\s*:\s*"(https://[^"]+)"')


def extract_photos(js_path: str) -> dict[str, str]:
    """
    Read a JS file and extract all seniority_no → photo_url pairs
    from any imageData-style object literal in the file.
    Returns { "1": "https://...", "2": "https://...", ... }
    """
    if not os.path.exists(js_path):
        print(f"  [WARNING] File not found: {js_path}")
        return {}

    with open(js_path, encoding="utf-8") as f:
        content = f.read()

    matches = PHOTO_PATTERN.findall(content)
    photo_map = {}
    for seniority_no, url in matches:
        photo_map[seniority_no] = url

    return photo_map


def upsert_in_batches(records: list, service_type: str):
    """Update photo_url on the officers table in batches."""
    total    = len(records)
    updated  = 0

    for record in records:
        sno = record["seniority_no"]
        url = record["photo_url"]
        client.table("officers") \
            .update({"photo_url": url}) \
            .eq("service_type", service_type) \
            .eq("seniority_no", sno) \
            .execute()
        updated += 1
        if updated % 50 == 0 or updated == total:
            print(f"  [{service_type}] Updated {updated}/{total} photos")


def main():
    print("AIS Dashboard — Photo Migration")
    print("=" * 50)

    for service_type, js_path in JS_FILES.items():
        print(f"\nProcessing {service_type}: {os.path.basename(js_path)}")
        photo_map = extract_photos(js_path)

        if not photo_map:
            print(f"  [SKIP] No photo entries found in {os.path.basename(js_path)}")
            continue

        print(f"  Found {len(photo_map)} photo entries")

        records = [
            {
                "service_type": service_type,
                "seniority_no": int(seniority_no),
                "photo_url":    url,
            }
            for seniority_no, url in photo_map.items()
        ]

        upsert_in_batches(records, service_type)

    print("\nPhoto migration complete!")


if __name__ == "__main__":
    main()
