let groupedData = {};
let currentGroupedData = {}; // ✅ Required for filtered views
let departments = new Set();
let categories = new Set();
let allOfficerData = [];
const sortState = { column: '', direction: 'asc' };
let selectedHCMs = new Set();
const imageData = {
"1":"https://ais.ap.gov.in/Files/1989 - Ajaya Kumar Naik,9aaf_20190501130430830.jpg",
"2":"https://ais.ap.gov.in/Files/1990- Anoop Singh3c66_20190501130514502.jpg",
"3":"https://ais.ap.gov.in/Files/1991 - R P Khajuriacac9_20190501131050127.jpg",
"4":"https://ais.ap.gov.in/Files/1992 - S S Sreedhar5955_20190501131226706.jpg",
"5":"https://ais.ap.gov.in/Files/1992- A K Jha24fa_20190501131311659.jpg",
"6":"https://ais.ap.gov.in/Files/1994 - P V Chalapathi Raob273_20191023120458202.jpg",
"7":"https://ais.ap.gov.in/Files/1996 - M Revathi5774_20190501131558659.jpg",
"8":"https://ais.ap.gov.in/Files/1997 - Shanti Priya Pandey5f80_20190501131632894.jpg",
"9":"https://ais.ap.gov.in/Files/1997 - Rahul Pandey2ed3_20190501131843847.jpg",
"10":"https://ais.ap.gov.in/Files/1998 - B Sundarec04_20190501131934222.jpg",
"11":"https://ais.ap.gov.in/Files/1999 - S Srisaravanan9647_20190501132006019.jpg",
"12":"https://ais.ap.gov.in/Files/2003 -N  Nageswara Raobf6d_20190501132931005.jpg",
"13":"https://ais.ap.gov.in/Files/Y Srinivasa Reddy  IFSb5a7_20190501133312677.jpg",
"14":"https://ais.ap.gov.in/Files/2005 - Srikantanatha Reddybeea_20190501132202519.jpg",
"15":"https://ais.ap.gov.in/Files/2005 - T Jyothidd22_20190501133421865.jpg",
"16":"https://ais.ap.gov.in/Files/Ramakrishna  IFS0352_20190501134158334.jpg",
"17":"https://ais.ap.gov.in/Files/2007- B N N Murthy34c4_20190501132236191.jpg",
"18":"https://ais.ap.gov.in/Files/2008- Mohamed Diwan Mydeen16fb_20190501132303191.jpg",
"19":"https://ais.ap.gov.in/Files/ikva443_20240621195144882.png",
"20":"https://ais.ap.gov.in/Files/Bb402_20240621150803944.jpeg",
"21":"https://ais.ap.gov.in/Files/2010 - M1416_20190501132337754.jpg",
"22":"https://ais.ap.gov.in/Files/2010 - Yesoda Bai8895_20190501132406816.jpg",
"23":"https://ais.ap.gov.in/Files/WhatsApp Image 2024-06-21 at 66633_20240621194658235.jpeg",
"24":"https://ais.ap.gov.in/Files/2011- Alan Chong Teron4177_20190501132431520.jpg",
"25":"https://ais.ap.gov.in/Files/2012 - Ca87e_20190501132452941.jpg",
"26":"https://ais.ap.gov.in/Files/2013- Dra884_20190501132522348.jpg",
"27":"https://ais.ap.gov.in/Files/2013 -Nandani Salariac858_20190501132552535.jpg",
"28":"https://ais.ap.gov.in/Files/2013- Jagannath Singh50a7_20190501132621567.jpg",
"29":"https://ais.ap.gov.in/Files/2013- Anant Shankarde61_20190501132652286.jpeg",
"30":"https://ais.ap.gov.in/Files/M Babitha4952_20240621142540784.jpeg",
"31":"https://ais.ap.gov.in/Files/2016 Narentheran2df1_20190501132747426.jpg",
"32":"https://ais.ap.gov.in/Files/2016 SandeepKGundala15d8_20190501132811067.jpg",
"33":"https://ais.ap.gov.in/Files/2016 Sunil Kumar Reddy5815_20190501132836036.jpg",
"34":"https://ais.ap.gov.in/Files/Sai Babad616_20240621163724483.jpeg",
"35":"https://ais.ap.gov.in/Files/Krishna Priya32c0_20240621150511095.jpeg",
"36":"https://ais.ap.gov.in/Files/S5cd7_20240621150550272.jpeg",
"37":"https://ais.ap.gov.in/Files/P5db7_20240621150259663.jpeg",
"38":"https://ais.ap.gov.in/Files/KBasha4646_20240621195928601.jpg",
"39":"https://ais.ap.gov.in/Files/Ravindranath Reddyeaeb_20240621200220130.jpeg",
"40":"https://ais.ap.gov.in/Files/Shanmukh_kumar IFS9ef6_20240621142929694.jpeg",
"41":"https://ais.ap.gov.in/Files/sri sachin gupta9306_20240621165716271.jpeg",
"42":"https://ais.ap.gov.in/Files/WhatsApp Image 2024-08-02 at 3fbae_20240802204805025.jpeg",
"43":"https://ais.ap.gov.in/Files/Vineet Kumar6419_20240621150703909.jpeg",
"44":"https://ais.ap.gov.in/Files/Vignesh Appavu997d_20240621195658134.jpeg",
"45":"https://ais.ap.gov.in/Files/WhatsApp Image 2024-08-02 at 33d61_20240802205024293.jpeg",
"46":"https://ais.ap.gov.in/Files/WhatsApp Image 2024-08-02 at 399ea_20240802205110037.jpeg",
"47":"https://ais.ap.gov.in/Files/Pb4d9_20240621142808489.jpeg",
"48":"https://ais.ap.gov.in/Files/P1dd0_20240621172551613.jpeg",
"49":"https://ais.ap.gov.in/Files/Anurag Meenace99_20240621172610361.jpeg",
"50":"https://ais.ap.gov.in/Files/S0451_20240621172624758.jpeg",
"51":"https://ais.ap.gov.in/Files/Shubham985b_20240621150727391.jpeg",
"52":"https://ais.ap.gov.in/Files/Mohammad Abdul Rawoof Shaik1acf_20240621150320518.jpeg",
"53":"https://ais.ap.gov.in/Files/Subburaj G09a2_20240621142658927.jpeg",
"54":"https://ais.ap.gov.in/Files/NoPhoto011f_20240620171116650.jpg",
"55":"https://ais.ap.gov.in/Files/NoPhoto011f_20240620171116650.jpg",
"56":"https://ais.ap.gov.in/Files/NoPhoto011f_20240620171116650.jpg",
"57":"https://ais.ap.gov.in/Files/NoPhoto011f_20240620171116650.jpg",
};
const categoryOrder = [
 "TRADITIONAL FOREST SERVICE","FOREST & PLANTS DEVELOPMENT SERVICE","ANIMAL PROTECTION AND CARE SERVICES","RESEARCH & TECHNICAL","ELITE INSTITUTIONS","NON FOREST DEPTS"
];

