/* ============================================================
   ShiftSnap V5 — Heritage Milk Processing Unit
   Shift duty allocation. Pure frontend — localStorage state,
   html2canvas export, Web Share API for WhatsApp.
   ============================================================ */

/* -------------------- Constants -------------------- */

const LS = {
  employees:'ss_employees', lang:'ss_lang', company:'ss_company',
  department:'ss_department', tagline:'ss_tagline', logo:'ss_logo',
  allotter:'ss_allotter', designation:'ss_designation',
  assignments:'ss_assignments', notes:'ss_notes', date:'ss_date',
  history:'ss_history', dark:'ss_dark'
};

/* Default Heritage logo — paste your base64 data URL here
   (see: base64 -w0 heritage-logo.png) */
const DEFAULT_LOGO = null; // e.g. 'data:image/png;base64,iVBORw0K...'

const DEFAULT_EMPLOYEES = ['Bhushan','Ramesh','Nagu','Gangaraju','Prasad',
  'Srinu','Venkatrao','Rajkumar','Naidu','Trinadh'];

const SHIFTS = [
  { id:'a',  key:'shiftA',    color:'#2563EB' },
  { id:'b',  key:'shiftB',    color:'#1B7A43' },
  { id:'c',  key:'shiftC',    color:'#F97316' },
  { id:'g',  key:'shiftG',    color:'#7C3AED' },
  { id:'wo', key:'weeklyOff', color:'#64748B' },
  { id:'lv', key:'leave',     color:'#EF4444' }
];
const NA = 'na';
const SHORT = { a:'A', b:'B', c:'C', g:'G', wo:'W/O', lv:'LV' };
const AVATAR_COLORS = ['#2563EB','#1B7A43','#F97316','#7C3AED','#0EA5E9','#EF4444','#F59E0B','#14B8A6','#8B5CF6','#64748B'];

/* -------------------- i18n -------------------- */

