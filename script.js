/* =========================================================
   Milk Shift Manager — script.js
   Fixed employee list + dropdown assignments.
   Live receipt preview, PNG export, copy, auto-save,
   and "Load Yesterday's Shift".
   ========================================================= */

'use strict';

/* ---------- 1. CONFIG ---------- */
const STORAGE_KEY = 'milkShiftManagerV2'; // localStorage key
const RECEIPT_W   = 350;                  // PNG export width (px)
const AUTOSAVE_MS = 500;                  // auto-save debounce (ms)

/* ---- FIXED EMPLOYEE LIST (edit this array anytime) ---- */
const EMPLOYEES = [
  'Bhushan',
  'Ramesh',
  'Nagu',
  'Gangaraju',
  'Prasad',
  'Srinu',
  'Venkatrao',
  'Rajkumar',
  'Naidu',
  'Trinadh',
];

/* ---- Shift dropdown options: value -> label ---- */
const SHIFT_OPTIONS = [
  { value: '',      label: 'Not Assigned' },
  { value: 'a',     label: 'A Shift' },
  { value: 'b',     label: 'B Shift' },
  { value: 'c',     label: 'C Shift' },
  { value: 'g',     label: 'G Shift' },
  { value: 'off',   label: 'Weekly Off' },
  { value: 'leave', label: 'Leave' },
];

/* Section labels used on the receipt (display order) */
const SECTION_LABELS = {
  a:     'A SHIFT',
  b:     'B SHIFT',
  c:     'C SHIFT',
  g:     'G SHIFT',
  off:   'WEEKLY OFF',
  leave: 'LEAVE',
};

/* ---------- 2. STATE + STORAGE ---------- */
function defaultAssignments() {
  const map = {};
  EMPLOYEES.forEach((name) => (map[name] = '')); // all "Not Assigned"
  return map;
}

function defaultState() {
  return {
    date: todayISO(),
    assignments: defaultAssignments(),
    last: null, // snapshot of the most recent schedule ("yesterday")
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    // Merge with defaults so new employees are never missing
    const merged = Object.assign(defaultState(), saved);
    merged.assignments = Object.assign(defaultAssignments(), saved.assignments || {});
    return merged;
  } catch (err) {
    console.warn('Could not read saved data', err);
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('Could not save data', err);
    return false;
  }
}

/* ---------- 3. DOM REFERENCES ---------- */
const $ = (id) => document.getElementById(id);

const dateInput      = $('dateInput');
const employeeList   = $('employeeList');
const assignedCount  = $('assignedCount');
const generateBtn    = $('generateBtn');
const downloadBtn    = $('downloadBtn');
const copyBtn        = $('copyBtn');
const yesterdayBtn   = $('yesterdayBtn');
const clearBtn       = $('clearBtn');
const receipt        = $('receipt');
const receiptInner   = $('receiptInner');
const toasts         = $('toasts');

/* ---------- 4. HELPERS ---------- */
function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* yyyy-mm-dd -> dd/mm/yyyy (receipt display) */
function fmtDMY(iso) {
  const [y, m, d] = (iso || todayISO()).split('-');
  return `${d}/${m}/${y}`;
}

/* yyyy-mm-dd -> dd-mm-yyyy (file name) */
function fmtFileDate() {
  return (state.date || todayISO()).split('-').reverse().join('-');
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* Create a text <div> safely (textContent — no XSS) */
function line(text, className = '') {
  const d = document.createElement('div');
  d.className = className;
  d.textContent = text;
  return d;
}

function bullet(name) {
  const d = document.createElement('div');
  d.className = 'r-bullet';
  d.textContent = `• ${name}`;
  return d;
}

/* ---------- 5. BUILD EMPLOYEE ROWS ---------- */
function buildEmployeeList() {
  employeeList.textContent = '';

  EMPLOYEES.forEach((name) => {
    const row = document.createElement('div');
    row.className = 'employee-row';

    // Name label
    const label = document.createElement('span');
    label.className = 'employee-name';
    label.textContent = name;
    label.id = `lbl-${name.replace(/\s+/g, '-')}`;

    // Shift dropdown
    const select = document.createElement('select');
    select.id = `sel-${name.replace(/\s+/g, '-')}`;
    select.setAttribute('aria-label', `Shift for ${name}`);

    SHIFT_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      select.appendChild(o);
    });

    // Restore saved value (or default "Not Assigned")
    select.value = state.assignments[name] || '';

    // Live update
    select.addEventListener('change', () => {
      state.assignments[name] = select.value;
      renderPreview();
      updateAssignedCount();
      scheduleSave();
    });

    // Color the dropdown border by shift (see CSS)
    const paint = () => select.setAttribute('data-shift', select.value);
    select.addEventListener('change', paint);
    paint();

    row.append(label, select);
    employeeList.appendChild(row);
  });
}

