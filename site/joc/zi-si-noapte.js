// Zi și Noapte — datele și logica pură a jocului (fără DOM), testabile în Node (v1, 24.09.2026).
// Pagina: site-live/joc/zi-si-noapte.html · Testul: games/teste/zi-si-noapte.test.mjs
// Bancul de puzzle-uri (mai jos, între marcaje) e scris de fabrica/generatoare/zi-si-noapte.mjs.
//
// ─── REGULILE ────────────────────────────────────────────────────────────────────────
// Grilă 6 × 6. Fiecare căsuță primește un soare sau o lună.
//   • pe fiecare rând și pe fiecare coloană: 3 sori și 3 luni;
//   • cel mult doi la fel unul lângă altul (pe orizontală sau pe verticală);
//   • „=" între două căsuțe vecine: același simbol; „×": simboluri diferite.
// Două rânduri (sau coloane) identice SUNT permise.
//
// ─── FORMATUL UNUI PUZZLE DIN BANC ──────────────────────────────────────────────────
// În fișier, fiecare puzzle e un singur șir, câmpuri separate prin spațiu (compact: fișierul
// se servește necomprimat): "id nivel blocaje sol fixe semne…". La încărcare devine obiectul
// { id, nivel, blocaje, sol, fixe, semne }:
//   id      — 8 caractere hex (FNV-1a din conținut); intră în cheia de salvare a zilei
//   nivel   — 1 (luni, cel mai ușor) … 7 (duminică, cel mai greu)
//   blocaje — de câte ori rezolvitorul logic rămâne blocat pe regulile simple și are nevoie
//             de „privirea pe linie" (regula d); 0 = ajung regulile a–c
//   sol     — soluția: 36 de caractere, rând cu rând; S = soare, L = lună
//   fixe    — căsuțele date de la început: 36 de caractere; "." = liberă, S / L = fixă
//   semne   — semnele dintre căsuțe vecine, separate prin spațiu: "4=5" = căsuțele 4 și 5
//             au același simbol; "11x17" = simboluri diferite. Căsuța i = rând · 6 + coloană
//             (de la 0); perechea e mereu (i, i + 1) pe același rând sau (i, i + 6).

export const SLUG = "zi-si-noapte";
export const NUME = "Zi și Noapte";
export const N = 6;                 // latura grilei
export const CELULE = N * N;        // 36
export const GOL = 0, SOARE = 1, LUNA = 2;
const CARACTER = [".", "S", "L"];

/** Simbolul opus: soare ↔ lună. */
export const opus = (v) => 3 - v;

/** Cele 12 linii ca liste de indici de căsuță: rândurile 0–5, apoi coloanele 0–5 (k = 6 + c). */
export const LINII = (() => {
  const out = [];
  for (let r = 0; r < N; r++) out.push(Array.from({ length: N }, (_, c) => r * N + c));
  for (let c = 0; c < N; c++) out.push(Array.from({ length: N }, (_, r) => r * N + c));
  return out;
})();

/** Cele 14 linii complete valide (3 sori + 3 luni, fără trei la rând), ca array-uri de 1/2. */
export const TIPARE = (() => {
  const out = [];
  for (let m = 0; m < 64; m++) {
    const v = Array.from({ length: N }, (_, k) => ((m >> (N - 1 - k)) & 1 ? LUNA : SOARE));
    if (v.filter((x) => x === SOARE).length !== N / 2) continue;
    let trei = false;
    for (let k = 0; k + 2 < N; k++) if (v[k] === v[k + 1] && v[k] === v[k + 2]) trei = true;
    if (!trei) out.push(v);
  }
  return out;
})();

// ─── Conversii ────────────────────────────────────────────────────────────────────

/** "S.L…" (36 caractere: . S L) → [0, 1, 2, …]; orice altceva → null. */
export function tablaDin(sir) {
  if (typeof sir !== "string" || sir.length !== CELULE) return null;
  const t = new Array(CELULE);
  for (let i = 0; i < CELULE; i++) {
    const v = CARACTER.indexOf(sir[i]);
    if (v < 0) return null;
    t[i] = v;
  }
  return t;
}

/** [0, 1, 2, …] → "S.L…". */
export function sirDin(t) {
  return t.map((v) => CARACTER[v]).join("");
}

/** "4=5 11x17" → [{ a: 4, b: 5, egal: true }, { a: 11, b: 17, egal: false }]. Aruncă pe jetoane greșite. */
export function semneDin(sir) {
  const out = [];
  for (const jeton of String(sir ?? "").trim().split(/\s+/)) {
    if (!jeton) continue;
    const r = /^(\d+)([=x])(\d+)$/.exec(jeton);
    const a = r ? Number(r[1]) : -1, b = r ? Number(r[3]) : -1;
    const vecini = (b === a + 1 && a % N !== N - 1) || b === a + N;
    if (!r || a < 0 || b >= CELULE || !vecini) throw new Error("Semn invalid: „" + jeton + "”");
    out.push({ a, b, egal: r[2] === "=" });
  }
  return out;
}

/** Rândul și coloana unei căsuțe (de la 0). */
export const randul = (i) => Math.floor(i / N);
export const coloana = (i) => i % N;

// ─── Puzzle pregătit pentru calcule ───────────────────────────────────────────────

const CACHE = new WeakMap();

/**
 * Puzzle-ul din banc → { id, nivel, blocaje, sol, fixe, semne, semneLinie }, cu sol/fixe ca
 * array-uri de 0/1/2. semneLinie[k] = semnele cu ambele căsuțe pe linia k, ca poziții în linie.
 * Rezultatul e memorat per obiect; aruncă dacă puzzle-ul e malformat.
 */
export function pregateste(p) {
  if (p && CACHE.has(p)) return CACHE.get(p);
  const sol = tablaDin(p && p.sol), fixe = tablaDin(p && p.fixe);
  if (!sol || !fixe) throw new Error("Puzzle malformat: " + (p && p.id));
  const semne = semneDin(p.semne);
  const semneLinie = LINII.map(() => []);
  for (const m of semne) {
    if (m.b === m.a + 1) semneLinie[randul(m.a)].push({ pa: coloana(m.a), pb: coloana(m.b), egal: m.egal });
    else semneLinie[N + coloana(m.a)].push({ pa: randul(m.a), pb: randul(m.b), egal: m.egal });
  }
  const pz = { id: p.id, nivel: p.nivel, blocaje: p.blocaje, sol, fixe, semne, semneLinie };
  CACHE.set(p, pz);
  return pz;
}

// ─── Verificarea regulilor ────────────────────────────────────────────────────────

const plina = (t) => t.every((v) => v === SOARE || v === LUNA);

/**
 * Toate încălcările de reguli de pe o tablă (plină sau nu):
 *   triple — Set cu căsuțele din orice șir de 3+ identice pe rând sau coloană
 *   linii  — [{ k, simbol, numar }] liniile cu mai mult de 3 din același simbol
 *   semne  — indicii (în pz.semne) semnelor încălcate, cu ambele căsuțe completate
 *   fixe   — căsuțele fixe cu altă valoare decât cea dată
 * castig = tabla e plină și nu încalcă nimic. Tabla plină fără nicio linie cu 4+ are automat
 * exact 3 + 3 pe fiecare linie.
 */
export function analizeaza(pz, t) {
  const triple = new Set();
  const linii = [];
  for (let k = 0; k < LINII.length; k++) {
    const L = LINII[k];
    let s = 0, l = 0;
    for (const i of L) { if (t[i] === SOARE) s++; else if (t[i] === LUNA) l++; }
    if (s > N / 2) linii.push({ k, simbol: SOARE, numar: s });
    if (l > N / 2) linii.push({ k, simbol: LUNA, numar: l });
    for (let p = 0; p + 2 < N; p++) {
      const v = t[L[p]];
      if (v && t[L[p + 1]] === v && t[L[p + 2]] === v) {
        triple.add(L[p]); triple.add(L[p + 1]); triple.add(L[p + 2]);
      }
    }
  }
  const semne = [];
  pz.semne.forEach((m, j) => {
    const x = t[m.a], y = t[m.b];
    if (x && y && (x === y) !== m.egal) semne.push(j);
  });
  const fixe = [];
  for (let i = 0; i < CELULE; i++) if (pz.fixe[i] && t[i] !== pz.fixe[i]) fixe.push(i);
  const complet = plina(t);
  const erori = triple.size + linii.length + semne.length + fixe.length;
  return { triple, linii, semne, fixe, plina: complet, erori, castig: complet && erori === 0 };
}

/** Verificatorul de câștig: tabla (36 de valori) respectă toate regulile și e plină. */
export function eCastig(pz, t) {
  if (!Array.isArray(t) || t.length !== CELULE) return false;
  return analizeaza(pz, t).castig;
}

// ─── Rezolvitorul logic „ca un om" ────────────────────────────────────────────────
// Regulile simple (fiecare deducție e sigură):
//   a) fără trei: două identice alăturate → căsuțele de la ambele capete sunt opusul;
//      X _ X → mijlocul e opusul;
//   b) echilibru: o linie cu 3 dintr-un simbol → restul sunt opusul;
//   c) semne: „=" / „×" cu un vecin cunoscut hotărăște cealaltă căsuță.
// Regula grea:
//   d) privirea pe linie: toate completările valide ale unei linii, compatibile cu ce e pe ea
//      și cu semnele dintre căsuțele ei; căsuțele identice în toate completările sunt sigure.

/** Deducțiile simple (a–c) disponibile acum, în ordinea a, b, c. */
export function deductiiSimple(pz, t) {
  const out = [];
  for (let k = 0; k < LINII.length; k++) {
    const L = LINII[k];
    for (let p = 0; p + 1 < N; p++) {
      const v = t[L[p]];
      if (!v) continue;
      if (t[L[p + 1]] === v) {
        if (p > 0 && !t[L[p - 1]]) out.push({ i: L[p - 1], v: opus(v), regula: "pereche", k, simbol: v });
        if (p + 2 < N && !t[L[p + 2]]) out.push({ i: L[p + 2], v: opus(v), regula: "pereche", k, simbol: v });
      }
      if (p + 2 < N && !t[L[p + 1]] && t[L[p + 2]] === v) {
        out.push({ i: L[p + 1], v: opus(v), regula: "intre", k, simbol: v });
      }
    }
  }
  for (let k = 0; k < LINII.length; k++) {
    const L = LINII[k];
    let s = 0, l = 0;
    for (const i of L) { if (t[i] === SOARE) s++; else if (t[i] === LUNA) l++; }
    if (s + l === N) continue;
    if (s === N / 2 && l < N / 2) for (const i of L) if (!t[i]) out.push({ i, v: LUNA, regula: "echilibru", k, simbol: SOARE });
    if (l === N / 2 && s < N / 2) for (const i of L) if (!t[i]) out.push({ i, v: SOARE, regula: "echilibru", k, simbol: LUNA });
  }
  for (const m of pz.semne) {
    const x = t[m.a], y = t[m.b];
    if (x && !y) out.push({ i: m.b, v: m.egal ? x : opus(x), regula: "semn", egal: m.egal, vecin: m.a });
    else if (y && !x) out.push({ i: m.a, v: m.egal ? y : opus(y), regula: "semn", egal: m.egal, vecin: m.b });
  }
  return out;
}

/** Completările valide ale liniei k, compatibile cu tabla t și cu semnele din linie. */
export function completariLinie(pz, t, k) {
  const L = LINII[k];
  const semne = pz.semneLinie[k];
  return TIPARE.filter((tip) => {
    for (let p = 0; p < N; p++) if (t[L[p]] && t[L[p]] !== tip[p]) return false;
    for (const m of semne) if ((tip[m.pa] === tip[m.pb]) !== m.egal) return false;
    return true;
  });
}

/**
 * Deducțiile prin privirea pe linie (regula d), pe toate liniile. Fiecare: { i, v, regula,
 * k, variante, goale }. conflict = true dacă o linie nu mai are nicio completare validă.
 */
