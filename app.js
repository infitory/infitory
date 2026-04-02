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
let currentSection = 'home';
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

    // Warn on unsaved system edits
    if (currentSystemKey && unsavedChanges) {
      if (!confirm('You have unsaved system changes. Discard?')) return;
      closeEditor();
    }
    // Warn on unsaved session edits
    if (currentSessionId && sessionUnsaved) {
      if (!confirm('You have unsaved session changes. Discard?')) return;
      closeSessionEditor();
    }
    // Warn on unsaved character edits
    if (currentPcId && pcUnsaved) {
      if (!confirm('You have unsaved PC changes. Discard?')) return;
      closePcEditor();
    }
    if (currentNpcId && npcUnsaved) {
      if (!confirm('You have unsaved NPC changes. Discard?')) return;
      closeNpcEditor();
    }

    navItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    sections.forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + target).classList.add('active');

    currentSection = target;

    if (target === 'home') renderHomeDashboard();
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

// Ctrl+S / Cmd+S to save (systems or sessions)
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (currentSystemKey) saveCurrentSystem();
    else if (currentSessionId) saveCurrentSession();
    else if (currentPcId) saveCurrentPc();
    else if (currentNpcId) saveCurrentNpc();
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

// ── Sessions ─────────────────────────────────────────────────

const SESSION_PREFIX = 'session:';

// State
let currentSessionId = null;
let sessionUnsaved = false;
let combatState = { combatants: [], currentTurn: 0 };

// DOM refs
const sessionsSection      = document.getElementById('section-sessions');
const sessionsListView     = document.getElementById('sessions-list-view');
const sessionsEditorView   = document.getElementById('sessions-editor-view');
const sessionsList         = document.getElementById('sessions-list');
const sessionsEmpty        = document.getElementById('sessions-empty');
const btnNewSession        = document.getElementById('btn-new-session');
const btnBackSession       = document.getElementById('btn-back-session');
const btnSaveSession       = document.getElementById('btn-save-session');
const btnDeleteSession     = document.getElementById('btn-delete-session');
const sessionTitleInput    = document.getElementById('session-title-input');
const sessionDateInput     = document.getElementById('session-date-input');
const sessionSystemSelect  = document.getElementById('session-system-select');
const sessionNotes         = document.getElementById('session-notes');
const sessionNotesPreview  = document.getElementById('session-notes-preview');
const sessionEditorStatus  = document.getElementById('session-editor-status');
const combatantsList       = document.getElementById('combatants-list');
const btnNextTurn          = document.getElementById('btn-next-turn');
const btnClearCombat       = document.getElementById('btn-clear-combat');
const combatantNameInput   = document.getElementById('combatant-name');
const combatantInitInput   = document.getElementById('combatant-init');
const btnAddCombatant      = document.getElementById('btn-add-combatant');

// ── Session storage helpers ───────────────────────────────────

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function allSessionKeys() {
  return Object.keys(localStorage).filter(k => k.startsWith(SESSION_PREFIX));
}

function loadSessionData(id) {
  const raw = localStorage.getItem(SESSION_PREFIX + id);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function saveSessionData(data) {
  localStorage.setItem(SESSION_PREFIX + data.id, JSON.stringify(data));
}

function deleteSessionData(id) {
  localStorage.removeItem(SESSION_PREFIX + id);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatSessionDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getSystemName(key) {
  if (!key) return null;
  const d = loadSystem(key);
  return d ? d.name : keyToDisplayName(key);
}

// ── Sessions list ─────────────────────────────────────────────

function renderSessionsList() {
  const keys = allSessionKeys();
  sessionsList.innerHTML = '';

  if (keys.length === 0) {
    sessionsEmpty.style.display = '';
    sessionsList.style.display = 'none';
    return;
  }

  sessionsEmpty.style.display = 'none';
  sessionsList.style.display = '';

  const items = keys
    .map(k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } })
    .filter(Boolean)
    .sort((a, b) => {
      const d = (b.date || '').localeCompare(a.date || '');
      return d !== 0 ? d : (b.createdAt || '').localeCompare(a.createdAt || '');
    });

  items.forEach(data => {
    const sysName = getSystemName(data.systemKey);
    const card = document.createElement('div');
    card.className = 'session-card';
    card.innerHTML = `
      <div class="session-card-info">
        <span class="session-card-title">${escapeHtml(data.title || 'Untitled')}</span>
        <span class="session-card-date">${formatSessionDate(data.date) || 'No date'}</span>
      </div>
      ${sysName ? `<span class="session-card-system">${escapeHtml(sysName)}</span>` : ''}
      <span class="session-card-arrow">&#8250;</span>
    `;
    card.addEventListener('click', () => openSessionEditor(data.id));
    sessionsList.appendChild(card);
  });
}

// ── Session editor ────────────────────────────────────────────

function populateSystemSelect() {
  const current = sessionSystemSelect.value;
  sessionSystemSelect.innerHTML = '<option value="">\u2014 No system \u2014</option>';
  allSystemKeys().forEach(k => {
    const d = loadSystem(k);
    if (!d) return;
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = d.name;
    sessionSystemSelect.appendChild(opt);
  });
  sessionSystemSelect.value = current;
}

function openSessionEditor(id) {
  const data = loadSessionData(id);
  if (!data) return;

  currentSessionId = id;
  sessionTitleInput.value = data.title || '';
  sessionDateInput.value = data.date || todayISO();
  populateSystemSelect();
  sessionSystemSelect.value = data.systemKey || '';
  sessionNotes.value = data.notes || '';
  combatState = data.combat
    ? { combatants: [...(data.combat.combatants || [])], currentTurn: data.combat.currentTurn || 0 }
    : { combatants: [], currentTurn: 0 };

  setSessionUnsaved(false);
  switchNotesTab('edit');
  renderCombatants();

  sessionsListView.style.display = 'none';
  sessionsEditorView.style.display = 'flex';
  sessionsSection.classList.add('editor-mode');
  sessionTitleInput.focus();
  sessionTitleInput.select();
}

