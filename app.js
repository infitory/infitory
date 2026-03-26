'use strict';

// ── Constants ────────────────────────────────────────────────
const STORAGE_PREFIX = 'system:';

const STARTER_TEMPLATE = `## System name

<!-- Replace this with the name and a brief description of your game system. -->

---

## Attributes

<!-- List the core attributes characters have, e.g.: -->
- Strength
- Dexterity
- Intelligence
- Wisdom
- Charisma
- Constitution

---

## Skills

<!-- List skills and which attribute they're tied to, e.g.: -->
- Athletics (Strength)
- Stealth (Dexterity)
- Arcana (Intelligence)
- Perception (Wisdom)

---

## Dice

<!-- Describe the dice used in the system, e.g.: -->
- Core roll: 2d6 + attribute modifier
- Damage: varies by weapon/spell
- d4, d6, d8, d10, d12, d20, d100

---

## Character fields

<!-- List the fields that appear on a character sheet, e.g.: -->
- Name
- Class / Archetype
- Level / Experience
- Hit Points (max / current)
- Armor Class
- Speed
- Background
- Equipment

---

## Notes

<!-- Any additional rules, house rules, or reference material. -->
`;

// ── State ────────────────────────────────────────────────────
let currentSection = 'systems';
let currentSystemKey = null; // storage key of the system being edited
let unsavedChanges = false;

// ── DOM refs ─────────────────────────────────────────────────
const navItems          = document.querySelectorAll('.nav-item');
const sections          = document.querySelectorAll('.section');
const systemsListView   = document.getElementById('systems-list-view');
const systemsEditorView = document.getElementById('systems-editor-view');
const systemsList       = document.getElementById('systems-list');
const systemsEmpty      = document.getElementById('systems-empty');
const btnNewSystem      = document.getElementById('btn-new-system');
const btnBack           = document.getElementById('btn-back-systems');
const btnSave           = document.getElementById('btn-save-system');
const btnDelete         = document.getElementById('btn-delete-system');
const systemNameInput   = document.getElementById('system-name-input');
const systemEditor      = document.getElementById('system-editor');
const editorStatus      = document.getElementById('editor-status');
const modalOverlay      = document.getElementById('modal-overlay');
const modalInput        = document.getElementById('modal-input');
const modalConfirm      = document.getElementById('modal-confirm');
const modalCancel       = document.getElementById('modal-cancel');

// ── Navigation ───────────────────────────────────────────────
navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.section;
    if (target === currentSection) return;

    if (currentSection === 'systems' && !systemsListView.style.display.includes('none') === false) {
      // in editor; warn about unsaved
    }

    navItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    sections.forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + target).classList.add('active');

    currentSection = target;
  });
});

// ── Storage helpers ──────────────────────────────────────────
function allSystemKeys() {
  return Object.keys(localStorage)
    .filter(k => k.startsWith(STORAGE_PREFIX))
    .sort();
}

