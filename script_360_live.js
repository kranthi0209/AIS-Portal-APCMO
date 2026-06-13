// ================================================================
// script_360_live.js  —  360° Live Dashboard
// Loads REAL officer data from Supabase.
// Scores marked LIVE are computed from real tables.
// Scores marked PENDING return null (displayed grey in wheel).
// ================================================================

(function () {

  let svc = (new URLSearchParams(window.location.search).get('service') || 'IAS').toUpperCase();

  // ── 5 live evaluation categories (from the capsule scores) ──────
  const WHEEL_CATS = [
    { label:'e-Office',          color:'#6366f1', light:'#a5b4fc', live:true },
    { label:'Swarna AP',         color:'#16a34a', light:'#86efac', live:true },
    { label:'GoI Funds',         color:'#0d9488', light:'#5eead4', live:true },
    { label:'Public Perception', color:'#ea580c', light:'#fdba74', live:true },
    { label:'GSDP',              color:'#0891b2', light:'#67e8f9', live:true },
  ];
  const NCATS = WHEEL_CATS.length;
  let wheelActiveIdx = [];   // which WHEEL_CATS indices are plotted on the wheel (checklist-controlled)

  const CAT_DETAILS = [
    { icon:'💻', source:'e-Office Live Data — file movement system',
      desc:'File processing efficiency — disposal rate, clearance speed, volume and consistency (TOPSIS, 0–100).',
      metrics:[] },
    { icon:'⭐', source:'Swarnandhra KPI — District / Department / HoD scores',
      desc:'Swarna Andhra Pradesh KPI score, days-weighted across the officer\'s posts (0–100).',
      metrics:[] },
    { icon:'💰', source:'GoI (CSS) Funds — utilization data',
      desc:'Government of India fund utilization — spending, absorption, idle & untapped funds (TOPSIS, 0–100).',
      metrics:[] },
    { icon:'👥', source:'I&PR Public Perception — district campaign surveys',
      desc:'Citizen perception score, period-weighted across the officer\'s posts and campaigns (0–100).',
      metrics:[] },
    { icon:'📈', source:'GSDP — sub-sector target mapping',
      desc:'GSDP contribution — FY-day-weighted achievement of the officer\'s mapped sub-sector targets, target-load weighted (0–100).',
      metrics:[] },
  ];

  // Full set of performance parameters shown on the wheel / checklist.
  // The 4 "live" ones map (via src) to the officer's computed scores[0..3];
  // the rest are not-yet-live (no data) and only appear when "Show all" is on.
  const WHEEL_DISPLAY = [
    { label:'e-Office',              color:'#6366f1', light:'#a5b4fc', icon:'💻', live:true,  src:0, source:'e-Office Live Data — file movement system', desc:'File processing efficiency — disposal, clearance speed, volume and consistency (0–100).', metrics:[] },
    { label:'Swarna AP',             color:'#16a34a', light:'#86efac', icon:'⭐', live:true,  src:1, source:'Swarnandhra KPI', desc:'Swarna Andhra Pradesh KPI score, days-weighted across the officer\'s posts (0–100).', metrics:[] },
    { label:'GoI Funds',             color:'#0d9488', light:'#5eead4', icon:'💰', live:true,  src:2, source:'GoI (CSS) Funds — utilization', desc:'Government of India fund utilization (0–100).', metrics:[] },
    { label:'Public Perception',     color:'#ea580c', light:'#fdba74', icon:'👥', live:true,  src:3, source:'I&PR Public Perception', desc:'Citizen perception score, period-weighted (0–100).', metrics:[] },
    { label:'GSDP',                  color:'#0891b2', light:'#67e8f9', icon:'📈', live:true,  src:4, source:'GSDP — sub-sector target mapping', desc:'GSDP contribution — FY-day-weighted target achievement, target-load weighted (0–100).', metrics:[] },
    { label:'APAR',                  color:'#7c3aed', light:'#c4b5fd', icon:'📝', live:false, source:'APAR Score', desc:'Annual Performance Appraisal Report (data not yet live).', metrics:[] },
    { label:'CMO Feedback',          color:'#b91c1c', light:'#fca5a5', icon:'🏛', live:false, source:'CMO Feedback', desc:'Chief Minister\'s Office feedback (data not yet live).', metrics:[] },
    { label:'Party Feedback',        color:'#db2777', light:'#f9a8d4', icon:'🎴', live:false, source:'Party Feedback', desc:'Party feedback (data not yet live).', metrics:[] },
    { label:'Media Feedback',        color:'#9333ea', light:'#d8b4fe', icon:'📰', live:false, source:'Media Feedback', desc:'Media feedback (data not yet live).', metrics:[] },
    { label:'Subordinates Feedback', color:'#0284c7', light:'#7dd3fc', icon:'👨‍💼', live:false, source:'Subordinates Feedback', desc:'Feedback from subordinates (data not yet live).', metrics:[] },
    { label:'Integrity Index',       color:'#ca8a04', light:'#fde047', icon:'🛡', live:false, source:'Integrity Index', desc:'Integrity index (data not yet live).', metrics:[] },
    { label:'Innovations',           color:'#15803d', light:'#86efac', icon:'💡', live:false, source:'Innovations Score', desc:'Innovations score (data not yet live).', metrics:[] },
    { label:'Digitalisations',       color:'#2563eb', light:'#93c5fd', icon:'📱', live:false, source:'Digitalisations Score', desc:'Digitalisation score (data not yet live).', metrics:[] },
    { label:'New Policies',          color:'#c2410c', light:'#fdba74', icon:'📜', live:false, source:'New Policies Score', desc:'New policies score (data not yet live).', metrics:[] },
    { label:'De-Regularisation',     color:'#0f766e', light:'#5eead4', icon:'✅', live:false, source:'De-Regularisation Score', desc:'De-regularisation score (data not yet live).', metrics:[] }
  ];
  const NDISP = WHEEL_DISPLAY.length;
  // live-score src index → the score page's switchView name (for click-through)
  const WHEEL_VIEW_BY_SRC = ['eoffice','swarna','goi','perception','gsdp'];

  // Open a score's full page and highlight this officer — same behaviour as the
  // Professional Performance Index score cells (reuses window.cmpGotoScore).
  window.wheelGotoScore = function(view, idNo){
    document.querySelectorAll('.sdp-popup-bg').forEach(el => el.remove());
    try { if (activeSegSet && activeSegSet.clear) activeSegSet.clear(); } catch(e){}
    var wo = document.getElementById('wheelOverlay'); if (wo) wo.classList.remove('open');
    var dov = document.getElementById('detailOverlay'); if (dov) dov.classList.remove('open');
    if (typeof window.cmpGotoScore === 'function') window.cmpGotoScore(view, idNo);
    else if (typeof window.switchView === 'function') window.switchView(view);
  };

  const CADRE_COLORS = {
    'CHIEF SECRETARY':         '#16a34a',
    'SPECIAL CHIEF SECRETARY': '#dc2626',
    'PRINCIPAL SECRETARY':     '#2563eb',
    'SECRETARY':               '#9333ea'
  };
  function cadreColor(cadre) {
    const u = (cadre || '').toUpperCase().trim();
    for (const [k, v] of Object.entries(CADRE_COLORS)) {
      if (u.includes(k)) return v;
    }
    return '#0891b2';
  }

  // ── State ──────────────────────────────────────────────────────
  let allOfficers    = [];
  let photoMap       = {};
  let hcmPhotoMap    = {};
  let postTypeOrder  = [];
  let filtered       = [];
  let currentWheelData = { scores:[], ranks:[] };
  let activeSegSet   = new Set();
  let sortKey = 'seniority';
  let sortDir = 'asc';
  let weights = new Array(NCATS).fill(1);
  let batchRange   = { lo:0, hi:9999 };
  let retireRange  = { lo:0, hi:9999 };
  let batchExtent  = { min:0, max:9999 };
  let retireExtent = { min:0, max:9999 };
  let _rangeById   = {};   // identity_no → { batch, retire } for the score-page filters

  // Shared by the score pages (360_live.html): does this officer pass the current
  // Batch & Retirement-Year sliders? Unknown values are not excluded.
  window.officerPassesRange = function (identityNo) {
    const m = _rangeById[String(identityNo)];
    if (!m) return true;
    if (m.batch  != null && (m.batch  < batchRange.lo  || m.batch  > batchRange.hi))  return false;
    if (m.retire != null && (m.retire < retireRange.lo || m.retire > retireRange.hi)) return false;
    return true;
  };

  // ── Score data loaded from Supabase ────────────────────────────
  // Maps: identity_no (string) → computed score (0-10) or null
  let liveScores = {
    eoffice:    {},   // index 0 — LIVE
    swarna:     {},   // index 1 — pending
    gsdp:       {},   // index 2 — pending
    goifunds:   {},   // index 3 — LIVE
    perception: {},   // index 4 — LIVE
    integrity:  {},   // index 9 — pending
    party:      {},   // index 10 — pending
    media:      {},   // index 11 — pending
  };

  // ================================================================
  // SCORE COMPUTATION
  // Fill these functions once the scoring formula is confirmed.
  // Each returns a number 0–10 or null if data unavailable.
  // ================================================================

  // INDEX 0 — e-Office Score
  // TODO: Replace body with actual formula once confirmed by user.
  function computeEofficeScore(records) {
    if (!records || !records.length) return null;
    // Placeholder: will be replaced with actual formula
    // Available fields: files_processed, files_pending, opening_balance,
    //   files_created, files_received, avg_process_hours,
    //   processed_lt_1day, processed_1_to_3days, ..., processed_gt_30days
    return null; // ← replace with actual computation
  }

  // INDEX 3 — GoI Funds Score
  // TODO: Replace body with actual formula once confirmed by user.
  function computeGoifundsScore(records) {
    if (!records || !records.length) return null;
    return null; // ← replace with actual computation
  }

  // INDEX 4 — Public Perception Score
  // TODO: Replace body with actual formula once confirmed by user.
  function computePerceptionScore(records) {
    if (!records || !records.length) return null;
    return null; // ← replace with actual computation
  }

  // Assemble all 14 scores for one officer (null = pending/unavailable)
  // Build the 5 live scores (0–100) for an officer from the capsule-score map.
  function buildScores(idNo, scoreMap) {
    const s = (scoreMap && scoreMap[String(idNo)]) || {};
    return [
      s.eo != null ? s.eo : null,   // 0  e-Office
      s.sw != null ? s.sw : null,   // 1  Swarna AP
      s.go != null ? s.go : null,   // 2  GoI Funds
      s.pp != null ? s.pp : null,   // 3  Public Perception
      s.gs != null ? s.gs : null,   // 4  GSDP
    ];
  }

  // ================================================================
  // DATA LOADING
  // ================================================================

  async function fetchHcmPhotos() {
    try {
      const { data } = await _supabase.from('hcm_photos').select('name, photo_url');
      if (data) data.forEach(r => { if (r.name && r.photo_url) hcmPhotoMap[r.name] = r.photo_url; });
    } catch {}
  }

  // Load raw score data from all tables in parallel
  async function loadScoreData() {
    const PAGE = 1000;
    // Helper: paginate through a table, filter by service_type, group by identity_no
    async function loadAll(table, columns) {
      let rows = [], from = 0;
      while (true) {
        const { data, error } = await _supabase.from(table).select(columns)
          .eq('service_type', svc).range(from, from + PAGE - 1);
        if (error || !data || !data.length) break;
        rows = rows.concat(data);
        if (data.length < PAGE) break;
        from += PAGE;
      }
      // Group by identity_no
      const map = {};
      rows.forEach(r => {
        const id = String(r.identity_no || '');
        if (!map[id]) map[id] = [];
        map[id].push(r);
      });
      return map;
    }

    const [eoffice, goifunds, perception] = await Promise.all([
      loadAll('eoffice_data',
        'identity_no,files_processed,files_pending,opening_balance,files_created,files_received,avg_process_hours,processed_lt_1day,processed_1_to_3days,processed_3_to_7days,processed_7_to_30days,processed_gt_30days'),
      loadAll('goifunds_data',
        'identity_no,scheme_name,sanctioned_amount,utilized_amount,utilization_percentage,period_from,period_to'),
      loadAll('perception_data',
        'identity_no,perception_score,survey_type,period_from,period_to'),
    ]);

    return { eoffice, goifunds, perception };
  }

  // ================================================================
  // RANKS
  // ================================================================

  function computeWeightedScore(scores) {
    const validScores = scores.filter(s => s !== null);
    if (!validScores.length) return 0;
    const totalW = weights.reduce((s, w, i) => s + (scores[i] !== null ? w : 0), 0);
    if (!totalW) return 0;
    return scores.reduce((sum, sc, i) => sum + (sc !== null ? sc * (weights[i] || 0) : 0), 0) / totalW;
  }

  function computeOfficerRanks(grpList) {
    const N = grpList.length;

    // Per-category rank — only among officers who HAVE that score
    grpList.forEach(g => { g.catRanks = new Array(NCATS).fill('—'); });
    WHEEL_CATS.forEach((_, ci) => {
      const have = grpList.filter(g => g.scores[ci] != null)
                          .sort((a, b) => (b.scores[ci] || 0) - (a.scores[ci] || 0));
      have.forEach((grp, pos) => { grp.catRanks[ci] = pos + 1; });
    });

    // Composite = average of the officer's AVAILABLE scores; availability signature
    grpList.forEach(g => {
      const vals = g.scores.filter(v => v != null);
      g.composite  = vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : null;
      g.scoreCount = vals.length;
      g.availSig   = g.scores.map(v => v != null ? '1' : '0').join('');
      g.peerLabel  = WHEEL_CATS.filter((_, i) => g.scores[i] != null).map(c => c.label).join(' + ') || 'No live scores';
    });

    // Overall rank by composite (officers with no scores ranked last)
    const ranked = [...grpList].sort((a, b) => {
      if (a.composite == null && b.composite == null) return 0;
      if (a.composite == null) return 1;
      if (b.composite == null) return -1;
      return b.composite - a.composite;
    });
    let scoredN = 0;
    ranked.forEach((g, pos) => { g.overallRank = g.composite == null ? '—' : (++scoredN, pos + 1); });
    grpList.forEach(g => { g.overallTotal = grpList.filter(x => x.composite != null).length; });

    // Peer rank — among officers who share the SAME set of available parameters
    const groups = {};
    grpList.forEach(g => { (groups[g.availSig] = groups[g.availSig] || []).push(g); });
    Object.values(groups).forEach(list => {
      const peers = list.filter(g => g.composite != null)
                        .sort((a, b) => (b.composite || 0) - (a.composite || 0));
      peers.forEach((g, pos) => { g.peerRank = pos + 1; });
      list.forEach(g => { g.peerTotal = peers.length; if (g.composite == null) g.peerRank = '—'; });
    });

    grpList.forEach(grp => { grp.totalOfficers = N; });
  }

  function getRetireYear(meta) {
    if (!meta.DateOfBirth) return null;
    const d = parseDate(String(meta.DateOfBirth));
    if (isNaN(d.getTime())) return null;
    return d.getFullYear() + 60;
  }

  // ================================================================
  // BOOTSTRAP
  // ================================================================
  function _load360() {
    fetchHcmPhotos();
    return Promise.all([
      loadOfficerData(svc),
      loadPhotos(svc),
      (typeof window.getLive4ScoreMap === 'function' ? window.getLive4ScoreMap() : Promise.resolve({})),
      _supabase.from('post_type_options').select('label').eq('service_type', svc).order('sort_order').order('label')
    ]).then(([rows, photos, scoreMap, ptResult]) => {
      photoMap = photos;
      postTypeOrder = (ptResult.data || []).map(r => r.label);

      // Group officers (skip retired / transferred)
      const grouped = {};
      rows.forEach(entry => {
        if (entry.is_retired || entry.is_transferred_from_ap) return;
        const name = (entry.NameoftheOfficer || '').trim();
        if (!name) return;
        if (!grouped[name]) grouped[name] = { meta: entry, services: [] };
        grouped[name].services.push(entry);
      });

      for (const grp of Object.values(grouped)) {
        grp.meta = grp.services.reduce((a, b) =>
          (a.OfficerId || 0) < (b.OfficerId || 0) ? a : b
        );
      }

      // Build the 5 live capsule scores for each officer — guarded so a
      // scoring failure can never take down the filters or the grid.
      try {
        for (const grp of Object.values(grouped)) {
          const idNo = String(grp.meta['IdentityNo.'] || '').trim();
          grp.scores = buildScores(idNo, scoreMap);
        }
        computeOfficerRanks(Object.values(grouped));
      } catch (e) {
        console.error('[live4] scoring failed — loading grid without scores:', e);
        for (const grp of Object.values(grouped)) {
          if (!grp.scores)   grp.scores   = new Array(NCATS).fill(null);
          if (!grp.catRanks) grp.catRanks = new Array(NCATS).fill('—');
          if (grp.composite   === undefined) grp.composite   = null;
          if (grp.scoreCount  === undefined) grp.scoreCount  = 0;
          if (grp.availSig    === undefined) grp.availSig    = '0000';
          if (grp.peerLabel   === undefined) grp.peerLabel   = 'No live scores';
          if (grp.overallRank === undefined) grp.overallRank = '—';
          if (grp.overallTotal=== undefined) grp.overallTotal= 0;
          if (grp.peerRank    === undefined) grp.peerRank    = '—';
          if (grp.peerTotal   === undefined) grp.peerTotal   = 0;
        }
      }

      allOfficers = Object.entries(grouped)
        .sort(([, a], [, b]) => (a.meta.OfficerId || 0) - (b.meta.OfficerId || 0));

      populateFilterOptions();
      applyFilters360();
      document.dispatchEvent(new CustomEvent('officers360Loaded'));

    }).catch(err => {
      document.getElementById('grid360').innerHTML =
        `<div style="grid-column:1/-1;text-align:center;padding:60px 0;font-size:14px;color:#dc2626;">
           &#10060; Error loading live data: <strong>${esc(err.message)}</strong>
         </div>`;
      document.getElementById('count360').textContent = 'Error';
    });
  }
  // Re-load all per-service grid data in-place (no page reload — keeps fullscreen).
  window.reloadGrid360 = function (newSvc) {
    if (newSvc) svc = String(newSvc).toUpperCase();
    var g = document.getElementById('grid360');
    if (g) g.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:50px 0;color:#64748b;">&#8987; Loading ' + svc + ' officers&hellip;</div>';
    return _load360();
  };
  requireAuth().then(function (session) { if (session && svc !== 'MLA' && svc !== 'MP' && svc !== 'MLC' && svc !== 'RS') _load360(); });

  // ================================================================
  // FILTERS & SORT  (identical to script_360.js)
  // ================================================================

  function populateFilterOptions() {
    const cadres = new Set(), sources = new Set(), domiciles = new Set(), postTypes = new Set();
    allOfficers.forEach(([, { meta }]) => {
      if (meta.Cadre)               cadres.add(meta.Cadre.trim());
      if (meta.SourceOfRecruitment) sources.add(meta.SourceOfRecruitment.trim());
      if (meta.Domicile)            domiciles.add(meta.Domicile.trim());
      if (meta.PostType)            postTypes.add(meta.PostType.trim());
    });
    fillSelect('fCadre',    [...cadres].sort(),    'All Cadres');
    fillSelect('fSource',   [...sources].sort(),   'All Sources');
    fillSelect('fDomicile', [...domiciles].sort(), 'All Domiciles');
    const ptOrdered = [
      ...postTypeOrder.filter(v => postTypes.has(v)),
      ...[...postTypes].filter(v => !postTypeOrder.includes(v)).sort()
    ];
    fillSelect('fPostType', ptOrdered, 'All Post Types');
    buildRangeSliders();
  }

  function fillSelect(id, values, allLabel) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = `<option value="">${allLabel}</option>` +
      values.map(v => `<option value="${escAttr(v)}">${esc(v)}</option>`).join('');
  }

  function buildRangeSliders() {
    let bMin = Infinity, bMax = -Infinity, rMin = Infinity, rMax = -Infinity;
    _rangeById = {};
    allOfficers.forEach(([, { meta }]) => {
      const b = parseInt(meta.AllotmentYear, 10);
      if (!isNaN(b)) { bMin = Math.min(bMin, b); bMax = Math.max(bMax, b); }
      const ry = getRetireYear(meta);
      if (ry) { rMin = Math.min(rMin, ry); rMax = Math.max(rMax, ry); }
      const id = String(meta['IdentityNo.'] || '').trim();
      if (id) _rangeById[id] = { batch: isNaN(b) ? null : b, retire: ry || null };
    });
    if (!isFinite(bMin)) { bMin = 1980; bMax = 2024; }
    if (!isFinite(rMin)) { rMin = 2024; rMax = 2042; }
    batchExtent  = { min: bMin, max: bMax };
    retireExtent = { min: rMin, max: rMax };
    batchRange   = { lo: bMin, hi: bMax };
    retireRange  = { lo: rMin, hi: rMax };
    initSliderEl('batch',  bMin, bMax, bMin, bMax);
    initSliderEl('retire', rMin, rMax, rMin, rMax);
    syncSliderUI('batch');
    syncSliderUI('retire');
  }

  function initSliderEl(type, minV, maxV, loV, hiV) {
    const lo = document.getElementById(type + 'Lo');
    const hi = document.getElementById(type + 'Hi');
    if (lo) { lo.min = minV; lo.max = maxV; lo.value = loV; }
    if (hi) { hi.min = minV; hi.max = maxV; hi.value = hiV; }
  }

  function syncSliderUI(type) {
    const ext = type === 'batch' ? batchExtent : retireExtent;
    const rng = type === 'batch' ? batchRange  : retireRange;
    const fill  = document.getElementById(type + 'Fill');
    const label = document.getElementById(type + 'RangeLabel');
    const span  = ext.max - ext.min || 1;
    if (fill)  { fill.style.left = ((rng.lo - ext.min) / span * 100).toFixed(2) + '%'; fill.style.width = ((rng.hi - rng.lo) / span * 100).toFixed(2) + '%'; }
    if (label) label.textContent = rng.lo + ' – ' + rng.hi;
  }

  window.onSlider = function (type) {
    const loEl = document.getElementById(type + 'Lo');
    const hiEl = document.getElementById(type + 'Hi');
    if (!loEl || !hiEl) return;
    let lo = parseInt(loEl.value, 10), hi = parseInt(hiEl.value, 10);
    if (lo > hi) { if (document.activeElement === loEl) { lo = hi; loEl.value = lo; } else { hi = lo; hiEl.value = hi; } }
    const rng = type === 'batch' ? batchRange : retireRange;
    rng.lo = lo; rng.hi = hi;
    syncSliderUI(type);
    if (typeof window.applyAllFilters === 'function') window.applyAllFilters();  // grid + active score table
    else applyFilters360();
  };

  window.resetRangeSliders = function () {
    batchRange  = { lo: batchExtent.min, hi: batchExtent.max };
    retireRange = { lo: retireExtent.min, hi: retireExtent.max };
    initSliderEl('batch',  batchExtent.min,  batchExtent.max,  batchExtent.min,  batchExtent.max);
    initSliderEl('retire', retireExtent.min, retireExtent.max, retireExtent.min, retireExtent.max);
    syncSliderUI('batch');
    syncSliderUI('retire');
  };

  window.applyFilters360 = function () {
    const cadreVal    = (document.getElementById('fCadre')?.value      || '').trim();
    const sourceVal   = (document.getElementById('fSource')?.value     || '').trim();
    const domVal      = (document.getElementById('fDomicile')?.value   || '').trim();
    const postTypeVal = (document.getElementById('fPostType')?.value   || '').trim();
    const nameVal     = (document.getElementById('searchName360')?.value || '').trim().toLowerCase();

    filtered = allOfficers.filter(([name, { meta }]) => {
      if (cadreVal    && (meta.Cadre               || '').trim() !== cadreVal)    return false;
      if (sourceVal   && (meta.SourceOfRecruitment || '').trim() !== sourceVal)   return false;
      if (domVal      && (meta.Domicile            || '').trim() !== domVal)      return false;
      if (postTypeVal && (meta.PostType            || '').trim() !== postTypeVal) return false;
      if (nameVal     && !name.toLowerCase().includes(nameVal))                   return false;
      const batchNum = parseInt(meta.AllotmentYear, 10);
      if (!isNaN(batchNum) && (batchNum < batchRange.lo || batchNum > batchRange.hi)) return false;
      const ry = getRetireYear(meta);
      if (ry !== null && (ry < retireRange.lo || ry > retireRange.hi)) return false;
      return true;
    });

    if (sortKey === 'seniority') {
      filtered.sort(([, a], [, b]) =>
        sortDir === 'asc' ? (a.meta.OfficerId || 0) - (b.meta.OfficerId || 0)
                          : (b.meta.OfficerId || 0) - (a.meta.OfficerId || 0));
    } else if (sortKey === 'score_weighted') {
      filtered.sort(([, a], [, b]) => {
        const sa = a.scores ? computeWeightedScore(a.scores) : 0;
        const sb = b.scores ? computeWeightedScore(b.scores) : 0;
        return sortDir === 'asc' ? sa - sb : sb - sa;
      });
    } else {
      const si = parseInt(sortKey.replace('score_', ''), 10);
      filtered.sort(([, a], [, b]) =>
        sortDir === 'asc'
          ? (a.scores?.[si] ?? -1) - (b.scores?.[si] ?? -1)
          : (b.scores?.[si] ?? -1) - (a.scores?.[si] ?? -1));
    }
    renderGrid(filtered);
  };

  window.applySort360 = function () {
    sortKey = document.getElementById('sortSelect360')?.value || 'seniority';
    sortDir = 'desc';
    const btn = document.getElementById('sortDirBtn');
    if (btn) btn.textContent = '↓ Desc';
    applyFilters360();
  };

  window.toggleSortDir = function () {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    const btn = document.getElementById('sortDirBtn');
    if (btn) btn.textContent = sortDir === 'asc' ? '↑ Asc' : '↓ Desc';
    applyFilters360();
  };

  window.resetSort360 = function () {
    sortKey = 'seniority'; sortDir = 'asc';
    weights = new Array(NCATS).fill(1);
    const sel = document.getElementById('sortSelect360');
    if (sel) sel.value = 'seniority';
    const btn = document.getElementById('sortDirBtn');
    if (btn) btn.textContent = '↑ Asc';
  };

  // ================================================================
  // RENDER GRID
  // ================================================================
  function renderGrid(entries) {
    const grid  = document.getElementById('grid360');
    const count = document.getElementById('count360');
    if (count) count.textContent = entries.length + ' Officers';
    if (!entries.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;font-size:14px;color:#64748b;">No officers match the selected filters.</div>`;
      return;
    }
    const isWeighted = sortKey === 'score_weighted';
    const scoreIdx   = (!isWeighted && sortKey.startsWith('score_'))
      ? parseInt(sortKey.replace('score_', ''), 10) : -1;

    grid.innerHTML = entries.map(([name, grpData], idx) => {
      const { meta } = grpData;
      const identityNo = String(meta['IdentityNo.'] || '').trim();
      const imgUrl     = photoMap[identityNo] || NO_PHOTO_SVG;
      const batch      = meta.AllotmentYear || '—';
      const color      = cadreColor(meta.Cadre);

      let scoreVal = null, scoreColor = '', scoreLabel = '';
      if (isWeighted && grpData.scores) {
        const ws = computeWeightedScore(grpData.scores);
        if (ws > 0) { scoreVal = ws.toFixed(2); scoreColor = '#4f46e5'; scoreLabel = 'Wtd'; }
      } else if (scoreIdx >= 0 && grpData.scores) {
        const sv = grpData.scores[scoreIdx];
        if (sv !== null) { scoreVal = sv.toFixed(2); scoreColor = WHEEL_CATS[scoreIdx].color; scoreLabel = WHEEL_CATS[scoreIdx].label.split(' ')[0]; }
      }

      return `<div class="c360" data-name="${escAttr(name)}" data-seq="${idx + 1}"
                   style="border-top-color:${color}">
        <img src="${imgUrl}" alt="${escAttr(name)}"
             onerror="this.src=NO_PHOTO_SVG;this.onerror=null" loading="lazy">
        <div class="c360-body">
          <div class="c360-sno">#${idx + 1}</div>
          <div class="c360-name">${esc(name)}</div>
          <div class="c360-batch">${esc(batch)}</div>
          ${scoreVal !== null ? `<div class="c360-score" style="background:${scoreColor}18;color:${scoreColor}">${esc(scoreLabel)}: <strong>${scoreVal}</strong></div>` : ''}
        </div>
      </div>`;
    }).join('');

    grid.querySelectorAll('.c360').forEach(card => {
      card.addEventListener('click', () =>
        openOfficerDetail(card.getAttribute('data-name'), card.getAttribute('data-seq'))
      );
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ================================================================
  // OFFICER DETAIL POPUP  (identical to script_360.js)
  // ================================================================
  function openOfficerDetail(name, seqNo) {
    const entry = allOfficers.find(([n]) => n === name);
    if (!entry) return;
    const [, { meta, services }] = entry;
    const identityNo = String(meta['IdentityNo.'] || '').trim();
    const imgUrl = photoMap[identityNo] || '';
    const ph = document.getElementById('detailPhoto');
    ph.src = imgUrl || NO_PHOTO_SVG;
    ph.onerror = function() { ph.src = NO_PHOTO_SVG; ph.onerror = null; };

    function abbrevSOR(s) { return (s||'').split(/\s+/).map(w=>w[0]).join('').toUpperCase()||'DR'; }
    const year = meta.AllotmentYear || '—';
    const sor  = abbrevSOR(meta.SourceOfRecruitment);
    document.getElementById('detailName').textContent = name;
    document.getElementById('detailCadre').textContent = [meta.Cadre,'Batch '+year,sor].filter(Boolean).join('  ·  ');

    function row2(label, val) {
      return `<div class="dfield"><strong>${esc(label)}:</strong> ${esc(String(val??'—'))}</div>`;
    }
    document.getElementById('detailGrid').innerHTML =
      row2('Current Posting', meta.currentposting||meta.PostName||'—') +
      row2('Date of Birth',   fmtDate(meta.DateOfBirth)) +
      row2('Retirement',      calcRetirementDate(meta.DateOfBirth)) +
      row2('Date of Appt.',   fmtDate(meta.DateofAppointment)) +
      row2('Domicile',        meta.Domicile||'—') +
      row2('Qualification',   meta.EducationalQualification||'—') +
      (meta.EmailId ? row2('Email', meta.EmailId) : '') +
      (meta.PhoneNo ? row2('Phone', meta.PhoneNo) : '');

    const deptMap={}, catMap={}, hcmData={};
    services.forEach(sv => {
      const yrs  = sv.Years || calcYears(sv.From, sv.To);
      const dept = (sv.Department||'').trim();
      const cat  = (sv.Category||'').trim();
      const hcm  = (sv.HCM||'').trim();
      if (dept) deptMap[dept] = (deptMap[dept]||0) + yrs;
      if (cat)  catMap[cat]   = (catMap[cat]||0)   + yrs;
      if (hcm)  { if (!hcmData[hcm]) hcmData[hcm]={years:0}; hcmData[hcm].years+=yrs; }
    });

    function buildBars(map) {
      const rows = Object.entries(map).sort((a,b)=>b[1]-a[1]);
      if (!rows.length) return '<p class="dno-data">No data available</p>';
      const maxY = rows[0][1];
      return rows.map(([label,yrs]) => {
        const pct = (yrs/maxY*100).toFixed(1);
        return `<div class="dsvc-row"><div class="dsvc-label" title="${escAttr(label)}">${esc(label)}</div><div class="dsvc-track"><div class="dsvc-bar" style="width:${pct}%"></div></div><div class="dsvc-yrs">${fmtYears(yrs)}</div></div>`;
      }).join('');
    }
    document.getElementById('detailPanelDept').innerHTML = buildBars(deptMap);
    document.getElementById('detailPanelCat').innerHTML  = buildBars(catMap);

    function hcmInitials(n) { const w=n.split(/\s+/).filter(Boolean); return (w.length>=2?w[w.length-2][0]+w[w.length-1][0]:(w[0]||'?')[0]).toUpperCase(); }
    function hcmBg(n) { let h=0; for(const c of n)h=c.charCodeAt(0)+((h<<5)-h); const p=['#d97706','#b45309','#92400e','#c2410c','#b91c1c','#7c3aed','#0f766e','#1d4ed8','#15803d','#0e7490']; return p[Math.abs(h)%p.length]; }
    function makeAvatar(hcm,size) {
      const photoUrl=hcmPhotoMap[hcm]||''; const bg=hcmBg(hcm); const inits=hcmInitials(hcm); const fz=size<=36?11:16;
      const inner=photoUrl?`<img src="${escAttr(photoUrl)}" alt="${escAttr(hcm)}">`:`<span style="color:#fffbeb;font-size:${fz}px;font-weight:900">${esc(inits)}</span>`;
      return { bg, inner };
    }

    const hcmRows=Object.entries(hcmData).sort((a,b)=>b[1].years-a[1].years);
    document.getElementById('detailPanelHcm').innerHTML=hcmRows.length
      ?`<div class="dhcm-grid">${hcmRows.map(([hcm,d])=>{const{bg,inner}=makeAvatar(hcm,54);return`<div class="dhcm-card"><div class="dhcm-avatar" style="background:${bg}">${inner}</div><div class="dhcm-name">${esc(hcm)}</div><div class="dhcm-yrs">${fmtYears(d.years)}</div></div>`;}).join('')}</div>`
      :'<p class="dno-data">No Chief Minister data available</p>';

    const svcSorted=[...services].sort((a,b)=>{const da=parseDate(a.From||''),db=parseDate(b.From||'');const ta=isNaN(da.getTime())?0:da.getTime(),tb=isNaN(db.getTime())?0:db.getTime();return tb-ta;});
    document.getElementById('detailPanelSvc').innerHTML=svcSorted.length
      ?`<div class="dsvc-timeline">${svcSorted.map(sv=>{
          const hcm=(sv.HCM||'').trim(),fromStr=fmtDate(sv.From),toStr=sv.To?fmtDate(sv.To):'Present',dur=fmtYears(sv.Years||calcYears(sv.From,sv.To)),post=sv.PostName||'—',dept=(sv.Department||'').trim(),cat=(sv.Category||'').trim();
          const{bg,inner}=hcm?makeAvatar(hcm,38):{bg:'#92400e',inner:`<span style="color:#fffbeb;font-size:11px;font-weight:900">—</span>`};
          const tags=[dept,cat].filter(Boolean).map(t=>`<span class="dsvc-rec-tag">${esc(t)}</span>`).join('');
          return`<div class="dsvc-record"><div class="dsvc-rec-avatar" style="background:${bg}">${inner}</div><div class="dsvc-rec-period"><div class="dsvc-rec-from">${fromStr} → ${toStr}</div><div class="dsvc-rec-dur">${dur}</div></div><div class="dsvc-rec-info"><div class="dsvc-rec-post">${esc(post)}</div><div class="dsvc-rec-tags">${tags}</div></div></div>`;
        }).join('')}</div>`
      :'<p class="dno-data">No service record data</p>';

    // Activate first tab
    switchDetailTab('dept');
    document.getElementById('detailOverlay').classList.add('open');
    document.getElementById('detailOverlay').addEventListener('click', function closer(e) {
      if (e.target === this) { this.classList.remove('open'); this.removeEventListener('click', closer); }
    });
    document.getElementById('detailClose').onclick = () => document.getElementById('detailOverlay').classList.remove('open');
    document.getElementById('detailBtnWheel').onclick = () => openWheel(name);
  }

  // Open the same grid detail popup from any capsule table (looked up by Identity No.)
  window.openOfficerDetailById = function (identityNo) {
    const id = String(identityNo).trim();
    const entry = allOfficers.find(([, g]) => String(((g && g.meta) || {})['IdentityNo.'] || '').trim() === id);
    if (entry) openOfficerDetail(entry[0]);
  };

  window.switchDetailTab = function (tab) {
    document.querySelectorAll('.detail-tab').forEach((btn, i) => {
      const panels = ['dept','cat','hcm','svc'];
      btn.classList.toggle('active', panels[i] === tab);
      const panel = document.getElementById('detailPanel' + panels[i][0].toUpperCase() + panels[i].slice(1));
      if (panel) panel.classList.toggle('active', panels[i] === tab);
    });
  };

  // ================================================================
  // 360° WHEEL  (null scores shown as grey/N·A)
  // ================================================================
  function openWheel(name) {
    document.getElementById('detailOverlay').classList.remove('open');
    const entry = allOfficers.find(([n]) => n === name);
    if (!entry) return;
    const [, grpData] = entry;
    const scores = grpData.scores || new Array(NCATS).fill(null);
    const ranks  = grpData.catRanks || new Array(NCATS).fill('—');
    currentWheelData = { scores, ranks, grp: grpData };

    document.getElementById('wheelName').textContent = name;
    const meta        = grpData.meta || {};
    const identityNo  = String(meta['IdentityNo.'] || '').trim();
    const photoUrl    = photoMap[identityNo] || NO_PHOTO_SVG;
    const presentPost = (meta.currentposting || meta.PostType || '').trim();
    const postEl = document.getElementById('wheelPost');
    if (postEl) postEl.textContent = presentPost ? '📋 ' + presentPost : '';

    const liveCount   = scores.filter(s => s !== null).length;
    const avgScore    = grpData.composite != null ? grpData.composite.toFixed(2) : '—';
    const peerRank    = grpData.peerRank || '—';
    const peerTot     = grpData.peerTotal || 0;
    const peerLabel   = grpData.peerLabel || '—';

    document.getElementById('wheelPeerBadge').textContent = `👥 Peer Rank #${peerRank} of ${peerTot}`;
    document.getElementById('wheelAvgBadge').textContent  = liveCount
      ? `Composite ${avgScore}/100 · ${liveCount}/${NCATS} scores`
      : 'No live data yet';
    var noteEl = document.getElementById('wheelPeerNote');
    if (noteEl) noteEl.innerHTML = liveCount
      ? `Peer rank is among officers who share the same parameters: <b>${esc(peerLabel)}</b>`
      : 'No live scores available for this officer yet.';

    // full display set: 5 live scores + the coming-soon performance parameters (no data yet)
    const dispScores = WHEEL_DISPLAY.map(c => c.live ? (scores[c.src] != null ? scores[c.src] : null) : null);
    currentWheelData.scores = dispScores;
    currentWheelData.name = name; currentWheelData.photo = photoUrl;
    // default: only parameters that have data are checked / plotted
    wheelActiveIdx = dispScores.map((s, i) => s !== null ? i : -1).filter(i => i >= 0);
    buildWheelScoresPanel(dispScores);

    drawWheel(dispScores, name, photoUrl);
    document.getElementById('wheelOverlay').classList.add('open');

    const closeBtn = document.getElementById('wheelClose');
    if (closeBtn) closeBtn.onclick = () => {
      document.getElementById('wheelOverlay').classList.remove('open');
      activeSegSet.clear();
    };
    document.getElementById('wheelOverlay').addEventListener('click', function closer(e) {
      if (e.target === this) {
        this.classList.remove('open');
        activeSegSet.clear();
        this.removeEventListener('click', closer);
      }
    });
  }

  // ── Companion "Scores Included" checklist panel ──
  function buildWheelScoresPanel(scores) {
    const list = document.getElementById('wspList');
    if (!list) return;
    list.innerHTML = WHEEL_DISPLAY.map((cat, i) => {
      const sc = scores[i];
      const has = sc !== null && sc !== undefined;
      const checked = wheelActiveIdx.indexOf(i) > -1 ? 'checked' : '';
      const valHtml = has
        ? '<span class="wsp-val has" style="background:' + cat.color + '">' + sc.toFixed(2) + '</span>'
        : '<span class="wsp-val no">No data</span>';
      return '<label class="wsp-row">'
        + '<input type="checkbox" data-i="' + i + '" ' + checked + ' onchange="wheelToggleScore(' + i + ',this.checked)">'
        + '<span class="wsp-icon">' + (cat.icon || '') + '</span>'
        + '<span class="wsp-name">' + esc(cat.label) + '</span>'
        + valHtml + '</label>';
    }).join('');
    const sw = document.getElementById('wspShowAll');
    if (sw) sw.checked = (wheelActiveIdx.length === NDISP);
  }
  function redrawWheel() {
    if (!currentWheelData) return;
    drawWheel(currentWheelData.scores, currentWheelData.name, currentWheelData.photo);
  }
  window.wheelToggleScore = function (i, checked) {
    i = +i;
    const pos = wheelActiveIdx.indexOf(i);
    if (checked && pos < 0) wheelActiveIdx.push(i);
    if (!checked && pos > -1) wheelActiveIdx.splice(pos, 1);
    wheelActiveIdx.sort((a, b) => a - b);
    const sw = document.getElementById('wspShowAll'); if (sw) sw.checked = (wheelActiveIdx.length === NDISP);
    redrawWheel();
  };
  window.wheelToggleShowAll = function () {
    const sw = document.getElementById('wspShowAll');
    const on = sw ? sw.checked : false;
    const scores = (currentWheelData && currentWheelData.scores) || [];
    if (on) wheelActiveIdx = WHEEL_DISPLAY.map((_, i) => i);
    else    wheelActiveIdx = scores.map((s, i) => s !== null ? i : -1).filter(i => i >= 0);
    buildWheelScoresPanel(scores);
    redrawWheel();
  };

  function drawWheel(scores, officerName, photoUrl) {
    const svg = document.getElementById('wheelSvg');
    if (!svg) return;
    const SVGNS = 'http://www.w3.org/2000/svg';
    const cx = 320, cy = 320;
    const innerR = 96, outerR = 250;
    const maxScore = 100;
    // which categories to plot (checklist-controlled); default to all if unset
    let activeIdx = (Array.isArray(wheelActiveIdx) ? wheelActiveIdx : WHEEL_DISPLAY.map((_, i) => i))
      .filter(i => i >= 0 && i < NDISP);
    const N = activeIdx.length;
    const angleStep = (2 * Math.PI) / (N || 1);
    const gap = N <= 1 ? 0.06 : 0.045;
    const startOffset = -Math.PI / 2 - angleStep / 2;  // first segment centred at top

    svg.innerHTML = '';
    activeSegSet.clear();

    const el = (n, attrs) => { const e = document.createElementNS(SVGNS, n); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
    const polar = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const sector = (r1, r2, a1, a2) => {
      const [x1,y1]=polar(r1,a1), [x2,y2]=polar(r2,a1), [x3,y3]=polar(r2,a2), [x4,y4]=polar(r1,a2);
      const laf = (a2 - a1) > Math.PI ? 1 : 0;
      return `M ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 ${laf} 1 ${x3} ${y3} L ${x4} ${y4} A ${r1} ${r1} 0 ${laf} 0 ${x1} ${y1} Z`;
    };
    // pivot any element around the wheel centre (for CSS scale/rotate animations)
    const pivot = (e) => { e.style.transformBox = 'view-box'; e.style.transformOrigin = cx + 'px ' + cy + 'px'; };

    if (N === 0) {
      svg.appendChild(Object.assign(el('text', {
        x: cx, y: cy, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
        'font-size': '16', 'font-weight': '800', fill: '#94a3b8', 'font-family': 'Inter,Arial,sans-serif'
      }), { textContent: 'No scores selected' }));
      return;
    }

    // ── defs: per-segment gradients + glow ──
    const defs = el('defs', {});
    activeIdx.forEach((oi) => {
      const cat = WHEEL_DISPLAY[oi];
      const g = el('linearGradient', { id:'wseg'+oi, x1:'0%', y1:'0%', x2:'0%', y2:'100%' });
      g.appendChild(el('stop', { offset:'0%',  'stop-color':cat.light }));
      g.appendChild(el('stop', { offset:'100%','stop-color':cat.color }));
      defs.appendChild(g);
    });
    const glow = el('filter', { id:'wglow', x:'-50%', y:'-50%', width:'200%', height:'200%' });
    glow.appendChild(el('feDropShadow', { dx:'0', dy:'2', stdDeviation:'4', 'flood-color':'rgba(15,23,42,0.22)' }));
    defs.appendChild(glow);
    const clip = el('clipPath', { id:'wphotoClip' });
    clip.appendChild(el('circle', { cx, cy, r: innerR - 5 }));
    defs.appendChild(clip);
    svg.appendChild(defs);

    // ── decorative back layer: concentric guide rings + slow rotating dashed ring ──
    [0.25, 0.5, 0.75, 1].forEach(f => {
      svg.appendChild(el('circle', {
        cx, cy, r: innerR + (outerR - innerR) * f, fill:'none',
        stroke:'#e2e8f0', 'stroke-width':'1', 'stroke-dasharray': f === 1 ? 'none' : '3 6'
      }));
    });
    const spinRing = el('circle', {
      cx, cy, r: outerR + 16, fill:'none', stroke:'#cbd5e1',
      'stroke-width':'1.5', 'stroke-dasharray':'2 11', 'stroke-linecap':'round', opacity:'0.7'
    });
    pivot(spinRing);
    spinRing.style.animation = 'wheelSpin 44s linear infinite';
    svg.appendChild(spinRing);

    activeIdx.forEach((oi, p) => {
      const cat = WHEEL_DISPLAY[oi];
      const a1 = startOffset + p * angleStep + gap / 2;
      const a2 = startOffset + (p + 1) * angleStep - gap / 2;
      const midA = (a1 + a2) / 2;
      const sc = scores[oi];
      const isNull = sc === null || sc === undefined;
      const frac = isNull ? 0 : Math.max(0.06, sc / maxScore);
      const segR = innerR + (outerR - innerR) * frac;
      const delay = 0.14 + p * 0.12;

      // 1) full-range track
      const track = el('path', {
        d: sector(innerR, outerR, a1, a2),
        fill: isNull ? '#f1f5f9' : '#f8fafc',
        stroke: isNull ? '#cbd5e1' : '#e2e8f0',
        'stroke-width': '1.5', 'stroke-linejoin':'round', cursor: 'pointer'
      });
      if (isNull) track.setAttribute('stroke-dasharray', '5 5');
      track.addEventListener('click', () => onSegClick(oi, officerName));
      track.addEventListener('mouseenter', () => track.setAttribute('fill', isNull ? '#e2e8f0' : '#eef2ff'));
      track.addEventListener('mouseleave', () => track.setAttribute('fill', isNull ? '#f1f5f9' : '#f8fafc'));
      svg.appendChild(track);

      // 2) coloured value arc — grows out from centre + fades in (staggered)
      if (!isNull) {
        const seg = el('path', {
          d: sector(innerR, segR, a1, a2), fill: 'url(#wseg'+oi+')',
          stroke: cat.color, 'stroke-width': '2', 'stroke-linejoin': 'round',
          filter: 'url(#wglow)', cursor: 'pointer'
        });
        pivot(seg);
        seg.style.transform = 'scale(0.55)';
        seg.style.opacity = '0';
        seg.style.transition = 'transform 0.7s cubic-bezier(0.34,1.45,0.5,1) ' + delay + 's, opacity 0.55s ease ' + delay + 's';
        seg.addEventListener('mouseenter', () => seg.style.filter = 'url(#wglow) brightness(1.07)');
        seg.addEventListener('mouseleave', () => seg.style.filter = 'url(#wglow)');
        seg.addEventListener('click', () => onSegClick(oi, officerName));
        svg.appendChild(seg);
        requestAnimationFrame(() => requestAnimationFrame(() => { seg.style.transform = 'scale(1)'; seg.style.opacity = '1'; }));
      }

      // 3) icon + label outside the ring (label wraps to 2 lines if long)
      const [lx, ly] = polar(outerR + 34, midA);
      svg.appendChild(Object.assign(el('text', {
        x: lx, y: ly - 12, 'text-anchor': 'middle', 'font-size': '23'
      }), { textContent: cat.icon || '' }));
      const labelColor = isNull ? '#94a3b8' : cat.color;
      const words = cat.label.split(' ');
      if (cat.label.length > 9 && words.length > 1) {
        const mid = Math.ceil(words.length / 2);
        const lab = el('text', { x: lx, y: ly + 7, 'text-anchor': 'middle', 'font-size': '12',
          'font-weight': '800', fill: labelColor, 'font-family': 'Inter,Arial,sans-serif' });
        const s1 = el('tspan', { x: lx, dy: '0' }); s1.textContent = words.slice(0, mid).join(' ');
        const s2 = el('tspan', { x: lx, dy: '13' }); s2.textContent = words.slice(mid).join(' ');
        lab.appendChild(s1); lab.appendChild(s2); svg.appendChild(lab);
      } else {
        svg.appendChild(Object.assign(el('text', {
          x: lx, y: ly + 10, 'text-anchor': 'middle', 'font-size': '12.5', 'font-weight': '800',
          fill: labelColor, 'font-family': 'Inter,Arial,sans-serif'
        }), { textContent: cat.label }));
      }

      // 4) score value (fades in after its arc) or N/A chip
      if (!isNull) {
        const [vx, vy] = polar(innerR + (segR - innerR) * 0.6, midA);
        const vt = el('text', {
          x: vx, y: vy, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
          'font-size': '23', 'font-weight': '900', fill: '#ffffff',
          stroke: cat.color, 'stroke-width': '0.5', 'paint-order': 'stroke',
          'font-family': 'Inter,Arial,sans-serif'
        });
        vt.textContent = sc.toFixed(2);
        vt.style.opacity = '0';
        vt.style.transition = 'opacity 0.45s ease ' + (delay + 0.32) + 's';
        svg.appendChild(vt);
        requestAnimationFrame(() => requestAnimationFrame(() => { vt.style.opacity = '1'; }));
      } else {
        const [vx, vy] = polar(innerR + (outerR - innerR) * 0.45, midA);
        svg.appendChild(Object.assign(el('text', {
          x: vx, y: vy - 7, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': '20'
        }), { textContent: '🚫' }));
        svg.appendChild(Object.assign(el('text', {
          x: vx, y: vy + 13, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
          'font-size': '11.5', 'font-weight': '800', fill: '#94a3b8', 'font-family': 'Inter,Arial,sans-serif'
        }), { textContent: 'No Score' }));
      }
    });

    // ── centre: ripple rings → photo → rim → composite badge ──
    const liveCount = scores.filter(s => s !== null).length;
    const avg = liveCount ? (scores.reduce((s, v) => s + (v || 0), 0) / liveCount) : null;

    for (let k = 0; k < 2; k++) {
      const rip = el('circle', { cx, cy, r: innerR, fill:'none', stroke:'#818cf8', 'stroke-width':'2', opacity:'0' });
      pivot(rip);
      rip.style.animation = 'wheelRipple 2.8s ease-out ' + (k * 1.4) + 's infinite';
      svg.appendChild(rip);
    }
    // photo backing + photo
    svg.appendChild(el('circle', { cx, cy, r: innerR - 1, fill: '#ffffff', filter: 'url(#wglow)' }));
    const img = el('image', {
      x: cx - (innerR - 5), y: cy - (innerR - 5),
      width: 2 * (innerR - 5), height: 2 * (innerR - 5),
      preserveAspectRatio: 'xMidYMid slice', 'clip-path': 'url(#wphotoClip)'
    });
    img.setAttribute('href', photoUrl || '');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', photoUrl || '');
    svg.appendChild(img);
    // clean double rim (white + slate)
    svg.appendChild(el('circle', { cx, cy, r: innerR - 3, fill: 'none', stroke: '#ffffff', 'stroke-width': '4' }));
    svg.appendChild(el('circle', { cx, cy, r: innerR, fill: 'none', stroke: '#cbd5e1', 'stroke-width': '1.5' }));

    // composite badge at the bottom of the photo (fades in last)
    if (avg != null) {
      const bw = 90, bh = 32, by = cy + innerR - 16;
      const grp = el('g', {});
      grp.style.opacity = '0';
      grp.style.transition = 'opacity 0.5s ease 0.75s';
      grp.appendChild(el('rect', { x: cx - bw/2, y: by, width: bw, height: bh, rx: 16,
        fill: '#0f172a', stroke: '#6366f1', 'stroke-width': '1.5', filter: 'url(#wglow)' }));
      grp.appendChild(Object.assign(el('text', {
        x: cx, y: by + 11, 'text-anchor': 'middle', 'font-size': '8.5', 'font-weight': '700',
        fill: '#94a3b8', letterSpacing: '0.8', 'font-family': 'Inter,Arial,sans-serif'
      }), { textContent: 'COMPOSITE' }));
      grp.appendChild(Object.assign(el('text', {
        x: cx, y: by + 25, 'text-anchor': 'middle', 'font-size': '15', 'font-weight': '900',
        fill: '#ffffff', 'font-family': 'Inter,Arial,sans-serif'
      }), { textContent: avg.toFixed(2) }));
      svg.appendChild(grp);
      requestAnimationFrame(() => requestAnimationFrame(() => { grp.style.opacity = '1'; }));
    }
  }

  function onSegClick(idx, officerName) {
    // Live score → open that score's full page and highlight the officer directly
    // (same as the Professional Performance Index cells). No intermediate popup.
    const cat  = WHEEL_DISPLAY[idx];
    const sc   = currentWheelData.scores[idx];
    const view = (cat && cat.live && cat.src != null) ? WHEEL_VIEW_BY_SRC[cat.src] : null;
    if (view && sc != null) {
      const idNo = String((currentWheelData.grp && currentWheelData.grp.meta && currentWheelData.grp.meta['IdentityNo.']) || '').trim();
      if (idNo) { window.wheelGotoScore(view, idNo); return; }
    }
    // Coming-soon parameter (no live page): keep the small info popup
    if (activeSegSet.has(idx)) {
      activeSegSet.delete(idx);
      const bg = document.getElementById('sdpBg_' + idx);
      if (bg) bg.remove();
      return;
    }
    activeSegSet.add(idx);
    showSegDetail(idx, officerName);
  }

  function showSegDetail(idx, officerName) {
    const existing = document.getElementById('sdpBg_' + idx);
    if (existing) existing.remove();
    const cat  = WHEEL_DISPLAY[idx];
    const dets = WHEEL_DISPLAY[idx];
    const sc   = currentWheelData.scores[idx];
    const isNull = sc === null || sc === undefined;

    const bg = document.createElement('div');
    bg.className = 'sdp-popup-bg'; bg.id = 'sdpBg_' + idx;
    bg.innerHTML = `
      <div class="sdp-popup" style="--sdp-color:${cat.color}">
        <button class="sdp-popup-close" onclick="document.getElementById('sdpBg_${idx}').remove();activeSegSet&&activeSegSet.delete(${idx})">✕</button>
        <div class="sdp-popup-header">
          <span style="font-size:28px">${dets.icon}</span>
          <div>
            <div style="font-size:13px;font-weight:900;color:#78350f">${esc(cat.label)}</div>
            <div style="font-size:9.5px;color:#b45309;margin-top:2px">${esc(dets.source)}</div>
            <div style="font-size:9px;color:#92400e;margin-top:4px;line-height:1.5">${esc(dets.desc)}</div>
          </div>
        </div>
        <div class="sdp-popup-body">
          ${isNull
            ? `<div style="padding:20px;text-align:center;font-size:12px;color:#94a3b8;">⏳ Live data for this parameter is not yet available.</div>`
            : (dets.metrics || []).map(m => {
                const v = m.val !== null ? m.val : Math.round((sc / 10) * 100);
                return `<div class="sdp-metric-row">
                  <div class="sdp-metric-label">${esc(m.label)}</div>
                  <div class="sdp-metric-track"><div class="sdp-metric-bar" style="width:${v}%;background:${cat.color}"></div></div>
                  <div class="sdp-metric-val">${v}</div>
                </div>`;
              }).join('')
          }
        </div>
        <div class="sdp-expand-hint">${isNull ? 'Data will appear once loaded' : `Score: ${sc !== null ? sc.toFixed(2) : '—'} / 100`}</div>
      </div>`;

    const wb = document.getElementById('wheelBox');
    if (wb) wb.appendChild(bg);
    bg.addEventListener('click', e => { if (e.target === bg) { bg.remove(); activeSegSet.delete(idx); } });

    // Animate bars
    requestAnimationFrame(() => {
      bg.querySelectorAll('.sdp-metric-bar').forEach(bar => {
        const w = bar.style.width; bar.style.width = '0%';
        requestAnimationFrame(() => { bar.style.width = w; });
      });
    });
  }

  // ================================================================
  // WEIGHTS POPUP
  // ================================================================
  window.openWeightsPopup = function () {
    const body = document.getElementById('weightsBody');
    if (!body) return;
    body.innerHTML = WHEEL_CATS.map((cat, i) => {
      const liveTag = cat.live ? '<span style="font-size:9px;background:#d1fae5;color:#065f46;border-radius:9px;padding:1px 7px;margin-left:6px;">LIVE</span>' : '';
      return `<div class="weight-row">
        <span class="weight-icon" style="color:${cat.color}">${CAT_DETAILS[i].icon}</span>
        <label class="weight-label" style="color:${cat.live?'#e0e7ff':'#94a3b8'}">${cat.label}${liveTag}</label>
        <input type="range" class="weight-slider" min="0" max="10" step="1" value="${weights[i]}"
               id="wSlider${i}" style="--c:${cat.color}"
               oninput="document.getElementById('wVal${i}').textContent=this.value">
        <span class="weight-val" id="wVal${i}">${weights[i]}</span>
      </div>`;
    }).join('');
    document.getElementById('weightsOverlay').style.display = 'flex';
  };

  window.closeWeightsPopup = function () {
    document.getElementById('weightsOverlay').style.display = 'none';
  };

  window.resetWeights = function () {
    weights = new Array(NCATS).fill(1);
    WHEEL_CATS.forEach((_, i) => {
      const sl = document.getElementById('wSlider' + i); if (sl) sl.value = 1;
      const vl = document.getElementById('wVal' + i);    if (vl) vl.textContent = '1';
    });
  };

  window.applyWeights = function () {
    weights = WHEEL_CATS.map((_, i) => {
      const sl = document.getElementById('wSlider' + i);
      return sl ? parseInt(sl.value, 10) : 1;
    });
    closeWeightsPopup();
    sortKey = 'score_weighted';
    const sel = document.getElementById('sortSelect360');
    if (sel) sel.value = 'score_weighted';
    applyFilters360();
  };

  // ================================================================
  // UTILITIES
  // ================================================================
  function parseDate(s) {
    if (!s) return new Date('invalid');
    const iso = s.replace(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/, '$3-$2-$1');
    return new Date(iso || s);
  }
  function fmtDate(d) {
    if (!d) return '—';
    const dt = parseDate(String(d));
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  }
  function calcYears(from, to) {
    if (!from) return 0;
    const f = parseDate(String(from));
    const t = to ? parseDate(String(to)) : new Date();
    if (isNaN(f.getTime())) return 0;
    return Math.max(0, (t - f) / (365.25 * 86400000));
  }
  function fmtYears(y) {
    if (!y || y <= 0) return '—';
    const yrs = Math.floor(y), mos = Math.round((y - yrs) * 12);
    return yrs > 0 ? `${yrs}y ${mos}m` : `${mos}m`;
  }
  function calcRetirementDate(dob) {
    if (!dob) return '—';
    const dt = parseDate(String(dob));
    if (isNaN(dt.getTime())) return '—';
    const ret = new Date(dt); ret.setFullYear(ret.getFullYear() + 60);
    return ret.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function escAttr(s) { return String(s||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

})();
