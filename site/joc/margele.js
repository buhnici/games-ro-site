// ==== Mărgele — logica pură (v1, 18.10.2026) ====
// Un șirag de mărgele se rostogolește pe un traseu spre fântână; tragi mărgele în el și faci grupuri
// de minimum trei de aceeași culoare. Traseele, lanțul, inserția, potrivirile și atracția dintre
// bucățile rupte stau aici, fără DOM — testate în Node (games/teste/margele.test.mjs).
//
// Lumea are 600 × 660 de unități; pagina o scalează pe ecran.

export const LUME_L = 600, LUME_H = 660;
export const D = 30;                     // diametrul unei mărgele
export const PAS = 2;                    // pasul de eșantionare al traseului
export const V_ATRAGERE = 520;           // cât de repede se întoarce o bucată atrasă de aceeași culoare
export const V_PROIECTIL = 1100;
export const MIN_GRUP = 3;
export const CULORI_MAX = 6;
const ATINS = 0.6;                       // toleranța la „se ating”

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

/* ─── Traseele ─── */

/** Spirală arhimedică cu o intrare dreaptă din afara ecranului. */
function spirala({ cx, cy, rOut, rIn, ture, unghi0, sens }) {
  const p = [];
  const intrare = rOut + 140;
  p.push([cx + Math.cos(unghi0) * intrare, cy + Math.sin(unghi0) * intrare]);
  const N = 2400;
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = unghi0 + sens * t * ture * Math.PI * 2, r = rOut - (rOut - rIn) * t;
    p.push([cx + Math.cos(u) * r, cy + Math.sin(u) * r]);
  }
  return p;
}

/** Serpentină pe rânduri (opțional ondulate), intrând din stânga sau din dreapta. */
function serpentina({ randuri, y0, dy, xL, xR, unda, oglinda, xFinal }) {
  const p = [];
  const fx = (x) => (oglinda ? LUME_L - x : x);
  const val = (x, k) => (unda ? Math.sin((x / 150) * Math.PI + k) * unda : 0);
  const r = dy / 2;
  for (let k = 0; k < randuri; k++) {
    const y = y0 + k * dy, spreDreapta = k % 2 === 0;
    const x0 = k === 0 ? -70 : spreDreapta ? xL : xR;
    const x1 = k === randuri - 1 ? xFinal : spreDreapta ? xR : xL;
    const pasi = Math.ceil(Math.abs(x1 - x0) / 2);
    for (let i = 0; i <= pasi; i++) {
      const x = x0 + ((x1 - x0) * i) / pasi;
      p.push([fx(x), y + val(x, k)]);
    }
    if (k < randuri - 1) {                      // întoarcerea în U spre rândul următor
      const cxu = spreDreapta ? xR : xL, cyu = y + r, yv = val(cxu, k), yv2 = val(cxu, k + 1);
      for (let i = 1; i < 90; i++) {
        const u = -Math.PI / 2 + (i / 90) * Math.PI;
        const x = spreDreapta ? cxu + Math.cos(u) * r : cxu - Math.cos(u) * r;
        p.push([fx(x), cyu + Math.sin(u) * r + yv + (yv2 - yv) * (i / 90)]);
      }
    }
  }
  return p;
}

export const TRASEE = [
  { nume: "Spirala", tragator: { x: 300, y: 335 }, puncte: () => spirala({ cx: 300, cy: 335, rOut: 282, rIn: 112, ture: 2.05, unghi0: -Math.PI / 2, sens: 1 }) },
  { nume: "Serpentina", tragator: { x: 300, y: 585 }, puncte: () => serpentina({ randuri: 4, y0: 70, dy: 106, xL: 70, xR: 530, unda: 0, oglinda: false, xFinal: 170 }) },
  { nume: "Vârtejul", tragator: { x: 300, y: 335 }, puncte: () => spirala({ cx: 300, cy: 335, rOut: 282, rIn: 118, ture: 2.3, unghi0: 0, sens: -1 }) },
  { nume: "Dealurile", tragator: { x: 300, y: 590 }, puncte: () => serpentina({ randuri: 4, y0: 72, dy: 108, xL: 72, xR: 528, unda: 16, oglinda: true, xFinal: 160 }) },
];