function closeSessionEditor() {
  currentSessionId = null;
  combatState = { combatants: [], currentTurn: 0 };
  setSessionUnsaved(false);
  sessionsEditorView.style.display = 'none';
  sessionsListView.style.display = '';
  sessionsSection.classList.remove('editor-mode');
  renderSessionsList();
}

function setSessionUnsaved(state) {
  sessionUnsaved = state;
  if (state) {
    sessionEditorStatus.textContent = 'Unsaved changes';
    sessionEditorStatus.className = 'editor-status status-unsaved';
  } else {
    sessionEditorStatus.textContent = '';
    sessionEditorStatus.className = 'editor-status';
  }
}

function saveCurrentSession() {
  if (!currentSessionId) return;
  const existing = loadSessionData(currentSessionId) || {};
  const data = {
    ...existing,
    id: currentSessionId,
    title: sessionTitleInput.value.trim() || 'Untitled',
    date: sessionDateInput.value || todayISO(),
    systemKey: sessionSystemSelect.value,
    notes: sessionNotes.value,
    combat: { combatants: [...combatState.combatants], currentTurn: combatState.currentTurn },
    updatedAt: new Date().toISOString(),
  };
  saveSessionData(data);
  setSessionUnsaved(false);
  flashSessionStatus('Saved.', 'status-saved');
}

function flashSessionStatus(msg, cls) {
  sessionEditorStatus.textContent = msg;
  sessionEditorStatus.className = 'editor-status ' + cls;
  setTimeout(() => {
    if (!sessionUnsaved) {
      sessionEditorStatus.textContent = '';
      sessionEditorStatus.className = 'editor-status';
    }
  }, 2000);
}

function autosaveCombat() {
  if (!currentSessionId) return;
  const data = loadSessionData(currentSessionId);
  if (!data) return;
  data.combat = { combatants: [...combatState.combatants], currentTurn: combatState.currentTurn };
  data.updatedAt = new Date().toISOString();
  saveSessionData(data);
}

// ── Notes tabs ────────────────────────────────────────────────

function switchNotesTab(tab) {
  document.querySelectorAll('#section-sessions .tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  if (tab === 'preview') {
    sessionNotesPreview.innerHTML = renderMarkdown(sessionNotes.value);
    sessionNotesPreview.style.display = '';
    sessionNotes.style.display = 'none';
  } else {
    sessionNotes.style.display = '';
    sessionNotesPreview.style.display = 'none';
    sessionNotes.focus();
  }
}

document.querySelectorAll('#section-sessions .tab-btn').forEach(btn =>
  btn.addEventListener('click', () => switchNotesTab(btn.dataset.tab))
);

// ── Markdown renderer ─────────────────────────────────────────

