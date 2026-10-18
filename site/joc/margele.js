// ==== Mărgele — logica pură (v1, 18.10.2026) ====
// Un șirag de mărgele se rostogolește pe un drum (o hartă a unui loc din România) spre capătul lui; tragi mărgele în el și faci grupuri
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

/* ─── Hărțile: trasee inspirate de locuri din România ─── */
// Fiecare hartă e construită din primitive geometrice (spirală polară sau „broască țestoasă”
// cu drepte și arce), ca inelele să nu se atingă niciodată. Capătul drumului e mereu partea cea
// mai apropiată de trăgător: capul șiragului e cel pe care îl poți nimeri.

const GRAD = Math.PI / 180;

/** Spirală polară generală: r(f) cu f ∈ [0, 1] de-a lungul celor `ture`, plus o intrare dreaptă tangentă. */
function polar({ cx, cy, raza, ture, unghi0, sens, sx = 1, sy = 1, intrare = 260, N = 3000 }) {
  const p = [];
  const punct = (f) => {
    const u = unghi0 + sens * f * ture * Math.PI * 2, r = raza(f, u);
    return [cx + Math.cos(u) * r * sx, cy + Math.sin(u) * r * sy];
  };
  const [x0, y0] = punct(0), [x1, y1] = punct(1 / N);
  const d = Math.hypot(x1 - x0, y1 - y0) || 1;
  p.push([x0 - ((x1 - x0) / d) * intrare, y0 - ((y1 - y0) / d) * intrare]);
  for (let i = 0; i <= N; i++) p.push(punct(i / N));
  return p;
}
const neted = (a, b, t) => { t = Math.min(1, Math.max(0, t)); t = t * t * (3 - 2 * t); return a + (b - a) * t; };

/** „Broasca țestoasă”: pornește din (x, y) cu direcția în grade (0 = est, 90 = sud) și desenează. */
function testoasa(x, y, grade) {
  const p = [[x, y]], repere = [];
  let u = grade * GRAD, lung = 0;
  const t = {
    /** Notează un reper (unde pagina pune un monument): aici, sau centrul unui viraj de rază r la dreapta. */
    semn(tip, r = 0) {
      repere.push({ tip, s: lung, x: x + Math.cos(u + Math.PI / 2) * r, y: y + Math.sin(u + Math.PI / 2) * r });
      return t;
    },
    drept(len, unda = 0, lungUnda = 160) {
      const n = Math.max(1, Math.ceil(Math.abs(len) / 2));
      const nx = -Math.sin(u), ny = Math.cos(u);
      for (let i = 1; i <= n; i++) {
        const s = (len * i) / n, w = unda ? Math.sin((s / lungUnda) * Math.PI * 2) * unda * Math.sin((Math.PI * i) / n) : 0;
        p.push([x + Math.cos(u) * s + nx * w, y + Math.sin(u) * s + ny * w]);
      }
      x += Math.cos(u) * len; y += Math.sin(u) * len; lung += Math.abs(len);
      return t;
    },
    /** Viraj: grade > 0 = la dreapta (sens orar pe ecran), < 0 = la stânga. */
    arc(r, grade) {
      const tot = grade * GRAD, sg = Math.sign(tot);
      const cxa = x + Math.cos(u + (sg * Math.PI) / 2) * r, cya = y + Math.sin(u + (sg * Math.PI) / 2) * r;
      const a0 = u - (sg * Math.PI) / 2, n = Math.max(2, Math.ceil((Math.abs(tot) * r) / 2));
      for (let i = 1; i <= n; i++) {
        const a = a0 + (tot * i) / n;
        p.push([cxa + Math.cos(a) * r, cya + Math.sin(a) * r]);
      }
      u += tot; x = p[p.length - 1][0]; y = p[p.length - 1][1]; lung += Math.abs(tot) * r;
      return t;
    },
    puncte: () => Object.assign(p, { repere }),
  };
  return t;
}

/** Ocolul unui monument dintr-o piață (girație): o umflătură în drum, fără schimbarea direcției. */
const girație = (t, r, tip = "piata") => t.arc(r, -60).semn(tip, r).arc(r, 120).arc(r, -60);
/** O buclă de meandru, spre stânga (sens 1) sau spre dreapta (sens -1). */
const meandru = (t, r, a, sens) => t.arc(r, -a * sens).arc(r, 2 * a * sens).arc(r, -a * sens);

