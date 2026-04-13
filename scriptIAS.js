let groupedData = {};
let currentGroupedData = {}; // ✅ Required for filtered views
let departments = new Set();
let categories = new Set();
let allOfficerData = [];
const sortState = { column: '', direction: 'asc' };
let selectedHCMs = new Set();
const imageData = {
"1":"https://ais.ap.gov.in/Files/01AP037500.jpeg",
"2":"https://ais.ap.gov.in/Files/YERRA SRI LAKSHMIefd3_20210318122421981.png",
"3":"https://ais.ap.gov.in/Files/01AP036500.jpeg",
"4":"https://ais.ap.gov.in/Files/01AP036700.jpeg",
"5":"https://ais.ap.gov.in/Files/01AP036900.jpeg",
"6":"https://ais.ap.gov.in/Files/01AP037200.jpeg",
"7":"https://ais.ap.gov.in/Files/01AP037900.jpeg",
"8":"https://ais.ap.gov.in/Files/01AP038220.jpeg",
"9":"https://ais.ap.gov.in/Files/01AP038000.jpeg",
"10":"https://ais.ap.gov.in/Files/01AP038901.jpeg",
"11":"https://ais.ap.gov.in/Files/01AP038915.jpeg",
"12":"https://ais.ap.gov.in/Files/01AP039100.jpeg",
"13":"https://ais.ap.gov.in/Files/01AP039000.jpeg",
"14":"https://ais.ap.gov.in/Files/01AP039200.jpeg",
"15":"https://ais.ap.gov.in/Files/01AP035218.jpeg",
"16":"https://ais.ap.gov.in/Files/01AP039400.jpeg",
"17":"https://ais.ap.gov.in/Files/01AP039501.jpeg",
"18":"https://ais.ap.gov.in/Files/01AP039900.jpeg",
"19":"https://ais.ap.gov.in/Files/01AP040100.jpeg",
"20":"https://ais.ap.gov.in/Files/01AP040400.jpeg",
"21":"https://ais.ap.gov.in/Files/01AP040500.jpeg",
"22":"https://ais.ap.gov.in/Files/01AP040600.jpeg",
"23":"https://ais.ap.gov.in/Files/01AP040800.jpeg",
"24":"https://ais.ap.gov.in/Files/01AP041000.jpeg",
"25":"https://ais.ap.gov.in/Files/01AP041300.jpeg",
"26":"https://ais.ap.gov.in/Files/01AP041600.jpeg",
"27":"https://ais.ap.gov.in/Files/01AP041700.jpeg",
"28":"https://ais.ap.gov.in/Files/01AP041900.jpeg",
"29":"https://ais.ap.gov.in/Files/01AP042000.jpeg",
"30":"https://ais.ap.gov.in/Files/01AP808006.jpeg",
"31":"https://ais.ap.gov.in/Files/01AP042400.jpeg",
"32":"https://ais.ap.gov.in/Files/01AP042401.jpeg",
"33":"https://ais.ap.gov.in/Files/01AP042300.jpeg",
"34":"https://ais.ap.gov.in/Files/01AP810008.jpeg",
"35":"https://ais.ap.gov.in/Files/01AP042500.jpeg",
"36":"https://ais.ap.gov.in/Files/01AP042402.jpeg",
"37":"https://ais.ap.gov.in/Files/01AP042600.jpeg",
"38":"https://ais.ap.gov.in/Files/01AP811007.jpeg",
"39":"https://ais.ap.gov.in/Files/01AP811008.jpeg",
"40":"https://ais.ap.gov.in/Files/01AP811010.jpeg",
"41":"https://ais.ap.gov.in/Files/01AP811012.jpeg",
"42":"https://ais.ap.gov.in/Files/01AP042800.jpeg",
"43":"https://ais.ap.gov.in/Files/01AP043000.jpeg",
"44":"https://ais.ap.gov.in/Files/01AP043100.jpeg",
"45":"https://ais.ap.gov.in/Files/01AP812104.jpeg",
"46":"https://ais.ap.gov.in/Files/01AP812105.jpeg",
"47":"https://ais.ap.gov.in/Files/01AP108B03.jpeg",
"48":"https://ais.ap.gov.in/Files/01AP108B04.jpeg",
"49":"https://ais.ap.gov.in/Files/01AP108B05.jpeg",
"50":"https://ais.ap.gov.in/Files/01AP913102.jpeg",
"51":"https://ais.ap.gov.in/Files/01AP109B01.jpeg",
"52":"https://ais.ap.gov.in/Files/01AP109B03.jpeg",
"53":"https://ais.ap.gov.in/Files/01AP109B04.jpeg",
"54":"https://ais.ap.gov.in/Files/01AP109B07.jpeg",
"55":"https://ais.ap.gov.in/Files/01AP813002.jpeg",
"56":"https://ais.ap.gov.in/Files/01AP110B02.jpeg",
"57":"https://ais.ap.gov.in/Files/01AP110B03.jpeg",
"58":"https://ais.ap.gov.in/Files/01AP110B06.jpeg",
"59":"https://ais.ap.gov.in/Files/01AP111B02.jpeg",
"60":"https://ais.ap.gov.in/Files/01AP111B04.jpeg",
"61":"https://ais.ap.gov.in/Files/WhatsApp Image 2025-05-05 at 24989_20250505145436899.jpeg",
"62":"https://ais.ap.gov.in/Files/01AP111B10.jpeg",
"63":"https://ais.ap.gov.in/Files/WhatsApp Image 2024-10-17 at 2e359_20241017163618743.jpeg",
"64":"https://ais.ap.gov.in/Files/Manazir Jeelani Samoom2ce7_20220331152127253.jpg",
"65":"https://ais.ap.gov.in/Files/IPR IASc547_20250527165621072.jpeg",
"66":"https://ais.ap.gov.in/Files/01AP112I03.jpeg",
"67":"https://ais.ap.gov.in/Files/rsp9553_20210810130748296.jpg",
"68":"https://ais.ap.gov.in/Files/01AP112B08.jpeg",
"69":"https://ais.ap.gov.in/Files/01AP112B02.jpeg",
"70":"https://ais.ap.gov.in/Files/01AP112O04.jpeg",
"71":"https://ais.ap.gov.in/Files/WhatsApp Image 2023-04-13 at 3a29f_20230413152516585.jpeg",
"72":"https://ais.ap.gov.in/Files/01AP816001.jpeg",
"73":"https://ais.ap.gov.in/Files/01AP8160037bae_20241021150307281.jpg",
"74":"https://ais.ap.gov.in/Files/unnamed5938_20200228123502683.jpg",
"75":"https://ais.ap.gov.in/Files/01AP816005.jpeg",
"76":"https://ais.ap.gov.in/Files/P Raja Bau5591_20190923172755666.jpg",
"77":"https://ais.ap.gov.in/Files/01AP113B06.jpeg",
"78":"https://ais.ap.gov.in/Files/01AP113B09.jpeg",
"79":"https://ais.ap.gov.in/Files/01AP113B10.jpeg",
"80":"https://ais.ap.gov.in/Files/01AP817001.jpeg",
"81":"https://ais.ap.gov.in/Files/01AP817002_1.jpg",
"82":"https://ais.ap.gov.in/Files/01AP817003.jpeg",
"83":"https://ais.ap.gov.in/Files/01AP817004.jpeg",
"84":"https://ais.ap.gov.in/Files/01AP817005.jpeg",
"85":"https://ais.ap.gov.in/Files/01AP817006.jpeg",
"86":"https://ais.ap.gov.in/Files/Dr K2691_20230627173521982.jpg",
"87":"https://ais.ap.gov.in/Files/01AP817008.jpeg",
"88":"https://ais.ap.gov.in/Files/01AP114B02.jpeg",
"89":"https://ais.ap.gov.in/Files/01AP114B01.jpeg",
"90":"https://ais.ap.gov.in/Files/01AP114B03.jpeg",
"91":"https://ais.ap.gov.in/Files/01AP114B04.jpeg",
"92":"https://ais.ap.gov.in/Files/01AP114B05.jpeg",
"93":"https://ais.ap.gov.in/Files/Thameem Ansariya Acddd_20220331152102675.jpg",
"94":"https://ais.ap.gov.in/Files/Se461_20191112131641386.jpeg",
"95":"https://ais.ap.gov.in/Files/B01ff_20191112131803277.jpeg",
"96":"https://ais.ap.gov.in/Files/A6758_20191112131903761.jpeg",
"97":"https://ais.ap.gov.in/Files/J6e2e_20191112132005355.jpeg",
"98":"https://ais.ap.gov.in/Files/S6775_20191112132111277.jpeg",
"99":"https://ais.ap.gov.in/Files/V89ef_20191112132216793.jpeg",
"100":"https://ais.ap.gov.in/Files/01AP115B01.jpeg",
"101":"https://ais.ap.gov.in/Files/01AP115B02.jpeg",
"102":"https://ais.ap.gov.in/Files/01AP115B04.jpeg",
"103":"https://ais.ap.gov.in/Files/01AP115B05.jpeg",
"104":"https://ais.ap.gov.in/Files/01AP115B06.jpeg",
"105":"https://ais.ap.gov.in/Files/01AP115B07.jpeg",
"106":"https://ais.ap.gov.in/Files/01KL115L06.jpeg",
"107":"https://ais.ap.gov.in/Files/Shyam Prasad0c43_20220331124357969.jpg",
"108":"https://ais.ap.gov.in/Files/Gummala Ganesh Kumar4548_20230104132135915.jpeg",
"109":"https://ais.ap.gov.in/Files/P Sampath Kumar8988_20220331124515297.jpg",
"110":"https://ais.ap.gov.in/Files/Raja Kumarib320_20220331124542423.jpg",
"111":"https://ais.ap.gov.in/Files/B Navya8f99_20220331124611829.jpg",
"112":"https://ais.ap.gov.in/Files/Ronanki Kurmanath7712_20220331124640595.jpg",
"113":"https://ais.ap.gov.in/Files/01AP116B06.jpeg",
"114":"https://ais.ap.gov.in/Files/01AP116B02.jpeg",
"115":"https://ais.ap.gov.in/Files/01AP116B05.jpeg",
"116":"https://ais.ap.gov.in/Files/01AP116B01.jpeg",
"117":"https://ais.ap.gov.in/Files/01AP116B04.jpeg",
"118":"https://ais.ap.gov.in/Files/01AP116B03.jpeg",
"119":"https://ais.ap.gov.in/Files/Ilakkiya  IAS Kerala8313_20220331152021831.jpg",
"120":"https://ais.ap.gov.in/Files/Puli Sreenivasulua90a_20220921110821795.JPG",
"121":"https://ais.ap.gov.in/Files/Anil Kumar Reddy IASf99d_20240212172250452.jpeg",
"122":"https://ais.ap.gov.in/Files/Neelakanta Reddy IAS7dc5_20240213111201344.jpeg",
"123":"https://ais.ap.gov.in/Files/01AP117B01.jpeg",
"124":"https://ais.ap.gov.in/Files/01AP117B03.jpeg",
"125":"https://ais.ap.gov.in/Files/01AP117B05.jpeg",
"126":"https://ais.ap.gov.in/Files/Ketan Gargebdb_20191227155236456.jpg",
"127":"https://ais.ap.gov.in/Files/01AP117B07.jpeg",
"128":"https://ais.ap.gov.in/Files/01AP117B08.jpeg",
"129":"https://ais.ap.gov.in/Files/01AP117B10.jpeg",
"130":"https://ais.ap.gov.in/Files/01AP117B11.jpeg",
"131":"https://ais.ap.gov.in/Files/01AP117B12.jpeg",
"132":"https://ais.ap.gov.in/Files/Kethawate Mayur Ashok -1e651_20220331153107583.jpg",
"133":"https://ais.ap.gov.in/Files/B Srinivasa Rao06f1_20220921110844374.JPG",
"134":"https://ais.ap.gov.in/Files/R Govinda Rao7edd_20220921110901655.JPG",
"135":"https://ais.ap.gov.in/Files/Tejbharath_Namburiea2b_20220919165031654.jpg",
"136":"https://ais.ap.gov.in/Files/D Haritha44f3_20220921110920483.JPG",
"137":"https://ais.ap.gov.in/Files/S Chinna Ramudu4aad_20220921110933889.JPG",
"138":"https://ais.ap.gov.in/Files/Surya Sai Praveenchand9787_20220331151748440.jpg",
"139":"https://ais.ap.gov.in/Files/Bhawna755c_20220331151716284.jpg",
"140":"https://ais.ap.gov.in/Files/Mallarapu Naveen6f65_20220331151647237.jpg",
"141":"https://ais.ap.gov.in/Files/V Abishekab19_20220331151615487.jpg",
"142":"https://ais.ap.gov.in/Files/C Vishnu Charana525_20220331151513315.jpg",
"143":"https://ais.ap.gov.in/Files/Nidhi Meena2bcc_20220331151448924.jpg",
"144":"https://ais.ap.gov.in/Files/Katta Simhachalamc4bc_20220331151403331.jpg",
"145":"https://ais.ap.gov.in/Files/Vikas Marmat7ab9_20220331151333127.jpg",
"146":"https://ais.ap.gov.in/Files/Geetanjali Sharma1374_20220331151303034.jpg",
"147":"https://ais.ap.gov.in/Files/Shubham Bansal26bf_20220331151233299.jpg",
"148":"https://ais.ap.gov.in/Files/Mallarapu Suryateja1f2e_20220331151155221.jpg",
"149":"https://ais.ap.gov.in/Files/Rahul Kumar Reddyf9cb_20220331151119549.jpg",
"150":"https://ais.ap.gov.in/Files/Noorul Quamer-1a670_20220331151051268.jpg",
"151":"https://ais.ap.gov.in/Files/Forman Ahmad Khana3d0_20220331151016549.jpg",
"152":"https://ais.ap.gov.in/Files/Abhisekh Kumar3810_20220331150936268.jpg",
"153":"https://ais.ap.gov.in/Files/Aditi Singhd7be_20220331150907392.jpg",
"154":"https://ais.ap.gov.in/Files/Kollabothula Karthikfa25_20220331150836721.jpg",
"155":"https://ais.ap.gov.in/Files/Shobika331c_20220331150749939.jpg",
"156":"https://ais.ap.gov.in/Files/Photo of Sri Sedhu Madhavan6a25_20220330154603025.jpg",
"157":"https://ais.ap.gov.in/Files/Pedditi Dhatri Reddy IAS AP 20206444_20220728164947777.jpg",
"158":"https://ais.ap.gov.in/Files/Adharsh Rajeendran IAS9c2a_20220730134907985.jpg",
"159":"https://ais.ap.gov.in/Files/Sri Abhishekgowda MJ90e7_20240214115058062.jpeg",
"160":"https://ais.ap.gov.in/Files/Y Megha Swaroop IASbd32_20220730134940516.jpg",
"161":"https://ais.ap.gov.in/Files/Prakhar Jain IASd66c_20220730135014626.jpg",
"162":"https://ais.ap.gov.in/Files/Gobbilla Vidhyadhari IASbc23_20220730135058860.jpg",
"163":"https://ais.ap.gov.in/Files/Shiv Narayan Sharma IASc4e4_20220730135127016.jpg",
"164":"https://ais.ap.gov.in/Files/Ashutosh Shrivastav IAS66ac_20220730135155470.jpg",
"165":"https://ais.ap.gov.in/Files/Apoorva Bharat48ae_20230627172854044.jpg",
"166":"https://ais.ap.gov.in/Files/Rahul Meena129f_20230627172915502.jpg",
"167":"https://ais.ap.gov.in/Files/Surapati Prasanth Kumar5c53_20230627172934029.jpg",
"168":"https://ais.ap.gov.in/Files/Waikhom Nydia devi ias432b_20240625185613448.jpg",
"169":"https://ais.ap.gov.in/Files/Yaswanth Kumar Reddybc95_20230626125329182.jpg",
"170":"https://ais.ap.gov.in/Files/Mantribe61_20230626125738088.jpg",
"171":"https://ais.ap.gov.in/Files/Sanjana Simhac557_20230626130027338.jpg",
"172":"https://ais.ap.gov.in/Files/Tirumani Sri Pooja041d_20230626130000293.jpg",
"173":"https://ais.ap.gov.in/Files/Saurya Man Patel9b41_20230626125838196.jpg",
"174":"https://ais.ap.gov.in/Files/Kalpa Shree K R6e4e_20230626125413941.jpg",
"175":"https://ais.ap.gov.in/Files/Raghvenfra Meenab6a3_20230626125809745.jpg",
"176":"https://ais.ap.gov.in/Files/Sahadit Venkat Trivinag40cf_20230626125255404.jpg",
"177":"https://ais.ap.gov.in/Files/Bachu Smaran Raj4ded_20230626125204968.jpg",
"178":"https://ais.ap.gov.in/Files/H S Bhavana7346_20250128132509798.jpg",
"179":"https://ais.ap.gov.in/Files/Challa Kalyani-0000e980_20250128132901056.jpg",
"180":"https://ais.ap.gov.in/Files/Pawar Swapnil jagannath-00009dc1_20250128133243430.jpg",
"181":"https://ais.ap.gov.in/Files/Shubham Nokwhal-0000aa10_20250128133501803.jpg",
"182":"https://ais.ap.gov.in/Files/Bollipalli Vinutna-00008771_20250128133739498.jpg",
"183":"https://ais.ap.gov.in/Files/Hima Vamshee-000005cb_20250128134141881.jpg",
"184":"https://ais.ap.gov.in/Files/download-00007de0_20250529111732545.jpg",
"185":"https://ais.ap.gov.in/Files/Farheen Zahid IAS 2024-00008e51_20250528104558808.jpg",
"186":"https://ais.ap.gov.in/Files/Manisha IAS 2024-0000ad46_20250528104946069.jpg",
"187":"https://ais.ap.gov.in/Files/Sandeep Raghuwanshi IAS 2024-000012fa_20250528105253913.jpg",
"188":"https://ais.ap.gov.in/Files/Sri Sachin Rahar IAS 2024-00005042_20250528105519599.jpg",
"189":"https://ais.ap.gov.in/Files/Sri Kanala Chirajeevi Naga Venkat Sahith IAS 2024-0000f1cc_20250528110010394.jpg",
"190":"https://ais.ap.gov.in/Files/Sri Donaka Prudhvi Raj Kumar IAS 2024-0000c2ed_20250528110259386.jpg",
"191":"https://ais.ap.gov.in/Files/Sri Chittapuli Narendra Padal IAS 2024-00009f24_20250528110517002.jpg"
};
const categoryOrder = [
  "AGRICULTURE & ALLIED", "ENERGY, INFRA & INDUSTRIES", "FINANCE",
  "IT & OTHER TECH", "LOCAL BODIES ADMINISTRATION", "REGULATORY",
  "WELFARE & DEVELOPMENT", "PERSONAL OFFICE", "DISTRICT ADMINISTRATION", "PROBATION, TRAINING , LEAVE, COMPULSORY WAIT ETC"
];