function renderMarkdown(md) {
  if (!md || !md.trim()) return '<p class="md-empty">Nothing to preview.</p>';

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function inline(s) {
    return s
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  const out = [];
  let inUl = false, inOl = false;

  function closeLists() {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  }

  for (const line of md.split('\n')) {
    const e = esc(line);
    let m;

    if ((m = e.match(/^### (.+)/)))       { closeLists(); out.push(`<h3>${inline(m[1])}</h3>`); }
    else if ((m = e.match(/^## (.+)/)))   { closeLists(); out.push(`<h2>${inline(m[1])}</h2>`); }
    else if ((m = e.match(/^# (.+)/)))    { closeLists(); out.push(`<h1>${inline(m[1])}</h1>`); }
    else if (/^---+$/.test(e.trim()))     { closeLists(); out.push('<hr>'); }
    else if ((m = e.match(/^&gt; (.*)/))) { closeLists(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); }
    else if ((m = line.match(/^[-*] (.*)/))) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${inline(esc(m[1]))}</li>`);
    }
    else if ((m = line.match(/^\d+\. (.*)/))) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${inline(esc(m[1]))}</li>`);
    }
    else if (line.trim() === '') { closeLists(); out.push(''); }
    else { closeLists(); out.push(`<p>${inline(e)}</p>`); }
  }
  closeLists();
  return out.join('\n');
}

// ── Initiative tracker ────────────────────────────────────────

function renderCombatants() {
  combatantsList.innerHTML = '';

  if (combatState.combatants.length === 0) {
    const el = document.createElement('div');
    el.className = 'combatants-empty';
    el.textContent = 'No combatants. Add one below.';
    combatantsList.appendChild(el);
    btnNextTurn.disabled = true;
    return;
  }

  btnNextTurn.disabled = false;
  combatState.combatants.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'combatant-row' + (i === combatState.currentTurn ? ' active' : '');
    row.innerHTML = `
      <span class="combatant-turn-marker">${i === combatState.currentTurn ? '&#9654;' : ''}</span>
      <span class="combatant-name-label">${escapeHtml(c.name)}</span>
      <span class="combatant-init-label">${c.initiative}</span>
      <button class="combatant-remove" data-id="${c.id}" title="Remove">&#215;</button>
    `;
    combatantsList.appendChild(row);
  });

  const activeRow = combatantsList.querySelector('.combatant-row.active');
  if (activeRow) activeRow.scrollIntoView({ block: 'nearest' });
}

function addCombatant(name, initiative) {
  const c = { id: newId(), name: name.trim(), initiative: Number(initiative) || 0 };
  const idx = combatState.combatants.findIndex(x => x.initiative < c.initiative);
  if (idx === -1) {
    combatState.combatants.push(c);
  } else {
    combatState.combatants.splice(idx, 0, c);
    if (idx <= combatState.currentTurn && combatState.combatants.length > 1) {
      combatState.currentTurn++;
    }
  }
  renderCombatants();
  autosaveCombat();
}

function removeCombatant(id) {
  const idx = combatState.combatants.findIndex(c => c.id === id);
  if (idx === -1) return;
  combatState.combatants.splice(idx, 1);
  if (combatState.combatants.length === 0) {
    combatState.currentTurn = 0;
  } else if (idx < combatState.currentTurn) {
    combatState.currentTurn = Math.max(0, combatState.currentTurn - 1);
  } else if (combatState.currentTurn >= combatState.combatants.length) {
    combatState.currentTurn = 0;
  }
  renderCombatants();
  autosaveCombat();
}

function nextTurn() {
  if (!combatState.combatants.length) return;
  combatState.currentTurn = (combatState.currentTurn + 1) % combatState.combatants.length;
  renderCombatants();
  autosaveCombat();
}

function clearCombat() {
  combatState = { combatants: [], currentTurn: 0 };
  renderCombatants();
  autosaveCombat();
}

// ── Session event listeners ───────────────────────────────────

btnNewSession.addEventListener('click', () => {
  const id = newId();
  saveSessionData({
    id,
    title: 'New Session',
    date: todayISO(),
    systemKey: '',
    notes: '',
    combat: { combatants: [], currentTurn: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  openSessionEditor(id);
});

btnBackSession.addEventListener('click', () => {
  if (sessionUnsaved && !confirm('You have unsaved changes. Discard and go back?')) return;
  closeSessionEditor();
});

btnSaveSession.addEventListener('click', saveCurrentSession);

btnDeleteSession.addEventListener('click', () => {
  if (!currentSessionId) return;
  const title = sessionTitleInput.value.trim() || 'this session';
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
  deleteSessionData(currentSessionId);
  closeSessionEditor();
});

sessionTitleInput.addEventListener('input', () => setSessionUnsaved(true));
sessionDateInput.addEventListener('change', () => setSessionUnsaved(true));
sessionSystemSelect.addEventListener('change', () => setSessionUnsaved(true));
sessionNotes.addEventListener('input', () => setSessionUnsaved(true));

btnNextTurn.addEventListener('click', nextTurn);

btnClearCombat.addEventListener('click', () => {
  if (combatState.combatants.length && !confirm('Clear all combatants?')) return;
  clearCombat();
});

combatantsList.addEventListener('click', e => {
  const btn = e.target.closest('.combatant-remove');
  if (btn) removeCombatant(btn.dataset.id);
});

btnAddCombatant.addEventListener('click', () => {
  const name = combatantNameInput.value.trim();
  if (!name) { combatantNameInput.focus(); return; }
  addCombatant(name, combatantInitInput.value);
  combatantNameInput.value = '';
  combatantInitInput.value = '';
  combatantNameInput.focus();
});

combatantNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && combatantNameInput.value.trim()) combatantInitInput.focus();
});

combatantInitInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') btnAddCombatant.click();
});

// ── Dice Roller ───────────────────────────────────────────────

const diceHistory = []; // in-memory, max 50 entries
const HISTORY_MAX = 50;

// DOM refs
const diceExprInput      = document.getElementById('dice-expr-input');
const btnRollExpr        = document.getElementById('btn-roll-expr');
const btnClearDiceHistory = document.getElementById('btn-clear-dice-history');
const diceResultCard     = document.getElementById('dice-result-card');
const diceResultTotal    = document.getElementById('dice-result-total');
const diceResultExprLabel = document.getElementById('dice-result-expr-label');
const diceResultBreakdown = document.getElementById('dice-result-breakdown');
const diceHistoryList    = document.getElementById('dice-history-list');

// Parse expressions like: d20, 2d6, 3d8+2, 1d20-1, d%
function parseDiceExpr(raw) {
  const s = raw.trim().replace(/\s+/g, '').toLowerCase().replace('d%', 'd100');
  const m = s.match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (!m) return null;
  const count = parseInt(m[1] || '1', 10);
  const sides = parseInt(m[2], 10);
  const mod   = m[3] ? parseInt(m[3], 10) : 0;
  if (count < 1 || count > 100 || sides < 2 || sides > 10000) return null;
  const label = `${count}d${sides === 100 ? '%' : sides}${mod > 0 ? '+' + mod : mod < 0 ? mod : ''}`;
  return { count, sides, mod, label };
}

function rollOneDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function performRoll(raw) {
  const parsed = parseDiceExpr(raw);
  if (!parsed) {
    diceExprInput.style.borderColor = 'var(--danger)';
    setTimeout(() => (diceExprInput.style.borderColor = ''), 800);
    return;
  }
  const { count, sides, mod, label } = parsed;
  const rolls = Array.from({ length: count }, () => rollOneDie(sides));
  const total = rolls.reduce((a, b) => a + b, 0) + mod;

  const entry = { label, rolls, mod, total };
  diceHistory.unshift(entry);
  if (diceHistory.length > HISTORY_MAX) diceHistory.pop();

  showDiceResult(entry);
  renderDiceHistory();
}

function showDiceResult({ label, rolls, mod, total }) {
  diceResultTotal.textContent = total;
  diceResultExprLabel.textContent = label;

  const pips = rolls.map(r => `<span class="dice-pip">${r}</span>`).join('');
  const modStr = mod > 0 ? `<span class="dice-result-mod"> +${mod}</span>`
               : mod < 0 ? `<span class="dice-result-mod"> ${mod}</span>` : '';
  diceResultBreakdown.innerHTML = pips + modStr;

  diceResultCard.style.display = '';
  diceResultCard.classList.remove('rolling');
  void diceResultCard.offsetWidth; // force reflow for re-animation
  diceResultCard.classList.add('rolling');
}

function renderDiceHistory() {
  if (diceHistory.length === 0) {
    diceHistoryList.innerHTML = '<p class="dice-history-empty">No rolls yet.</p>';
    return;
  }
  diceHistoryList.innerHTML = '';
  diceHistory.forEach(({ label, rolls, mod, total }, i) => {
    const rollsStr = rolls.join(', ') + (mod > 0 ? ` +${mod}` : mod < 0 ? ` ${mod}` : '');
    const el = document.createElement('div');
    el.className = 'dice-history-entry' + (i === 0 ? ' new' : '');
    el.innerHTML = `
      <div class="dice-history-meta">
        <span class="dice-history-formula">${escapeHtml(label)}</span>
        <span class="dice-history-rolls">[${escapeHtml(rollsStr)}]</span>
      </div>
      <span class="dice-history-total">${total}</span>
    `;
    diceHistoryList.appendChild(el);
  });
}

// Quick dice buttons
document.querySelectorAll('.dice-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const expr = `d${btn.dataset.sides}`;
    diceExprInput.value = expr.replace('d100', 'd%');
    performRoll(expr);
  });
});

btnRollExpr.addEventListener('click', () => {
  if (diceExprInput.value.trim()) performRoll(diceExprInput.value);
});

diceExprInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && diceExprInput.value.trim()) performRoll(diceExprInput.value);
});

