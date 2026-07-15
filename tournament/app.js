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

/* Modèle de score par discipline (utilisé par la simulation) :
 * - bo     : best-of N manches (esports, volley) → 2-1, 3-2…
 * - goals  : buts (football) → 2-1, 0-0…, nuls possibles en round robin
 * - points : gros scores (basket) → 102-96… */
const SCORE_MODELS = {
  lol:      { kind: 'bo', sets: 3 },
  cs2:      { kind: 'bo', sets: 3 },
  valorant: { kind: 'bo', sets: 3 },
  rl:       { kind: 'bo', sets: 5 },
  football: { kind: 'goals', max: 5, draw: true },
  basket:   { kind: 'points', min: 60, max: 130 },
  volley:   { kind: 'bo', sets: 5 },
  custom:   { kind: 'bo', sets: 3 },
};

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
    schedule: null,   // bracket / calendrier, généré au démarrage du tournoi
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
        ${t.status === 'finished' && t.championId
          ? `<span class="champ">🏆 ${esc(t.teams.find(x => x.id === t.championId)?.name ?? '')}</span>` : ''}
      </div>
    </div>
  `).join('');

  $$('#tournament-list .t-card').forEach(card => {
    card.addEventListener('click', () => openTournament(card.dataset.id));
  });
}

/* =========================================================
 * Étape 2 : génération des brackets & calendriers
 * ========================================================= */

const BYE = 'BYE';

function nextPow2(n) { let p = 1; while (p < n) p *= 2; return p; }

function makeMatch(bracket, round, index) {
  return {
    id: uid(), bracket, round, index,
    // Chaque slot : teamId (id | 'BYE' | null) et src ({matchId, take:'winner'|'loser'})
    a: { teamId: null, src: null },
    b: { teamId: null, src: null },
    scoreA: null, scoreB: null,
    winnerId: null, loserId: null,
    status: 'pending', // pending → done (étape 3 : simulation)
  };
}

/* --- Élimination simple --- */
function generateSingleElim(t) {
  const ids = shuffle(t.teams.map(x => x.id));
  const S = nextPow2(ids.length);
  const byes = S - ids.length;
  const nRounds = Math.log2(S);
  const rounds = [];

  const r1 = [];
  let ti = 0;
  for (let i = 0; i < S / 2; i++) {
    const m = makeMatch('W', 1, i);
    m.a.teamId = ids[ti++];
    m.b.teamId = i < byes ? BYE : ids[ti++];
    r1.push(m);
  }
  rounds.push(r1);

  let prev = r1;
  for (let r = 2; r <= nRounds; r++) {
    const cur = [];
    for (let i = 0; i < prev.length / 2; i++) {
      const m = makeMatch('W', r, i);
      m.a.src = { matchId: prev[2 * i].id, take: 'winner' };
      m.b.src = { matchId: prev[2 * i + 1].id, take: 'winner' };
      cur.push(m);
    }
    rounds.push(cur);
    prev = cur;
  }
  return { type: 'single_elim', rounds };
}

/* --- Élimination double (winner + loser bracket + grande finale) --- */
function generateDoubleElim(t) {
  const wb = generateSingleElim(t).rounds;
  const k = wb.length;
  const lb = [];

  if (k >= 2) {
    // LB ronde 1 : les perdants de la WB ronde 1 s'affrontent
    const r1 = [];
    for (let i = 0; i < wb[0].length / 2; i++) {
      const m = makeMatch('L', 1, i);
      m.a.src = { matchId: wb[0][2 * i].id, take: 'loser' };
      m.b.src = { matchId: wb[0][2 * i + 1].id, take: 'loser' };
      r1.push(m);
    }
    lb.push(r1);

    let lround = 1;
    for (let j = 1; j <= k - 1; j++) {
      if (j >= 2) {
        // Ronde "mineure" : les survivants du LB s'affrontent entre eux
        const prev = lb[lb.length - 1];
        const minor = [];
        lround++;
        for (let i = 0; i < prev.length / 2; i++) {
          const m = makeMatch('L', lround, i);
          m.a.src = { matchId: prev[2 * i].id, take: 'winner' };
          m.b.src = { matchId: prev[2 * i + 1].id, take: 'winner' };
          minor.push(m);
        }
        lb.push(minor);
      }
      // Ronde "majeure" : survivants du LB vs perdants de la WB ronde j+1
      const prev = lb[lb.length - 1];
      const major = [];
      lround++;
      for (let i = 0; i < prev.length; i++) {
        const m = makeMatch('L', lround, i);
        m.a.src = { matchId: prev[i].id, take: 'winner' };
        m.b.src = { matchId: wb[j][i].id, take: 'loser' };
        major.push(m);
      }
      lb.push(major);
    }
  }

  const gf = makeMatch('GF', 1, 0);
  gf.a.src = { matchId: wb[k - 1][0].id, take: 'winner' };
  gf.b.src = k >= 2
    ? { matchId: lb[lb.length - 1][0].id, take: 'winner' }
    : { matchId: wb[0][0].id, take: 'loser' }; // cas dégénéré à 2 équipes
  return { type: 'double_elim', wb, lb, gf };
}

/* --- Round robin (méthode du cercle) --- */
function generateRoundRobin(t) {
  const ids = shuffle(t.teams.map(x => x.id));
  if (ids.length % 2 === 1) ids.push(BYE);
  const n = ids.length;
  const arr = [...ids];
  const rounds = [];
  for (let r = 1; r < n; r++) {
    const matches = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i], b = arr[n - 1 - i];
      if (a === BYE || b === BYE) continue; // l'équipe est exempte cette ronde
      const m = makeMatch('RR', r, matches.length);
      m.a.teamId = a;
      m.b.teamId = b;
      matches.push(m);
    }
    rounds.push(matches);
    arr.splice(1, 0, arr.pop()); // rotation, le premier reste fixe
  }
  return { type: 'round_robin', rounds };
}

/* --- Système suisse : ronde 1 aléatoire, les suivantes d'après le classement --- */
function generateSwiss(t) {
  const ids = shuffle(t.teams.map(x => x.id));
  const matches = [];
  for (let i = 0; i + 1 < ids.length; i += 2) {
    const m = makeMatch('SW', 1, matches.length);
    m.a.teamId = ids[i];
    m.b.teamId = ids[i + 1];
    matches.push(m);
  }
  if (ids.length % 2 === 1) {
    const m = makeMatch('SW', 1, matches.length);
    m.a.teamId = ids[ids.length - 1];
    m.b.teamId = BYE;
    matches.push(m);
  }
  return { type: 'swiss', totalRounds: t.swissRounds || 5, rounds: [matches] };
}

function allMatches(t) {
  const s = t.schedule;
  if (!s) return [];
  if (s.type === 'double_elim') return [...s.wb.flat(), ...s.lb.flat(), s.gf];
  return s.rounds.flat();
}

/**
 * Propage les résultats : remplit les slots dont le match source est terminé
 * et résout automatiquement les matchs contre un BYE.
 */
function propagate(t) {
  const matches = allMatches(t);
  const byId = new Map(matches.map(m => [m.id, m]));
  let changed = true;
  while (changed) {
    changed = false;
    for (const m of matches) {
      for (const key of ['a', 'b']) {
        const s = m[key];
        if (s.teamId === null && s.src) {
          const srcM = byId.get(s.src.matchId);
          if (srcM && srcM.status === 'done') {
            s.teamId = s.src.take === 'winner' ? srcM.winnerId : srcM.loserId;
            changed = true;
          }
        }
      }
      if (m.status === 'pending' && m.a.teamId !== null && m.b.teamId !== null &&
          (m.a.teamId === BYE || m.b.teamId === BYE)) {
        m.status = 'done';
        if (m.a.teamId === BYE && m.b.teamId === BYE) { m.winnerId = BYE; m.loserId = BYE; }
        else if (m.a.teamId === BYE) { m.winnerId = m.b.teamId; m.loserId = BYE; }
        else { m.winnerId = m.a.teamId; m.loserId = BYE; }
        changed = true;
      }
    }
  }
}

/* =========================================================
 * Étape 3 : simulation des matchs & statistiques
 * ========================================================= */

/** Matchs prêts à être joués (deux vraies équipes connues). */
function readyMatches(t) {
  return allMatches(t).filter(m =>
    m.status === 'pending' &&
    m.a.teamId && m.b.teamId &&
    m.a.teamId !== BYE && m.b.teamId !== BYE);
}

/** Répartit `total` en `n` parts entières aléatoires (somme exacte). */
function distribute(total, n) {
  const weights = Array.from({ length: n }, () => Math.random() + 0.1);
  const sum = weights.reduce((a, b) => a + b, 0);
  const parts = weights.map(w => Math.floor(total * w / sum));
  let rest = total - parts.reduce((a, b) => a + b, 0);
  while (rest > 0) { parts[Math.floor(Math.random() * n)]++; rest--; }
  return parts;
}

function genScore(model) {
  if (model.kind === 'goals') {
    const w = 1 + Math.floor(Math.random() * model.max);
    return [w, Math.floor(Math.random() * w)];
  }
  if (model.kind === 'points') {
    const w = model.min + Math.floor(Math.random() * (model.max - model.min));
    return [w, w - (1 + Math.floor(Math.random() * 25))];
  }
  // best-of N
  const w = Math.ceil(model.sets / 2);
  return [w, Math.floor(Math.random() * w)];
}

/**
 * Simule un match : vainqueur tiré selon un Elo caché, score selon la
 * discipline, mise à jour des stats équipes/joueurs, MVP et ratings.
 */
function simulateMatch(t, m) {
  const ta = teamById(t, m.a.teamId);
  const tb = teamById(t, m.b.teamId);
  if (!ta || !tb) return;
  const model = SCORE_MODELS[t.disciplineId] || SCORE_MODELS.custom;
  const pa = 1 / (1 + Math.pow(10, (tb.rating - ta.rating) / 400));

  const allowDraw = !!model.draw && t.format === 'round_robin';
  let winner; // 'a' | 'b' | null (nul)
  if (allowDraw && Math.random() < 0.22) {
    winner = null;
    m.scoreA = m.scoreB = Math.floor(Math.random() * model.max);
  } else {
    winner = Math.random() < pa ? 'a' : 'b';
    const [sw, sl] = genScore(model);
    m.scoreA = winner === 'a' ? sw : sl;
    m.scoreB = winner === 'b' ? sw : sl;
  }
  m.winnerId = winner === 'a' ? ta.id : winner === 'b' ? tb.id : null;
  m.loserId = winner === 'a' ? tb.id : winner === 'b' ? ta.id : null;
  m.status = 'done';

  // Stats d'équipe
  const apply = (team, own, opp, res) => {
    team.stats.matches++;
    team.stats.scoreFor += own;
    team.stats.scoreAgainst += opp;
    if (res === 'w') { team.stats.wins++; team.stats.points += 3; }
    else if (res === 'd') { team.stats.draws++; team.stats.points += 1; }
    else team.stats.losses++;
  };
  apply(ta, m.scoreA, m.scoreB, winner === 'a' ? 'w' : winner === null ? 'd' : 'l');
  apply(tb, m.scoreB, m.scoreA, winner === 'b' ? 'w' : winner === null ? 'd' : 'l');

  // Stats des joueurs : contribution au score + éventuel MVP côté vainqueur
  const contributions = new Map();
  for (const [team, teamScore, won] of [[ta, m.scoreA, winner === 'a'], [tb, m.scoreB, winner === 'b']]) {
    const parts = model.kind === 'bo'
      ? team.players.map(() => 5 + Math.floor(Math.random() * 20) + (won ? 5 : 0)) // perf type frags
      : distribute(teamScore, team.players.length);                                // buts / points réels
    team.players.forEach((p, i) => {
      p.stats.matches++;
      if (winner !== null) { won ? p.stats.wins++ : p.stats.losses++; }
      p.stats.score += parts[i];
      contributions.set(p.id, parts[i]);
    });
  }
  if (winner !== null) {
    const winTeam = winner === 'a' ? ta : tb;
    const mvp = [...winTeam.players].sort((x, y) => contributions.get(y.id) - contributions.get(x.id))[0];
    if (mvp) mvp.stats.mvp++;
  }

  // Mise à jour Elo (rating caché)
  const K = 24;
  const sa = winner === 'a' ? 1 : winner === null ? 0.5 : 0;
  ta.rating = Math.round(ta.rating + K * (sa - pa));
  tb.rating = Math.round(tb.rating + K * ((1 - sa) - (1 - pa)));
}

/* --- Rondes suisses suivantes, générées d'après le classement --- */

function pairKey(a, b) { return a < b ? `${a}|${b}` : `${b}|${a}`; }

function generateNextSwissRound(t) {
  const s = t.schedule;
  const roundNo = s.rounds.length + 1;
  const played = new Set();
  const hadBye = new Set();
  for (const m of allMatches(t)) {
    if (m.a.teamId === BYE || m.b.teamId === BYE) {
      hadBye.add(m.a.teamId === BYE ? m.b.teamId : m.a.teamId);
    } else if (m.a.teamId && m.b.teamId) {
      played.add(pairKey(m.a.teamId, m.b.teamId));
    }
  }

  const ids = computeStandings(t).map(r => r.team.id);
  const matches = [];

  // Nombre impair : exempt pour la moins bien classée n'ayant pas encore eu de bye
  if (ids.length % 2 === 1) {
    let byeIdx = ids.length - 1;
    for (let i = ids.length - 1; i >= 0; i--) {
      if (!hadBye.has(ids[i])) { byeIdx = i; break; }
    }
    const byeTeam = ids.splice(byeIdx, 1)[0];
    const m = makeMatch('SW', roundNo, 0);
    m.a.teamId = byeTeam;
    m.b.teamId = BYE;
    matches.push(m);
  }

  // Appariement glouton : voisin de classement, en évitant les re-matchs
  while (ids.length) {
    const a = ids.shift();
    let idx = ids.findIndex(b => !played.has(pairKey(a, b)));
    if (idx === -1) idx = 0;
    const b = ids.splice(idx, 1)[0];
    const m = makeMatch('SW', roundNo, matches.length);
    m.a.teamId = a;
    m.b.teamId = b;
    matches.push(m);
  }
  s.rounds.push(matches);
}

/* --- Avancement / fin de tournoi --- */

function swissRoundPending(t) {
  const s = t.schedule;
  return s.type === 'swiss' && s.rounds.length < s.totalRounds &&
    allMatches(t).every(m => m.status === 'done');
}

function maybeFinish(t) {
  if (t.status !== 'ongoing') return;
  const s = t.schedule;
  if (s.type === 'swiss' && s.rounds.length < s.totalRounds) return;
  if (!allMatches(t).every(m => m.status === 'done')) return;
  if (s.type === 'single_elim') t.championId = s.rounds[s.rounds.length - 1][0].winnerId;
  else if (s.type === 'double_elim') t.championId = s.gf.winnerId;
  else t.championId = computeStandings(t)[0]?.team.id ?? null;
  t.status = 'finished';
  const champ = teamById(t, t.championId);
  if (champ) toast(`🏆 ${champ.name} remporte le tournoi !`);
}

/** Après une ou plusieurs simulations : propage, génère la ronde suisse
 *  suivante si besoin, clôture le tournoi, sauvegarde et ré-affiche. */
function afterSim(t) {
  propagate(t);
  if (swissRoundPending(t)) {
    generateNextSwissRound(t);
    propagate(t); // résout un éventuel exempt de la nouvelle ronde
  }
  maybeFinish(t);
  saveState();
  renderTournamentDetail();
}

function simOne(t) {
  const ready = readyMatches(t);
  if (!ready.length) { afterSim(t); return; }
  simulateMatch(t, ready[0]);
  afterSim(t);
}

function simRound(t) {
  // Simule uniquement la ronde en cours (celle du premier match prêt)
  const ready = readyMatches(t);
  if (ready.length) {
    const ref = ready[0];
    for (const m of ready.filter(x => x.bracket === ref.bracket && x.round === ref.round)) {
      simulateMatch(t, m);
    }
  }
  afterSim(t);
}

function simAll(t) {
  let guard = 5000;
  while (guard-- > 0) {
    propagate(t);
    const ready = readyMatches(t);
    if (!ready.length) {
      if (swissRoundPending(t)) { generateNextSwissRound(t); continue; }
      break;
    }
    simulateMatch(t, ready[0]);
  }
  afterSim(t);
}

function simMatchById(t, matchId) {
  const m = allMatches(t).find(x => x.id === matchId);
  if (m && readyMatches(t).includes(m)) simulateMatch(t, m);
  afterSim(t);
}

function startTournament(t) {
  if (t.teams.length < 2) { toast('Il faut au moins 2 équipes pour démarrer.', true); return; }
  if (t.format === 'single_elim') t.schedule = generateSingleElim(t);
  else if (t.format === 'double_elim') t.schedule = generateDoubleElim(t);
  else if (t.format === 'round_robin') t.schedule = generateRoundRobin(t);
  else t.schedule = generateSwiss(t);
  propagate(t);
  t.status = 'ongoing';
  saveState();
  detailTab = 'matches';
  toast('Tournoi démarré ! 🎬');
  renderTournamentDetail();
}

function resetTournament(t) {
  if (!confirm(`Réinitialiser « ${t.name} » ? Le bracket et les résultats seront effacés.`)) return;
  t.schedule = null;
  t.status = 'setup';
  t.championId = null;
  for (const team of t.teams) {
    team.stats = { matches: 0, wins: 0, losses: 0, draws: 0, points: 0, scoreFor: 0, scoreAgainst: 0 };
    for (const p of team.players) p.stats = { matches: 0, wins: 0, losses: 0, score: 0, mvp: 0 };
  }
  saveState();
  toast('Tournoi réinitialisé.');
  renderTournamentDetail();
}

/* --- Classement (round robin / suisse) : victoire 3 pts, nul 1 pt --- */
function computeStandings(t) {
  const rows = new Map(t.teams.map(team => [team.id, { team, played: 0, w: 0, d: 0, l: 0, pts: 0, sf: 0, sa: 0 }]));
  for (const m of allMatches(t)) {
    if (m.status !== 'done') continue;
    if (m.a.teamId === BYE || m.b.teamId === BYE) {
      const wRow = rows.get(m.winnerId);
      if (wRow) { wRow.played++; wRow.w++; wRow.pts += 3; } // exempt = victoire
      continue;
    }
    const a = rows.get(m.a.teamId), b = rows.get(m.b.teamId);
    if (!a || !b) continue;
    a.played++; b.played++;
    a.sf += m.scoreA ?? 0; a.sa += m.scoreB ?? 0;
    b.sf += m.scoreB ?? 0; b.sa += m.scoreA ?? 0;
    if (m.winnerId === m.a.teamId) { a.w++; a.pts += 3; b.l++; }
    else if (m.winnerId === m.b.teamId) { b.w++; b.pts += 3; a.l++; }
    else { a.d++; b.d++; a.pts++; b.pts++; }
  }
  return [...rows.values()].sort((x, y) =>
    y.pts - x.pts || (y.sf - y.sa) - (x.sf - x.sa) || x.team.name.localeCompare(y.team.name));
}

/* ===== Rendu : détail d'un tournoi ===== */

let detailTab = 'matches';

function openTournament(id) {
  currentTournamentId = id;
  detailTab = 'matches';
  renderTournamentDetail();
  showView('detail');
}

function teamById(t, id) { return t.teams.find(x => x.id === id) || null; }

function roundName(r, total) {
  if (r === total) return '🏆 Finale';
  if (r === total - 1) return 'Demi-finales';
  if (r === total - 2) return 'Quarts de finale';
  return `Ronde ${r}`;
}

function slotLabel(t, slot) {
  if (slot.teamId === BYE) return '<em class="tbd">Exempt</em>';
  if (slot.teamId) {
    const team = teamById(t, slot.teamId);
    return team ? esc(team.name) : '?';
  }
  return '<span class="tbd">À déterminer</span>';
}

function matchRowHtml(t, m, key) {
  const slot = m[key];
  const score = key === 'a' ? m.scoreA : m.scoreB;
  const isWin = m.winnerId !== null && slot.teamId !== null && m.winnerId === slot.teamId;
  const scoreTxt = score !== null ? score : (isWin ? '✓' : '–');
  return `<div class="mrow ${isWin ? 'win' : ''}">
    <span class="mteam">${slotLabel(t, slot)}</span>
    <span class="mscore">${scoreTxt}</span>
  </div>`;
}

function matchCard(t, m, interactive) {
  const cls = [m.status === 'done' ? 'done' : '', (m.a.teamId === BYE || m.b.teamId === BYE) ? 'bye' : ''].join(' ');
  const ready = interactive && m.status === 'pending' &&
    m.a.teamId && m.b.teamId && m.a.teamId !== BYE && m.b.teamId !== BYE;
  return `<div class="match ${cls}">
    <div class="match-rows">${matchRowHtml(t, m, 'a')}${matchRowHtml(t, m, 'b')}</div>
    ${ready ? `<button class="play-btn" data-mid="${m.id}" title="Simuler ce match">▶</button>` : ''}
  </div>`;
}

function renderElimBracket(t, rounds, namer, interactive) {
  return `<div class="bracket">
    ${rounds.map((rd, i) => `
      <div class="bracket-round">
        <div class="round-title">${namer(i + 1, rounds.length)}</div>
        ${rd.map(m => matchCard(t, m, interactive)).join('')}
      </div>`).join('')}
  </div>`;
}

function renderSchedule(t) {
  const s = t.schedule;
  if (!s) return '<p>Aucun calendrier généré.</p>';
  const interactive = t.status === 'ongoing';

  const simBar = interactive ? `
    <div class="sim-bar">
      <button class="btn btn-sm" id="sim-one">🎲 Simuler 1 match</button>
      <button class="btn btn-sm" id="sim-round">⏭️ Simuler la ronde</button>
      <button class="btn btn-primary btn-sm" id="sim-all">⏩ Simuler tout le tournoi</button>
      <span class="sim-hint">ou cliquez sur ▶ sur un match</span>
    </div>` : '';

  if (s.type === 'single_elim') {
    return simBar + renderElimBracket(t, s.rounds, roundName, interactive);
  }

  if (s.type === 'double_elim') {
    return `
      ${simBar}
      <h3 class="section-title">⚔️ Winner bracket</h3>
      ${renderElimBracket(t, s.wb, (r, tot) => roundName(r, tot).replace('🏆 Finale', 'Finale WB'), interactive)}
      ${s.lb.length ? `
        <h3 class="section-title">💀 Loser bracket</h3>
        ${renderElimBracket(t, s.lb, (r) => `Ronde ${r}`, interactive)}` : ''}
      <h3 class="section-title">🏆 Grande finale</h3>
      ${renderElimBracket(t, [[s.gf]], () => 'Vainqueur WB vs vainqueur LB', interactive)}`;
  }

  // Round robin / suisse : blocs de rondes
  const blocks = s.rounds.map((rd, i) => `
    <div class="round-block">
      <div class="round-title">Ronde ${i + 1}</div>
      <div class="round-matches">${rd.map(m => matchCard(t, m, interactive)).join('')}</div>
    </div>`);

  if (s.type === 'swiss') {
    for (let r = s.rounds.length + 1; r <= s.totalRounds; r++) {
      blocks.push(`
        <div class="round-block future">
          <div class="round-title">Ronde ${r}</div>
          <p class="tbd">Les appariements seront générés d'après les résultats des rondes précédentes.</p>
        </div>`);
    }
  }
  return simBar + blocks.join('');
}

/* --- Podium & statistiques --- */

function renderPodium(t) {
  const champion = teamById(t, t.championId);
  if (!champion) return '';
  const s = t.schedule;
  let second = null;
  if (s.type === 'single_elim') second = teamById(t, s.rounds[s.rounds.length - 1][0].loserId);
  else if (s.type === 'double_elim') second = teamById(t, s.gf.loserId);
  else second = computeStandings(t)[1]?.team ?? null;
  return `
    <div class="podium">
      <span class="podium-champ">🏆 <strong>${esc(champion.name)}</strong> remporte le tournoi !</span>
      ${second ? `<span class="podium-second">🥈 ${esc(second.name)}</span>` : ''}
    </div>`;
}

function renderStatsTab(t) {
  const teams = [...t.teams].sort((a, b) =>
    b.stats.points - a.stats.points ||
    (b.stats.scoreFor - b.stats.scoreAgainst) - (a.stats.scoreFor - a.stats.scoreAgainst));
  const players = t.teams
    .flatMap(team => team.players.map(p => ({ p, team })))
    .sort((x, y) => y.p.stats.mvp - x.p.stats.mvp || y.p.stats.score - x.p.stats.score || y.p.stats.wins - x.p.stats.wins);

  return `
    <h3 class="section-title">📊 Statistiques des équipes</h3>
    <div class="table-wrap">
      <table class="standings">
        <thead><tr><th>#</th><th>Équipe</th><th>M</th><th>V</th><th>N</th><th>D</th><th>Score +/−</th><th>Pts</th><th>Rating</th></tr></thead>
        <tbody>${teams.map((team, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><span class="tag">${esc(team.tag)}</span> ${esc(team.name)}</td>
            <td>${team.stats.matches}</td><td>${team.stats.wins}</td><td>${team.stats.draws}</td><td>${team.stats.losses}</td>
            <td>${team.stats.scoreFor}−${team.stats.scoreAgainst}</td>
            <td><strong>${team.stats.points}</strong></td>
            <td>${team.rating}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <h3 class="section-title">⭐ Statistiques des joueurs</h3>
    <div class="table-wrap">
      <table class="standings">
        <thead><tr><th>#</th><th>Joueur</th><th>Équipe</th><th>Rôle</th><th>M</th><th>V</th><th>D</th><th>Score</th><th>MVP</th></tr></thead>
        <tbody>${players.map(({ p, team }, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${esc(p.name)}</td>
            <td><span class="tag">${esc(team.tag)}</span></td>
            <td>${esc(p.role || '—')}</td>
            <td>${p.stats.matches}</td><td>${p.stats.wins}</td><td>${p.stats.losses}</td>
            <td>${p.stats.score}</td>
            <td>${p.stats.mvp ? '⭐ ' + p.stats.mvp : '0'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="hint-dim">Score = buts/points marqués (sports) ou indice de performance (esports, best-of).
      Le rating Elo évolue à chaque match simulé.</p>`;
}

function renderStandings(t) {
  const rows = computeStandings(t);
  return `
    <div class="table-wrap">
      <table class="standings">
        <thead><tr><th>#</th><th>Équipe</th><th>J</th><th>V</th><th>N</th><th>D</th><th>+/−</th><th>Pts</th></tr></thead>
        <tbody>${rows.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><span class="tag">${esc(r.team.tag)}</span> ${esc(r.team.name)}</td>
            <td>${r.played}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
            <td>${r.sf - r.sa > 0 ? '+' : ''}${r.sf - r.sa}</td>
            <td><strong>${r.pts}</strong></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderTeamsSection(t) {
  return `
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
    </div>`;
}

function renderTournamentDetail() {
  const t = state.tournaments.find(t => t.id === currentTournamentId);
  const box = $('#detail-content');
  if (!t) { box.innerHTML = '<p>Tournoi introuvable.</p>'; return; }

  const isSetup = t.status === 'setup';
  const hasStandings = t.format === 'round_robin' || t.format === 'swiss';

  let body;
  if (isSetup) {
    body = `
      <div class="notice">
        🎯 Le tournoi est prêt : cliquez sur <strong>Démarrer</strong> pour générer
        ${hasStandings ? 'le calendrier des rondes' : 'le bracket'}.
      </div>
      ${renderTeamsSection(t)}`;
  } else {
    const tabs = [
      { id: 'matches', label: hasStandings ? '📅 Rondes' : '🗡️ Bracket' },
      ...(hasStandings ? [{ id: 'standings', label: '📊 Classement' }] : []),
      { id: 'stats', label: '⭐ Stats' },
      { id: 'teams', label: '👥 Équipes' },
    ];
    if (!tabs.some(x => x.id === detailTab)) detailTab = 'matches';
    const content = detailTab === 'matches' ? renderSchedule(t)
      : detailTab === 'standings' ? renderStandings(t)
      : detailTab === 'stats' ? renderStatsTab(t)
      : renderTeamsSection(t);
    body = `
      ${t.status === 'finished' ? renderPodium(t) : ''}
      <div class="tabs">
        ${tabs.map(x => `<button class="tab-btn ${x.id === detailTab ? 'active' : ''}" data-tab="${x.id}">${x.label}</button>`).join('')}
      </div>
      ${content}`;
  }

  box.innerHTML = `
    <div class="detail-header">
      <button class="back" id="btn-back">← Retour aux tournois</button>
      <div class="title-row">
        <h1>${esc(t.name)}</h1>
        ${statusBadge(t.status)}
        <div class="actions">
          ${isSetup
            ? '<button class="btn btn-primary btn-sm" id="btn-start">🚀 Démarrer le tournoi</button>'
            : '<button class="btn btn-sm" id="btn-reset">↩️ Réinitialiser</button>'}
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
    ${body}
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
  const startBtn = $('#btn-start');
  if (startBtn) startBtn.addEventListener('click', () => startTournament(t));
  const resetBtn = $('#btn-reset');
  if (resetBtn) resetBtn.addEventListener('click', () => resetTournament(t));
  $$('.tab-btn').forEach(b => b.addEventListener('click', () => {
    detailTab = b.dataset.tab;
    renderTournamentDetail();
  }));

  // Simulation
  const simOneBtn = $('#sim-one');
  if (simOneBtn) simOneBtn.addEventListener('click', () => simOne(t));
  const simRoundBtn = $('#sim-round');
  if (simRoundBtn) simRoundBtn.addEventListener('click', () => simRound(t));
  const simAllBtn = $('#sim-all');
  if (simAllBtn) simAllBtn.addEventListener('click', () => simAll(t));
  $$('.play-btn').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    simMatchById(t, b.dataset.mid);
  }));
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