const I18N = {
  en: {
    app:'ShiftSnap V5', subtitle:'Heritage Milk Processing Unit',
    tagline:'QUALITY • HYGIENE • TRUST',
    allot:'Allot', employees:'Employees', settings:'Settings', history:'History',
    date:'Date', copyYesterday:'Copy Yesterday', notes:'Notes (optional)',
    notesPh:'Maintenance activity, cleaning work, special instructions…',
    quickActions:'Quick Actions', clearAll:'Clear All', cleared:'All assignments cleared',
    overview:'Staff Overview', totalStaff:'Total Staff', assigned:'Assigned',
    weeklyOff:'Weekly Off', onLeave:'Leave',
    assignments:'Shift Assignments', shiftSummary:'Shift Summary',
    preview:'Duty Card Preview', expand:'Expand',
    searchPh:'Search employees…', all:'All', noMatch:'No matching employees',
    exportPng:'Export PNG', copyText:'Copy Text',
    saveToHistory:'Save History', share:'Share', shareText:'Shift Duty',
    addEmployee:'Add Employee', empNamePh:'Employee name',
    edit:'Edit', delete:'Delete', save:'Save Settings', cancel:'Cancel',
    notAssigned:'Not Assigned',
    shiftA:'A Shift', shiftB:'B Shift', shiftC:'C Shift', shiftG:'G Shift',
    weeklyOff:'Weekly Off', leave:'Leave',
    companySettings:'Company Settings', companyName:'Company Name',
    department:'Department Name', taglineLbl:'Tagline', allotter:'Allotter Name',
    designation:'Designation', logo:'Heritage Logo', uploadLogo:'Upload Logo',
    removeLogo:'Remove Logo',
    noticeTitle:'SHIFT DUTY CARD', dateLbl:'Date',
    allottedBy:'ALLOTTED BY', generatedAt:'GENERATED AT', notesLbl:'NOTES',
    today:'Today', yesterday:'Yesterday', older:'Older Records',
    view:'View', load:'Load', reuse:'Reuse', close:'Close', export:'Export PNG',
    noEmployees:'No employees yet. Add some first.',
    noHistory:'No saved schedules yet. Save one from the Allot tab.',
    copied:'Copied to clipboard', loaded:'Schedule loaded',
    noPrev:'No previous schedule found', savedToHistory:'Saved to history',
    settingsSaved:'Settings saved', logoRemoved:'Logo removed',
    added:'Added', updated:'Updated', removed:'Removed',
    confirmDelete:'Delete this employee?', historyView:'Saved Schedule'
  },
  te: {
    app:'ShiftSnap V5', subtitle:'హెరిటేజ్ మిల్క్ ప్రాసెసింగ్ యూనిట్',
    tagline:'నాణ్యత • పరిశుభ్రత • విశ్వాసం',
    allot:'కేటాయింపు', employees:'ఉద్యోగులు', settings:'సెట్టింగ్స్', history:'చరిత్ర',
    date:'తేదీ', copyYesterday:'నిన్నటి కాపీ', notes:'గమనికలు (ఐచ్ఛికం)',
    notesPh:'నిర్వహణ పనులు, శుభ్రపరచడం, ప్రత్యేక సూచనలు…',
    quickActions:'త్వరిత చర్యలు', clearAll:'అన్నీ క్లియర్', cleared:'అన్ని కేటాయింపులు క్లియర్ అయ్యాయి',
    overview:'సిబ్బంది సారాంశం', totalStaff:'మొత్తం సిబ్బంది', assigned:'కేటాయించినవారు',
    weeklyOff:'వీక్లీ ఆఫ్', onLeave:'సెలవు',
    assignments:'షిఫ్ట్ కేటాయింపులు', shiftSummary:'షిఫ్ట్ సారాంశం',
    preview:'డ్యూటీ కార్డ్ ప్రివ్యూ', expand:'విస్తరించండి',
    searchPh:'ఉద్యోగులను వెతకండి…', all:'అన్నీ', noMatch:'సరిపోలిన ఉద్యోగులు లేరు',
    exportPng:'PNG డౌన్లోడ్', copyText:'టెక్స్ట్ కాపీ',
    saveToHistory:'చరిత్రలో సేవ్', share:'షేర్', shareText:'షిఫ్ట్ డ్యూటీ',
    addEmployee:'ఉద్యోగిని జోడించండి', empNamePh:'ఉద్యోగి పేరు',
    edit:'మార్చండి', delete:'తొలగించండి', save:'సేవ్ చేయండి', cancel:'రద్దు',
    notAssigned:'కేటాయించలేదు',
    shiftA:'ఎ షిఫ్ట్', shiftB:'బి షిఫ్ట్', shiftC:'సి షిఫ్ట్', shiftG:'జి షిఫ్ట్',
    weeklyOff:'వీక్లీ ఆఫ్', leave:'సెలవు',
    companySettings:'కంపెనీ సెట్టింగ్స్', companyName:'కంపెనీ పేరు',
    department:'డిపార్ట్మెంట్ పేరు', taglineLbl:'ట్యాగ్లైన్', allotter:'కేటాయించే వ్యక్తి',
    designation:'హోదా', logo:'హెరిటేజ్ లోగో', uploadLogo:'లోగో అప్లోడ్ చేయండి',
    removeLogo:'లోగో తొలగించండి',
    noticeTitle:'షిఫ్ట్ డ్యూటీ కార్డ్', dateLbl:'తేదీ',
    allottedBy:'కేటాయించిన వారు', generatedAt:'తయారైన సమయం', notesLbl:'గమనికలు',
    today:'ఈరోజు', yesterday:'నిన్న', older:'పాత రికార్డులు',
    view:'చూడండి', load:'లోడ్', reuse:'మళ్లీ ఉపయోగించండి', close:'మూసివేయండి', export:'PNG ఎగుమతి',
    noEmployees:'ఇంకా ఉద్యోగులు లేరు. ముందుగా జోడించండి.',
    noHistory:'ఇంకా సేవ్ చేసిన షెడ్యూల్ లేదు.',
    copied:'క్లిప్బోర్డ్కు కాపీ అయింది', loaded:'షెడ్యూల్ లోడ్ అయింది',
    noPrev:'మునుపటి షెడ్యూల్ కనుగొనబడలేదు', savedToHistory:'చరిత్రలో సేవ్ అయింది',
    settingsSaved:'సెట్టింగ్స్ సేవ్ అయ్యాయి', logoRemoved:'లోగో తొలగించబడింది',
    added:'జోడించబడింది', updated:'నవీకరించబడింది', removed:'తొలగించబడింది',
    confirmDelete:'ఈ ఉద్యోగిని తొలగించాలా?', historyView:'సేవ్ చేసిన షెడ్యూల్'
  }
};

/* -------------------- State -------------------- */

let state = {
  lang:'en', dark:false,
  employees:[],
  company:'Milk Processing Unit',
  department:'Heritage Dairy',
  tagline:'', logo:null,
  allotter:'Sudhakar Batta', designation:'Shift Supervisor',
  assignments:{}, notes:'', date:'', history:[],
  searchQuery:'', shiftFilter:'all'
};
let currentViewingRecord = null;
let toastTimer = null;

/* -------------------- Storage -------------------- */

