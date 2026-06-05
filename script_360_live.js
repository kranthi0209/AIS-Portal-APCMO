// ================================================================
// script_360_live.js  —  360° Live Dashboard
// Loads REAL officer data from Supabase.
// Scores marked LIVE are computed from real tables.
// Scores marked PENDING return null (displayed grey in wheel).
// ================================================================

(function () {

  const svc = (new URLSearchParams(window.location.search).get('service') || 'IAS').toUpperCase();

  // ── 14 evaluation categories (same order as demo version) ──────
  const WHEEL_CATS = [
    { label:'e-Office',          color:'#6366f1', light:'#a5b4fc', live:true  },
    { label:'Swarna AP',         color:'#8b5cf6', light:'#c4b5fd', live:false },
    { label:'GSDP',              color:'#d946ef', light:'#f0abfc', live:false },
    { label:'GoI Funds',         color:'#ec4899', light:'#f9a8d4', live:true  },
    { label:'Public Perception', color:'#f43f5e', light:'#fda4af', live:true  },
    { label:'Innovations',       color:'#f97316', light:'#fdba74', live:false },
    { label:'Digitalisation',    color:'#ca8a04', light:'#fde047', live:false },
    { label:'New Policies',      color:'#65a30d', light:'#bef264', live:false },
    { label:'De Regularisation', color:'#16a34a', light:'#86efac', live:false },
    { label:'Integrity Index',   color:'#0d9488', light:'#6ee7b7', live:false },
    { label:'Party Feedback',    color:'#0891b2', light:'#67e8f9', live:false },
    { label:'Media Feedback',    color:'#2563eb', light:'#93c5fd', live:false },
    { label:'Leadership Skills', color:'#7c3aed', light:'#c4b5fd', live:false },
    { label:'CMO Score',         color:'#b45309', light:'#fcd34d', live:false },
  ];

  const CAT_DETAILS = [
    { icon:'💻', source:'e-Office System — Data entered by e-Office Operator',
      desc:'File processing efficiency — disposal rate, avg clearance time, and speed distribution across time brackets.',
      metrics:[
        { label:'Disposal Rate',          val:null },
        { label:'Avg Processing Time',    val:null },
        { label:'< 1 Day Clearances',     val:null },
        { label:'Files Pending (Inv.)',   val:null },
        { label:'Processing Speed Index', val:null },
      ]},
    { icon:'⭐', source:'Swarna AP Portal — Uploaded by Swarna Operator',
      desc:'Annual performance score based on KPIs under the Swarna Andhra Pradesh governance framework.',
      metrics:[
        { label:'KPI Achievement Rate',   val:null },
        { label:'Target vs Actual',       val:null },
        { label:'Citizen Service Score',  val:null },
        { label:'Field Visit Compliance', val:null },
        { label:'Reporting Punctuality',  val:null },
      ]},
    { icon:'📈', source:'GSDP Portal — Uploaded by GSDP Operator',
      desc:'Gross State Domestic Product contribution and economic indicators from the officer\'s jurisdiction.',
      metrics:[
        { label:'GSDP Growth Rate',       val:null },
        { label:'Sectoral Contribution',  val:null },
        { label:'Investment Facilitated', val:null },
        { label:'Revenue Collection',     val:null },
        { label:'Infrastructure Index',   val:null },
      ]},
    { icon:'🏛️', source:'GoI Funds Portal — Uploaded by GoI Funds Operator',
      desc:'Utilization efficiency of Government of India funds and centrally sponsored schemes.',
      metrics:[
        { label:'Fund Utilization Rate',  val:null },
        { label:'Timely Claims Filed',    val:null },
        { label:'Scheme Completion Rate', val:null },
        { label:'Beneficiary Coverage',   val:null },
        { label:'Audit Compliance',       val:null },
      ]},
    { icon:'👥', source:'Perception Survey — Uploaded by Perception Operator',
      desc:'Citizen satisfaction and perception scores from structured field surveys.',
      metrics:[
        { label:'Overall Satisfaction',   val:null },
        { label:'Accessibility Score',    val:null },
        { label:'Grievance Resolution',   val:null },
        { label:'Service Efficiency',     val:null },
        { label:'Transparency Index',     val:null },
      ]},
    { icon:'💡', source:'Self Appraisal — Expert Review Panel Score',
      desc:'Innovations introduced — score awarded by the Expert Review Committee.',
      metrics:[
        { label:'Implementation',         val:null },
        { label:'Impact Assessment',      val:null },
        { label:'Replication Potential',  val:null },
        { label:'Stakeholder Approval',   val:null },
        { label:'Sustainability',         val:null },
      ]},
    { icon:'📱', source:'Self Appraisal — Expert Review Panel Score',
      desc:'Digital transformation initiatives — score awarded by the Expert Review Committee.',
      metrics:[
        { label:'Digital Services',       val:null },
        { label:'Citizen App Adoption',   val:null },
        { label:'Paperless Processes',    val:null },
        { label:'Data Accuracy',          val:null },
        { label:'Tech Training',          val:null },
      ]},
    { icon:'📋', source:'Self Appraisal — Expert Review Panel Score',
      desc:'Policies framed and implemented — score by the Expert Review Committee.',
      metrics:[
        { label:'Policies Drafted',       val:null },
        { label:'Policies Notified',      val:null },
        { label:'Stakeholder Consult.',   val:null },
        { label:'Implementation Rate',    val:null },
        { label:'Outcome Monitoring',     val:null },
      ]},
    { icon:'✂️', source:'Self Appraisal — Expert Review Panel Score',
      desc:'De-Regularisation — simplification of compliance processes. Score by the Expert Committee.',
      metrics:[
        { label:'Regulations Removed',    val:null },
        { label:'Process Steps Reduced',  val:null },
        { label:'Compliance Reduction',   val:null },
        { label:'Business Ease Impact',   val:null },
        { label:'Citizen Feedback',       val:null },
      ]},
    { icon:'🛡️', source:'Integrity Data — Uploaded by Integrity Operator',
      desc:'Composite integrity score based on ACB records, vigilance clearance and conduct.',
      metrics:[
        { label:'ACB Cases (Clean=100)',  val:null },
        { label:'Complaint Resolution',   val:null },
        { label:'Vigilance Clearance',    val:null },
        { label:'Asset Declaration',      val:null },
        { label:'Conduct Score',          val:null },
      ]},
    { icon:'🤝', source:'Party Feedback — Uploaded by Party Operator',
      desc:'Feedback scores from ruling party functionaries and elected representatives.',
      metrics:[
        { label:'MLA Feedback Score',     val:null },
        { label:'MP Feedback Score',      val:null },
        { label:'Zilla Parishad Score',   val:null },
        { label:'Mandal Parishad Score',  val:null },
        { label:'Village Sarpanch Score', val:null },
      ]},
    { icon:'📰', source:'Media Feedback — Uploaded by Media Operator',
      desc:'Sentiment analysis of print, digital and social media coverage of the officer\'s work.',
      metrics:[
        { label:'Positive Coverage %',    val:null },
        { label:'Neutral/Neg. (Inv.)',    val:null },
        { label:'Social Media Sentiment', val:null },
        { label:'Print Media Score',      val:null },
        { label:'Digital Media Score',    val:null },
      ]},
    { icon:'🎯', source:'Self Appraisal — Expert Review Panel Score',
      desc:'Leadership qualities, team management and institutional capacity building.',
      metrics:[
        { label:'Team Building',          val:null },
        { label:'Decision Making',        val:null },
        { label:'Crisis Management',      val:null },
        { label:'Mentoring & Training',   val:null },
        { label:'Stakeholder Coord.',     val:null },
      ]},
    { icon:'🏆', source:'CMO Assessment — Chief Minister\'s Office',
      desc:'Direct performance assessment by the Chief Minister\'s Office on special assignments.',
      metrics:[
        { label:'Special Assignment',     val:null },
        { label:'Responsiveness',         val:null },
        { label:'Report Quality',         val:null },
        { label:'Field Reliability',      val:null },
        { label:'CMO Interaction Rating', val:null },
      ]},
  ];

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
  let weights = new Array(14).fill(1);
  let batchRange   = { lo:0, hi:9999 };
  let retireRange  = { lo:0, hi:9999 };
  let batchExtent  = { min:0, max:9999 };
  let retireExtent = { min:0, max:9999 };

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
  function buildScores(idNo, rawData) {
    const id = String(idNo);
    return [
      computeEofficeScore(rawData.eoffice[id]),     // 0  e-Office    LIVE
      null,                                          // 1  Swarna AP   pending
      null,                                          // 2  GSDP        pending
      computeGoifundsScore(rawData.goifunds[id]),   // 3  GoI Funds   LIVE
      computePerceptionScore(rawData.perception[id]),// 4  Perception  LIVE
      null,                                          // 5  Innovations pending
      null,                                          // 6  Digitalisation pending
      null,                                          // 7  New Policies pending
      null,                                          // 8  De-Reg      pending
      null,                                          // 9  Integrity   pending
      null,                                          // 10 Party       pending
      null,                                          // 11 Media       pending
      null,                                          // 12 Leadership  pending
      null,                                          // 13 CMO Score   pending
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
    WHEEL_CATS.forEach((_, ci) => {
      const order = [...grpList].sort((a, b) => (b.scores[ci] || 0) - (a.scores[ci] || 0));
      order.forEach((grp, pos) => {
        if (!grp.catRanks) grp.catRanks = new Array(14).fill(0);
        grp.catRanks[ci] = pos + 1;
      });
    });
    const byAvg = [...grpList].sort((a, b) => {
      const sa = a.scores.reduce((s, v) => s + (v || 0), 0);
      const sb = b.scores.reduce((s, v) => s + (v || 0), 0);
      return sb - sa;
    });
    byAvg.forEach((grp, pos) => { grp.overallRank = pos + 1; });
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
  requireAuth().then(session => {
    if (!session) return;

    fetchHcmPhotos();

    Promise.all([
      loadOfficerData(svc),
      loadPhotos(svc),
      loadScoreData(),
      _supabase.from('post_type_options').select('label').eq('service_type', svc).order('sort_order').order('label')
    ]).then(([rows, photos, rawData, ptResult]) => {
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

      // Build live scores for each officer
      for (const grp of Object.values(grouped)) {
        const idNo = String(grp.meta['IdentityNo.'] || '').trim();
        grp.scores = buildScores(idNo, rawData);
      }

      computeOfficerRanks(Object.values(grouped));

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
  });

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
    allOfficers.forEach(([, { meta }]) => {
      const b = parseInt(meta.AllotmentYear, 10);
      if (!isNaN(b)) { bMin = Math.min(bMin, b); bMax = Math.max(bMax, b); }
      const ry = getRetireYear(meta);
      if (ry) { rMin = Math.min(rMin, ry); rMax = Math.max(rMax, ry); }
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
    applyFilters360();
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
    weights = new Array(14).fill(1);
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
    const scores = grpData.scores || new Array(14).fill(null);
    const ranks  = grpData.catRanks || new Array(14).fill('—');
    currentWheelData = { scores, ranks, grp: grpData };

    document.getElementById('wheelName').textContent = name;
    const overallRank = grpData.overallRank || '—';
    const total       = grpData.totalOfficers || allOfficers.length;
    const liveCount   = scores.filter(s => s !== null).length;
    const avgScore    = liveCount
      ? (scores.reduce((s, v) => s + (v || 0), 0) / liveCount).toFixed(2)
      : '—';
    document.getElementById('wheelRankBadge').textContent = `Overall Rank #${overallRank} of ${total}`;
    document.getElementById('wheelAvgBadge').textContent  = liveCount
      ? `Live Avg: ${avgScore}/10 (${liveCount}/14 parameters)`
      : 'No live data yet';

    drawWheel(scores, name);
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

  function drawWheel(scores, officerName) {
    const svg = document.getElementById('wheelSvg');
    if (!svg) return;
    const N = WHEEL_CATS.length; // 14
    const cx = 320, cy = 320;
    const outerR = 280, innerR = 70;
    const angleStep = (2 * Math.PI) / N;
    const startOffset = -Math.PI / 2;

    const maxScore = 10;

    svg.innerHTML = '';
    activeSegSet.clear();

    WHEEL_CATS.forEach((cat, i) => {
      const startA = startOffset + i * angleStep;
      const endA   = startA + angleStep - 0.018;
      const sc     = scores[i];
      const isNull = sc === null;
      const frac   = isNull ? 0 : Math.max(0.06, (sc || 0) / maxScore);
      const segR   = innerR + (outerR - innerR) * frac;
      const color  = isNull ? '#94a3b8' : cat.color;
      const light  = isNull ? '#e2e8f0' : cat.light;

      function polar(r, a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
      const [x1,y1] = polar(innerR, startA);
      const [x2,y2] = polar(segR,   startA);
      const [x3,y3] = polar(segR,   endA);
      const [x4,y4] = polar(innerR, endA);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const laf  = angleStep > Math.PI ? 1 : 0;
      path.setAttribute('d',
        `M ${x1} ${y1} L ${x2} ${y2} A ${segR} ${segR} 0 ${laf} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${laf} 0 ${x1} ${y1} Z`
      );
      path.setAttribute('fill',          isNull ? '#f1f5f9' : light + '55');
      path.setAttribute('stroke',        color);
      path.setAttribute('stroke-width',  '1.8');
      path.setAttribute('cursor',        'pointer');
      path.setAttribute('data-index',    i);
      path.style.transition = 'opacity 0.18s';
      path.addEventListener('mouseenter', () => { path.style.opacity = '0.82'; });
      path.addEventListener('mouseleave', () => { path.style.opacity = '1'; });
      path.addEventListener('click', () => onSegClick(i, officerName));
      svg.appendChild(path);

      // Label
      const midA    = startA + angleStep / 2;
      const labelR  = segR + 22;
      const [lx,ly] = polar(labelR, midA);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', lx); text.setAttribute('y', ly);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '8.5');
      text.setAttribute('font-weight', '700');
      text.setAttribute('fill', isNull ? '#94a3b8' : color);
      text.setAttribute('font-family', 'Inter,Arial,sans-serif');
      text.textContent = isNull ? cat.label.split(' ')[0] + ' N·A' : cat.label.split(' ')[0];
      svg.appendChild(text);

      // Score value inside segment
      if (!isNull && frac > 0.15) {
        const valR    = innerR + (segR - innerR) * 0.58;
        const [vx,vy] = polar(valR, midA);
        const vt = document.createElementNS('http://www.w3.org/2000/svg','text');
        vt.setAttribute('x', vx); vt.setAttribute('y', vy);
        vt.setAttribute('text-anchor','middle'); vt.setAttribute('dominant-baseline','middle');
        vt.setAttribute('font-size','9'); vt.setAttribute('font-weight','900');
        vt.setAttribute('fill', color); vt.setAttribute('font-family','Inter,Arial,sans-serif');
        vt.textContent = sc.toFixed(1);
        svg.appendChild(vt);
      }
    });

    // Centre circle
    const cCircle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    cCircle.setAttribute('cx',cx); cCircle.setAttribute('cy',cy); cCircle.setAttribute('r',innerR);
    cCircle.setAttribute('fill','url(#centreGrad)'); cCircle.setAttribute('stroke','#f59e0b'); cCircle.setAttribute('stroke-width','2');
    const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    const grad = document.createElementNS('http://www.w3.org/2000/svg','radialGradient');
    grad.setAttribute('id','centreGrad'); grad.setAttribute('cx','50%'); grad.setAttribute('cy','50%');
    const s1 = document.createElementNS('http://www.w3.org/2000/svg','stop');
    s1.setAttribute('offset','0%'); s1.setAttribute('stop-color','#fffbeb');
    const s2 = document.createElementNS('http://www.w3.org/2000/svg','stop');
    s2.setAttribute('offset','100%'); s2.setAttribute('stop-color','#fef3c7');
    grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad); svg.insertBefore(defs,svg.firstChild);
    svg.appendChild(cCircle);

    const liveCount = scores.filter(s=>s!==null).length;
    const avgScore  = liveCount ? (scores.reduce((s,v)=>s+(v||0),0)/liveCount) : null;
    const ctxt = document.createElementNS('http://www.w3.org/2000/svg','text');
    ctxt.setAttribute('x',cx); ctxt.setAttribute('y',cy-8); ctxt.setAttribute('text-anchor','middle');
    ctxt.setAttribute('font-size','20'); ctxt.setAttribute('font-weight','900'); ctxt.setAttribute('fill','#78350f');
    ctxt.setAttribute('font-family','Inter,Arial,sans-serif');
    ctxt.textContent = avgScore !== null ? avgScore.toFixed(1) : '—';
    svg.appendChild(ctxt);
    const csub = document.createElementNS('http://www.w3.org/2000/svg','text');
    csub.setAttribute('x',cx); csub.setAttribute('y',cy+12); csub.setAttribute('text-anchor','middle');
    csub.setAttribute('font-size','8'); csub.setAttribute('font-weight','700'); csub.setAttribute('fill','#b45309');
    csub.setAttribute('font-family','Inter,Arial,sans-serif');
    csub.textContent = liveCount + '/14 live';
    svg.appendChild(csub);
  }

  function onSegClick(idx, officerName) {
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
    const cat  = WHEEL_CATS[idx];
    const dets = CAT_DETAILS[idx];
    const sc   = currentWheelData.scores[idx];
    const isNull = sc === null;

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
            : dets.metrics.map(m => {
                const v = m.val !== null ? m.val : Math.round((sc / 10) * 100);
                return `<div class="sdp-metric-row">
                  <div class="sdp-metric-label">${esc(m.label)}</div>
                  <div class="sdp-metric-track"><div class="sdp-metric-bar" style="width:${v}%;background:${cat.color}"></div></div>
                  <div class="sdp-metric-val">${v}</div>
                </div>`;
              }).join('')
          }
        </div>
        <div class="sdp-expand-hint">${isNull ? 'Data will appear once loaded' : `Score: ${sc !== null ? sc.toFixed(2) : '—'} / 10`}</div>
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
    weights = new Array(14).fill(1);
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