export const TRASEE = [
  {
    id: "sighisoara", nume: "Sighișoara", loc: "Cetatea medievală",
    descriere: "Urcă pe Scara Acoperită, trece pe zid pe lângă turnurile breslelor și coboară spre Turnul cu Ceas.",
    capat: "Turnul cu Ceas", tragator: { x: 315, y: 340 },
    puncte: () => {
      const t = testoasa(-60, 610, 0).drept(95).arc(30, -90).semn("scara");
      for (let i = 0; i < 3; i++) t.arc(16, 40).drept(34).arc(16, -80).drept(34).arc(16, 40);      // Scara Acoperită
      t.semn("scara-sus");
      t.drept(150).arc(36, 90);
      for (let i = 0; i < 4; i++) t.drept(34).arc(9, -90).arc(9, 90).drept(11).semn("turn").drept(11).arc(9, 90).arc(9, -90); // turnurile de pe zid
      return t.drept(40).arc(36, 90)
        .drept(410, 14, 150).arc(36, 90)
        .drept(310).arc(36, 90)
        .drept(300).arc(36, 90)
        .drept(190, 8, 110).arc(36, 90)
        .drept(170).arc(36, 90).drept(90)
        .puncte();
    },
  },
  {
    id: "sarmizegetusa", nume: "Sarmizegetusa Regia", loc: "Sanctuarele dacilor",
    descriere: "Pe Calea Sacră, pe lângă razele unui soare de piatră, în jurul sanctuarului mare, până la Soarele de andezit.",
    capat: "Soarele de andezit", tragator: { x: 300, y: 345 },
    // un inel cu raze (soarele), apoi cercul sanctuarului, apoi spre mijloc
    puncte: () => polar({
      cx: 300, cy: 345, ture: 1.8, unghi0: -90 * GRAD, sens: 1, intrare: 340,
      raza: (f, u) => {
        const g = f * 1.8 * 360;
        const raze = 18 * (0.5 + 0.5 * Math.sin(u * 8)) * neted(0, 1, (g - 15) / 40) * (1 - neted(0, 1, (g - 210) / 40));
        let r;
        if (g < 262) r = 246;
        else if (g < 332) r = neted(246, 180, (g - 262) / 70);
        else if (g < 560) r = 180;
        else r = neted(180, 114, (g - 560) / 80);
        return r + raze;
      },
    }),
  },
  {
    id: "bucuresti", nume: "București", loc: "Bulevardele și Calea Victoriei",
    descriere: "Pe Kiseleff, prin piețele cu girații și pe Calea Victoriei, până la Ateneul Român.",
    capat: "Ateneul Român", tragator: { x: 64, y: 330 },
    puncte: () => {
      const t = testoasa(650, -40, 135).drept(140).arc(40, -45);
      girație(t, 34, "arc"); t.drept(110); girație(t, 34, "statuie"); t.drept(110);
      t.arc(60, 180).drept(440, 14, 130).arc(60, -180);
      t.drept(80); girație(t, 34, "fantana"); t.drept(80); girație(t, 34, "fantana"); t.drept(30).arc(60, 180).drept(330, 10, 150);
      return t.puncte();
    },
  },
  {
    id: "brasov", nume: "Brașov", loc: "Piața Sfatului",
    descriere: "Coboară în serpentine de pe Tâmpa, ocolește Piața Sfatului și intră pe Strada Sforii, spre Biserica Neagră.",
    capat: "Biserica Neagră", tragator: { x: 300, y: 395 },
    puncte: () => {
      const t = testoasa(470, -60, 90).drept(70).semn("tampa").arc(30, 90);
      t.drept(240).arc(32, -180).drept(310).arc(36, 90);                                            // serpentinele de pe Tâmpa
      t.drept(400, 8, 120).arc(40, 90).drept(410).arc(40, 90).drept(330).arc(40, 90);              // primul ocol al pieței
      t.drept(330).arc(40, 90).drept(270).arc(40, 90).drept(210).arc(40, 90);                      // al doilea
      t.drept(50).semn("sforii").arc(14, 60).drept(26).arc(14, -120).drept(26).arc(14, 120).drept(26).arc(14, -60).semn("sforii-capat"); // Strada Sforii
      return t.puncte();
    },
  },
  {
    id: "delta", nume: "Delta Dunării", loc: "Brațul care se varsă în mare",
    descriere: "Un braț al Dunării meandrează printre stuf și nuferi până la mare, unde veghează farul.",
    capat: "Farul", tragator: { x: 420, y: 592 },
    puncte: () => {
      const R = 34, A = 75, t = testoasa(-60, 84, 0).drept(80);
      meandru(t, R, A, 1); t.drept(30); meandru(t, R, A, -1); t.drept(30); meandru(t, R, A, 1); t.drept(20);
      t.arc(88, 180);
      t.drept(40); meandru(t, R, A, -1); t.drept(40); meandru(t, R, A, 1); t.drept(20);
      t.arc(88, -180);
      t.drept(30); meandru(t, R, A, 1); t.drept(40); meandru(t, R, A, -1); t.drept(30);
      return t.puncte();
    },
  },
  {
    id: "transfagarasan", nume: "Transfăgărășan", loc: "Serpentinele de munte",
    descriere: "Iese din tunelul de sub creastă și coboară în ace de păr, tot mai largi, până la baraj.",
    capat: "Barajul", tragator: { x: 300, y: 604 },
    puncte: () => testoasa(230, -70, 90).drept(100).arc(30, -90)
      .drept(150, 8, 100).arc(36, 180)
      .drept(270, 12, 135).arc(40, -180)
      .drept(360, 14, 120).arc(44, 180)
      .drept(420, 16, 140).arc(48, -180)
      .drept(170).arc(50, 50).arc(50, -50).drept(60)
      .puncte(),
  },
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
  const baza = [[4, 48, 22], [4, 54, 23], [5, 60, 24], [5, 64, 25], [5, 70, 26], [5, 74, 27]][k];
  return {
    traseu: k,
    culori: Math.min(CULORI_MAX, baza[0] + runda),
    bile: baza[1] + runda * 12,
    viteza: Math.min(48, baza[2] + runda * 5),
  };
}

/** Viteza motorului: un sprint la începutul nivelului, apoi croaziera; frânează puțin lângă capătul drumului. */
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
// bile[0] e capul (cel mai aproape de capătul drumului, s mare), ultima e coada. s < 0 = încă în afara traseului.

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

/** Inserează o mărgea lângă bila j: în fața ei (spre capătul drumului) sau în spatele ei. Întoarce id-ul noii mărgele. */
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

/** A ajuns capul șiragului la capătul drumului? */
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