btnClearDiceHistory.addEventListener('click', () => {
  diceHistory.length = 0;
  renderDiceHistory();
  diceResultCard.style.display = 'none';
});

// ── Home Dashboard ────────────────────────────────────────────

const CAMPAIGN_NAME_KEY = 'app:campaignName';

const campaignNameInput  = document.getElementById('campaign-name-input');
const statSystemsEl      = document.getElementById('stat-systems');
const statSessionsEl     = document.getElementById('stat-sessions');
const statCharactersEl   = document.getElementById('stat-characters');
const btnQuickD20        = document.getElementById('btn-quick-d20');
const quickD20Result     = document.getElementById('quick-d20-result');
const homeRecentList     = document.getElementById('home-recent-list');
const btnExportAll       = document.getElementById('btn-export-all');
const btnImportData      = document.getElementById('btn-import-data');
const importFileInput    = document.getElementById('import-file-input');
const prebuiltNotice     = document.getElementById('prebuilt-notice');

function renderHomeDashboard() {
  campaignNameInput.value = localStorage.getItem(CAMPAIGN_NAME_KEY) || '';
  statSystemsEl.textContent    = allSystemKeys().length;
  statSessionsEl.textContent   = allSessionKeys().length;
  statCharactersEl.textContent = allPcKeys().length + allNpcKeys().length;

  // Recent sessions — last 3 by date
  const recent = allSessionKeys()
    .map(k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } })
    .filter(Boolean)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 3);

  homeRecentList.innerHTML = '';
  if (recent.length === 0) {
    homeRecentList.innerHTML = '<p class="home-empty">No sessions yet.</p>';
  } else {
    recent.forEach(s => {
      const sysName = getSystemName(s.systemKey);
      const card = document.createElement('div');
      card.className = 'home-session-card';
      card.innerHTML = `
        <div class="home-session-info">
          <span class="home-session-title">${escapeHtml(s.title || 'Untitled')}</span>
          <span class="home-session-date">${formatSessionDate(s.date) || 'No date'}</span>
        </div>
        ${sysName ? `<span class="session-card-system">${escapeHtml(sysName)}</span>` : ''}
      `;
      card.addEventListener('click', () => {
        navItems.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-section="sessions"]').classList.add('active');
        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById('section-sessions').classList.add('active');
        currentSection = 'sessions';
        openSessionEditor(s.id);
      });
      homeRecentList.appendChild(card);
    });
  }
}

campaignNameInput.addEventListener('input', () => {
  localStorage.setItem(CAMPAIGN_NAME_KEY, campaignNameInput.value);
});