export function deductiiPrivire(pz, t) {
  const out = [];
  let conflict = false;
  for (let k = 0; k < LINII.length; k++) {
    const L = LINII[k];
    const goale = L.filter((i) => !t[i]).length;
    if (!goale) continue;
    const variante = completariLinie(pz, t, k);
    if (!variante.length) { conflict = true; continue; }
    for (let p = 0; p < N; p++) {
      if (t[L[p]]) continue;
      const v = variante[0][p];
      if (variante.every((tip) => tip[p] === v)) out.push({ i: L[p], v, regula: "privire", k, variante: variante.length, goale });
    }
  }
  out.conflict = conflict;
  return out;
}

/**
 * Rezolvă cum ar face un om, fără ghicit. În fiecare rundă aplică TOATE deducțiile simple
 * disponibile; doar când acestea se termină (un „blocaj") aplică privirea pe linie, pe toate
 * liniile deodată, apoi revine la regulile simple.
 *   → { rezolvat, tabla, blocaje, runde, conflict }
 * blocaje = de câte ori a fost nevoie de regula d (0 = ajung regulile a–c).
 * Cu privire: false se oprește la primul blocaj (rezolvitorul „doar a–c").
 */
export function rezolvaLogic(pz, { privire = true, tabla = null } = {}) {
  const t = (tabla || pz.fixe).slice();
  let blocaje = 0, runde = 0, conflict = false;
  const aplica = (lista) => {
    const puse = new Map();
    for (const x of lista) {
      if (puse.has(x.i) && puse.get(x.i) !== x.v) conflict = true;
      puse.set(x.i, x.v);
    }
    for (const [i, v] of puse) t[i] = v;
  };
  while (!conflict) {
    const simple = deductiiSimple(pz, t);
    if (simple.length) { aplica(simple); runde++; continue; }
    if (plina(t) || !privire) break;
    const privite = deductiiPrivire(pz, t);
    if (privite.conflict) { conflict = true; break; }
    if (!privite.length) break;
    aplica(privite);
    blocaje++;
  }
  const rezolvat = !conflict && plina(t) && analizeaza(pz, t).erori === 0;
  return { rezolvat, tabla: t, blocaje, runde, conflict };
}

/**
 * Următorul pas logic de pe o tablă fără greșeli (doar valori din soluție) — pentru Indiciu.
 * Întâi o deducție simplă (a, apoi b, apoi c); dacă nu există, privirea pe linie, pe linia cu
 * cele mai puține variante. null dacă nu se poate deduce nimic (nu se întâmplă pe un puzzle
 * din banc, fiindcă regulile sunt monotone: mai multe căsuțe corecte nu strică nicio deducție).
 */
export function pasulUrmator(pz, t) {
  const simple = deductiiSimple(pz, t);
  if (simple.length) return simple[0];
  const privite = deductiiPrivire(pz, t);
  if (!privite.length) return null;
  return privite.reduce((cel, x) => (x.variante < cel.variante || (x.variante === cel.variante && x.goale < cel.goale) ? x : cel));
}

// ─── Nivelul pe zile: luni cel mai ușor → duminică cel mai greu ────────────────────

/** Zilele săptămânii în ordinea Date.getUTCDay() (0 = duminică). */
export const ZILE = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];

/** Nivelul (1–7) pentru fiecare getUTCDay(): luni 1 … duminică 7. */
export const NIVEL_PE_ZI = [7, 1, 2, 3, 4, 5, 6];

/** Eticheta de dificultate a fiecărui nivel. */
export const ETICHETE = ["", "ușor", "ușor", "mediu", "mediu", "greu", "greu", "foarte greu"];

/** Ziua săptămânii (în ordinea ZILE) căreia îi e destinat un nivel. */
export const ziuaNivelului = (nivel) => NIVEL_PE_ZI.indexOf(nivel);

// ─── Puzzle-ul zilei ──────────────────────────────────────────────────────────────

/** Prima zi de joc (YYYYMMDD, ora României) — o vineri. */
export const START = 20260925;

/** YYYYMMDD → milisecunde UTC (miezul nopții), ca să numărăm zile reale din calendar. */
function msUTC(zi) {
  return Date.UTC(Math.floor(zi / 10000), Math.floor((zi % 10000) / 100) - 1, zi % 100);
}

/** Ziua săptămânii (0 = duminică) pentru YYYYMMDD. */
export function ziSaptamana(zi) {
  return new Date(msUTC(zi)).getUTCDay();
}

/** Zile întregi de la START până la `zi` (YYYYMMDD); zilele de dinainte (și seed-urile invalide) → 0. */
export function zileDeLaStart(zi) {
  const d = Math.round((msUTC(zi) - msUTC(START)) / 86400000);
  return d > 0 ? d : 0;
}

/**
 * Puzzle-ul zilei `zi` (YYYYMMDD): { index, editie, puzzle }. index = zile de la START,
 * puzzle = BANC[index % BANC.length], ediția afișată = index + 1. Bancul are 364 de puzzle-uri
 * (multiplu de 7), deci și la reluare poziția i cade tot în ziua săptămânii pentru care a fost făcută.
 */
export function puzzleulZilei(zi) {
  const index = zileDeLaStart(zi);
  return { index, editie: index + 1, puzzle: BANC[index % BANC.length] };
}

