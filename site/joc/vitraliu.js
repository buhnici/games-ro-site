// ==== Vitraliul — logica pură (v1, 17.10.2026) ====
// Un puzzle pe zi: rotești bucățile de vitraliu ca lumina din rozetă să ajungă în toată fereastra,
// fără capete de canal lăsate în gol. Fără DOM — testat în Node (games/teste/vitraliu.test.mjs).
//
// Fiecare celulă e o mască de 4 biți: N=1, E=2, S=4, V=8 (canalele de lumină spre vecini).

export const N = 1, E = 2, S = 4, V = 8;
/** [bit, dRând, dColoană, bitul opus] */
export const DIRECTII = [[N, -1, 0, S], [E, 0, 1, V], [S, 1, 0, N], [V, 0, -1, E]];
export const START = 20261017;                       // ediția #1
/** Mărimea după ziua săptămânii (getUTCDay: 0 = duminică): luni ușor → duminică greu. */
export const MARIMI = [8, 5, 5, 6, 6, 7, 7];
export const CULORI = 6;                             // câte sticle colorate are paleta paginii
export const MOTIVE = 4;                             // 0 = simplu, 1 = romb, 2 = steluță, 3 = cruciuliță

/* ─── Numere pseudo-aleatoare deterministe ─── */
export function mulberry32(a) {
  let t = a >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash2(a, b) {
  let h = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b | 0) + 0x632be5ab, 0xc2b2ae35);
  h ^= h >>> 16; h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15; h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/* ─── Măști ─── */

/** Rotire în sensul acelor de ceasornic, de k ori (N→E→S→V). */
export function roteste(m, k = 1) {
  k = ((k % 4) + 4) % 4;
  for (let i = 0; i < k; i++) m = ((m << 1) | (m >> 3)) & 15;
  return m;
}
export const grad = (m) => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1);
/** De câte apăsări (în sensul acelor) e nevoie ca `din` să devină `spre` (sau -1). */
export function pasiPana(din, spre) {
  for (let k = 0; k < 4; k++) if (roteste(din, k) === spre) return k;
  return -1;
}

/* ─── Lumina ─── */

/**
 * Lumina pornește din rozetă, intră în celula-sursă prin latura de nord și curge pe canalele
 * care se potrivesc de ambele părți. Întoarce adâncimea fiecărei celule (-1 = în umbră).
 */
export function lumina(masti, n, sursa) {
  const ad = new Int16Array(n * n).fill(-1);
  if (!(masti[sursa] & N)) return ad;
  const coada = [sursa];
  ad[sursa] = 0;
  for (let i = 0; i < coada.length; i++) {
    const c = coada[i], r = (c / n) | 0, k = c % n;
    for (const [bit, dr, dc, opus] of DIRECTII) {
      if (!(masti[c] & bit)) continue;
      const rr = r + dr, kk = k + dc;
      if (rr < 0 || rr >= n || kk < 0 || kk >= n) continue;
      const v = rr * n + kk;
      if (ad[v] === -1 && (masti[v] & opus)) { ad[v] = ad[c] + 1; coada.push(v); }
    }
  }
  return ad;
}

/** Capete în gol: canale care dau în ramă sau într-un vecin fără canal corespunzător. */
export function capeteLibere(masti, n, sursa) {
  let libere = 0;
  for (let c = 0; c < n * n; c++) {
    const r = (c / n) | 0, k = c % n;
    for (const [bit, dr, dc, opus] of DIRECTII) {
      if (!(masti[c] & bit)) continue;
      if (c === sursa && bit === N) continue;          // intrarea din rozetă
      const rr = r + dr, kk = k + dc;
      if (rr < 0 || rr >= n || kk < 0 || kk >= n || !(masti[rr * n + kk] & opus)) libere++;
    }
  }
  return libere;
}

/** Rezolvat = toată fereastra în lumină și niciun canal în gol. Orice așezare care respectă asta e bună. */
export function rezolvat(masti, n, sursa) {
  const ad = lumina(masti, n, sursa);
  for (let c = 0; c < n * n; c++) if (ad[c] < 0) return false;
  return capeteLibere(masti, n, sursa) === 0;
}

/* ─── Generatorul ─── */

/**
 * Un arbore de acoperire aleator (Prim randomizat) pornit din celula de sub rozetă, cu puține
 * răscruci în 4. Apoi fiecare bucată e rotită la întâmplare. Determinist pe seed.
 */