// Stat cards navigate to their section
document.querySelectorAll('.stat-card[data-nav]').forEach(card => {
  card.addEventListener('click', () => {
    const target = card.dataset.nav;
    navItems.forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-section="${target}"]`).classList.add('active');
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + target).classList.add('active');
    currentSection = target;
  });
});

// Quick d20
btnQuickD20.addEventListener('click', () => {
  const roll = Math.floor(Math.random() * 20) + 1;
  quickD20Result.textContent = roll;
  btnQuickD20.classList.remove('rolling');
  void btnQuickD20.offsetWidth;
  btnQuickD20.classList.add('rolling');
});

// ── Import / Export ───────────────────────────────────────────

function exportAllData() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {},
  };
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('system:') || key.startsWith('session:') ||
        key.startsWith('pc:') || key.startsWith('npc:') || key === CAMPAIGN_NAME_KEY) {
      payload.data[key] = localStorage.getItem(key);
    }
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `ttrpg-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(json) {
  let parsed;
  try { parsed = JSON.parse(json); } catch { alert('Invalid JSON file.'); return; }
  if (!parsed.data || typeof parsed.data !== 'object') {
    alert('Unrecognised backup format.'); return;
  }

  const keys    = Object.keys(parsed.data);
  const clashes = keys.filter(k => localStorage.getItem(k));

  let overwrite = false;
  if (clashes.length > 0) {
    overwrite = !confirm(
      `${clashes.length} item(s) already exist.\n\nOK = Merge (keep existing, add new)\nCancel = Overwrite all`
    );
  }

  let count = 0;
  keys.forEach(key => {
    if (!overwrite && localStorage.getItem(key)) return;
    localStorage.setItem(key, parsed.data[key]);
    count++;
  });

  renderSystemsList();
  renderSessionsList();
  renderHomeDashboard();
  if (typeof renderPcList === 'function') {
    renderPcList();
    renderNpcList();
    updateCharNavBadge();
  }
  alert(`Imported ${count} item(s).`);
}

btnExportAll.addEventListener('click', exportAllData);
btnImportData.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => importBackup(ev.target.result);
  reader.readAsText(file);
  importFileInput.value = '';
});

// Per-system .md export
const btnExportSystem = document.getElementById('btn-export-system');
btnExportSystem.addEventListener('click', () => {
  if (!currentSystemKey) return;
  const data = loadSystem(currentSystemKey);
  if (!data) return;
  const blob = new Blob([data.content], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = currentSystemKey.slice(STORAGE_PREFIX.length) + '.md';
  a.click();
  URL.revokeObjectURL(url);
});

// ── Pre-built system loader ───────────────────────────────────

function loadPrebuiltSystems() {
  if (allSystemKeys().length > 0) return; // already populated

  let loaded = 0;
  for (const [name, content] of Object.entries(BUNDLED_SYSTEMS)) {
    if (!content) continue; // skip placeholder empty strings
    const key = systemNameToKey(name);
    if (!localStorage.getItem(key)) {
      saveSystem(key, { name, content, updatedAt: new Date().toISOString() });
      loaded++;
    }
  }

  if (loaded > 0) {
    renderSystemsList();
    renderHomeDashboard();
  }
}

// ── Mobile sidebar ────────────────────────────────────────────

const appEl        = document.getElementById('app');
const hamburger    = document.getElementById('hamburger');
const mobileOverlay = document.getElementById('mobile-overlay');

hamburger.addEventListener('click', () => appEl.classList.add('sidebar-open'));
mobileOverlay.addEventListener('click', () => appEl.classList.remove('sidebar-open'));

// Close sidebar on nav click (mobile)
navItems.forEach(btn => {
  btn.addEventListener('click', () => appEl.classList.remove('sidebar-open'));
});

// ── Init ─────────────────────────────────────────────────────
renderSystemsList();
renderSessionsList();
renderHomeDashboard();
loadPrebuiltSystems();
renderPcList();
renderNpcList();
updateCharNavBadge();

// ── Characters ────────────────────────────────────────────────

const PC_PREFIX  = 'pc:';
const NPC_PREFIX = 'npc:';

// ── State ─────────────────────────────────────────────────────
let currentPcId    = null;
let currentNpcId   = null;
let pcUnsaved      = false;
let npcUnsaved     = false;
let currentCharTab = 'pc';

// ── DOM refs ──────────────────────────────────────────────────
const charPcPanel       = document.getElementById('char-pc-panel');
const charNpcPanel      = document.getElementById('char-npc-panel');
const pcListView        = document.getElementById('pc-list-view');
const pcEditorView      = document.getElementById('pc-editor-view');
const pcList            = document.getElementById('pc-list');
const pcEmpty           = document.getElementById('pc-empty');
const pcSearch          = document.getElementById('pc-search');
const btnNewPc          = document.getElementById('btn-new-pc');
const btnBackPc         = document.getElementById('btn-back-pc');
const btnSavePc         = document.getElementById('btn-save-pc');
const btnDeletePc       = document.getElementById('btn-delete-pc');
const pcEditorTitle     = document.getElementById('pc-editor-title');
const pcSystemSelect    = document.getElementById('pc-system-select');
const pcFormContainer   = document.getElementById('pc-form-container');
const pcEditorStatus    = document.getElementById('pc-editor-status');

const npcListView       = document.getElementById('npc-list-view');
const npcEditorView     = document.getElementById('npc-editor-view');
const npcList           = document.getElementById('npc-list');
const npcEmpty          = document.getElementById('npc-empty');
const npcSearch         = document.getElementById('npc-search');
const npcStatusFilter   = document.getElementById('npc-status-filter');
const btnNewNpc         = document.getElementById('btn-new-npc');
const btnBackNpc        = document.getElementById('btn-back-npc');
const btnSaveNpc        = document.getElementById('btn-save-npc');
const btnDeleteNpc      = document.getElementById('btn-delete-npc');
const npcEditorTitle    = document.getElementById('npc-editor-title');
const npcSystemSelect   = document.getElementById('npc-system-select');
const npcFormContainer  = document.getElementById('npc-form-container');
const npcEditorStatus   = document.getElementById('npc-editor-status');
const npcNameInput      = document.getElementById('npc-name');
const npcRoleInput      = document.getElementById('npc-role');
const npcCrInput        = document.getElementById('npc-cr');
const npcStatusInput    = document.getElementById('npc-status');
const npcDescInput      = document.getElementById('npc-description');
const npcStatsInput     = document.getElementById('npc-stats');
const npcAbilitiesInput = document.getElementById('npc-abilities');
const npcLootInput      = document.getElementById('npc-loot');
const npcNotesInput     = document.getElementById('npc-notes');
const charNavBadge      = document.getElementById('char-nav-badge');

// ── Storage helpers ───────────────────────────────────────────

function allPcKeys()  { return Object.keys(localStorage).filter(k => k.startsWith(PC_PREFIX)); }
function allNpcKeys() { return Object.keys(localStorage).filter(k => k.startsWith(NPC_PREFIX)); }

function loadPcData(id)   { try { return JSON.parse(localStorage.getItem(PC_PREFIX  + id)); } catch { return null; } }
function loadNpcData(id)  { try { return JSON.parse(localStorage.getItem(NPC_PREFIX + id)); } catch { return null; } }
function savePcData(d)    { localStorage.setItem(PC_PREFIX  + d.id, JSON.stringify(d)); }
function saveNpcData(d)   { localStorage.setItem(NPC_PREFIX + d.id, JSON.stringify(d)); }
function deletePcData(id) { localStorage.removeItem(PC_PREFIX  + id); }
function deleteNpcData(id){ localStorage.removeItem(NPC_PREFIX + id); }

function updateCharNavBadge() {
  const n = allPcKeys().length + allNpcKeys().length;
  charNavBadge.textContent = n;
  charNavBadge.style.display = n > 0 ? 'inline-flex' : 'none';
}

// ── System Markdown parser ────────────────────────────────────

const FIELD_TYPES = new Set(['text', 'number', 'textarea', 'select', 'checkbox']);

function parseSystemSections(content) {
  const out = {};
  let cur = null;
  for (const line of content.split('\n')) {
    const m = line.match(/^## (.+)/);
    if (m) { cur = m[1].trim(); out[cur] = []; continue; }
    if (cur && line.trim() && !line.startsWith('#') && !line.startsWith('<!--')) {
      out[cur].push(line.trim());
    }
  }
  return out;
}

function parseFieldLine(line) {
  const parts = line.split('|').map(p => p.trim());
  if (parts.length < 2 || !parts[0]) return null;
  const name = parts[0];
  const ti = parts.findIndex((p, i) => i > 0 && FIELD_TYPES.has(p.toLowerCase()));
  if (ti === -1) return null;
  const type = parts[ti].toLowerCase();
  const f = { name, type };
  if (type === 'select') {
    f.options = parts.slice(ti + 1).join(',').split(',').map(s => s.trim()).filter(Boolean);
  }
  if (type === 'number') {
    parts.forEach(p => {
      const mn = p.match(/^min:(-?\d+)/); if (mn) f.min = +mn[1];
      const mx = p.match(/^max:(-?\d+)/); if (mx) f.max = +mx[1];
    });
  }
  return f;
}

function parseSkillLine(line) {
  const parts = line.split('|').map(p => p.trim());
  if (!parts[0]) return null;
  // skip list bullets, numeric table rows, and very long prose lines
  if (/^[-*+]/.test(parts[0])) return null;
  if (/^\d/.test(parts[0]) || /^[+\-]\d/.test(parts[0])) return null;
  if (parts[0].length > 50) return null;
  return { name: parts[0], attr: parts[1] || '' };
}

// ── PC form builder ───────────────────────────────────────────

function renderPcField(f, saved) {
  const id  = 'pcf_' + f.name.replace(/[^a-zA-Z0-9]/g, '_');
  const da  = `data-field="${escapeHtml(f.name)}"`;
  const val = saved !== undefined && saved !== null ? saved : '';
  const ev  = escapeHtml(String(val));

  if (f.type === 'checkbox') {
    const chk = (val === 'true' || val === true) ? 'checked' : '';
    return `<div class="char-checkbox-row">
      <input type="checkbox" id="${id}" ${da} ${chk}>
      <label class="char-checkbox-label" for="${id}">${escapeHtml(f.name)}</label>
    </div>`;
  }
  if (f.type === 'textarea') {
    return `<div class="char-field char-field-full">
      <label class="char-field-label" for="${id}">${escapeHtml(f.name)}</label>
      <textarea id="${id}" class="char-textarea" rows="3" ${da}>${ev}</textarea>
    </div>`;
  }
  if (f.type === 'select' && f.options && f.options.length) {
    const opts = f.options.map(o =>
      `<option value="${escapeHtml(o)}"${val === o ? ' selected' : ''}>${escapeHtml(o)}</option>`
    ).join('');
    return `<div class="char-field">
      <label class="char-field-label" for="${id}">${escapeHtml(f.name)}</label>
      <select id="${id}" class="char-input" ${da}><option value="">—</option>${opts}</select>
    </div>`;
  }
  if (f.type === 'number') {
    const minA = f.min !== undefined ? ` min="${f.min}"` : '';
    const maxA = f.max !== undefined ? ` max="${f.max}"` : '';
    return `<div class="char-field">
      <label class="char-field-label" for="${id}">${escapeHtml(f.name)}</label>
      <input type="number" id="${id}" class="char-input"${minA}${maxA} value="${ev}" ${da}>
    </div>`;
  }
  // default: text
  return `<div class="char-field">
    <label class="char-field-label" for="${id}">${escapeHtml(f.name)}</label>
    <input type="text" id="${id}" class="char-input" value="${ev}" ${da}>
  </div>`;
}

function buildPcForm(systemContent, savedFields) {
  const secs = parseSystemSections(systemContent);
  const sf   = savedFields || {};
  const html = [];

  // Character fields section
  const charFields = (secs['Character fields'] || []).map(parseFieldLine).filter(Boolean);
  if (charFields.length) {
    html.push('<div class="char-form-section"><div class="char-form-section-title">Character Info</div><div class="char-form-group">');
    charFields.forEach(f => html.push(renderPcField(f, sf[f.name])));
    html.push('</div></div>');
  }

  // Attributes (deduplicate against charFields names)
  const known = new Set(charFields.map(f => f.name.toLowerCase()));
  const attrFields = (secs['Attributes'] || []).map(parseFieldLine).filter(f => f && !known.has(f.name.toLowerCase()));
  if (attrFields.length) {
    html.push('<div class="char-form-section"><div class="char-form-section-title">Attributes</div><div class="char-form-group">');
    attrFields.forEach(f => html.push(renderPcField(f, sf[f.name])));
    html.push('</div></div>');
  }

  // Skills
  const skillFields = (secs['Skills'] || []).map(parseSkillLine).filter(Boolean);
  if (skillFields.length) {
    html.push('<div class="char-form-section"><div class="char-form-section-title">Skills</div><div class="skills-grid">');
    skillFields.forEach(sk => {
      const v = escapeHtml(sf['skill:' + sk.name] || '');
      html.push(`<div class="skill-row">
        <input type="text" class="skill-val-input" data-field="skill:${escapeHtml(sk.name)}" value="${v}" placeholder="—">
        <div class="skill-label-wrap">
          <span class="skill-name">${escapeHtml(sk.name)}</span>
          ${sk.attr ? `<span class="skill-attr">${escapeHtml(sk.attr)}</span>` : ''}
        </div>
      </div>`);
    });
    html.push('</div></div>');
  }

  if (!html.length) {
    return '<div class="char-no-system"><strong>No parseable fields</strong><span>This system has no structured character sheet fields.</span></div>';
  }
  return html.join('');
}

function readPcFormValues() {
  const fields = {};
  pcFormContainer.querySelectorAll('[data-field]').forEach(el => {
    fields[el.dataset.field] = el.type === 'checkbox' ? (el.checked ? 'true' : 'false') : el.value;
  });
  return fields;
}

function getPcDisplayName(data) {
  if (data.fields) {
    return data.fields['Name'] || data.fields['name'] || data.name || 'Unnamed Character';
  }
  return data.name || 'Unnamed Character';
}

// ── PC list ───────────────────────────────────────────────────

function renderPcList(filter) {
  let items = allPcKeys()
    .map(k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } })
    .filter(Boolean)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  if (filter) {
    const q = filter.toLowerCase();
    items = items.filter(d =>
      (d.name || '').toLowerCase().includes(q) ||
      (d.systemName || '').toLowerCase().includes(q)
    );
  }

  pcList.innerHTML = '';
  if (items.length === 0) {
    pcEmpty.style.display = '';
    pcList.style.display = 'none';
    return;
  }
  pcEmpty.style.display = 'none';
  pcList.style.display = '';

  items.forEach(data => {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.innerHTML = `
      <div class="char-card-info">
        <span class="char-card-name">${escapeHtml(data.name || 'Unnamed')}</span>
        ${data.systemName ? `<span class="char-card-meta">${escapeHtml(data.systemName)}</span>` : ''}
      </div>
      ${data.systemName ? `<span class="char-card-sys">${escapeHtml(data.systemName)}</span>` : ''}
      <span class="char-card-arrow">&#8250;</span>`;
    card.addEventListener('click', () => openPcEditor(data.id));
    pcList.appendChild(card);
  });
}

// ── NPC list ──────────────────────────────────────────────────

function renderNpcList(nameFilter, statusFilter) {
  let items = allNpcKeys()
    .map(k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } })
    .filter(Boolean)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  if (nameFilter) {
    const q = nameFilter.toLowerCase();
    items = items.filter(d =>
      (d.name || '').toLowerCase().includes(q) ||
      (d.role || '').toLowerCase().includes(q)
    );
  }
  if (statusFilter) items = items.filter(d => d.status === statusFilter);

  npcList.innerHTML = '';
  if (items.length === 0) {
    npcEmpty.style.display = '';
    npcList.style.display = 'none';
    return;
  }
  npcEmpty.style.display = 'none';
  npcList.style.display = '';

  items.forEach(data => {
    const card = document.createElement('div');
    card.className = 'char-card';
    const st = data.status || 'Unknown';
    card.innerHTML = `
      <div class="char-card-info">
        <span class="char-card-name">${escapeHtml(data.name || 'Unnamed')}</span>
        ${data.role ? `<span class="char-card-meta">${escapeHtml(data.role)}</span>` : ''}
      </div>
      <span class="status-badge status-${escapeHtml(st)}">${escapeHtml(st)}</span>
      <span class="char-card-arrow">&#8250;</span>`;
    card.addEventListener('click', () => openNpcEditor(data.id));
    npcList.appendChild(card);
  });
}