// ─── BANCUL ───────────────────────────────────────────────────────────────────────
// Tot ce e între cele două marcaje de mai jos e rescris de fabrica/generatoare/zi-si-noapte.mjs.
// Nu edita de mână: rulează generatorul (node fabrica/generatoare/zi-si-noapte.mjs).
// @banc:inceput
// Generat de fabrica/generatoare/zi-si-noapte.mjs · sămânța 20260925 · 364 de puzzle-uri.
// Poziția i = ziua START + i. Pe niveluri (medii, cu min–max):
//   1 Luni      52 de puzzle-uri · ușor        · fixe 7.1 (7–8) · semne 6.5 (6–9) · blocaje 0.0 (0–0) · runde 9.4
//   2 Marți     52 de puzzle-uri · ușor        · fixe 5.4 (5–6) · semne 6.3 (5–8) · blocaje 0.0 (0–0) · runde 13.9
//   3 Miercuri  52 de puzzle-uri · mediu       · fixe 4.6 (4–6) · semne 5.5 (5–6) · blocaje 1.0 (1–1) · runde 10.6
//   4 Joi       52 de puzzle-uri · mediu       · fixe 4.3 (4–5) · semne 5.1 (4–6) · blocaje 2.0 (2–2) · runde 10.7
//   5 Vineri    52 de puzzle-uri · greu        · fixe 4.0 (4–4) · semne 5.3 (4–6) · blocaje 3.0 (3–3) · runde 10.9
//   6 Sâmbătă   52 de puzzle-uri · greu        · fixe 4.0 (4–4) · semne 4.7 (4–5) · blocaje 4.0 (4–4) · runde 10.9
//   7 Duminică  52 de puzzle-uri · foarte greu · fixe 3.6 (3–4) · semne 4.7 (4–5) · blocaje 5.3 (5–7) · runde 11.0
// Format: "id nivel blocaje sol fixe semne…" (vezi FORMATUL UNUI PUZZLE, sus).
const BANC_BRUT = [
  "56e33115 5 3 LLSLSSSLSSLLLSLSSLLSLLSSSLSLLSSSLSLL ...L..S..................L....S..... 20=21 25x26 25x31 27=28",
  "def857da 6 4 LSSLLSLSLSSLSLSSLLLLSLSSSSLLSLSLLSLS ....LS........................S...L. 10x16 11=17 13=19 18x24",
  "ac9c55b8 7 5 LLSLSSSLSSLLLSLSSLSLSLLSSSLSLLLSLLSS .....S..........SL.L................ 1=7 8=9 20x21 22=28 23x29",
  "73c99be3 1 0 LSSLLSSLSLLSLSLSSLSLSLLSSLLSSLLSLSSL .S.L............S.S..L..S.......L... 3=4 5=11 9=10 20x26 21=22 24x25",
  "acc93192 2 0 LLSLSSLLSSLSSSLSLLLSSLSLSLLSLSSSLLSL ....S...S............L......L.....S. 2x3 4=5 6=7 7x8 12x18 15x21 22x23",
  "a26d58f4 3 1 SLLSSLSSLSLLLLSLSSLSLSSLSLSLLSLSSLLS .......S...........S.S............L. 3=4 3=9 6=7 16=22 25x31",
  "90e08dca 4 2 LSSLSLLSSLLSSLLSLSSSLLSLLLSSLSSLLSSL .........LL.S.....S................. 3=9 5x11 15x16 24=25 31=32",
  "f375cd2f 5 3 LSSLSLSSLSLLLLSSLSSLSLSLLSLLSSSLLSLS ......S...L....S..........L......... 1=2 7x8 14=20 17x23",
  "5b3c8698 6 4 LLSSLSSLLSSLSSLLSLLLSSLSLSSLLSSSLLSL .....S.....L......L...........S..... 0=1 2x8 7=8 13x19 22=28",
  "ffaf303d 7 5 LSSLLSSLSSLLSLLSSLLSLLSSLSSLLSSLLSSL ......S..........L.......S......L... 4=10 7=13 21x22 23=29",
  "d3fd7007 1 0 SLSSLLLSSLSLLSLSLSSLLSLSSLSLSLLSLLSS ..S...L.........L.......S..L......SS 11x17 13x14 16x17 19=25 21x22 26x27",
  "d7d33682 2 0 LSSLSLSLLSSLLSLSLSLSSLSLSLLSLSSLSLLS L....L.....L............S....S.L.... 1x7 8=14 14x15 15x21 21x27 27x28 28x29 30x31",
  "8dfad109 3 1 SLSLLSLLSSLSSSLLSLLSLSSLSLSLLSLSLSSL .L....L.S.........L....L............ 1x2 7x8 16x17 19x20 28x34 32x33",
  "3e0cdbf9 4 2 LSLLSSLSSLSLSLLSLSSLSSLLLSSLSLSLLSLS ..L........L..................S..S.. 13=19 21x27 22=23 24x25 24x30 34x35",
  "162f10df 5 3 LSSLSLSLSSLLSLLSLSLSSLSLLSLLSSSLLSLS ......S...........L.......LL........ 1=2 10=16 12x18 17x23 32x33",
  "0b5adfc9 6 4 SSLSLLSLSLSLLSSLLSLSLSSLSLLSLSLLSLSS .........L........L.......L..S...... 1x7 4x10 8=14 30=31",
  "0fc7c7a0 7 6 LSSLLSLLSLSSSLLSSLLSLSLSSLSLSLSSLSLL ........................S.S....S.... 2=8 3=4 26x27 34=35",
  "83f526df 1 0 SLLSLSLSSLSLLSLSSLSLLSLSSLSLLSLSSLSL ......L..L..L..S...L...S.....S....S. 4x5 9x10 13x19 25x26 26=32 27=28",
  "de2baa67 2 0 SLSLSLLSSLSLLSLSLSSLLSLSLSSLSLSLLSLS S....L..............L.L.......S..... 2=8 8x9 15x16 16=22 19x25 25=26",
  "9e68817a 3 1 SLLSLSSLSSLLLSSLSLSLLSLSLSLLSSLSSLSL .L...S.....L..S..................... 1=7 3=9 9x10 13x19 20=26",
  "1605f50c 4 2 SSLSLLSLLSLSLLSLSSSSLSLLLLSLSSLSSLSL .........S...........S...L....L..... 4=10 10x11 12x18 13x19 19x20 24=30",
  "51d7fc43 5 3 SLSSLLSLSSLLLSLLSSSLLSLSLSSLSLLSLLSS ...................LL........L.....S 3=9 14=15 17=23 25=31 32=33",
  "f0d1c337 6 4 LSSLLSLLSSLSSSLLSLSLLSSLLSSLLSSLLSSL ........................L...L..L...L 1=2 8=9 10x11 16=22 19=20",
  "2528dea3 7 6 LLSLSSSLLSSLLSLSLSSLSLSLLSSLLSSSLSLL ...L.........S....S...S............. 4=5 10x16 15x16 19x20 25=26",
  "f17d0533 1 0 LSLSLSSLSSLLLSLLSSLSLSLSSLSLSLSLSLSL L..........L.S..S..SL..S............ 3=9 5x11 8=9 11x17 22x23 32x33",
  "eede076d 2 0 SSLLSLSLSSLLLLSLSSLSLSLSSLLSSLLSSLLS .........S..L.S.S......S............ 2=3 6x12 11x17 15x21 20=26 21=27 27=28",
  "bc4f1494 3 1 LSLLSSSSLSLLSLSLSLLLSSLSSSLLSLLLSSLS ..........LL.L........L.....S......S 0x1 3x9 12x13 13x14 20x26 24=25",
  "e941d321 4 2 LSLLSSLSLLSSSLSSLLLLSSLSSSLLSLSLSSLL ....S.L..L....S..................... 2=8 5=11 15=21 24=30 26x32",
  "1ff80402 5 3 SSLSLLLSLLSSSLSLSLSLLSLSLSSLSLLLSSLS .......S.............S........LL.... 5x11 7x13 9=15 19=20 21x27 23x29",
  "d05bb34a 6 4 LSLSLSLLSSLSSLSLSLLSLSSLSLSLLSSSLLSL ..L..SL.....S....................... 4x5 8=9 26x27 28x34 30=31",
  "474adec4 7 6 LSLLSSSLSSLLLSLSLSLSSLSLSLLSSLSLSLLS ..........L...........S......L...... 10=11 14x15 19=20 24=30 33=34",
  "1345ecb9 1 0 LSLSLSSLSLSLSLSLSLLSLSLSLSLLSSSLSSLL L...L.......S..L.......S........SS.. 0x6 8x9 9x10 14x20 18=24 20x21 27x33",
  "5878ccee 2 0 LSLSSLLLSSLSSLSLSLSSLSLLLSLLSSSLSLLS ....S........L.L...S.S.............. 17=23 18=19 22x28 24x25 32x33",
  "a1810642 3 1 LSSLLSSSLSLLSLSLSLLSLSLSLLSLSSSLLSSL ...L......LLSL...................... 4x5 7x13 8x14 14x20 22x23 23=29",
  "fc83aa38 4 2 SLSLLSSLSSLLLSLLSSSLSSLLLSLLSSLSLSSL ...............L..S.......L........L 0=6 1x2 2=8 9x15 26=27 33=34",
  "7dea512c 5 3 LSSLSLSLSLLSLSLSLSSLLSSLLSSLSLSLLSLS .S...L..................L.S......... 2=8 13x14 14=20 21=22 23=29",
  "32519c2a 6 4 SSLLSLLLSSLSSSLLSLLSSLSLLLSSLSSLLSLS ..................L.....L...L.....L. 6=7 7x13 15=21 17=23",
  "a1878623 7 5 LLSLSSLSSLLSSSLSLLSLSLSLLSLSLSSLLSSL ...........S...............S....LS.. 2x3 4=5 12=18 30x31",
  "c261a865 1 0 SLSLLSLSLSLSLSSLSLSLLSLSLSSLSLSLLSSL S.S..S...SL..S................S..... 1x7 9x15 16x22 20x21 27x33 33=34",
  "7151286a 2 0 SLSLSLLSSLSLSLLSLSLSLSLSSLSLSLLSLSLS S...S........L.......S....S......... 4=10 12x18 14=20 25x26 26x32 27x28",
  "a0243196 3 1 LSLSLSLLSSLSSSLLSLSLLSSLLSSLLSSLSLSL .S..L.......S......L................ 1x2 3=9 8=9 26=32 27=28 29x35",
  "5ee31b36 4 2 SLSLLSSSLLSLLSLSSLLLSSLSSLSLLSLSLSSL ..........S......LL..............S.. 1x7 12=18 23=29 25x31",
  "1fe1ac6e 5 3 LSLSSLLSLSSLSLSLLSSLLSSLLSSLLSSLSLLS ................L...L.......L.S..... 3=9 13=19 15x21 25x31 33=34",
  "538c658c 6 4 SLLSLSLSLSLSLSSLSLSLSLLSSLLSSLLSSLSL ....L..S..........S....S............ 9x10 14=20 18=24 21=22 31=32",
  "71580021 7 5 SSLLSLSLLSLSLSSLLSSLSLSLLSLSSLLLSSLS ..........L............LL..........S 0=1 0=6 7=8 15=21 27=28",
  "2025e101 1 0 SLSSLLLLSLSSSSLLSLLSLSLSSLSLSLLSLSLS ...S...L.......L..L.L..........S..L. 4=5 7x13 12x18 15x21 24x25 33x34",
  "4fc2deae 2 0 SLSLLSLLSSLSLSLSSLSLSLSLLSLSLSSSLLSL .L......S........L.L...L............ 3=4 4x5 7x8 20x21 26=32 29x35 30=31",
  "745e1f9e 3 1 SLSLSLSLLSLSLSSLSLLLSLSSSSLSLLLSLSLS ..S.....L.....................L...L. 4x10 12=18 14=20 16x17 28=34 29x35",
  "27cc5f26 4 2 SLSLSLLSLLSSLSLSLSSLSLSLSLSSLLLSLSLS ....S.........L..........L.S........ 4x5 4=10 8=9 19x20 23=29 30x31",
  "ed92496d 5 3 SLSLSLSLSLLSLSLSLSLSLSSLSLSLSLLSLSLS .....L........L................S.S.. 1=7 11=17 21=22 24x30 27x28",
  "06272ac2 6 4 SLSLSLSLLSLSLSSLLSSSLLSLLLSSLSLSLSSL .L...L.............S....L........... 9x10 13=19 31x32 33=34",
  "94d6fa78 7 5 SLLSSLLSLLSSLSSLLSSLLSSLLSSLLSSLSSLL .............S.......S.....LL....... 1=2 1x7 10=11 27x33 34=35",
  "11c6ed02 1 0 LSSLSLLSSLSLSLLSLSLSSLSLSLLSLSSLLSLS L...............L..S........LS...S.S 7=8 8x14 14x15 15x16 18x19 27x28",
  "1768d3ff 2 0 LLSSLSSLLSSLLSSLLSSLLSLSLSSLSLSSLLSL ..S....LL..............S..S........L 4x10 20x26 22x28 25=31 32=33",
  "d2fb2a5e 3 1 LSSLLSLSSLSLSLLSSLLSSLLSSLLSSLSLLSLS ..S...........L..L...........LS..... 3=4 4x10 7=8 13=14 25=31 27=28",
  "8c6a3b4c 4 2 LLSSLSSLSLLSLSLSSLSLLSLSLSSLSLSSLLSL L......L.......S......L............. 4x5 5=11 15=21 16x17 25=26 25=31",
  "5d0dfe5c 5 3 LSSLSLLSSLSLSLLSLSLSLSLSSLSLSLSLLSLS ...L.L.S.....................L...... 1=2 13x19 14=20 15x16 22x28 27x33",
  "9490ac8e 6 4 LLSLSSSLSLLSSSLSLLLSLLSSSLSSLLLSLSSL L..........S...S............L....... 1=7 13=19 24x30 28=29",
  "ce5e23f5 7 5 SSLSLLSLLSSLLSSLLSLLSSLSSSLLSLLLSLSS ....L.S...................L...L..... 1x7 5=11 9=10 16=22 24=25",
  "44294d6a 1 0 LSLSSLLSLLSSSLSSLLSSLSLLLLSLSSSLSLLS ......L..L...L....SS.S.........L.... 0x1 2=8 7x8 7x13 16=22 23x29 29=35",
  "959619ce 2 0 SLSSLLSSLLSLLSLLSSSLSSLLLLSSLSLSLLSS .L..L.........L..S....L............. 12x18 18x19 19=25 22=28 24=25 29=35",
  "885275e0 3 1 LSSLLSLLSSLSSSLLSLSLSSLLLSLLSSSLLSSL ..S...L.............S...L........... 1x7 2=8 8=9 22=23 33=34",
  "e6aed4f4 4 2 LSSLSLSLSLLSLSLSSLLSSLSLSLLSLSSLLSLS .......L.....................S..L..S 2=8 9=10 24=30 25=26 27x28",
  "5d1f374f 5 3 SLLSLSSLLSSLLSSLLSLSLLSSSLSSLLLSSLSL .........................L.S...S..S. 2=8 13=19 14x20 15=16 22=23",
  "d70e02ad 6 4 LSSLSLLLSSLSSLLSSLLSLLSSSLSLLSSSLSLL ..S...............LS...............L 4x10 6=7 7=13 21=27",
  "8dc35506 7 7 SLSSLLLLSLSSLSLSSLSLLSLSLSSLLSSSLLSL .....L........................SS.... 3x4 10=16 18x24 27=28",
  "4bf317ce 1 0 SLSLSLLLSLSSSSLSLLLSLLSSSLSSLLLSLSLS ....S.........L.L.L.......SS...S.S.. 0x1 8x9 10x16 11x17 12x18 13x14 30x31",
  "ba6676b0 2 0 SLLSSLSLLSLSLSSLLSSSLLSLLLSSLSLSSLSL .L......L..S.............L..L....... 7x13 13=14 16x22 24=25 26=32",
  "200f9052 3 1 LSSLLSLLSLSSSSLSLLSLSLSLLSLSLSSLLSSL ..S.......S......LS................. 1=2 12=13 14x20 16x22 33=34",
  "7730d48a 4 2 SLSLSLLLSLSSLSLSLSSLSSLLLSLLSSSSLSLL ...........S...S....S...........L... 3=9 11=17 13x19 19x25 28x34 34=35",
  "bce31242 5 3 SSLLSLLSLSLSSLSLSLLSLLSSLLSSLSSLSSLL ..................L.......S.L.....L. 2=3 4x5 6x7 15=21 34=35",
  "aea8279f 6 4 SLSLSLSSLSLLLSSLLSSLLSSLLSLSLSLLSLSS ......SS..L...........S............. 4x5 7=13 19x25 21=27 22x28",
  "f421ba96 7 5 SLLSLSSSLLSLLSSLLSLLSSLSSLLSSLLSSLSL S....................S..S........... 6=7 9=15 16=22 29=35",
  "b7b03b3b 1 0 SLLSSLSLSLSLLSLSLSLSLSLSSLSLSLLSSLLS ........S..LL.....L......L..S...S... 11x17 16x17 22x28 25x31 27=33 28x34",
  "5d109d42 2 0 LLSLSSSLSLLSLSLSSLSLSSLLLSLLSSSSLSLL ....S...S....S........L..S.......... 2x3 4=5 4x10 14x15 17=23",
  "7aaf76ab 3 1 SLSLSLSLSLSLLSLSLSSLLSLSLSSLSLLSLSLS S............S...S.L................ 4=10 15=21 19=20 25=31 27x28 27x33",
  "14e03569 4 2 SSLLSLLSLSSLSLSLLSLSLSSLSLSLLSLLSSLS ...L.......L..S..............S.L.... 1x2 4x5 12x13 12x18 25x26 27=28",
  "4698416d 5 3 LSSLSLSLSLLSSSLSLLLSLLSSLLSSLSSLLSSL ..S...........L.L..............L.... 3x4 13x14 13=19 18=24 27=33",
  "5467c30a 6 4 SSLSLLSLSLSLLLSLSSLSLSLSSLLSSLLSSLLS ....L.............L.LS.............. 5=11 7x8 7=13 12=18 31=32",
  "0883a1f8 7 5 LSSLLSLLSSLSSLLSSLLSSLSLSLLSLSSSLLSL ..S.L........................S...... 2x3 12x18 25=26 30=31",
  "7c15a94f 1 0 SLLSLSSSLLSLLSSLSLLLSSLSSSLSLLLLSLSS ..L....S........SL..S....S..L....... 2x3 3x4 4x10 6x12 7x8 9x10 10x11",
  "7cbef248 2 0 LSLLSSSLLSLSSLSSLLLSSLSLLSLLSSSLSSLL L.L.S........L.........L........S... 1x7 3x4 10x11 19=20 26=27",
  "5e4c8b4b 3 1 LSLSLSSLLSSLLSSLSLLSSLLSSLLSLSSLSLSL .....S.L.......L...S.........S...... 19=20 20x26 22=28 25=31 26x32",
  "4d7877e6 4 2 SSLSLLSSLSLLLLSLSSSLSSLLLSLLSSLLSLSS S..........L.........S.L..........S. 2=8 3=9 6=7 26=27 30=31",
  "b7d321d8 5 3 SSLLSLSLSLLSLSLSSLLSSLSLSLLSLSLLSSLS ..........L..S.S...............L.... 0=6 12=18 27x28 28=34 29=35",
  "559a5c8d 6 4 LLSLSSSLSSLLLSLSLSSSLLSLSLSSLLLSLLSS ..S..S...S....................L..... 6x12 10=16 14=20 25x31 26=27",
  "78141b03 7 5 LSSLLSSLSSLLLSLSSLSLSLLSSLLSSLLSLLSS .................L...L........L..... 1=2 6x12 8x14 9=15",
  "de3771ac 1 0 LSLSLSSLLSSLLSSLSLSLSLLSSLLSLSLSSLSL L...L....S...S...L...L.S.L.......... 9x15 12x13 22x23 22=28 24x30 26x32",
  "b7f8cfb0 2 0 LLSLSSSLSLSLSSLSLLLLSLSSSSLSLLLSLSLS .L........S.......L.......L.......L. 2=8 7x13 10x11 16=17 18x24 25x26 26x27",
  "f9f861fc 3 1 SLSLLSSSLLSLLLSSLSLLSSLSSSLLSLLSLSSL ..S...........S..S...........L.....L 0=6 9x10 16x17 20=21 26=32",
  "a3f37041 4 2 SLSLSLSSLLSLLLSSLSSSLLSLLSLSLSLLSSLS .....LSS..S......................... 2x3 12=13 18=19 20=26 25x26 27=33",
  "17f315fc 5 3 LLSLSSSSLSLLSSLSLLLLSLSSLSLSLSSLSLSL ..........L.......L.....L.......S... 0=1 8=14 10=16 19x25 22x28",
  "ac063863 6 4 SLLSSLSLSLLSLSLLSSSLSSLLLSSLSLLSLSLS S.....S...........S..........L...... 7x8 10x16 22=23 33x34 34x35",
  "10af71da 7 6 LLSSLSLSSLLSSSLLSLSLLSSLLLSSLSSSLLSL L...L......S..L..................... 1x2 7=13 18x19 20x26 30=31",
  "6316ffb5 1 0 LSLSLSLSSLSLSLLSLSLSSLLSSLLSSLSLSLSL ..L.L..........S.S.S..L.S........... 7=8 13x19 19=20 21x27 31x32 32x33 34x35",
  "f032c84a 2 0 LLSSLSLSLLSSSSLSLLSLSSLLLLSLSSSSLLSL L...L..............L........S...L.S. 2=3 2x8 4x10 12=18 18x19 25x26 26x32",
  "12ce4bba 3 1 SSLLSLSLSLLSLSLSSLLLSLSSSLSSLLLSLSLS ....S...........S.L.SL.............. 12=18 15x21 21x22 24x30 26=27",
  "88574a89 4 2 SSLLSLLSLSLSSLSLLSLSSLSLSLLSSLLLSSLS SS.L.....S.......................... 10=16 13x19 14x15 21x22 25=31",
  "8b548e39 5 3 LSLLSSLSLSSLSLSSLLLSLLSSSLSLLSSLSSLL .S...S..........L.........S......... 5x11 6x7 7x13 14=15 34=35",
  "419fd195 6 4 SSLLSLSSLSLLLLSSLSLLSLSSSSLSLLLLSLSS ....SL.......L.....L................ 6=7 14=15 22=23 30=31 32x33",
  "926419b5 7 5 SLSLSLLSLSSLLSSLLSSLLSLSSSLLSLLLSSLS ........L............S..S......L.... 1x2 2x8 5=11 6=12 27x33",
  "98cc6a64 1 0 SSLLSLLSLSLSSLSSLLLSLLSSSLSLSLLLSSLS ......L...L..L........S.SL........L. 12x13 16x22 21x22 24x30 27x28 30=31",
  "4af046ac 2 0 LSLSLSLSLLSSSLSLSLSLSSLLLSLSLSSLSLSL .....S.......L.........LL......L.... 5=11 8=9 14=20 22=28 24x25 25x26 26x27",
  "2693a573 3 1 SSLSLLLLSSLSLSLLSSSSLLSLLLSSLSSLSLSL ......LL....L..................L.... 14=15 14=20 20=21 27x33 30x31",
  "7470150b 4 2 LLSLSSSLSSLLLSLSSLLSSLLSSLLSLSSSLLSL L..........LL.....L................. 1=7 2x3 11=17 22x23",
  "e114b2af 5 3 LSLLSSLSLSSLSLSSLLSLSLLSLSLLSSSLSSLL .S......L.S....S.................... 0=6 10x11 16=17 24x30 31x32 33x34",
  "1a9ec2b2 6 4 SLLSSLSLLSSLLSSLLSLSLLSSSLSSLLLSSLLS .........S..L..................S...S 3=4 9=10 12=18 20=21 28=34",
  "36f80b8b 7 5 LLSLSSSLSLLSLSLSSLLSLLSSSLSSLLSSLSLL ...........SL......S.........L...... 2x3 2=8 4=5 16=22 24=30",
  "a3b0fd24 1 0 LSSLLSLSSLLSSLLSSLSLLSLSLSSLSLSLLSSL L....SL........S...........L.LS..... 4x5 10x16 15=16 20x21 21x22 25x31 33=34",
  "6e7b88da 2 0 LLSSLSSLSLLSLSLSSLSSLSLLLLSLSSSSLLSL .........L..L...S..S....L........... 3x9 10x16 14=20 20x21 26x32 29x35 32=33",
  "3aac75a4 3 1 LSLLSSSSLSLLLLSLSSLLSLSSSSLSLLSLSSLL .......S....L.....LL...............L 0x1 0x6 10=11 26x27 28=34",
  "c85c9390 4 2 SLSLSLLSSLSLLSLSLSSLSLSLLSLSLSSLLSLS ..........S.L...........L...L.....L. 2=8 6=12 14x20 31=32",
  "d9635906 5 3 SLLSSLSLSSLLLSSLLSLSLLSSSLLSSLLSSLLS ...S......L.............S...S....... 0=6 13=19 17=23 22=23",
  "64e29659 6 4 LSLSSLLLSSLSSSLLSLLLSSLSSLSLLSSSLLSL ....S................S.....L.......L 15x16 18=19 23=29 24=30",
  "717b5f82 7 6 SLLSSLLLSLSSLSSLLSSSLSLLSLSLSLLSLSLS .........L............L....L.......S 1=2 7x8 15x21 18=19 18=24",
  "bd14998b 1 0 LSSLSLSLSLSLLSLSLSLLSSLSSSLLSLSLLSLS .S.L....SL............LS.......L.... 0x1 5=11 7x8 15x16 16x17 21x22 25x26 25x31",
  "ee855900 2 0 SLSLSLSLSLLSLSLSSLLSSLLSSLLSSLLSLSLS .....LS.S..S................S....... 1=7 3=9 12=18 14x20 23x29 24x25",
  "07a16687 3 1 SLSLSLSLSLSLLSLSLSLSSLSLSLLSLSLSLSLS S.......S............L.......S..L... 3=9 9x10 12=18 15x21 24x30 33x34",
  "2658d7ad 4 2 LSLSSLSSLLSLLLSSLSLSLSLSSLSLSLSLSLLS .......S..S..........S.S......S..... 3x9 4=10 9x10 12=18 25=31",
  "c13f7438 5 3 LLSSLSLSLSSLSLSLSLLSLSLSSLSLLSSSLLSL ......L............S...........S...L 2x8 8x14 11=17 24=30 26x32 32=33",
  "fa1bdb88 6 4 SLLSLSLLSSLSLSSLSLSLLSLSSSLLSLLSSLSL S.....L......................L.....L 1=7 3=9 10x16 12x13 25x26",
  "1f0d2b62 7 5 LLSLSSSLSLSLLSLSLSSLSSLLSSLLSLLSLSLS ..............LS.....S....L......... 0=1 2=8 11x17 30x31 32x33",
  "aabd2189 1 0 LSLSLSSLLSLSSLSLSLLSSLLSSLLSSLLSSLSL .S...S...SL........S........S....L.. 1x7 3x4 8x9 19=20 19x25 24x30",
  "45189208 2 0 LSLSLSLLSSLSSLSLSLLSLSLSSLSLSLSSLLSL ...S.S..........S..S...S...L........ 6x12 7=13 9x15 12x18 13x19 20x21 20x26 26x27",
  "e5595908 3 1 SLSLSLLLSLSSLSLSLSSLSSLLSSLLSLLSLSLS ......L.S................S...L....L. 1=7 2=8 3=9 7x8 16x17 16=22",
  "9e660b6a 4 2 LSSLSLSLSLSLLSLSLSLSSLLSSLLSSLSLLSLS L..............SL.....L...L......... 2=8 12x13 13=19 25=26 29x35",
  "c3599c93 5 3 SLLSLSSLLSLSLSSLSLSSLLSLLLSSLSLSSLSL ................S.....SL......L..... 3x4 5=11 13=14 14x20 24=25",
  "965ab005 6 4 SLLSSLLLSSLSSSLLSLSLSLLSLSLSLSLSSLSL ...SS..............L.............L.. 6=7 25x26 31=32 33x34",
  "72c94df4 7 5 LLSLSSLSLSLSSSLLSLSLSLLSLSLSSLSLSSLL .L.L...........L.................... 4=5 5=11 24x30 29=35 32=33",
  "d41ef08d 1 0 SSLLSLSLSSLLLLSLSSLSLSLSSSLLSLLLSSLS .S...L....L..LS..S........L......... 11x17 12=18 13x19 14x15 26=27 27x33",
  "341b8adb 2 0 SLLSSLLSSLLSLSLSSLSLSSLLLSLLSSSLSLLS .L...L..SL..............L.......S... 9x15 14x20 15=16 24x30 26=27 34x35",
  "c4c1a901 3 1 LLSLSSLLSLSSSSLSLLSSLLSLLLSSLSSSLSLL ......L...S.........L...........L... 5=11 13=19 26=27 27=33 29x35 33x34",
  "a16d4fe4 4 2 LSLSSLSSLLSLLLSSLSSLLSLSLSSLSLSLSLLS .............L.S...........L......L. 0x6 17=23 19x25 24x30 25=26 27=33",
  "9f2da818 5 3 LSSLSLSLSSLLLSLLSSLLSLSSSSLSLLSLLSLS .....L.....L.......L.........L...... 0x6 1=2 4x10 13x19 28=34",
  "c770ada4 6 4 SLSLLSLSSLLSLSLSSLSLSLSLLSLSLSSLLSSL S..................L.......S..S..... 3=4 5=11 7=8 27x28 29x35",
  "3fae4af4 7 5 LSSLSLLSLSSLSLLSLSSLSLSLLSLSLSSLSLLS L....LL...S......................... 9=15 12=18 19x20 29=35 31x32",
  "fd01b02e 1 0 LSSLLSLSLSSLSLLSLSSLSLLSLSLSSLSLSLSL ...L..L.................LS...L.L..S. 3=4 4x10 7x13 18x24 21x27 25x26 33x34",
  "e5297587 2 0 SSLSLLLSSLSLSLLSLSSLSLLSLSLSSLLLSLSS .....L........L....L...S..........S. 8x14 9x10 13=19 14x20 24=30 25x31",
  "189fdafc 3 1 SLSLLSSSLLSLLSLSLSSLSLSLLLSSLSLSLSSL ...............S...L.......S...S.S.. 2x3 12x13 22x28 24=25 24=30 28x34",
  "dd9e4dac 4 2 LSSLSLSLSLSLSLLSLSLSLLSSSLSSLLLSLSLS ..............L....S..S......L...... 3x4 5=11 7=13 8x9 15x16",
  "06718720 5 3 SLLSSLSLSLSLLSLSLSSLSSLLLSLLSSLSSLLS ............L.LS........L........... 2x8 17x23 18x19 25=31 26=27 29=35",
  "cf5a9385 6 4 LSSLLSLSLSSLSLLSSLSLSLLSLSLSLSSLSLSL .........S.....S..............S..L.. 0=6 11=17 23=29 25x26 33x34",
  "736b8999 7 5 SLLSLSLLSLSSSSLLSLLLSSLSSSLSLLLSSLSL .....................S.S..L.L....... 1=2 6=7 14=15 29=35",
  "25698465 1 0 LSLSSLLSSLLSSLSLSLSLLSLSLSSLLSSLLSSL ..L...L....S....S..........L.SS..... 5x11 6x12 9=15 12=18 15x16 16x22 28x29",
  "b0337fd6 2 0 LSSLSLSLSLSLLSLSLSLSLSLSSLSLSLSLLSLS ..............LS........S.S....L.... 5=11 6x7 9x10 13x14 15=21 16=22 27x33 30x31",
  "c3766592 3 1 SLLSSLSLLSSLLSSLLSLSSLLSSLLSSLLSSLLS ..L......SS........................S 1=7 13=14 15=21 16=22 25x31",
  "a985eba6 4 2 LLSSLSLSLSLSSLSLSLSLSSLLLSLLSSSSLLSL ..........L..L.L................L... 0=6 4x5 18x19 25=31 28=29 30=31",
  "ae31aa19 5 3 SLLSSLLSLSSLLSSLLSSLLSLSLSSLSLSLSLLS S............................L.L...S 1=2 3=9 16=22 19=20 27=33",
  "fb322e7e 6 4 LLSLSSSLLSSLLSLSLSLSSLLSSLSLSLSSLSLL .L.....L...L............S........... 17=23 20=26 21=27 34=35",
  "f47fd631 7 5 LSSLLSSLSLSLSLLSSLLSLSLSLLSLSSSSLSLL L..L..S...S......................... 2=8 4x5 19x20 22x28 34=35",
  "3f88b9d9 1 0 LSLLSSSLSLSLLSLSLSSLLSLSLSSLSLSLSSLL .....S........L.LS...S.........L..L. 1x2 7x13 12x18 13x14 18x24 25x31 29=35 31x32 33x34",
  "7085f824 2 0 LSLSLSSLSLSLSLSLLSLSLSSLSLSSLLLSLLSS .S......S.S.....L........L.........S 5x11 10x11 16x17 18x19 18x24 19x20 28=29",
  "5240396b 3 1 LLSSLSLLSLSSSSLLSLSSLSLLLLSSLSSSLLSL ........S.S.S..........L............ 1=7 13=19 22=23 22=28 30=31",
  "b1e7ebfa 4 2 SSLSLLSLSLLSLSLSSLLLSSLSSLSLSLLSLLSS .........LL.........S.....S...L..... 4=5 5x11 22x23 24x30",
  "34cb47aa 5 3 LLSLSSSSLSLLLSSLLSSLLSSLSLLSSLLSSLLS ........L....S................L..L.. 6x12 10=11 21=22 23=29 33=34",
  "9db5f213 6 4 SLSLLSSSLLSLLSLSLSLLSSLSSLSLSLLSLSSL .....S........LS.........L.......... 0=6 13x19 24x30 28=34 29=35",
  "1876e0ba 7 5 SLSSLLLSLSSLSLSLLSLSSLLSSLLSSLLSLLSS .....L.....L.......S...S............ 0x6 1x7 13x14 21=22 32=33",
  "326144af 1 0 SLSLLSSLLSSLLSSLSLLSLSLSSLSLSLLSLSLS .....SS..S................S....SL.L. 4x5 7x13 8x14 13=19 22x28 28x34",
  "d0ad8064 2 0 SLLSSLSLSLLSLSLSSLLSLLSSSLSSLLLSSLLS S..........SL..........S.L.......... 3=4 4x10 6x7 7x8 12=18 22=23",
  "3ce308e4 3 1 LLSLSSLLSSLSSSLLSLSSLSLLLLSLSSSSLSLL ....S...................LL.L........ 1=7 12=18 13=19 14=15 24x30",
  "26578707 4 2 LSLLSSLLSSLSSLSLSLLSLLSSSLSSLLSSLSLL ...L...............S....S..........L 2=3 6=7 8=9 15=21 30=31",
  "ce12158f 5 3 SLSLLSSLSSLLLSLSSLLLSLSSSSLSLLLSLLSS S.....S.........S....L.............. 1=7 4x5 20x21 22=23 34=35",
  "207950bb 6 4 SLSLLSSSLSLLLLSLSSSSLSLLLSLSSLLLSLSS S.....S.............LS.............. 3=4 18=19 22x28 28x29",
  "488f040c 7 5 LLSLSSSLLSLSLSLSSLLSSLLSSLSSLLSSLLSL ..S...........................S...S. 0x6 5=11 19=20 22=28",
  "1132db39 1 0 SLLSLSLSSLSLLSSLSLSLLSLSLSSLLSSLLSSL S.L.......S.......S...L.......S....L 2x8 7=8 12x13 14x20 19=20 20x26 29x35 31=32",
  "47f6b057 2 0 SLSLSLSLSSLLLSLLSSSLSLLSLSLSSLLSLSLS ..S.S.....L.L.......S....S.......... 0=6 7x13 14=15 15x16 20x21 21=22",
  "2f0f99c6 3 1 LLSSLSSLSLLSSSLLSLLLSSLSSSLLSLLSLSSL ...S.S....L..S....L................. 7x13 8x9 12x18 16x22 26=32 27x28",
  "c459b955 4 2 SSLLSLLSSLSLSLLSLSSSLSLLLLSLSSLLSSLS .S....L..L............L............. 5=11 13x19 22=23 24=30 28x34",
  "99d4ae48 5 3 SSLLSLSLLSLSLSSLLSLSSLSLSLLSSLLLSSLS ..L..L.............S.............S.. 1x7 9x10 11=17 18x19 22=28 27=28",
  "705becaa 6 4 LSLSLSSSLLSLSLSLLSLSLSSLLLSSLSSLSLSL ...S.......L......L....L............ 3x4 24=25 25=31 28x29",
  "d6fc6904 7 5 SSLLSLLLSSLSSLLSSLLSSLSLLSLSLSSLSLLS .....L..S..........SS............... 3x4 17=23 18=24 21x27 27x33",
  "bef6246c 1 0 SLSLSLLSLSLSSLSLLSLSSLSLSLLSSLLSLSLS .....L......S..........LS.L.S.....L. 7x8 7x13 12x13 25x31 26x27 33x34",
  "78953945 2 0 LLSLSSLSSLSLSSLSLLSLLSLSLSSLSLSLLSLS LL.........LS................L...... 6x7 7=8 10x16 12=18 15=21 19x25 29x35 34x35",
  "a15d8f37 3 1 SSLSLLSSLSLLLLSLSSLSSLLSSLLSSLLLSLSS ..L.L...L.L......................... 12=13 19=20 26x32 27=28 34=35",
  "ceed1729 4 2 LSLSLSLSLSSLSLSLSLSLLSLSLSSLSLSLSLLS L.............S..L......L..L........ 9=10 13x14 18x24 26x27 26=32 27x28",
  "51834c89 5 3 LSSLLSSSLSLLLLSLSSLSLLSSSLSSLLSLLSSL L......S..L........S................ 1=2 16=17 24x25 26=27 28x34",
  "aae7a275 6 4 SSLLSLLSLSLSLLSSLSSLSLSLSSLSLLLLSLSS .S.........SL.............L......... 1=7 8x9 16x17 28=29 32x33",
  "2b80e501 7 6 LSSLSLSLSSLLLSLSLSSLSLSLSLLSLSLSLLSS L..................L...L............ 8x14 20x21 29=35 32=33",
  "9c19149f 1 0 LSLSSLSLSLLSLSSLSLSLLSLSLLSSLSSSLLSL .........L.SL...S.S......L....S..... 1x2 8=14 10x11 12x13 17x23 32=33",
  "3bfac6c2 2 0 SLLSLSSLSLLSLSLSSLSLLSSLLSSLLSLSSLSL .LL.L.................SLL........... 7x8 10x11 14=20 15=16 17=23 25=31",
  "deb8773a 3 1 LLSLSSLSLLSSSLSSLLSLLSSLLSSLLSSSLSLL ..S....S.................S..L....... 4=5 8=9 16=17 27=28 28=34",
  "ba9c6b88 4 2 SSLSLLLSSLSLLLSLSSSLLSLSLSSLSLSLLSLS ............LL...............L..L... 1=7 4x10 6x7 23x29",
  "a8952346 5 3 LLSSLSLSLSSLSLSLLSLSLSSLSSLLSLSLSLLS LL....L............................S 4x10 9=10 15=16 21=22",
  "fa811e8d 6 4 SSLLSLSSLLSLLLSSLSSLSLLSLSLSSLLLSSLS ..........SL............L.........L. 2=3 8=9 14=20 21=22 34x35",
  "7c433016 7 5 SLSLLSSSLSLLLSLSSLLLSLSSSSLSLLLLSLSS .....S....L.................L......S 0=6 14x20 21x22 26x27 26x32",
  "5f5de1d7 1 0 SLSSLLSLLSLSLSSLSLLSLLSSSLSSLLLSLLSS ...S...L.........L..L...S..S...S.... 2x8 3x4 4=5 7x13 20x26 22x28",
  "f3cc8aa6 2 0 SLSSLLSLSLLSLSLLSSSSLSLLLLSLSSLSLSSL ...S......L............L....S..S.... 2=8 22x28 26x27 31x32 32x33",
  "b94b382e 3 1 SLLSSLSLLSLSLSSLSLLSSLLSSLLSSLLSSLLS .........S........L..LL.........S... 1=7 4x10 7=8 9x10 15x16 22x28",
  "ba00e21c 4 2 SSLLSLLSLSLSLLSLSSSSLLSLSLSSLLLLSSLS ......L.........SS..........L....... 13x19 18=19 19x25 24x25 30=31 34x35",
  "24d5ce77 5 3 LLSSLSSLSLSLLSLSLSSLLSLSLSSLSLSSLLSL .......L.L.....................S..S. 5x11 12x18 21x22 29=35 30=31",
  "84ed3f97 6 4 SLSLLSLSSLLSLSLSSLSLSLLSSLLSSLLSLSSL ...................L........S.L...S. 4=10 7=8 7=13 19x20 27=33",
  "35658577 7 5 SLSSLLSLLSSLLSLLSSSLSSLLLSSLLSLSLLSS .L....S.......................L..... 3=9 9=10 13x19 16=17 20=26",
  "dd78142c 1 0 SLSLSLLSLSSLSLSLLSSLSLLSLSLSSLLSLSLS .L.......S..S...L..L..L.L........... 0x1 9x15 25x26 27=33 28x29 33x34",
  "729e126e 2 0 LSSLSLLSLSSLSLSLLSSSLSLLLLSLSSSLLSLS .....L......S...........L...S..L.... 1=2 4x5 5=11 10x11 15x21 25=31",
  "00443f36 3 1 LLSLSSSSLSLLSLSSLLLLSLSSLSLSLSSSLLSL ....S...L.......L..........S.S...... 1x7 4=5 13=19 22=23 27x33",
  "a3682948 4 2 SLSSLLSLSSLLLSLLSSLSLSSLSLSLLSLSLLSS ......S.S......L.................L.. 14=20 19x20 27=28 30x31 32=33",
  "41eeea5f 5 3 SLSLLSSLLSLSLSSLSLLSLLSSSLSSLLLSLSSL ..S.......L...S..............L...... 0=6 3=4 12x13 20=21 28x34 31x32",
  "534f05d8 6 4 SLLSSLLSSLLSLSLLSSSLSSLLSSLLSLLLSSLS S..........S............S..L........ 7=8 8x14 11=17 16=17 30=31",
  "442c2c96 7 5 LSSLLSSLSSLLSLLSSLLSSLLSLSLLSSSLLSSL ...........L.........L.............L 4=10 19=20 19=25 26=32",
  "2a689020 1 0 LSSLLSSLSLLSSLLSSLLSLSSLSLSLLSLSLSSL L..L...........S.L..L....L.....S.... 0x1 6x7 16x17 17=23 19x25 28x34",
  "b054bd6f 2 0 LSLSSLLLSSLSSLSLLSSSLLSLLLSSLSSSLLSL ....S.......S..L...S.....L.S........ 3=4 5x11 7=13 11=17 18=19 21x27",
  "deff91cb 3 1 SSLLSLLLSLSSSLSSLLLSLSSLLSSLLSSLLSLS ........S...........L..........L..L. 4=10 10=11 11x17 19x20 21=22 25x31",
  "19046cfe 4 2 SLLSSLLSLLSSSLSLLSSLSSLLLSLSSLLSSLLS ..L......L.......S.....L............ 1x7 2=8 12=18 25=31",
  "1988fbdf 5 3 SLLSSLLSLSLSSLSLSLLSSLSLLSLSLSSLSLLS ....S...........S.L..........S...... 3=4 7x13 15=21 22x28 25x26 26x32",
  "c1e68641 6 4 SLSLLSSLLSSLLSLSLSLLSLSSSSLSLLLSSLSL S.....S........S..................S. 9=10 15x16 24=25 25=31 31=32",
  "9e4c1f6d 7 5 LLSSLSSLSLLSSSLLSLLSLSSLSLSLLSLSLSSL L............................SL..... 1=7 14=15 21=22 22x28",
  "3edc76f5 1 0 SLLSSLLSLSLSLSSLLSSLSLSLSLLSSLLSSLLS .L........L.L.........S...L......L.S 0x1 0x6 15=21 18=24 20x26 25x31 29x35 34x35",
  "f6a50083 2 0 LSLLSSLLSSLSSLLSSLLSSLLSSLSSLLSSLLSL ........S...........S....L..L......L 8=9 13x19 20x21 22=28 23x29 32=33",
  "8aa9117a 3 1 SLSLSLSLLSLSLSLSSLSLSLSLLSLSLSLSSLLS S.S..L....L.....................S... 3x9 7=8 16=22 21x27 24=30",
  "692b2c00 4 2 SLSSLLSSLLSLLSLSLSSLSLSLLLSLSSLSLSLS ......S.................LL....L..... 8=14 10x11 10x16 12x13 13x14 22=28",
  "608b5bda 5 3 LSSLLSSLSLSLSLLSSLLSSLLSLSLSSLSLLSLS ....L.S................SL........... 3=4 6=12 15=16 26=32 33x34",
  "6627d6e3 6 4 LLSLSSLSLSLSSLSSLLSSLLSLLSLSLSSLSLSL ....S.......S.................S.S... 0=1 18=19 21x27 22x23 32x33",
  "da91dfb6 7 6 SSLLSLLSSLLSSLSSLLSLLSSLLSLLSSLLSSLS ....S.................S.....S....... 7=8 13=19 24=30 29=35 33x34",
  "795c37f7 1 0 SLSLLSLSLSSLLLSSLSSLSLSLLSLSLSSSLLSL S.S..S....S...........S..S...S...... 23x29 25=31 26=32 28x29 31x32 33x34",
  "be669c23 2 0 LSSLLSSLSLSLSLLSLSLSLSSLLSSLLSSLLSSL ............S.L.....L..L......S..... 3=4 6=12 16x22 27x33 33=34",
  "051ee812 3 1 LSSLSLSLLSLSSLLSSLLSSLSLSLLSLSLSSLLS .S...............L...L..........S..S 3x4 6x7 13=14 17=23 31=32",
  "249733fa 4 2 LSSLSLLSSLSLSLLSLSSLLSLSLSSLSLSLLSLS ....S......L......S..........L...... 1=7 3=9 12=18 14=20 31=32",
  "b1bf33af 5 3 LSSLSLLSLSLSSLSLLSSLLSSLLSSLSLSLLSLS L.......................L.S.......L. 1=7 7x8 11=17 13x14 22=28 31=32",
  "7e4c8690 6 4 LSLSSLLSSLSLSLLSLSSSLSLLLLSLSSSLSLLS ..............L........L...L..S..... 2x8 12=18 17x23 24=25 29=35",
  "96de715b 7 5 SSLSLLLLSLSSLSSLSLSSLSLLSLLSLSLLSLSS ..................S.....S...L....... 0=1 10=11 15x16 28x29 34=35",
  "3d79843d 1 0 SLSLLSLSLSSLLSLSSLSLSLLSSLSLSLLSLSLS ..S.L.L.....L....L........SL........ 8x9 20=26 24x25 25x26 27x28 29x35",
  "e73f51f4 2 0 SLLSLSLSSLSLLSLLSSSLLSLSLSSLSLSLSSLL S....S..S......L..S..........L...... 10=16 14=15 19x25 23x29 30x31",
  "99a64f86 3 1 SLSLSLSLLSLSLSLSSLLSSLSLSLLSLSLSSLLS .................L.S........L.....L. 1=7 7=8 13x14 15=16 20x26",
  "e630ceb2 4 2 SLLSSLSLSLLSLSLSLSSLLSSLLSSLSLLSSLLS ........S.L..........S..L......S.... 0=6 8x9 22=28 27x28 27=33",
  "9c814e4c 5 3 SSLLSLSLLSSLLLSSLSLSSLSLSLLSLSLSSLLS ....S...........L.L..............L.. 1x2 10x11 12=13 16x17 24x30 29=35",
  "7f6405d7 6 4 LLSSLSLLSLSSSSLSLLSLSSLLLSLLSSSSLLSL ........S.S....................S..S. 0=6 12=13 24x25 26=32 28=29",
  "94543aa2 7 5 LSSLLSSLSLSLLSLSSLLLSSLSSSLLSLSLLSLS ............L.....L......S.......... 3=9 6x7 11=17 15=16 25x31",
  "5ce0961c 1 0 SLSLLSLSLSSLLSSLLSSLLSLSLSSLSLSLLSSL S..LL......L.S.........S.S..S....... 0x6 3x9 11x17 16x17 21x27 27x28",
  "6d0f9a09 2 0 LSLSLSSLSLLSSLLSSLLSSLSLSLSLLSLSLSSL .....S...LL.............S....S...... 3x4 6=12 13=14 15=16 16=22 22x23 26x32 27=28",
  "a782e4b5 3 1 SLLSSLSSLLSLLLSSLSLSLSLSSLSLSLLSSLLS S..........L..............S.......L. 2=8 4=10 9x10 12=18 16=22 27=33",
  "d926f9b0 4 2 LSSLLSSLLSLSLSSLSLLSSLSLSLLSLSSLLSSL L....S....L.L................S...... 10x11 14=20 24=30 27x28 27=33 28x34",
  "c2ff1a41 5 3 SSLSLLLSSLSLLLSLSSSLLSLSLSLSSLSLSLLS ........S....L....S.............S... 0x6 23x29 24x30 27=28",
  "7c5ed837 6 4 LSLSLSLSLLSSSLSSLLLSSLLSSLLSSLSLSLSL ...S...S...............S...........L 0=6 1=7 10=11 25=31 26x32",
  "c9a515b9 7 5 SLLSLSLSSLSLSSLLSLSLLSLSLSSLSLLLSSLS .L.........L...L.............L...... 4x10 6x7 12=13 25=26 32=33",
  "e756397f 1 0 SLLSSLSSLSLLLLSLSSSLSLLSLSLSSLLSSLLS .L...LS...L...........L...L...L..... 2x3 3=9 13=19 19x25 22x23 24=30",
  "446169b4 2 0 SLLSLSSSLSLLLLSLSSLSLSSLSLSLLSLSSLSL ...........L.....S.......L.....SS... 4x5 4=10 5x11 14x20 15x21 21x27 27=28",
  "64e8911b 3 1 LSLSLSSSLLSLLLSSLSSLLSSLLSSLSLSLSLLS .......S...........L..........S....S 6=7 19=20 20x26 21=22 27x28 31x32",
  "bfc7bf21 4 2 LSLSSLSLSLSLLSSLLSSLLSLSLSLSSLSLSLLS ..L.S.....S...................S..... 7x8 15=16 19x25 20=26 24x30 29x35",
  "2eb43f4d 5 3 SLLSLSSLLSLSLSSLSLLSLSLSSLSLSLLSSLSL ...........S......L.L........L...... 0=6 5=11 9x10 24x30 27=33 28x29",
  "d7b3ad59 6 4 SLSLSLSLLSSLLSLSLSLLSLSSSSLSLLLSSLLS .L.......S.....S.................L.. 3x4 4=10 12=18 24=25",
  "ee99610e 7 5 SSLSLLSLLSLSLSSLSLLSSLLSSLLSSLLLSLSS .......L......S..............L..S... 4=5 5x11 13=19 21=22 24x30",
  "f4092153 1 0 LLSLSSLSSLLSSLLSSLLLSLSSSSLSLLSSLSLL .......S.LL.....S.LL.......S........ 1x2 3x4 4x10 18x24 24=30 32x33",
  "560e3adf 2 0 LSSLSLLLSSLSSSLSLLLLSLSSSSLLSLSLLSLS ..S.......L.S................LS..... 5x11 8=9 10=16 12x18 18=19 21=27",
  "6db044b3 3 1 SLSSLLSLSLSLLSLSLSSSLLSLLLSSLSLSLLSS ...S..S...................SS....L..S 8x9 9x10 10x16 14=20 24=25",
  "99ebfc39 4 2 LSLSSLLSSLLSSLSLSLLSLSLSSLLSLSSLSLSL L....................S.S....L....... 0=6 1x2 11x17 12x18 25=26",
  "47c548bd 5 3 LSLLSSLLSSLSSSLLSLSLLSLSLSSLSLSLSSLL .S.......S..S.........L............. 5=11 12=18 14=15 22x23 27x28 34=35",
  "b6c82833 6 4 LLSLSSSLLSLSSSLLSLLLSSLSSSLSLLLSSLSL ..............L......S..S..........L 1=7 6=12 13x19 26x27",
  "902ccc3c 7 6 SLLSLSSSLLSLLSSLSLLLSSLSSLLSSLLSSLLS .............S.L..L.........S....... 0=6 11=17 19=25 32x33",
  "6c839933 1 0 SLSLSLLSSLSLSLLSLSLSLSSLSLSLLSLSLSLS ..S..L...L.L.L...........L...S....L. 6x12 12x13 20x21 25x26 28x29 31x32",
  "fa2b06dc 2 0 SSLSLLSLSSLLLLSLSSLSLSLSSSLLSLLLSLSS .S..L....S......SS.........L........ 1x7 12=18 14x15 24x30 30=31",
  "002e0bac 3 1 SLLSSLSLSLLSLSSLLSSLLSSLLSSLSLLSLSLS ...SS...........L.......L..L........ 7x8 16x22 19=20 23=29 25=31 26x32",
  "b5251202 4 2 LSSLLSSSLSLLLLSLSSLLSLSSSSLSLLSLLSSL .........S..LL..........SS.......... 3=4 9x10 22=23 29=35 31=32",
  "48804fc9 5 3 LSLLSSSSLLSLSLSSLLLSSLLSSLLSSLLLSSLS .S......L.S......L.................. 3x4 6=7 18x19 26x32 34x35",
  "bcba46ba 6 4 SSLSLLSLSLSLLLSLSSSSLSLLLSLLSSLLSSLS ........S....L.......S............L. 0=1 2x3 12x18 24=30 32=33",
  "19ba12b7 7 6 SLSLSLLSLSSLLLSSLSSSLLSLLSSLLSSLLSLS ............L....S............S.L... 5=11 7x8 7x13 19=25",
  "ab9961c0 1 0 LSSLSLSLSLSLLSLSLSSLLSLSLSSLSLSLLSLS L......L.L.LL.......L...L........... 4x5 4=10 9x15 18x19 21x22 27x33",
  "18a46b7b 2 0 SLLSLSLSLSLSLSSLSLSLLSLSSLSLSLLSSLSL .............S.......S.S....S.L..... 3=9 4x5 5=11 7=13 9x10 15x16 15x21 28=34",
  "f026a7f2 3 1 LSLSSLLLSSLSSSLLSLLSSLLSSLLSSLSLSLLS ............S.LL.....L...L.......... 1x7 16x22 22x28 31x32 33=34",
  "32f0b60b 4 2 SLSLSLLLSSLSSSLLSLSLSSLLLSLSLSLSLLSS ...L........S.........L......S.....S 2=8 14=15 20=21 34=35",
  "cdb5f699 5 3 SSLSLLSLLSLSLLSLSSLSSLSLSSLSLLLLSLSS .........S.S.L..S................... 3x4 5x11 8x9 14=20 19=25 34=35",
  "7b62bc5b 6 4 SLSLSLSSLSLLLSSLLSLLSLSSSLLSSLLSLSLS S.......L....................L...S.. 6x12 7=13 13=14 32x33",
  "ecd8335d 7 6 LSLLSSLSSLSLSLSSLLSLLSLSLSLLSSSLSSLL ................L.....L.L........S.. 7=8 21x27 23=29 32=33",
  "3c2fb323 1 0 SLLSSLLSLSLSSLSLLSSLLSSLLSSLSLLSSLLS .L...L.........LL......LL..........S 12=18 18x19 24=30 27=33 29x35 31=32",
  "4753abc6 2 0 LSLSSLLLSLSSSSLSLLLSSLLSSLSLSLSLLSLS .....L.....S............S.S..L...... 1x7 4x5 10=11 15x21 22x23 28x29",
  "53fb4ea6 3 1 SLSLLSLSLLSSLSLSSLSLSLLSSLSSLLLSLSSL .........L............L.....L..S.... 4x5 19=25 21=22 23x29 32x33",
  "70c3a920 4 2 LSLSSLSLSLSLSLLSLSLSSLSLLSSLLSSLLSLS .....L...........S...LS.........L... 6=12 7x8 11x17 19=20 25=26 26x32",
  "1d65e570 5 3 SSLSLLLSLSLSLLSLSSSSLSLLSLSLSLLLSLSS .....L.......L..............S.....S. 6=12 16x22 18=24 25=31 27x28 32x33",
  "e2a31905 6 4 SSLLSLSLLSLSLLSLSSLSLSSLSLSSLLLSSLLS ...............L......S........S...S 0=6 9x10 10x11 13x14 26=32",
  "42b74591 7 5 LLSSLSSLSSLLLSLLSSSLLSLSLSSLSLSSLLSL .L...........S....S.L............... 0x6 12x18 16=17 28=34 29=35",
  "1bd757cf 1 0 LSLSLSSLSSLLLSLLSSSLSSLLSLSLSLLSLLSS L...L.......L...S.........S...LS.... 0x1 3x4 8=9 12x13 16x22 22x28 23=29",
  "7df08b95 2 0 LLSSLSSLLSSLLSSLLSSSLSLLLLSLSSSSLLSL ........L.......L........L...S.....L 2x8 3=9 13=19 19x25 22=23",
  "568662d0 3 1 SLLSLSSLLSLSLSSLSLSLSSLLLSLLSSLSSLSL ........L...L....L.L.......L.....L.. 0=6 22=23 28=34 30x31 32x33",
  "96b95fff 4 2 LSLSSLLSLSLSSLSLSLLSSLLSSLLSSLSLSLLS .....L................L......LS..L.. 0=6 2=8 4x10 15=21 24=30",
  "b724c4fd 5 3 SSLLSLSLLSSLLSSLLSLSSLSLSLLSLSLLSSLS .............S...S..S..L............ 3x9 4x5 10x11 24x30 29=35 30=31",
  "0fca8ea4 6 4 SLLSLSLLSSLSLSSLSLSSLLSLSLLSLSLSSLSL ....L......S......S..L.............. 1=2 1=7 12x18 25x31 26x27",
  "13aee495 7 5 SLSSLLLSLLSSSSLLSLSLSSLLLLSLSSLSLSLS ......LS.......................S.S.. 2=3 5x11 12=13 22=23 24=30",
  "19d59ac0 1 0 SLLSLSLSSLSLSLSLSLLSLSLSSLLSSLLSSLLS S........L...L.L..L.......L........S 4x5 10=16 12x13 15x16 29x35 31=32",
  "c8a9df96 2 0 LSSLLSSLSLSLSSLSLLLSLSLSLLSLSSSLLSSL ..S....L.L.................L......S. 13x14 13=19 22x23 24=25 33=34",
  "9700f2ff 3 1 SSLSLLSSLLSLLLSSLSSLSLSLLSLSLSLLSLSS .S....S.L.S.......................S. 0=1 9x10 13=19 17x23 22x23 27x33",
  "2642e9b5 4 2 SSLLSLSSLSLLLLSSLSLSSLSLSLLSLSLLSLSS .S......L...........S....L.......... 10=11 12=13 15x21 24x30",
  "5ea11c35 5 3 LSLSSLSLLSLSLLSLSSLSSLSLSSLSLLSLSLLS .S......L.................L.......L. 0x6 3=4 6x7 9x10 12=13",
  "3b7b525b 6 4 SLSLLSSSLSLLLSLSSLSLSLLSLLSLSSLSLSSL ..........L............S......L....L 7=13 8=14 15=16 22x23 28=29",
  "0fe46504 7 5 SLSLSLSLSSLLLSLSLSSSLLSLLLSSLSLSLLSS .....LS.........L...............L... 1=7 9=15 24=30 26=27 26x32",
  "3d92cd05 1 0 SLSLSLLSLSSLLSLSLSSLSLSLSLSLLSLSLSLS ..S....S.......S.S.LS.S..L.......... 0x1 4=10 11x17 12x18 18=24 25x26",
  "df372e15 2 0 SLSLLSLLSSLSSSLLSLSSLSLLLLSLSSLSLSSL S.........L.S...S..........L.S...... 1=7 5=11 6=7 21x22 26x27 27x33",
  "e9f7f2b9 3 1 LSSLSLLSSLLSSLLSSLSLSLLSLSLSSLSLLSLS ......L..L..............L....L....L. 0=6 3=9 11x17 15=16 15x21 34x35",
  "f999fa4b 4 2 LSSLLSSSLLSLSLSSLLLLSSLSLSLLSSSLLSSL .S..L........L.....L............L... 15=21 22x23 28=29 28=34",
  "5e3885a7 5 3 SLLSSLSSLSLLLSSLLSSLLSSLLSSLLSLLSLSS ..L.......L..........S.L............ 6=7 11x17 16x22 22x23 24=30 28x29",
  "2f8d9923 6 4 SLLSLSLSLSSLLSSLSLSLSLLSSSLSLLLLSLSS ..L..S.............L..L............. 3=9 7=13 28=29 30=31",
  "065179b4 7 5 LSLLSSLSSLSLSLLSLSLLSLSSSSLSLLSLSSLL ............S.............LS.......L 2x8 4=10 5x11 9x10 24=25",
  "088f1f2e 1 0 SLSSLLSLSSLLLSLLSSLSLSLSSLSLSLLSLLSS ..........L.L.L..........LS.S.....S. 4=5 9x10 18x24 20x26 24x30 28x29 30x31",
  "13dcee4c 2 0 LSLSLSSLSSLLLSLLSSSLSLSLSLLSLSLSSLSL L....S..S......L.....L........L..... 7x13 13x14 16=22 18=24 26x27 26x32 30x31",
  "64f11003 3 1 LSSLSLLSLSSLSLSLLSSSLLSLLLSSLSSLLSLS .....L.....L......S...S.......S..... 3x9 9=10 9x15 13x14 18=19",
  "e23f37ce 4 2 LLSSLSLSLLSSSSLSLLLLSLSSSSLLSLSLSSLL .L.S...........S..............S..S.. 14x15 16=17 17x23 18x24 32=33",
  "c87dd5c5 5 3 SLSSLLLSSLLSSSLLSLSLLSLSLLSLSSLSLSSL ..S..............LS........L........ 0x1 3x4 9=15 28=34 33=34",
  "896793fe 6 4 SLSSLLSLLSSLLSSLLSLSLLSSSLSSLLLSLLSS .L......L....S...................L.. 13=19 17=23 22=23 24x30 34=35",
  "df13ddca 7 6 LSLSLSLSLSSLSLSLSLLLSSLSSSLLSLSLSLLS .S..............S.................L. 3=9 11=17 12x18 15x16 24=25",
  "d5c56531 1 0 SLLSLSSLLSLSLSSLSLLLSSLSSSLLSLLSSLSL S.....S........L.L....L........SS... 4=10 9x15 11x17 25x26 25=31 27x28 28x29",
  "726792e0 2 0 SSLSLLSLSLSLLSLSLSLSLSSLSLSLLSLLSLSS .....L....SL.S....L...............S. 15x16 17x23 19x20 24x25 32x33",
  "6140751c 3 1 LLSLSSSLSLSLSSLSLLLSLSLSLLSLSSSSLSLL .....S........L.L........L.......... 1=7 11=17 19x20 22x23 28=29 28x34",
  "943b5aaa 4 2 SLSSLLLSLLSSLSLSSLSLSLLSSLSSLLLSLLSS ......L.......L........S.L.......... 0x1 6=12 8=9 30x31 32=33",
  "fead5d29 5 3 SSLLSLSSLLSLLLSSLSLLSSLSSSLLSLLLSSLS S.....S...S.....................S... 1=7 13=19 15x16 16=22 18=19 27x33",
  "e06d2a78 6 4 SLLSSLLLSLSSLSLSLSSLSSLLSSLLSLLSSLLS .L..S...............S............L.. 1=2 10=11 14x15 18=24 26=27",
  "ee7b6424 7 5 LSLSSLSLLSSLLSSLLSSSLSLLLLSLSSSLSLLS ............L.....S..............LL. 0x6 5=11 13=14 16=22 25=31",
  "8370027a 1 0 LSSLSLSLSSLLLSLLSSSLSLLSSLLSSLLSLSLS ..S..LS....L...L.............L..L... 0x6 2x3 6x7 10=11 15=21 31x32",
  "4e52b80e 2 0 LLSSLSLLSLSSSSLSLLLSLSSLSLSLLSSSLLSL L...L.L...S..S...................... 2=8 3x4 10x16 13=19 18x19 20x21 26x32 29x35",
  "30365446 3 1 LSLLSSLSSLLSSLLSSLLSLSLSSLSLSLSLSSLL ...L......L..L...........L......S... 9=10 19x20 22x28 28x29 28x34 30x31",
  "7b5683f3 4 2 LSLSLSSSLLSLSLSLSLLSLSLSSLSLSLLLSSLS ................SL..........S.LL.... 1=7 6=7 10x11 21x22 24x25",
  "b0f90ec2 5 3 SLSLLSSLSLLSLSLSSLSSLSLLLLSLSSLSLSSL S...L..............S.............S.. 0=6 2=8 12x18 17=23 22=23",
  "8d136d2d 6 4 SLSSLLSLSLSLLSLLSSSLLSLSLSSLSLLSLSLS ........S....S.L..................L. 1=7 2=3 12x13 19=20 30x31",
  "78ce8c4a 7 6 LSLLSSSLLSLSSLSSLLLSSLSLLSLSLSSLSLSL ....SS..................L........... 0x1 6=12 7=8 27x28 34x35",
  "8442d322 1 0 SLSSLLLSLSLSSLSLSLLSLSLSSLSLSLLSLLSS .L......L...S.........L.S.S..L...... 6x12 7x13 8x9 13x14 15x16 21x27 29x35 34=35",
  "09af2d51 2 0 SSLLSLSLLSLSLLSSLSSSLLSLLSSLSLLLSSLS ..LL.L..L.........................L. 1x7 5x11 10=16 12=13 12x18",
  "1407b33f 3 1 SSLLSLLLSSLSLSLSSLSLSLSLLSLSLSSLSLLS ..........L.....S..L...........L.... 6=7 8x14 15=16 21x22 27x28",
  "59a987de 4 2 SSLSLLSSLLSLLLSLSSSSLSLLLLSLSSLLSSLS ..L.................L..L.........S.. 1=7 3x4 6=7 10=16 14x15 29=35",
  "5108e8ab 5 3 SSLSLLSSLLSLLLSLSSSLSSLLLSLSLSLLSLSS .....L..L.S.......................S. 2=8 13=19 17x23 22=28 24=30",
  "be0fafa8 6 4 SLLSSLLSLSLSLSSLSLSLLSSLLSSLLSSLSLLS ............L....L.....LL........... 3=9 7x8 14x20 29=35 33=34",
  "13c569af 7 5 LSLSSLSLLSLSLSSLSLSLSLLSSSLSLLLLSLSS .S........L...................LL.... 3=4 7=8 7x13 21=22",
  "1c4e28c7 1 0 SLLSSLLSSLSLSLSLLSSSLSLLLLSLSSLSLSLS ...S........S.SL..S.............L..S 0x1 2x3 2x8 16=22 25x26 31x32 32x33",
  "e04fe276 2 0 SLLSSLSLSLSLLSSLLSLSLSLSSLSLSLLSLSLS .L.....L......S.L.........S......S.. 3=4 5=11 12=18 17=23 28x34",
  "e3f68227 3 1 SLSLLSLSSLSLSLLSSLSLSLLSLSLSSLLSLSLS ..S......L...L.S............S....... 0x6 8x14 9x10 10=16 12=18 19x20",
  "f14c79cf 4 2 SLLSLSLLSLSSSSLLSLSLSSLLLSLSLSLSSLSL ...S.............L......LS.......... 1=2 10=11 12=13 16x17 21=27",
  "d40c929b 5 3 LSSLSLLLSSLSSSLLSLSLLSLSLLSLSSSSLSLL .S........L...L.......L............. 1=2 15x16 16x17 18x24 21x27 34=35",
  "8ce81d7d 6 4 SSLSLLLSSLLSLLSLSSSSLSLLLLSLSSSLLSSL ......L.....L...........L..L........ 1=7 5x11 9=15 27x28 34x35",
  "eb3742b1 7 5 LLSLSSLSSLLSSSLSLLLLSLSSSSLSLLSLLSSL .................L.L....S........S.. 0=6 4=5 4x10 22=23 33=34",
  "1ed970e6 1 0 LSLSLSSLSLSLSLLSLSLSSLSLSLSLLSLSLSSL L.L......L....L...L....L........L... 3x4 3x9 4x10 16x17 31x32 32x33 33=34",
  "c54242f3 2 0 SLSLSLLSSLLSLSLSLSSLLSSLSLSLLSLSLSSL S..L.......S.S..L..........L........ 0x1 2=8 9x15 13x19 25x26 26x32 33=34",
  "50fee8d4 3 1 LSLLSSSSLSLLLLSLSSSSLSLLSLSSLLLLSLSS .............L..S..S.........L....S. 0x1 1=7 4x10 9x15 18=19",
  "871a39f1 4 2 SLSLLSSLSSLLLSLLSSSLSSLLLSLSSLLSLLSS S........S....L..................L.. 2=8 20=21 24=30 29x35",
  "32c255d9 5 3 LSSLSLSSLLSLSLLSLSLSSLLSSLLSSLLLSSLS ............S....S.....S..L......... 0x1 6=12 10x16 25=31",
  "2919c90b 6 4 LLSSLSSLLSLSSSLLSLLSSLSLSLLSLSLSSLSL .....S.....S..........S..........L.. 3=9 8=14 20x21 22x23 31=32",
  "59ce73ba 7 5 SSLSLLLSSLLSLLSLSSSSLSLLSLLSSLLLSLSS ...S...S...............L.L.......... 0=1 4=5 27=28 29x35",
  "2925516d 1 0 LLSLSSSSLSLLLSLSSLSLSLLSSSLSLLLLSLSS LL..S............L...........LLL.... 0x6 6x12 19x25 21x27 26x32 28=29",
  "99ed369a 2 0 SLLSSLSLSLSLLSLSLSSLLSLSLSSLSLLSSLLS ....S.S....L..L.........L........... 3x9 8x9 14=20 22x23 28x34 31=32 33=34",
  "a6b088af 3 1 LLSSLSLSLSLSSLSLSLLLSLSSSSLSLLSSLLSL ...S.........L......S......S.......L 8x9 13x14 17x23 28=29 32=33",
  "f2417bfd 4 2 LSLSLSLSSLSLSLSSLLSLLSLSLSLLSSSLSLSL .....S..S.....S.......L............. 1x2 4x10 7x13 27=33",
  "090d41cb 5 3 LLSLSSLLSLSSSSLSLLLSLSSLSLSLLSSSLSLL .........L...S......L............S.. 16=17 21=22 24x25 25x26 30=31 34=35",
  "623c0a49 6 4 SLSLLSSSLSLLLSLSSLSLSLLSLSLSSLLLSLSS ........L.....L.S................L.. 3x9 11=17 24=30 34=35",
  "4964e357 7 5 SLLSSLLLSLSSLSLSLSSLSLSLLSSLLSSSLSLL ................L..L......S......... 6=12 12x13 21x22 25=31 29x35",
  "e84bb9ca 1 0 SLLSLSLSLSLSSLSLSLSLSLLSLSLSSLLSSLSL ......L......L.LS..........S.L.S.... 13=19 18x19 18x24 21x27 26x32 28=34",
  "fd878db6 2 0 SSLSLLLSLLSSSLSLSLLSLSLSSLSSLLLLSLSS ............S.S.........S..S....S... 0=1 1=7 10=16 14x15 15x21 18x19 20x26 21x22",
  "e08c1ea6 3 1 LLSSLSSLLSSLLSSLLSSLSSLLLSLLSSSSLLSL ....L.......L..L....SS.............. 4x10 5x11 10x16 18x19 23x29 32=33",
  "785642c3 4 2 SLSSLLLLSSLSSSLLSLLLSSLSLSLLSSSSLLSL .....L..........SL..........S.....S. 2=8 7x8 20=21 25=31 34x35",
  "740f772b 5 3 LSSLSLSLSLSLLSLSLSSLLSLSSLSLSLLSLSLS .....LS......S..................L... 4=10 8x14 9x10 16=22 18=24 19=20",
  "eae50a6b 6 4 LSLSSLSLLSLSLLSLSSSSLSLLSLSLSLLSSLLS ....S.............S.....S..L........ 1x2 2=8 7=13 14x20 33=34",
  "df14c3fc 7 5 SSLLSLSLLSLSLSSLSLLSSLSLSLLSLSLLSSLS ...L....L.L...................L..... 0=1 13=19 19=20 21x22 28=34",
  "a140fa96 1 0 LSLLSSLSLSLSSLSLSLLSSLSLSLLSLSSLSSLL ..LL......L...S........L....L..L.... 10x16 12x13 13x14 21x22 24=30 30x31 34=35",
  "0090ca23 2 0 SSLSLLSLLSLSLLSLSSLSLSSLSLSLLSLSSLSL SS................L.........LSL..... 9x15 16=22 21=22 22x28 29x35 34x35",
  "f8acc46e 3 1 SLSSLLSLLSLSLSSLSLSLLSLSLSLLSSLSSLSL ....L...L....S...L..............S... 0x1 4=10 5x11 7x13 26=27",
  "ac6bb7f6 4 2 LSLSLSSLSLLSLSLSSLSLLSSLSLSLLSLSSLSL ......S.................S...L.....S. 3x4 9=10 16=22 18=24 27=33",
  "11792d9d 5 3 SSLLSLSLLSSLLLSSLSLSLLSSSLSSLLLSSLLS .....L........S.............LL...... 1x2 1x7 11x17 15x21 24x25 31=32",
  "a4b6008c 6 4 SLSLLSSSLSLLLSSLSLSLLSLSLSLSSLLLSLSS .....S...S..............L.L......... 0=6 3x9 7=13 8x14 11=17",
  "4d9fccf4 7 5 SLLSLSSSLLSLLSSLLSSLLSSLLLSSLSLSSLSL S........L.....L.................... 5x11 16x22 21=22 24=30 26=27",
  "88f644f6 1 0 LSSLSLSLSLLSLSLSSLLSLSSLSLSLLSSLLSLS .....L...L...S....LS.S.L......S..... 5x11 10x11 11x17 13x14 18x24 27x33",
  "ad433e6b 2 0 LSSLLSLLSLSSSSLSLLLSLSLSSLSLSLSLLSSL ..........S...........L.S....L..L..L 1x7 12x18 15=21 21x22 25=31 26x27",
  "679aa8ab 3 1 LSLSLSLSLSSLSLSLLSSSLSLLLLSLSSSLSLSL ...........LS...........L......L.... 1x2 4x10 9=10 15x21 25=31 29x35",
  "368c0b35 4 2 LSLLSSLSSLLSSLLSSLLSLLSSSLSSLLSLSSLL .........L..S.....L...............L. 0x1 2=3 15=16 20=21 22=23",
  "993d2fc0 5 3 SLSLLSLSSLLSLSLSSLSLLSSLSLSLLSLSLSSL S..L....S.....................L..... 4=10 9=10 15=21 17=23 19=25",
  "b66e3be1 6 4 SLSLLSLLSLSSLSLSSLSSLSLLSLSLLSLSLSSL ..........S..S.........L..........S. 2=8 5=11 13=19 18=24 29x35",
  "bbc6b608 7 5 LSLLSSSLSLLSSLSSLLLSLSSLSLSLLSLSLSSL ...L.............L.....L......L..... 1x7 4=5 22x28 25x26",
  "268ddfdf 1 0 SLSSLLLSSLSLSLLSLSSLSLSLLSLSLSLSLLSS .......SS......S..S.......LS...S.... 4=5 11x17 15x16 21x22 23x29 25x26 28x34",
  "30c58655 2 0 LLSLSSSLLSSLLSSLLSSLSLSLLSLSLSSSLSLL ...L.......L..........S...L....S.... 2x8 6x7 6x12 12x18 18x19 25x26 30=31",
  "761811c8 3 1 SLSSLLLSLLSSSLLSSLLSSLLSLSLSLSSLSLSL ...S.L.............SS..S............ 2x8 8=9 19=25 23=29 26x27 31x32",
  "5e4e5825 4 2 SLLSSLSSLLSLLLSSLSSLSLLSLSLSSLLSSLLS ..........S..........L..L...S....... 0=6 3=4 6=7 24=30 27x33",
];
// @banc:sfarsit

/** Bancul, ca obiecte { id, nivel, blocaje, sol, fixe, semne }; poziția i = ziua START + i. */
export const BANC = BANC_BRUT.map((rand) => {
  const [id, nivel, blocaje, sol, fixe, ...semne] = rand.split(" ");
  return { id, nivel: Number(nivel), blocaje: Number(blocaje), sol, fixe, semne: semne.join(" ") };
});
