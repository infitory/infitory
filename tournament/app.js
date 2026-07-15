/* =========================================================
 * Tournify — Gestionnaire de tournois
 * Étape 1 : création de tournois, génération d'équipes/joueurs
 * (aléatoire ou CSV), persistance en localStorage.
 * Étape 2 (à venir) : brackets & rondes. Étape 3 : simulation & stats.
 * ========================================================= */

'use strict';

/* ===== Données de référence ===== */

const DISCIPLINES = [
  { id: 'lol',      label: 'League of Legends (esport)', teamSize: 5, roles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'] },
  { id: 'cs2',      label: 'Counter-Strike 2 (esport)',  teamSize: 5, roles: ['IGL', 'AWPer', 'Entry', 'Support', 'Lurker'] },
  { id: 'valorant', label: 'Valorant (esport)',          teamSize: 5, roles: ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'Flex'] },
  { id: 'rl',       label: 'Rocket League (esport)',     teamSize: 3, roles: ['Striker', 'Midfield', 'Goalkeeper'] },
  { id: 'football', label: 'Football (sport)',           teamSize: 11, roles: ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'] },
  { id: 'basket',   label: 'Basketball (sport)',         teamSize: 5, roles: ['Meneur', 'Arrière', 'Ailier', 'Ailier fort', 'Pivot'] },
  { id: 'volley',   label: 'Volleyball (sport)',         teamSize: 6, roles: ['Passeur', 'Attaquant', 'Central', 'Libéro'] },
  { id: 'custom',   label: 'Autre / personnalisé',       teamSize: 5, roles: [] },
];

const FORMATS = [
  { id: 'single_elim', label: 'Élimination simple', icon: '🗡️',
    desc: 'Bracket classique : une défaite et c\'est terminé.' },
  { id: 'double_elim', label: 'Élimination double', icon: '⚔️',
    desc: 'Winner et loser bracket : il faut perdre deux fois pour être éliminé.' },
  { id: 'round_robin', label: 'Round robin (championnat)', icon: '🔁',
    desc: 'Chaque équipe affronte toutes les autres. Classement aux points.' },
  { id: 'swiss', label: 'Système suisse', icon: '🇨🇭',
    desc: 'Nombre de rondes fixe, les équipes au même score s\'affrontent.' },
];

const TEAM_COUNTS = [4, 6, 8, 12, 16, 24, 32];

/* Pools de noms pour la génération aléatoire */
const TEAM_ADJ = ['Crimson', 'Shadow', 'Golden', 'Iron', 'Mystic', 'Savage', 'Frozen', 'Thunder',
  'Phantom', 'Rogue', 'Solar', 'Lunar', 'Venom', 'Blazing', 'Silent', 'Electric',
  'Ancient', 'Wild', 'Neon', 'Obsidian', 'Royal', 'Feral', 'Storm', 'Astral'];
const TEAM_NOUN = ['Wolves', 'Dragons', 'Titans', 'Ravens', 'Vipers', 'Knights', 'Falcons', 'Sharks',
  'Phoenix', 'Golems', 'Spartans', 'Krakens', 'Panthers', 'Wizards', 'Reapers', 'Bulls',
  'Eagles', 'Lions', 'Cobras', 'Bears', 'Hornets', 'Pirates', 'Samurai', 'Ghosts'];
const FIRST_NAMES = ['Lucas', 'Emma', 'Hugo', 'Léa', 'Nathan', 'Chloé', 'Théo', 'Manon', 'Louis', 'Camille',
  'Enzo', 'Sarah', 'Mathis', 'Inès', 'Tom', 'Jade', 'Noah', 'Zoé', 'Ethan', 'Lina',
  'Maxime', 'Eva', 'Axel', 'Nora', 'Sacha', 'Mia', 'Rayan', 'Alice', 'Liam', 'Anna'];
const NICKNAMES = ['Blaze', 'Frost', 'Nova', 'Pixel', 'Zenith', 'Havoc', 'Echo', 'Viper', 'Karma', 'Drift',
  'Specter', 'Flick', 'Clutch', 'Omen', 'Rush', 'Jinx', 'Apex', 'Bolt', 'Cypher', 'Dash',
  'Fury', 'Glitch', 'Hex', 'Ion', 'Krypt', 'Loop', 'Mirage', 'Nyx', 'Onyx', 'Pulse'];

/* ===== Persistance ===== */

const STORAGE_KEY = 'tournify-data-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('État corrompu, réinitialisation.', e); }
  return { tournaments: [] };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = loadState();

/* ===== Utilitaires ===== */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

let toastTimer = null;
function toast(msg, isError = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('err', isError);
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

/* ===== Génération d'équipes & joueurs ===== */

function makePlayer(name, role, teamId) {
  return {
    id: uid(),
    name,
    role: role || '',
    teamId,
    // Stats remplies à l'étape 3 (simulation)
    stats: { matches: 0, wins: 0, losses: 0, score: 0, mvp: 0 },
  };
}

function makeTeam(name, tag) {
  return {
    id: uid(),
    name,
    tag: tag || name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4),
    players: [],
    // Rating caché utilisé pour la simulation (étape 3)
    rating: Math.round(1000 + Math.random() * 400),
    stats: { matches: 0, wins: 0, losses: 0, draws: 0, points: 0, scoreFor: 0, scoreAgainst: 0 },
  };
}

function generateRandomTeams(count, teamSize, discipline) {
  const roles = discipline.roles;
  const usedTeamNames = new Set();
  const usedPlayerNames = new Set();
  const teams = [];

  for (let i = 0; i < count; i++) {
    let name;
    do { name = `${pick(TEAM_ADJ)} ${pick(TEAM_NOUN)}`; } while (usedTeamNames.has(name));
    usedTeamNames.add(name);
    const team = makeTeam(name);

    for (let p = 0; p < teamSize; p++) {
      let pname;
      do { pname = `${pick(FIRST_NAMES)} "${pick(NICKNAMES)}"`; } while (usedPlayerNames.has(pname));
      usedPlayerNames.add(pname);
      const role = roles.length ? roles[p % roles.length] : '';
      team.players.push(makePlayer(pname, role, team.id));
    }
    teams.push(team);
  }
  return teams;
}

/* ===== Import CSV ===== */

/**
 * Parse un CSV "equipe,joueur[,role]" (avec ou sans ligne d'en-tête).
 * Retourne { teams: [...], errors: [...] }
 */
function parseTeamsCsv(text) {
  const errors = [];
  const byTeam = new Map();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  lines.forEach((line, idx) => {
    const cols = line.split(/[,;]/).map(c => c.trim().replace(/^"|"$/g, ''));
    // Ignorer une éventuelle ligne d'en-tête
    if (idx === 0 && /^(equipe|équipe|team)$/i.test(cols[0] || '')) return;
    if (cols.length < 2 || !cols[0] || !cols[1]) {
      errors.push(`Ligne ${idx + 1} ignorée : « ${line.slice(0, 60)} »`);
      return;
    }
    const [teamName, playerName, role] = cols;
    if (!byTeam.has(teamName)) byTeam.set(teamName, makeTeam(teamName));
    const team = byTeam.get(teamName);
    team.players.push(makePlayer(playerName, role || '', team.id));
  });

  return { teams: [...byTeam.values()], errors };
}

function csvExample() {
  const teams = generateRandomTeams(4, 5, DISCIPLINES[0]);
  const rows = ['equipe,joueur,role'];
  for (const t of teams) {
    for (const p of t.players) rows.push(`${t.name},${p.name.replace(/,/g, ' ')},${p.role}`);
  }
  return rows.join('\n');
}

/* ===== Création de tournoi ===== */

function createTournament({ name, disciplineId, format, teamCount, teamSize, swissRounds, teams }) {
  const discipline = DISCIPLINES.find(d => d.id === disciplineId) || DISCIPLINES[0];
  return {
    id: uid(),
    name,
    disciplineId,
    disciplineLabel: discipline.label,
    format,
    teamCount,
    teamSize,
    swissRounds: format === 'swiss' ? swissRounds : null,
    status: 'setup', // setup → ongoing → finished (étapes 2-3)
    teams,
    rounds: [],       // rempli à l'étape 2 (génération du bracket)
    createdAt: new Date().toISOString(),
  };
}

/* ===== Rendu : navigation ===== */

let currentTournamentId = null;

function showView(id) {
  $$('.view').forEach(v => v.classList.remove('active'));
  $(`#view-${id}`).classList.add('active');
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === id));
  window.scrollTo(0, 0);
}