// ── PC editor ────────────────────────────────────────────────

function populatePcSystemSelect(lockedKey) {
  pcSystemSelect.innerHTML = '<option value="">— Select a system —</option>';
  allSystemKeys().forEach(k => {
    const d = loadSystem(k);
    if (!d) return;
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = d.name;
    pcSystemSelect.appendChild(opt);
  });
  if (lockedKey) {
    pcSystemSelect.value = lockedKey;
    pcSystemSelect.disabled = true;
  } else {
    pcSystemSelect.disabled = false;
  }
}

function refreshPcForm(sysKey, savedFields) {
  if (!sysKey) {
    pcFormContainer.innerHTML = '<div class="char-no-system"><strong>No system selected</strong><span>Choose a system above to generate the character sheet.</span></div>';
    return;
  }
  const sys = loadSystem(sysKey);
  if (!sys) {
    pcFormContainer.innerHTML = '<div class="char-no-system"><strong>System not found</strong><span>The system for this character is no longer loaded.</span></div>';
    return;
  }
  pcFormContainer.innerHTML = buildPcForm(sys.content, savedFields || {});
}

function openPcEditor(id) {
  const data = loadPcData(id);
  if (!data) return;

  currentPcId = id;
  pcEditorTitle.textContent = getPcDisplayName(data);
  populatePcSystemSelect(data.systemKey || null);
  refreshPcForm(data.systemKey || null, data.fields);
  setPcUnsaved(false);

  pcListView.style.display = 'none';
  pcEditorView.style.display = 'flex';
}

