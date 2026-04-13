// ================================================================
// supabase_config.js — AIS Dashboard
// ================================================================
// Supabase credentials
// ================================================================

const SUPABASE_URL      = 'https://hzfmyelelacosdwqyxos.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Zm15ZWxlbGFjb3Nkd3F5eG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTAzNTgsImV4cCI6MjA5MTU4NjM1OH0.Agt3pb0av-Id1cUu5k7U_-otxk3zIz6k8Zzo6z-Qq3A';

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------
// Auth helpers
// ----------------------------------------------------------------

async function requireAuth() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

async function signOut() {
  await _supabase.auth.signOut();
  window.location.href = 'index.html';
}

// ----------------------------------------------------------------
// Row mapper — Supabase join result → original JS field names
// 'row' is one officer_postings row with embedded 'officers' object
// ----------------------------------------------------------------

function mapRow(row) {
  const o = row.officers || {};
  return {
    SLNO:                     o.slno,
    SeniorityNo:              o.seniority_no,
    'IdentityNo.':            o.identity_no,
    Cadre:                    o.cadre,
    NameoftheOfficer:         o.name_of_officer,
    currentposting:           o.current_posting,
    DateofAppointment:        o.date_of_appointment,
    SourceOfRecruitment:      o.source_of_recruitment,
    EducationalQualification: o.educational_qualification,
    DateOfBirth:              o.date_of_birth,
    AllotmentYear:            o.allotment_year,
    Domicile:                 o.domicile,
    EmailId:                  o.email_id,
    PhoneNo:                  o.phone_no,
    is_retired:               o.is_retired ?? false,
    is_transferred_from_ap:   o.is_transferred_from_ap ?? false,
    From:                     row.from_date,
    To:                       row.to_date,
    HCM:                      row.hcm,
    PostName:                 row.post_name,
    Department:               row.department,
    Category:                 row.category
  };
}

// ----------------------------------------------------------------
// Load all postings for one service type, joined with officer info.
// Handles Supabase's 1000-row default limit via pagination.
// serviceType: 'IAS' | 'IPS' | 'IFS'
// ----------------------------------------------------------------

async function loadOfficerData(serviceType) {
  const PAGE_SIZE = 1000;
  let allRows = [];
  let from    = 0;

  while (true) {
    const { data, error } = await _supabase
      .from('officer_postings')
      .select(`
        from_date, to_date, hcm, post_name, department, category,
        officers!inner(
          slno, seniority_no, identity_no, cadre, name_of_officer,
          current_posting, date_of_appointment, source_of_recruitment,
          educational_qualification, date_of_birth, allotment_year,
          domicile, email_id, phone_no, is_retired, is_transferred_from_ap
        )
      `)
      .eq('service_type', serviceType)
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    allRows = allRows.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allRows.map(mapRow);
}

// ----------------------------------------------------------------
// Load photo map from officers table: { "1": "url", "2": "url", ... }
// Photos are now stored as photo_url on the officers table directly.
// serviceType: 'IAS' | 'IPS' | 'IFS'
// ----------------------------------------------------------------

async function loadPhotos(serviceType) {
  const { data, error } = await _supabase
    .from('officers')
    .select('seniority_no, photo_url')
    .eq('service_type', serviceType)
    .not('photo_url', 'is', null);

  if (error) {
    console.warn('Could not load photos:', error.message);
    return {};
  }

  const map = {};
  (data || []).forEach(r => {
    if (r.photo_url) map[String(r.seniority_no)] = r.photo_url;
  });
  return map;
}

// ----------------------------------------------------------------
// Check if current user is admin
// ----------------------------------------------------------------

async function isAdmin() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) return false;

  const { data } = await _supabase
    .from('user_roles')
    .select('role')
    .eq('email', session.user.email)
    .single();

  return data?.role === 'admin';
}
