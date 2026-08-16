/* =========================================================
   Milk Shift Manager — script.js
   Pure JavaScript : live receipt preview, PNG/PDF export,
   auto-save, copy, history archive, dark mode, logo upload.
   ========================================================= */

'use strict';

/* ---------- 1. CONFIG ---------- */
const STORAGE_KEY = 'milkShiftManager'; // localStorage key
const RECEIPT_W   = 350;                // export width (px)
const MAX_HISTORY = 50;                 // max archived notices
const LOGO_MAX_W  = 140;                // logo max width after compression (px)
const AUTOSAVE_MS = 600;                // auto-save debounce (ms)

/* Receipt sections, in display order */
const SECTIONS = [
  { key: 'a',     label: 'A SHIFT'    },
  { key: 'b',     label: 'B SHIFT'    },
  { key: 'c',     label: 'C SHIFT'    },
  { key: 'g',     label: 'G SHIFT'    },
  { key: 'off',   label: 'WEEKLY OFF' },
  { key: 'leave', label: 'LEAVE'      },
];

/* Maps section key -> textarea element id */
const SHIFT_IDS = {
  a: 'shiftA', b: 'shiftB', c: 'shiftC',
  g: 'shiftG', off: 'shiftOff', leave: 'shiftLeave',
};

/* ---------- 2. STATE + STORAGE ---------- */
function defaultState() {
  return {
    date: todayISO(),                      // yyyy-mm-dd
    unitName: 'MILK PROCESSING UNIT',
    shifts: { a: '', b: '', c: '', g: '', off: '', leave: '' },
    logo: null,                            // data URL or null
    darkMode: false,
    history: [],                           // archived notices
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    return Object.assign(defaultState(), saved, {
      history: Array.isArray(saved.history) ? saved.history : [],
    });
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
    return false; // e.g. storage full
  }
}

/* ---------- 3. DOM REFERENCES ---------- */
const $ = (id) => document.getElementById(id);

const dateInput     = $('dateInput');
const unitNameInput = $('unitName');
const logoInput     = $('logoInput');
const logoBtn       = $('logoBtn');
const logoClearBtn  = $('logoClear');
const noticeForm    = $('noticeForm');

const downloadBtn  = $('downloadBtn');
const copyBtn      = $('copyBtn');
const printBtn     = $('printBtn');
const pdfBtn       = $('pdfBtn');
const archiveBtn   = $('archiveBtn');
const clearBtn     = $('clearBtn');
const darkToggle   = $('darkToggle');

const receipt       = $('receipt');
const receiptInner  = $('receiptInner');
const historySearch = $('historySearch');
const historyList   = $('historyList');
const historyEmpty  = $('historyEmpty');
const historyCount  = $('historyCount');
const toasts        = $('toasts');

/* textarea elements paired with their section */
const textareas = SECTIONS.map((section) => ({
  section,
  el: $(SHIFT_IDS[section.key]),
}));

