// ============================================================
// FoxURL Cloud — Home page
// Sample/demo data only. Swap DATA arrays below for real API calls.
// ============================================================

const ICONS = {
  doc:   { color: '#3B6FE0', svg: '<path d="M4 2h7l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/><path d="M11 2v4h4" fill="none" stroke="#fff" stroke-width="1"/>' },
  sheet: { color: '#2E9E5B', svg: '<path d="M4 2h7l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/><path d="M6 11h6M6 14h6M9 8v7" stroke="#fff" stroke-width="1" fill="none"/>' },
  slide: { color: '#DD6A2E', svg: '<path d="M4 2h7l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/><rect x="6" y="9" width="6" height="4" rx="0.6" fill="#fff"/>' },
  pdf:   { color: '#C43D3D', svg: '<path d="M4 2h7l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/><text x="4.5" y="13" font-size="5" fill="#fff" font-family="Inter, sans-serif">PDF</text>' },
  image: { color: '#8A5CD6', svg: '<path d="M4 2h7l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/><circle cx="7" cy="9" r="1.1" fill="#fff"/><path d="m5 13 2.5-2.5 1.5 1.5L12 9l3 4" stroke="#fff" stroke-width="1" fill="none"/>' },
  zip:   { color: '#71767A', svg: '<path d="M4 2h7l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/><path d="M9 3v2M9 7v2M9 11v2" stroke="#fff" stroke-width="1"/>' },
};

function iconMarkup(type) {
  const i = ICONS[type] || ICONS.doc;
  return `<span class="file-icon" style="background:${i.color}"><svg viewBox="0 0 18 18" fill="currentColor">${i.svg}</svg></span>`;
}

const QUICK_ACCESS = [
  { name: 'Q3 Budget Review.xlsx', type: 'sheet', meta: 'Opened 10:14 AM' },
  { name: 'Client Onboarding Deck.pptx', type: 'slide', meta: 'Opened yesterday' },
  { name: 'Site Redesign Brief.docx', type: 'doc', meta: 'Opened yesterday' },
  { name: 'Contract — Signed.pdf', type: 'pdf', meta: 'Opened Tue' },
];

const FOLDERS = [
  { name: 'Marketing', count: 24 },
  { name: 'Engineering', count: 61 },
  { name: 'Contracts', count: 12 },
  { name: 'Team Photos', count: 138 },
];

const FILES = [
  { name: 'Q3 Budget Review.xlsx', type: 'sheet', owner: 'me', modified: 'Jul 30, 2026', size: '842 KB' },
  { name: 'Client Onboarding Deck.pptx', type: 'slide', owner: 'me', modified: 'Jul 29, 2026', size: '5.1 MB' },
  { name: 'Site Redesign Brief.docx', type: 'doc', owner: 'Marcus Lee', modified: 'Jul 29, 2026', size: '128 KB' },
  { name: 'Contract — Signed.pdf', type: 'pdf', owner: 'me', modified: 'Jul 22, 2026', size: '2.3 MB' },
  { name: 'Homepage mockups.zip', type: 'zip', owner: 'Priya Nair', modified: 'Jul 18, 2026', size: '18.4 MB' },
  { name: 'Team offsite.jpg', type: 'image', owner: 'me', modified: 'Jul 12, 2026', size: '3.7 MB' },
  { name: 'Vendor comparison.xlsx', type: 'sheet', owner: 'Marcus Lee', modified: 'Jul 9, 2026', size: '221 KB' },
  { name: 'Brand guidelines.pdf', type: 'pdf', owner: 'me', modified: 'Jun 30, 2026', size: '4.9 MB' },
];

function renderQuickAccess() {
  const grid = document.getElementById('quickGrid');
  grid.innerHTML = QUICK_ACCESS.map(item => `
    <div class="quick-card" tabindex="0" role="button" aria-label="Open ${item.name}">
      <div class="quick-card-top">
        ${iconMarkup(item.type)}
        <div>
          <div class="quick-card-name">${item.name}</div>
        </div>
      </div>
      <div class="quick-card-meta">${item.meta}</div>
    </div>
  `).join('');
}

