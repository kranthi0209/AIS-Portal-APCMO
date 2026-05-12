// ================================================================
// supabase_config.js — AIS Dashboard
// ================================================================
// Supabase credentials
// ================================================================

const SUPABASE_URL      = 'https://hzfmyelelacosdwqyxos.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Zm15ZWxlbGFjb3Nkd3F5eG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTAzNTgsImV4cCI6MjA5MTU4NjM1OH0.Agt3pb0av-Id1cUu5k7U_-otxk3zIz6k8Zzo6z-Qq3A';

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------
// Custom session auth (no Supabase Auth — credentials in user_roles)
// ----------------------------------------------------------------

const _SESSION_KEY = 'ais_session';
const _SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours

function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(_SESSION_KEY));
    if (!s || !s.email) return null;
    if (s.loginAt && Date.now() - s.loginAt > _SESSION_TTL) {
      localStorage.removeItem(_SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

function saveSession(user) {
  localStorage.setItem(_SESSION_KEY, JSON.stringify({
    id:                   user.id,
    email:                user.email,
    role:                 user.role,
    officer_id:           user.officer_id           ?? null,
    must_change_password: user.must_change_password  ?? false,
    is_first_login:       user.is_first_login        ?? false,
    personal_email:       user.personal_email        ?? null,
    personal_mobile:      user.personal_mobile       ?? null,
    loginAt:              Date.now()
  }));
}

async function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

function signOut() {
  localStorage.removeItem(_SESSION_KEY);
  try { sessionStorage.removeItem('ais_fs_mode'); } catch(e) {}
  window.location.href = 'index.html';
}

// ----------------------------------------------------------------
// Row mapper — Supabase join result → original JS field names
// 'row' is one officer_postings row with embedded 'officers' object
// ----------------------------------------------------------------

// Compute decimal years between two date strings (to_date defaults to today)
function _computeYears(from_date, to_date) {
  if (!from_date) return 0;
  const from = new Date(from_date);
  const to   = to_date ? new Date(to_date) : new Date();
  return Math.max(0, (to - from) / (365.25 * 24 * 60 * 60 * 1000));
}

function mapRow(row) {
  const o = row.officers || {};
  return {
    OfficerId:                o.id,
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
    Years:                    _computeYears(row.from_date, row.to_date),
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

  // Step 1: fetch all postings joined with officers (inner join — officers WITH postings)
  while (true) {
    const { data, error } = await _supabase
      .from('officer_postings')
      .select(`
        from_date, to_date, hcm, post_name, department, category,
        officers!inner(
          id, identity_no, cadre, name_of_officer,
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

  const mapped = allRows.map(mapRow);

  // Step 2: fetch ALL officers of this service type and append any who have no postings
  // (inner join above silently drops officers with zero posting records)
  const seenIds = new Set(mapped.map(r => r.OfficerId));
  const { data: officers } = await _supabase
    .from('officers')
    .select(`
      id, identity_no, cadre, name_of_officer,
      current_posting, date_of_appointment, source_of_recruitment,
      educational_qualification, date_of_birth, allotment_year,
      domicile, email_id, phone_no, is_retired, is_transferred_from_ap
    `)
    .eq('service_type', serviceType);

  (officers || []).forEach(o => {
    if (!seenIds.has(o.id)) {
      mapped.push(mapRow({ officers: o }));
    }
  });

  return mapped;
}

// ----------------------------------------------------------------
// Load photo map from officers table: { "1": "url", "2": "url", ... }
// Photos are now stored as photo_url on the officers table directly.
// serviceType: 'IAS' | 'IPS' | 'IFS'
// ----------------------------------------------------------------

async function loadPhotos(serviceType) {
  const { data, error } = await _supabase
    .from('officers')
    .select('identity_no, photo_url')
    .eq('service_type', serviceType)
    .not('photo_url', 'is', null);

  if (error) {
    console.warn('Could not load photos:', error.message);
    return {};
  }

  const map = {};
  (data || []).forEach(r => {
    if (r.photo_url) map[String(r.identity_no)] = r.photo_url;
  });
  return map;
}


// ----------------------------------------------------------------
// Check if current user is admin
// ----------------------------------------------------------------

async function isAdmin() {
  const session = getSession();
  return session?.role === 'admin';
}

// ----------------------------------------------------------------
// Module gate — checks module_control and, if blocked, overlays
// a full-screen message and returns false.
// Usage in entry pages (async init):
//   if (!await enforceModuleGate('swarna')) return;
// ----------------------------------------------------------------
async function enforceModuleGate(moduleName) {
  try {
    const { data } = await _supabase
      .from('module_control')
      .select('label, deadline, is_paused, notes')
      .eq('module_name', moduleName)
      .maybeSingle();

    if (!data) return true;

    const isPaused  = !!data.is_paused;
    const isExpired = data.deadline && new Date() > new Date(data.deadline);
    if (!isPaused && !isExpired) return true;

    const reason = isPaused
      ? '&#9208; Data entry has been paused by the administrator.'
      : '&#9200; The deadline for this module has passed (' +
        new Date(data.deadline).toLocaleString('en-IN') + ').';

    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(15,12,41,0.92);z-index:99999;' +
      'display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;';
    overlay.innerHTML =
      '<div style="background:#fff;border-radius:20px;padding:40px 44px;max-width:480px;width:94%;' +
             'box-shadow:0 24px 60px rgba(0,0,0,0.5);text-align:center;">' +
        '<div style="font-size:52px;margin-bottom:16px;">' + (isPaused ? '&#9208;' : '&#128274;') + '</div>' +
        '<div style="font-size:20px;font-weight:800;color:#1e1b4b;margin-bottom:10px;">' +
          (data.label || moduleName) + ' &mdash; ' + (isPaused ? 'Paused' : 'Deadline Passed') +
        '</div>' +
        '<div style="font-size:14px;color:#64748b;margin-bottom:' + (data.notes ? '10px' : '24px') + ';line-height:1.6;">' +
          reason +
        '</div>' +
        (data.notes
          ? '<div style="font-size:13px;color:#475569;background:#f1f5f9;border-radius:10px;' +
                        'padding:12px 16px;margin-bottom:24px;line-height:1.6;">' +
              '<strong>Admin note:</strong> ' + data.notes +
            '</div>'
          : '') +
        '<button onclick="window.location.href=\'index.html\'" ' +
          'style="padding:11px 28px;background:linear-gradient(135deg,#1e1b4b,#4338ca);' +
                 'color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;">' +
          '&larr; Back to Home' +
        '</button>' +
      '</div>';
    document.body.appendChild(overlay);
    return false;
  } catch (e) {
    return true; // if table missing, allow access
  }
}
