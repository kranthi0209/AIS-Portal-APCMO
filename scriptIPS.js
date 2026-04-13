let groupedData = {};
let currentGroupedData = {}; // ✅ Required for filtered views
let departments = new Set();
let categories = new Set();
let allOfficerData = [];
const sortState = { column: '', direction: 'asc' };
let selectedHCMs = new Set();
const imageData = {
"1":"https://ais.ap.gov.in/Files/19901046.jpeg",
"2":"https://ais.ap.gov.in/Files/19911029.jpeg",
"3":"https://ais.ap.gov.in/Files/19921011.jpeg",
"4":"https://ais.ap.gov.in/Files/19921019.jpeg",
"5":"https://ais.ap.gov.in/Files/19921050.jpeg",
"6":"https://ais.ap.gov.in/Files/19921057.jpeg",
"7":"https://ais.ap.gov.in/Files/19931005.jpeg",
"8":"https://ais.ap.gov.in/Files/19931063.jpeg",
"9":"https://ais.ap.gov.in/Files/19931071.jpeg",
"10":"https://ais.ap.gov.in/Files/19941036.jpeg",
"11":"https://ais.ap.gov.in/Files/19941061.jpeg",
"12":"https://ais.ap.gov.in/Files/19941066.jpeg",
"13":"https://ais.ap.gov.in/Files/19941079.png",
"14":"https://ais.ap.gov.in/Files/19951053.png",
"15":"https://ais.ap.gov.in/Files/19951067.jpeg",
"16":"https://ais.ap.gov.in/Files/19961002.jpeg",
"17":"https://ais.ap.gov.in/Files/19961062.png",
"18":"https://ais.ap.gov.in/Files/19961080.jpeg",
"19":"https://ais.ap.gov.in/Files/19971021.jpeg",
"20":"https://ais.ap.gov.in/Files/19981019.jpeg",
"21":"https://ais.ap.gov.in/Files/20001007.jpeg",
"22":"https://ais.ap.gov.in/Files/20011001.jpeg",
"23":"https://ais.ap.gov.in/Files/20021028.jpeg",
"24":"https://ais.ap.gov.in/Files/20041021.jpeg",
"25":"https://ais.ap.gov.in/Files/20041053.jpeg",
"26":"https://ais.ap.gov.in/Files/20051001.jpeg",
"27":"https://ais.ap.gov.in/Files/20051054.jpeg",
"28":"https://ais.ap.gov.in/Files/2005- Gac49_20190509140444367.jpg",
"29":"https://ais.ap.gov.in/Files/2006- Kolli Raghuram Reddyb35c_20190509133920005.jpg",
"30":"https://ais.ap.gov.in/Files/2006- Ake Ravikrishnae381_20190509134142005.jpg",
"31":"https://ais.ap.gov.in/Files/2006- Sarvashresth Tripathiceea_20190509134335115.jpg",
"32":"https://ais.ap.gov.in/Files/2006-  Ra0ec_20190509135954054.jpg",
"33":"https://ais.ap.gov.in/Files/2006- G994c_20190509140243211.jpg",
"34":"https://ais.ap.gov.in/Files/2006- G108d_20190509140633914.jpg",
"35":"https://ais.ap.gov.in/Files/2006- Sdfe3_20190509140752821.jpg",
"36":"https://ais.ap.gov.in/Files/2006- Ravi Prakash5b26_20190509140931118.jpg",
"37":"https://ais.ap.gov.in/Files/2006- Sabd0_20190509141050446.jpg",
"38":"https://ais.ap.gov.in/Files/2006- KV mohanrao9952_20190509141141993.jpeg",
"39":"https://ais.ap.gov.in/Files/2006- Pa888_20190520170230585.jpg",
"40":"https://ais.ap.gov.in/Files/2007- B3587_20190520170632633.jpg",
"41":"https://ais.ap.gov.in/Files/2008- Gajarao Bhupald293_20190520171028649.jpg",
"42":"https://ais.ap.gov.in/Files/2008- GOPINATH JETTI2123_20190520171924322.jpg",
"43":"https://ais.ap.gov.in/Files/2008- S33ab_20190520172117119.jpg",
"44":"https://ais.ap.gov.in/Files/2008- Grewal Navdeep Singh Kc748_20190520172229947.jpg",
"45":"https://ais.ap.gov.in/Files/2008- Drd1c7_20190520171554603.jpg",
"46":"https://ais.ap.gov.in/Files/20091120.png",
"47":"https://ais.ap.gov.in/Files/20091157.jpeg",
"48":"https://ais.ap.gov.in/Files/99992287.jpeg",
"49":"https://ais.ap.gov.in/Files/20101102.jpeg",
"50":"https://ais.ap.gov.in/Files/20101197.jpeg",
"51":"https://ais.ap.gov.in/Files/20101439.jpeg",
"52":"https://ais.ap.gov.in/Files/20111105.jpeg",
"53":"https://ais.ap.gov.in/Files/20111177.jpeg",
"54":"https://ais.ap.gov.in/Files/20111260.jpeg",
"55":"https://ais.ap.gov.in/Files/20111274.jpeg",
"56":"https://ais.ap.gov.in/Files/20111721.jpeg",
"57":"https://ais.ap.gov.in/Files/20121222.jpeg",
"58":"https://ais.ap.gov.in/Files/20131189.jpeg",
"59":"https://ais.ap.gov.in/Files/20131222.jpeg",
"60":"https://ais.ap.gov.in/Files/A5b9c_20240621122003979.png",
"61":"https://ais.ap.gov.in/Files/V116c_20240621122108517.png",
"62":"https://ais.ap.gov.in/Files/D3f70_20240621122237256.png",
"63":"https://ais.ap.gov.in/Files/Ycafd_20240621122408428.png",
"64":"https://ais.ap.gov.in/Files/R6da8_20240621122557259.jpg",
"65":"https://ais.ap.gov.in/Files/Vcca3_20240621122651988.jpg",
"66":"https://ais.ap.gov.in/Files/D1dec_20240621122746923.jpg",
"67":"https://ais.ap.gov.in/Files/20141135.jpeg",
"68":"https://ais.ap.gov.in/Files/20141455.jpeg",
"69":"https://ais.ap.gov.in/Files/20141917.jpeg",
"70":"https://ais.ap.gov.in/Files/G2835_20240621122909939.jpg",
"71":"https://ais.ap.gov.in/Files/V4427_20240621123002910.jpg",
"72":"https://ais.ap.gov.in/Files/20151135.jpeg",
"73":"https://ais.ap.gov.in/Files/20151169.jpeg",
"74":"https://ais.ap.gov.in/Files/20151775.jpeg",
"75":"https://ais.ap.gov.in/Files/20151783.jpeg",
"76":"https://ais.ap.gov.in/Files/20151760.jpeg",
"77":"https://ais.ap.gov.in/Files/Malika Gargfe21_20240621123126765.jpg",
"78":"https://ais.ap.gov.in/Files/T4d9f_20240621123230977.jpg",
"79":"https://ais.ap.gov.in/Files/K7149_20240621123407441.jpg",
"80":"https://ais.ap.gov.in/Files/20161101.jpeg",
"81":"https://ais.ap.gov.in/Files/20161174.jpeg",
"82":"https://ais.ap.gov.in/Files/20161180.jpeg",
"83":"https://ais.ap.gov.in/Files/20161607.jpeg",
"84":"https://ais.ap.gov.in/Files/Pec02_20240621123733029.jpg",
"85":"https://ais.ap.gov.in/Files/Pc03c_20240621123826077.jpg",
"86":"https://ais.ap.gov.in/Files/20171172.jpeg",
"87":"https://ais.ap.gov.in/Files/20171219.jpeg",
"88":"https://ais.ap.gov.in/Files/Jagadeesh Pf03e_20240621123926522.jpg",
"89":"https://ais.ap.gov.in/Files/G4c29_20240621124023658.jpg",
"90":"https://ais.ap.gov.in/Files/Shaik Shereen Begum2fcd_20240621130901591.jpg",
"91":"https://ais.ap.gov.in/Files/K10a8_20240621131029946.jpg",
"92":"https://ais.ap.gov.in/Files/Kca0c_20240621130301830.jpg",
"93":"https://ais.ap.gov.in/Files/K5bbb_20240621130412396.jpg",
"94":"https://ais.ap.gov.in/Files/Sd17f_20240621130045423.jpg",
"95":"https://ais.ap.gov.in/Files/Kf5ea_20240621130532035.jpg",
"96":"https://ais.ap.gov.in/Files/S1e02_20240621130653018.jpg",
"97":"https://ais.ap.gov.in/Files/Adhiraj Singh Ranae93e_20240621124235724.jpg",
"98":"https://ais.ap.gov.in/Files/Manikanta Chandolu3598_20240621124453596.jpg",
"99":"https://ais.ap.gov.in/Files/Krishna Kanth Patel937e_20240621124608083.jpg",
"100":"https://ais.ap.gov.in/Files/Tushar Dudibfff_20240621124716050.jpg",
"101":"https://ais.ap.gov.in/Files/Af2e3_20240621130753768.jpg",
"102":"https://ais.ap.gov.in/Files/Gcb15_20240621131133842.jpg",
"103":"https://ais.ap.gov.in/Files/K V Maheswara Reddy IPS8d89_20240702161959317.jpg",
"104":"https://ais.ap.gov.in/Files/Kommi Prathap6189_20240621125450737.jpg",
"105":"https://ais.ap.gov.in/Files/GC Suneel Sheoran, IPS(1)97dc_20241001133051245.jpeg",
"106":"https://ais.ap.gov.in/Files/Rahul Meena42ea_20240621125600512.jpg",
"107":"https://ais.ap.gov.in/Files/Shelke Nachiket53dc_20240621125929707.jpg",
"108":"https://ais.ap.gov.in/Files/Pankaj Kumar Meenaf2c0_20240621131259717.jpg",
"109":"https://ais.ap.gov.in/Files/Dheeraj Kunubilli7d83_20240621131400020.jpg",
"110":"https://ais.ap.gov.in/Files/Jagadeesh Adahallid33d_20240621131448550.jpg",
"111":"https://ais.ap.gov.in/Files/Navjyoti Mishra7bf9_20240621132735049.jpg",
"112":"https://ais.ap.gov.in/Files/Surana Ankita504d_20240621131729341.jpg",
"113":"../assets/images/No-image-available.jpg",
"114":"https://ais.ap.gov.in/Files/Manda Javali Alfonscab9_20240621132717991.png",
"115":"../assets/images/No-image-available.jpg",
"116":"https://ais.ap.gov.in/Files/Manoj Ramanath Hegded912_20240621132650097.jpg",
"117":"https://ais.ap.gov.in/Files/Rohit Kumar Chaudharybf65_20240621132752149.jpg",
"118":"../assets/images/No-image-available.jpg",
"119":"../assets/images/No-image-available.jpg",
"120":"../assets/images/No-image-available.jpg",
"121":"../assets/images/No-image-available.jpg",
"122":"../assets/images/No-image-available.jpg",
"123":"../assets/images/No-image-available.jpg",
"124":"../assets/images/No-image-available.jpg",
"125":"../assets/images/No-image-available.jpg",
};
const categoryOrder = [
  "TRADITIONAL POLICE AGENCIES","INVESTIGATING AGENCIES","KEY COUNTER AGENCIES","POLICE PERSONNEL MANAGEMENT","ELITE AGENCIES","OTHERS AGENCIES","PERSONAL OFFICES"
];