const customDepartmentOrder = {
"TRADITIONAL FOREST SERVICE":["TERRITORIAL","PLANNING","VIGILLANCE","OTHER ADMINISTRATIVE ROLES"],
"FOREST & PLANTS DEVELOPMENT SERVICE":["FOREST DEVELOPMENT CORPORATION","SILVICULTURE","SOCIAL FORESTRY","PRODUCTION","RED SANDERS"],
"ANIMAL PROTECTION AND CARE SERVICES":["PROJECT TIGER","WILD LIFE","ZOO PARKS"],
"RESEARCH & TECHNICAL":["GIS & OTHER TECHNICAL","RESEARCH"],
"ELITE INSTITUTIONS":["FOREST SURVEY OF INDIA","ICFRE"],
"NON FOREST DEPTS":["AGRICULTURE DEPT","EDUCATION","ENERGY","FINANCE","GSWS","HEALTH","HOUSING","INDUSTRIES","IT & ELECTRONICS","MAUD","PLANNING DEPT","PR & RD","SOCIAL WELFARE","TOURISM","TTD"]



};

fetch('officerDataIFS.json')
  .then(res => res.json())
  .then(data => {
    allOfficerData = data;
    const hcmSet = new Set();
    data.forEach(entry => { if (entry.HCM?.trim()) hcmSet.add(entry.HCM.trim()); });
    populateHCMCheckboxes([...hcmSet]);
    updateGroupedData(data);
  });

