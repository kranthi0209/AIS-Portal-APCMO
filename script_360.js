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
  let allOfficers = [];   // sorted Array of [name, {meta, services}]
  let photoMap    = {};
  let hcmPhotoMap = {};   // HCM name → photo URL
  let filtered    = [];   // current filtered subset

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
      loadPhotos(svc)
    ]).then(([rows, photos]) => {
      photoMap = photos;

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
    const cadres   = new Set();
    const sources  = new Set();
    const domiciles = new Set();

    allOfficers.forEach(([, { meta }]) => {
      if (meta.Cadre)               cadres.add(meta.Cadre.trim());
      if (meta.SourceOfRecruitment) sources.add(meta.SourceOfRecruitment.trim());
      if (meta.Domicile)            domiciles.add(meta.Domicile.trim());
    });

    fillSelect('fCadre',    [...cadres].sort(),    'All Cadres');
    fillSelect('fSource',   [...sources].sort(),   'All Sources');
    fillSelect('fDomicile', [...domiciles].sort(),  'All Domiciles');
  }

  function fillSelect(id, values, allLabel) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = `<option value="">${allLabel}</option>` +
      values.map(v => `<option value="${escAttr(v)}">${esc(v)}</option>`).join('');
  }

  // ── Apply all filters ──────────────────────────────────────────
  window.applyFilters360 = function () {
    const cadreVal  = (document.getElementById('fCadre')?.value      || '').trim();
    const sourceVal = (document.getElementById('fSource')?.value     || '').trim();
    const domVal    = (document.getElementById('fDomicile')?.value   || '').trim();
    const nameVal   = (document.getElementById('searchName360')?.value || '').trim().toLowerCase();

    filtered = allOfficers.filter(([name, { meta }]) => {
      if (cadreVal  && (meta.Cadre               || '').trim() !== cadreVal)  return false;
      if (sourceVal && (meta.SourceOfRecruitment || '').trim() !== sourceVal) return false;
      if (domVal    && (meta.Domicile            || '').trim() !== domVal)    return false;
      if (nameVal   && !name.toLowerCase().includes(nameVal))                 return false;
      return true;
    });

    renderGrid(filtered);
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

    grid.innerHTML = entries.map(([name, { meta }], idx) => {
      const identityNo = String(meta['IdentityNo.'] || '').trim();
      const imgUrl     = photoMap[identityNo] || 'https://placehold.co/105x86?text=No+Photo';
      const batch      = meta.AllotmentYear || '—';
      const color      = cadreColor(meta.Cadre);

      return `<div class="c360" data-name="${escAttr(name)}" data-seq="${idx + 1}"
                   style="border-top-color:${color}">
        <img src="${imgUrl}" alt="${escAttr(name)}"
             onerror="this.src='https://placehold.co/105x86?text=No+Photo'" loading="lazy">
        <div class="c360-body">
          <div class="c360-sno">#${idx + 1}</div>
          <div class="c360-name">${esc(name)}</div>
          <div class="c360-batch">${esc(batch)}</div>
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
    const [, { meta }] = entry;

    const identityNo = String(meta['IdentityNo.'] || '').trim();
    const imgUrl = photoMap[identityNo] || '';

    // Random scores (0.50–9.99) + per-category ranks 1-14
    const scores = WHEEL_CATS.map(() => parseFloat((Math.random() * 9.5 + 0.5).toFixed(2)));
    const sorted = [...scores].sort((a, b) => b - a);
    const ranks  = scores.map(s => sorted.indexOf(s) + 1);
    const avg    = (scores.reduce((a, v) => a + v, 0) / WHEEL_CATS.length).toFixed(2);

    // Overall rank: random 1-150 (independent of per-category ranks)
    const overallRank = Math.floor(Math.random() * 150) + 1;

    // Abbreviate Source of Recruitment to initials
    function abbrevSOR(s) {
      return (s || '').split(/\s+/).map(w => w[0]).join('').toUpperCase() || 'DR';
    }

    const year = meta.AllotmentYear || '—';
    const sor  = abbrevSOR(meta.SourceOfRecruitment);

    // Header: Name (Year: SOR) on top, rank+avg badges below
    document.getElementById('wheelName').innerHTML =
      esc(name) + ' <span class="wheel-batch">(' + esc(String(year)) + ': ' + esc(sor) + ')</span>';
    document.getElementById('wheelRankBadge').textContent = 'Overall Rank #' + overallRank;
    document.getElementById('wheelAvgBadge').textContent  = 'Weighted Avg: ' + avg + '/10';

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
            fill="#fde68a">Rank #${overallRank}</text>
          <text id="wAvg" x="${CX}" y="${bcy + 19}" text-anchor="middle" font-size="10"
            font-weight="700" fill="#fcd34d">Avg: 0.00/10</text>`;

    document.getElementById('wheelSvg').innerHTML = s;

    // ── Hover animations on segment groups ────────────────────────
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
        g.style.transform = 'translate(0,0)';
        g.style.filter = '';
        const lbl = g.querySelector('[id^="wLbl"]');
        if (lbl) { lbl.style.fontSize = '11px'; lbl.style.fill = '#78350f'; lbl.style.fontWeight = '800'; }
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

  // ── Wheel overlay close handlers ──────────────────────────────
  function closeWheel() {
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