function loadSystem(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function saveSystem(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function deleteSystem(key) {
  localStorage.removeItem(key);
}

function systemNameToKey(name) {
  return STORAGE_PREFIX + name.trim().toLowerCase().replace(/\s+/g, '-');
}

function keyToDisplayName(key) {
  // Remove prefix, replace dashes with spaces, title-case
  return key.slice(STORAGE_PREFIX.length)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ── Systems List ─────────────────────────────────────────────
function renderSystemsList() {
  const keys = allSystemKeys();
  systemsList.innerHTML = '';

  if (keys.length === 0) {
    systemsEmpty.style.display = '';
    systemsList.style.display = 'none';
    return;
  }

  systemsEmpty.style.display = 'none';
  systemsList.style.display = '';

  keys.forEach(key => {
    const data = loadSystem(key);
    if (!data) return;

    const card = document.createElement('div');
    card.className = 'system-card';
    card.innerHTML = `
      <div class="system-card-info">
        <span class="system-card-name">${escapeHtml(data.name)}</span>
        <span class="system-card-meta">Last edited: ${formatDate(data.updatedAt)}</span>
      </div>
      <span class="system-card-arrow">&#8250;</span>
    `;
    card.addEventListener('click', () => openEditor(key));
    systemsList.appendChild(card);
  });
}

// ── Editor ───────────────────────────────────────────────────
function openEditor(key) {
  const data = loadSystem(key);
  if (!data) return;

  currentSystemKey = key;
  systemNameInput.value = data.name;
  systemEditor.value = data.content;
  setUnsaved(false);

  systemsListView.style.display = 'none';
  systemsEditorView.style.display = 'flex';
  systemEditor.focus();
}

function closeEditor() {
  currentSystemKey = null;
  setUnsaved(false);
  systemsEditorView.style.display = 'none';
  systemsListView.style.display = '';
  renderSystemsList();
}

function setUnsaved(state) {
  unsavedChanges = state;
  if (state) {
    editorStatus.textContent = 'Unsaved changes';
    editorStatus.className = 'editor-status status-unsaved';
  } else {
    editorStatus.textContent = '';
    editorStatus.className = 'editor-status';
  }
}

function saveCurrentSystem() {
  if (!currentSystemKey) return;

  const newName = systemNameInput.value.trim();
  if (!newName) {
    flashStatus('Name cannot be empty.', 'status-unsaved');
    systemNameInput.focus();
    return;
  }

  const newKey = systemNameToKey(newName);

  // If name changed, delete old key
  if (newKey !== currentSystemKey) {
    deleteSystem(currentSystemKey);
    currentSystemKey = newKey;
  }

  const data = {
    name: newName,
    content: systemEditor.value,
    updatedAt: new Date().toISOString(),
  };

  saveSystem(currentSystemKey, data);
  setUnsaved(false);
  flashStatus('Saved.', 'status-saved');
}

function flashStatus(msg, cls) {
  editorStatus.textContent = msg;
  editorStatus.className = 'editor-status ' + cls;
  setTimeout(() => {
    if (!unsavedChanges) {
      editorStatus.textContent = '';
      editorStatus.className = 'editor-status';
    }
  }, 2000);
}

// Editor events
systemEditor.addEventListener('input', () => setUnsaved(true));
systemNameInput.addEventListener('input', () => setUnsaved(true));

btnSave.addEventListener('click', saveCurrentSystem);

// Ctrl+S / Cmd+S to save
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (currentSystemKey) saveCurrentSystem();
  }
});

btnBack.addEventListener('click', () => {
  if (unsavedChanges) {
    if (!confirm('You have unsaved changes. Discard and go back?')) return;
  }
  closeEditor();
});

btnDelete.addEventListener('click', () => {
  if (!currentSystemKey) return;
  const name = systemNameInput.value || keyToDisplayName(currentSystemKey);
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  deleteSystem(currentSystemKey);
  closeEditor();
});

// ── New System Modal ─────────────────────────────────────────
btnNewSystem.addEventListener('click', () => {
  modalInput.value = '';
  modalOverlay.style.display = 'flex';
  setTimeout(() => modalInput.focus(), 50);
});

function closeModal() {
  modalOverlay.style.display = 'none';
  modalInput.value = '';
}

modalCancel.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

modalInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') modalConfirm.click();
  if (e.key === 'Escape') closeModal();
});

modalConfirm.addEventListener('click', () => {
  const name = modalInput.value.trim();
  if (!name) {
    modalInput.style.borderColor = 'var(--danger)';
    setTimeout(() => (modalInput.style.borderColor = ''), 1000);
    return;
  }

  const key = systemNameToKey(name);

  if (localStorage.getItem(key)) {
    if (!confirm(`A system named "${name}" already exists. Open it instead?`)) return;
    closeModal();
    openEditor(key);
    return;
  }

  const data = {
    name,
    content: STARTER_TEMPLATE,
    updatedAt: new Date().toISOString(),
  };
  saveSystem(key, data);
  closeModal();
  openEditor(key);
});

// ── Utilities ────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  if (isNaN(d)) return 'Unknown';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Init ─────────────────────────────────────────────────────
renderSystemsList();