/* ---------- 6. LIVE RECEIPT PREVIEW ---------- */
function renderPreview() {
  const inner = receiptInner;
  inner.textContent = '';

  const eq   = '='.repeat(32);
  const dash = '-'.repeat(32);

  // Header
  inner.appendChild(line(eq));
  inner.appendChild(line('MILK PROCESSING UNIT', 'r-title'));
  inner.appendChild(line('SHIFT ALLOTMENT', 'r-subtitle'));
  inner.appendChild(line(eq));

  // Date
  inner.appendChild(line(`DATE : ${fmtDMY(state.date)}`, 'r-date'));

  // Sections — only show shifts that have people (hide empty ones)
  Object.keys(SECTION_LABELS).forEach((key) => {
    const names = EMPLOYEES.filter((name) => state.assignments[name] === key);
    if (!names.length) return;
    inner.appendChild(line(dash, 'r-sep'));
    inner.appendChild(line(SECTION_LABELS[key], 'r-section'));
    names.forEach((name) => inner.appendChild(bullet(name)));
  });

  // Footer
  inner.appendChild(line(eq, 'r-sep'));
  inner.appendChild(line('Generated by Milk Shift Manager', 'r-footer'));
  inner.appendChild(line(eq));
}

/* Count of assigned employees (for the badge) */
function updateAssignedCount() {
  const n = EMPLOYEES.filter((name) => state.assignments[name]).length;
  assignedCount.textContent = `${n} assigned`;
}

/* Plain-text version for the Copy button */
function buildPlainText() {
  const lines = [`DATE : ${fmtDMY(state.date)}`];
  Object.keys(SECTION_LABELS).forEach((key) => {
    const names = EMPLOYEES.filter((name) => state.assignments[name] === key);
    if (!names.length) return;
    lines.push('', SECTION_LABELS[key], ...names);
  });
  return lines.join('\n');
}

/* ---------- 7. AUTO-SAVE ---------- */
const scheduleSave = debounce(() => {
  const ok = saveState();
  toast(ok ? 'Data saved' : 'Could not save data', ok ? 'ok' : 'error');
}, AUTOSAVE_MS);

dateInput.addEventListener('change', () => {
  state.date = dateInput.value;
  renderPreview();
  scheduleSave();
});

/* ---------- 8. TOASTS ---------- */
function toast(message, type = 'ok') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  toasts.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 2000);
}

/* ---------- 9. GENERATE RECEIPT (manual refresh) ---------- */
function generateReceipt() {
  renderPreview();
  updateAssignedCount();
  snapshotSchedule();          // remember this schedule for "yesterday"
  toast('Receipt updated');
  // On small screens, scroll down to show the preview
  receipt.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- 10. DOWNLOAD PNG (html2canvas) ---------- */
async function downloadPNG() {
  if (typeof html2canvas === 'undefined') {
    toast('PNG library not loaded (check internet)', 'error');
    return;
  }
  try {
    const canvas = await html2canvas(receipt, {
      scale: 2,                       // high quality
      backgroundColor: '#ffffff',     // pure white thermal paper
      logging: false,
      useCORS: true,
      /* Force the cloned receipt back to 350px even if the
         live preview was scaled down on a small phone screen. */
      onclone: (doc) => {
        const el = doc.getElementById('receipt');
        if (el) {
          el.style.width = RECEIPT_W + 'px';
          el.style.maxWidth = 'none';
        }
      },
    });

    const a = document.createElement('a');
    a.download = `Shift-Allotment-${fmtFileDate()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();

    snapshotSchedule(); // remember this schedule for "yesterday"
    toast('Download successful');
  } catch (err) {
    console.error(err);
    toast('Export failed — try again', 'error');
  }
}

/* ---------- 11. COPY TEXT ---------- */
async function copyNotice() {
  const text = buildPlainText();
  try {
    await navigator.clipboard.writeText(text);
    toast('Notice copied');
  } catch (err) {
    // Fallback for older Android WebView
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast('Notice copied');
    } catch (e2) {
      toast('Copy failed', 'error');
    }
    ta.remove();
  }
}

/* ---------- 12. LOAD YESTERDAY'S SHIFT ---------- */
function snapshotSchedule() {
  // Save the most recent assignment set (used by "Load Yesterday's Shift")
  state.last = {
    date: state.date,
    assignments: { ...state.assignments },
  };
  saveState();
}

function loadYesterday() {
  if (!state.last) {
    toast('No previous schedule found', 'error');
    return;
  }
  state.assignments = { ...state.last.assignments };
  syncSelects();
  renderPreview();
  updateAssignedCount();
  saveState();
  toast('Previous schedule loaded — adjust and save');
}

/* ---------- 13. CLEAR ASSIGNMENTS ---------- */
function clearAssignments() {
  state.assignments = defaultAssignments();
  syncSelects();
  renderPreview();
  updateAssignedCount();
  saveState();
  toast('Assignments cleared');
}

/* Push state back into the dropdowns (after restore/clear) */
function syncSelects() {
  EMPLOYEES.forEach((name) => {
    const select = $(`sel-${name.replace(/\s+/g, '-')}`);
    if (select) {
      select.value = state.assignments[name] || '';
      select.setAttribute('data-shift', select.value);
    }
  });
}

/* ---------- 14. INIT ---------- */
function init() {
  dateInput.value = state.date;
  buildEmployeeList();
  renderPreview();
  updateAssignedCount();
  if (!navigator.onLine) toast('Offline — PNG export needs internet', 'error');
}

/* Wire up buttons */
generateBtn.addEventListener('click', generateReceipt);
downloadBtn.addEventListener('click', downloadPNG);
copyBtn.addEventListener('click', copyNotice);
yesterdayBtn.addEventListener('click', loadYesterday);
clearBtn.addEventListener('click', clearAssignments);

document.addEventListener('DOMContentLoaded', init);
