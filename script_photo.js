// ================================================================
// script_photo.js — Photo-tile view for AIS Dashboard
// Service type read from URL ?service=IAS|IPS|IFS
// ================================================================

(function () {

  // ----------------------------------------------------------------
  // Service type
  // ----------------------------------------------------------------
  const urlSvc     = new URLSearchParams(window.location.search).get('service');
  const serviceType = (urlSvc || (window.AIS_CONFIG && window.AIS_CONFIG.serviceType) || 'IAS').toUpperCase();

  // ----------------------------------------------------------------
  // HCM order (same across all services)
  // ----------------------------------------------------------------
  const customHCMOrder = [
    "Nedurumalli Janardhana Reddy",
    "Kotla Vijaya Bhaskara Reddy",
    "Nandamuri Taraka Rama Rao-3.0",
    "Nara Chandrababu Naidu-1.0",
    "Nara Chandrababu Naidu-2.0",
    "Yeduguri Sandinti Rajasekhara Reddy-1.0",
    "Yeduguri Sandinti Rajasekhara Reddy-2.0",
    "Konijeti Rosaiah",
    "Nallari Kiran Kumar Reddy",
    "Presidents Rule (Narasimhan)",
    "Nara Chandrababu Naidu-3.0",
    "Yeduguri Sandinti Jagan Mohan Reddy",
    "Nara Chandrababu Naidu-4.0"
  ];

  // ----------------------------------------------------------------
  // State
  // ----------------------------------------------------------------
  let groupedData        = {};
  let currentGroupedData = {};
  let photoMap           = {};

  // Retirement slider state (values = year*12 + month, 0-indexed)
  let retireGlobalMin = 0;
  let retireGlobalMax = 9999 * 12 + 11;
  let retireFilterMin = 0;
  let retireFilterMax = 9999 * 12 + 11;

  const RET_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ----------------------------------------------------------------
  // Bootstrap
  // ----------------------------------------------------------------
  document.getElementById('photoGrid').innerHTML =
    `<div style="grid-column:1/-1;text-align:center;padding:48px;font-size:15px;color:#6366f1;">
       &#8987; Loading data&hellip;
     </div>`;

  requireAuth().then(session => {
    if (!session) return;

    Promise.all([
      loadOfficerData(serviceType),
      loadPhotos(serviceType)
    ]).then(([officerData, photos]) => {
      photoMap = photos;

      // Group postings by officer — active only
      officerData.forEach(entry => {
        if (entry.is_retired || entry.is_transferred_from_ap) return;
        const name = (entry.NameoftheOfficer || '').trim();
        if (!name) return;
        if (!groupedData[name]) groupedData[name] = { meta: entry, services: [] };
        groupedData[name].services.push(entry);
      });

      // Use the posting with the lowest SeniorityNo as the meta record
      for (const [, grp] of Object.entries(groupedData)) {
        grp.meta = grp.services.reduce((a, b) =>
          parseInt(a.SeniorityNo) < parseInt(b.SeniorityNo) ? a : b
        );
      }

      // Sort by SeniorityNo
      const sorted = {};
      Object.entries(groupedData)
        .sort(([, a], [, b]) => (parseInt(a.meta.SeniorityNo) || 9999) - (parseInt(b.meta.SeniorityNo) || 9999))
        .forEach(([k, v]) => { sorted[k] = v; });
      groupedData        = sorted;
      currentGroupedData = Object.assign({}, groupedData);

      // Collect HCMs
      const hcmSet = new Set();
      officerData.forEach(e => { if (e.HCM?.trim()) hcmSet.add(e.HCM.trim()); });

      populateHCMCheckboxes(Array.from(hcmSet).sort());
      initRetirementSlider();
      renderPhotoGrid(currentGroupedData);

    }).catch(err => {
      document.getElementById('photoGrid').innerHTML =
        `<div style="grid-column:1/-1;text-align:center;padding:40px;font-size:14px;color:#dc2626;">
           &#10060; Error loading data: <strong>${esc(err.message)}</strong><br>
           <span style="font-size:12px;color:#64748b;">Ensure you are logged in and the database schema is set up.</span>
         </div>`;
    });
  });

  // ----------------------------------------------------------------
  // Compute max-worked category for an officer
  // ----------------------------------------------------------------
  function getMaxCategory(services) {
    const totals = {};
    services.forEach(s => {
      if (s.Category) {
        totals[s.Category] = (totals[s.Category] || 0) + (parseFloat(s.Years) || 0);
      }
    });
    const entries = Object.entries(totals);
    if (!entries.length) return null;
    const [cat, years] = entries.reduce((best, cur) => cur[1] > best[1] ? cur : best);
    return { cat, years };
  }

  // ----------------------------------------------------------------
  // Render photo grid
  // ----------------------------------------------------------------
  function renderPhotoGrid(data) {
    const grid    = document.getElementById('photoGrid');
    const entries = Object.entries(data)
      .filter(([, { services }]) => services.length > 0)
      .sort(([, a], [, b]) =>
        (parseInt(a.meta.SeniorityNo) || 9999) - (parseInt(b.meta.SeniorityNo) || 9999)
      );

    if (!entries.length) {
      grid.innerHTML =
        `<div style="grid-column:1/-1;text-align:center;padding:48px;font-size:14px;color:#64748b;">
           No officers found for the selected filter.
         </div>`;
      return;
    }

    grid.innerHTML = entries.map(([name, { meta }], idx) => {
      const seniorityNo  = String(meta.SeniorityNo || '').trim(); // used for photo lookup
      const displayNo    = idx + 1;                               // sequential from 1
      const imgUrl       = photoMap[seniorityNo] || 'https://placehold.co/160x200?text=No+Photo';
      const batch        = meta.AllotmentYear   || '—';
      const allotType    = meta.SourceOfRecruitment || '—';
      const retires      = retirementMonthYear(meta.DateOfBirth);

      return `<div class="photo-tile" data-name="${escAttr(name)}" data-seq="${displayNo}">
        <img src="${imgUrl}"
             alt="${escAttr(name)}"
             onerror="this.src='https://placehold.co/160x200?text=No+Photo'"
             loading="lazy">
        <div class="photo-tile-body">
          <div class="photo-tile-sno">#${displayNo}</div>
          <div class="photo-tile-name">${esc(name)}</div>
          <div class="photo-tile-batch">${esc(batch)}</div>
          <div class="photo-tile-source">${esc(allotType)}</div>
          <div class="photo-tile-retire">Retires: ${esc(retires)}</div>
        </div>
      </div>`;
    }).join('');

    // Attach click handlers via event delegation (safe for any officer name)
    grid.querySelectorAll('.photo-tile').forEach(tile => {
      tile.addEventListener('click', () =>
        openOfficerPopup(tile.getAttribute('data-name'), tile.getAttribute('data-seq'))
      );
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ----------------------------------------------------------------
  // Officer detail popup
  // ----------------------------------------------------------------
  function openOfficerPopup(name, seqNo) {
    const officer = currentGroupedData[name];
    if (!officer) return;

    const { meta, services } = officer;
    const seniorityNo = String(meta.SeniorityNo || '').trim(); // used for photo lookup
    const imgUrl      = photoMap[seniorityNo] || 'https://placehold.co/140x180?text=No+Photo';

    // Category totals — sum computed years for every row, descending
    const catTotals = {};
    services.forEach(s => {
      const yrs = calcYears(s.From, s.To);
      if (s.Category) catTotals[s.Category] = (catTotals[s.Category] || 0) + yrs;
    });
    const catRows = Object.entries(catTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, yrs], i) =>
        `<tr style="background:${i % 2 ? '#eef0fb' : '#fff'};">
           <td style="padding:6px 10px;font-size:13px;color:#1e293b;">${esc(cat)}</td>
           <td style="padding:6px 10px;font-size:13px;text-align:right;font-weight:700;color:#4338ca;">${fmtYears(yrs)}</td>
         </tr>`
      ).join('');

    // All postings, sorted by From date — most recent first
    const postingRows = services
      .slice()
      .sort((a, b) => parseDate(b.From) - parseDate(a.From))
      .map((s, i) => {
        const dur = calcYears(s.From, s.To);
        return `<tr style="background:${i % 2 ? '#eef0fb' : '#fff'};">
           <td style="padding:6px 10px;font-size:12px;color:#1e293b;">${esc(s.PostName || '—')}</td>
           <td style="padding:6px 10px;font-size:12px;color:#64748b;word-break:break-word;">${esc(s.From || '')} – ${esc(s.To || 'Present')}</td>
           <td style="padding:6px 10px;font-size:12px;color:#7c3aed;white-space:nowrap;">${fmtYears(dur)}</td>
           <td style="padding:6px 10px;font-size:12px;color:#374151;">${esc(s.HCM || '—')}</td>
         </tr>`;
      }).join('');

    // Officer detail rows — 4-column layout: [label | value | label | value]
    const fieldRows = [
      ['SeniorityNo',         'Seniority No',      'IdentityNo.',              'Identity No',    'linear-gradient(135deg,#1e1b4b,#4338ca)', '#eef2ff'],
      ['Cadre',               'Cadre',             'AllotmentYear',            'Allotment Year', 'linear-gradient(135deg,#4a1d96,#7c3aed)', '#f5f3ff'],
      ['DateofAppointment',   'Date of Appt.',     'DateOfBirth',              'Date of Birth',  'linear-gradient(135deg,#1e3a5f,#2563eb)', '#eff6ff'],
      ['SourceOfRecruitment', 'Source of Recruit.','EducationalQualification', 'Education',      'linear-gradient(135deg,#134e4a,#0d9488)', '#f0fdfa'],
      ['Domicile',            'Domicile',          'EmailId',                  'Email',          'linear-gradient(135deg,#14532d,#16a34a)', '#f0fdf4'],
      ['PhoneNo',             'Phone',             '_retires',                 'Retires On',     'linear-gradient(135deg,#7c2d12,#ea580c)', '#fff7ed'],
    ];
    const retireStr = calcRetirementDate(meta.DateOfBirth);
    const detailRowsHtml = fieldRows.map(([k1, l1, k2, l2, grad, vbg]) => {
      const thSt = `padding:5px 10px;font-size:11px;color:#fff;font-weight:700;white-space:nowrap;background:${grad};border:1px solid rgba(255,255,255,0.2);letter-spacing:0.3px;`;
      const tdSt = `padding:5px 10px;font-size:12px;color:#1e293b;background:${vbg};border:1px solid #e2e8f0;font-weight:500;`;
      const v1 = esc(String(meta[k1] ?? ''));
      const v2 = k2 === '_retires' ? esc(retireStr) : esc(String(meta[k2] ?? ''));
      return `<tr>
        <th style="${thSt}">${l1}</th><td style="${tdSt}">${v1}</td>
        <th style="${thSt}">${l2}</th><td style="${tdSt}">${v2}</td>
      </tr>`;
    }).join('');

    document.getElementById('photo-popup-details').innerHTML = `
      <div style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%);padding:16px 20px 12px;text-align:center;">
        <img src="${imgUrl}"
             onerror="this.src='https://placehold.co/130x165?text=No+Photo'"
             style="width:130px;height:165px;object-fit:cover;border-radius:14px;border:4px solid #a5b4fc;box-shadow:0 8px 24px rgba(0,0,0,0.4);display:inline-block;">
        <h2 style="margin:10px 0 3px;color:#fff;font-size:16px;font-weight:800;">${esc(name)}</h2>
        <div style="font-size:12px;color:#c7d2fe;font-weight:600;font-style:italic;">${esc(meta.currentposting || '—')}</div>
        <div style="font-size:12px;color:#a5b4fc;margin-top:3px;">Sl.No #${esc(seqNo || '')}</div>
      </div>

      <div style="padding:10px 14px 6px;">
        <div style="background:linear-gradient(135deg,#312e81,#4338ca);padding:5px 12px;border-radius:6px;margin-bottom:8px;">
          <span style="color:#e0e7ff;font-size:12px;font-weight:700;letter-spacing:0.5px;">&#128203; OFFICER DETAILS</span>
        </div>
        <table class="officer-detail-table" style="border-collapse:collapse;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(67,56,202,0.12);">
          ${detailRowsHtml}
        </table>
      </div>

      <div style="padding:4px 14px 6px;">
        <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:5px 12px;border-radius:6px;">
          <span style="color:#bae6fd;font-size:12px;font-weight:700;letter-spacing:0.5px;">&#128196; SERVICE BY CATEGORY</span>
        </div>
      </div>
      <div style="padding:0 14px 8px;">
        <table style="width:100%;border-collapse:collapse;border:1px solid #c7d2fe;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:linear-gradient(135deg,#312e81,#4338ca);">
              <th style="padding:8px 10px;color:#e0e7ff;font-size:12px;text-align:left;">Category</th>
              <th style="padding:8px 10px;color:#e0e7ff;font-size:12px;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>${catRows}</tbody>
        </table>
      </div>

      ${postingRows ? `
      <div style="padding:4px 14px 6px;">
        <div style="background:linear-gradient(135deg,#134e4a,#0f766e);padding:5px 12px;border-radius:6px;">
          <span style="color:#ccfbf1;font-size:12px;font-weight:700;letter-spacing:0.5px;">&#128205; ALL POSTINGS</span>
        </div>
      </div>
      <div style="padding:0 14px 16px;">
        <table style="width:100%;border-collapse:collapse;border:1px solid #c7d2fe;">
          <thead>
            <tr style="background:linear-gradient(135deg,#e0e7ff,#c7d2fe);">
              <th style="padding:7px 10px;color:#1e1b4b;font-size:12px;text-align:left;">Post</th>
              <th style="padding:7px 10px;color:#1e1b4b;font-size:12px;text-align:left;">Period</th>
              <th style="padding:7px 10px;color:#1e1b4b;font-size:12px;text-align:left;">Duration</th>
              <th style="padding:7px 10px;color:#1e1b4b;font-size:12px;text-align:left;">HCM</th>
            </tr>
          </thead>
          <tbody>${postingRows}</tbody>
        </table>
      </div>` : ''}`;

    document.getElementById('photo-popup').classList.add('open');
  }

  // Close popup when clicking outside the box
  document.getElementById('photo-popup').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });

  // ----------------------------------------------------------------
  // HCM Dropdown
  // ----------------------------------------------------------------
  function populateHCMCheckboxes(hcmList) {
    const modal    = document.getElementById('hcmModal');
    const cardGrid = document.getElementById('hcmCardGrid');
    const hcmSet   = new Set(hcmList);
    const sortedHCMs = [
      ...customHCMOrder.filter(h => hcmSet.has(h)),
      ...[...hcmSet].filter(h => !customHCMOrder.includes(h)).sort()
    ];
    const termLabels = { '1':'1st','2':'2nd','3':'3rd','4':'4th' };

    cardGrid.innerHTML = sortedHCMs.map(hcm => {
      const m    = hcm.match(/^(.+?)-(\d+)\.0$/);
      const name = m ? m[1] : hcm;
      const term = m ? (termLabels[m[2]] || m[2] + 'th') + ' Term' : '';
      const img  = hcm.replace(/\s+/g, '_') + '.jpg';
      const id   = 'hcmCard_' + hcm.replace(/\W+/g, '_');
      return `<div class="hcm-card" data-hcm="${escAttr(hcm)}">
        <input type="checkbox" id="${id}" value="${escAttr(hcm)}" style="display:none">
        <div class="hcm-card-tick">&#10003;</div>
        <img src="${img}" alt="${esc(name)}"
             onerror="this.src='https://placehold.co/130x140?text=No+Photo'">
        <div class="hcm-card-name">${esc(name)}</div>
        ${term ? `<div class="hcm-card-term">${esc(term)}</div>` : '<div class="hcm-card-term">&nbsp;</div>'}
      </div>`;
    }).join('');

    cardGrid.querySelectorAll('.hcm-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        card.querySelector('input').checked = card.classList.contains('selected');
        handleHCMChange();
      });
    });

    document.getElementById('hcmSelectAll').onclick = () => {
      cardGrid.querySelectorAll('.hcm-card').forEach(card => {
        card.classList.add('selected');
        card.querySelector('input').checked = true;
      });
      handleHCMChange();
    };
    document.getElementById('hcmDeselectAll').onclick = () => {
      cardGrid.querySelectorAll('.hcm-card').forEach(card => {
        card.classList.remove('selected');
        card.querySelector('input').checked = false;
      });
      handleHCMChange();
    };

    document.getElementById('hcmFilterBtn').addEventListener('click', () =>
      modal.classList.toggle('open')
    );
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  function handleHCMChange() {
    applyFilters();
  }

  // ----------------------------------------------------------------
  // Combined filter: HCM + Retirement date slider
  // ----------------------------------------------------------------
  function applyFilters() {
    const selected = Array.from(
      document.querySelectorAll('#hcmCardGrid input:checked')
    ).map(cb => cb.value.trim());

    // Step 1 — HCM filter
    let entries = Object.entries(groupedData);
    if (selected.length) {
      entries = entries
        .map(([name, { meta, services }]) => {
          const filtered = services.filter(s => selected.includes(s.HCM?.trim()));
          return filtered.length ? [name, { meta, services: filtered }] : null;
        })
        .filter(Boolean);
    }

    // Step 2 — Retirement date range filter
    const isFiltered = retireFilterMin > retireGlobalMin || retireFilterMax < retireGlobalMax;
    if (isFiltered) {
      entries = entries.filter(([, { meta }]) => {
        const rd = calcRetireDateObj(meta.DateOfBirth);
        if (!rd) return true;   // no DOB — don't exclude
        const rv = rd.getFullYear() * 12 + rd.getMonth();
        return rv >= retireFilterMin && rv <= retireFilterMax;
      });
    }

    currentGroupedData = Object.fromEntries(entries);
    renderPhotoGrid(currentGroupedData);
  }

  // ----------------------------------------------------------------
  // Retirement Date Slider
  // ----------------------------------------------------------------
  function calcRetireDateObj(dob) {
    if (!dob || !String(dob).trim()) return null;
    const d = parseDate(String(dob));
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear() + 60, d.getMonth(), d.getDate());
  }

  function fmtRetireMonthVal(val) {
    return RET_MONTHS[val % 12] + ' ' + Math.floor(val / 12);
  }

  function initRetirementSlider() {
    const vals = Object.values(groupedData)
      .map(({ meta }) => calcRetireDateObj(meta.DateOfBirth))
      .filter(Boolean)
      .map(d => d.getFullYear() * 12 + d.getMonth());

    const bar = document.getElementById('photo-retire-bar');
    if (!vals.length || !bar) return;

    retireGlobalMin = Math.min(...vals);
    retireGlobalMax = Math.max(...vals);
    retireFilterMin = retireGlobalMin;
    retireFilterMax = retireGlobalMax;

    const minS = document.getElementById('photo-ret-min');
    const maxS = document.getElementById('photo-ret-max');
    [minS, maxS].forEach(s => {
      s.min = retireGlobalMin; s.max = retireGlobalMax; s.step = 1;
    });
    minS.value = retireGlobalMin;
    maxS.value = retireGlobalMax;

    bar.style.display = 'block';
    updateRetireSliderUI();
  }

  function updateRetireSliderUI() {
    document.getElementById('photo-ret-min-lbl').textContent = fmtRetireMonthVal(retireFilterMin);
    document.getElementById('photo-ret-max-lbl').textContent = fmtRetireMonthVal(retireFilterMax);

    const range    = retireGlobalMax - retireGlobalMin || 1;
    const leftPct  = ((retireFilterMin - retireGlobalMin) / range) * 100;
    const rightPct = ((retireFilterMax - retireGlobalMin) / range) * 100;
    const fill = document.getElementById('photo-ret-track-fill');
    if (fill) { fill.style.left = leftPct + '%'; fill.style.width = (rightPct - leftPct) + '%'; }

    const minRatio = (retireFilterMin - retireGlobalMin) / range;
    const minS = document.getElementById('photo-ret-min');
    const maxS = document.getElementById('photo-ret-max');
    if (minS && maxS) {
      minS.style.zIndex = minRatio > 0.5 ? 4 : 2;
      maxS.style.zIndex = minRatio > 0.5 ? 3 : 3;
    }
  }

  window.photoRetireSlider = function (which) {
    let minVal = parseInt(document.getElementById('photo-ret-min').value);
    let maxVal = parseInt(document.getElementById('photo-ret-max').value);
    if (which === 'min' && minVal > maxVal) { minVal = maxVal; document.getElementById('photo-ret-min').value = minVal; }
    if (which === 'max' && maxVal < minVal) { maxVal = minVal; document.getElementById('photo-ret-max').value = maxVal; }
    retireFilterMin = minVal;
    retireFilterMax = maxVal;
    updateRetireSliderUI();
    applyFilters();
  };

  window.photoRetireReset = function () {
    retireFilterMin = retireGlobalMin;
    retireFilterMax = retireGlobalMax;
    document.getElementById('photo-ret-min').value = retireGlobalMin;
    document.getElementById('photo-ret-max').value = retireGlobalMax;
    updateRetireSliderUI();
    applyFilters();
  };

  // ----------------------------------------------------------------
  // Utilities
  // ----------------------------------------------------------------
  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])
    );
  }

  // Safe for HTML attribute values — encodes quotes too
  function escAttr(text) {
    return String(text ?? '').replace(/[&<>"']/g, m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
    );
  }

  // Retirement date = Date of Birth + 60 years, formatted DD Mon YYYY (for popup)
  function calcRetirementDate(dob) {
    if (!dob || !String(dob).trim()) return '—';
    const d = parseDate(String(dob));
    if (isNaN(d.getTime())) return '—';
    const ret = new Date(d.getFullYear() + 60, d.getMonth(), d.getDate());
    return ret.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Retirement month+year only, e.g. "Jun 2027" (for tile display)
  function retirementMonthYear(dob) {
    if (!dob || !String(dob).trim()) return '—';
    const d = parseDate(String(dob));
    if (isNaN(d.getTime())) return '—';
    const ret = new Date(d.getFullYear() + 60, d.getMonth(), d.getDate());
    return ret.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  }

  // Parse a date string in YYYY-MM-DD, DD/MM/YYYY or DD-MM-YYYY format
  function parseDate(s) {
    if (!s || !String(s).trim()) return new Date();
    s = String(s).trim();
    let m;
    // DD/MM/YYYY or DD-MM-YYYY
    m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    // YYYY-MM-DD or YYYY/MM/DD
    m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    const d = new Date(s);
    return isNaN(d) ? new Date() : d;
  }

  // Decimal years between two date strings (open-ended → today)
  function calcYears(fromStr, toStr) {
    if (!fromStr || !String(fromStr).trim()) return 0;
    const from = parseDate(fromStr);
    const to   = (toStr && String(toStr).trim()) ? parseDate(toStr) : new Date();
    return Math.max(0, (to - from) / (365.25 * 24 * 60 * 60 * 1000));
  }

  // Format decimal years → "X yrs Y mos"
  function fmtYears(dec) {
    if (!dec || dec <= 0) return '—';
    const yrs = Math.floor(dec);
    const mos = Math.floor((dec - yrs) * 12);
    const parts = [];
    if (yrs) parts.push(`${yrs} yr${yrs !== 1 ? 's' : ''}`);
    if (mos) parts.push(`${mos} mo`);
    return parts.join(' ') || '< 1 mo';
  }

  function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

})(); // end IIFE