function updateGroupedData(data) {
  groupedData = {};
  departments.clear();
  categories.clear();
  data.forEach(entry => {
    const name = entry.NameoftheOfficer.trim();
    if (!groupedData[name]) groupedData[name] = { meta: entry, services: [] };
    groupedData[name].services.push(entry);
    departments.add(entry.Department);
    categories.add(entry.Category);
  });
  currentGroupedData = { ...groupedData }; // ✅ cache original
  renderTable(Object.values(currentGroupedData).flatMap(e => e.services));
}


function renderTable() {
  const categoriesList = categoryOrder.filter(cat => categories.has(cat));
  const headerRow1 = [
    '<th rowspan="2" class="sticky-col" onclick="sortBySeniority()">S.No</th>',
    '<th rowspan="2" class="sticky-col-2" onclick="sortByName()">Name of the Officer</th>'
  ];
  const headerRow2 = [];

  // ✅ Always use full groupedData to preserve full column layout
  const categoryDeptMap = getOrderedDeptMap(Object.entries(groupedData));

  categoriesList.forEach(cat => {
    const depts = categoryDeptMap[cat] || [];
    headerRow1.push(`<th colspan="${depts.length + 1}" class="category-header" data-category="${cat}">${cat}</th>`);
    depts.forEach(dept => {
      headerRow2.push(`<th data-department-category="${cat}">${dept}</th>`);
    });
    headerRow2.push(`<th class="clickable category-total-header" data-category="${cat}" onclick="sortByCategoryTotal('${cat}')">Total</th>`);
  });

  document.getElementById('table-header').innerHTML = `
    <tr>${headerRow1.join('')}</tr>
    <tr>${headerRow2.join('')}</tr>
  `;

  // ✅ Use currentGroupedData for body (filtered or full)
  renderBody(Object.entries(currentGroupedData), categoriesList, categoryDeptMap);
}

function sortByCategoryTotal(category) {
  const arr = Object.entries(currentGroupedData);
  const columnId = `categoryTotal_${category}`;
  sortState.direction = sortState.column === columnId && sortState.direction === 'asc' ? 'desc' : 'asc';
  sortState.column = columnId;

  arr.sort(([, a], [, b]) => {
    const aTotal = a.services.filter(s => s.Category === category).reduce((sum, s) => sum + (+s.Years || 0), 0);
    const bTotal = b.services.filter(s => s.Category === category).reduce((sum, s) => sum + (+s.Years || 0), 0);
    return sortState.direction === 'asc' ? aTotal - bTotal : bTotal - aTotal;
  });

  // ✅ Always use full column map from unfiltered data
  renderBody(arr, categoryOrder.filter(cat => categories.has(cat)), getOrderedDeptMap(Object.entries(groupedData)));
}



