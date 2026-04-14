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
      photoMap = photos;

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

    // Set row-2 sticky top to actual height of row-1 (avoids hardcoded 50px gap)
    requestAnimationFrame(() => {
      const row1 = document.querySelector('#table-header tr:first-child');
      if (row1) {
        const h = row1.offsetHeight;
        document.querySelectorAll('#table-header tr:nth-child(2) th').forEach(th => {
          th.style.top = h + 'px';
        });
      }
    });

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
      const thStyle = `padding:5px 10px;font-size:11px;color:#ffffff;font-weight:700;white-space:nowrap;background:${grad};border:1px solid rgba(255,255,255,0.2);letter-spacing:0.3px;`;
      const tdStyle = `padding:5px 10px;font-size:12px;color:#1e293b;background:${vbg};border:1px solid #e2e8f0;font-weight:500;`;
      const tdEduStyle = `padding:5px 10px;font-size:12px;color:#dc2626;background:${vbg};border:1px solid #e2e8f0;font-weight:700;`;
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
      <table class="officer-detail-table" style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(67,56,202,0.12);">
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
    const sortedAll = services.slice().sort((a, b) => parseServiceDate(b.From) - parseServiceDate(a.From));
    let html = `<h2 style="text-align:center;color:#1e1b4b;padding:12px 0 4px;">Service History — ${escapeHtml(name)}</h2>
    <div style="padding:0 12px 12px;">
    <table class="popupc-table">
      <thead><tr><th>Post Name</th><th>Department</th><th>Category</th><th>From</th><th>To</th><th>Duration</th><th>HCM</th></tr></thead>
      <tbody>${sortedAll.map(s =>
        `<tr><td>${escapeHtml(s.PostName)}</td><td>${escapeHtml(s.Department)}</td><td>${escapeHtml(s.Category)}</td><td>${s.From}</td><td>${s.To || '<em>Present</em>'}</td><td>${fmtDuration(s.From, s.To)}</td><td>${escapeHtml((s.HCM || '').trim())}</td></tr>`
      ).join('')}</tbody>
    </table></div>`;
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
  // Global click delegation
  // ----------------------------------------------------------------
  document.addEventListener('click', function (e) {
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

// (width configuration removed — widths are fixed in style_dashboard.css)

var _DEFAULT_COL_WIDTHS = {  // kept as no-op stub to avoid reference errors if cached
  tableWidth: 0
};

