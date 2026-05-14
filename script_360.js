// ================================================================
// script_360.js — 360° Comprehensive Officer Photo Gallery
// Service read from URL ?service=IAS|IPS|IFS
// ================================================================

(function () {

  const svc = (new URLSearchParams(window.location.search).get('service') || 'IAS').toUpperCase();

  // 14 evaluation categories for the wheel
  const WHEEL_CATS = [
    { label: 'e-Office',           color: '#6366f1', light: '#a5b4fc' },
    { label: 'Swarna AP',          color: '#8b5cf6', light: '#c4b5fd' },
    { label: 'GSDP',               color: '#d946ef', light: '#f0abfc' },
    { label: 'GoI Funds',          color: '#ec4899', light: '#f9a8d4' },
    { label: 'Public Perception',  color: '#f43f5e', light: '#fda4af' },
    { label: 'Innovations',        color: '#f97316', light: '#fdba74' },
    { label: 'Digitalisation',     color: '#ca8a04', light: '#fde047' },
    { label: 'New Policies',       color: '#65a30d', light: '#bef264' },
    { label: 'De Regularisation',  color: '#16a34a', light: '#86efac' },
    { label: 'Integrity Index',    color: '#0d9488', light: '#6ee7b7' },
    { label: 'Party Feedback',     color: '#0891b2', light: '#67e8f9' },
    { label: 'Media Feedback',     color: '#2563eb', light: '#93c5fd' },
    { label: 'Leadership Skills',  color: '#7c3aed', light: '#c4b5fd' },
    { label: 'CMO Score',          color: '#b45309', light: '#fcd34d' },
  ];

  // Dummy details for each segment (for demo / 360° click-expand)
  const CAT_DETAILS = [
    { icon: '💻', source: 'E-Office Portal — Data uploaded by E-Office Operator',
      desc: 'Measures adoption and efficiency of the e-Office digital file processing system across the officer\'s department.',
      metrics: [
        { label: 'Files Disposed On-Time', val: 87 },
        { label: 'Digital Signatures Used', val: 94 },
        { label: 'Avg Disposal Time Index', val: 68 },
        { label: 'Pending >30 Days (Inv.)', val: 82 },
        { label: 'e-Office Adoption Rate',  val: 91 },
      ]},
    { icon: '⭐', source: 'Swarna AP Portal — Uploaded by Swarna Operator',
      desc: 'Annual performance score based on KPIs defined under the Swarna Andhra Pradesh governance framework.',
      metrics: [
        { label: 'KPI Achievement Rate',    val: 78 },
        { label: 'Target vs Actual Score',  val: 82 },
        { label: 'Citizen Service Score',   val: 91 },
        { label: 'Field Visit Compliance',  val: 65 },
        { label: 'Reporting Punctuality',   val: 88 },
      ]},
    { icon: '📈', source: 'GSDP Portal — Uploaded by GSDP Operator',
      desc: 'Gross State Domestic Product contribution and economic indicators from the officer\'s jurisdiction.',
      metrics: [
        { label: 'GSDP Growth Rate',        val: 72 },
        { label: 'Sectoral Contribution',   val: 66 },
        { label: 'Investment Facilitated',  val: 58 },
        { label: 'Revenue Collection',      val: 80 },
        { label: 'Infrastructure Index',    val: 74 },
      ]},
    { icon: '🏛️', source: 'GoI Funds Portal — Uploaded by GoI Funds Operator',
      desc: 'Utilization efficiency of Government of India funds and centrally sponsored schemes.',
      metrics: [
        { label: 'Fund Utilization Rate',   val: 85 },
        { label: 'Timely Claims Filed',     val: 79 },
        { label: 'Scheme Completion Rate',  val: 88 },
        { label: 'Beneficiary Coverage',    val: 76 },
        { label: 'Audit Compliance',        val: 82 },
      ]},
    { icon: '👥', source: 'Perception Survey — Uploaded by Perception Operator',
      desc: 'Citizen satisfaction and perception scores from structured field surveys across the district.',
      metrics: [
        { label: 'Overall Satisfaction',    val: 74 },
        { label: 'Accessibility Score',     val: 68 },
        { label: 'Grievance Resolution',    val: 81 },
        { label: 'Service Efficiency',      val: 77 },
        { label: 'Transparency Index',      val: 63 },
      ]},
    { icon: '💡', source: 'Self Appraisal — Entered directly by Officer',
      desc: 'Novel solutions and best practices introduced in the jurisdiction during the review period.',
      metrics: [
        { label: 'Initiatives Implemented', val: 90 },
        { label: 'Impact Assessment',       val: 72 },
        { label: 'Replication Potential',   val: 65 },
        { label: 'Stakeholder Approval',    val: 83 },
        { label: 'Sustainability Score',    val: 78 },
      ]},
    { icon: '📱', source: 'Self Appraisal — Entered directly by Officer',
      desc: 'Digital transformation initiatives, citizen-facing apps and paperless process adoption.',
      metrics: [
        { label: 'Digital Services Launched', val: 80 },
        { label: 'Citizen App Adoption',      val: 71 },
        { label: 'Paperless Processes',       val: 88 },
        { label: 'Data Accuracy Index',       val: 93 },
        { label: 'Tech Training Score',       val: 69 },
      ]},
    { icon: '📋', source: 'Self Appraisal — Entered directly by Officer',
      desc: 'Policies conceptualized, notified and implemented during the review period.',
      metrics: [
        { label: 'Policies Drafted',          val: 75 },
        { label: 'Policies Notified',         val: 68 },
        { label: 'Stakeholder Consultation',  val: 82 },
        { label: 'Implementation Rate',       val: 60 },
        { label: 'Outcome Monitoring',        val: 77 },
      ]},
    { icon: '✂️', source: 'Self Appraisal — Entered directly by Officer',
      desc: 'Reduction of redundant regulations and simplification of compliance processes.',
      metrics: [
        { label: 'Regulations Removed',       val: 85 },
        { label: 'Process Steps Reduced',     val: 78 },
        { label: 'Compliance Reduction',      val: 66 },
        { label: 'Business Ease Impact',      val: 73 },
        { label: 'Citizen Feedback',          val: 89 },
      ]},
    { icon: '🛡️', source: 'Integrity Data — Uploaded by Integrity Operator',
      desc: 'Composite integrity score based on ACB records, vigilance clearance and conduct.',
      metrics: [
        { label: 'ACB Cases (Clean = 100)',   val: 95 },
        { label: 'Complaint Resolution',      val: 88 },
        { label: 'Vigilance Clearance',       val: 100 },
        { label: 'Asset Declaration',         val: 100 },
        { label: 'Conduct Score',             val: 91 },
      ]},
    { icon: '🤝', source: 'Party Feedback — Uploaded by Party Operator',
      desc: 'Feedback scores from ruling party functionaries and elected representatives.',
      metrics: [
        { label: 'MLA Feedback Score',        val: 76 },
        { label: 'MP Feedback Score',         val: 81 },
        { label: 'Zilla Parishad Score',      val: 68 },
        { label: 'Mandal Parishad Score',     val: 74 },
        { label: 'Village Sarpanch Score',    val: 83 },
      ]},
    { icon: '📰', source: 'Media Feedback — Uploaded by Media Operator',
      desc: 'Sentiment analysis of print, digital and social media coverage of the officer\'s work.',
      metrics: [
        { label: 'Positive Coverage %',       val: 79 },
        { label: 'Neutral/Negative (Inv.)',   val: 85 },
        { label: 'Social Media Sentiment',    val: 72 },
        { label: 'Print Media Score',         val: 77 },
        { label: 'Digital Media Score',       val: 68 },
      ]},
    { icon: '🎯', source: 'Self Appraisal — Entered directly by Officer',
      desc: 'Leadership qualities, team management and institutional capacity building.',
      metrics: [
        { label: 'Team Building',             val: 84 },
        { label: 'Decision Making',           val: 91 },
        { label: 'Crisis Management',         val: 76 },
        { label: 'Mentoring & Training',      val: 68 },
        { label: 'Stakeholder Coordination',  val: 88 },
      ]},
    { icon: '🏆', source: 'CMO Assessment — Chief Minister\'s Office',
      desc: 'Direct performance assessment by the Chief Minister\'s Office on special assignments.',
      metrics: [
        { label: 'Special Assignment',        val: 88 },
        { label: 'Responsiveness',            val: 94 },
        { label: 'Report Quality',            val: 82 },
        { label: 'Field Reliability',         val: 90 },
        { label: 'CMO Interaction Rating',    val: 86 },
      ]},
  ];

  // Cadre → top-border colour mapping
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
    return '#0891b2'; // teal for Others
  }

  // ── State ──────────────────────────────────────────────────────
  let allOfficers  = [];   // sorted Array of [name, {meta, services}]
  let photoMap     = {};
  let hcmPhotoMap  = {};   // HCM name → photo URL
  let postTypeOrder = []; // ordered list from post_type_options table
  let filtered    = [];   // current filtered subset
  let currentWheelData = { scores: [], ranks: [] }; // scores for open wheel
  let activeSegSet = new Set(); // indices of segments with open detail cards
  let sortKey = 'seniority'; // 'seniority' | 'score_weighted' | 'score_0'..'score_13'
  let sortDir = 'asc';       // 'asc' | 'desc'
  let weights = new Array(14).fill(1); // equal weights for weighted score

  // Batch + retirement range filter state
  let batchRange   = { lo: 0, hi: 9999 };
  let retireRange  = { lo: 0, hi: 9999 };
  let batchExtent  = { min: 0, max: 9999 };
  let retireExtent = { min: 0, max: 9999 };

  function computeWeightedScore(scores) {
    const totalW = weights.reduce((s, w) => s + w, 0);
    if (totalW === 0) return 0;
    return scores.reduce((sum, sc, i) => sum + sc * (weights[i] || 0), 0) / totalW;
  }

  function getRetireYear(meta) {
    if (!meta.DateOfBirth) return null;
    const d = parseDate(String(meta.DateOfBirth));
    if (isNaN(d.getTime())) return null;
    return d.getFullYear() + 60;
  }

  function computeOfficerRanks(grpList) {
    const N = grpList.length;
    // Per-category rank: sort by score desc, assign 1-based position
    WHEEL_CATS.forEach((_, ci) => {
      const order = [...grpList].sort((a, b) => (b.scores[ci] || 0) - (a.scores[ci] || 0));
      order.forEach((grp, pos) => {
        if (!grp.catRanks) grp.catRanks = new Array(WHEEL_CATS.length).fill(0);
        grp.catRanks[ci] = pos + 1;
      });
    });
    // Overall rank: sort by avg score desc
    const byAvg = [...grpList].sort((a, b) => {
      const sa = a.scores.reduce((s, v) => s + v, 0);
      const sb = b.scores.reduce((s, v) => s + v, 0);
      return sb - sa;
    });
    byAvg.forEach((grp, pos) => { grp.overallRank = pos + 1; });
    // Store total officer count so wheel can display "Rank X of N"
    grpList.forEach(grp => { grp.totalOfficers = N; });
  }

  // Try to load HCM photos from DB; silently skip if table absent
  async function fetchHcmPhotos() {
    try {
      const { data, error } = await _supabase
        .from('hcm_photos')
        .select('name, photo_url');
      if (!error && data) {
        data.forEach(r => { if (r.name && r.photo_url) hcmPhotoMap[r.name] = r.photo_url; });
      }
    } catch {}
  }

  // ── Bootstrap ──────────────────────────────────────────────────
  requireAuth().then(session => {
    if (!session) return;

    fetchHcmPhotos(); // non-blocking; failures ignored

    Promise.all([
      loadOfficerData(svc),
      loadPhotos(svc),
      _supabase.from('post_type_options').select('label').eq('service_type', svc).order('sort_order').order('label')
    ]).then(([rows, photos, ptResult]) => {
      photoMap = photos;
      postTypeOrder = (ptResult.data || []).map(r => r.label);

      // Group rows by officer (active only — skip retired / transferred)
      const grouped = {};
      rows.forEach(entry => {
        if (entry.is_retired || entry.is_transferred_from_ap) return;
        const name = (entry.NameoftheOfficer || '').trim();
        if (!name) return;
        if (!grouped[name]) grouped[name] = { meta: entry, services: [] };
        grouped[name].services.push(entry);
      });

      // Pick the row with the lowest OfficerId as the canonical meta
      for (const grp of Object.values(grouped)) {
        grp.meta = grp.services.reduce((a, b) =>
          (a.OfficerId || 0) < (b.OfficerId || 0) ? a : b
        );
      }

      // Pre-assign stable scores for each officer (used for sorting + 360° wheel)
      for (const grp of Object.values(grouped)) {
        grp.scores = WHEEL_CATS.map(() => parseFloat((Math.random() * 9.5 + 0.5).toFixed(2)));
      }

      // Compute cross-officer ranks for every category + overall
      computeOfficerRanks(Object.values(grouped));

      // Sort by OfficerId ascending (same order as other views)
      allOfficers = Object.entries(grouped)
        .sort(([, a], [, b]) => (a.meta.OfficerId || 0) - (b.meta.OfficerId || 0));

      populateFilterOptions();
      applyFilters360();

    }).catch(err => {
      document.getElementById('grid360').innerHTML =
        `<div style="grid-column:1/-1;text-align:center;padding:60px 0;font-size:14px;color:#dc2626;">
           &#10060; Error loading data: <strong>${esc(err.message)}</strong>
         </div>`;
      document.getElementById('count360').textContent = 'Error';
    });
  });

  // ── Populate filter dropdowns ──────────────────────────────────
  function populateFilterOptions() {
    const cadres    = new Set();
    const sources   = new Set();
    const domiciles = new Set();
    const postTypes = new Set();

    allOfficers.forEach(([, { meta }]) => {
      if (meta.Cadre)               cadres.add(meta.Cadre.trim());
      if (meta.SourceOfRecruitment) sources.add(meta.SourceOfRecruitment.trim());
      if (meta.Domicile)            domiciles.add(meta.Domicile.trim());
      if (meta.PostType)            postTypes.add(meta.PostType.trim());
    });

    fillSelect('fCadre',    [...cadres].sort(),     'All Cadres');
    fillSelect('fSource',   [...sources].sort(),    'All Sources');
    fillSelect('fDomicile', [...domiciles].sort(),  'All Domiciles');
    // preserve table sort_order; append any values not yet in the DB order at the end
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

  // ── Range sliders (Batch + Retirement) ────────────────────────
  function buildRangeSliders() {
    let bMin = Infinity, bMax = -Infinity;
    let rMin = Infinity, rMax = -Infinity;

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
    if (fill) {
      fill.style.left  = ((rng.lo - ext.min) / span * 100).toFixed(2) + '%';
      fill.style.width = ((rng.hi - rng.lo)  / span * 100).toFixed(2) + '%';
    }
    if (label) label.textContent = rng.lo + ' – ' + rng.hi;
  }

  window.onSlider = function (type) {
    const loEl = document.getElementById(type + 'Lo');
    const hiEl = document.getElementById(type + 'Hi');
    if (!loEl || !hiEl) return;
    let lo = parseInt(loEl.value, 10);
    let hi = parseInt(hiEl.value, 10);
    if (lo > hi) {
      if (document.activeElement === loEl) { lo = hi; loEl.value = lo; }
      else                                 { hi = lo; hiEl.value = hi; }
    }
    const rng = type === 'batch' ? batchRange : retireRange;
    rng.lo = lo; rng.hi = hi;
    syncSliderUI(type);
    applyFilters360();
  };

  window.resetRangeSliders = function () {
    batchRange  = { lo: batchExtent.min,  hi: batchExtent.max  };
    retireRange = { lo: retireExtent.min, hi: retireExtent.max };
    initSliderEl('batch',  batchExtent.min,  batchExtent.max,  batchExtent.min,  batchExtent.max);
    initSliderEl('retire', retireExtent.min, retireExtent.max, retireExtent.min, retireExtent.max);
    syncSliderUI('batch');
    syncSliderUI('retire');
  };

  // ── Apply all filters ──────────────────────────────────────────
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

    // Sort filtered list
    if (sortKey === 'seniority') {
      filtered.sort(([, a], [, b]) =>
        sortDir === 'asc'
          ? (a.meta.OfficerId || 0) - (b.meta.OfficerId || 0)
          : (b.meta.OfficerId || 0) - (a.meta.OfficerId || 0)
      );
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
          ? (a.scores?.[si] || 0) - (b.scores?.[si] || 0)
          : (b.scores?.[si] || 0) - (a.scores?.[si] || 0)
      );
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
    sortKey = 'seniority';
    sortDir = 'asc';
    weights = new Array(14).fill(1);
    const sel = document.getElementById('sortSelect360');
    if (sel) sel.value = 'seniority';
    const btn = document.getElementById('sortDirBtn');
    if (btn) btn.textContent = '↑ Asc';
  };

  // ── Weights popup ──────────────────────────────────────────────
  window.openWeightsPopup = function () {
    const body = document.getElementById('weightsBody');
    if (!body) return;
    body.innerHTML = WHEEL_CATS.map((cat, i) => `
      <div class="weight-row">
        <span class="weight-icon">${CAT_DETAILS[i]?.icon || '●'}</span>
        <span class="weight-label" style="color:${cat.color}">${esc(cat.label)}</span>
        <input type="range" class="weight-slider" id="wSlider${i}"
               min="0" max="10" step="1" value="${weights[i]}"
               style="accent-color:${cat.color}"
               oninput="document.getElementById('wVal${i}').textContent=this.value">
        <span class="weight-val" id="wVal${i}">${weights[i]}</span>
      </div>`).join('');
    const ov = document.getElementById('weightsOverlay');
    if (ov) ov.style.display = 'flex';
  };

  window.closeWeightsPopup = function () {
    const ov = document.getElementById('weightsOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.applyWeights = function () {
    WHEEL_CATS.forEach((_, i) => {
      const sl = document.getElementById('wSlider' + i);
      if (sl) weights[i] = parseInt(sl.value, 10);
    });
    closeWeightsPopup();
    sortKey = 'score_weighted';
    const sel = document.getElementById('sortSelect360');
    if (sel) sel.value = 'score_weighted';
    applyFilters360();
  };

  window.resetWeights = function () {
    weights = new Array(14).fill(1);
    WHEEL_CATS.forEach((_, i) => {
      const sl = document.getElementById('wSlider' + i);
      if (sl) sl.value = 1;
      const vl = document.getElementById('wVal' + i);
      if (vl) vl.textContent = '1';
    });
  };

  // ── Render grid ────────────────────────────────────────────────
  function renderGrid(entries) {
    const grid  = document.getElementById('grid360');
    const count = document.getElementById('count360');
    if (count) count.textContent = entries.length + ' Officers';

    if (!entries.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;
          font-size:14px;color:#64748b;">No officers match the selected filters.</div>`;
      return;
    }

    const isWeighted = sortKey === 'score_weighted';
    const scoreIdx   = (!isWeighted && sortKey.startsWith('score_'))
      ? parseInt(sortKey.replace('score_', ''), 10) : -1;

    grid.innerHTML = entries.map(([name, grpData], idx) => {
      const { meta } = grpData;
      const identityNo = String(meta['IdentityNo.'] || '').trim();
      const imgUrl     = photoMap[identityNo] || 'https://placehold.co/105x86?text=No+Photo';
      const batch      = meta.AllotmentYear || '—';
      const color      = cadreColor(meta.Cadre);

      let scoreVal = null, scoreColor = '', scoreLabel = '';
      if (isWeighted && grpData.scores) {
        scoreVal   = computeWeightedScore(grpData.scores).toFixed(2);
        scoreColor = '#4f46e5';
        scoreLabel = 'Weighted';
      } else if (scoreIdx >= 0 && grpData.scores) {
        scoreVal   = grpData.scores[scoreIdx].toFixed(2);
        scoreColor = WHEEL_CATS[scoreIdx].color;
        scoreLabel = WHEEL_CATS[scoreIdx].label;
      }

      return `<div class="c360" data-name="${escAttr(name)}" data-seq="${idx + 1}"
                   style="border-top-color:${color}">
        <img src="${imgUrl}" alt="${escAttr(name)}"
             onerror="this.src='https://placehold.co/105x86?text=No+Photo'" loading="lazy">
        <div class="c360-body">
          <div class="c360-sno">#${idx + 1}</div>
          <div class="c360-name">${esc(name)}</div>
          <div class="c360-batch">${esc(batch)}</div>
          ${scoreVal !== null ? `<div class="c360-score" style="background:${scoreColor}18;color:${scoreColor}">${esc(scoreLabel)}: <strong>${scoreVal}</strong></div>` : ''}
        </div>
      </div>`;
    }).join('');

    // Click → officer detail popup
    grid.querySelectorAll('.c360').forEach(card => {
      card.addEventListener('click', () =>
        openOfficerDetail(card.getAttribute('data-name'), card.getAttribute('data-seq'))
      );
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Officer Detail Popup ───────────────────────────────────────
  function openOfficerDetail(name, seqNo) {
    const entry = allOfficers.find(([n]) => n === name);
    if (!entry) return;
    const [, { meta, services }] = entry;

    // Photo
    const identityNo = String(meta['IdentityNo.'] || '').trim();
    const imgUrl = photoMap[identityNo] || '';
    const ph = document.getElementById('detailPhoto');
    ph.src = imgUrl || 'https://placehold.co/90x90?text=?';
    ph.onerror = () => { ph.src = 'https://placehold.co/90x90?text=?'; };

    // Name / cadre strip
    function abbrevSOR(s) {
      return (s || '').split(/\s+/).map(w => w[0]).join('').toUpperCase() || 'DR';
    }
    const year = meta.AllotmentYear || '—';
    const sor  = abbrevSOR(meta.SourceOfRecruitment);
    document.getElementById('detailName').textContent = name;
    document.getElementById('detailCadre').textContent =
      [meta.Cadre, 'Batch ' + year, sor].filter(Boolean).join('  ·  ');

    // Basic detail grid
    document.getElementById('detailGrid').innerHTML =
      row2('Current Posting', meta.currentposting || meta.PostName || '—') +
      row2('Date of Birth',   fmtDate(meta.DateOfBirth)) +
      row2('Retirement',      calcRetirementDate(meta.DateOfBirth)) +
      row2('Date of Appt.',   fmtDate(meta.DateofAppointment)) +
      row2('Domicile',        meta.Domicile || '—') +
      row2('Qualification',   meta.EducationalQualification || '—') +
      (meta.EmailId ? row2('Email', meta.EmailId) : '') +
      (meta.PhoneNo ? row2('Phone', meta.PhoneNo) : '');

    function row2(label, val) {
      return `<div class="dfield"><strong>${esc(label)}:</strong> ${esc(String(val ?? '—'))}</div>`;
    }

    // Aggregate service data
    const deptMap = {}, catMap = {}, hcmData = {};
    services.forEach(sv => {
      const yrs = sv.Years || calcYears(sv.From, sv.To);
      const dept = (sv.Department || '').trim();
      const cat  = (sv.Category   || '').trim();
      const hcm  = (sv.HCM        || '').trim();
      if (dept) deptMap[dept] = (deptMap[dept] || 0) + yrs;
      if (cat)  catMap[cat]   = (catMap[cat]   || 0) + yrs;
      if (hcm) {
        if (!hcmData[hcm]) hcmData[hcm] = { years: 0 };
        hcmData[hcm].years += yrs;
      }
    });

    // Build bar-chart panel HTML
    function buildBars(map) {
      const rows = Object.entries(map).sort((a, b) => b[1] - a[1]);
      if (!rows.length) return '<p class="dno-data">No data available</p>';
      const maxY = rows[0][1];
      return rows.map(([label, yrs]) => {
        const pct = (yrs / maxY * 100).toFixed(1);
        return `<div class="dsvc-row">
          <div class="dsvc-label" title="${escAttr(label)}">${esc(label)}</div>
          <div class="dsvc-track"><div class="dsvc-bar" style="width:${pct}%"></div></div>
          <div class="dsvc-yrs">${fmtYears(yrs)}</div>
        </div>`;
      }).join('');
    }

    document.getElementById('detailPanelDept').innerHTML = buildBars(deptMap);
    document.getElementById('detailPanelCat').innerHTML  = buildBars(catMap);

    // Shared avatar helpers (reused in HCM grid and Service Record)
    function hcmInitials(n) {
      const words = n.split(/\s+/).filter(Boolean);
      return (words.length >= 2
        ? words[words.length - 2][0] + words[words.length - 1][0]
        : (words[0] || '?')[0]
      ).toUpperCase();
    }
    function hcmBg(n) {
      let h = 0;
      for (const c of n) h = c.charCodeAt(0) + ((h << 5) - h);
      const p = ['#d97706','#b45309','#92400e','#c2410c','#b91c1c','#7c3aed','#0f766e','#1d4ed8','#15803d','#0e7490'];
      return p[Math.abs(h) % p.length];
    }
    function makeAvatar(hcm, size) {
      const photoUrl = hcmPhotoMap[hcm] || '';
      const bg       = hcmBg(hcm);
      const inits    = hcmInitials(hcm);
      const fz       = size <= 36 ? 11 : 16;
      const inner    = photoUrl
        ? `<img src="${escAttr(photoUrl)}" alt="${escAttr(hcm)}">`
        : `<span style="color:#fffbeb;font-size:${fz}px;font-weight:900">${esc(inits)}</span>`;
      return { bg, inner };
    }

    // HCM summary grid
    const hcmRows = Object.entries(hcmData).sort((a, b) => b[1].years - a[1].years);
    document.getElementById('detailPanelHcm').innerHTML = hcmRows.length
      ? `<div class="dhcm-grid">${hcmRows.map(([hcm, d]) => {
          const { bg, inner } = makeAvatar(hcm, 54);
          return `<div class="dhcm-card">
            <div class="dhcm-avatar" style="background:${bg}">${inner}</div>
            <div class="dhcm-name">${esc(hcm)}</div>
            <div class="dhcm-yrs">${fmtYears(d.years)}</div>
          </div>`;
        }).join('')}</div>`
      : '<p class="dno-data">No Chief Minister data available</p>';

    // Service Record — chronological timeline, most recent first
    const svcSorted = [...services].sort((a, b) => {
      const da = parseDate(a.From || ''), db = parseDate(b.From || '');
      const ta = isNaN(da.getTime()) ? 0 : da.getTime();
      const tb = isNaN(db.getTime()) ? 0 : db.getTime();
      return tb - ta;
    });

    document.getElementById('detailPanelSvc').innerHTML = svcSorted.length
      ? `<div class="dsvc-timeline">${svcSorted.map(sv => {
          const hcm      = (sv.HCM || '').trim();
          const fromStr  = fmtDate(sv.From);
          const toStr    = sv.To ? fmtDate(sv.To) : 'Present';
          const dur      = fmtYears(sv.Years || calcYears(sv.From, sv.To));
          const post     = sv.PostName   || '—';
          const dept     = (sv.Department || '').trim();
          const cat      = (sv.Category   || '').trim();
          const { bg, inner } = hcm
            ? makeAvatar(hcm, 38)
            : { bg: '#92400e', inner: `<span style="color:#fffbeb;font-size:11px;font-weight:900">—</span>` };
          const tags = [dept, cat].filter(Boolean)
            .map(t => `<span class="dsvc-rec-tag">${esc(t)}</span>`).join('');
          return `<div class="dsvc-record">
            <div class="dsvc-rec-avatar" style="background:${bg}" title="${escAttr(hcm)}">${inner}</div>
            <div class="dsvc-rec-period">
              <div class="dsvc-rec-from">${esc(fromStr)} → ${esc(toStr)}</div>
              <div class="dsvc-rec-dur">${esc(dur)}</div>
            </div>
            <div class="dsvc-rec-info">
              <div class="dsvc-rec-post" title="${escAttr(post)}">${esc(post)}</div>
              <div class="dsvc-rec-tags">${tags}</div>
              ${hcm ? `<div class="dsvc-rec-cm">${esc(hcm)}</div>` : ''}
            </div>
          </div>`;
        }).join('')}</div>`
      : '<p class="dno-data">No service records available</p>';

    // Reset to first tab
    document.querySelectorAll('.detail-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
    document.querySelectorAll('.detail-tab-panel').forEach((p, i) => p.classList.toggle('active', i === 0));

    // Wire "View 360° Wheel" button
    document.getElementById('detailBtnWheel').onclick = function () {
      closeDetail();
      open360Wheel(name, seqNo);
    };

    document.getElementById('detailOverlay').classList.add('open');
  }

  function closeDetail() {
    document.getElementById('detailOverlay').classList.remove('open');
  }
  document.getElementById('detailClose').addEventListener('click', closeDetail);
  document.getElementById('detailOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeDetail();
  });

  window.switchDetailTab = function (which) {
    const map = { dept: 0, cat: 1, hcm: 2, svc: 3 };
    const idx = map[which] ?? 0;
    document.querySelectorAll('.detail-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
    document.querySelectorAll('.detail-tab-panel').forEach((p, i) => p.classList.toggle('active', i === idx));
  };

  // ── 360° Wheel popup ──────────────────────────────────────────
  function open360Wheel(name, seqNo) {
    const entry = allOfficers.find(([n]) => n === name);
    if (!entry) return;
    const [, grp] = entry;
    const { meta } = grp;

    const identityNo = String(meta['IdentityNo.'] || '').trim();
    const imgUrl = photoMap[identityNo] || '';

    // Use pre-assigned stable scores; fallback to random if missing
    const scores = (grp.scores && grp.scores.length === WHEEL_CATS.length)
      ? grp.scores
      : WHEEL_CATS.map(() => parseFloat((Math.random() * 9.5 + 0.5).toFixed(2)));

    // Cross-officer per-category ranks (rank among all loaded officers)
    const ranks = (grp.catRanks && grp.catRanks.length === WHEEL_CATS.length)
      ? grp.catRanks
      : scores.map((_, i) => i + 1); // plain fallback

    const avg    = (scores.reduce((a, v) => a + v, 0) / WHEEL_CATS.length).toFixed(2);
    const totalN = grp.totalOfficers || allOfficers.length || 1;

    // Store for segment detail panel; clear any floating cards from previous officer
    currentWheelData = { scores, ranks, totalOfficers: totalN };
    activeSegSet.clear();
    document.getElementById('wheelOverlay').querySelectorAll('.sdp-card').forEach(function(c){ c.remove(); });

    // Overall rank based on avg score among all loaded officers
    const overallRank = grp.overallRank || '—';

    // Abbreviate Source of Recruitment to initials
    function abbrevSOR(s) {
      return (s || '').split(/\s+/).map(w => w[0]).join('').toUpperCase() || 'DR';
    }

    const year = meta.AllotmentYear || '—';
    const sor  = abbrevSOR(meta.SourceOfRecruitment);

    // Header: Name (Year: SOR) on top, rank+avg badges below
    document.getElementById('wheelName').innerHTML =
      esc(name) + ' <span class="wheel-batch">(' + esc(String(year)) + ': ' + esc(sor) + ')</span>';
    document.getElementById('wheelRankBadge').textContent = 'Overall Rank #' + overallRank + ' of ' + totalN;
    document.getElementById('wheelAvgBadge').textContent  = 'Avg Score: ' + avg + '/10';

    // ── SVG constants ─────────────────────────────────────────────
    const CX = 320, CY = 320;
    const RP = 76, RPG = 86;
    const RI = 104, RO = 207;
    const RL = 248;
    const N = WHEEL_CATS.length;
    const STEP = 360 / N;
    const GAP  = 2.6;

    function hexDarken(hex, t) {
      const n = parseInt(hex.replace('#', ''), 16);
      return '#' + [n >> 16, (n >> 8) & 255, n & 255]
        .map(c => Math.round(c * (1 - t)).toString(16).padStart(2, '0')).join('');
    }

    function rad(d) { return d * Math.PI / 180; }
    function pt(r, deg) { return [CX + r * Math.cos(rad(deg)), CY + r * Math.sin(rad(deg))]; }
    function f(n) { return n.toFixed(2); }
    function arcPath(ri, ro, a1, a2) {
      const [x1, y1] = pt(ro, a1), [x2, y2] = pt(ro, a2);
      const [x3, y3] = pt(ri, a2), [x4, y4] = pt(ri, a1);
      const lg = (a2 - a1) > 180 ? 1 : 0;
      return `M ${f(x1)} ${f(y1)} A ${ro} ${ro} 0 ${lg} 1 ${f(x2)} ${f(y2)} ` +
             `L ${f(x3)} ${f(y3)} A ${ri} ${ri} 0 ${lg} 0 ${f(x4)} ${f(y4)} Z`;
    }
    function textAnchor(deg) {
      const c = Math.cos(rad(deg));
      return c > 0.28 ? 'start' : c < -0.28 ? 'end' : 'middle';
    }

    // ── Build SVG ─────────────────────────────────────────────────
    const vigStart = (RI * 0.80 / RO).toFixed(3);
    const hlBefore = ((RI - 8) / RO).toFixed(3);
    const hlPeak   = (RI / RO).toFixed(3);
    const hlAfter  = ((RI + 22) / RO).toFixed(3);

    let s = `<defs>
      <filter id="wGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="wBarShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="3" stdDeviation="3" flood-color="rgba(60,20,0,0.55)"/>
      </filter>
      <filter id="wShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#451a03" flood-opacity="0.75"/>
      </filter>
      <filter id="wPhotoGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <clipPath id="wPC"><circle cx="${CX}" cy="${CY}" r="${RP}"/></clipPath>
      <radialGradient id="wDarkVig" cx="${CX}" cy="${CY}" r="${RO}" gradientUnits="userSpaceOnUse">
        <stop offset="${vigStart}" stop-color="rgba(0,0,0,0)"/>
        <stop offset="1"          stop-color="rgba(0,0,0,0.62)"/>
      </radialGradient>
      <radialGradient id="wRimHL" cx="${CX}" cy="${CY}" r="${RO}" gradientUnits="userSpaceOnUse">
        <stop offset="${hlBefore}" stop-color="rgba(255,255,255,0)"/>
        <stop offset="${hlPeak}"   stop-color="rgba(255,255,255,0.60)"/>
        <stop offset="${hlAfter}"  stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
      <radialGradient id="wGloss" cx="${CX}" cy="${CY}" r="${RO}" gradientUnits="userSpaceOnUse">
        <stop offset="${hlPeak}"                        stop-color="rgba(255,255,255,0.30)"/>
        <stop offset="${((RI + 42) / RO).toFixed(3)}"  stop-color="rgba(255,255,255,0.10)"/>
        <stop offset="${((RI + 70) / RO).toFixed(3)}"  stop-color="rgba(255,255,255,0)"/>
      </radialGradient>`;

    // Per-segment base gradient
    WHEEL_CATS.forEach((cat, i) => {
      const mid = -90 + (i + 0.5) * STEP;
      const [gx1, gy1] = pt(RI, mid), [gx2, gy2] = pt(RO, mid);
      const veryDark = hexDarken(cat.color, 0.52);
      s += `<linearGradient id="wG${i}" x1="${f(gx1)}" y1="${f(gy1)}"
                             x2="${f(gx2)}" y2="${f(gy2)}" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stop-color="${cat.light}"  stop-opacity="1"/>
        <stop offset="32%"  stop-color="${cat.color}"  stop-opacity="1"/>
        <stop offset="100%" stop-color="${veryDark}"   stop-opacity="1"/>
      </linearGradient>`;
    });
    s += `</defs>`;

    // Each segment wrapped in a hover group
    const scoreEls = [];
    WHEEL_CATS.forEach((cat, i) => {
      const a1  = -90 + i * STEP + GAP / 2;
      const a2  = -90 + (i + 1) * STEP - GAP / 2;
      const mid = (a1 + a2) / 2;
      const finalR = RI + (scores[i] / 10) * (RO - RI);

      // Radial unit vector for hover translation
      const hx = (8 * Math.cos(rad(mid))).toFixed(3);
      const hy = (8 * Math.sin(rad(mid))).toFixed(3);

      s += `<g id="wGroup${i}" class="seg-group" data-hx="${hx}" data-hy="${hy}"
              style="cursor:pointer;transition:transform 0.22s cubic-bezier(.34,1.56,.64,1),filter 0.22s ease">`;

      // Layer 1: dim background
      s += `<path d="${arcPath(RI, RO, a1, a2)}" fill="${cat.color}" opacity="0.10"/>`;

      // Layer 2: animated score bar
      s += `<path id="wSeg${i}" d="${arcPath(RI, RI + 1, a1, a2)}"
              fill="url(#wG${i})" filter="url(#wBarShadow)"/>`;
      scoreEls.push({ i, a1, a2, finalR });

      // Layer 3: dark outer vignette (co-animated)
      s += `<path id="wVig${i}" d="${arcPath(RI, RI + 1, a1, a2)}" fill="url(#wDarkVig)"/>`;

      // Layer 4: inner rim highlight (co-animated)
      s += `<path id="wHL${i}"  d="${arcPath(RI, RI + 1, a1, a2)}" fill="url(#wRimHL)"/>`;

      // Layer 5: gloss sheen (co-animated, inner 44 %)
      s += `<path id="wGls${i}" d="${arcPath(RI, RI + 1, a1, a2)}" fill="url(#wGloss)"/>`;

      // Layer 6: outer accent strip
      const [ax1, ay1] = pt(RO + 3, a1 + 0.6), [ax2, ay2] = pt(RO + 3, a2 - 0.6);
      const [ax3, ay3] = pt(RO + 9, a2 - 0.6), [ax4, ay4] = pt(RO + 9, a1 + 0.6);
      s += `<path d="M ${f(ax1)} ${f(ay1)} A ${RO+3} ${RO+3} 0 0 1 ${f(ax2)} ${f(ay2)} ` +
           `L ${f(ax3)} ${f(ay3)} A ${RO+9} ${RO+9} 0 0 0 ${f(ax4)} ${f(ay4)} Z" ` +
           `fill="${cat.color}" opacity="0.9"/>` +
           `<path d="M ${f(ax1)} ${f(ay1)} A ${RO+3} ${RO+3} 0 0 1 ${f(ax2)} ${f(ay2)} ` +
           `L ${f(ax3)} ${f(ay3)} A ${RO+9} ${RO+9} 0 0 0 ${f(ax4)} ${f(ay4)} Z" ` +
           `fill="url(#wRimHL)" opacity="0.6"/>`;

      // Inner text: Rank / Score label / value
      const [tx, ty] = pt(RI + (RO - RI) * 0.5, mid);
      s += `<text id="wSR${i}" x="${f(tx)}" y="${f(ty - 10)}" text-anchor="middle"
              font-size="14" font-weight="900" fill="white" filter="url(#wShadow)"
              style="opacity:0;transition:opacity 0.4s ease">Rank ${ranks[i]}</text>`;
      s += `<text id="wSL${i}" x="${f(tx)}" y="${f(ty + 3)}" text-anchor="middle"
              font-size="8" font-weight="800" fill="${cat.light}" letter-spacing="0.6"
              filter="url(#wShadow)" style="opacity:0;transition:opacity 0.4s ease">Score</text>`;
      s += `<text id="wST${i}" x="${f(tx)}" y="${f(ty + 14)}" text-anchor="middle"
              font-size="13" font-weight="900" fill="white" filter="url(#wShadow)"
              style="opacity:0;transition:opacity 0.4s ease">${scores[i].toFixed(2)}</text>`;

      // Outer label
      const [lx, ly] = pt(RL, mid);
      const ta = textAnchor(mid);
      s += `<text id="wLbl${i}" x="${f(lx)}" y="${f(ly)}" text-anchor="${ta}"
              font-size="11" font-weight="800" fill="#78350f" dy="0.35em"
              style="opacity:0;transition:opacity 0.4s ease,font-size 0.2s ease,fill 0.2s ease">${cat.label}</text>`;

      s += `</g>`;
    });

    // Separator lines (outside hover groups, always on top of arcs)
    for (let i = 0; i < N; i++) {
      const a = -90 + i * STEP;
      const [sx1, sy1] = pt(RI - 1, a), [sx2, sy2] = pt(RO + 9, a);
      s += `<line x1="${f(sx1)}" y1="${f(sy1)}" x2="${f(sx2)}" y2="${f(sy2)}"
               stroke="rgba(120,53,15,0.45)" stroke-width="1.6"/>`;
    }

    // Outer ring tick marks
    WHEEL_CATS.forEach((_, i) => {
      const mid = -90 + (i + 0.5) * STEP;
      const [tx1, ty1] = pt(RO + 10, mid), [tx2, ty2] = pt(RO + 16, mid);
      s += `<line x1="${f(tx1)}" y1="${f(ty1)}" x2="${f(tx2)}" y2="${f(ty2)}"
               stroke="rgba(180,83,9,0.5)" stroke-width="1.5"/>`;
    });

    // Inner hole
    s += `<circle cx="${CX}" cy="${CY}" r="${RI}" fill="#fef9c3" stroke="rgba(245,158,11,0.35)" stroke-width="1.5"/>`;

    // Photo pulse rings
    s += `<circle cx="${CX}" cy="${CY}" r="${RPG}" fill="none" stroke="#f59e0b" stroke-width="2.5" opacity="0.4"
            filter="url(#wPhotoGlow)">
        <animate attributeName="r" values="${RPG-5};${RPG+6};${RPG-5}" dur="2.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.25;0.65;0.25" dur="2.8s" repeatCount="indefinite"/>
      </circle>`;
    s += `<circle cx="${CX}" cy="${CY}" r="${RPG + 9}" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.2">
        <animate attributeName="r" values="${RPG+4};${RPG+16};${RPG+4}" dur="2.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.18;0;0.18" dur="2.8s" repeatCount="indefinite"/>
      </circle>`;

    // Photo image
    if (imgUrl) {
      s += `<image href="${imgUrl}" x="${CX - RP}" y="${CY - RP}" width="${RP * 2}" height="${RP * 2}"
              clip-path="url(#wPC)" preserveAspectRatio="xMidYMid slice"/>`;
    } else {
      s += `<circle cx="${CX}" cy="${CY}" r="${RP}" fill="#fef3c7"/>
            <text x="${CX}" y="${CY + 14}" text-anchor="middle" font-size="52" dominant-baseline="middle">👤</text>`;
    }

    // Photo border rings
    s += `<circle cx="${CX}" cy="${CY}" r="${RP + 2}" fill="none" stroke="#d97706" stroke-width="3"/>`;
    s += `<circle cx="${CX}" cy="${CY}" r="${RP + 6}" fill="none" stroke="rgba(245,158,11,0.3)" stroke-width="1.5"/>`;

    // Center badge: Rank + Avg, positioned near photo bottom edge (inside inner hole)
    const bcy = CY + RP + 3;
    s += `<rect x="${CX - 52}" y="${bcy - 9}" width="104" height="37" rx="18" ry="18"
            fill="#451a03" stroke="#f59e0b" stroke-width="1.5" opacity="0.95"/>
          <text x="${CX}" y="${bcy + 5}" text-anchor="middle" font-size="12" font-weight="900"
            fill="#fde68a">Rank #${overallRank} / ${totalN}</text>
          <text id="wAvg" x="${CX}" y="${bcy + 19}" text-anchor="middle" font-size="10"
            font-weight="700" fill="#fcd34d">Avg: 0.00/10</text>`;

    document.getElementById('wheelSvg').innerHTML = s;

    // ── Hover + click animations on segment groups ───────────────
    document.querySelectorAll('#wheelSvg .seg-group').forEach(function (g) {
      const hx = parseFloat(g.dataset.hx || '0');
      const hy = parseFloat(g.dataset.hy || '0');
      g.addEventListener('mouseenter', function () {
        g.style.transform = 'translate(' + hx + 'px,' + hy + 'px)';
        g.style.filter = 'brightness(1.4) drop-shadow(0 0 10px rgba(255,210,60,0.8))';
        const lbl = g.querySelector('[id^="wLbl"]');
        if (lbl) { lbl.style.fontSize = '13px'; lbl.style.fill = '#92400e'; lbl.style.fontWeight = '900'; }
      });
      g.addEventListener('mouseleave', function () {
        const idx = parseInt(g.id.replace('wGroup', ''), 10);
        if (activeSegSet.has(idx)) return; // keep open segments pushed out
        g.style.transform = 'translate(0,0)';
        g.style.filter = '';
        const lbl = g.querySelector('[id^="wLbl"]');
        if (lbl) { lbl.style.fontSize = '11px'; lbl.style.fill = '#78350f'; lbl.style.fontWeight = '800'; }
      });
      g.addEventListener('click', function (e) {
        e.stopPropagation();
        const idx = parseInt(g.id.replace('wGroup', ''), 10);
        openSegDetail(idx);
      });
    });

    // ── Animate arcs growing from RI outward ──────────────────────
    const ANIM_DUR = 1100;
    const t0 = performance.now();
    function easeOut3(t) { return 1 - Math.pow(1 - t, 3); }

    function animTick(now) {
      const t = Math.min((now - t0) / ANIM_DUR, 1);
      scoreEls.forEach(({ i, a1, a2, finalR }) => {
        const delay = i / N * 0.52;
        const ti = Math.max(0, (t - delay) / (1 - delay));
        const e  = easeOut3(Math.min(ti, 1));
        const r  = RI + e * (finalR - RI);
        const d  = arcPath(RI, Math.max(RI + 1, r), a1, a2);
        const segEl = document.getElementById('wSeg' + i);
        if (segEl) segEl.setAttribute('d', d);
        ['wVig', 'wHL'].forEach(p => {
          const ov = document.getElementById(p + i);
          if (ov) ov.setAttribute('d', d);
        });
        const rGls = RI + e * (finalR - RI) * 0.44;
        const glsEl = document.getElementById('wGls' + i);
        if (glsEl) glsEl.setAttribute('d', arcPath(RI, Math.max(RI + 1, rGls), a1, a2));
      });
      if (t < 1) { requestAnimationFrame(animTick); return; }

      // Labels fade in with stagger
      for (let i = 0; i < N; i++) {
        setTimeout(() => {
          ['wSR', 'wSL', 'wST', 'wLbl'].forEach(p => {
            const el = document.getElementById(p + i);
            if (el) el.style.opacity = '1';
          });
        }, i * 38);
      }

      // Count up avg in center badge
      const avgVal = parseFloat(avg);
      const ct0 = performance.now();
      (function countUp(now2) {
        const t2 = Math.min((now2 - ct0) / 750, 1);
        const el = document.getElementById('wAvg');
        if (el) el.textContent = 'Avg: ' + (easeOut3(t2) * avgVal).toFixed(2) + '/10';
        if (t2 < 1) requestAnimationFrame(countUp);
      })(performance.now());
    }
    requestAnimationFrame(animTick);

    // Show overlay
    document.getElementById('wheelOverlay').classList.add('open');
  }

  // ── Segment detail panel (multi-card stack) ───────────────────
  function openSegDetail(i) {
    const cat = WHEEL_CATS[i];
    const det = CAT_DETAILS[i];
    if (!cat || !det) return;

    // Toggle: clicking an open segment closes its card
    if (activeSegSet.has(i)) {
      closeSegCard(i);
      return;
    }

    const score = currentWheelData.scores[i] || 0;
    const rank  = currentWheelData.ranks[i]  || '—';
    const N     = currentWheelData.totalOfficers || allOfficers.length || '?';

    activeSegSet.add(i);

    // Push segment further out to show it's selected
    const grp = document.getElementById('wGroup' + i);
    if (grp) {
      const hx = parseFloat(grp.dataset.hx || '0');
      const hy = parseFloat(grp.dataset.hy || '0');
      grp.style.transform = 'translate(' + (hx * 1.7) + 'px,' + (hy * 1.7) + 'px)';
      grp.style.filter = 'brightness(1.7) drop-shadow(0 0 16px rgba(255,200,40,1))';
    }

    // Alternating inner/outer rings so adjacent cards don't overlap
    const svg = document.getElementById('wheelSvg');
    const svgRect = svg.getBoundingClientRect();
    const scale = svgRect.width / 640;
    const midAngle = (-90 + (i + 0.5) * (360 / 14)) * Math.PI / 180;
    const R = (i % 2 === 0) ? 440 : 530; // even → inner ring, odd → outer ring
    const rawX = svgRect.left + (320 + R * Math.cos(midAngle)) * scale;
    const rawY = svgRect.top  + (320 + R * Math.sin(midAngle)) * scale;
    const CARD_W = 240, CARD_H = 200;
    const vw = window.innerWidth, vh = window.innerHeight;
    const cx = Math.max(CARD_W / 2 + 8, Math.min(vw - CARD_W / 2 - 8, rawX));
    const cy = Math.max(CARD_H / 2 + 8, Math.min(vh - CARD_H / 2 - 8, rawY));

    // Mini card: top 3 metrics only — full details open on card click
    const miniMetrics = det.metrics.slice(0, 3).map(function (m) {
      return '<div class="sdp-metric-row">' +
        '<div class="sdp-metric-label" title="' + m.label + '">' + m.label + '</div>' +
        '<div class="sdp-metric-track">' +
          '<div class="sdp-metric-bar" data-val="' + m.val + '" style="background:' + cat.color + '"></div>' +
        '</div>' +
        '<div class="sdp-metric-val">' + m.val + '%</div>' +
      '</div>';
    }).join('');

    // Create mini card
    const card = document.createElement('div');
    card.className = 'sdp-card';
    card.dataset.segIdx = i;
    card.style.setProperty('--sdp-color', cat.color);
    card.style.left = cx + 'px';
    card.style.top  = cy + 'px';
    card.innerHTML =
      '<button class="sdp-close">&#10006;</button>' +
      '<div class="sdp-header">' +
        '<div class="sdp-icon-wrap" style="background:' + cat.color + '">' + det.icon + '</div>' +
        '<div class="sdp-title-group">' +
          '<div class="sdp-title">' + cat.label + '</div>' +
          '<div class="sdp-score-badge" style="background:' + cat.color + '">Score: ' + score.toFixed(2) + ' / 10</div>' +
          '<div class="sdp-rank-badge" style="color:' + cat.color + '">Rank #' + rank + ' of ' + N + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sdp-source">&#128204; ' + det.source + '</div>' +
      '<div class="sdp-sec-title">Top Metrics <span class="sdp-demo-tag">DEMO</span></div>' +
      miniMetrics +
      '<div class="sdp-expand-hint">&#8599; Click for full breakdown</div>';

    // ✖ closes this mini card (toggles segment off)
    card.querySelector('.sdp-close').addEventListener('click', function (e) {
      e.stopPropagation();
      closeSegCard(i);
    });

    // Body click → open full detail popup
    card.addEventListener('click', function (e) {
      if (e.target.closest('.sdp-close')) return;
      e.stopPropagation();
      openSegPopup(i);
    });

    document.getElementById('wheelOverlay').appendChild(card);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        card.querySelectorAll('.sdp-metric-bar').forEach(function (bar) {
          bar.style.width = bar.dataset.val + '%';
        });
      });
    });
  }

  function openSegPopup(i) {
    const cat = WHEEL_CATS[i];
    const det = CAT_DETAILS[i];
    if (!cat || !det) return;

    const score = currentWheelData.scores[i] || 0;
    const rank  = currentWheelData.ranks[i]  || '—';
    const N     = currentWheelData.totalOfficers || allOfficers.length || '?';

    // Remove any existing popup first
    const overlay = document.getElementById('wheelOverlay');
    const existingBg = overlay.querySelector('.sdp-popup-bg');
    if (existingBg) existingBg.remove();

    // Build all 5 metric rows
    const metricsHtml = det.metrics.map(function (m) {
      return '<div class="sdp-popup-metric">' +
        '<div class="sdp-popup-mlabel">' + m.label + '</div>' +
        '<div class="sdp-popup-mtrack">' +
          '<div class="sdp-popup-mbar" data-val="' + m.val + '" style="background:' + cat.color + '"></div>' +
        '</div>' +
        '<div class="sdp-popup-mval">' + m.val + '%</div>' +
      '</div>';
    }).join('');

    const bg = document.createElement('div');
    bg.className = 'sdp-popup-bg';

    const popup = document.createElement('div');
    popup.className = 'sdp-popup';
    popup.style.setProperty('--sdp-color', cat.color);
    popup.innerHTML =
      '<button class="sdp-popup-close">&#10006;</button>' +
      '<div class="sdp-popup-header">' +
        '<div class="sdp-popup-icon" style="background:' + cat.color + '">' + det.icon + '</div>' +
        '<div>' +
          '<div class="sdp-popup-name">' + cat.label + '</div>' +
          '<div class="sdp-popup-score" style="background:' + cat.color + '">Score: ' + score.toFixed(2) + ' / 10</div>' +
        '</div>' +
      '</div>' +
      '<div class="sdp-popup-body">' +
        '<div class="sdp-popup-source">&#128204; ' + det.source + '</div>' +
        '<div class="sdp-popup-desc">' + det.desc + '</div>' +
        '<div class="sdp-popup-sec">Score Components <span class="sdp-popup-demo">DEMO DATA</span></div>' +
        metricsHtml +
      '</div>' +
      '<div class="sdp-popup-footer">' +
        '<span class="sdp-popup-rank-label">Rank in ' + cat.label + '</span>' +
        '<span class="sdp-popup-rank-val" style="background:' + cat.color + '">#' + rank + ' of ' + N + '</span>' +
      '</div>';

    function closePopup() { bg.remove(); }

    popup.querySelector('.sdp-popup-close').addEventListener('click', function (e) {
      e.stopPropagation(); closePopup();
    });
    bg.addEventListener('click', function (e) {
      if (e.target === bg) closePopup();
    });
    popup.addEventListener('click', function (e) { e.stopPropagation(); });

    bg.appendChild(popup);
    overlay.appendChild(bg);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        popup.querySelectorAll('.sdp-popup-mbar').forEach(function (bar) {
          bar.style.width = bar.dataset.val + '%';
        });
      });
    });
  }

  function closeSegCard(i) {
    const overlay = document.getElementById('wheelOverlay');
    if (overlay) {
      const card = overlay.querySelector('.sdp-card[data-seg-idx="' + i + '"]');
      if (card) card.remove();
    }
    activeSegSet.delete(i);
    const grp = document.getElementById('wGroup' + i);
    if (grp) {
      grp.style.transform = 'translate(0,0)';
      grp.style.filter = '';
      const lbl = grp.querySelector('[id^="wLbl"]');
      if (lbl) { lbl.style.fontSize = '11px'; lbl.style.fill = '#78350f'; lbl.style.fontWeight = '800'; }
    }
  }

  function closeAllSegCards() {
    const overlay = document.getElementById('wheelOverlay');
    if (overlay) {
      overlay.querySelectorAll('.sdp-card').forEach(function(c){ c.remove(); });
      overlay.querySelectorAll('.sdp-popup-bg').forEach(function(c){ c.remove(); });
    }
    activeSegSet.forEach(function (i) {
      const grp = document.getElementById('wGroup' + i);
      if (grp) {
        grp.style.transform = 'translate(0,0)';
        grp.style.filter = '';
        const lbl = grp.querySelector('[id^="wLbl"]');
        if (lbl) { lbl.style.fontSize = '11px'; lbl.style.fill = '#78350f'; lbl.style.fontWeight = '800'; }
      }
    });
    activeSegSet.clear();
  }

  // ── Wheel overlay close handlers ──────────────────────────────
  function closeWheel() {
    closeAllSegCards();
    document.getElementById('wheelOverlay').classList.remove('open');
  }
  document.getElementById('wheelClose').addEventListener('click', closeWheel);
  document.getElementById('wheelOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeWheel();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeWheel(); closeDetail(); }
  });

  // Close old photo-popup when clicking overlay background
  document.getElementById('photo-popup').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });

  // ── Utility functions ──────────────────────────────────────────
  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])
    );
  }

  function escAttr(text) {
    return String(text ?? '').replace(/[&<>"']/g, m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
    );
  }

  function parseDate(s) {
    if (!s || !String(s).trim()) return new Date(NaN);
    s = String(s).trim();
    let m;
    m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    const d = new Date(s);
    return isNaN(d) ? new Date(NaN) : d;
  }

  function calcYears(fromStr, toStr) {
    if (!fromStr || !String(fromStr).trim()) return 0;
    const from = parseDate(fromStr);
    const to   = (toStr && String(toStr).trim()) ? parseDate(toStr) : new Date();
    if (isNaN(from.getTime())) return 0;
    return Math.max(0, (to - from) / (365.25 * 24 * 60 * 60 * 1000));
  }

  function fmtYears(dec) {
    if (!dec || dec <= 0) return '—';
    const yrs = Math.floor(dec);
    const mos = Math.floor((dec - yrs) * 12);
    const parts = [];
    if (yrs) parts.push(`${yrs} yr${yrs !== 1 ? 's' : ''}`);
    if (mos) parts.push(`${mos} mo`);
    return parts.join(' ') || '< 1 mo';
  }

  function calcRetirementDate(dob) {
    if (!dob || !String(dob).trim()) return '—';
    const d = parseDate(String(dob));
    if (isNaN(d.getTime())) return '—';
    const ret = new Date(d.getFullYear() + 60, d.getMonth(), d.getDate());
    return ret.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function fmtDate(s) {
    if (!s || !String(s).trim()) return '—';
    const d = parseDate(String(s));
    if (isNaN(d.getTime())) return String(s);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

})(); // end IIFE
