"""
AIS Dashboard — Data Migration Script
======================================
Reads officerDataIAS.json, officerDataIPS.json, officerDataIFS.json
and inserts all records into the Supabase `officers` and
`officer_postings` tables (the current schema).

Requirements:
    pip install supabase

Usage:
    1. Fill in SUPABASE_URL and SUPABASE_SERVICE_KEY below
       (use the SERVICE ROLE key, NOT the anon key — find it at
        Supabase Dashboard → Settings → API → service_role)
    2. Make sure you have already run supabase_schema.sql in Supabase
    3. Run:  python migrate_data.py
"""

import json
import os

# ----------------------------------------------------------------
# CONFIGURATION — fill these in before running
# ----------------------------------------------------------------
SUPABASE_URL         = "https://hzfmyelelacosdwqyxos.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Zm15ZWxlbGFjb3Nkd3F5eG9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxMDM1OCwiZXhwIjoyMDkxNTg2MzU4fQ._BCrqFCKeKAUpJncyyPXfr46JJVr71o4Tvb74B86pRU"
# ----------------------------------------------------------------

from supabase import create_client, Client

client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

JSON_FILES = {
    "IAS": os.path.join(SCRIPT_DIR, "officerDataIAS.json"),
    "IPS": os.path.join(SCRIPT_DIR, "officerDataIPS.json"),
    "IFS": os.path.join(SCRIPT_DIR, "officerDataIFS.json"),
}

BATCH_SIZE = 500   # records per insert batch


def s(val) -> str:
    """Safely convert any value to a stripped string, None if empty."""
    if val is None:
        return None
    v = str(val).strip()
    return v if v else None


def insert_in_batches(table: str, records: list, label: str = ""):
    total = len(records)
    inserted = 0
    all_results = []
    for i in range(0, total, BATCH_SIZE):
        batch = records[i: i + BATCH_SIZE]
        result = client.table(table).insert(batch).execute()
        all_results.extend(result.data or [])
        inserted += len(batch)
        print(f"  {label} Inserted {inserted}/{total} records into {table}")
    return all_results


def migrate_service(service_type: str, filepath: str):
    print(f"\nLoading {service_type} data from: {os.path.basename(filepath)}")
    with open(filepath, encoding="utf-8") as f:
        raw_data = json.load(f)
    print(f"  Found {len(raw_data)} source rows")

    # ------------------------------------------------------------------
    # Step 1: Build unique officer records (one per seniority_no).
    #         Use a dict keyed by seniority_no — last write wins but
    #         all rows for the same officer have the same profile fields.
    # ------------------------------------------------------------------
    officers_by_seniority = {}
    for row in raw_data:
        sno = row.get("SeniorityNo")
        if sno is None:
            continue
        officers_by_seniority[sno] = {
            "service_type":              service_type,
            "slno":                      row.get("SLNO"),
            "seniority_no":              sno,
            "identity_no":               s(row.get("IdentityNo.") or row.get("IdentityNo._1")),
            "cadre":                     s(row.get("Cadre")),
            "name_of_officer":           s(row.get("NameoftheOfficer")),
            "current_posting":           s(row.get("currentposting")),
            "date_of_appointment":       s(row.get("DateofAppointment")),
            "source_of_recruitment":     s(row.get("SourceOfRecruitment")),
            "educational_qualification": s(row.get("EducationalQualification")),
            "date_of_birth":             s(row.get("DateOfBirth")),
            "allotment_year":            s(row.get("AllotmentYear")),
            "domicile":                  s(row.get("Domicile")),
            "email_id":                  s(row.get("EmailId")),
            "phone_no":                  s(row.get("PhoneNo")),
        }

    officer_list = list(officers_by_seniority.values())
    print(f"  Unique officers: {len(officer_list)}")

    # ------------------------------------------------------------------
    # Step 2: Upsert officers → get back their IDs.
    #         on_conflict targets the UNIQUE(service_type, seniority_no)
    #         constraint so re-running the script is safe.
    # ------------------------------------------------------------------
    upserted = []
    for i in range(0, len(officer_list), BATCH_SIZE):
        batch = officer_list[i: i + BATCH_SIZE]
        result = client.table("officers").upsert(
            batch,
            on_conflict="service_type,seniority_no"
        ).execute()
        upserted.extend(result.data or [])
        print(f"  [{service_type}] Upserted officers {i + len(batch)}/{len(officer_list)}")

    # Build seniority_no → DB id map
    officer_id_map = {r["seniority_no"]: r["id"] for r in upserted}

    # If upsert returned no rows (can happen when rows already existed),
    # fall back to a SELECT to get existing IDs.
    if len(officer_id_map) < len(officer_list):
        print("  Fetching existing officer IDs from DB…")
        existing = client.table("officers").select("id,seniority_no").eq(
            "service_type", service_type
        ).execute()
        for r in (existing.data or []):
            officer_id_map[r["seniority_no"]] = r["id"]

    # ------------------------------------------------------------------
    # Step 3: Build posting rows and insert in batches.
    # ------------------------------------------------------------------
    postings = []
    for row in raw_data:
        sno = row.get("SeniorityNo")
        officer_id = officer_id_map.get(sno)
        if officer_id is None:
            print(f"  WARNING: No officer ID for SeniorityNo={sno}, skipping posting row.")
            continue
        postings.append({
            "officer_id":   officer_id,
            "service_type": service_type,
            "from_date":    s(row.get("From")),
            "to_date":      s(row.get("To")),
            "hcm":          s(row.get("HCM")),
            "post_name":    s(row.get("PostName")),
            "department":   s(row.get("Department")),
            "category":     s(row.get("Category")),
        })

    insert_in_batches("officer_postings", postings, f"[{service_type}]")
    print(f"  {service_type}: {len(officer_list)} officers, {len(postings)} postings migrated.")


def main():
    print("AIS Dashboard — Supabase Data Migration")
    print("=" * 50)
    print("Target tables: officers + officer_postings")
    print()

    confirm = input("Delete existing data before import? (yes/no): ").strip().lower()
    if confirm == "yes":
        for stype in JSON_FILES:
            # Delete postings first (FK constraint), then officers
            client.table("officer_postings").delete().eq("service_type", stype).execute()
            client.table("officers").delete().eq("service_type", stype).execute()
            print(f"  Deleted existing {stype} records from officers + officer_postings")

    for service_type, filepath in JSON_FILES.items():
        if not os.path.exists(filepath):
            print(f"\nSkipping {service_type}: file not found — {filepath}")
            continue
        migrate_service(service_type, filepath)

    print("\nMigration complete!")
    print("You can now open table.html or graph.html in a browser to verify.")


if __name__ == "__main__":
    main()
