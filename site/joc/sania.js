// ==== Sania — logica pură (v1, 17.10.2026) ====
// Pârtia zilei: teren, obstacole, aterizări, scor. Fără DOM — testat în Node
// (games/teste/sania.test.mjs). Pagina (sania.html) face doar desen, sunet și input.
//
// Coordonate de lume în pixeli, cu y în JOS (ca pe canvas): „mai jos pe pârtie” = y mai mare.

export const PX_PE_METRU = 40;
export const SEGMENT = 1200;          // pârtia se generează pe bucăți de câte 1200 px
export const START_X = 200;           // de unde pleacă sania
export const START_LIBER = 2600;      // primii ~60 m fără obstacole: timp de încălzire
export const G = 1500;                // gravitația (px/s²)
export const V_MIN = 300;             // sania nu se oprește niciodată de tot
export const V_MAX = 920;
export const SARITURA = 560;          // impulsul săriturii, perpendicular pe pârtie
export const ROTIRE = 8;              // rad/s cât timp ții apăsat în aer (un salt mortal ≈ 0,8 s)
export const TOLERANTA = 0.8;         // cât de strâmb poți ateriza (rad)
export const SPATIU_MIN = 260;        // distanța minimă dintre două obstacole
export const CICLU_METRI = 1200;      // o zi întreagă (apus → noapte → zori → zi) în metri
export const PRIMA_RAPA_M = 150;      // râpele apar abia după ce te-ai încălzit

/* ─── Numere pseudo-aleatoare deterministe ─── */

/** mulberry32: generator mic, rapid, determinist. Returnează o funcție → [0, 1). */
export function mulberry32(a) {
  let t = a >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Amestecă două întregi într-un uint32 (pentru acces aleator: seed × index). */
export function hash2(a, b) {
  let h = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b | 0) + 0x632be5ab, 0xc2b2ae35);
  h ^= h >>> 16; h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15; h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/** Valoare pseudo-aleatoare în [-1, 1] pentru nodul întreg i. */
const nod = (seed, i) => (hash2(seed, i) / 4294967296) * 2 - 1;

/** Zgomot 1D neted (value noise cu smoothstep) — în [-1, 1]. */
export function zgomot(seed, x) {
  const i = Math.floor(x), f = x - i;
  const t = f * f * (3 - 2 * f);
  const a = nod(seed, i), b = nod(seed, i + 1);
  return a + (b - a) * t;
}

/** Unghi adus în (-π, π]. */
export function normalizeaza(u) {
  const D = Math.PI * 2;
  u = ((u % D) + D) % D;
  return u > Math.PI ? u - D : u;
}

/* ─── Aterizare și scor ─── */

/* ─── Curba de dificultate: blândă la început, completă după ~900 m ─── */

/** 0 la start (primii 60 m), 1 de la 900 m încolo; crește liniar între ele. */
export function dificultate(m) {
  return Math.min(1, Math.max(0, (m - 60) / 840));
}
/** Frecarea aerului/zăpezii: mare la început (sania merge încet), mică la final. Viteza de croazieră
 *  pe panta medie ≈ √(G·sin(0,3)·0,6 / frecare): ~450 px/s la start → ~700 px/s după 900 m. */
export const frecare = (m) => 0.0013 - 0.00076 * dificultate(m);
/** Toleranța la aterizare: mai iertătoare la început (1,05 rad), apoi 0,8. */
export const toleranta = (m) => TOLERANTA + 0.25 * (1 - dificultate(m));
/** Cât de larg e „ai lovit bolovanul”: la început trebuie să-l atingi aproape în plin. */
export const margineBolovan = (m) => 2 + 6 * dificultate(m);

/** Aterizarea e bună dacă talpa saniei e aproape paralelă cu pârtia. */
export function aterizare(rot, unghiPartie, tol = TOLERANTA) {
  const dif = normalizeaza(rot - unghiPartie);
  return { ok: Math.abs(dif) < tol, dif };
}

/** Câte salturi mortale complete a făcut sania din rotația strânsă în aer. */
export function numaraSalturi(rotAer, tol = TOLERANTA) {
  return Math.floor((Math.abs(rotAer) + tol + 0.1) / (Math.PI * 2));
}