function closePcEditor() {
  currentPcId = null;
  pcUnsaved   = false;
  pcEditorView.style.display = 'none';
  pcListView.style.display   = '';
  renderPcList(pcSearch.value);
  updateCharNavBadge();
}

function setPcUnsaved(state) {
  pcUnsaved = state;
  if (state) {
    pcEditorStatus.textContent = 'Unsaved changes';
    pcEditorStatus.className   = 'editor-status status-unsaved';
  } else {
    pcEditorStatus.textContent = '';
    pcEditorStatus.className   = 'editor-status';
  }
}

function saveCurrentPc() {
  if (!currentPcId) return;
  const existing   = loadPcData(currentPcId) || {};
  const fields     = readPcFormValues();
  const name       = fields['Name'] || fields['name'] || existing.name || 'Unnamed Character';
  const sysKey     = pcSystemSelect.value;
  const sysOpt     = pcSystemSelect.options[pcSystemSelect.selectedIndex];
  const systemName = sysOpt && sysOpt.value ? sysOpt.text : '';

  savePcData({
    ...existing,
    id: currentPcId,
    name,
    systemKey: sysKey,
    systemName,
    fields,
    updatedAt: new Date().toISOString(),
  });

  pcEditorTitle.textContent = name;
  setPcUnsaved(false);
  flashCharStatus(pcEditorStatus, 'Saved.', 'status-saved', () => pcUnsaved);
  updateCharNavBadge();
}

// ── NPC editor ────────────────────────────────────────────────

function populateNpcSystemSelect() {
  npcSystemSelect.innerHTML = '<option value="">— None —</option>';
  allSystemKeys().forEach(k => {
    const d = loadSystem(k);
    if (!d) return;
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = d.name;
    npcSystemSelect.appendChild(opt);
  });
}

function openNpcEditor(id) {
  const data = loadNpcData(id);
  if (!data) return;

  currentNpcId = id;
  npcEditorTitle.textContent = data.name || 'Unnamed NPC';
  populateNpcSystemSelect();
  npcSystemSelect.value  = data.systemKey  || '';
  npcNameInput.value     = data.name        || '';
  npcRoleInput.value     = data.role        || '';
  npcCrInput.value       = data.cr          || '';
  npcStatusInput.value   = data.status      || 'Alive';
  npcDescInput.value     = data.description || '';
  npcStatsInput.value    = data.stats       || '';
  npcAbilitiesInput.value = data.abilities  || '';
  npcLootInput.value     = data.loot        || '';
  npcNotesInput.value    = data.notes       || '';

  setNpcUnsaved(false);
  npcListView.style.display  = 'none';
  npcEditorView.style.display = 'flex';
}

function closeNpcEditor() {
  currentNpcId = null;
  npcUnsaved   = false;
  npcEditorView.style.display = 'none';
  npcListView.style.display   = '';
  renderNpcList(npcSearch.value, npcStatusFilter.value);
  updateCharNavBadge();
}

function setNpcUnsaved(state) {
  npcUnsaved = state;
  if (state) {
    npcEditorStatus.textContent = 'Unsaved changes';
    npcEditorStatus.className   = 'editor-status status-unsaved';
  } else {
    npcEditorStatus.textContent = '';
    npcEditorStatus.className   = 'editor-status';
  }
}