/** Reeșantionează o linie frântă la pas constant de lungime (pentru poziționare rapidă pe arc). */
export function construiesteTraseu(puncte, pas = PAS) {
  const cum = [0];
  for (let i = 1; i < puncte.length; i++) cum.push(cum[i - 1] + Math.hypot(puncte[i][0] - puncte[i - 1][0], puncte[i][1] - puncte[i - 1][1]));
  const L = cum[cum.length - 1];
  const n = Math.floor(L / pas) + 1;
  const xs = new Float32Array(n), ys = new Float32Array(n);
  let j = 0;
  for (let k = 0; k < n; k++) {
    const s = k * pas;
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const f = (s - cum[j]) / Math.max(1e-9, cum[j + 1] - cum[j]);
    xs[k] = puncte[j][0] + (puncte[j + 1][0] - puncte[j][0]) * f;
    ys[k] = puncte[j][1] + (puncte[j + 1][1] - puncte[j][1]) * f;
  }
  return { xs, ys, L: (n - 1) * pas, n, pas };
}

/** Poziția și tangenta la distanța s pe traseu (în afara capetelor: prelungire în linie dreaptă). */
export function pozitie(tr, s) {
  const { xs, ys, n, pas } = tr;
  let i = Math.floor(s / pas);
  if (i < 0) i = 0;
  if (i > n - 2) i = n - 2;
  const dx = xs[i + 1] - xs[i], dy = ys[i + 1] - ys[i], d = Math.hypot(dx, dy) || 1;
  const f = (s - i * pas) / pas;
  return { x: xs[i] + dx * f, y: ys[i] + dy * f, ux: dx / d, uy: dy / d };
}

/* ─── Nivelurile ─── */

/** Dificultatea crește din nivel în nivel: mai multe culori, mai multe mărgele, viteză mai mare. */
export function configNivel(nivel) {
  const k = (nivel - 1) % TRASEE.length;
  const runda = Math.floor((nivel - 1) / TRASEE.length);
  const baza = [[4, 50, 22], [4, 60, 24], [5, 66, 26], [5, 74, 28]][k];
  return {
    traseu: k,
    culori: Math.min(CULORI_MAX, baza[0] + runda),
    bile: baza[1] + runda * 12,
    viteza: Math.min(48, baza[2] + runda * 5),
  };
}

/** Viteza motorului: un sprint la începutul nivelului, apoi croaziera; frânează puțin lângă fântână. */
export function vitezaLant(cfg, capS, L, sprint) {
  if (sprint && capS < 0.22 * L) return 320;
  return capS > 0.82 * L ? cfg.viteza * 0.65 : cfg.viteza;
}

/** Culorile șiragului: niciodată trei la rând de aceeași culoare la pornire (altfel ar dispărea singure). */
export function genereazaCulori(seed, n, k) {
  const rnd = mulberry32(seed);
  const out = [];
  for (let i = 0; i < n; i++) {
    let c;
    if (i > 0 && rnd() < 0.42 && !(i > 1 && out[i - 1] === out[i - 2])) c = out[i - 1];
    else do c = Math.floor(rnd() * k); while (i > 1 && out[i - 1] === out[i - 2] && c === out[i - 1]);
    out.push(c);
  }
  return out;
}

/* ─── Lanțul ─── */
// bile[0] e capul (cel mai aproape de fântână, s mare), ultima e coada. s < 0 = încă în afara traseului.

export function creeazaLant(culori) {
  return { bile: [], coada: culori.slice(), idUrm: 1 };
}

const atinse = (a, b) => a.s - b.s <= D + ATINS;

/**
 * Un pas de timp: apar mărgele noi la coadă, motorul împinge coada, bucățile despărțite de o pereche
 * de aceeași culoare se trag înapoi, contactul împinge tot ce e în față. Întoarce id-urile mărgelelor
 * în dreptul cărora s-a închis o ruptură (acolo pagina verifică o potrivire în lanț).
 */