function saveLS(key, value){
  try{
    if (value === null || value === undefined){ localStorage.removeItem(key); return; }
    localStorage.setItem(key, JSON.stringify(value));
  }catch(e){ showToast('Storage full'); }
}
function loadLS(key, fallback){
  try{ const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
  catch(e){ return fallback; }
}
function setRaw(key, value){
  try{
    if (value === null || value === undefined){ localStorage.removeItem(key); return; }
    localStorage.setItem(key, value);
  }catch(e){ showToast('Storage full'); }
}
function getRaw(key){ try{ return localStorage.getItem(key); }catch(e){ return null; } }

/* -------------------- i18n -------------------- */

function t(key){
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
}
function applyLanguage(){
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.getElementById('langToggle').textContent = state.lang === 'en' ? 'తెలుగు' : 'English';
  document.getElementById('notesInput').placeholder = t('notesPh');
  document.getElementById('newEmployeeInput').placeholder = t('empNamePh');
  document.getElementById('searchInput').placeholder = t('searchPh');
  renderEmployees();
  renderAssignmentList();
  renderFilterChips();
  updateLive();
  renderHistory();
}

/* -------------------- Date helpers -------------------- */

function toISO(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function todayStr(){ return toISO(new Date()); }
function yesterdayStr(){ const d = new Date(); d.setDate(d.getDate()-1); return toISO(d); }
function parseDateStr(s){ if (!s) return null; const p = s.split('-').map(Number); return new Date(p[0], p[1]-1, p[2]); }
function fmtDate(input){
  const d = (input instanceof Date) ? input : parseDateStr(input);
  if (!d || isNaN(d)) return '—';
  return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
}
function formatTime(d){
  let h = d.getHours(), m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ' ' + ap;
}

/* -------------------- Misc helpers -------------------- */

function escapeHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function showToast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 1800);
}
function switchTab(id){
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === id));
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
}
function applyDark(){
  document.body.classList.toggle('dark', state.dark);
  document.getElementById('darkToggle').textContent = state.dark ? '☀️' : '🌙';
}
function initials(name){
  const w = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return '?';
  return (w[0][0] + (w[1] ? w[1][0] : '')).toUpperCase();
}
function avatarColor(i){ return AVATAR_COLORS[i % AVATAR_COLORS.length]; }

/* -------------------- Duplicate-prevention --------------------
   Every employee has exactly one dropdown, so an employee can
   never appear in two shifts. As an extra safeguard we:
   1) normalize all assignments on load (valid ids only), and
   2) dedupe names when rendering each section.
   ------------------------------------------------------------- */

function normalizeAssignments(){
  const valid = new Set(SHIFTS.map(s => s.id));
  state.employees.forEach(n => {
    const v = state.assignments[n];
    if (!valid.has(v)) state.assignments[n] = NA;
  });
}

function assignedNames(assignments, shiftId){
  const seen = new Set();
  const out = [];
  Object.entries(assignments || {}).forEach(([n, v]) => {
    if (v === shiftId && !seen.has(n)){ seen.add(n); out.push(n); }
  });
  return out;
}

/* -------------------- Live renders -------------------- */

function updateLive(){ renderCounters(); renderStats(); renderNotice(); }

function renderCounters(){
  const counts = countShiftsFor(state.assignments);
  document.getElementById('counters').innerHTML = SHIFTS.map(s => `
    <div class="counter grad-${s.id}">
      <div class="num">${counts[s.id]}</div>
      <div class="lbl">${t(s.key)}</div>
    </div>`).join('');
}

function countShiftsFor(assignments){
  const c = { a:0, b:0, c:0, g:0, wo:0, lv:0 };
  Object.entries(assignments || {}).forEach(([, v]) => { if (c[v] !== undefined) c[v]++; });
  return c;
}

function renderStats(){
  let a=0,b=0,c=0,g=0,wo=0,lv=0;
  state.employees.forEach(n => {
    const v = state.assignments[n] || NA;
    if (v==='a') a++; else if (v==='b') b++; else if (v==='c') c++;
    else if (v==='g') g++; else if (v==='wo') wo++; else if (v==='lv') lv++;
  });
  const tiles = [
    { icon:'👥', cls:'ic-royal',   label:t('totalStaff'), value:state.employees.length },
    { icon:'⚙️', cls:'ic-success', label:t('assigned'),   value:a+b+c+g },
    { icon:'📅', cls:'ic-gray',    label:t('weeklyOff'),  value:wo },
    { icon:'🏖️', cls:'ic-danger',  label:t('onLeave'),    value:lv }
  ];
  document.getElementById('statsRow').innerHTML = tiles.map(ti => `
    <div class="stat-tile">
      <div class="stat-icon ${ti.cls}">${ti.icon}</div>
      <div class="stat-val">${ti.value}</div>
      <div class="stat-lbl">${ti.label}</div>
    </div>`).join('');
}