const customDepartmentOrder = {
  "AGRICULTURE & ALLIED": ["AGRICULTURE", "AH,FISHERIES ETC", "HORTICULTURE"],
  "ENERGY, INFRA & INDUSTRIES": ["ENERGY", "INDUSTRIES & INFRASTRUCTURE", "HANDLOOM & TEXTILES", "WATER RESOURCE", "ROADS & BUILDINGS", "TOURISM"],
  "FINANCE": ["FINANCE", "COMMERCIAL TAX"],
  "IT & OTHER TECH": ["APSFL", "APTS", "E-SEVA", "IT & ELECTRONICS", "RTGS"],
  "LOCAL BODIES ADMINISTRATION": ["MAUD", "CRDA & AMRDA", "MUNICIPAL COMMISSIONER", "PR & RD", "GSWS"],
  "REGULATORY": ["PLANNING", "GAD", "REVENUE (LANDS)", "ENDOWMENT", "TTD", "PROHIBITION & EXCISE", "STAMPS & REGISTRATION", "DISASTER MANAGEMENT", "MINES & GEOLOGY", "COE & APVC", "EFST", "ELECTION COMMISION", "LABOUR", "TRANSPORT"],
  "WELFARE & DEVELOPMENT": ["WELFARE", "EDUCATION", "HEALTH", "SKILL DEVELOPMENT", "FOOD & CIVIL SUPPLIES", "HOUSING", "YOUTH, SPORTS & CULTURE"],
  "PERSONAL OFFICE": ["GOVERNORS OFFICE", "PRIME MINISTERS OFFICE", "CHIEF MINISTERS OFFICE"],
  "DISTRICT ADMINISTRATION": ["DISTRICT COLLECTOR", "JOINT COLLECTOR", "SUB COLLECTOR", "PO ITDA", "ASSISTANT COLLECTOR (TRAINEE)", "OTHER DIST POSTS"],
  "PROBATION, TRAINING , LEAVE, COMPULSORY WAIT ETC": ["PROBATION & TRAINING", "COMPULSORY WAIT", "LEAVE"]
};

fetch('officerDataIAS.json')
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