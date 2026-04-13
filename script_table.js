// ================================================================
// script_table.js — Unified pivot-table script for AIS Dashboard
// Service type read from URL ?service=IAS|IPS|IFS
// Falls back to window.AIS_CONFIG for backward compatibility.
// ================================================================

(function () {

  // ----------------------------------------------------------------
  // Service configs (all three embedded — no external dependency)
  // ----------------------------------------------------------------
  const ALL_CONFIGS = {
    IAS: {
      categoryOrder: [
        "AGRICULTURE & ALLIED",
        "ENERGY, INFRA & INDUSTRIES",
        "FINANCE",
        "IT & OTHER TECH",
        "LOCAL BODIES ADMINISTRATION",
        "REGULATORY",
        "WELFARE & DEVELOPMENT",
        "PERSONAL OFFICE",
        "DISTRICT ADMINISTRATION",
        "PROBATION, TRAINING , LEAVE, COMPULSORY WAIT ETC"
      ],
      customDepartmentOrder: {
        "AGRICULTURE & ALLIED": [
          "AGRICULTURE", "AH,FISHERIES ETC", "HORTICULTURE"
        ],
        "ENERGY, INFRA & INDUSTRIES": [
          "ENERGY", "INDUSTRIES & INFRASTRUCTURE", "HANDLOOM & TEXTILES",
          "WATER RESOURCE", "ROADS & BUILDINGS", "TOURISM"
        ],
        "FINANCE": ["FINANCE", "COMMERCIAL TAX"],
        "IT & OTHER TECH": ["APSFL", "APTS", "E-SEVA", "IT & ELECTRONICS", "RTGS"],
        "LOCAL BODIES ADMINISTRATION": [
          "MAUD", "CRDA & AMRDA", "MUNICIPAL COMMISSIONER", "PR & RD", "GSWS"
        ],
        "REGULATORY": [
          "PLANNING", "GAD", "REVENUE (LANDS)", "ENDOWMENT", "TTD",
          "PROHIBITION & EXCISE", "STAMPS & REGISTRATION", "DISASTER MANAGEMENT",
          "MINES & GEOLOGY", "COE & APVC", "EFST", "ELECTION COMMISION",
          "LABOUR", "TRANSPORT"
        ],
        "WELFARE & DEVELOPMENT": [
          "WELFARE", "EDUCATION", "HEALTH", "SKILL DEVELOPMENT",
          "FOOD & CIVIL SUPPLIES", "HOUSING", "YOUTH, SPORTS & CULTURE"
        ],
        "PERSONAL OFFICE": [
          "GOVERNORS OFFICE", "PRIME MINISTERS OFFICE", "CHIEF MINISTERS OFFICE"
        ],
        "DISTRICT ADMINISTRATION": [
          "DISTRICT COLLECTOR", "JOINT COLLECTOR", "SUB COLLECTOR",
          "PO ITDA", "ASSISTANT COLLECTOR (TRAINEE)", "OTHER DIST POSTS"
        ],
        "PROBATION, TRAINING , LEAVE, COMPULSORY WAIT ETC": [
          "PROBATION & TRAINING", "COMPULSORY WAIT", "LEAVE"
        ]
      }
    },

    IPS: {
      categoryOrder: [
        "TRADITIONAL POLICE AGENCIES",
        "INVESTIGATING AGENCIES",
        "KEY COUNTER AGENCIES",
        "POLICE PERSONNEL MANAGEMENT",
        "ELITE AGENCIES",
        "OTHERS AGENCIES",
        "PERSONAL OFFICES"
      ],
      customDepartmentOrder: {
        "TRADITIONAL POLICE AGENCIES": [
          "LAW AND ORDER", "RAILWAYS", "ROAD SAFETY & TRANSPORT DEPT", "TRAFFIC"
        ],
        "INVESTIGATING AGENCIES": [
          "ANTI CORRUPTION BUREAU", "CRIMES & CRIME INVESTIGATION DEPARTMENT",
          "CYBER CRIMES & TECHNICAL", "VIGILANCE & ENFORCEMENT"
        ],
        "KEY COUNTER AGENCIES": [
          "COASTAL SECURITY", "GREYHOUNDS", "INTELLIGENCE",
          "OCTOPUS & OPERATIONS", "PROHIBITION & EXCISE AND SEB"
        ],
        "POLICE PERSONNEL MANAGEMENT": [
          "ADMINISTRATION WING", "POLICE RECRUITMENT & TRAINING WINGS"
        ],
        "ELITE AGENCIES": [
          "CENTRAL BUREAU OF INVESTIGATION", "INTELLIGENCE BUREAU",
          "NATIONAL INVESTIGATION AGENCY", "UNITED NATIONS ORGANISATION"
        ],
        "OTHERS AGENCIES": [
          "OTHER NON UNIFORM POSTS", "OTHER UNIFORM POSTS",
          "PROBATION & TRAINING", "SPECIAL POLICE", "TTD"
        ],
        "PERSONAL OFFICES": [
          "CHIEF MINISTERS OFFICE", "GOVERNORS OFFICER", "PRIME MINISTERS OFFICE"
        ]
      }
    },

    IFS: {
      categoryOrder: [
        "TRADITIONAL FOREST SERVICE",
        "FOREST & PLANTS DEVELOPMENT SERVICE",
        "ANIMAL PROTECTION AND CARE SERVICES",
        "RESEARCH & TECHNICAL",
        "ELITE INSTITUTIONS",
        "NON FOREST DEPTS"
      ],
      customDepartmentOrder: {
        "TRADITIONAL FOREST SERVICE": [
          "TERRITORIAL", "PLANNING", "VIGILLANCE", "OTHER ADMINISTRATIVE ROLES"
        ],
        "FOREST & PLANTS DEVELOPMENT SERVICE": [
          "FOREST DEVELOPMENT CORPORATION", "SILVICULTURE", "SOCIAL FORESTRY",
          "PRODUCTION", "RED SANDERS"
        ],
        "ANIMAL PROTECTION AND CARE SERVICES": [
          "PROJECT TIGER", "WILD LIFE", "ZOO PARKS"
        ],
        "RESEARCH & TECHNICAL": ["GIS & OTHER TECHNICAL", "RESEARCH"],
        "ELITE INSTITUTIONS": ["FOREST SURVEY OF INDIA", "ICFRE"],
        "NON FOREST DEPTS": [
          "AGRICULTURE DEPT", "EDUCATION", "ENERGY", "FINANCE", "GSWS",
          "HEALTH", "HOUSING", "INDUSTRIES", "IT & ELECTRONICS", "MAUD",
          "PLANNING DEPT", "PR & RD", "SOCIAL WELFARE", "TOURISM", "TTD"
        ]
      }
    }
  };

  // ----------------------------------------------------------------
  // Resolve service type: URL param → AIS_CONFIG → default IAS
  // ----------------------------------------------------------------
  const urlSvc = new URLSearchParams(window.location.search).get('service');
  const serviceType = (
    urlSvc ||
    (window.AIS_CONFIG && window.AIS_CONFIG.serviceType) ||
    'IAS'
  ).toUpperCase();

  const cfgFromPage = window.AIS_CONFIG || {};
  const serviceCfg  = ALL_CONFIGS[serviceType] || ALL_CONFIGS.IAS;

  const categoryOrder         = cfgFromPage.categoryOrder         || serviceCfg.categoryOrder;
  const customDepartmentOrder = cfgFromPage.customDepartmentOrder || serviceCfg.customDepartmentOrder;

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
  let groupedData        = {};
  let currentGroupedData = {};
  let departments        = new Set();
  let categories         = new Set();
  let allOfficerData     = [];
  let photoMap           = {};
  const sortState        = { column: '', direction: 'asc' };

  // ----------------------------------------------------------------
  // Bootstrap: auth + data load
  // ----------------------------------------------------------------
  // Show loading indicator immediately
  document.getElementById('table-body').innerHTML =
    `<tr><td colspan="100" style="text-align:center;padding:30px;font-size:15px;color:#6366f1;">
       &#8987; Loading data&hellip;
     </td></tr>`;

  requireAuth().then(session => {
    if (!session) return;

    Promise.all([
      loadOfficerData(serviceType),
      loadPhotos(serviceType)
    ]).then(([data, photos]) => {
      photoMap       = photos;
      allOfficerData = data;

      if (!data.length) {
        document.getElementById('table-body').innerHTML =
          `<tr><td colspan="100" style="text-align:center;padding:30px;font-size:14px;color:#64748b;">
             No records found for <strong>${serviceType}</strong>.<br>
             Please run the data migration script (<code>migrate_data.py</code>) to populate the database.
           </td></tr>`;
        return;
      }

      const hcmSet = new Set();
      data.forEach(entry => {
        const hcm = entry.HCM?.trim();
        if (hcm) hcmSet.add(hcm);
      });

      updateGroupedData(data);
      populateHCMCheckboxes(Array.from(hcmSet).sort());
    }).catch(err => {
      console.error('Error loading data:', err);
      document.getElementById('table-body').innerHTML =
        `<tr><td colspan="100" style="text-align:center;padding:30px;font-size:14px;color:#dc2626;">
           &#10060; Error loading data: <strong>${err.message}</strong><br>
           <span style="font-size:12px;color:#64748b;">Check browser console for details. Ensure you are logged in and the database schema is set up.</span>
         </td></tr>`;
    });
  });

  // ----------------------------------------------------------------
  // Build groupedData and render
  // ----------------------------------------------------------------
  function updateGroupedData(data) {
    groupedData = {};
    departments.clear();
    categories.clear();

    data.forEach(entry => {
      if (entry.is_retired || entry.is_transferred_from_ap) return; // hide retired / transferred officers
      const name = entry.NameoftheOfficer.trim();
      if (!groupedData[name]) groupedData[name] = { meta: entry, services: [] };
      groupedData[name].services.push(entry);
      departments.add(entry.Department);
      categories.add(entry.Category);
    });

    // Sort by seniority and assign sequential display rank among active officers
    const sorted = {};
    Object.entries(groupedData)
      .sort(([, a], [, b]) => (parseInt(a.meta.SeniorityNo) || 9999) - (parseInt(b.meta.SeniorityNo) || 9999))
      .forEach(([k, v], rank) => { v.displayRank = rank + 1; sorted[k] = v; });
    groupedData = sorted;

    currentGroupedData = { ...groupedData };
    renderTable();
  }

  // ----------------------------------------------------------------
  // Render table header + body
  // ----------------------------------------------------------------
  function renderTable() {
    const categoriesList = categoryOrder.filter(cat => categories.has(cat));
    const headerRow1 = [
      '<th rowspan="2" class="sticky-col" onclick="sortBySeniority()">S.No</th>',
      '<th rowspan="2" class="sticky-col-2" onclick="sortByName()">Name of the Officer</th>'
    ];
    const headerRow2 = [];
    const categoryDeptMap = getOrderedDeptMap(Object.entries(groupedData));

    categoriesList.forEach(cat => {
      const depts = categoryDeptMap[cat] || [];
      headerRow1.push(`<th colspan="${depts.length + 1}" class="category-header" data-category="${cat}">${cat}</th>`);
      depts.forEach(dept => {
        headerRow2.push(`<th data-department-category="${cat}">${dept}</th>`);
      });
      headerRow2.push(`<th class="clickable category-total-header" data-category="${cat}" onclick="sortByCategoryTotal('${cat}')">Total</th>`);
    });

    document.getElementById('table-header').innerHTML =
      `<tr>${headerRow1.join('')}</tr><tr>${headerRow2.join('')}</tr>`;

    renderBody(Object.entries(currentGroupedData), categoriesList, categoryDeptMap);
  }

  // ----------------------------------------------------------------
  // Render tbody
  // ----------------------------------------------------------------
  function renderBody(entries, categoriesList, categoryDeptMap) {
    let tbodyHTML = '';

    entries.forEach(([name, { meta, services, displayRank }]) => {
      const cadreClass = meta.Cadre ? meta.Cadre.replace(/\s+/g, '-') : 'OTHERS';
      const colorClass  = `cadre-${cadreClass}`;
      tbodyHTML += `<tr class="${colorClass}">`;
      tbodyHTML += `<td class="sticky-col"><a href="#" onclick='event.preventDefault(); showOfficer(${JSON.stringify(meta)})'>${displayRank}</a></td>`;
      tbodyHTML += `<td class="sticky-col-2"><a href="#" onclick='event.preventDefault(); showOfficer(${JSON.stringify(meta)})'>${escapeHtml(name)}</a></td>`;

      categoriesList.forEach(cat => {
        let categoryTotal = 0;
        const depts = categoryDeptMap[cat] || [];

        depts.forEach(dept => {
          const filtered      = services.filter(s => s.Category === cat && s.Department === dept);
          const totalYears    = filtered.reduce((sum, s) => sum + calcDecimalYears(s.From, s.To), 0);
          const sortedFiltered = filtered.slice().sort((a, b) => new Date(b.From) - new Date(a.From));
          const detailRows    = sortedFiltered.map(s =>
            `<tr><td>${escapeHtml(s.PostName)}</td><td>${s.From}</td><td>${s.To}</td><td>${fmtDuration(s.From, s.To)}</td><td>${escapeHtml(s.HCM || '')}</td></tr>`
          ).join('');
          categoryTotal += totalYears;
          tbodyHTML += `<td data-department-category="${cat}">${totalYears
            ? `<a href="#" onclick='event.preventDefault(); showService("${escapeHtml(name)}", \`${detailRows}\`)'>${totalYears.toFixed(2)}</a>`
            : ''}</td>`;
        });

        const filteredServices = services.filter(s => s.Category === cat);
        tbodyHTML += `<td class="category-total" data-name="${escapeHtml(name)}" data-category="${cat}" data-total="${categoryTotal.toFixed(2)}" data-rows="${encodeURIComponent(JSON.stringify(filteredServices))}">${categoryTotal.toFixed(2)}</td>`;
      });

      tbodyHTML += '</tr>';
    });

    document.getElementById('table-body').innerHTML = tbodyHTML;
  }

  // ----------------------------------------------------------------
  // Sort helpers
  // ----------------------------------------------------------------
  function sortAndRender(keyFn, columnId) {
    const arr = Object.entries(currentGroupedData);
    if (sortState.column === columnId) {
      sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      sortState.column    = columnId;
      sortState.direction = 'asc';
    }
    arr.sort(([, a], [, b]) => {
      const aKey = keyFn(a.meta);
      const bKey = keyFn(b.meta);
      return sortState.direction === 'asc' ? (aKey > bKey ? 1 : -1) : (aKey < bKey ? 1 : -1);
    });
    renderBody(arr, categoryOrder.filter(cat => categories.has(cat)), getOrderedDeptMap(Object.entries(groupedData)));
  }

  window.sortBySeniority = function () {
    sortAndRender(m => +m.SeniorityNo, 'seniority');
  };

  window.sortByName = function () {
    sortAndRender(m => (m.NameoftheOfficer || '').trim().toLowerCase(), 'name');
  };

  window.sortByCategoryTotal = function (category) {
    const arr      = Object.entries(currentGroupedData);
    const columnId = `categoryTotal_${category}`;
    sortState.direction = (sortState.column === columnId && sortState.direction === 'asc') ? 'desc' : 'asc';
    sortState.column    = columnId;
    arr.sort(([, a], [, b]) => {
      const aTotal = a.services.filter(s => s.Category === category).reduce((sum, s) => sum + calcDecimalYears(s.From, s.To), 0);
      const bTotal = b.services.filter(s => s.Category === category).reduce((sum, s) => sum + calcDecimalYears(s.From, s.To), 0);
      return sortState.direction === 'asc' ? aTotal - bTotal : bTotal - aTotal;
    });
    renderBody(arr, categoryOrder.filter(cat => categories.has(cat)), getOrderedDeptMap(Object.entries(groupedData)));
  };

  function sortByDepartment(category, department) {
    const arr      = Object.entries(currentGroupedData);
    const columnId = `${category}_${department}`;
    sortState.direction = (sortState.column === columnId && sortState.direction === 'asc') ? 'desc' : 'asc';
    sortState.column    = columnId;
    arr.sort(([, a], [, b]) => {
      const aTotal = a.services.filter(s => s.Category === category && s.Department === department).reduce((sum, s) => sum + calcDecimalYears(s.From, s.To), 0);
      const bTotal = b.services.filter(s => s.Category === category && s.Department === department).reduce((sum, s) => sum + calcDecimalYears(s.From, s.To), 0);
      return sortState.direction === 'asc' ? aTotal - bTotal : bTotal - aTotal;
    });
    renderBody(arr, categoryOrder.filter(cat => categories.has(cat)), getOrderedDeptMap(Object.entries(groupedData)));
  }

  // ----------------------------------------------------------------
  // Ordered Department Map
  // ----------------------------------------------------------------
  function getOrderedDeptMap(entryArray) {
    const map = {};
    categoryOrder.forEach(cat => {
      if (!categories.has(cat)) return;
      const deptsInCat  = [...new Set(entryArray.flatMap(([, entry]) =>
        entry.services.filter(s => s.Category === cat).map(s => s.Department)
      ))];
      const customOrder = customDepartmentOrder[cat] || [];
      map[cat] = customOrder.filter(d => deptsInCat.includes(d))
        .concat(deptsInCat.filter(d => !customOrder.includes(d)).sort());
    });
    return map;
  }

  // ----------------------------------------------------------------
  // Popup A — Officer Details
  // ----------------------------------------------------------------
  window.showOfficer = function (data) {
    const name        = data.NameoftheOfficer?.trim();
    const services    = groupedData[name]?.services || [];
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
    <table class="popupc-table" style="width:100%;margin-top:10px;">
      <thead><tr><th>Post Name</th><th>Department</th><th>Category</th><th>From</th><th>To</th><th>Period</th><th>HCM</th></tr></thead>
      <tbody>${sortedServices.map(s =>
        `<tr><td>${escapeHtml(s.PostName)}</td><td>${escapeHtml(s.Department)}</td><td>${escapeHtml(s.Category)}</td><td>${s.From}</td><td>${s.To || '<em>Present</em>'}</td><td>${fmtDuration(s.From, s.To)}</td><td>${escapeHtml(s.HCM || '')}</td></tr>`
      ).join('')}</tbody>
    </table></div>`;

    $('#officer-details').html(html);
    $('#officer-popupa').fadeIn();
  };

  // ----------------------------------------------------------------
  // Popup B — Service breakdown for one dept+category
  // ----------------------------------------------------------------
  window.showService = function (name, rows) {
    $('#service-details').html(
      `<h3 style="color:#1e1b4b;">${name}</h3>
       <table class="popupb-table">
         <thead><tr><th>Post Name</th><th>From</th><th>To</th><th>Period</th><th>HCM</th></tr></thead>
         <tbody>${rows}</tbody>
       </table>`
    );
    $('#service-popupb').show();
  };

  // ----------------------------------------------------------------
  // Popup B — Category total clicked
  // ----------------------------------------------------------------
  window.showTotalPopupb = function (name, category, total, encodedRows) {
    try {
      const services       = JSON.parse(decodeURIComponent(encodedRows));
      const sortedServices = services.slice().sort((a, b) => new Date(b.From) - new Date(a.From));
      const rowsHtml = sortedServices.map(row =>
        `<tr><td>${escapeHtml(row.PostName)}</td><td>${row.From}</td><td>${row.To}</td><td>${fmtDuration(row.From, row.To)}</td><td>${escapeHtml(row.HCM || '')}</td></tr>`
      ).join('');
      $('#service-details').html(
        `<h3 style="color:#1e1b4b;">${name} — ${category} Total: ${total} yrs</h3>
         <table class="popupb-table">
           <thead><tr><th>Post Name</th><th>From</th><th>To</th><th>Period</th><th>HCM</th></tr></thead>
           <tbody>${rowsHtml}</tbody>
         </table>`
      );
      $('#service-popupb').show();
    } catch (err) { console.error('Popup B error:', err); }
  };

  // ----------------------------------------------------------------
  // Popup C — Full service history for an officer
  // ----------------------------------------------------------------
  window.showAllServices = function (name) {
    const officer = currentGroupedData[name];
    if (!officer) return;
    const services = officer.services;
    let html = `<h2 style="text-align:center;color:#1e1b4b;padding:12px 0 4px;">Service History — ${escapeHtml(name)}</h2>
    <div style="padding:0 12px 12px;">
    <table class="popupc-table">
      <thead><tr><th>Post Name</th><th>Department</th><th>Category</th><th>From</th><th>To</th><th>Period</th><th>HCM</th></tr></thead>
      <tbody>`;
    services.forEach(s => {
      html += `<tr><td>${escapeHtml(s.PostName)}</td><td>${escapeHtml(s.Department)}</td><td>${escapeHtml(s.Category)}</td><td>${s.From}</td><td>${s.To || '<em>Present</em>'}</td><td>${fmtDuration(s.From, s.To)}</td><td>${escapeHtml((s.HCM || '').trim())}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    $('#service-details-c').html(html);
    $('#service-popupc').fadeIn();
  };

  // ----------------------------------------------------------------
  // Duration helpers
  // ----------------------------------------------------------------
  function parseServiceDate(s) {
    if (!s || !s.trim()) return new Date();
    s = s.trim();
    let m;
    // DD-MM-YYYY or DD/MM/YYYY
    m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    // YYYY-MM-DD
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

  // Returns decimal years for arithmetic (pivot totals, sorting)
  function calcDecimalYears(fromStr, toStr) {
    if (!fromStr || !String(fromStr).trim()) return 0;
    const from = parseServiceDate(fromStr);
    const to   = (toStr && String(toStr).trim()) ? parseServiceDate(toStr) : new Date();
    const ms   = to - from;
    return ms > 0 ? ms / (365.25 * 24 * 3600 * 1000) : 0;
  }

  // ----------------------------------------------------------------
  // HCM Dropdown
  // ----------------------------------------------------------------
  function populateHCMCheckboxes(hcmList) {
    const container = document.getElementById('hcmDropdown');
    container.innerHTML = '';

    const buttonGroup = document.createElement('div');
    buttonGroup.innerHTML = `<div style="text-align:center;margin-bottom:10px;">
      <button id="selectAllBtn"   style="margin-right:10px;padding:4px 12px;border-radius:6px;background:#4f46e5;color:white;border:none;cursor:pointer;font-weight:600;font-size:12px;">Select All</button>
      <button id="deselectAllBtn" style="padding:4px 12px;border-radius:6px;background:#ef4444;color:white;border:none;cursor:pointer;font-weight:600;font-size:12px;">Deselect All</button>
    </div>`;
    container.appendChild(buttonGroup);

    const hcmSet     = new Set(hcmList);
    const sortedHCMs = [
      ...customHCMOrder.filter(h => hcmSet.has(h)),
      ...[...hcmSet].filter(h => !customHCMOrder.includes(h)).sort()
    ];

    sortedHCMs.forEach(hcm => {
      const id  = `hcm_${hcm.replace(/\W+/g, '_')}`;
      const div = document.createElement('div');
      div.className = 'hcm-item';
      div.innerHTML = `<input type="checkbox" id="${id}" value="${hcm}"><label for="${id}">${hcm}</label>`;
      container.appendChild(div);
    });

    container.querySelectorAll('input[type="checkbox"]').forEach(cb =>
      cb.addEventListener('change', handleHCMCheckboxChange)
    );

    document.getElementById('selectAllBtn').addEventListener('click', () => {
      document.querySelectorAll('#hcmDropdown input[type="checkbox"]').forEach(cb => cb.checked = true);
      handleHCMCheckboxChange();
    });
    document.getElementById('deselectAllBtn').addEventListener('click', () => {
      document.querySelectorAll('#hcmDropdown input[type="checkbox"]').forEach(cb => cb.checked = false);
      handleHCMCheckboxChange();
    });
  }

  function handleHCMCheckboxChange() {
    const selectedHCMs = Array.from(
      document.querySelectorAll('#hcmDropdown input:checked')
    ).map(cb => cb.value.trim());
    filterByHCM(selectedHCMs);
  }

  function filterByHCM(selectedHCMs) {
    if (!selectedHCMs.length) {
      currentGroupedData = { ...groupedData };
    } else {
      const filteredData = Object.values(groupedData)
        .map(entry => ({
          meta:     entry.meta,
          services: entry.services.filter(s => selectedHCMs.includes(s.HCM?.trim()))
        }))
        .filter(entry => entry.services.length > 0);
      currentGroupedData = {};
      filteredData.forEach(entry => {
        const name = entry.meta.NameoftheOfficer.trim();
        currentGroupedData[name] = entry;
      });
    }
    renderTable();
  }

  // ----------------------------------------------------------------
  // HCM filter button toggle
  // ----------------------------------------------------------------
  let isDropdownVisible = false;

  document.getElementById('hcmFilterBtn').addEventListener('click', e => {
    const dropdown = document.getElementById('hcmDropdown');
    isDropdownVisible = !isDropdownVisible;
    dropdown.style.display = isDropdownVisible ? 'block' : 'none';
    e.stopPropagation();
  });

  // ----------------------------------------------------------------
  // Global click delegation
  // ----------------------------------------------------------------
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#hcmDropdown') && !e.target.closest('#hcmFilterBtn')) {
      document.getElementById('hcmDropdown').style.display = 'none';
      isDropdownVisible = false;
    }

    const deptTh = e.target.closest('th[data-department-category]');
    if (deptTh && !deptTh.classList.contains('category-header')) {
      const department = deptTh.textContent.trim();
      const category   = deptTh.dataset.departmentCategory;
      sortByDepartment(category, department);
    }

    const totalTd = e.target.closest('.category-total');
    if (totalTd) {
      const d = totalTd.dataset;
      showTotalPopupb(d.name, d.category, d.total, d.rows);
    }
  });

  // ----------------------------------------------------------------
  // Utility
  // ----------------------------------------------------------------
  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();

})(); // end IIFE