/** Bonusul crește mai repede decât numărul de salturi: 150, 450, 900... */
export const bonusSalturi = (n) => (n > 0 ? 75 * n * (n + 1) : 0);
export const PUNCTE_CLOPOTEL = 40;

export const metri = (x) => Math.max(0, Math.floor((x - START_X) / PX_PE_METRU));

/** Momentul zilei în [0, 1): 0 = zori, 0.4 = amiază, 0.6 = apus, 0.76 = noapte. Pornim la ora de aur. */
export function momentulZilei(m) {
  return (0.5 + m / CICLU_METRI) % 1;
}

/* ─── Pârtia ─── */

/**
 * Pârtia pentru un seed. Terenul e o funcție continuă (coborâre medie + trei octave de zgomot),
 * obstacolele se generează leneș, pe segmente, fiecare segment cu RNG-ul lui → acces aleator determinist.
 */
export function creeazaPartia(seed) {
  seed = seed >>> 0;
  const sA = hash2(seed, 1), sB = hash2(seed, 2), sC = hash2(seed, 3);

  function h(x) {
    // la start, o pantă lină care se înmoaie spre teren adevărat
    const lin = Math.min(1, Math.max(0, (x - 300) / 900));
    const relief = 95 * zgomot(sA, x / 720) + 48 * zgomot(sB, x / 270) + 13 * zgomot(sC, x / 95);
    return 0.31 * x + relief * lin;
  }
  const panta = (x) => Math.atan2(h(x + 4) - h(x - 4), 8);
  /** Curbura (în y-jos: pozitivă pe creste — acolo sania poate decola singură). */
  function curbura(x) {
    const e = 10;
    const d1 = (h(x + e) - h(x - e)) / (2 * e);
    const d2 = (h(x + e) - 2 * h(x) + h(x - e)) / (e * e);
    return d2 / Math.pow(1 + d1 * d1, 1.5);
  }

  const cache = new Map();
  function segment(k) {
    if (cache.has(k)) return cache.get(k);
    const s = genereazaSegment(k);
    cache.set(k, s);
    if (cache.size > 64) cache.delete(cache.keys().next().value);
    return s;
  }

  /** Simulează săritura de la x0 cu viteza minimă: trece de râpa [a, b]? Întoarce traiectoria sau null. */
  function treceRapa(a, b) {
    const x0 = a - 25;
    const al = panta(x0);
    let x = x0, y = h(x0);
    let vx = V_MIN * Math.cos(al) + Math.sin(al) * SARITURA;
    let vy = V_MIN * Math.sin(al) - Math.cos(al) * SARITURA;
    const dt = 1 / 240, arc = [];
    for (let i = 0; i < 2400; i++) {
      vy += G * dt; x += vx * dt; y += vy * dt;
      if (i % 12 === 0) arc.push({ x, y });
      if (x < a && y > h(x)) return null;          // a lovit pârtia înainte de margine
      if (x >= b) return y < h(b) - 6 ? arc : null; // a trecut de mal pe deasupra?
    }
    return null;
  }

  function genereazaSegment(k) {
    const x0 = k * SEGMENT, x1 = x0 + SEGMENT;
    const rnd = mulberry32(hash2(seed, 1000 + k));
    const m0 = metri(x0);
    const d = dificultate(m0);                         // dificultatea crește cu distanța
    const out = { rape: [], bolovani: [], clopotei: [] };
    if (x1 <= START_LIBER) return out;
    const ocupat = [];                                 // intervale [st, dr] deja folosite
    const liber = (st, dr) => st >= Math.max(x0 + 40, START_LIBER) && dr <= x1 - 40 &&
      ocupat.every(([p, q]) => dr + SPATIU_MIN <= p || st >= q + SPATIU_MIN);

    // râpa (cel mult una pe segment)
    if (m0 >= PRIMA_RAPA_M && rnd() < 0.15 + 0.5 * d) {
      for (let incercare = 0; incercare < 6; incercare++) {
        const a = x0 + 120 + rnd() * (SEGMENT - 520);
        let lat = 100 + rnd() * (50 + 150 * d);
        let arc = null;
        while (lat >= 100 && !(arc = h(a + lat) - h(a) > -10 ? treceRapa(a, a + lat) : null)) lat -= 20;
        if (arc && liber(a - 60, a + lat + 40)) {
          out.rape.push({ a, b: a + lat });
          ocupat.push([a - 60, a + lat + 40]);
          // trei clopoței pe traiectoria săriturii, ca momeală
          const mij = arc.filter((p) => p.x > a + lat * 0.2 && p.x < a + lat * 0.85);
          for (let j = 0; j < 3 && mij.length; j++) {
            const p = mij[Math.floor((j + 0.5) * mij.length / 3)];
            out.clopotei.push({ x: p.x, y: p.y - 18 });
          }
          break;
        }
      }
    }

    // bolovani
    const nb = Math.floor(rnd() * (1.5 + 2.6 * d));     // la început: 0 sau 1 pe segment (30 m)
    for (let i = 0; i < nb; i++) {
      for (let incercare = 0; incercare < 5; incercare++) {
        const x = x0 + 60 + rnd() * (SEGMENT - 120);
        const w = 32 + rnd() * (10 + 10 * d), hb = 20 + rnd() * (6 + 14 * d);
        if (liber(x - w / 2, x + w / 2)) {
          out.bolovani.push({ x, w, h: hb, forma: rnd() });
          ocupat.push([x - w / 2, x + w / 2]);
          break;
        }
      }
    }

    // arcuri de clopoței pe pârtie (se iau din săritură)
    const nc = 1 + Math.floor(rnd() * 2);
    for (let i = 0; i < nc; i++) {
      const st = x0 + 80 + rnd() * (SEGMENT - 360), n = 4 + Math.floor(rnd() * 2);
      const peste = ocupat.some(([p, q]) => st + 40 * n > p - 30 && st < q + 30);
      if (st < START_LIBER || peste) continue;
      const inalt = 70 + rnd() * 40;
      for (let j = 0; j < n; j++) {
        const x = st + j * 40;
        out.clopotei.push({ x, y: h(x) - 40 - inalt * Math.sin(Math.PI * j / (n - 1)) });
      }
    }

    out.rape.sort((p, q) => p.a - q.a);
    out.bolovani.sort((p, q) => p.x - q.x);
    out.clopotei.sort((p, q) => p.x - q.x);
    out.clopotei.forEach((c, j) => { c.id = `${k}:${j}`; });
    return out;
  }

  /** Toate obstacolele dintre x0 și x1 (pentru desen și coliziuni). */
  function intre(x0, x1) {
    const r = { rape: [], bolovani: [], clopotei: [] };
    for (let k = Math.floor(x0 / SEGMENT); k <= Math.floor(x1 / SEGMENT); k++) {
      if (k < 0) continue;
      const s = segment(k);
      for (const z of s.rape) if (z.b >= x0 && z.a <= x1) r.rape.push(z);
      for (const z of s.bolovani) if (z.x + z.w >= x0 && z.x - z.w <= x1) r.bolovani.push(z);
      for (const z of s.clopotei) if (z.x >= x0 && z.x <= x1) r.clopotei.push(z);
    }
    return r;
  }

  /** Râpa în care cade x, sau null. */
  function rapa(x) {
    if (x < 0) return null;
    for (const z of segment(Math.floor(x / SEGMENT)).rape) if (x > z.a && x < z.b) return z;
    return null;
  }

  return { seed, h, panta, curbura, segment, intre, rapa, treceRapa };
}

/* ─── Text ─── */

export const formatNumar = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Rândul cu emoji pentru share (emoji-urile sunt permise doar în share). */
export function grilaShare({ metri: m, salturi, clopotei }) {
  return `🛷 ${formatNumar(m)} m · 🌀×${salturi} · 🔔×${clopotei}`;
}

export function textScor(scor) {
  return `Pârtia zilei: ${plural(scor, "punct", "puncte").replace(/^\d+/, formatNumar(scor))}`;
}

/** „1 salt mortal” / „2 salturi mortale” / „20 de salturi mortale”. */
export function plural(n, unu, multe) {
  if (n === 1) return `1 ${unu}`;
  const de = (n % 100 === 0 && n > 0) || n % 100 >= 20 ? "de " : "";
  return `${n} ${de}${multe}`;
}
