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
  let isDropdownVisible     = false;
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
        if (entry.is_retired || entry.is_transferred_from_ap) return; // hide retired / transferred officers
        const name = entry.NameoftheOfficer.trim();
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

    officerEntries.forEach(([name, { meta, services }]) => {
      const categoryYearMap = Object.fromEntries(allCategories.map(cat => [cat, 0]));
      services.forEach(entry => {
        categoryYearMap[entry.Category] = (categoryYearMap[entry.Category] || 0) + calcDecimalYears(entry.From, entry.To);
      });

      const chartContainer = document.createElement('div');
      chartContainer.className = 'chart-container';

      const title = document.createElement('div');
      title.className = 'chart-title';
      title.innerHTML = `<a href="#" class="officer-link" data-officer="${escapeHtml(name)}" style="color:#ede9fe;text-decoration:none;">${meta.SeniorityNo}. ${escapeHtml(name)}</a>`;

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
    const container = document.getElementById('hcmDropdown');
    const hcmSet    = new Set(hcmList);
    const sortedHCMs = [
      ...customHCMOrder.filter(h => hcmSet.has(h)),
      ...[...hcmSet].filter(h => !customHCMOrder.includes(h)).sort()
    ];

    const html = [
      `<div style="text-align:center;margin-bottom:10px;">
        <button id="selectAllBtn"   style="margin-right:10px;padding:4px 12px;border-radius:6px;background:#4f46e5;color:white;border:none;cursor:pointer;font-weight:600;font-size:12px;">Select All</button>
        <button id="deselectAllBtn" style="padding:4px 12px;border-radius:6px;background:#ef4444;color:white;border:none;cursor:pointer;font-weight:600;font-size:12px;">Deselect All</button>
      </div>`
    ];

    sortedHCMs.forEach(hcm => {
      const id = `hcm_${hcm.replace(/\W+/g, '_')}`;
      html.push(`<div class="hcm-item"><input type="checkbox" id="${id}" value="${hcm}"><label for="${id}">${hcm}</label></div>`);
    });
    container.innerHTML = html.join('');

    container.querySelectorAll('input[type="checkbox"]').forEach(cb =>
      cb.addEventListener('change', debounce(handleHCMCheckboxChange, 50))
    );

    document.getElementById('selectAllBtn').onclick = () => {
      document.querySelectorAll('#hcmDropdown input[type="checkbox"]').forEach(cb => cb.checked = true);
      handleHCMCheckboxChange();
    };
    document.getElementById('deselectAllBtn').onclick = () => {
      document.querySelectorAll('#hcmDropdown input[type="checkbox"]').forEach(cb => cb.checked = false);
      handleHCMCheckboxChange();
    };

    document.getElementById('hcmFilterBtn').addEventListener('click', e => {
      isDropdownVisible = !isDropdownVisible;
      document.getElementById('hcmDropdown').style.display = isDropdownVisible ? 'block' : 'none';
      e.stopPropagation();
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('#hcmDropdown') && !e.target.closest('#hcmFilterBtn')) {
        document.getElementById('hcmDropdown').style.display = 'none';
        isDropdownVisible = false;
      }
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function handleHCMCheckboxChange() {
    const selectedHCMs = Array.from(
      document.querySelectorAll('#hcmDropdown input:checked')
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
    const fieldLabels = {
      "Cadre":                    "Cadre",
      "IdentityNo.":              "Identity No",
      "DateofAppointment":        "Date of Appointment",
      "SourceOfRecruitment":      "Source of Recruitment",
      "EducationalQualification": "Educational Qualification",
      "DateOfBirth":              "Date of Birth",
      "AllotmentYear":            "Allotment Year",
      "Domicile":                 "Domicile",
      "EmailId":                  "Email",
      "PhoneNo":                  "Phone Number"
    };
    const excludeKeys = ["From","To","Years","PostName","Department","Category","SLNO","HCM","SeniorityNo","NameoftheOfficer","currentposting"];
    const entries     = Object.entries(data).filter(([k]) => !excludeKeys.includes(k));
    const half        = Math.ceil(entries.length / 2);
    const seniorityNo = data.SeniorityNo?.toString()?.trim();
    const imageUrl    = photoMap[seniorityNo] || 'https://placehold.co/120x150?text=No+Image';

    let html = `<div style="text-align:center;margin-bottom:15px;padding-top:16px;">
      <img src="${imageUrl}" alt="Officer Image" style="width:180px;height:250px;object-fit:cover;border-radius:20px;border:3px solid #a5b4fc;">
      <h2 style="margin:10px 0 5px 0;color:#1e1b4b;">${escapeHtml(data.NameoftheOfficer)}</h2>
      <div style="font-size:14px;color:#6366f1;font-weight:600;">${escapeHtml(data.currentposting || 'Current Posting not available')}</div>
    </div>`;

    html += `<h2 style="text-align:center;margin-top:20px;color:#1e1b4b;">Officer Details</h2>
    <div style="display:flex;gap:20px;padding:0 16px;">
      <table class="popupa-table" style="flex:1;">${entries.slice(0, half).map(([k, v]) => {
        const label     = fieldLabels[k] || k;
        const highlight = k.toLowerCase().includes('education') ? 'style="color:#dc2626;font-weight:bold;"' : '';
        return `<tr><th>${label}</th><td ${highlight}>${escapeHtml(String(v ?? ''))}</td></tr>`;
      }).join('')}</table>
      <table class="popupa-table" style="flex:1;">${entries.slice(half).map(([k, v]) => {
        const label     = fieldLabels[k] || k;
        const highlight = k.toLowerCase().includes('education') ? 'style="color:#dc2626;font-weight:bold;"' : '';
        return `<tr><th>${label}</th><td ${highlight}>${escapeHtml(String(v ?? ''))}</td></tr>`;
      }).join('')}</table>
    </div>`;

    const sortedServices = services.slice().sort((a, b) => new Date(b.From) - new Date(a.From));
    html += `<h2 style="text-align:center;margin-top:20px;color:#1e1b4b;">Service History</h2>
    <div style="padding:0 16px 16px;">
    <table class="popupc-table" style="width:100%;">
      <thead><tr><th>Post Name</th><th>Department</th><th>Category</th><th>From</th><th>To</th><th>Period</th><th>HCM</th></tr></thead>
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