function renderFolders() {
  const grid = document.getElementById('folderGrid');
  grid.innerHTML = FOLDERS.map(f => `
    <div class="folder-card" tabindex="0" role="button" aria-label="Open folder ${f.name}">
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h4l1.5 2h7.5A1.5 1.5 0 0 1 18 7.5v8A1.5 1.5 0 0 1 16.5 17h-13A1.5 1.5 0 0 1 2 15.5v-10Z"/></svg>
      <span>${f.name}</span>
      <span class="folder-count">${f.count}</span>
      <button class="row-menu-btn" aria-label="More actions for ${f.name}">
        <svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="4.5" r="1.4"/><circle cx="10" cy="10" r="1.4"/><circle cx="10" cy="15.5" r="1.4"/></svg>
      </button>
    </div>
  `).join('');
}

function renderFiles(list) {
  const body = document.getElementById('fileTableBody');
  body.innerHTML = list.map(f => `
    <tr tabindex="0">
      <td>
        <div class="file-name-cell">
          ${iconMarkup(f.type)}
          <span>${f.name}</span>
        </div>
      </td>
      <td class="owner-cell">${f.owner === 'me' ? 'me' : f.owner}</td>
      <td class="modified-cell">${f.modified}</td>
      <td class="size-cell">${f.size}</td>
      <td>
        <button class="row-menu-btn" aria-label="More actions for ${f.name}">
          <svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="4.5" r="1.4"/><circle cx="10" cy="10" r="1.4"/><circle cx="10" cy="15.5" r="1.4"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function sortFiles(key) {
  const sorted = [...FILES];
  if (key === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (key === 'size') sorted.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  else sorted.sort((a, b) => new Date(b.modified) - new Date(a.modified));
  renderFiles(sorted);
}

// ---- New button dropdown ----
const newBtn = document.getElementById('newBtn');
const newDropdown = document.getElementById('newDropdown');

function closeNewDropdown() {
  newDropdown.hidden = true;
  newBtn.setAttribute('aria-expanded', 'false');
}

newBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = !newDropdown.hidden;
  if (isOpen) { closeNewDropdown(); return; }
  newDropdown.hidden = false;
  newBtn.setAttribute('aria-expanded', 'true');
});

newDropdown.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  closeNewDropdown();
  // Hook real folder-create / file-picker logic in here.
});

// ---- Sort control ----
document.getElementById('sortSelect').addEventListener('change', (e) => {
  sortFiles(e.target.value);
});

// ---- View toggle (grid/list) placeholder ----
const viewToggle = document.getElementById('viewToggle');
viewToggle.addEventListener('click', () => {
  viewToggle.classList.toggle('is-active');
  document.querySelector('.file-table').classList.toggle('is-grid');
});

// ---- Context menu ----
const contextMenu = document.getElementById('contextMenu');
let contextTargetName = '';

function openContextMenu(x, y, name) {
  contextTargetName = name;
  contextMenu.hidden = false;
  const menuWidth = 200, menuHeight = 210;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);
  contextMenu.style.left = `${clampedX}px`;
  contextMenu.style.top = `${clampedY}px`;
}

function closeContextMenu() { contextMenu.hidden = true; }

document.addEventListener('contextmenu', (e) => {
  const row = e.target.closest('tr[tabindex]');
  const card = e.target.closest('.quick-card, .folder-card');
  const target = row || card;
  if (!target) return;
  e.preventDefault();
  const nameEl = target.querySelector('.quick-card-name, span, .file-name-cell span');
  openContextMenu(e.clientX, e.clientY, nameEl ? nameEl.textContent : '');
});

document.querySelectorAll('.row-menu-btn').forEach(() => {}); // delegated below via body click

document.getElementById('fileTableBody').addEventListener('click', (e) => {
  const btn = e.target.closest('.row-menu-btn');
  if (!btn) return;
  e.stopPropagation();
  const rect = btn.getBoundingClientRect();
  const name = btn.closest('tr').querySelector('.file-name-cell span').textContent;
  openContextMenu(rect.left, rect.bottom + 4, name);
});

document.addEventListener('click', (e) => {
  if (!newDropdown.hidden && !newDropdown.contains(e.target)) closeNewDropdown();
  if (!contextMenu.hidden && !contextMenu.contains(e.target)) closeContextMenu();
});

contextMenu.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  // Hook real open/share/rename/download/trash logic in here.
  closeContextMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeNewDropdown(); closeContextMenu(); }
});

// ---- Init ----
renderQuickAccess();
renderFolders();
renderFiles(FILES);