function saveCurrentNpc() {
  if (!currentNpcId) return;
  const name = npcNameInput.value.trim();
  if (!name) {
    npcNameInput.style.borderColor = 'var(--danger)';
    setTimeout(() => npcNameInput.style.borderColor = '', 1000);
    npcNameInput.focus();
    return;
  }

  const existing   = loadNpcData(currentNpcId) || {};
  const sysOpt     = npcSystemSelect.options[npcSystemSelect.selectedIndex];
  const systemName = sysOpt && sysOpt.value ? sysOpt.text : '';

  saveNpcData({
    ...existing,
    id: currentNpcId,
    name,
    role:        npcRoleInput.value.trim(),
    systemKey:   npcSystemSelect.value,
    systemName,
    cr:          npcCrInput.value.trim(),
    status:      npcStatusInput.value,
    description: npcDescInput.value,
    stats:       npcStatsInput.value,
    abilities:   npcAbilitiesInput.value,
    loot:        npcLootInput.value,
    notes:       npcNotesInput.value,
    updatedAt:   new Date().toISOString(),
  });

  npcEditorTitle.textContent = name;
  setNpcUnsaved(false);
  flashCharStatus(npcEditorStatus, 'Saved.', 'status-saved', () => npcUnsaved);
  updateCharNavBadge();
}

function flashCharStatus(el, msg, cls, isUnsaved) {
  el.textContent = msg;
  el.className   = 'editor-status ' + cls;
  setTimeout(() => {
    if (!isUnsaved()) { el.textContent = ''; el.className = 'editor-status'; }
  }, 2000);
}

// ── Character sub-tab switching ───────────────────────────────

document.querySelectorAll('.char-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.charTab;
    if (tab === currentCharTab) return;

    if (currentCharTab === 'pc' && currentPcId && pcUnsaved) {
      if (!confirm('You have unsaved PC changes. Discard?')) return;
      closePcEditor();
    }
    if (currentCharTab === 'npc' && currentNpcId && npcUnsaved) {
      if (!confirm('You have unsaved NPC changes. Discard?')) return;
      closeNpcEditor();
    }

    currentCharTab = tab;
    document.querySelectorAll('.char-tab-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.charTab === tab)
    );
    charPcPanel.classList.toggle('active', tab === 'pc');
    charNpcPanel.classList.toggle('active', tab === 'npc');
    // toggle display for panels not using active class in CSS when not active
    charPcPanel.style.display  = tab === 'pc'  ? '' : 'none';
    charNpcPanel.style.display = tab === 'npc' ? '' : 'none';

    if (tab === 'pc')  renderPcList(pcSearch.value);
    else               renderNpcList(npcSearch.value, npcStatusFilter.value);
  });
});

// ── PC event listeners ────────────────────────────────────────

btnNewPc.addEventListener('click', () => {
  const id = newId();
  savePcData({
    id,
    name: 'New Character',
    systemKey: '',
    systemName: '',
    fields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  currentPcId = id;
  pcEditorTitle.textContent = 'New Character';
  populatePcSystemSelect(null);
  refreshPcForm(null, null);
  setPcUnsaved(false);
  pcListView.style.display  = 'none';
  pcEditorView.style.display = 'flex';
});

btnBackPc.addEventListener('click', () => {
  if (pcUnsaved && !confirm('You have unsaved changes. Discard and go back?')) return;
  closePcEditor();
});

btnSavePc.addEventListener('click', saveCurrentPc);

btnDeletePc.addEventListener('click', () => {
  if (!currentPcId) return;
  if (!confirm(`Delete "${pcEditorTitle.textContent}"? This cannot be undone.`)) return;
  deletePcData(currentPcId);
  closePcEditor();
});

// Regenerate form when system changes
pcSystemSelect.addEventListener('change', () => {
  const sysKey = pcSystemSelect.value;

  // Warn if the form already has values
  const hasValues = Array.from(pcFormContainer.querySelectorAll('[data-field]'))
    .some(el => el.type === 'checkbox' ? el.checked : el.value.trim() !== '');

  if (hasValues && !confirm('Changing system will clear all field values. Continue?')) {
    const prev = currentPcId ? (loadPcData(currentPcId) || {}).systemKey : '';
    pcSystemSelect.value = prev || '';
    return;
  }

  refreshPcForm(sysKey, null);
  if (currentPcId) setPcUnsaved(true);
});

pcFormContainer.addEventListener('input',  () => { if (currentPcId) setPcUnsaved(true); });
pcFormContainer.addEventListener('change', () => { if (currentPcId) setPcUnsaved(true); });

pcSearch.addEventListener('input', () => renderPcList(pcSearch.value));

// ── NPC event listeners ───────────────────────────────────────

btnNewNpc.addEventListener('click', () => {
  const id = newId();
  saveNpcData({
    id,
    name: '',
    role: '',
    systemKey: '',
    systemName: '',
    cr: '',
    status: 'Alive',
    description: '',
    stats: '',
    abilities: '',
    loot: '',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  openNpcEditor(id);
});

btnBackNpc.addEventListener('click', () => {
  if (npcUnsaved && !confirm('You have unsaved changes. Discard and go back?')) return;
  closeNpcEditor();
});

btnSaveNpc.addEventListener('click', saveCurrentNpc);

btnDeleteNpc.addEventListener('click', () => {
  if (!currentNpcId) return;
  if (!confirm(`Delete "${npcNameInput.value.trim() || 'this NPC'}"? This cannot be undone.`)) return;
  deleteNpcData(currentNpcId);
  closeNpcEditor();
});

[npcNameInput, npcRoleInput, npcCrInput, npcDescInput, npcStatsInput,
 npcAbilitiesInput, npcLootInput, npcNotesInput].forEach(el =>
  el.addEventListener('input', () => setNpcUnsaved(true))
);
npcStatusInput.addEventListener('change',  () => setNpcUnsaved(true));
npcSystemSelect.addEventListener('change', () => setNpcUnsaved(true));

npcSearch.addEventListener('input', () =>
  renderNpcList(npcSearch.value, npcStatusFilter.value)
);
npcStatusFilter.addEventListener('change', () =>
  renderNpcList(npcSearch.value, npcStatusFilter.value)
);
