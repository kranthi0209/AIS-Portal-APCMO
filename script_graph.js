// ================================================================
// script_graph.js — Unified graph/chart script for AIS Dashboard
// Service type read from URL ?service=IAS|IPS|IFS
// Falls back to window.AIS_CONFIG for backward compatibility.
// ================================================================

(function () {

  // ----------------------------------------------------------------
  // Service type: URL param → AIS_CONFIG → default IAS
  // ----------------------------------------------------------------
  const urlSvc = new URLSearchParams(window.location.search).get('service');
  const serviceType = (
    urlSvc ||
    (window.AIS_CONFIG && window.AIS_CONFIG.serviceType) ||
    'IAS'
  ).toUpperCase();

  // ----------------------------------------------------------------
  // HCM order (same for all three services)
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
  let groupedData           = {};
  let currentGroupedData    = {};
  let allCategories         = [];
  let categoryColorClassMap = {};
  let cachedColors          = {};
  let photoMap              = {};

  // ----------------------------------------------------------------
  // Bootstrap: auth + data load
  // ----------------------------------------------------------------
  document.getElementById('chartGrid').innerHTML =
    `<div style="grid-column:1/-1;text-align:center;padding:40px;font-size:15px;color:#6366f1;">
       &#8987; Loading data&hellip;
     </div>`;

  requireAuth().then(session => {
    if (!session) return;

    Promise.all([
      loadOfficerData(serviceType),
      loadPhotos(serviceType)
    ]).then(([officerData, photos]) => {
      photoMap = photos;
      groupedData = {};
      const categoriesSet = new Set();
      const hcmSet        = new Set();

      officerData.forEach(entry => {
        if (entry.is_retired || entry.is_transferred_from_ap) return; // active only
        const name = (entry.NameoftheOfficer || '').trim();
        if (!name) return;
        const hcm  = entry.HCM?.trim();
        if (!groupedData[name]) groupedData[name] = { meta: entry, services: [] };
        groupedData[name].services.push(entry);
        categoriesSet.add(entry.Category);
        if (hcm) hcmSet.add(hcm);
      });

      for (const [, group] of Object.entries(groupedData)) {
        group.meta = group.services.reduce((a, b) =>
          parseInt(a.SeniorityNo) < parseInt(b.SeniorityNo) ? a : b
        );
      }

      allCategories = Array.from(categoriesSet).sort();
      allCategories.forEach((cat, i) => {
        categoryColorClassMap[cat] = `bar-color-${i % 10}`;
      });
      cachedColors = getAllCategoryColors();

      currentGroupedData = structuredClone(groupedData);
      populateHCMCheckboxes(Array.from(hcmSet).sort());
      renderLegend();
      renderCharts(currentGroupedData);
    }).catch(error => {
      console.error('Error loading data:', error);
      document.getElementById('chartGrid').innerHTML =
        `<div style="grid-column:1/-1;text-align:center;padding:40px;font-size:14px;color:#dc2626;">
           &#10060; Error loading data: <strong>${error.message}</strong><br>
           <span style="font-size:12px;color:#64748b;">Ensure you are logged in and the database schema is set up.</span>
         </div>`;
    });
  });

  // ----------------------------------------------------------------
  // Get computed colours from CSS classes
  // ----------------------------------------------------------------
  function getAllCategoryColors() {
    const dummy = document.createElement('div');
    dummy.style.display = 'none';
    document.body.appendChild(dummy);
    const colorMap = {};
    allCategories.forEach(cat => {
      dummy.className = categoryColorClassMap[cat];
      colorMap[cat]   = getComputedStyle(dummy).backgroundColor;
    });
    document.body.removeChild(dummy);
    return colorMap;
  }

  // ----------------------------------------------------------------
  // Render legend
  // ----------------------------------------------------------------
  function renderLegend() {
    const legendContainer = document.getElementById('legend');
    legendContainer.innerHTML = '';
    allCategories.forEach(cat => {
      const color = cachedColors[cat];
      const item  = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span class="legend-box" style="background-color:${color};"></span>${cat}`;
      legendContainer.appendChild(item);
    });
  }

  // ----------------------------------------------------------------
  // Render chart grid
  // ----------------------------------------------------------------
  function renderCharts(dataToUse) {
    const chartGrid = document.getElementById('chartGrid');
    chartGrid.innerHTML = '';

    const officerEntries = Object.entries(dataToUse)
      .filter(([, { services }]) => services.length > 0)
      .sort((a, b) => (parseInt(a[1].meta.SeniorityNo) || 9999) - (parseInt(b[1].meta.SeniorityNo) || 9999));

    officerEntries.forEach(([name, { meta, services }], idx) => {
      const categoryYearMap = Object.fromEntries(allCategories.map(cat => [cat, 0]));
      services.forEach(entry => {
        categoryYearMap[entry.Category] = (categoryYearMap[entry.Category] || 0) + calcDecimalYears(entry.From, entry.To);
      });

      const chartContainer = document.createElement('div');
      chartContainer.className = 'chart-container';

      const title = document.createElement('div');
      title.className = 'chart-title';
      title.innerHTML = `<a href="#" class="officer-link" data-officer="${escapeHtml(name)}" style="color:#ede9fe;text-decoration:none;">${idx + 1}. ${escapeHtml(name)}</a>`;

      const canvas = document.createElement('canvas');
      chartContainer.appendChild(title);
      chartContainer.appendChild(canvas);
      chartGrid.appendChild(chartContainer);

      new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: allCategories,
          datasets: [{
            label: 'Years',
            data: allCategories.map(cat => categoryYearMap[cat]),
            backgroundColor: allCategories.map(cat => cachedColors[cat])
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)} years`
              }
            },
            datalabels: {
              color: '#1e1b4b',
              anchor: 'end',
              align: 'top',
              font: { weight: 'bold', size: 11 },
              formatter: value => value > 0 ? value.toFixed(2) : ''
            }
          },
          scales: {
            x: { display: false },
            y: { beginAtZero: true }
          }
        },
        plugins: [ChartDataLabels]
      });
    });
  }

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
      return `<div class="hcm-card" data-hcm="${escapeHtml(hcm)}">
        <input type="checkbox" id="${id}" value="${escapeHtml(hcm)}" style="display:none">
        <div class="hcm-card-tick">&#10003;</div>
        <img src="${img}" alt="${escapeHtml(name)}"
             onerror="this.src='https://placehold.co/130x140?text=No+Photo'">
        <div class="hcm-card-name">${escapeHtml(name)}</div>
        ${term ? `<div class="hcm-card-term">${term}</div>` : '<div class="hcm-card-term">&nbsp;</div>'}
      </div>`;
    }).join('');

    cardGrid.querySelectorAll('.hcm-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        card.querySelector('input').checked = card.classList.contains('selected');
        handleHCMCheckboxChange();
      });
    });

    document.getElementById('hcmSelectAll').onclick = () => {
      cardGrid.querySelectorAll('.hcm-card').forEach(card => {
        card.classList.add('selected');
        card.querySelector('input').checked = true;
      });
      handleHCMCheckboxChange();
    };
    document.getElementById('hcmDeselectAll').onclick = () => {
      cardGrid.querySelectorAll('.hcm-card').forEach(card => {
        card.classList.remove('selected');
        card.querySelector('input').checked = false;
      });
      handleHCMCheckboxChange();
    };

    document.getElementById('hcmFilterBtn').addEventListener('click', () =>
      modal.classList.toggle('open')
    );
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  function handleHCMCheckboxChange() {
    const selectedHCMs = Array.from(
      document.querySelectorAll('#hcmCardGrid input:checked')
    ).map(cb => cb.value.trim());

    if (selectedHCMs.length === 0) {
      currentGroupedData = structuredClone(groupedData);
    } else {
      currentGroupedData = {};
      for (const [name, { services }] of Object.entries(groupedData)) {
        const filtered = services.filter(s => selectedHCMs.includes(s.HCM?.trim()));
        if (filtered.length) {
          const meta = filtered.reduce((a, b) =>
            parseInt(a.SeniorityNo) < parseInt(b.SeniorityNo) ? a : b
          );
          currentGroupedData[name] = { meta, services: filtered };
        }
      }
    }
    renderCharts(currentGroupedData);
  }

  // ----------------------------------------------------------------
  // Officer link click → popup
  // ----------------------------------------------------------------
  document.addEventListener('click', function (e) {
    const link = e.target.closest('.officer-link');
    if (link) {
      e.preventDefault();
      const officerName = link.getAttribute('data-officer');
      const officerData = groupedData[officerName]?.meta;
      if (officerData) showOfficer(officerData);
    }
  });

  // ----------------------------------------------------------------
  // Popup — Officer Details
  // ----------------------------------------------------------------
  function showOfficer(data) {
    const name      = data.NameoftheOfficer?.trim();
    const services  = groupedData[name]?.services || [];
    const seniorityNo = data.SeniorityNo?.toString()?.trim();
    const imageUrl    = photoMap[seniorityNo] || 'https://placehold.co/120x150?text=No+Image';

    // Row definitions: [key1, label1, key2, label2, gradient, valueBg]
    const fieldRows = [
      ['SeniorityNo',             'Seniority No',       'IdentityNo.',             'Identity No',      'linear-gradient(135deg,#1e1b4b,#4338ca)', '#eef2ff'],
      ['Cadre',                   'Cadre',              'AllotmentYear',            'Allotment Year',   'linear-gradient(135deg,#4a1d96,#7c3aed)', '#f5f3ff'],
      ['DateofAppointment',       'Date of Appointment','DateOfBirth',              'Date of Birth',    'linear-gradient(135deg,#1e3a5f,#2563eb)', '#eff6ff'],
      ['SourceOfRecruitment',     'Source of Recruit.', 'EducationalQualification', 'Education',        'linear-gradient(135deg,#134e4a,#0d9488)', '#f0fdfa'],
      ['Domicile',                'Domicile',           'EmailId',                  'Email',            'linear-gradient(135deg,#14532d,#16a34a)', '#f0fdf4'],
      ['PhoneNo',                 'Phone',              '',                         '',                 'linear-gradient(135deg,#7c2d12,#ea580c)', '#fff7ed'],
    ];
    const detailRows = fieldRows.map(([k1, l1, k2, l2, grad, vbg]) => {
      const isEdu2 = k2 === 'EducationalQualification';
      const thStyle = `width:22%;padding:5px 10px;font-size:11px;color:#ffffff;font-weight:700;white-space:nowrap;background:${grad};border:1px solid rgba(255,255,255,0.2);letter-spacing:0.3px;`;
      const tdStyle = `width:28%;padding:5px 10px;font-size:12px;color:#1e293b;background:${vbg};border:1px solid #e2e8f0;font-weight:500;`;
      const tdEduStyle = `width:28%;padding:5px 10px;font-size:12px;color:#dc2626;background:${vbg};border:1px solid #e2e8f0;font-weight:700;`;
      return `<tr>
        <th style="${thStyle}">${l1}</th>
        <td style="${tdStyle}">${escapeHtml(String(data[k1] ?? ''))}</td>
        <th style="${thStyle}">${l2}</th>
        <td style="${isEdu2 ? tdEduStyle : tdStyle}">${k2 ? escapeHtml(String(data[k2] ?? '')) : ''}</td>
      </tr>`;
    });

    let html = `
    <div style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%);padding:18px 20px 14px;text-align:center;border-radius:0;">
      <img src="${imageUrl}" alt="Officer Image"
           style="width:130px;height:165px;object-fit:cover;border-radius:14px;border:4px solid #a5b4fc;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
      <h2 style="margin:10px 0 4px;color:#ffffff;font-size:16px;font-weight:800;letter-spacing:0.2px;">${escapeHtml(data.NameoftheOfficer)}</h2>
      <div style="font-size:12px;color:#c7d2fe;font-weight:600;font-style:italic;">${escapeHtml(data.currentposting || '—')}</div>
    </div>
    <div style="padding:12px 14px 8px;">
      <div style="background:linear-gradient(135deg,#312e81,#4338ca);padding:5px 12px;border-radius:6px;margin-bottom:8px;">
        <span style="color:#e0e7ff;font-size:12px;font-weight:700;letter-spacing:0.5px;">&#128203; OFFICER DETAILS</span>
      </div>
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(67,56,202,0.12);">
        ${detailRows.join('')}
      </table>
    </div>`;

    const sortedServices = services.slice().sort((a, b) => parseServiceDate(b.From) - parseServiceDate(a.From));
    html += `<div style="padding:0 14px 4px;">
      <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:5px 12px;border-radius:6px;">
        <span style="color:#bae6fd;font-size:12px;font-weight:700;letter-spacing:0.5px;">&#128196; SERVICE HISTORY</span>
      </div>
    </div>
    <div style="padding:0 14px 16px;">
    <table class="popupc-table" style="width:100%;">
      <thead><tr><th>Post Name</th><th>Department</th><th>Category</th><th>From</th><th>To</th><th>Duration</th><th>HCM</th></tr></thead>
      <tbody>${sortedServices.map(s =>
        `<tr><td>${escapeHtml(s.PostName)}</td><td>${escapeHtml(s.Department)}</td><td>${escapeHtml(s.Category)}</td><td>${s.From}</td><td>${s.To || '<em>Present</em>'}</td><td>${fmtDuration(s.From, s.To)}</td><td>${escapeHtml(s.HCM || '')}</td></tr>`
      ).join('')}</tbody>
    </table></div>`;

    $('#officer-details').html(html);
    $('#officer-popupa').fadeIn();
  }

  // ----------------------------------------------------------------
  // Utility
  // ----------------------------------------------------------------
  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  function parseServiceDate(s) {
    if (!s || !s.trim()) return new Date();
    s = s.trim();
    let m;
    m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    const d = new Date(s);
    return isNaN(d) ? new Date() : d;
  }

  function fmtDuration(fromStr, toStr) {
    if (!fromStr || !String(fromStr).trim()) return '';
    const from = parseServiceDate(fromStr);
    const to   = (toStr && String(toStr).trim()) ? parseServiceDate(toStr) : new Date();
    let yy = to.getFullYear() - from.getFullYear();
    let mm = to.getMonth()    - from.getMonth();
    let dd = to.getDate()     - from.getDate();
    if (dd < 0) { mm--; dd += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
    if (mm < 0) { yy--; mm += 12; }
    if (yy < 0) return '';
    return `${yy} Yr${yy !== 1 ? 's' : ''} ${mm} Mo ${dd} Day${dd !== 1 ? 's' : ''}`;
  }

  function calcDecimalYears(fromStr, toStr) {
    if (!fromStr || !String(fromStr).trim()) return 0;
    const from = parseServiceDate(fromStr);
    const to   = (toStr && String(toStr).trim()) ? parseServiceDate(toStr) : new Date();
    const ms   = to - from;
    return ms > 0 ? ms / (365.25 * 24 * 3600 * 1000) : 0;
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

})(); // end IIFE