export function genereaza(seed, n) {
  const rnd = mulberry32(seed);
  const sol = new Uint8Array(n * n);
  const sursa = Math.floor(n / 2);
  const in_ = new Uint8Array(n * n);
  in_[sursa] = 1;
  const frontiera = [];
  const adauga = (c) => {
    const r = (c / n) | 0, k = c % n;
    for (const [bit, dr, dc, opus] of DIRECTII) {
      const rr = r + dr, kk = k + dc;
      if (rr < 0 || rr >= n || kk < 0 || kk >= n) continue;
      if (!in_[rr * n + kk]) frontiera.push([c, rr * n + kk, bit, opus]);
    }
  };
  adauga(sursa);
  sol[sursa] |= N;                                     // intrarea luminii
  while (frontiera.length) {
    const i = Math.floor(rnd() * frontiera.length);
    const [a, b, bit, opus] = frontiera[i];
    frontiera[i] = frontiera[frontiera.length - 1];
    frontiera.pop();
    if (in_[b]) continue;
    // răscrucile în 4 și ramurile în 3 sunt rare: altfel puzzle-ul devine o supă de cruci
    const g = grad(sol[a]);
    if ((g >= 3 && rnd() < 0.9) || (g === 2 && rnd() < 0.3)) {
      if (frontiera.some((f) => f[1] === b && f[0] !== a) || g < 3) { frontiera.push([a, b, bit, opus]); continue; }
    }
    sol[a] |= bit; sol[b] |= opus; in_[b] = 1;
    adauga(b);
  }

  // amestecul: fiecare bucată rotită 0–3 ori, dar destule bucăți chiar mutate
  const start = new Uint8Array(n * n);
  for (let incercare = 0; incercare < 20; incercare++) {
    let mutate = 0, rotibile = 0;
    for (let c = 0; c < n * n; c++) {
      start[c] = roteste(sol[c], Math.floor(rnd() * 4));
      if (roteste(sol[c], 1) !== sol[c]) { rotibile++; if (start[c] !== sol[c]) mutate++; }
    }
    if (mutate >= rotibile * 0.65 && !rezolvat(start, n, sursa)) break;
  }

  // sticla: culori fără vecini identici (sus/stânga), motive populare rare
  const culori = new Uint8Array(n * n), motive = new Uint8Array(n * n);
  for (let c = 0; c < n * n; c++) {
    const r = (c / n) | 0, k = c % n;
    let x;
    do x = Math.floor(rnd() * CULORI);
    while ((r > 0 && culori[c - n] === x) || (k > 0 && culori[c - 1] === x));
    culori[c] = x;
    motive[c] = rnd() < 0.45 ? 1 + Math.floor(rnd() * (MOTIVE - 1)) : 0;
  }

  let ideal = 0;
  for (let c = 0; c < n * n; c++) ideal += pasiPana(start[c], sol[c]);
  return { n, sursa, sol, start, culori, motive, ideal };
}

/* ─── Ziua ─── */

const dinZi = (zi) => new Date(Date.UTC(Math.floor(zi / 10000), Math.floor((zi % 10000) / 100) - 1, zi % 100));
export const ziSaptamana = (zi) => dinZi(zi).getUTCDay();
export function zileDeLaStart(zi) {
  return Math.round((dinZi(zi) - dinZi(START)) / 86400000);
}
export const editia = (zi) => Math.max(1, zileDeLaStart(zi) + 1);
export function puzzleZilei(zi) {
  const n = MARIMI[ziSaptamana(zi)];
  return { ...genereaza(hash2(zi, 0x7172), n), editie: editia(zi) };
}

/* ─── Text ─── */

export function formatTimp(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}
/** „1 rotire” / „19 rotiri” / „20 de rotiri”. */
export function plural(n, unu, multe) {
  if (n === 1) return `1 ${unu}`;
  const de = (n % 100 === 0 && n > 0) || n % 100 >= 20 ? "de " : "";
  return `${n} ${de}${multe}`;
}
export function textScor(editie, n, rotiri, ideal, sec) {
  return `Vitraliul #${editie} · ${n}×${n}\n${plural(rotiri, "rotire", "rotiri")} (ideal ${ideal}) · ${formatTimp(sec)}`;
}
/** Rândul de emoji pentru share: o fereastră mică aprinsă, cu stele pentru cât de aproape de ideal. */
export function grilaShare(rotiri, ideal) {
  const r = ideal > 0 ? rotiri / ideal : 1;
  const stele = r <= 1.05 ? 3 : r <= 1.5 ? 2 : 1;
  return `⛪ ${"🌟".repeat(stele)}${"✨".repeat(3 - stele)}`;
}