const customDepartmentOrder = {
"TRADITIONAL POLICE AGENCIES":["LAW AND ORDER","RAILWAYS","ROAD SAFETY & TRANSPORT DEPT","TRAFFIC"],
"INVESTIGATING AGENCIES":["ANTI CORRUPTION BUREAU","CRIMES & CRIME INVESTIGATION DEPARTMENT","CYBER CRIMES & TECHNICAL","VIGILANCE & ENFORCEMENT"],
"KEY COUNTER AGENCIES":["COASTAL SECURITY","GREYHOUNDS","INTELLIGENCE","OCTOPUS & OPERATIONS","PROHIBITION & EXCISE AND SEB"],
"POLICE PERSONNEL MANAGEMENT":["ADMINISTRATION WING","POLICE RECRUITMENT & TRAINING WINGS"],
"ELITE AGENCIES":["CENTRAL BUREAU OF INVESTIGATION","INTELLIGENCE BUREAU","NATIONAL INVESTIGATION AGENCY","UNITED NATIONS ORGANISATION"],
"OTHERS AGENCIES":["OTHER NON UNIFORM POSTS","OTHER UNIFORM POSTS","POLICE RECRUITMENT & TRAINING WINGS","PROBATION & TRAINING","RAILWAYS","SPECIAL POLICE","TTD"],
"PERSONAL OFFICES":["CHIEF MINISTERS OFFICE","GOVERNORS OFFICER","PRIME MINISTERS OFFICE"]

};

fetch('officerDataIPS.json')
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