/* -------------------- Assignment list + search/filter -------------------- */

function renderAssignmentList(){
  const wrap = document.getElementById('assignmentList');
  const empty = document.getElementById('assignEmpty');
  if (!state.employees.length){
    wrap.innerHTML = '';
    empty.style.display = '';
    empty.textContent = t('noEmployees');
    return;
  }
  empty.style.display = 'none';
  wrap.innerHTML = state.employees.map((name, i) => {
    const val = state.assignments[name] || NA;
    const selected = id => (val === id ? 'selected' : '');
    return `
      <div class="assign-row" data-index="${i}">
        <div class="avatar-sm" style="background:${avatarColor(i)}">${initials(name)}</div>
        <span class="emp-name">${escapeHtml(name)}</span>
        <select class="assign-select" data-index="${i}">
          <option value="${NA}" ${selected(NA)}>${t('notAssigned')}</option>
          ${SHIFTS.map(s => `<option value="${s.id}" ${selected(s.id)}>${t(s.key)}</option>`).join('')}
        </select>
      </div>`;
  }).join('');
  applyAssignmentFilter();
}

function applyAssignmentFilter(){
  const q = (state.searchQuery || '').toLowerCase().trim();
  const f = state.shiftFilter || 'all';
  let visible = 0;
  document.querySelectorAll('#assignmentList .assign-row').forEach(row => {
    const idx = +row.dataset.index;
    const name = state.employees[idx];
    const val = state.assignments[name] || NA;
    const matchQ = !q || name.toLowerCase().includes(q);
    const matchF = f === 'all' || (f === 'na' ? val === NA : val === f);
    const show = matchQ && matchF;
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const empty = document.getElementById('assignEmpty');
  if (empty){ empty.style.display = visible ? 'none' : ''; empty.textContent = t('noMatch'); }
}

function renderFilterChips(){
  const opts = [{ id:'all', label:t('all') }, { id:'na', label:t('notAssigned') }]
    .concat(SHIFTS.map(s => ({ id:s.id, label:t(s.key) })));
  document.getElementById('filterChips').innerHTML = opts.map(o => `
    <button class="chip ${state.shiftFilter === o.id ? 'active' : ''}" data-filter="${o.id}" type="button">${o.label}</button>`).join('');
}

function clearAllAssignments(){
  state.employees.forEach(n => { state.assignments[n] = NA; });
  persistData();
  renderAssignmentList();
  updateLive();
  showToast(t('cleared'));
}

/* -------------------- Shift Duty Card rendering -------------------- */

function companyInitials(){
  const words = (state.company || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'SS';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function renderNotice(){
  renderNoticeInto(document.getElementById('notice'), {
    date: state.date, assignments: state.assignments, notes: state.notes
  });
}

function renderNoticeInto(el, data, generatedAt){
  const counts = countShiftsFor(data.assignments);
  const dateStr = fmtDate(data.date);
  const now = generatedAt ? new Date(generatedAt) : new Date();

  const logoHtml = state.logo
    ? `<div class="r-logo" style="background-image:url('${state.logo}')"></div>`
    : `<div class="r-logo r-logo-fallback">${escapeHtml(companyInitials())}</div>`;

  let sections = '';
  SHIFTS.forEach(s => {
    const names = assignedNames(data.assignments, s.id);
    if (!names.length) return;
    sections += `
      <div class="r-sec sc-${s.id}">
        <div class="r-sec-title">${t(s.key)}</div>
        ${names.map(n => `<div class="r-name"><span class="r-dot">•</span>${escapeHtml(n)}</div>`).join('')}
      </div>`;
  });

  const notesHtml = (data.notes && data.notes.trim()) ? `
    <div class="r-notes">
      <div class="r-notes-title">${t('notesLbl')}</div>
      <div class="r-notes-body">${escapeHtml(data.notes.trim())}</div>
    </div>` : '';

  el.innerHTML = `
    <div class="r-header">
      ${logoHtml}
      <div class="r-company">${escapeHtml(state.company || t('app'))}</div>
      <div class="r-title">${t('noticeTitle')}</div>
      <div class="r-date">${t('dateLbl')} : ${dateStr}</div>
    </div>
    <div class="r-rule"></div>
    ${sections || `<div class="empty-note">—</div>`}
    ${notesHtml ? `<div class="r-rule"></div>${notesHtml}` : ''}
    <div class="r-rule"></div>
    <div class="r-footer">
      <div class="r-foot-col">
        <div class="r-foot-label">${t('allottedBy')}</div>
        <div class="r-foot-val">${escapeHtml(state.allotter || '—')}</div>
        <div class="r-foot-sub">${escapeHtml(state.designation || '')}</div>
      </div>
      <div class="r-foot-col right">
        <div class="r-foot-label">${t('generatedAt')}</div>
        <div class="r-foot-val">${formatTime(now)}</div>
        <div class="r-foot-sub">${fmtDate(now)}</div>
      </div>
    </div>`;
}

/* -------------------- Export / Share -------------------- */

function waitForImages(root){
  const imgs = Array.from(root.querySelectorAll('img'));
  return Promise.all(imgs.map(img => {
    if (img.complete && img.naturalWidth) return Promise.resolve();
    return new Promise(res => { img.onload = img.onerror = res; });
  }));
}

async function buildPNGCanvas(sourceEl){
  if (typeof html2canvas === 'undefined') throw new Error('html2canvas not loaded');
  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-9999px;top:0;width:460px;z-index:-1;';
  const clone = sourceEl.cloneNode(true);
  clone.style.width = '100%';
  holder.appendChild(clone);
  document.body.appendChild(holder);
  try{
    await waitForImages(clone);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    return await html2canvas(clone, { scale:2, backgroundColor:'#ffffff', useCORS:true, logging:false });
  }finally{
    document.body.removeChild(holder);
  }
}

function noticeFilename(dateForName){
  return 'Shift-Duty-' + fmtDate(dateForName).replace(/\//g, '-') + '.png';
}

async function exportPNG(sourceEl, dateForName){
  showToast('Generating…');
  try{
    const canvas = await buildPNGCanvas(sourceEl);
    const link = document.createElement('a');
    link.download = noticeFilename(dateForName);
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('PNG saved 📷');
  }catch(err){ console.error(err); showToast('Export failed'); }
}

async function sharePNG(sourceEl, dateForName){
  showToast('Generating…');
  try{
    const canvas = await buildPNGCanvas(sourceEl);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (!blob) throw new Error('toBlob failed');
    const file = new File([blob], noticeFilename(dateForName), { type:'image/png' });
    if (navigator.canShare && navigator.canShare({ files:[file] })){
      await navigator.share({ files:[file], title:'ShiftSnap V5 — ' + fmtDate(dateForName), text:t('shareText') + ' ' + fmtDate(dateForName) });
    }else{
      const link = document.createElement('a');
      link.download = noticeFilename(dateForName);
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Sharing not supported — PNG downloaded');
    }
  }catch(err){
    if (err && err.name === 'AbortError') return;
    console.error(err);
    showToast('Share failed');
  }
}

/* -------------------- Copy text -------------------- */

async function copyText(){
  const lines = [fmtDate(state.date), ''];
  SHIFTS.forEach(s => {
    const names = assignedNames(state.assignments, s.id);
    if (!names.length) return;
    lines.push(t(s.key).toUpperCase());
    names.forEach(n => lines.push(n));
    lines.push('');
  });
  const txt = lines.join('\n').trim();
  try{
    await navigator.clipboard.writeText(txt);
    showToast(t('copied'));
  }catch(e){
    const ta = document.createElement('textarea');
    ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); showToast(t('copied')); }
    catch(_){ showToast('Copy failed'); }
    document.body.removeChild(ta);
  }
}

/* -------------------- Employees -------------------- */

function renderEmployees(){
  const wrap = document.getElementById('employeeList');
  if (!state.employees.length){
    wrap.innerHTML = `<p class="empty-note">${t('noEmployees')}</p>`;
    return;
  }
  wrap.innerHTML = state.employees.map((name, i) => `
    <div class="emp-row" data-index="${i}">
      <div class="avatar-sm" style="background:${avatarColor(i)}">${initials(name)}</div>
      <span class="emp-name">${escapeHtml(name)}</span>
      <div class="emp-actions">
        <button class="icon-btn" data-action="edit" data-index="${i}" type="button">✏️</button>
        <button class="icon-btn" data-action="delete" data-index="${i}" type="button">🗑️</button>
      </div>
    </div>`).join('');
}

function addEmployee(){
  const input = document.getElementById('newEmployeeInput');
  const name = input.value.trim().replace(/\s+/g, ' ');
  if (!name) return;
  if (state.employees.some(e => e.toLowerCase() === name.toLowerCase())){ showToast('Duplicate'); return; }
  state.employees.push(name);
  state.assignments[name] = NA;
  persistData();
  renderEmployees();
  renderAssignmentList();
  updateLive();
  input.value = '';
  showToast(t('added'));
}

function startEdit(index){
  const row = document.querySelector(`.emp-row[data-index="${index}"]`);
  if (!row) return;
  const nameEl = row.querySelector('.emp-name');
  const actions = row.querySelector('.emp-actions');
  nameEl.innerHTML = `<input class="input edit-input" value="${escapeHtml(state.employees[index])}">`;
  actions.innerHTML = `
    <button class="icon-btn ok" data-action="save" data-index="${index}" type="button">✔</button>
    <button class="icon-btn cancel" data-action="cancel" data-index="${index}" type="button">✖</button>`;
  row.querySelector('.edit-input').focus();
}

function saveEdit(index){
  const row = document.querySelector(`.emp-row[data-index="${index}"]`);
  if (!row) return;
  const input = row.querySelector('.edit-input');
  if (!input) return;
  const val = input.value.trim().replace(/\s+/g, ' ');
  if (!val){ renderEmployees(); return; }
  const oldName = state.employees[index];
  if (val !== oldName){
    if (state.employees.some((e, i) => i !== index && e.toLowerCase() === val.toLowerCase())){ showToast('Duplicate'); return; }
    const asg = state.assignments[oldName] || NA;
    delete state.assignments[oldName];
    state.employees[index] = val;
    state.assignments[val] = asg;
  }
  persistData();
  renderEmployees();
  renderAssignmentList();
  updateLive();
  showToast(t('updated'));
}

function deleteEmployee(index){
  if (!confirm(t('confirmDelete'))) return;
  const name = state.employees[index];
  state.employees.splice(index, 1);
  delete state.assignments[name];
  persistData();
  renderEmployees();
  renderAssignmentList();
  updateLive();
  showToast(t('removed'));
}

/* -------------------- Settings -------------------- */

function loadSettingsInputs(){
  document.getElementById('companyInput').value = state.company;
  document.getElementById('deptInput').value = state.department;
  document.getElementById('taglineInput').value = state.tagline;
  document.getElementById('allotterInput').value = state.allotter;
  document.getElementById('designationInput').value = state.designation;
  const lp = document.getElementById('logoPreview');
  const li = document.getElementById('logoPreviewImg');
  if (state.logo){
    lp.hidden = false; li.src = state.logo;
    document.getElementById('removeLogoBtn').hidden = false;
  }else{
    lp.hidden = true;
    document.getElementById('removeLogoBtn').hidden = true;
  }
}

function saveSettings(){
  state.company = document.getElementById('companyInput').value.trim() || state.company;
  state.department = document.getElementById('deptInput').value.trim() || state.department;
  state.tagline = document.getElementById('taglineInput').value.trim();
  state.allotter = document.getElementById('allotterInput').value.trim() || state.allotter;
  state.designation = document.getElementById('designationInput').value.trim() || state.designation;
  persistData();
  updateLive();
  showToast(t('settingsSaved'));
}

/* -------------------- History -------------------- */

function saveHistory(){
  const date = state.date;
  let rec = state.history.find(r => r.date === date);
  if (rec){
    rec.assignments = { ...state.assignments };
    rec.notes = state.notes;
    rec.savedAt = Date.now();
  }else{
    state.history.unshift({ id:Date.now(), date, assignments:{ ...state.assignments }, notes:state.notes, savedAt:Date.now() });
  }
  persistData();
  renderHistory();
  showToast(t('savedToHistory'));
}

function renderHistory(){
  const wrap = document.getElementById('historyList');
  if (!state.history.length){
    wrap.innerHTML = `<p class="empty-note">${t('noHistory')}</p>`;
    return;
  }
  const today = todayStr(), yest = yesterdayStr();
  const groups = [
    { label:t('today'),     filter:r => r.date === today },
    { label:t('yesterday'), filter:r => r.date === yest },
    { label:t('older'),     filter:r => r.date !== today && r.date !== yest }
  ];
  let html = '';
  groups.forEach(g => {
    const items = state.history.filter(g.filter);
    if (!items.length) return;
    html += `<h3 class="hist-group">${g.label}</h3>`;
    items.forEach(r => {
      const counts = countShiftsFor(r.assignments);
      const chips = SHIFTS.map(s => `<span class="h-chip sc-${s.id}">${SHORT[s.id]} ${counts[s.id]}</span>`).join('');
      html += `
        <div class="hist-card">
          <div class="hist-head">
            <strong>${fmtDate(r.date)}</strong>
            <span class="hist-time">${formatTime(new Date(r.savedAt))}</span>
          </div>
          <div class="h-chips">${chips}</div>
          ${r.notes ? `<div class="h-notes">${escapeHtml(r.notes)}</div>` : ''}
          <div class="hist-actions">
            <button class="btn btn-secondary btn-sm" data-action="view" data-id="${r.id}" type="button">${t('view')}</button>
            <button class="btn btn-secondary btn-sm" data-action="load" data-id="${r.id}" type="button">${t('load')}</button>
            <button class="btn btn-secondary btn-sm" data-action="reuse" data-id="${r.id}" type="button">${t('reuse')}</button>
            <button class="btn btn-danger-ghost btn-sm" data-action="delete" data-id="${r.id}" type="button">${t('delete')}</button>
          </div>
        </div>`;
    });
  });
  wrap.innerHTML = html;
}

function showHistoryModal(record){
  currentViewingRecord = record;
  document.getElementById('modalTitle').textContent = t('historyView') + ' — ' + fmtDate(record.date);
  renderNoticeInto(document.getElementById('viewNotice'), {
    date:record.date, assignments:record.assignments, notes:record.notes
  }, record.savedAt);
  document.getElementById('modalOverlay').hidden = false;
}

function loadRecord(record){
  state.assignments = { ...record.assignments };
  state.notes = record.notes;
  state.date = record.date;
  document.getElementById('dateInput').value = record.date;
  document.getElementById('notesInput').value = record.notes;
  normalizeAssignments();
  persistData();
  renderAssignmentList();
  updateLive();
  switchTab('screen-allot');
  showToast(t('loaded'));
}

function copyYesterday(){
  let rec = state.history.find(r => r.date === yesterdayStr());
  if (!rec){
    rec = [...state.history].sort((a, b) => b.date.localeCompare(a.date)).find(r => r.date < state.date);
  }
  if (!rec){ showToast(t('noPrev')); return; }
  loadRecord(rec);
}

/* -------------------- Persistence -------------------- */

function loadState(){
  state.lang        = loadLS(LS.lang, 'en');
  state.dark        = loadLS(LS.dark, false);
  state.employees   = loadLS(LS.employees, DEFAULT_EMPLOYEES.slice());
  state.company     = loadLS(LS.company, 'Milk Processing Unit');
  state.department  = loadLS(LS.department, 'Heritage Dairy');
  state.tagline     = loadLS(LS.tagline, '');
  state.allotter    = loadLS(LS.allotter, 'Sudhakar Batta');
  state.designation = loadLS(LS.designation, 'Shift Supervisor');
  state.assignments = loadLS(LS.assignments, {});
  state.notes       = loadLS(LS.notes, '');
  state.date        = loadLS(LS.date, todayStr());
  state.history     = loadLS(LS.history, []);
  const savedLogo   = getRaw(LS.logo);
  state.logo        = savedLogo === 'none' ? null : (savedLogo || DEFAULT_LOGO);
  state.employees.forEach(n => { if (state.assignments[n] === undefined) state.assignments[n] = NA; });
  normalizeAssignments();
}

function persistData(){
  saveLS(LS.lang, state.lang);
  saveLS(LS.dark, state.dark);
  saveLS(LS.employees, state.employees);
  saveLS(LS.company, state.company);
  saveLS(LS.department, state.department);
  saveLS(LS.tagline, state.tagline);
  saveLS(LS.allotter, state.allotter);
  saveLS(LS.designation, state.designation);
  saveLS(LS.assignments, state.assignments);
  saveLS(LS.notes, state.notes);
  saveLS(LS.date, state.date);
  saveLS(LS.history, state.history);
  setRaw(LS.logo, state.logo);
}

/* -------------------- Events -------------------- */

function wireEvents(){
  document.getElementById('langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'te' : 'en';
    saveLS(LS.lang, state.lang);
    applyLanguage();
  });
  document.getElementById('darkToggle').addEventListener('click', () => {
    state.dark = !state.dark;
    saveLS(LS.dark, state.dark);
    applyDark();
  });

  document.getElementById('dateInput').addEventListener('change', e => {
    state.date = e.target.value;
    saveLS(LS.date, state.date);
    renderNotice();
  });
  document.getElementById('notesInput').addEventListener('input', e => {
    state.notes = e.target.value;
    persistData();
    renderNotice();
  });

  document.getElementById('copyYesterdayBtn').addEventListener('click', copyYesterday);
  document.getElementById('clearAllBtn').addEventListener('click', clearAllAssignments);

  document.getElementById('exportPngBtn').addEventListener('click', () => {
    renderNotice();
    exportPNG(document.getElementById('notice'), state.date);
  });
  document.getElementById('sharePngBtn').addEventListener('click', () => {
    renderNotice();
    sharePNG(document.getElementById('notice'), state.date);
  });
  document.getElementById('copyTextBtn').addEventListener('click', copyText);
  document.getElementById('saveHistoryBtn').addEventListener('click', saveHistory);

  document.getElementById('expandBtn').addEventListener('click', () => {
    currentViewingRecord = null;
    renderNoticeInto(document.getElementById('viewNotice'), {
      date:state.date, assignments:state.assignments, notes:state.notes
    }, Date.now());
    document.getElementById('modalTitle').textContent = t('preview');
    document.getElementById('modalOverlay').hidden = false;
  });

  document.getElementById('searchInput').addEventListener('input', e => {
    state.searchQuery = e.target.value;
    applyAssignmentFilter();
  });
  document.getElementById('filterToggle').addEventListener('click', () => {
    document.getElementById('filterChips').hidden = !document.getElementById('filterChips').hidden;
  });
  document.getElementById('filterChips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.shiftFilter = chip.dataset.filter;
    renderFilterChips();
    applyAssignmentFilter();
  });

  document.getElementById('addEmployeeBtn').addEventListener('click', addEmployee);
  document.getElementById('newEmployeeInput').addEventListener('keydown', e => {
    if (e.key === 'Enter'){ e.preventDefault(); addEmployee(); }
  });
  document.getElementById('employeeList').addEventListener('click', e => {
    const btn = e.target.closest('.icon-btn');
    if (!btn) return;
    const idx = +btn.dataset.index;
    const action = btn.dataset.action;
    if (action === 'edit') startEdit(idx);
    else if (action === 'delete') deleteEmployee(idx);
    else if (action === 'save') saveEdit(idx);
    else if (action === 'cancel') renderEmployees();
  });

  document.getElementById('assignmentList').addEventListener('change', e => {
    const sel = e.target;
    if (!sel.classList.contains('assign-select')) return;
    const name = state.employees[+sel.dataset.index];
    if (name === undefined) return;
    state.assignments[name] = sel.value;
    persistData();
    updateLive();
  });

  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  document.getElementById('logoInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        const max = 256;
        if (w > max || h > max){
          const r = Math.min(max / w, max / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        state.logo = c.toDataURL('image/png');
        setRaw(LS.logo, state.logo);
        loadSettingsInputs();
        renderNotice();
        showToast(t('updated'));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });
  document.getElementById('removeLogoBtn').addEventListener('click', () => {
    state.logo = null;
    setRaw(LS.logo, 'none');
    loadSettingsInputs();
    renderNotice();
    showToast(t('logoRemoved'));
  });

  document.getElementById('historyList').addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const rec = state.history.find(r => r.id === +btn.dataset.id);
    if (!rec) return;
    const action = btn.dataset.action;
    if (action === 'view') showHistoryModal(rec);
    else if (action === 'load' || action === 'reuse') loadRecord(rec);
    else if (action === 'delete'){
      state.history = state.history.filter(r => r.id !== rec.id);
      persistData();
      renderHistory();
      showToast(t('removed'));
    }
  });

  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('modalOverlay').hidden = true;
  });
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') e.target.hidden = true;
  });
  document.getElementById('modalExport').addEventListener('click', () => {
    const d = currentViewingRecord ? currentViewingRecord.date : state.date;
    exportPNG(document.getElementById('viewNotice'), d);
  });
  document.getElementById('modalShare').addEventListener('click', () => {
    const d = currentViewingRecord ? currentViewingRecord.date : state.date;
    sharePNG(document.getElementById('viewNotice'), d);
  });

  document.querySelectorAll('.nav-btn').forEach(b =>
    b.addEventListener('click', () => switchTab(b.dataset.screen)));
}

/* -------------------- Init -------------------- */

function init(){
  loadState();
  applyDark();
  document.getElementById('dateInput').value = state.date;
  document.getElementById('notesInput').value = state.notes;
  document.getElementById('notesInput').placeholder = t('notesPh');
  document.getElementById('newEmployeeInput').placeholder = t('empNamePh');
  document.getElementById('searchInput').placeholder = t('searchPh');
  loadSettingsInputs();
  applyLanguage();
  wireEvents();

  const shareSupported = !!(navigator.share && navigator.canShare);
  document.getElementById('sharePngBtn').hidden = !shareSupported;
  document.getElementById('modalShare').hidden = !shareSupported;
}

document.addEventListener('DOMContentLoaded', init);