export function avanseaza(lant, dt, viteza) {
  const b = lant.bile;
  // 1. mărgele noi
  while (lant.coada.length && (b.length === 0 || b[b.length - 1].s >= 0)) {
    const s = b.length ? b[b.length - 1].s - D : -D;
    b.push({ c: lant.coada.shift(), s, id: lant.idUrm++ });
  }
  if (!b.length) return [];
  // 2. motorul împinge coada
  b[b.length - 1].s += viteza * dt;
  // 3. atracția: o bucată din față se întoarce dacă la ruptură stau două mărgele de aceeași culoare
  const inchideri = [];
  for (let i = 0; i < b.length - 1; i++) {
    const gol = b[i].s - b[i + 1].s - D;
    if (gol <= ATINS || b[i].c !== b[i + 1].c) continue;
    let j = i;
    while (j > 0 && atinse(b[j - 1], b[j])) j--;
    const mutare = Math.min(gol, V_ATRAGERE * dt);
    for (let k = j; k <= i; k++) b[k].s -= mutare;
    if (gol - mutare <= ATINS) inchideri.push(b[i + 1].id);
  }
  // 4. contactul: nimic nu se suprapune, coada împinge tot ce atinge
  for (let i = b.length - 2; i >= 0; i--) if (b[i].s < b[i + 1].s + D) b[i].s = b[i + 1].s + D;
  return inchideri;
}

export const indexDupaId = (lant, id) => lant.bile.findIndex((x) => x.id === id);

/** Inserează o mărgea lângă bila j: în fața ei (spre fântână) sau în spatele ei. Întoarce id-ul noii mărgele. */
export function insereaza(lant, j, inFata, c) {
  const b = lant.bile;
  const nou = { c, s: b[j].s + (inFata ? D : 0), id: lant.idUrm++ };
  b.splice(inFata ? j : j + 1, 0, nou);
  for (let i = b.length - 2; i >= 0; i--) if (b[i].s < b[i + 1].s + D) b[i].s = b[i + 1].s + D;
  return nou.id;
}

/** Grupul de aceeași culoare (și lipit) din jurul indexului k, dacă are minimum MIN_GRUP mărgele. */
export function cautaGrup(lant, k) {
  const b = lant.bile;
  if (k < 0 || k >= b.length) return null;
  const c = b[k].c;
  let i0 = k, i1 = k;
  while (i0 > 0 && b[i0 - 1].c === c && atinse(b[i0 - 1], b[i0])) i0--;
  while (i1 < b.length - 1 && b[i1 + 1].c === c && atinse(b[i1], b[i1 + 1])) i1++;
  return i1 - i0 + 1 >= MIN_GRUP ? [i0, i1] : null;
}

export function elimina(lant, i0, i1) {
  return lant.bile.splice(i0, i1 - i0 + 1);
}

/** Ce culori mai sunt în joc (muniția se alege doar dintre ele). */
export function culoriPrezente(lant) {
  const set = new Set(lant.bile.map((x) => x.c));
  for (const c of lant.coada) set.add(c);
  return [...set].sort((a, b) => a - b);
}

/** A ajuns capul șiragului în fântână? */
export const aAjuns = (lant, L) => lant.bile.length > 0 && lant.bile[0].s >= L;
/** Nivel câștigat: nu mai e nimic de scos și nimic pe traseu. */
export const golit = (lant) => lant.bile.length === 0 && lant.coada.length === 0;

/** Lovește proiectilul (x, y) o mărgea vizibilă? Întoarce { j, inFata } pentru cea mai apropiată. */
export function lovitura(lant, tr, x, y) {
  let best = null, bd = D * 0.92;
  for (let j = 0; j < lant.bile.length; j++) {
    const m = lant.bile[j];
    if (m.s < 0 || m.s > tr.L) continue;
    const p = pozitie(tr, m.s);
    const d = Math.hypot(x - p.x, y - p.y);
    if (d < bd) { bd = d; best = { j, inFata: (x - p.x) * p.ux + (y - p.y) * p.uy > 0 }; }
  }
  return best;
}

/** Puncte pentru un grup: 10 pe mărgea, înmulțit cu treapta reacției în lanț. */
export const puncteGrup = (n, reactie) => n * 10 * (1 + reactie);
export const bonusNivel = (nivel) => 500 + nivel * 100;

/* ─── Text ─── */
export const formatNumar = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export function plural(n, unu, multe) {
  if (n === 1) return `1 ${unu}`;
  const de = (n % 100 === 0 && n > 0) || n % 100 >= 20 ? "de " : "";
  return `${n} ${de}${multe}`;
}
export function textScor(scor, nivel) {
  return `Mărgele: ${plural(scor, "punct", "puncte").replace(/^\d+/, formatNumar(scor))}, nivelul ${nivel}`;
}
export function grilaShare(nivel) {
  const sir = ["🔴", "🔵", "🟡", "🟢", "⚪", "🟣"];
  return Array.from({ length: Math.min(10, nivel + 2) }, (_, i) => sir[i % sir.length]).join("") + " 📿";
}