function renderBody(entries, categoriesList, categoryDeptMap) {
  let tbodyHTML = '';
  entries.forEach(([name, { meta, services }]) => {
    const colorClass = `cadre-${meta.Cadre.replace(/\s/g, '-')}`;
    tbodyHTML += `<tr class="${colorClass}">`;
    tbodyHTML += `<td class="sticky-col"><a href="#" onclick='event.preventDefault(); showOfficer(${JSON.stringify(meta)})'>${meta["SeniorityNo"]}</a></td>`;
    tbodyHTML += `<td class="sticky-col-2"><a href="#" onclick='event.preventDefault(); showOfficer(${JSON.stringify(meta)})'>${escapeHtml(name)}</a></td>`;

    categoriesList.forEach(cat => {
      let categoryTotal = 0;
      categoryDeptMap[cat].forEach(dept => {
        const filtered = services.filter(s => s.Category === cat && s.Department === dept);
        const totalYears = filtered.reduce((sum, s) => sum + (parseFloat(s.Years) || 0), 0);
        const sortedFiltered = filtered.slice().sort((a, b) => new Date(b.From) - new Date(a.From));
const detailRows = sortedFiltered.map(s =>
  `<tr><td>${escapeHtml(s.PostName)}</td><td>${s.From}</td><td>${s.To}</td><td>${s.Years}</td><td>${escapeHtml(s.HCM || "")}</td></tr>`
).join('');

        categoryTotal += totalYears;
        tbodyHTML += `<td data-department-category="${cat}">${totalYears ? `<a href="#" onclick='event.preventDefault(); showService("${escapeHtml(name)}", \`${detailRows}\`)'>${totalYears.toFixed(2)}</a>` : ''}</td>`;
      });
      const filteredServices = services.filter(s => s.Category === cat);
      tbodyHTML += `<td class="category-total" data-name="${escapeHtml(name)}" data-category="${cat}" data-total="${categoryTotal.toFixed(2)}" data-rows="${encodeURIComponent(JSON.stringify(filteredServices))}">${categoryTotal.toFixed(2)}</td>`;
    });

    tbodyHTML += '</tr>';
  });
  document.getElementById('table-body').innerHTML = tbodyHTML;
}

function sortAndRender(keyFn, columnId) {
  const arr = Object.entries(currentGroupedData);
  if (sortState.column === columnId) {
    sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortState.column = columnId;
    sortState.direction = 'asc';
  }
  arr.sort(([, a], [, b]) => {
    const aKey = keyFn(a.meta);
    const bKey = keyFn(b.meta);
    return sortState.direction === 'asc' ? (aKey > bKey ? 1 : -1) : (aKey < bKey ? 1 : -1);
  });
  renderBody(arr, categoryOrder.filter(cat => categories.has(cat)), getOrderedDeptMap(arr));
}

function sortBySeniority() { sortAndRender(m => +m.SeniorityNo, 'seniority'); }
function sortByName() { sortAndRender(m => m.NameoftheOfficer.trim().toLowerCase(), 'name'); }
function sortByDepartment(category, department) {
  const arr = Object.entries(currentGroupedData);
  const columnId = `${category}_${department}`;
  sortState.direction = sortState.column === columnId && sortState.direction === 'asc' ? 'desc' : 'asc';
  sortState.column = columnId;

  arr.sort(([, a], [, b]) => {
    const aTotal = a.services.filter(s => s.Category === category && s.Department === department).reduce((sum, s) => sum + (+s.Years || 0), 0);
    const bTotal = b.services.filter(s => s.Category === category && s.Department === department).reduce((sum, s) => sum + (+s.Years || 0), 0);
    return sortState.direction === 'asc' ? aTotal - bTotal : bTotal - aTotal;
  });

  // ✅ Always use full column map from unfiltered data
  renderBody(arr, categoryOrder.filter(cat => categories.has(cat)), getOrderedDeptMap(Object.entries(groupedData)));
}


function getOrderedDeptMap() {
  const map = {};
  categoryOrder.forEach(cat => {
    if (!categories.has(cat)) return;
    const deptsInCat = [...new Set(Object.values(groupedData).flatMap(entry =>
      entry.services.filter(s => s.Category === cat).map(s => s.Department)
    ))];
    const customOrder = customDepartmentOrder[cat] || [];
    map[cat] = customOrder.filter(d => deptsInCat.includes(d)).concat(deptsInCat.filter(d => !customOrder.includes(d)).sort());
  });
  return map;
}