/* ---------- 4. SMALL HELPERS ---------- */
function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* yyyy-mm-dd -> dd/mm/yyyy (receipt display) */
function fmtDMY(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/* yyyy-mm-dd -> dd-mm-yyyy (file name) */
function fmtFileDate() {
  const iso = state.date || todayISO();
  return iso.split('-').reverse().join('-');
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* Split textarea value into a clean list of names */
function parseLines(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/* Create a plain text <div> (safe — uses textContent, no innerHTML/XSS) */
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

/* ---------- 5. LIVE RECEIPT PREVIEW ---------- */
function renderPreview() {
  const inner = receiptInner;
  inner.textContent = '';

  const eq   = '='.repeat(32);
  const dash = '-'.repeat(32);

  // Optional logo
  if (state.logo) {
    const img = document.createElement('img');
    img.src = state.logo;
    img.alt = 'Company logo';
    img.className = 'r-logo';
    inner.appendChild(img);
  }

  // Header
  inner.appendChild(line(eq));
  inner.appendChild(line((state.unitName || 'MILK PROCESSING UNIT').toUpperCase(), 'r-title'));
  inner.appendChild(line('SHIFT ALLOTMENT', 'r-subtitle'));
  inner.appendChild(line(eq));

  // Date
  inner.appendChild(line(`DATE : ${fmtDMY(state.date || todayISO())}`, 'r-date'));

  // Sections (empty ones are hidden automatically)
  SECTIONS.forEach((s) => {
    const names = parseLines(state.shifts[s.key]);
    if (!names.length) return;
    inner.appendChild(line(dash, 'r-sep'));
    inner.appendChild(line(s.label, 'r-section'));
    names.forEach((name) => inner.appendChild(bullet(name)));
  });

  // Footer
  inner.appendChild(line(eq, 'r-sep'));
  inner.appendChild(line('Generated by Milk Shift Manager', 'r-footer'));
  inner.appendChild(line(eq));
}

/* Plain-text version used by the Copy button */
function buildPlainText() {
  const lines = [`DATE : ${fmtDMY(state.date || todayISO())}`];
  SECTIONS.forEach((s) => {
    const names = parseLines(state.shifts[s.key]);
    if (!names.length) return;
    lines.push('', s.label, ...names);
  });
  return lines.join('\n');
}

/* ---------- 6. INPUT HANDLING + AUTO-SAVE ---------- */
function onInput(e) {
  const id = e.target.id;
  if (id === 'dateInput') {
    state.date = e.target.value;
  } else if (id === 'unitName') {
    state.unitName = e.target.value;
  } else {
    const section = SECTIONS.find((s) => SHIFT_IDS[s.key] === id);
    if (section) state.shifts[section.key] = e.target.value;
  }
  renderPreview();   // instant live update
  scheduleSave();    // debounced auto-save
}

const scheduleSave = debounce(() => {
  const ok = saveState();
  toast(ok ? 'Data saved' : 'Could not save data', ok ? 'ok' : 'error');
}, AUTOSAVE_MS);

textareas.forEach(({ el }) => el.addEventListener('input', onInput));
dateInput.addEventListener('input', onInput);
unitNameInput.addEventListener('input', onInput);
noticeForm.addEventListener('submit', (e) => e.preventDefault()); // never reload

/* ---------- 7. TOASTS ---------- */
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

/* ---------- 8. EXPORT PNG (html2canvas) ---------- */
async function downloadPNG() {
  if (typeof html2canvas === 'undefined') {
    toast('PNG export library not loaded (check internet)', 'error');
    return;
  }
  try {
    const canvas = await html2canvas(receipt, {
      scale: 2,                            // high-quality export
      backgroundColor: '#ffffff',          // pure white thermal paper
      logging: false,
      useCORS: true,
      /* Force the cloned document's receipt back to full 350px,
         even if the live preview was scaled down on mobile. */
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

    toast('Download successful');
    archiveCurrent(false); // auto-archive every published notice (silent)
  } catch (err) {
    console.error(err);
    toast('Export failed — try again', 'error');
  }
}

/* ---------- 9. COPY NOTICE ---------- */
async function copyNotice() {
  const text = buildPlainText();
  try {
    await navigator.clipboard.writeText(text);
    toast('Notice copied');
  } catch (err) {
    // Fallback for older browsers
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

/* ---------- 10. PRINT + PDF ---------- */
function printReceipt() { window.print(); } // print dialog can "Save as PDF"

async function exportPDF() {
  if (typeof html2pdf === 'undefined') {
    toast('PDF library not loaded (check internet)', 'error');
    return;
  }
  // Temporarily expand the live receipt to full width for a clean capture
  const prevMax = receipt.style.maxWidth;
  receipt.style.maxWidth = 'none';
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  try {
    await html2pdf()
      .set({
        margin: 8,
        filename: `Shift-Allotment-${fmtFileDate()}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff', logging: false },
        jsPDF: { unit: 'mm', format: [80, 280], orientation: 'portrait' }, // receipt-style
      })
      .from(receipt)
      .save();
    toast('PDF exported');
  } catch (err) {
    console.error(err);
    toast('PDF export failed', 'error');
  }
  receipt.style.maxWidth = prevMax;
}

/* ---------- 11. CLEAR FORM ---------- */
function clearForm() {
  const fresh = defaultState();
  fresh.darkMode = state.darkMode; // keep user preference
  fresh.history = state.history;   // keep archive
  state = fresh;
  syncFormToState();
  saveState();
  renderPreview();
  renderHistory();
  toast('Form cleared');
}

/* ---------- 12. LOGO UPLOAD (compressed for localStorage) ---------- */
logoBtn.addEventListener('click', () => logoInput.click());

logoInput.addEventListener('change', () => {
  const file = logoInput.files && logoInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Downscale so the base64 string stays small enough for localStorage
      const scale = Math.min(1, LOGO_MAX_W / img.width);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      state.logo = c.toDataURL('image/png');
      saveState();
      renderPreview();
      updateLogoUI();
      toast('Logo added');
    };
    img.onerror = () => toast('Could not read image', 'error');
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

logoClearBtn.addEventListener('click', () => {
  state.logo = null;
  saveState();
  renderPreview();
  updateLogoUI();
  toast('Logo removed');
});

function updateLogoUI() { logoClearBtn.hidden = !state.logo; }

/* ---------- 13. HISTORY ARCHIVE ---------- */
function archiveCurrent(manual = true) {
  const rec = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: state.date || todayISO(),
    dateLabel: fmtDMY(state.date || todayISO()),
    unitName: state.unitName || 'MILK PROCESSING UNIT',
    shifts: { ...state.shifts },
    createdAt: Date.now(),
  };
  state.history.unshift(rec);
  if (state.history.length > MAX_HISTORY) state.history.length = MAX_HISTORY;
  saveState();
  renderHistory();
  if (manual) toast('Saved to archive');
}

function renderHistory() {
  const q = (historySearch.value || '').trim().toLowerCase();

  // Filter by name / date / unit when searching
  const items = q
    ? state.history.filter((rec) =>
        rec.dateLabel.toLowerCase().includes(q) ||
        (rec.unitName || '').toLowerCase().includes(q) ||
        SECTIONS.some((s) =>
          parseLines(rec.shifts[s.key]).some((n) => n.toLowerCase().includes(q))
        )
      )
    : state.history;

  historyCount.textContent = state.history.length;
  historyList.textContent = '';
  historyEmpty.hidden = items.length > 0;

  items.forEach((rec) => {
    const item = document.createElement('div');
    item.className = 'history-item';

    // Meta line: date + unit + first names
    const meta = document.createElement('div');
    meta.className = 'history-meta';
    const dateEl = document.createElement('strong');
    dateEl.textContent = rec.dateLabel;
    const names = SECTIONS.flatMap((s) => parseLines(rec.shifts[s.key]));
    const unitEl = document.createElement('span');
    unitEl.textContent =
      `${rec.unitName} — ${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}`;
    meta.append(dateEl, unitEl);
    item.appendChild(meta);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'history-actions';

    const restore = document.createElement('button');
    restore.type = 'button';
    restore.className = 'btn btn-ghost btn-xs';
    restore.textContent = 'Restore';
    restore.addEventListener('click', () => restoreNotice(rec));

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn-danger btn-xs';
    del.textContent = 'Delete';
    del.addEventListener('click', () => deleteNotice(rec.id));

    actions.append(restore, del);
    item.appendChild(actions);
    historyList.appendChild(item);
  });
}

function restoreNotice(rec) {
  state.date = rec.date;
  state.unitName = rec.unitName;
  state.shifts = { ...rec.shifts };
  syncFormToState();
  saveState();
  renderPreview();
  toast('Notice restored');
}

function deleteNotice(id) {
  state.history = state.history.filter((r) => r.id !== id);
  saveState();
  renderHistory();
  toast('Notice deleted');
}

historySearch.addEventListener('input', renderHistory);

/* ---------- 14. DARK MODE ---------- */
function applyDark() {
  document.body.classList.toggle('dark', state.darkMode);
  darkToggle.textContent = state.darkMode ? '☀' : '☾';
}

darkToggle.addEventListener('click', () => {
  state.darkMode = !state.darkMode;
  applyDark();
  saveState();
});

/* ---------- 15. SYNC FORM <-> STATE + INIT ---------- */
function syncFormToState() {
  dateInput.value = state.date;
  unitNameInput.value = state.unitName;
  textareas.forEach(({ section, el }) => (el.value = state.shifts[section.key]));
  updateLogoUI();
}

function init() {
  syncFormToState();
  applyDark();
  renderPreview();
  renderHistory();
  // Hide PDF button if the CDN library failed to load
  if (typeof html2pdf === 'undefined') pdfBtn.hidden = true;
  if (!navigator.onLine) toast('Offline — PNG/PDF export needs internet', 'error');
}

/* Wire up action buttons */
downloadBtn.addEventListener('click', downloadPNG);
copyBtn.addEventListener('click', copyNotice);
printBtn.addEventListener('click', printReceipt);
pdfBtn.addEventListener('click', exportPDF);
archiveBtn.addEventListener('click', () => archiveCurrent(true));
clearBtn.addEventListener('click', clearForm);

document.addEventListener('DOMContentLoaded', init);
      