/* ===== Rendu : liste des tournois ===== */

function formatLabel(id) {
  const f = FORMATS.find(f => f.id === id);
  return f ? `${f.icon} ${f.label}` : id;
}

function statusBadge(status) {
  const labels = { setup: 'En préparation', ongoing: 'En cours', finished: 'Terminé' };
  return `<span class="badge ${status}">${labels[status] || status}</span>`;
}

function renderTournamentList() {
  const list = $('#tournament-list');
  const empty = $('#tournaments-empty');
  const ts = state.tournaments;

  empty.classList.toggle('hidden', ts.length > 0);
  list.innerHTML = ts.map(t => `
    <div class="t-card" data-id="${t.id}">
      <h3>${esc(t.name)}</h3>
      <span class="badge format">${formatLabel(t.format)}</span>
      ${statusBadge(t.status)}
      <div class="meta">
        <span>🎮 ${esc(t.disciplineLabel)}</span>
        <span>👥 ${t.teams.length} équipes</span>
        <span>📅 ${new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
      </div>
    </div>
  `).join('');

  $$('#tournament-list .t-card').forEach(card => {
    card.addEventListener('click', () => openTournament(card.dataset.id));
  });
}

/* ===== Rendu : détail d'un tournoi ===== */

function openTournament(id) {
  currentTournamentId = id;
  renderTournamentDetail();
  showView('detail');
}