function showOfficer(data) {
  const name = data.NameoftheOfficer?.trim();
  const services = groupedData[name]?.services || [];

  const fieldLabels = {
    "Cadre": "Cadre", "IdentityNo": "Identity No",
    "DateofAppointment": "Date of Appointment", "SourceOfRecruitment": "Source of Recruitment",
    "EducationalQualification": "Educational Qualification", "DateOfBirth": "Date of Birth",
    "AllotmentYear": "Allotment Year", "Domicile": "Domicile",
    "EmailId": "Email", "PhoneNo": "Phone Number"
  };

  const excludeKeys = ["From", "To", "Years", "PostName", "Department", "Category", "SLNO", "HCM", "SeniorityNo", "NameoftheOfficer", "currentposting"];
  const entries = Object.entries(data).filter(([k]) => !excludeKeys.includes(k));
  const half = Math.ceil(entries.length / 2);

  const seniorityNo = data.SeniorityNo?.toString()?.trim();
  const imageUrl = imageData[seniorityNo] || 'https://via.placeholder.com/120x150?text=No+Image';

  let html = `
    <div style="text-align:center; margin-bottom: 15px;">
      <img src="${imageUrl}" alt="Officer Image" style="width: 180px; height: 250px; object-fit: cover; border-radius: 20px; border: 2px solid #ccc;">
      <h2 style="margin: 10px 0 5px 0; color:#1d3557;">${escapeHtml(data.NameoftheOfficer)}</h2>
      <div style="font-size: 14px; color: #555;">${escapeHtml(data.currentposting || 'Current Posting not available')}</div>
    </div>

    <h2 style="text-align:center; margin-top:20px; color:#1d3557;">Officer Details</h2>
    <div style="display: flex; gap: 20px;">
      <table class="popupa-table" style="flex: 1;">
        ${entries.slice(0, half).map(([k, v]) => {
          const label = fieldLabels[k] || k;
          const highlight = k.toLowerCase().includes("education") ? 'style="color:red;font-weight:bold;"' : '';
          return `<tr><th>${label}</th><td ${highlight}>${escapeHtml(v.toString())}</td></tr>`;
        }).join('')}
      </table>
      <table class="popupa-table" style="flex: 1;">
        ${entries.slice(half).map(([k, v]) => {
          const label = fieldLabels[k] || k;
          const highlight = k.toLowerCase().includes("education") ? 'style="color:red;font-weight:bold;"' : '';
          return `<tr><th>${label}</th><td ${highlight}>${escapeHtml(v.toString())}</td></tr>`;
        }).join('')}
      </table>
    </div>`;

  const sortedServices = services.slice().sort((a, b) => new Date(b.From) - new Date(a.From));
  html += `
    <h2 style="text-align:center; margin-top:20px; color:#1d3557;">Service History</h2>
    <table class="popupc-table" style="width:100%; margin-top: 10px;">
      <thead>
        <tr>
          <th>Post Name</th>
          <th>Department</th>
          <th>Category</th>
          <th>From</th>
          <th>To</th>
          <th>Years</th>
          <th>HCM</th>
        </tr>
      </thead>
      <tbody>
        ${sortedServices.map(s => `
          <tr>
            <td>${escapeHtml(s.PostName)}</td>
            <td>${escapeHtml(s.Department)}</td>
            <td>${escapeHtml(s.Category)}</td>
            <td>${s.From}</td>
            <td>${s.To}</td>
            <td>${parseFloat(s.Years).toFixed(2)}</td>
            <td>${escapeHtml(s.HCM || '')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  $('#officer-details').html(html);
  $('#officer-popupa').fadeIn();
}

function showService(name, rows) {
  $('#service-details').html(
    `<h3>${name}</h3>
    <table class="popupb-table">
      <thead><tr><th>Post Name</th><th>From</th><th>To</th><th>Years</th><th>HCM</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`
  );
  $('#service-popupb').show();
}

function showTotalPopupb(name, category, total, encodedRows) {
  try {
    const services = JSON.parse(decodeURIComponent(encodedRows));
    const sortedServices = services.slice().sort((a, b) => new Date(b.From) - new Date(a.From));
const rowsHtml = sortedServices.map(row =>
  `<tr><td>${escapeHtml(row.PostName)}</td><td>${row.From}</td><td>${row.To}</td><td>${row.Years}</td><td>${escapeHtml(row.HCM || "")}</td></tr>`
).join('');

    $('#service-details').html(
      `<h3>${name} - ${category} Total: ${total}</h3>
      <table class="popupb-table">
        <thead><tr><th>Post Name</th><th>From</th><th>To</th><th>Years</th><th>HCM</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>`
    );
    $('#service-popupb').show();
  } catch (err) {
    console.error('Popup data decode/render error:', err);
  }
}

function showAllServices(name) {
  const officer = currentGroupedData[name];
  if (!officer) return;
  const services = officer.services;

  let html = `
    <h2 style="text-align:center; color: #2b4a7e; font-size: 22px; margin-bottom: 20px;">
      Service History - ${escapeHtml(name)}
    </h2>
    <table class="popupc-table">
      <thead>
        <tr>
          <th>Post Name</th>
          <th>Department</th>
          <th>Category</th>
          <th>From</th>
          <th>To</th>
          <th>Years</th>
          <th>HCM</th>
        </tr>
      </thead>
      <tbody>`;

  services.forEach(s => {
    html += `
      <tr>
        <td>${escapeHtml(s.PostName)}</td>
        <td>${escapeHtml(s.Department)}</td>
        <td>${escapeHtml(s.Category)}</td>
        <td>${s.From}</td>
        <td>${s.To}</td>
        <td>${parseFloat(s.Years).toFixed(2)}</td>
        <td>${escapeHtml((s.HCM || "").trim())}</td>
      </tr>`;
  });

  html += '</tbody></table>';
  $('#service-details-c').html(html);
  $('#service-popupc').fadeIn();
}

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

function populateHCMCheckboxes(hcmList) {
  const container = document.getElementById('hcmDropdown');
  container.innerHTML = '';

  // Add Select/Deselect buttons
  const buttonGroup = document.createElement('div');
  buttonGroup.innerHTML = `
    <div style="text-align:center; margin-bottom:10px;">
      <button id="selectAllBtn" style="margin-right:10px; padding:4px 10px; border-radius:6px; background:#10b981; color:white; border:none; cursor:pointer;">Select All</button>
      <button id="deselectAllBtn" style="padding:4px 10px; border-radius:6px; background:#ef4444; color:white; border:none; cursor:pointer;">Deselect All</button>
    </div>`;
  container.appendChild(buttonGroup);

  // Reorder HCMs as per custom order
  const hcmSet = new Set(hcmList);
  const sortedHCMs = [
    ...customHCMOrder.filter(h => hcmSet.has(h)),
    ...[...hcmSet].filter(h => !customHCMOrder.includes(h)).sort()
  ];

   // Render checkboxes with image
  sortedHCMs.forEach(hcm => {
    const id = `hcm_${hcm.replace(/\W+/g, '_')}`;
    const div = document.createElement('div');
    div.className = 'hcm-item';
    div.innerHTML = `
      <input type="checkbox" id="${id}" value="${hcm}" />
      <label for="${id}">${hcm}</label>
    `;
    container.appendChild(div);
  });

  // Attach change handler
  container.querySelectorAll('input[type="checkbox"]').forEach(cb =>
    cb.addEventListener('change', handleHCMCheckboxChange)
  );

  // Select/Deselect buttons
  document.getElementById('selectAllBtn').addEventListener('click', () => {
    document.querySelectorAll('#hcmDropdown input[type="checkbox"]').forEach(cb => cb.checked = true);
    handleHCMCheckboxChange();
  });

  document.getElementById('deselectAllBtn').addEventListener('click', () => {
    document.querySelectorAll('#hcmDropdown input[type="checkbox"]').forEach(cb => cb.checked = false);
    handleHCMCheckboxChange();
  });
}
function renderHCMWithImage(hcm) {
  if (!hcm || !hcm.trim()) return '';
  const cleanHCM = hcm.trim();
}
function handleHCMCheckboxChange() {
  const selectedHCMs = Array.from(document.querySelectorAll('#hcmDropdown input:checked'))
    .map(cb => cb.value.trim());
  filterByHCM(selectedHCMs);
}

function filterByHCM(selectedHCMs) {
  if (!selectedHCMs.length) {
    currentGroupedData = { ...groupedData };
  } else {
    const filteredData = Object.values(groupedData).map(entry => ({
      meta: entry.meta,
      services: entry.services.filter(s => selectedHCMs.includes(s.HCM?.trim()))
    })).filter(entry => entry.services.length > 0);

    currentGroupedData = {};
    filteredData.forEach(entry => {
      const name = entry.meta.NameoftheOfficer.trim();
      currentGroupedData[name] = entry;
    });
  }

  // ✅ Render table with full structure using all original department mapping
  renderTable();  // This will use renderBody internally with full column structure
}

// Toggle dropdown visibility
let isDropdownVisible = false;
document.getElementById('hcmFilterBtn').addEventListener('click', (e) => {
  const dropdown = document.getElementById('hcmDropdown');
  isDropdownVisible = !isDropdownVisible;
  dropdown.style.display = isDropdownVisible ? 'block' : 'none';
  e.stopPropagation();
});

// Close dropdown if clicked outside
document.addEventListener('click', function (e) {
  const dropdown = document.getElementById('hcmDropdown');
  if (!e.target.closest('#hcmDropdown') && !e.target.closest('#hcmFilterBtn')) {
    dropdown.style.display = 'none';
    isDropdownVisible = false;
  }

  // Department sorting
  const deptTh = e.target.closest("th[data-department-category]");
  if (deptTh && !deptTh.classList.contains("category-header")) {
    const department = deptTh.textContent.trim();
    const category = deptTh.dataset.departmentCategory;
    sortByDepartment(category, department);
  }

  // Category total click popup
  const target = e.target.closest(".category-total");
  if (target) {
    const data = target.dataset;
    showTotalPopupb(data.name, data.category, data.total, data.rows);
  }
});

function getOrderedDeptMap(entryArray = Object.entries(currentGroupedData)) {
  const map = {};
  categoryOrder.forEach(cat => {
    if (!categories.has(cat)) return;
    const deptsInCat = [...new Set(entryArray.flatMap(([, entry]) => entry.services.filter(s => s.Category === cat).map(s => s.Department)))];
    const customOrder = customDepartmentOrder[cat] || [];
    map[cat] = customOrder.filter(d => deptsInCat.includes(d)).concat(deptsInCat.filter(d => !customOrder.includes(d)).sort());
  });
  return map;
}
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

lucide.createIcons();
// 🔥 Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyCvNOmgsZxQ9Ef90ewrQdXDexgmsvWrFDQ",
    authDomain: "ais-officers-service-records.firebaseapp.com",
    projectId: "ais-officers-service-records",
    appId: "1:983633286739:web:cf688c2ed45fbd3f5218a6"
  };

  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();

  // 🧭 Auth state check
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "index.html";
    }
  });

  // 🔓 Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    auth.signOut().then(() => {
      window.location.href = "index.html";
    });
  });