function renderTournamentDetail() {
  const t = state.tournaments.find(t => t.id === currentTournamentId);
  const box = $('#detail-content');
  if (!t) { box.innerHTML = '<p>Tournoi introuvable.</p>'; return; }

  box.innerHTML = `
    <div class="detail-header">
      <button class="back" id="btn-back">← Retour aux tournois</button>
      <div class="title-row">
        <h1>${esc(t.name)}</h1>
        ${statusBadge(t.status)}
        <div class="actions">
          <button class="btn btn-danger btn-sm" id="btn-delete">Supprimer</button>
        </div>
      </div>
      <div class="detail-meta">
        <span>🎮 ${esc(t.disciplineLabel)}</span>
        <span class="badge format">${formatLabel(t.format)}</span>
        <span>👥 ${t.teams.length} équipes · ${t.teamSize} joueurs/équipe</span>
        ${t.format === 'swiss' ? `<span>🔄 ${t.swissRounds} rondes</span>` : ''}
      </div>
    </div>

    <div class="notice">
      🚧 <strong>Étape suivante :</strong> la génération du bracket / des rondes (${formatLabel(t.format)})
      puis la simulation des matchs et les statistiques arrivent dans les prochaines étapes.
    </div>

    <h2 class="section-title">Équipes (${t.teams.length})</h2>
    <div class="teams-grid">
      ${t.teams.map(team => `
        <div class="team-card">
          <div class="team-name"><span class="tag">${esc(team.tag)}</span> ${esc(team.name)}</div>
          <ul>
            ${team.players.map(p => `
              <li><span>${esc(p.name)}</span>${p.role ? `<span class="role">${esc(p.role)}</span>` : ''}</li>
            `).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;

  $('#btn-back').addEventListener('click', () => { renderTournamentList(); showView('tournaments'); });
  $('#btn-delete').addEventListener('click', () => {
    if (!confirm(`Supprimer le tournoi « ${t.name} » ?`)) return;
    state.tournaments = state.tournaments.filter(x => x.id !== t.id);
    saveState();
    toast('Tournoi supprimé.');
    renderTournamentList();
    showView('tournaments');
  });
}

/* ===== Formulaire de création ===== */

let csvTeams = null; // équipes issues du dernier CSV importé

function initCreateForm() {
  // Disciplines
  const dSel = $('#t-discipline');
  dSel.innerHTML = DISCIPLINES.map(d => `<option value="${d.id}">${esc(d.label)}</option>`).join('');
  dSel.addEventListener('change', () => {
    const d = DISCIPLINES.find(x => x.id === dSel.value);
    if (d) $('#t-teamsize').value = d.teamSize;
  });

  // Nombre d'équipes
  $('#t-teamcount').innerHTML = TEAM_COUNTS.map(n => `<option value="${n}" ${n === 8 ? 'selected' : ''}>${n}</option>`).join('');

  // Cartes de format
  const fBox = $('#format-cards');
  fBox.innerHTML = FORMATS.map((f, i) => `
    <div class="format-card ${i === 0 ? 'selected' : ''}" data-format="${f.id}">
      <strong>${f.icon} ${f.label}</strong>
      <small>${f.desc}</small>
    </div>
  `).join('');
  fBox.addEventListener('click', (e) => {
    const card = e.target.closest('.format-card');
    if (!card) return;
    $$('.format-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    $('#swiss-rounds-field').style.display = card.dataset.format === 'swiss' ? '' : 'none';
  });

  // Source des équipes
  $$('input[name="team-source"]').forEach(r => {
    r.addEventListener('change', () => {
      $('#csv-zone').classList.toggle('hidden', getTeamSource() !== 'csv');
    });
  });

  // Import CSV
  $('#csv-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const preview = $('#csv-preview');
    csvTeams = null;
    if (!file) { preview.innerHTML = ''; return; }
    const text = await file.text();
    const { teams, errors } = parseTeamsCsv(text);
    if (!teams.length) {
      preview.innerHTML = `<span class="err">❌ Aucune équipe valide trouvée dans ce fichier.</span>`;
      return;
    }
    csvTeams = teams;
    const totalPlayers = teams.reduce((s, t) => s + t.players.length, 0);
    preview.innerHTML = `
      <span class="ok">✅ ${teams.length} équipes, ${totalPlayers} joueurs détectés.</span>
      ${errors.length ? `<br><span class="err">⚠️ ${errors.length} ligne(s) ignorée(s).</span>` : ''}
      <br>${teams.slice(0, 5).map(t => esc(`${t.name} (${t.players.length}j)`)).join(' · ')}${teams.length > 5 ? ' …' : ''}
    `;
  });

  // Exemple CSV téléchargeable
  $('#csv-example').addEventListener('click', (e) => {
    e.preventDefault();
    const blob = new Blob([csvExample()], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'exemple-equipes.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // Soumission
  $('#create-form').addEventListener('submit', onCreateSubmit);
}

function getTeamSource() {
  return document.querySelector('input[name="team-source"]:checked').value;
}

function onCreateSubmit(e) {
  e.preventDefault();

  const name = $('#t-name').value.trim();
  const disciplineId = $('#t-discipline').value;
  const format = $('.format-card.selected').dataset.format;
  const teamCount = parseInt($('#t-teamcount').value, 10);
  const teamSize = Math.max(1, parseInt($('#t-teamsize').value, 10) || 5);
  const swissRounds = Math.max(1, parseInt($('#t-swissrounds').value, 10) || 5);
  const discipline = DISCIPLINES.find(d => d.id === disciplineId);

  if (!name) { toast('Donnez un nom au tournoi.', true); return; }

  let teams;
  if (getTeamSource() === 'csv') {
    if (!csvTeams || !csvTeams.length) {
      toast('Importez d\'abord un fichier CSV valide.', true);
      return;
    }
    if (csvTeams.length < 2) {
      toast('Il faut au moins 2 équipes dans le CSV.', true);
      return;
    }
    // Copie profonde pour que chaque tournoi ait ses propres équipes
    teams = JSON.parse(JSON.stringify(csvTeams));
  } else {
    teams = generateRandomTeams(teamCount, teamSize, discipline);
  }

  const tournament = createTournament({
    name, disciplineId, format,
    teamCount: teams.length, teamSize, swissRounds, teams,
  });

  state.tournaments.unshift(tournament);
  saveState();
  toast(`Tournoi « ${name} » créé avec ${teams.length} équipes ! 🎉`);

  // Reset du formulaire
  e.target.reset();
  csvTeams = null;
  $('#csv-preview').innerHTML = '';
  $('#csv-zone').classList.add('hidden');
  $$('.format-card').forEach((c, i) => c.classList.toggle('selected', i === 0));
  $('#swiss-rounds-field').style.display = 'none';
  initCreateFormDefaults();

  openTournament(tournament.id);
}

function initCreateFormDefaults() {
  $('#t-teamcount').value = '8';
  const d = DISCIPLINES.find(x => x.id === $('#t-discipline').value);
  if (d) $('#t-teamsize').value = d.teamSize;
}

/* ===== Bootstrap ===== */

function init() {
  // Navigation topbar + boutons "data-goto"
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.view === 'tournaments') renderTournamentList();
      showView(btn.dataset.view);
    });
  });
  document.body.addEventListener('click', (e) => {
    const goto = e.target.closest('[data-goto]');
    if (!goto) return;
    if (goto.dataset.goto === 'tournaments') renderTournamentList();
    showView(goto.dataset.goto);
  });

  initCreateForm();
  initCreateFormDefaults();
  renderTournamentList();
}

init();
