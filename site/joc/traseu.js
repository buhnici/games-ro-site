// Traseu — datele și logica pură a jocului (fără DOM), testabile în Node (v1, 24.09.2026).
// Pagina: site-live/joc/traseu.html · Generatorul: fabrica/generatoare/traseu.mjs
// Testul: games/teste/traseu.test.mjs
//
// ─── JOCUL ─────────────────────────────────────────────────────────────────────────────
// Tablă n×n cu numere 1..K și, uneori, pereți între căsuțe vecine. Jucătorul desenează UN
// singur traseu care pornește din 1, atinge numerele în ordine, se termină în K și trece
// prin fiecare căsuță exact o dată, doar sus/jos/stânga/dreapta, fără să treacă prin pereți.
//
// ─── FORMATUL UNUI PUZZLE (un element din BANC) ──────────────────────────────────────────
//   id      amprenta conținutului (se schimbă dacă se schimbă puzzle-ul) → intră în cheia de stare
//   n       latura tablei (6 sau 7). Căsuța de pe rândul r, coloana c (de la 0) are indexul r·n + c.
//   nivel   1..4 = NIVELURI[nivel]; se calculează din scorDificultate() (vezi mai jos)
//   efort   nodurile explorate de solverul exact al generatorului ca să demonstreze că soluția
//           e unică (tot arborele de căutare, deci nu depinde de ordinea în care încearcă vecinii)
//   numere  indexul căsuței fiecărui număr, în ordine: numere[0] = căsuța lui 1, ultimul = K
//   pereti  perechi [a, b], a < b, de căsuțe vecine despărțite de un perete (niciodată pe soluție)
//   drum    soluția: n·n − 1 direcții, pornind din căsuța lui 1 — N = sus (nord), S = jos (sud),
//           E = dreapta (est), V = stânga (vest)
//
// Banca are exact 364 de puzzle-uri (52 de săptămâni): poziția i se joacă în ziua START + i și
// e generată pentru ziua săptămânii acelei zile (luni cel mai ușor, duminică cel mai greu).
// După 364 de zile se reia de la capăt, iar zilele săptămânii rămân aliniate.

export const SLUG = "traseu";
export const NUME = "Traseu";

/** Prima zi de joc (YYYYMMDD, ora României) — o vineri. */
export const START = 20260925;

export const ZILE = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];
export const NIVELURI = ["", "Ușor", "Mediu", "Greu", "Foarte greu"];

/**
 * Curba săptămânii, indexată după ziua săptămânii (0 = duminică … 6 = sâmbătă):
 *   n       latura tablei
 *   k       [minim, maxim] numere pe tablă (inclusiv 1 și K)
 *   pereti  [minim, maxim] pereți
 *   scor    [de la, până la) — intervalul scorului de dificultate acceptat pentru ziua respectivă.
 * Intervalele de scor se succed fără suprapuneri de luni până duminică, deci fiecare zi e
 * strict mai grea decât cea dinainte. Generatorul respinge orice puzzle care iese din profil.
 */
export const PROFILURI = [
  { n: 7, k: [4, 5], pereti: [2, 5], scor: [17.2, Infinity] }, // duminică — cel mai greu
  { n: 6, k: [12, 13], pereti: [0, 0], scor: [0, 9.2] },       // luni — multe numere
  { n: 6, k: [10, 11], pereti: [0, 0], scor: [9.2, 10.3] },    // marți
  { n: 6, k: [8, 9], pereti: [0, 0], scor: [10.3, 12.6] },     // miercuri — mai puține numere
  { n: 7, k: [8, 9], pereti: [0, 0], scor: [12.6, 14.7] },     // joi — tablă 7×7
  { n: 7, k: [6, 7], pereti: [1, 3], scor: [14.7, 16.0] },     // vineri — puține numere + pereți
  { n: 7, k: [5, 6], pereti: [2, 4], scor: [16.0, 17.2] },     // sâmbătă
];

/** Pragurile de scor pentru nivelurile 2, 3, 4 (sub primul prag = nivelul 1). */
export const PRAGURI_NIVEL = [10.3, 14.7, 17.2];

/**
 * Scorul de dificultate, din cele trei măsuri ale puzzle-ului:
 *   efortul solverului, pe căsuță (log2 — fiecare dublare a căutării adaugă 1 punct)
 * + raritatea indiciilor: 10 · (1 − indicii / n²), unde indicii = numere + pereți / 2
 *   (un perete spune mai puțin decât un număr, deci contează cât o jumătate de indiciu).
 */
export function scorDificultate(p) {
  const N = p.n * p.n;
  const indicii = p.numere.length + p.pereti.length / 2;
  return Math.log2(p.efort / N) + 10 * (1 - indicii / N);
}

/** Nivelul 1..4 (Ușor, Mediu, Greu, Foarte greu) pentru un scor. */
export function nivelDin(scor) {
  let nivel = 1;
  for (const prag of PRAGURI_NIVEL) if (scor >= prag) nivel++;
  return nivel;
}

// ==== BANC:ÎNCEPUT — generat de fabrica/generatoare/traseu.mjs; nu edita manual ====
// Sămânța: 0x54524153 · 364 puzzle-uri · poziția i se joacă în ziua START + i.
export const BANC = [
  // săptămâna 1 — pozițiile 0–6 (vineri → joi)
  { id: "7-57609a9d", n: 7, nivel: 3, efort: 7898, numere: [44, 40, 48, 15, 12, 8, 28], pereti: [[3, 4], [22, 29]], drum: "VVNENESESENESENNVVVNVVNEEESEENVNENVVSVNVSVNVSSSS" },
  { id: "7-72142864", n: 7, nivel: 3, efort: 10965, numere: [32, 23, 28, 26, 15, 44], pereti: [[23, 30], [28, 29], [29, 36]], drum: "NNVVSESVVNVSSSENEEEENNNNVVVVSVNNEEEEEESSSSSSVVVV" },
  { id: "7-a9726d7b", n: 7, nivel: 4, efort: 21256, numere: [30, 2, 33, 3, 34], pereti: [[12, 19], [14, 15], [18, 25], [24, 25], [26, 33]], drum: "ENVNVNENVVSSSESVSSENESENESEENVNVNENVVNNESENESSSS" },
  { id: "6-dc435be1", n: 6, nivel: 1, efort: 137, numere: [20, 12, 15, 27, 10, 0, 3, 17, 35, 33, 24, 26], pereti: [], drum: "VVNEEESSENNNVVVVNEEEEESSSSSVVVVVNEE" },
  { id: "6-29bedc9f", n: 6, nivel: 1, efort: 291, numere: [28, 33, 21, 4, 20, 13, 3, 18, 25, 32], pereti: [], drum: "ESVVNNEENNNVSSVVSVNNEENVVVSSSSSENES" },
  { id: "6-6f91f918", n: 6, nivel: 2, efort: 897, numere: [25, 34, 22, 27, 12, 11, 7, 23], pereti: [], drum: "VSEEEEENVNVSVNVVNNNEEEEESVVVVSEEEES" },
  { id: "7-cfdd147e", n: 7, nivel: 2, efort: 2398, numere: [46, 18, 6, 15, 29, 9, 36, 26, 32], pereti: [], drum: "EENNNNVVNEENVVVVVVSESVSSENENNESSSVSVVSEEENEENNVS" },
  // săptămâna 2 — pozițiile 7–13 (vineri → joi)
  { id: "7-c5ae8ef1", n: 7, nivel: 3, efort: 4406, numere: [32, 3, 15, 37, 11, 12, 6], pereti: [[31, 38], [32, 33], [33, 40]], drum: "NVSVNNENNVSVNVSSESVSESVSEENESENESENNVNENVVNNESEN" },
  { id: "7-5b99371a", n: 7, nivel: 3, efort: 16825, numere: [16, 17, 42, 41, 2], pereti: [[3, 4], [25, 32], [32, 39]], drum: "NVNVSSESVSEENENESESVVSVVVSEEEENESENNNNVNENVVSVNV" },
  { id: "7-c3756e46", n: 7, nivel: 4, efort: 25251, numere: [26, 37, 10, 45, 48], pereti: [[4, 5], [10, 17], [38, 39], [46, 47]], drum: "ENNNVSSVSVNVSSESVVNNNNEEENVVVVSSSSSSEEEENNEESVSE" },
  { id: "6-9c19bb3b", n: 6, nivel: 1, efort: 143, numere: [15, 20, 12, 24, 25, 33, 22, 8, 0, 5, 17, 28], pereti: [], drum: "VSVNVSSSENESENNENNVVVVNEEEEESSSSSVN" },
  { id: "6-22b10a35", n: 6, nivel: 1, efort: 300, numere: [16, 9, 22, 29, 27, 26, 12, 19, 7, 2, 5], pereti: [], drum: "ENVVSSEESSVNVSVNVSVNNNESENNVVNEEEEE" },
  { id: "6-a6229c70", n: 6, nivel: 2, efort: 295, numere: [28, 26, 7, 2, 20, 16, 23, 3, 10], pereti: [], drum: "ESVVNVSVVNENVNENVNEESSSENESENNNVVSE" },
  { id: "7-7e69e600", n: 7, nivel: 2, efort: 1953, numere: [8, 14, 38, 22, 32, 5, 18, 9, 40], pereti: [], drum: "NVSSSSSSEEENVVNNNESSEESSEENNNNNNVSSVNNVVSESSEESS" },
  // săptămâna 3 — pozițiile 14–20 (vineri → joi)
  { id: "7-d018a869", n: 7, nivel: 3, efort: 7314, numere: [24, 13, 9, 34, 35, 11, 6], pereti: [[29, 30], [33, 40], [37, 44]], drum: "EEENNVSVVVNVSSESSENEEESSVNVSVVVVNENVNNNNEEESENEE" },
  { id: "7-1525e0ee", n: 7, nivel: 3, efort: 8749, numere: [44, 15, 25, 21, 40], pereti: [[26, 33], [31, 32]], drum: "EEEENNNNNNVVVVVVSSENEEEESSVNVVSESVVNVSSSENEEENES" },
  { id: "7-1b261f9a", n: 7, nivel: 4, efort: 24726, numere: [20, 17, 47, 0, 6], pereti: [[8, 9], [9, 16], [36, 43]], drum: "NVVSESESVVNVNVSVSSENESEEESVVVVVVNNNNENVNEESENEEE" },
  { id: "6-9e1c684d", n: 6, nivel: 1, efort: 76, numere: [6, 4, 10, 7, 25, 28, 20, 17, 35, 33, 24, 12], pereti: [], drum: "NEEEEESVVVVSSSEEENVVNEEESSSVVVVVNNN" },
  { id: "6-21e9ccbc", n: 6, nivel: 1, efort: 182, numere: [16, 11, 9, 2, 6, 14, 23, 28, 24, 13, 18], pereti: [], drum: "ENNVSVNVVVSEESESEESSVNVSVVVNEENVNVS" },
  { id: "6-cafad530", n: 6, nivel: 2, efort: 247, numere: [29, 31, 16, 19, 13, 6, 9, 23], pereti: [], drum: "SVVVVVNEEEENNVSVVVNEENVVNEEESENESSS" },
  { id: "7-eded1e24", n: 7, nivel: 2, efort: 2476, numere: [16, 3, 15, 24, 32, 18, 35, 11, 12], pereti: [], drum: "ENNVSVNVSSESVSEENESENNESSSVVVVVSEEEEEENNNNNNVVSE" },
  // săptămâna 4 — pozițiile 21–27 (vineri → joi)
  { id: "7-3fd88b42", n: 7, nivel: 3, efort: 9809, numere: [22, 24, 43, 40, 17, 10, 48], pereti: [[7, 14], [32, 33], [33, 40]], drum: "NVSSEENESSVVVSEEEEENVNNNVVNVVNEEESENEESVSESVSESS" },
  { id: "7-106e3107", n: 7, nivel: 3, efort: 14128, numere: [30, 27, 38, 9, 42, 8], pereti: [[5, 12], [10, 11], [11, 18]], drum: "SSEEEENNNNNNVVSESSSSVVNENNVSVNNENVVVSSSSSSENNNNN" },
  { id: "7-f88bec64", n: 7, nivel: 4, efort: 27270, numere: [40, 45, 9, 43, 48], pereti: [[9, 16], [11, 18], [12, 19], [36, 43]], drum: "SVVNENENNVSVSVNNENVVSSSSESVVNNNNNNEEEESENESSSSSS" },
  { id: "6-a1f0de7a", n: 6, nivel: 1, efort: 92, numere: [5, 16, 4, 1, 8, 15, 20, 29, 28, 26, 24, 19, 0], pereti: [], drum: "SSVNNVVVSEESVSEEESSVNVSVNVSVNNENVNN" },
  { id: "6-9650a9f4", n: 6, nivel: 1, efort: 179, numere: [8, 5, 0, 25, 31, 26, 35, 16, 20, 7], pereti: [], drum: "EEENVVVVVSSSESVSEENESEENVNENVVSVNVN" },
  { id: "6-1f323e7e", n: 6, nivel: 2, efort: 231, numere: [33, 31, 4, 21, 8, 6, 14, 30], pereti: [], drum: "VVNEEESENNNNNVSSSVNNNVSVNVSSEESVVSS" },
  { id: "7-a052ffce", n: 7, nivel: 2, efort: 3338, numere: [24, 25, 10, 26, 35, 7, 40, 23, 6], pereti: [], drum: "ENVNEEESVSESSSVVVVVVNNNNNNESSSSSEEEENVVVNNNNEEEE" },
  // săptămâna 5 — pozițiile 28–34 (vineri → joi)
  { id: "7-e879ed66", n: 7, nivel: 3, efort: 6863, numere: [22, 31, 6, 17, 39, 10], pereti: [[7, 14], [17, 24], [29, 30]], drum: "NVSSESVSEENNNESSSEEENNNNNNVVVVVVSEESEESSSENNNNVV" },
  { id: "7-3df2a37b", n: 7, nivel: 3, efort: 20344, numere: [32, 13, 24, 38, 30, 48], pereti: [[3, 10], [22, 23], [29, 30]], drum: "SEENVNENNNVSSVSVSSVNNNENENVVSVNVSSESVSESVSEEEEEE" },
  { id: "7-c2b09ae2", n: 7, nivel: 4, efort: 19991, numere: [32, 30, 0, 38, 6], pereti: [[24, 25], [32, 33], [32, 39], [38, 39]], drum: "NNENNVSVNVSSESSVNVNNNVSSSSESVSEENESENESENNVNENNN" },
  { id: "6-cf5b8401", n: 6, nivel: 1, efort: 131, numere: [14, 6, 3, 17, 34, 16, 9, 26, 33, 30, 25, 13], pereti: [], drum: "NVVNEEEEESSSSSVNNNNVSSVSESVVVNENVNE" },
  { id: "6-9179cfee", n: 6, nivel: 1, efort: 256, numere: [8, 9, 17, 28, 20, 22, 13, 30, 12, 7], pereti: [], drum: "NESENESSSSSVNVSVNNEENVVVSSSVNNNNNES" },
  { id: "6-f87db51a", n: 6, nivel: 2, efort: 294, numere: [4, 2, 10, 0, 19, 32, 28, 33, 5], pereti: [], drum: "VVSEESVVVNNVSSSESVSEENNEESVSEENNNNN" },
  { id: "7-8e8921b2", n: 7, nivel: 2, efort: 3255, numere: [34, 4, 48, 38, 16, 24, 43, 10, 36], pereti: [], drum: "NNNNVVSESSSSESVVVNENNNVVSESVSSVVNNNNNNEEESVVSSSS" },
  // săptămâna 6 — pozițiile 35–41 (vineri → joi)
  { id: "7-ef44248e", n: 7, nivel: 3, efort: 5084, numere: [40, 33, 9, 30, 16, 37, 26], pereti: [[19, 20], [33, 40], [38, 39]], drum: "VSEENNVVNNENVVVVSSSENNESSSSVNVSVNNNNNNEEEEEESSSV" },
  { id: "7-565b547b", n: 7, nivel: 3, efort: 10462, numere: [44, 40, 25, 6, 12, 36], pereti: [[7, 8], [18, 19], [24, 25], [34, 41]], drum: "EEEENVVVVNENVNVNEESESSEENVNENNVSVNVVVVSSSESVSSEN" },
  { id: "7-e806541d", n: 7, nivel: 4, efort: 22727, numere: [34, 17, 15, 44, 14], pereti: [[13, 20], [15, 22], [28, 29], [29, 36], [31, 38]], drum: "NNVSVVNENEENVVVSVNVVSESESVSEEEESESVVNVSVNVSVNNNN" },
  { id: "6-ffa3de2e", n: 6, nivel: 1, efort: 152, numere: [5, 3, 7, 19, 26, 30, 32, 28, 29, 17, 8, 22, 16], pereti: [], drum: "VVVVVSESVSEESVVSEEENESENNNNVVVSESEN" },
  { id: "6-866fe4b3", n: 6, nivel: 1, efort: 243, numere: [15, 20, 22, 5, 3, 1, 19, 24, 26, 27, 23], pereti: [], drum: "VSEENENNVSVNVSVNVSSESVSSENESENESENN" },
  { id: "6-8cf6db40", n: 6, nivel: 2, efort: 300, numere: [27, 22, 12, 26, 35, 14, 11, 7], pereti: [], drum: "ENVVVNVSSSENESEEENNNVVVNEEENVVVVVSE" },
  { id: "7-222270c3", n: 7, nivel: 2, efort: 2411, numere: [14, 19, 18, 16, 17, 41, 39, 38, 8], pereti: [], drum: "NNEEEEEESVSESVVNNVVSESVSEEEESSVNVSVNVSVVNENVNENN" },
  // săptămâna 7 — pozițiile 42–48 (vineri → joi)
  { id: "7-6112c1a2", n: 7, nivel: 3, efort: 4419, numere: [18, 0, 29, 11, 33, 47, 40], pereti: [[2, 3], [20, 27], [36, 43]], drum: "SVSSSVVVNNNNNNEESVSSSSENNNENNESENESSVSESVVSSEENV" },
  { id: "7-b1f059e8", n: 7, nivel: 3, efort: 13521, numere: [2, 12, 45, 41, 25, 46], pereti: [[17, 24], [29, 30], [37, 38]], drum: "EEEESVVVVVNVSSSSSSEEENNNVSSVNNNEEEEESSSSVNNNVSSS" },
  { id: "7-8af355e2", n: 7, nivel: 4, efort: 19394, numere: [0, 5, 34, 36, 20], pereti: [[17, 24], [24, 25], [32, 33], [33, 34]], drum: "EEEEEESVVVSVNVVSESVSSSEEEEEENNNVSSVVVVNENESENNEE" },
  { id: "6-c45a7d3e", n: 6, nivel: 1, efort: 50, numere: [1, 5, 22, 10, 15, 8, 26, 20, 29, 32, 12, 0], pereti: [], drum: "EEEESSSVNNVSVNVSSSENESEESVVVVVNNNNN" },
  { id: "6-55dc2c46", n: 6, nivel: 1, efort: 173, numere: [1, 5, 19, 14, 21, 16, 27, 25, 12, 0], pereti: [], drum: "EEEESVVVVSSENESENESSSVNVSVNVSVNNNNN" },
  { id: "6-cf7f5b72", n: 6, nivel: 2, efort: 628, numere: [0, 26, 2, 9, 5, 10, 35, 22, 32], pereti: [], drum: "SSSSSENENVNNNESSENNEESVSESSSVNNVSSV" },
  { id: "7-cfde6d52", n: 7, nivel: 2, efort: 4364, numere: [36, 15, 12, 32, 26, 38, 6, 22, 42], pereti: [], drum: "SENNNNVNEEEESVVSSENESSVVSEEENNNNNNVVVVVVSSSESVSS" },
  // săptămâna 8 — pozițiile 49–55 (vineri → joi)
  { id: "7-29e000f2", n: 7, nivel: 3, efort: 3690, numere: [32, 41, 30, 25, 19, 48], pereti: [[17, 18], [22, 23], [36, 37]], drum: "EESVVVVNENVNENESSEENVNENVVVVSVNVSSESVSESVSEEEEEE" },
  { id: "7-ced755be", n: 7, nivel: 3, efort: 20163, numere: [38, 33, 35, 8, 19, 28], pereti: [[9, 10], [12, 19], [24, 25]], drum: "EENESSVVVVVVNEENVNNNESSESENEENVVVNEEENVVVVVVSSSS" },
  { id: "7-80b61afe", n: 7, nivel: 4, efort: 31073, numere: [24, 4, 40, 9, 28], pereti: [[15, 16], [29, 36], [38, 45], [43, 44]], drum: "VSVNVNENVNEEEEEESSSSSSVNNNNNVVVSEESSVSESVVNVSVNN" },
  { id: "6-83a26374", n: 6, nivel: 1, efort: 85, numere: [1, 3, 11, 15, 16, 9, 13, 27, 35, 31, 19, 12, 0], pereti: [], drum: "EEEESSSVVNENVVVSESSEEESVVVVVNENVNNN" },
  { id: "6-3c6c39e7", n: 6, nivel: 1, efort: 275, numere: [25, 33, 35, 20, 12, 3, 11, 23, 7, 21], pereti: [], drum: "VSEEEEENVVVNVVNNNEEEEESSSVNNVVVSEES" },
  { id: "6-7b04d992", n: 6, nivel: 2, efort: 208, numere: [29, 26, 13, 10, 23, 4, 0, 14], pereti: [], drum: "SVNVSVNVSVNNNESEENNESSENNNVVVVVSEES" },
  { id: "7-8f2a1912", n: 7, nivel: 2, efort: 3085, numere: [16, 8, 10, 13, 23, 33, 19, 29, 0], pereti: [], drum: "VNNESENEEESVVSVSVSESEENVNENESSSSVVVVNVSVNNENVNNN" },
  // săptămâna 9 — pozițiile 56–62 (vineri → joi)
  { id: "7-e24eba7c", n: 7, nivel: 3, efort: 5034, numere: [44, 23, 39, 9, 28, 27, 4], pereti: [[33, 34], [37, 44]], drum: "VVNEENNESSSENNNNVVNVSSSVNNNNEEESEESSSSSENNNNNNVV" },
  { id: "7-847d8723", n: 7, nivel: 3, efort: 16648, numere: [10, 23, 15, 13, 44, 8], pereti: [[1, 8], [30, 37], [45, 46]], drum: "NESSVSVNVSSEEENENNNESSSSVSESVVNVSVNVSVNNNNNNEESV" },
  { id: "7-db2c3bd5", n: 7, nivel: 4, efort: 35332, numere: [22, 17, 29, 1, 38], pereti: [[16, 17], [29, 30], [38, 45]], drum: "VNEESENESSVVSVNVSSEEEEEENNNNNNVVVVVVSEEEEESSSSVV" },
  { id: "6-c06cf0e0", n: 6, nivel: 1, efort: 114, numere: [7, 1, 8, 12, 25, 26, 16, 9, 4, 22, 27, 29], pereti: [], drum: "VNEESSVVSESVSEENNENENVNEESSSVSVSEEN" },
  { id: "6-83f5c933", n: 6, nivel: 1, efort: 162, numere: [31, 18, 0, 7, 10, 23, 28, 19, 22, 13], pereti: [], drum: "VNNNNNESENESENESSSSSVNVSVNVNEEENVVV" },
  { id: "6-429d33b6", n: 6, nivel: 2, efort: 399, numere: [20, 21, 0, 8, 22, 18, 33, 17, 4], pereti: [], drum: "ENVVVNNESENESESSSVVVNVSSEEEEENNNNNV" },
  { id: "7-7b221240", n: 7, nivel: 2, efort: 1278, numere: [4, 5, 17, 32, 9, 8, 29, 38, 6], pereti: [], drum: "ESVSVSESVVNNNENVVVSESVSESVSSENESENESEENVNENVNENN" },
  // săptămâna 10 — pozițiile 63–69 (vineri → joi)
  { id: "7-12ec2b6b", n: 7, nivel: 3, efort: 6002, numere: [20, 39, 27, 8, 42, 4], pereti: [[3, 10], [11, 12], [34, 41]], drum: "NNVSSVNVSSSSENNEESVSESVVVVNNNNNVSSSSSVNNNNNNEEEE" },
  { id: "7-0f68b565", n: 7, nivel: 3, efort: 14742, numere: [24, 1, 8, 41, 20, 36], pereti: [[20, 27], [34, 41], [37, 38], [39, 46]], drum: "VNNNVVSESVSESVSSEEEEEENVNENVNENNVSVNVSSESSSVNVSV" },
  { id: "7-6f77770e", n: 7, nivel: 4, efort: 21570, numere: [38, 33, 21, 1, 46], pereti: [[21, 28], [22, 23], [29, 30], [31, 32], [39, 46]], drum: "SVVVNNESENENVNEESSSENNNNVVVVSSVNNNEEEEEESSSSSSVV" },
  { id: "6-456c73a7", n: 6, nivel: 1, efort: 97, numere: [9, 2, 6, 18, 31, 35, 17, 10, 21, 28, 26, 7, 25], pereti: [], drum: "NVVVSSSSSEEEEENNNNNVSSVSESVVNNNVSSS" },
  { id: "6-d61ef545", n: 6, nivel: 1, efort: 188, numere: [22, 15, 10, 3, 11, 33, 25, 7, 1, 14, 28], pereti: [], drum: "VNENVNEESSSSSVVVVVNENVNENVNEESSSSEE" },
  { id: "6-5f0aae08", n: 6, nivel: 2, efort: 668, numere: [3, 10, 27, 25, 26, 8, 7, 28], pereti: [], drum: "SENESSSSSVVNNVVSESVVNNNNNEESVSEEESS" },
  { id: "7-12108eca", n: 7, nivel: 2, efort: 1530, numere: [30, 21, 17, 39, 25, 12, 15, 42, 38], pereti: [], drum: "VVNEENESSESENNVNENVVVVSVNNEEEEEESSSSSSVVVVVVNEEE" },
  // săptămâna 11 — pozițiile 70–76 (vineri → joi)
  { id: "7-e6505ad7", n: 7, nivel: 3, efort: 5416, numere: [44, 16, 40, 38, 30, 12, 0], pereti: [[16, 23], [38, 39]], drum: "EEEENNNNVVVVVSEEEESSVNVSVNVSSVNNNNNEEEEEENVVVVVV" },
  { id: "7-9cc339a7", n: 7, nivel: 3, efort: 12691, numere: [24, 18, 44, 12, 22, 6], pereti: [[20, 27], [28, 29], [30, 37], [33, 40]], drum: "ENVVSSESVSEEEENVVNEENVNENVVVVVSSSSSVNNNNNNEEEEEE" },
  { id: "7-d032f94a", n: 7, nivel: 4, efort: 25265, numere: [16, 37, 41, 28, 2], pereti: [[7, 14], [11, 12], [32, 33], [40, 41]], drum: "NENESSVSESVVNVSSEEEENNNNNESSSSSSVVVVVVNNNNENVNEE" },
  { id: "6-404aff7d", n: 6, nivel: 1, efort: 61, numere: [16, 23, 14, 7, 9, 11, 3, 6, 20, 24, 32, 27, 29], pereti: [], drum: "ESVVNVVNEEEENVVVVVSSSEESVVSEEENESEN" },
  { id: "6-b0e71e5e", n: 6, nivel: 1, efort: 158, numere: [15, 13, 30, 26, 34, 16, 4, 9, 8, 12], pereti: [], drum: "SVNVSVSSENESENESENNVNENNVSVNVSVNVSS" },
  { id: "6-1489681a", n: 6, nivel: 2, efort: 608, numere: [22, 13, 16, 6, 3, 23, 33, 24, 28], pereti: [], drum: "VVVVNEEEENVVVVNEEEEESSSSSVVVVVNEEEE" },
  { id: "7-ab826e78", n: 7, nivel: 2, efort: 3368, numere: [20, 38, 26, 37, 9, 4, 0, 43, 40], pereti: [], drum: "SSVVSVNNEENVVVSSSVNNNNEEEEENVVVVVVSSSSSSEEEEEENV" },
  // săptămâna 12 — pozițiile 77–83 (vineri → joi)
  { id: "7-62dc948f", n: 7, nivel: 3, efort: 7811, numere: [28, 48, 32, 26, 9, 25, 16], pereti: [[22, 23], [32, 33], [38, 45]], drum: "NNNNEEEEEESSSSSSVVVVVVNEEENESENNNNVVVVSSSENEENVV" },
  { id: "7-693f9a9d", n: 7, nivel: 3, efort: 19195, numere: [32, 12, 22, 27, 21, 6], pereti: [[15, 16], [15, 22], [16, 17], [37, 44]], drum: "NVNEEENVVVVSSVSSENESEENNESSSVVVVVVNNNNENVNEEEEEE" },
  { id: "7-2187e362", n: 7, nivel: 4, efort: 23547, numere: [16, 30, 44, 12, 2], pereti: [[9, 10], [10, 17], [25, 26], [37, 44]], drum: "NVNVSSESVSEENENESSVSVVVSEEEENESENNVNENVNENVVSVNV" },
  { id: "6-b459c0db", n: 6, nivel: 1, efort: 158, numere: [13, 7, 3, 9, 11, 35, 32, 24, 28, 15, 19, 0], pereti: [], drum: "ENVNEESENESSSSSVVVVVNEEEENNVSVVVNNN" },
  { id: "6-5e161a71", n: 6, nivel: 1, efort: 159, numere: [10, 0, 14, 18, 31, 15, 26, 35, 17, 4], pereti: [], drum: "VNVVVSEESVVSSSENNEENESSVVSEEENNNNNV" },
  { id: "6-9f20fbb5", n: 6, nivel: 2, efort: 534, numere: [18, 10, 17, 7, 26, 34, 27, 23], pereti: [], drum: "NNNEEESENESSVVVNVSSESVVSEEEEENVVNEE" },
  { id: "7-80338d05", n: 7, nivel: 2, efort: 2771, numere: [14, 28, 18, 9, 4, 31, 25, 36, 6], pereti: [], drum: "SSENNEEENVVVVNEEEEESSSSSVVNENVVSSVVSEEEEEENNNNNN" },
  // săptămâna 13 — pozițiile 84–90 (vineri → joi)
  { id: "7-655479ba", n: 7, nivel: 3, efort: 4710, numere: [4, 8, 38, 48, 17, 6, 30], pereti: [[32, 33], [36, 43], [38, 39]], drum: "VVVVSESVSSSSEEENNESSEENVNENVVVNEEENNVSVVVSSVSSEN" },
  { id: "7-ac86297b", n: 7, nivel: 3, efort: 13559, numere: [18, 37, 39, 38, 20, 42], pereti: [[17, 24], [23, 24], [38, 39]], drum: "VVSSSSVNNNNNEEEESSSSVNNVSSSEEENNNNNNVVVVVVSSSSSS" },
  { id: "7-0a1b9fd8", n: 7, nivel: 4, efort: 24930, numere: [18, 24, 40, 1, 6], pereti: [[1, 2], [10, 11], [15, 22], [28, 35]], drum: "NEESVSESVVNVSSEEESVVVVVVNEENNVSVNNNNESSEENVNEEEE" },
  { id: "6-8b8d0343", n: 6, nivel: 1, efort: 57, numere: [6, 8, 10, 11, 15, 20, 22, 27, 13, 18, 32, 35], pereti: [], drum: "NESENESENESSVVVSEEESVVVVNNVSSSEEEEE" },
  { id: "6-da764f41", n: 6, nivel: 1, efort: 264, numere: [11, 35, 32, 18, 1, 8, 15, 26, 21, 28, 5], pereti: [], drum: "SSSSVVVVVNNNNNESENESSVVSSENESENNNNE" },
  { id: "6-3fb2e4e5", n: 6, nivel: 2, efort: 281, numere: [14, 0, 10, 35, 16, 26, 13, 24, 25], pereti: [], drum: "NVVNEEESENESSSSSVNNNVSSSVNNVNVSSSEN" },
  { id: "7-9151d989", n: 7, nivel: 2, efort: 1662, numere: [4, 7, 11, 29, 48, 32, 13, 37, 22], pereti: [], drum: "VVVVSEEEESVVVVSSESVSEEEEEENVVNEENNNNVSSSVVSSVNNV" },
  // săptămâna 14 — pozițiile 91–97 (vineri → joi)
  { id: "7-9b778d97", n: 7, nivel: 3, efort: 6044, numere: [16, 36, 37, 17, 46, 12, 28], pereti: [[20, 27], [34, 41], [39, 46]], drum: "SVSSVSEENNENNESSSVSEEENVNENVNENNVSVNVSVNVVSESVSS" },
  { id: "7-a7e9bc89", n: 7, nivel: 3, efort: 11505, numere: [38, 31, 8, 35, 17, 46], pereti: [[12, 19], [26, 33], [32, 39]], drum: "SVNNENVNNVSSSSSVNNNNNNEEEEEESVVVSEEESVVSEESSVNVS" },
  { id: "7-a9f7e183", n: 7, nivel: 4, efort: 28188, numere: [18, 42, 33, 48, 28], pereti: [[22, 23], [24, 25], [31, 32], [39, 46]], drum: "VVSESVSSVVNENNNNEEEESSVSESVVSEEENNNNNNVVVVVVSSSS" },
  { id: "6-02b676d3", n: 6, nivel: 1, efort: 67, numere: [11, 29, 33, 28, 15, 10, 7, 14, 25, 32, 12, 3, 5], pereti: [], drum: "SSSSVVNENVNENVVVSESVSESVVNNNNNEEEEE" },
  { id: "6-4c9bce9e", n: 6, nivel: 1, efort: 172, numere: [13, 7, 19, 24, 25, 27, 9, 22, 35, 11, 2], pereti: [], drum: "VNNESESSVVSSENESENNNNESSSSENNNNNVVV" },
  { id: "6-47b534ce", n: 6, nivel: 2, efort: 586, numere: [14, 8, 12, 5, 16, 10, 30, 26, 22], pereti: [], drum: "NVSVNNEEEEESSVNVSSVVVSSENESENESENNV" },
  { id: "7-fcce6329", n: 7, nivel: 2, efort: 3756, numere: [28, 14, 38, 32, 19, 17, 48, 8, 0], pereti: [], drum: "NNESSSVSEENESENNVVNNNEEESVVSEESSSENNNNNNVVVVVSVN" },
  // săptămâna 15 — pozițiile 98–104 (vineri → joi)
  { id: "7-e46d9525", n: 7, nivel: 3, efort: 6057, numere: [24, 5, 18, 34, 0, 41, 22], pereti: [[3, 10], [13, 20], [18, 19]], drum: "NNVNEEEESVVSSENESSVVVVNNVNNVSSSSSSEEEEEENVVVVVNN" },
  { id: "7-46156aae", n: 7, nivel: 3, efort: 11378, numere: [22, 46, 10, 48, 0], pereti: [[7, 8], [10, 17], [16, 23], [43, 44]], drum: "VSSSENNENESSVSEENNNNVVNEEESSSSSENNNNNNVVVVVSSVNN" },
  { id: "7-a5d6a4b3", n: 7, nivel: 4, efort: 45703, numere: [0, 17, 24, 41, 42], pereti: [[2, 9], [5, 12], [19, 20], [39, 40]], drum: "SSSSSEEEENNENNVSVNVSSESVVNNNNEEEEESSSSVSESVVVVVV" },
  { id: "6-947c456e", n: 6, nivel: 1, efort: 102, numere: [8, 15, 13, 0, 12, 20, 25, 32, 29, 4, 22, 27, 21], pereti: [], drum: "NESSVVNNVSSSEESVVSEEEEENNNNNVSSSSVN" },
  { id: "6-984133ec", n: 6, nivel: 1, efort: 235, numere: [5, 7, 20, 9, 16, 10, 27, 35, 32, 31], pereti: [], drum: "VVVVVSESVSEENNESENESSVVSEESVVVNVVSE" },
  { id: "6-15a558c6", n: 6, nivel: 2, efort: 423, numere: [13, 26, 20, 28, 11, 10, 8, 12], pereti: [], drum: "SVSSENESENNVNEESSSENNNNNVSVNVSVNVSS" },
  { id: "7-140e7bf4", n: 7, nivel: 2, efort: 3295, numere: [34, 24, 30, 22, 47, 6, 8, 26], pereti: [], drum: "VVNVSVNVSSEEEEESVVVVVVNNNNNNEEEEEESVVVVVSEEEEESV" },
  // săptămâna 16 — pozițiile 105–111 (vineri → joi)
  { id: "7-94940daf", n: 7, nivel: 3, efort: 6533, numere: [22, 1, 18, 39, 2, 42], pereti: [[24, 31], [28, 35], [32, 39]], drum: "SVNNNNESSESENESSVVSEEENNNNVVVNEEEESSSSSSVVVVVNVS" },
  { id: "7-643ec004", n: 7, nivel: 3, efort: 16139, numere: [10, 26, 43, 23, 14, 40], pereti: [[1, 8], [14, 15], [21, 22], [23, 30]], drum: "NESENESSVSESSSVVNVSVVVNEENENVVSVNNNNEESVSEEESSES" },
  { id: "7-3404fa35", n: 7, nivel: 4, efort: 30503, numere: [18, 42, 40, 1, 36], pereti: [[34, 41], [39, 40], [44, 45]], drum: "VVVVSSSSEENNEESVSEEENVNENNNNVVVVVVSEEEEESSVVVVSS" },
  { id: "6-df2d0668", n: 6, nivel: 1, efort: 197, numere: [31, 34, 29, 5, 16, 20, 15, 7, 9, 2, 12, 19, 30], pereti: [], drum: "EEEENNNNNVSSSSVVNENVVNEENVVVSSSESVS" },
  { id: "6-c9613aed", n: 6, nivel: 1, efort: 212, numere: [14, 30, 35, 25, 15, 23, 4, 0, 7, 10], pereti: [], drum: "VVSSSEEEEENVVVVNEENESENNNVVVVVSEEEE" },
  { id: "6-528a30ba", n: 6, nivel: 2, efort: 285, numere: [32, 26, 11, 16, 2, 18, 25, 7, 28], pereti: [], drum: "NESEENNNNNVSSVNNVVVSSSSSENNNNESSEES" },
  { id: "7-bb4e6b7e", n: 7, nivel: 2, efort: 3607, numere: [6, 31, 37, 15, 24, 11, 8, 36, 48], pereti: [], drum: "SSSVSESVVNVSVNNVNEESENENNVSVNVSVNVSSSSESVSEEEEEE" },
  // săptămâna 17 — pozițiile 112–118 (vineri → joi)
  { id: "7-c0ca19b2", n: 7, nivel: 3, efort: 7926, numere: [36, 18, 12, 29, 8, 38, 48], pereti: [[18, 19], [47, 48]], drum: "VSEENNENNESENNVVVSSVSVNNENVNEEEEEESSSSVVSVSEENES" },
  { id: "7-36bfe7cb", n: 7, nivel: 3, efort: 10877, numere: [0, 24, 8, 33, 10, 18], pereti: [[10, 11], [23, 24]], drum: "EESSSSENESSVVVNNNNVSSSSSEEEEEENVNENVNENNVSVNVSSE" },
  { id: "7-56e43b84", n: 7, nivel: 4, efort: 27149, numere: [24, 11, 35, 2, 16], pereti: [[14, 21], [15, 16], [16, 17], [23, 30]], drum: "VVVSEEEENNVNEESSSSVVVVVSEEEEEENNNNNNVVVVVVSSENES" },
  { id: "6-16a7bb4c", n: 6, nivel: 1, efort: 79, numere: [4, 23, 35, 27, 31, 12, 0, 8, 19, 26, 21, 16, 3], pereti: [], drum: "ESSSSSVNVSVVVNNNNNEESVSSSENNESENNVN" },
  { id: "6-c34c5fbc", n: 6, nivel: 1, efort: 152, numere: [25, 20, 35, 31, 13, 3, 22, 9, 14, 7], pereti: [], drum: "ENESEESVVVVVNNENVNNEEEEESSSVNNVSVNV" },
  { id: "6-a8f4b594", n: 6, nivel: 2, efort: 298, numere: [14, 0, 7, 11, 28, 25, 30, 10, 15], pereti: [], drum: "VVNNESENEEESSSSSVNVSVNVSVNNEEEENNVS" },
  { id: "7-f2f1c598", n: 7, nivel: 2, efort: 4233, numere: [36, 8, 9, 26, 3, 12, 30, 41, 38], pereti: [], drum: "SVNNENVNENVNEESSSEEENVVNNESENESSSSVVVVSSEEEENVVV" },
  // săptămâna 18 — pozițiile 119–125 (vineri → joi)
  { id: "7-09e22d8e", n: 7, nivel: 3, efort: 4369, numere: [38, 25, 23, 43, 10, 47, 18], pereti: [[2, 9], [11, 18], [30, 31]], drum: "NNESSSVVNNNVSSSVNNNNEEENVVVNEEEESENESSSSSSVNNNNV" },
  { id: "7-f1a12646", n: 7, nivel: 3, efort: 10875, numere: [36, 7, 31, 4, 8], pereti: [[20, 27], [31, 38]], drum: "SVNNNNNNEESSSESENNVNNESENESSVSESVSESVVNVSVNNVNNN" },
  { id: "7-ff8a7b15", n: 7, nivel: 4, efort: 22182, numere: [34, 7, 39, 14, 48], pereti: [[12, 13], [21, 28], [36, 43], [40, 47]], drum: "SVNNENNNVVVVVVSEEEEESVSSSVNNNVVVSEESSVNVSSEEEEEE" },
  { id: "6-45eced3d", n: 6, nivel: 1, efort: 76, numere: [29, 17, 10, 3, 7, 0, 18, 25, 27, 13, 16, 28, 35], pereti: [], drum: "NNNNVSVNVSVNVSSSSSENESENNVVNEEESSSE" },
  { id: "6-820237ac", n: 6, nivel: 1, efort: 157, numere: [23, 9, 14, 19, 0, 24, 15, 29, 33, 30], pereti: [], drum: "NNNVSVNVSSSVNNNVSSSSEEENNESSESVVVVV" },
  { id: "6-b7bdaae0", n: 6, nivel: 2, efort: 410, numere: [29, 3, 7, 16, 20, 15, 25, 35], pereti: [], drum: "NNNNVVVVVSEEEESSSVVNENVVVSESVSEEEEE" },
  { id: "7-f9e60de1", n: 7, nivel: 2, efort: 2739, numere: [20, 33, 5, 36, 38, 30, 17, 22, 40], pereti: [], drum: "SSVNNNENVVVVVVSSSSESVSEEENVNENNVSVNNEEESSSSSEENV" },
  // săptămâna 19 — pozițiile 126–132 (vineri → joi)
  { id: "7-dccfe9ea", n: 7, nivel: 3, efort: 9341, numere: [32, 47, 27, 23, 20, 44, 12], pereti: [[34, 41], [39, 46]], drum: "SVSEEENVNENVVVSVNNEEEENNVVVVVVSSSSSSEENVNNNNEEEE" },
  { id: "7-75d8055b", n: 7, nivel: 3, efort: 13929, numere: [8, 17, 5, 37, 42, 0], pereti: [[23, 30], [29, 36], [32, 39], [34, 41]], drum: "NESENESSVSVNVSSEEENENNNESSSSVSESVVNVSVNVSVNNNNNN" },
  { id: "7-27f1f391", n: 7, nivel: 4, efort: 33644, numere: [26, 17, 39, 6], pereti: [[3, 10], [5, 12], [10, 11], [31, 38], [40, 47]], drum: "NVNEESSSVVNVSVNNENVVSSSSEEEEESVVVVVVNNNNNNEEEEEE" },
  { id: "6-37493bbc", n: 6, nivel: 1, efort: 119, numere: [15, 28, 33, 29, 17, 5, 9, 1, 6, 24, 32, 7, 21], pereti: [], drum: "ESSVSEENNNNNVSVNVVVSSSSSEENVNNNESSE" },
  { id: "6-9d24a0ab", n: 6, nivel: 1, efort: 278, numere: [28, 22, 11, 3, 6, 8, 27, 19, 30, 13], pereti: [], drum: "SENNVNENNVSVNVVVSEESESSSVNNVSSVNNNE" },
  { id: "6-8ca37deb", n: 6, nivel: 2, efort: 427, numere: [20, 26, 6, 14, 25, 34, 5, 35], pereti: [], drum: "SENNNNVVVSEESVVSESVSEEEENNNNNESSSSS" },
  { id: "7-ffac194c", n: 7, nivel: 2, efort: 3255, numere: [16, 3, 23, 40, 8, 42, 11, 20, 6], pereti: [], drum: "NNESSSVSEEESVVVVNNNNNVSSSSSSEEEEEENNNVVNNNESSENN" },
  // săptămâna 20 — pozițiile 133–139 (vineri → joi)
  { id: "7-082279e7", n: 7, nivel: 3, efort: 6323, numere: [40, 45, 23, 33, 12, 8, 28], pereti: [[11, 18], [14, 21]], drum: "ESVVVVVVNENESEENVNVNEESESENNVNENVVSVNVSVNVSSESVS" },
  { id: "7-52d71cec", n: 7, nivel: 3, efort: 9452, numere: [18, 6, 37, 47, 0, 10], pereti: [[4, 11], [29, 30]], drum: "VVNNEEEESSSSVVVVSEEEESVVVVVVNENVNNNNESSSEEEENNVV" },
  { id: "7-5fc9cba0", n: 7, nivel: 4, efort: 23492, numere: [12, 23, 40, 22, 6], pereti: [[1, 8], [8, 9], [31, 38]], drum: "ESVVNVVSESVSEENEESVSESVVNVSVNVSVNNENVNENVNEEEEEE" },
  { id: "6-8096da25", n: 6, nivel: 1, efort: 196, numere: [22, 27, 30, 0, 13, 25, 8, 5, 9, 17, 29, 28], pereti: [], drum: "VSSVVVNNNNNESSSSENNNNEEESVVSEESSSVN" },
  { id: "6-827e6260", n: 6, nivel: 1, efort: 186, numere: [12, 25, 33, 17, 4, 1, 13, 28, 21, 16, 8], pereti: [], drum: "SESVSEEEEENNNNNVVVVVSESESSEENVNENVV" },
  { id: "6-ae4b5e97", n: 6, nivel: 2, efort: 1108, numere: [25, 19, 0, 3, 27, 10, 11, 34, 7], pereti: [], drum: "SVNNENVNNEEESSSSENNNNESSSSSVVVNNNNV" },
  { id: "7-cc5eeff6", n: 7, nivel: 2, efort: 2085, numere: [32, 38, 29, 13, 24, 16, 22, 11, 28], pereti: [], drum: "VSVNVSVSEEEENESENNVNENNNVSSVSVNVSVNNEEENVVVVSSSS" },
  // săptămâna 21 — pozițiile 140–146 (vineri → joi)
  { id: "7-b9a4ba8b", n: 7, nivel: 3, efort: 4582, numere: [36, 21, 18, 15, 47, 31, 6], pereti: [[16, 23], [18, 19], [21, 22]], drum: "SVNNNNNNEEEEESSSVNNVVVSEESVVSESSEEEENVVVNEEENNNN" },
  { id: "7-741599ec", n: 7, nivel: 3, efort: 8781, numere: [24, 40, 23, 20, 0, 30], pereti: [[26, 27], [43, 44]], drum: "SSVSEEEENVVNNNVVSVNNEEEESSSENNNNVVVVVVSSSSSSENNE" },
  { id: "7-8bdc047c", n: 7, nivel: 4, efort: 21828, numere: [28, 24, 23, 33, 4], pereti: [[1, 2], [8, 15], [16, 23], [19, 20]], drum: "NNNNESENESEESVSSVNNVVSESVSVSEENESENESENNVNENNNVV" },
  { id: "6-29259adb", n: 6, nivel: 1, efort: 109, numere: [30, 32, 12, 20, 15, 10, 27, 34, 23, 11, 2, 6, 0], pereti: [], drum: "EENVVNNESEENVNEESSSVSEENNNNNVVVVSVN" },
  { id: "6-25749ce9", n: 6, nivel: 1, efort: 156, numere: [28, 35, 21, 3, 16, 19, 26, 18, 8, 6], pereti: [], drum: "ESVVNNEENNNVVSESVVSVSESVVNNNENENVVS" },
  { id: "6-cc2bdecd", n: 6, nivel: 2, efort: 327, numere: [5, 11, 14, 27, 2, 24, 33, 28, 16], pereti: [], drum: "SVNVSSVSESVVNNNENVVSSSSSEEEEENVNENV" },
  { id: "7-b65d5c4a", n: 7, nivel: 2, efort: 3305, numere: [22, 34, 39, 10, 29, 0, 9, 19, 26], pereti: [], drum: "VSSSEEEEEENNVSVNNNNVSSSSVVNENNVVNNESENEEEESVSESV" },
  // săptămâna 22 — pozițiile 147–153 (vineri → joi)
  { id: "7-b4cbc381", n: 7, nivel: 3, efort: 8007, numere: [18, 17, 8, 39, 12, 37, 0], pereti: [[16, 17], [17, 18], [32, 39]], drum: "NNVSSSVNNNVSSSSEESEENVNENNNESSSSSSVVVVNVSVNNNNNN" },
  { id: "7-6f9df16c", n: 7, nivel: 3, efort: 13324, numere: [32, 6, 34, 9, 21, 40], pereti: [[5, 12], [11, 18], [28, 29], [32, 33]], drum: "NNENVNEESSSVSESSVVVVNNNNNVSSSSSVNNNNNNEEESSSSSEE" },
  { id: "7-68f8fdcf", n: 7, nivel: 4, efort: 23966, numere: [24, 28, 41, 7, 34], pereti: [[2, 3], [4, 5], [29, 30], [39, 46]], drum: "ESSVNVSVNVSSEEEEEENVNNNVVVSVVNENVNEESENESENESSSS" },
  { id: "6-55308399", n: 6, nivel: 1, efort: 58, numere: [26, 30, 13, 19, 14, 21, 28, 9, 0, 3, 11, 35, 32], pereti: [], drum: "VSVNNNESENESSENNNVVVVNEEEEESSSSSVVV" },
  { id: "6-c02d71ca", n: 6, nivel: 1, efort: 188, numere: [10, 11, 21, 29, 27, 26, 30, 6, 19, 9], pereti: [], drum: "NESSVVSEESSVNVSVNVSVNNNNNESSSENNNES" },
  { id: "6-efa82025", n: 6, nivel: 2, efort: 323, numere: [19, 25, 15, 12, 8, 9, 16, 27, 30], pereti: [], drum: "VSEENENVVVNNESENESENESSVSESSVNVSVVV" },
  { id: "7-4eefbe2f", n: 7, nivel: 2, efort: 1987, numere: [10, 47, 32, 29, 8, 4, 12, 34, 24], pereti: [], drum: "NVVVSSSSSSEEEEEENVVNVSVVNENVNNESEENNEESVSESSVNVV" },
  // săptămâna 23 — pozițiile 154–160 (vineri → joi)
  { id: "7-0e421327", n: 7, nivel: 3, efort: 4432, numere: [32, 18, 48, 13, 7, 22, 26], pereti: [[36, 37], [38, 45], [39, 40]], drum: "SVNNENVVSSSSEEEENVNENNNNVVVVVVSSSSSSENNNNNEEEESS" },
  { id: "7-7994ce3a", n: 7, nivel: 3, efort: 10621, numere: [30, 28, 33, 10, 39, 8], pereti: [[4, 11], [23, 30], [31, 38]], drum: "ENVNNNVVSSSSSSEEEEEENVNENNNNVVVSSENESSVSSVVVNNNN" },
  { id: "7-e8180306", n: 7, nivel: 4, efort: 22458, numere: [2, 23, 45, 0], pereti: [[5, 12], [15, 22], [27, 34]], drum: "VSSENENEEESSSVNNVSVSESVVNVSSEEEENESSVVVVVVNNNNNN" },
  { id: "6-d7a12129", n: 6, nivel: 1, efort: 104, numere: [17, 16, 3, 7, 9, 13, 20, 29, 28, 26, 30, 0], pereti: [], drum: "VNENVVVVSEESVVSEEEESSVNVSVNVSVNNNNN" },
  { id: "6-b6914d84", n: 6, nivel: 1, efort: 228, numere: [27, 28, 21, 31, 25, 14, 7, 2, 4, 9, 35], pereti: [], drum: "SENNVVSSVVNENVNEENVVNEEEEESVVSEESSS" },
  { id: "6-cb076154", n: 6, nivel: 2, efort: 357, numere: [0, 1, 19, 14, 21, 8, 27, 25, 18], pereti: [], drum: "ESVSESENESENNVVNEEESSSSSVNVSVNVSVNN" },
  { id: "7-6a9af18c", n: 7, nivel: 2, efort: 2557, numere: [24, 8, 25, 9, 32, 40, 28, 31, 36], pereti: [], drum: "VVVNNNESSEEESENNVVVNEEEESSSSVVSEESVVVVVVNNEEESVV" },
  // săptămâna 24 — pozițiile 161–167 (vineri → joi)
  { id: "7-dc53ff84", n: 7, nivel: 3, efort: 6537, numere: [28, 33, 48, 23, 25, 8], pereti: [[15, 16], [39, 40]], drum: "NENVNNEEEEEESSSSVSESVVVVVVNENESEENVNVNEESENNVVVV" },
  { id: "7-e1f1cfed", n: 7, nivel: 3, efort: 14733, numere: [32, 28, 12, 8, 14, 42], pereti: [[16, 23], [19, 26], [24, 31], [26, 27]], drum: "VVVVSEEEEENNVNENVVVVSEESVVVNNNEEEEEESSSSSSVVVVVV" },
  { id: "7-1baf5903", n: 7, nivel: 4, efort: 45426, numere: [30, 16, 47, 4, 8], pereti: [[2, 3], [4, 11], [11, 18], [23, 30]], drum: "EENNVSVNNNVVSSSSSSEEEEEENNNNNNVVVSEESSSSVVVVNNNN" },
  { id: "6-ddb9af8c", n: 6, nivel: 1, efort: 100, numere: [2, 5, 8, 1, 12, 32, 28, 14, 21, 16, 22, 17], pereti: [], drum: "EEESVVVVNVSSSSSEEEEENVVVVNNESENESEN" },
  { id: "6-0b2d5e1d", n: 6, nivel: 1, efort: 159, numere: [26, 27, 35, 10, 21, 31, 12, 8, 13, 5], pereti: [], drum: "SENESENNNNVSSVVVSSVNNNNNEESVSEENNEE" },
  { id: "6-148fffba", n: 6, nivel: 2, efort: 359, numere: [27, 20, 15, 28, 17, 1, 30, 13, 16], pereti: [], drum: "SVNNNESESSENNNNNVVVVVSSSSSENNNNEEES" },
  { id: "7-370c3072", n: 7, nivel: 2, efort: 2903, numere: [32, 30, 18, 39, 22, 4, 20, 8, 16], pereti: [], drum: "VVNENESEESVSESVVNVSVNVSVNNENVNNNEEEEEESSVNVVVVSE" },
  // săptămâna 25 — pozițiile 168–174 (vineri → joi)
  { id: "7-aa8854c1", n: 7, nivel: 3, efort: 7061, numere: [26, 24, 48, 15, 12, 9, 20], pereti: [[14, 15], [15, 22], [22, 23]], drum: "ESVVNVVSESEEESVVVVNVSVNNENVNNNESSEEEENVVVNEEEESS" },
  { id: "7-2e3424b1", n: 7, nivel: 3, efort: 14275, numere: [20, 12, 15, 35, 9, 42], pereti: [[11, 18], [44, 45], [46, 47]], drum: "NNVSVNVVVVSESVSSSENNENNESSENESESSSVNNVSSVNNVSSVV" },
  { id: "7-2757e6f0", n: 7, nivel: 4, efort: 25198, numere: [24, 20, 29, 45, 6], pereti: [[9, 16], [23, 24], [29, 36], [31, 38]], drum: "NEEENVVVVVSESVSEEENEESVSESVVNVSVNVSVNNNNNNEEEEEE" },
  { id: "6-e54e62f8", n: 6, nivel: 1, efort: 75, numere: [7, 6, 18, 32, 25, 14, 27, 28, 23, 4, 16, 2, 3], pereti: [], drum: "NVSSSSSEENVNNESESSEENVNENNNVSSVNVNE" },
  { id: "6-5b09e3b1", n: 6, nivel: 1, efort: 213, numere: [22, 9, 5, 0, 14, 19, 27, 34, 24, 31], pereti: [], drum: "ENVVNEENVVVVVSEESVVSEEESEESVVVNVVSE" },
  { id: "6-2600cec0", n: 6, nivel: 2, efort: 341, numere: [0, 16, 8, 13, 30, 32, 28, 29, 10], pereti: [], drum: "EEESSESVVNNVVSESVSSENESENESENNNNNVS" },
  { id: "7-8b7640b1", n: 7, nivel: 2, efort: 2508, numere: [12, 41, 38, 36, 39, 23, 11, 22, 42], pereti: [], drum: "NESSSSSSVVVNVSVNNEEESENNNVSVVNENENVVSVNVSSESVSSS" },
  // săptămâna 26 — pozițiile 175–181 (vineri → joi)
  { id: "7-8842b840", n: 7, nivel: 3, efort: 8538, numere: [6, 34, 11, 15, 23, 8, 48], pereti: [[31, 38], [39, 46], [47, 48]], drum: "SSSSVNNNNVSSSSSVVVNNNESSENNNNVSVNVSSSSSSEEEEENES" },
  { id: "7-246c89a1", n: 7, nivel: 3, efort: 13867, numere: [24, 14, 33, 13, 38, 10], pereti: [[17, 24], [23, 24]], drum: "SVNNEENNVVVVSSSSSSEEEEEENVNENNNNVSSSVSSVVVNNNNEE" },
  { id: "7-89739e95", n: 7, nivel: 4, efort: 21551, numere: [32, 13, 36, 12, 48], pereti: [[25, 32], [32, 33], [32, 39], [34, 41]], drum: "VNEESENNNNVVVVVVSSSSSSENNNNNEEEESVVVSSSSENESENES" },
  { id: "6-b3f2b252", n: 6, nivel: 1, efort: 146, numere: [30, 13, 21, 31, 33, 16, 6, 2, 9, 4, 23, 35], pereti: [], drum: "NNNESEESVVSEEENNNVVNVVNEEESENESSSSS" },
  { id: "6-970e4c4f", n: 6, nivel: 1, efort: 250, numere: [12, 7, 10, 11, 15, 19, 29, 28, 25, 18], pereti: [], drum: "NNESENESENESSVVVVSEEEESSVNVSVNVSVNN" },
  { id: "6-3018200b", n: 6, nivel: 2, efort: 294, numere: [20, 33, 19, 8, 6, 22, 5, 28], pereti: [], drum: "SESVVVNENVNEENVVNEEESSSENNNESSSSSVN" },
  { id: "7-56541bc1", n: 7, nivel: 2, efort: 4360, numere: [30, 35, 31, 39, 12, 21, 10, 7, 42], pereti: [], drum: "VVSEEENESENNNNVSSVVVVNEEENVVVNEEEEEESSSSSSVVVVVV" },
  // săptămâna 27 — pozițiile 182–188 (vineri → joi)
  { id: "7-6b166aa7", n: 7, nivel: 3, efort: 9132, numere: [18, 14, 31, 8, 4, 39, 28], pereti: [[24, 31], [39, 46]], drum: "VVVVSESSEENVNEEENNVVVVVNEEEEEESSSSVVSEESVVVVVVNN" },
  { id: "7-6cf2a1cc", n: 7, nivel: 3, efort: 12837, numere: [38, 22, 26, 4, 42], pereti: [[12, 19], [14, 21], [25, 26], [33, 40]], drum: "VVVNNESEEEENNVSVVNENVVSVNNEEEESENESSSSSSVNVSVVVV" },
  { id: "7-2edeefad", n: 7, nivel: 4, efort: 18789, numere: [48, 22, 7, 12, 28], pereti: [[23, 24], [34, 41]], drum: "NVSVVVVVNENNESSEENVNEESENNNNVVVVVVSEEEEESVVVVVSS" },
  { id: "6-374aedd0", n: 6, nivel: 1, efort: 93, numere: [16, 23, 28, 34, 21, 8, 31, 19, 13, 6, 2, 5, 10], pereti: [], drum: "ESVSESVVNNNNVSSSSVVNENVNENVNEEEEESV" },
  { id: "6-e1d0f8a3", n: 6, nivel: 1, efort: 366, numere: [13, 7, 15, 26, 19, 31, 35, 16, 11, 10, 2], pereti: [], drum: "VNNESESESVSVNVSSEEENESENNVNENNVSVNV" },
  { id: "6-fb67425a", n: 6, nivel: 2, efort: 258, numere: [27, 11, 16, 25, 8, 15, 18, 33, 35], pereti: [], drum: "EENNNNVSSSVVSVNNNESENNVVVSSSSSEEEEE" },
  { id: "7-2f059c3c", n: 7, nivel: 2, efort: 1553, numere: [12, 32, 48, 37, 19, 35, 23, 10, 16], pereti: [], drum: "NESSSSVVSEESVVVVNENNEENVNNVVVVSSSSSSENNENVNNEESV" },
  // săptămâna 28 — pozițiile 189–195 (vineri → joi)
  { id: "7-2110f5c8", n: 7, nivel: 3, efort: 8341, numere: [10, 48, 19, 39, 2, 46], pereti: [[4, 11], [7, 14], [36, 37]], drum: "NEEESSSSSSVNNNNNVSSSSVNNNVNNVVSESVSSSSENNNESSSEE" },
  { id: "7-92db2e8b", n: 7, nivel: 3, efort: 10027, numere: [10, 12, 24, 22, 19, 8], pereti: [[1, 8], [24, 25], [36, 37]], drum: "NEEESVVSSSVNNVVSESSEEENNNESSSSVVVVVVNENVNNNNEESV" },
  { id: "7-7e05c78b", n: 7, nivel: 4, efort: 60535, numere: [16, 18, 29, 4, 28], pereti: [[7, 14], [9, 10]], drum: "NNVVSESVSEEENESSVVVSEEEENNNNVVNEEESSSSSSVVVVVVNN" },
  { id: "6-f67021ce", n: 6, nivel: 1, efort: 60, numere: [28, 33, 26, 20, 31, 24, 0, 14, 2, 5, 15, 22, 17], pereti: [], drum: "ESVVVNENVVSSVNNNNNESSENNEEESVVSESEN" },
  { id: "6-29666fd6", n: 6, nivel: 1, efort: 282, numere: [4, 29, 33, 9, 1, 8, 15, 25, 13, 30], pereti: [], drum: "ESSSSSVVNENNNVNVVVSEESESVSSVNNNVSSS" },
  { id: "6-0026edce", n: 6, nivel: 2, efort: 436, numere: [16, 34, 30, 28, 14, 7, 5, 0, 6], pereti: [], drum: "ESSSVVVVVNEEEENVNVSVVNENEEEENVVVVVS" },
  { id: "7-8303b9b1", n: 7, nivel: 2, efort: 2167, numere: [14, 18, 5, 37, 9, 29, 47, 32, 6], pereti: [], drum: "NNEEESSENNESSSVVSSVNNNNVSSVSESVSEEEEEENVVNEENNNN" },
  // săptămâna 29 — pozițiile 196–202 (vineri → joi)
  { id: "7-0e69a02c", n: 7, nivel: 3, efort: 5253, numere: [10, 5, 25, 23, 33, 22, 6], pereti: [[8, 9], [18, 25], [23, 24]], drum: "VNEEESVSESVVNVSSEEESVVVVNNNNNVSSSSSSEEEEEENNNNNN" },
  { id: "7-ea6fdc9f", n: 7, nivel: 3, efort: 12079, numere: [32, 19, 28, 3, 40, 46], pereti: [[12, 19], [14, 15], [18, 25], [29, 36]], drum: "SVSVVVNEENENEENVVNVVSESVSVNNNNEEEESENESSSSVSESVV" },
  { id: "7-42e8540e", n: 7, nivel: 4, efort: 21293, numere: [16, 7, 32, 28, 0], pereti: [[4, 5], [14, 15], [33, 40]], drum: "VSVNNEEESEESSVNVVSESVVNVSSEEEENESENNNNNNVSVNVVVV" },
  { id: "6-f0dc86e0", n: 6, nivel: 1, efort: 122, numere: [26, 30, 18, 1, 8, 7, 21, 35, 22, 17, 9, 5, 10], pereti: [], drum: "SVVNENVNNNEESVSESESSEENVNENVVNNEESV" },
  { id: "6-a3c7ad3e", n: 6, nivel: 1, efort: 230, numere: [9, 16, 4, 6, 32, 8, 20, 34, 28, 17], pereti: [], drum: "SENENVVVVVSSSSSEENVNNNESSESSEENVNEN" },
  { id: "6-bcbc898d", n: 6, nivel: 2, efort: 517, numere: [7, 9, 26, 11, 28, 32, 13, 18], pereti: [], drum: "VNEEESVSSSENNENNESSSVSESVVVVVNENNVS" },
  { id: "7-d74ddee3", n: 7, nivel: 2, efort: 3067, numere: [4, 20, 11, 42, 33, 21, 9, 1, 22], pereti: [], drum: "EESSVNVSSEESSSVVVVVVNEEEEENVVVVVNNEENVVNEEESSSVV" },
  // săptămâna 30 — pozițiile 203–209 (vineri → joi)
  { id: "7-932e0996", n: 7, nivel: 3, efort: 8134, numere: [24, 20, 0, 34, 45, 22, 14], pereti: [[12, 19], [32, 39], [34, 41]], drum: "NEEENNVSVNVSVNVVSESESSEENEESVSESVVNVSVNVSVNNENVN" },
  { id: "7-c873e5fa", n: 7, nivel: 3, efort: 10114, numere: [24, 44, 36, 20, 28], pereti: [[10, 17], [14, 21], [39, 40]], drum: "SESSVNVSVVNENENNEESESSSENNNNVNENVVSVNVSVNVSSESVS" },
  { id: "7-e1b53719", n: 7, nivel: 4, efort: 34439, numere: [32, 28, 12, 42, 0], pereti: [[1, 8], [8, 15], [9, 10], [17, 24], [21, 22]], drum: "VVVVNNNEESVSEEENVNEESSSSVVVVVSEEEEEENNNNNNVVVVVV" },
  { id: "6-8065c76f", n: 6, nivel: 1, efort: 172, numere: [31, 12, 6, 1, 9, 11, 16, 25, 33, 21, 35, 17], pereti: [], drum: "VNNNENVNEESENEESVSVVSVSESENNESSENNN" },
  { id: "6-66eca667", n: 6, nivel: 1, efort: 181, numere: [10, 8, 4, 16, 23, 15, 25, 1, 6, 30, 35], pereti: [], drum: "VVNEEESSVSESVVNNVSSVNNNNVSSSSSEEEEE" },
  { id: "6-02983b30", n: 6, nivel: 2, efort: 286, numere: [30, 33, 12, 7, 19, 11, 22, 29, 16], pereti: [], drum: "EEENVVVNNNNESSSENNNEEESVVSSESSENNNV" },
  { id: "7-c70193cb", n: 7, nivel: 2, efort: 1332, numere: [18, 15, 17, 24, 21, 37, 6, 32, 40], pereti: [], drum: "NNVVVVSSENEESVSESVVNVSSSENESENESEENNNNNNVSSSVSES" },
  // săptămâna 31 — pozițiile 210–216 (vineri → joi)
  { id: "7-ad5bbb49", n: 7, nivel: 3, efort: 5257, numere: [34, 24, 30, 40, 15, 6], pereti: [[5, 12], [44, 45]], drum: "VNENNVSVSVNVSSEESEESVVVNVSVVNENVNENVNNESENESENEE" },
  { id: "7-3720a6b2", n: 7, nivel: 3, efort: 19973, numere: [10, 32, 41, 8, 2, 40], pereti: [[13, 20], [18, 19], [28, 35]], drum: "NEEESVVSSSENNESSSSVVVVVVNEENNVSVNNENVNEESSESSSEE" },
  { id: "7-544b74c1", n: 7, nivel: 4, efort: 40091, numere: [18, 1, 48, 36, 6], pereti: [[8, 15], [15, 22], [40, 41]], drum: "ENNVSVNVSVNVSSEEESVVVSSSEEEEEENNVSVVVVNEEENEENNN" },
  { id: "6-ad2f9789", n: 6, nivel: 1, efort: 130, numere: [26, 25, 32, 15, 8, 16, 28, 29, 11, 2, 6, 13, 30], pereti: [], drum: "NVSSEENNNVNEESSSSENNNNNVVVVVSESVSSS" },
  { id: "6-35db10cd", n: 6, nivel: 1, efort: 288, numere: [23, 33, 28, 30, 25, 1, 9, 8, 4, 11, 10], pereti: [], drum: "SSVVNENVVSSVVNENVNNNESSEENVNEEESSVN" },
  { id: "6-fd2b5e2c", n: 6, nivel: 2, efort: 402, numere: [0, 7, 8, 29, 18, 25, 10, 27], pereti: [], drum: "ESVSEENNEEESSSSSVVVVVNNESENENNESSSV" },
  { id: "7-dad1980e", n: 7, nivel: 2, efort: 1321, numere: [26, 12, 1, 30, 18, 24, 33, 37, 14], pereti: [], drum: "ENVNENVVVVVVSESSSENNNEESVSESVSEENESSVVVVNVSVNNNN" },
  // săptămâna 32 — pozițiile 217–223 (vineri → joi)
  { id: "7-ac2eec38", n: 7, nivel: 3, efort: 5317, numere: [18, 4, 7, 37, 15, 6, 48], pereti: [[24, 31], [30, 31], [32, 33]], drum: "SVNNENVVVVSEESSSSVNNNVSSSSEEENNESSENNNNNNESSSSSS" },
  { id: "7-5781a84b", n: 7, nivel: 3, efort: 16813, numere: [38, 24, 45, 2, 39, 14], pereti: [[1, 8], [14, 21], [28, 35], [29, 30]], drum: "VNENVVVSESVSEEEEEENNNNNNVVVVVVSEEEEESSSSVNNNVVVV" },
  { id: "7-215f278b", n: 7, nivel: 4, efort: 21493, numere: [2, 39, 15, 6, 16], pereti: [[11, 12], [16, 17], [39, 46]], drum: "VVSSSSSSEEEEEENVVVVVNNNNEENESSVSEENNNESSSSVVVVNN" },
  { id: "6-ef4fe62a", n: 6, nivel: 1, efort: 70, numere: [19, 6, 13, 26, 24, 33, 15, 8, 4, 16, 28, 29, 5], pereti: [], drum: "VNNNESSESSVVSEEENNNNVNEESSSSSENNNNN" },
  { id: "6-001b4c5a", n: 6, nivel: 1, efort: 262, numere: [26, 15, 8, 10, 7, 19, 31, 35, 16, 5], pereti: [], drum: "NENVNEENVVVVSESVSESVSEEENESENNVNENN" },
  { id: "6-6c79c5cc", n: 6, nivel: 2, efort: 296, numere: [16, 9, 0, 21, 26, 23, 33, 12, 25], pereti: [], drum: "ENNVSVNVVVSEESESVSEENESSVVVVVNNNESS" },
  { id: "7-ba54587b", n: 7, nivel: 2, efort: 4140, numere: [32, 33, 25, 41, 24, 16, 37, 5, 48], pereti: [], drum: "ENVNEESSSVVVNNNVSSSVNNNNEEEEENVVVVVVSSSSSSEEEEEE" },
  // săptămâna 33 — pozițiile 224–230 (vineri → joi)
  { id: "7-f4ea5a55", n: 7, nivel: 3, efort: 6918, numere: [26, 23, 36, 17, 15, 13, 40], pereti: [[11, 12], [15, 16], [17, 18]], drum: "SVSSVVVVNNNEESVSEENNENNVSVNVSVNNEEEEEESVSESSSSVN" },
  { id: "7-2ec1bb29", n: 7, nivel: 3, efort: 9137, numere: [4, 24, 13, 8, 41, 22], pereti: [[1, 2], [11, 12]], drum: "VVSEESVSEENNNESSSSVVVVNNVNNVSSSSSSEEEEEENVVVVVNN" },
  { id: "7-dd76b5fb", n: 7, nivel: 4, efort: 36045, numere: [30, 19, 47, 11, 42], pereti: [[8, 9], [19, 26], [23, 30], [36, 43]], drum: "VSVNNNNNESSSENNNEEEESVSESSSSVNNNVNNVSSSESSVNVSVV" },
  { id: "6-ab5ff584", n: 6, nivel: 1, efort: 71, numere: [7, 12, 2, 11, 34, 32, 18, 26, 8, 10, 15, 22, 27], pereti: [], drum: "SVNNEEEEESSSSSVVVVVNNESENNNEESVSESV" },
  { id: "6-ccf26ed2", n: 6, nivel: 1, efort: 214, numere: [15, 17, 5, 8, 6, 31, 34, 19, 20, 7], pereti: [], drum: "SEENVNENVVSVNVVSSSSSEEEEENVVVVNENVN" },
  { id: "6-c28581c6", n: 6, nivel: 2, efort: 323, numere: [21, 27, 20, 32, 28, 4, 7, 16, 30], pereti: [], drum: "SVNVSSEEEENVNENNNVVVVVSEEEESVVVVSSS" },
  { id: "7-ef9714ad", n: 7, nivel: 2, efort: 1273, numere: [36, 3, 19, 11, 31, 16, 10, 27, 42], pereti: [], drum: "VNNNNNEEEEEESSVNVSSSVNVNENVVSSSESEEENNESSSVVVVVV" },
  // săptămâna 34 — pozițiile 231–237 (vineri → joi)
  { id: "7-4fae67fd", n: 7, nivel: 3, efort: 5482, numere: [24, 42, 36, 16, 39, 0, 34], pereti: [[15, 16], [15, 22], [29, 36]], drum: "SSSVVVNEENVVNEENEESSSSEENVNNNNVVVVSVNNEEEEEESSSS" },
  { id: "7-1c8a3b56", n: 7, nivel: 3, efort: 10131, numere: [34, 48, 31, 9, 5, 2], pereti: [[4, 5], [22, 23], [24, 25], [28, 35]], drum: "NVVSESESVVNVSVVVNEENENVNVSSVNNNNESEESEEENNVSVNVV" },
  { id: "7-e9efdaa0", n: 7, nivel: 4, efort: 23243, numere: [40, 30, 15, 1, 48], pereti: [[4, 11], [18, 25], [20, 27], [36, 43]], drum: "ENNVSVNVSVSVNNENVNEESENESENNVVVVVVSSSSSSEEENESEE" },
  { id: "6-afb0c02d", n: 6, nivel: 1, efort: 53, numere: [35, 26, 14, 21, 29, 16, 10, 8, 19, 24, 0, 3, 5], pereti: [], drum: "VVVNNNESSEENVNENVVVVSSSSVNNNNNEEEEE" },
  { id: "6-ce47ba1a", n: 6, nivel: 1, efort: 264, numere: [8, 7, 9, 4, 23, 13, 29, 26, 18, 0], pereti: [], drum: "VNEESENESSSVNVVVSEESEESVVVNVSVNNNNN" },
  { id: "6-b9704f93", n: 6, nivel: 2, efort: 498, numere: [33, 28, 4, 31, 7, 15, 10, 32], pereti: [], drum: "NESENNNNNVVVVVSSSSSENNNNESENESSVVSS" },
  { id: "7-9956b536", n: 7, nivel: 2, efort: 3603, numere: [14, 37, 26, 24, 12, 34, 38, 42], pereti: [], drum: "SESVSEENEENENVVSVNVNVNEESENESENESSSSVSESVVNVSVVV" },
  // săptămâna 35 — pozițiile 238–244 (vineri → joi)
  { id: "7-4cd565b6", n: 7, nivel: 3, efort: 4725, numere: [48, 16, 24, 14, 39, 8], pereti: [[18, 19], [18, 25], [47, 48]], drum: "NNVVVVNNNEESVSEEENVNENVVVVVVSSSSSSEEEEENVVVVNNNN" },
  { id: "7-f570e831", n: 7, nivel: 3, efort: 10192, numere: [12, 26, 36, 41, 9, 6], pereti: [[1, 8], [3, 10], [14, 21], [19, 26]], drum: "ESVVNVSSEEESVVVVVSEEEEESVVVVVVNNNEENNVSVNNEEEEEE" },
  { id: "7-c1a685a7", n: 7, nivel: 4, efort: 20246, numere: [30, 1, 34, 8, 44], pereti: [[10, 17], [24, 31], [38, 39], [46, 47]], drum: "ESVVSVNNENVNNNEEEEEESSSSSSVNNNNNVVVVSESENESSSSVV" },
  { id: "6-18eb9263", n: 6, nivel: 1, efort: 78, numere: [9, 17, 5, 2, 0, 19, 24, 33, 23, 26, 21, 7, 8], pereti: [], drum: "ESENNVVVVVSSSESVSEEEEENNVSVVNENVVNE" },
  { id: "6-cfc5565d", n: 6, nivel: 1, efort: 167, numere: [13, 1, 9, 11, 22, 27, 18, 25, 21, 7], pereti: [], drum: "VNNEEESENESSVSESSVNVSVVVNNESENENVNV" },
  { id: "6-cfb49cf2", n: 6, nivel: 2, efort: 564, numere: [32, 13, 10, 11, 23, 14, 34, 28], pereti: [], drum: "NVSVNNENVNNESENESENESSSVNVVSESSEENV" },
  { id: "7-8d6ad4a0", n: 7, nivel: 2, efort: 1182, numere: [48, 12, 8, 24, 30, 18, 39, 22, 2], pereti: [], drum: "NNNNNNVSVNVSVVSEESVSEENNESSSSVNVSVNVSVNNENVNNNEE" },
  // săptămâna 36 — pozițiile 245–251 (vineri → joi)
  { id: "7-6e9b7cf9", n: 7, nivel: 3, efort: 4993, numere: [22, 31, 10, 39, 9, 0, 6], pereti: [[20, 27], [29, 36], [36, 43]], drum: "EESENNVNEEESVSESVSESVVNVSVVVNEENVVNNEENVVNEEEEEE" },
  { id: "7-3ca76067", n: 7, nivel: 3, efort: 15692, numere: [30, 16, 0, 18, 21, 12], pereti: [[3, 10], [10, 11], [21, 22], [24, 31]], drum: "EENVVNENVVVNEEEESSESSSVVVVNNNVSSSSEEEEEENNNNNNVS" },
  { id: "7-fb1d1545", n: 7, nivel: 4, efort: 33188, numere: [42, 2, 27, 39, 6], pereti: [[9, 10], [13, 20], [25, 32], [39, 40]], drum: "NNNNNNEESVSSSSSEEEEENVNENNVSVVSESVVNNNEENVNEESEN" },
  { id: "6-70062b6d", n: 6, nivel: 1, efort: 56, numere: [0, 1, 24, 19, 20, 28, 26, 33, 23, 5, 2, 10, 15], pereti: [], drum: "ESVSSSSENNNESEESVVSEEENNNNNVVVSEESV" },
  { id: "6-f1eaaf38", n: 6, nivel: 1, efort: 219, numere: [35, 31, 25, 29, 7, 15, 11, 9, 0, 18], pereti: [], drum: "VVVVVNEEEEENVVVVNNESEEENNVSVNVVVSSS" },
  { id: "6-2b5a5e77", n: 6, nivel: 2, efort: 308, numere: [5, 13, 22, 28, 25, 6, 10, 7], pereti: [], drum: "SSVVVVSEEEESSVNVSVNVSVNNNNNEEEESVVV" },
  { id: "7-dd4871de", n: 7, nivel: 2, efort: 1361, numere: [34, 25, 42, 31, 29, 20, 11, 1, 10], pereti: [], drum: "NVVSESESVVNVSVVVNEENENVVSVNNEEEEEENNVSVNVVVVSEEE" },
  // săptămâna 37 — pozițiile 252–258 (vineri → joi)
  { id: "7-6c776532", n: 7, nivel: 3, efort: 7869, numere: [40, 2, 30, 0, 29, 36, 48], pereti: [[11, 18], [17, 24], [18, 25]], drum: "ENNNNNVSVNVVSESEESSVNVSVNNVNNVSSSESVSSENESENESEE" },
  { id: "7-c2bc1cc8", n: 7, nivel: 3, efort: 16326, numere: [24, 39, 37, 11, 34, 42], pereti: [[7, 8], [10, 11], [39, 40], [44, 45]], drum: "ESSSVNNVSSVNNNENVNEESENESSSSSENNNNNNVVVVVVSSSSSS" },
  { id: "7-beedb0bd", n: 7, nivel: 4, efort: 40538, numere: [16, 30, 2, 22, 20], pereti: [[7, 8], [8, 9], [16, 23]], drum: "ESVSEENNNVVNEEEESVSSSSVVVVNNNNNVSSSSSSEEEEEENNNN" },
  { id: "6-d2686e1e", n: 6, nivel: 1, efort: 93, numere: [13, 20, 4, 7, 6, 19, 24, 26, 33, 23, 16, 28], pereti: [], drum: "ESENNEENVVVSVNVSSSESVSEENESEENNNVSS" },
  { id: "6-ad5b785c", n: 6, nivel: 1, efort: 247, numere: [35, 27, 23, 15, 11, 10, 20, 25, 1, 6, 30], pereti: [], drum: "VVNEENVVNEENNVSVNVSSSSSVNNNNNVSSSSS" },
  { id: "6-01624678", n: 6, nivel: 2, efort: 207, numere: [8, 3, 14, 19, 28, 21, 4, 0], pereti: [], drum: "ENVVSSESVSEEENVNENNESSSSSVVVVVNNNNN" },
  { id: "7-6fef5a80", n: 7, nivel: 2, efort: 2243, numere: [28, 7, 43, 40, 45, 9, 25, 16, 18], pereti: [], drum: "NNNNESSSSSVSEENNEEESVVSEEENNNNNNVVVVSEEESSVVVNEE" },
  // săptămâna 38 — pozițiile 259–265 (vineri → joi)
  { id: "7-51052c60", n: 7, nivel: 3, efort: 8237, numere: [34, 6, 44, 23, 7, 37, 4], pereti: [[1, 2], [28, 29]], drum: "NNNNVSSSSSESVVVVVVNNNEENVVNNESENESSSSVVSEEENNNNN" },
  { id: "7-17e93769", n: 7, nivel: 3, efort: 10561, numere: [2, 18, 22, 13, 14], pereti: [[15, 22], [25, 26]], drum: "VVSESENENESSVSESVVNVSSEEEENNNNNESSSSSSVVVVVVNNNN" },
  { id: "7-0e32d4f4", n: 7, nivel: 4, efort: 27335, numere: [32, 28, 11, 1, 42], pereti: [[1, 2], [12, 13], [39, 46], [42, 43]], drum: "VNVVVSEESEEENNVNENVVSVVVNNESENEEEESSSSSSVVVVVNVS" },
  { id: "6-427e09bc", n: 6, nivel: 1, efort: 47, numere: [11, 3, 16, 21, 28, 33, 30, 26, 18, 1, 8, 13, 15], pereti: [], drum: "NVVSESESVVSEESVVVVVNEENVVNNNEESVSEE" },
  { id: "6-3e73528f", n: 6, nivel: 1, efort: 226, numere: [10, 5, 8, 23, 34, 21, 31, 0, 26, 19], pereti: [], drum: "ENVVVSESEESSSVNNVSSVVVNNNNNESSESSVN" },
  { id: "6-55a2f5d9", n: 6, nivel: 2, efort: 302, numere: [2, 26, 24, 32, 22, 27, 13, 17, 5], pereti: [], drum: "VVSSSEESVVSEEEEENNVSVNNVVNEENESSENN" },
  { id: "7-1564a15d", n: 7, nivel: 2, efort: 3413, numere: [4, 12, 17, 39, 37, 9, 8, 40, 6], pereti: [], drum: "ESVSVSESSVNVSVNNENNENVVVSESVSSSSEEEEEENVNENVNENN" },
  // săptămâna 39 — pozițiile 266–272 (vineri → joi)
  { id: "7-43c22dba", n: 7, nivel: 3, efort: 8077, numere: [16, 8, 30, 25, 35, 41, 0], pereti: [[5, 12], [17, 24], [36, 37]], drum: "VVNEEESENESSSSVVVNEENVVVVSESVSEEEEEENNNNNNVVVVVV" },
  { id: "7-f54b1b92", n: 7, nivel: 3, efort: 9312, numere: [10, 26, 0, 37, 48, 12], pereti: [[5, 12], [16, 17], [45, 46]], drum: "NVSSSENEESVSVVVNNNNVSSSSSSENESENESEENVNENNNNVVSE" },
  { id: "7-460e4dbb", n: 7, nivel: 4, efort: 25236, numere: [36, 34, 29, 23, 44], pereti: [[34, 41], [38, 45]], drum: "SVNNNNNNEEEEEESSSSVNNNVVVVSSSESENNVNEESSSEESVVVV" },
  { id: "6-5436a59a", n: 6, nivel: 1, efort: 59, numere: [13, 24, 25, 35, 27, 20, 9, 22, 11, 4, 8, 12], pereti: [], drum: "SVSSENESEEENVVNVNENESSENNNVVVSVNVSS" },
  { id: "6-4e70f7ba", n: 6, nivel: 1, efort: 194, numere: [26, 30, 6, 2, 7, 22, 27, 5, 15, 3], pereti: [], drum: "SVVNENVNNNEESVSESEESVSEENNNNNVSSVNN" },
  { id: "6-ecc4f110", n: 6, nivel: 2, efort: 273, numere: [16, 5, 14, 25, 22, 32, 7, 0, 3], pereti: [], drum: "ENNVSVVSESVVSEEENESSVVVVVNNNENVNEEE" },
  { id: "7-a3562f13", n: 7, nivel: 2, efort: 3854, numere: [18, 8, 22, 38, 30, 32, 9, 39, 42], pereti: [], drum: "VVVNNVSSSESVSEEENVNEESENNNVVVNEEEESSSSSSVNVSVVVV" },
  // săptămâna 40 — pozițiile 273–279 (vineri → joi)
  { id: "7-1be29c9a", n: 7, nivel: 3, efort: 9843, numere: [16, 40, 11, 27, 1, 28, 38], pereti: [[40, 41], [40, 47], [43, 44]], drum: "SSSSEEEENNVSVNNNNESSENNNVVVVVVSSSSSSENNNNNEESSSS" },
  { id: "7-ef787a3f", n: 7, nivel: 3, efort: 18339, numere: [0, 22, 38, 39, 15, 42], pereti: [[24, 25], [28, 29], [36, 43], [38, 39]], drum: "SSSSSENNESSENNNESSSENNNNVVVSVNNEEEEESSSSSSVVVVVV" },
  { id: "7-cc1d36dd", n: 7, nivel: 4, efort: 35751, numere: [36, 12, 46, 28], pereti: [[8, 9], [11, 18], [18, 25], [21, 22], [37, 44]], drum: "VSEEENVNVNENNEEESVVSSENESSVSEENNNNNNVVVVVVSESVSS" },
  { id: "6-80609558", n: 6, nivel: 1, efort: 120, numere: [22, 19, 12, 31, 26, 28, 35, 16, 8, 6, 2, 10, 4], pereti: [], drum: "VVVNVSSSENESENESENNNVVVNVVNEEESEENV" },
  { id: "6-3833deed", n: 6, nivel: 1, efort: 266, numere: [3, 11, 35, 32, 25, 21, 6, 7, 10, 28], pereti: [], drum: "EESSSSSVVVVVNEEENVVVNNNEESVSEENESSS" },
  { id: "6-90b0c27d", n: 6, nivel: 2, efort: 391, numere: [17, 28, 0, 9, 26, 25, 27, 35], pereti: [], drum: "SSVNNNENVVVVVSEEESVVVSSSEENVNEESSEE" },
  { id: "7-3a137901", n: 7, nivel: 2, efort: 3077, numere: [6, 11, 34, 18, 22, 1, 16, 47, 42], pereti: [], drum: "VVSEESSSVNNVSSVVVNEENNNVVVSEESVVSSSEEEEEESVVVVVV" },
  // săptămâna 41 — pozițiile 280–286 (vineri → joi)
  { id: "7-68cdeff2", n: 7, nivel: 3, efort: 6095, numere: [32, 15, 8, 17, 19, 28, 0], pereti: [[11, 18], [21, 28], [25, 32]], drum: "VVNNVSVNNEEESSENESSSVVVVNVSSEEEEEENNNNNNVSVNVVVV" },
  { id: "7-bfddee2f", n: 7, nivel: 3, efort: 8462, numere: [18, 2, 30, 48, 8, 26], pereti: [[30, 37], [37, 38]], drum: "SSEENNNNVVVVVVSSSEESVVSSENESEEEENVVVNNNVVNEEEESS" },
  { id: "7-e0f13b07", n: 7, nivel: 4, efort: 41799, numere: [24, 19, 14, 46], pereti: [[22, 29], [28, 29], [34, 41], [39, 40]], drum: "SESVSVNNVSSVNNNEENEESENNVVVVSVNNEEEEEESSSSVSESVV" },
  { id: "6-d115f04f", n: 6, nivel: 1, efort: 101, numere: [13, 25, 20, 7, 2, 11, 21, 16, 34, 27, 24, 12], pereti: [], drum: "SSENNNVVNEEEEESVVSSENESSSVNVSVVVNNN" },
  { id: "6-fd4ca7a6", n: 6, nivel: 1, efort: 144, numere: [13, 0, 14, 4, 16, 26, 35, 31, 25, 12], pereti: [], drum: "NVNEESSENNEESVSESVVVSEEESVVVVVNENVN" },
  { id: "6-11dbeff1", n: 6, nivel: 2, efort: 287, numere: [1, 20, 24, 25, 23, 4, 28, 7], pereti: [], drum: "VSSEESVVSSENESEEENNNNNVSSSSVNNNNVSV" },
  { id: "7-7994f1dc", n: 7, nivel: 2, efort: 1372, numere: [2, 36, 3, 27, 11, 17, 38, 34, 0], pereti: [], drum: "VSSSSSENNNNENEEESSSVNNVSVSESVSEENESSVVVVVVNNNNNN" },
  // săptămâna 42 — pozițiile 287–293 (vineri → joi)
  { id: "7-8b2a43e0", n: 7, nivel: 3, efort: 7594, numere: [18, 20, 26, 29, 22, 37, 6], pereti: [[6, 13], [9, 16], [25, 26]], drum: "ENESSVSESSVNVSVVVVNENVNEESSENENVNVVVNNESENESENEE" },
  { id: "7-e67f389a", n: 7, nivel: 3, efort: 15144, numere: [30, 21, 39, 6, 28, 44], pereti: [[7, 8], [10, 17], [11, 12], [23, 30]], drum: "ENVVVNNNEEEESVVVSEEESSSENNNNNESSSSSSVVVNVVNVSSEE" },
  { id: "7-21c64961", n: 7, nivel: 4, efort: 27432, numere: [36, 25, 7, 12, 42], pereti: [[18, 19], [26, 33], [28, 29], [32, 33]], drum: "VNNNEESVSESEENVNENVNVVVNEEEESENESSVSESVSESVVVVVV" },
  { id: "6-a0da5f6a", n: 6, nivel: 1, efort: 104, numere: [20, 1, 7, 18, 30, 26, 21, 10, 3, 5, 22, 33], pereti: [], drum: "NNNVVSESVSESVSEENENNENVNEESSSVSESVV" },
  { id: "6-d3fd740e", n: 6, nivel: 1, efort: 191, numere: [34, 32, 25, 6, 9, 4, 10, 22, 14, 27, 35], pereti: [], drum: "VVVVNENVNENVNEESENEESVSESVVNVSSEEES" },
  { id: "6-05c0c2ee", n: 6, nivel: 2, efort: 278, numere: [8, 0, 10, 28, 16, 20, 27, 25, 14], pereti: [], drum: "VVNEEESENESSSSSVNNNVSVSESVVVNENVNEE" },
  { id: "7-cb3dfe53", n: 7, nivel: 2, efort: 4147, numere: [16, 31, 19, 26, 29, 23, 13, 14, 46], pereti: [], drum: "ESSENNEESVSESSVNVVVVNENVNNEEEEENVVVVVVSSSSSSEEEE" },
  // săptămâna 43 — pozițiile 294–300 (vineri → joi)
  { id: "7-fb9fc65d", n: 7, nivel: 3, efort: 4858, numere: [20, 26, 36, 9, 45, 31, 42], pereti: [[8, 9], [10, 11], [39, 40]], drum: "SSSSVNNNNVNEENVVVVVVSESVSSSENNENNESSESSSVNNVSSVV" },
  { id: "7-f773cabf", n: 7, nivel: 3, efort: 11386, numere: [44, 39, 28, 48, 7, 2], pereti: [[5, 12], [36, 37], [37, 38]], drum: "NNESSENNNVVVSSSVNNNNEEEENESSSSSENNNNNNVVVSVVVNEE" },
  { id: "7-8e2ffb39", n: 7, nivel: 4, efort: 22012, numere: [24, 42, 34, 7, 36], pereti: [[3, 10], [5, 12], [8, 9], [18, 25], [24, 31]], drum: "ESVVVVSSEEEEEENNNNNNVVVVVVSESVSEENNESENESSSSVVVV" },
  { id: "6-99e9eded", n: 6, nivel: 1, efort: 192, numere: [14, 26, 21, 22, 29, 32, 25, 18, 6, 2, 5, 8], pereti: [], drum: "SSENNEESVSESVVVVVNENVNENVNEEEEESVVV" },
  { id: "6-766ce611", n: 6, nivel: 1, efort: 230, numere: [16, 9, 5, 22, 35, 25, 27, 8, 7, 30], pereti: [], drum: "NVNEESSSVSESVVVVNNESENNVNNVVSESVSSS" },
  { id: "6-7c6f49f6", n: 6, nivel: 2, efort: 470, numere: [8, 5, 28, 9, 19, 6, 30, 25, 35], pereti: [], drum: "NEEESSSSVVNENNVSVSVNNNVSSSSSENESEEE" },
  { id: "7-e6abec49", n: 7, nivel: 2, efort: 1448, numere: [6, 10, 26, 30, 18, 48, 28, 8, 2], pereti: [], drum: "VVVSEEESVSESVVVVNEENVVVSSSEEEEESVVVVVVNNNNNNESEN" },
  // săptămâna 44 — pozițiile 301–307 (vineri → joi)
  { id: "7-1bceb0af", n: 7, nivel: 3, efort: 5161, numere: [16, 13, 30, 4, 35, 34], pereti: [[25, 32], [32, 39], [44, 45]], drum: "ESENENNESSSVSVVVNVNNEEENVVVVSSSSESVSEENESENESENN" },
  { id: "7-968816f9", n: 7, nivel: 3, efort: 12353, numere: [36, 10, 46, 12, 7, 28], pereti: [[7, 14], [10, 17], [28, 29], [39, 40]], drum: "VSEENNVNENNEESVSSSSENNNESSSENNNNVNENVVVVVVSESVSS" },
  { id: "7-0bd7ef34", n: 7, nivel: 4, efort: 32382, numere: [32, 35, 12, 21, 42], pereti: [[18, 25], [22, 23], [24, 31]], drum: "VVVVSEEEEENNVVVNEEENVVVVSSVNNNEEEEEESSSSSSVVVVVV" },
  { id: "6-d5a4e414", n: 6, nivel: 1, efort: 62, numere: [26, 30, 18, 15, 7, 0, 3, 5, 10, 22, 35, 33, 20], pereti: [], drum: "SVVNENVNEEENVVVNEEEEESVSESVSESVVNNV" },
  { id: "6-7924954c", n: 6, nivel: 1, efort: 232, numere: [22, 35, 10, 2, 7, 21, 31, 25, 14, 19, 12], pereti: [], drum: "SSENNNVNENVVVVVSEEESSSSVVVNEENNVSVN" },
  { id: "6-e3cc9128", n: 6, nivel: 2, efort: 285, numere: [25, 12, 17, 10, 28, 23, 32, 8, 14], pereti: [], drum: "SVNNNNNEEEEESSVNVSSSENESSVVVNNVNNES" },
  { id: "7-3406aaa4", n: 7, nivel: 2, efort: 3014, numere: [30, 21, 11, 32, 29, 45, 33, 12, 8], pereti: [], drum: "NVVNEENEESVSESVSVVNVSSEEEENESENNVNENVNENVVVVVVSE" },
  // săptămâna 45 — pozițiile 308–314 (vineri → joi)
  { id: "7-7074548c", n: 7, nivel: 3, efort: 6622, numere: [6, 40, 10, 45, 8, 43, 26], pereti: [[32, 39], [45, 46]], drum: "SSSSSSVVNENVNNNVSSSSSVNNNNNVSSSSSVNNNNNNEEEEESSS" },
  { id: "7-1812c427", n: 7, nivel: 3, efort: 11680, numere: [38, 26, 8, 28, 11, 46], pereti: [[34, 41], [36, 37]], drum: "SVNNENEENVVNVVSESVSSSVNNNNNNEEEESENESSSSVVSEESVV" },
  { id: "7-9f24ca69", n: 7, nivel: 4, efort: 42849, numere: [24, 0, 36, 12, 28], pereti: [[2, 9], [4, 11], [9, 16], [10, 17]], drum: "VVVNNNEEEEEESSSSSSVVVVVVNEEEEENNNNVVVVSEEESSVVVV" },
  { id: "6-79caa371", n: 6, nivel: 1, efort: 123, numere: [29, 17, 4, 27, 9, 0, 8, 13, 20, 25, 31, 35], pereti: [], drum: "NNNNVSSSSVNNNNVVVSEESVVSEESVVSEEEEE" },
  { id: "6-958c0633", n: 6, nivel: 1, efort: 149, numere: [29, 31, 6, 19, 27, 22, 4, 20, 3, 0], pereti: [], drum: "SVVVVVNNNNESSSEEENENNNVSSVSVNNENVVV" },
  { id: "6-a59325cc", n: 6, nivel: 2, efort: 367, numere: [12, 31, 7, 3, 15, 29, 27, 10], pereti: [], drum: "SSSENNNNVNEEEEESSVVSEESSVNVSVNNNNEE" },
  { id: "7-ff0eb789", n: 7, nivel: 2, efort: 1991, numere: [14, 38, 33, 48, 30, 11, 19, 10, 22], pereti: [], drum: "SSESVSEENESENNESSENNNVVVSVNNEENESENNVVVSVNVVSESS" },
  // săptămâna 46 — pozițiile 315–321 (vineri → joi)
  { id: "7-8fdbd278", n: 7, nivel: 3, efort: 5892, numere: [46, 11, 40, 16, 42, 7, 20], pereti: [[3, 10], [8, 9]], drum: "EENNNVNNVSSSESVVSVNNENNNVSSVSSSVNNNNENVNEEEEEESS" },
  { id: "7-2e2d0f54", n: 7, nivel: 3, efort: 11921, numere: [30, 7, 19, 35, 13, 0], pereti: [[4, 11], [17, 18], [28, 29], [31, 38]], drum: "NNVVNEEESSSENNNESSSSVVVVNNVSSSEEEEEENNNNNNVVVVVV" },
  { id: "7-cf1bef17", n: 7, nivel: 4, efort: 19202, numere: [48, 25, 38, 4, 28], pereti: [[3, 4], [9, 16], [38, 39]], drum: "VVVVVVNENNNEEESVVSSENESEENVNENVNENVVSVNVSVNVSSSS" },
  { id: "6-6468efb4", n: 6, nivel: 1, efort: 132, numere: [26, 21, 9, 2, 6, 14, 19, 31, 33, 35, 22, 4, 17], pereti: [], drum: "NENNNVVVSEESVVSESVSEEENESENNVNNNESS" },
  { id: "6-d7151348", n: 6, nivel: 1, efort: 146, numere: [26, 1, 13, 25, 33, 28, 21, 11, 15, 10], pereti: [], drum: "NNNNVVSESVSESVSEEEEENVVNEENNNVVSSEN" },
  { id: "6-fb682bbb", n: 6, nivel: 2, efort: 212, numere: [23, 27, 19, 0, 9, 5, 21, 25], pereti: [], drum: "SSVNVSVVVNNENVNNESENESENESSVSVNVSSV" },
  { id: "7-21c1679b", n: 7, nivel: 2, efort: 2737, numere: [34, 5, 24, 32, 15, 11, 9, 36, 46], pereti: [], drum: "SSVNNNENNNVSSVSVSESVVNNVNEENENVVSVNVSSSSESVSEEEE" },
  // săptămâna 47 — pozițiile 322–328 (vineri → joi)
  { id: "7-28ffdd00", n: 7, nivel: 3, efort: 6244, numere: [30, 36, 47, 12, 15, 9, 48], pereti: [[23, 24], [44, 45]], drum: "NVVSESVSEENESEENVNVNENENVVSVVVNNESENEEEESSSVSESS" },
  { id: "7-08266e31", n: 7, nivel: 3, efort: 18472, numere: [24, 2, 36, 7, 12], pereti: [[13, 20], [19, 26], [31, 32], [33, 34]], drum: "NNNVSSSSESVVNNNNNVSSSSSSEEEENNNESSSENNNNVVNNEESV" },
  { id: "7-ee14f719", n: 7, nivel: 4, efort: 33302, numere: [48, 10, 35, 11, 42], pereti: [[14, 21], [24, 25]], drum: "NNNNNNVVVVVVSSENEESVSESVVNVSSEEEENNNNESSSSSVVVVV" },
  { id: "6-53d84636", n: 6, nivel: 1, efort: 130, numere: [30, 26, 13, 19, 15, 10, 7, 0, 3, 17, 28, 21, 35], pereti: [], drum: "EENVVNNESENEENVVVVNEEEEESSSSVNVSSEE" },
  { id: "6-d1a98266", n: 6, nivel: 1, efort: 287, numere: [26, 18, 27, 22, 7, 12, 1, 10, 17, 32], pereti: [], drum: "VSVNNEEESENNVVNVSVNNEEESENESSSSSVVV" },
  { id: "6-548e3762", n: 6, nivel: 2, efort: 591, numere: [26, 24, 4, 7, 16, 28, 34, 25], pereti: [], drum: "SVVNNNNNEEEEESVVVVSEEEESVSESVVNNVVS" },
  { id: "7-337c5b42", n: 7, nivel: 2, efort: 2946, numere: [4, 13, 11, 27, 23, 33, 17, 8, 34], pereti: [], drum: "EESVVSEESVVVVSEEESVVVVNNNEENNVSVNVSSSSSSEEEEEENN" },
  // săptămâna 48 — pozițiile 329–335 (vineri → joi)
  { id: "7-a3c5c9ef", n: 7, nivel: 3, efort: 4461, numere: [44, 38, 8, 27, 17, 3, 28], pereti: [[12, 19], [33, 34]], drum: "VVNEEESENNVVVNNNESSEEESSSENNNNVVVNEEENVVVVVVSSSS" },
  { id: "7-501bd1b2", n: 7, nivel: 3, efort: 11654, numere: [16, 1, 36, 33, 6, 14], pereti: [[12, 19], [18, 19], [23, 30]], drum: "NNVVSESSEESVVSEEEENVNNVNNESENESSVSESSSVVVVVVNNNN" },
  { id: "7-5c76c06c", n: 7, nivel: 4, efort: 32728, numere: [32, 35, 20, 8, 48], pereti: [[4, 11], [17, 24], [23, 24], [36, 43]], drum: "ESSVNVSVVVNNNNNNEEEEEESSVNVSVNVVSESVSSENENEEESSS" },
  { id: "6-826308d6", n: 6, nivel: 1, efort: 162, numere: [34, 24, 28, 14, 12, 7, 1, 8, 4, 16, 23, 35], pereti: [], drum: "VVVVNEEEENVNVSVVNENVNEESENEESVSESSS" },
  { id: "6-4ce94c41", n: 6, nivel: 1, efort: 179, numere: [35, 29, 27, 25, 22, 8, 4, 1, 13, 30], pereti: [], drum: "NVSVNVSVNNEEEENVVVNEEENVVVVVSESVSSS" },
  { id: "6-e545217b", n: 6, nivel: 2, efort: 655, numere: [10, 3, 16, 1, 29, 27, 26, 30, 0], pereti: [], drum: "VNEESSVVVNNVSSSEEEESSVNVSVNVSVNNNNN" },
  { id: "7-88ea7274", n: 7, nivel: 2, efort: 3444, numere: [32, 38, 34, 9, 37, 18, 26, 11, 16], pereti: [], drum: "VSEENESSVVVVVVNNNNNNEESVSSSSENNEENESENNNVSVNVSSV" },
  // săptămâna 49 — pozițiile 336–342 (vineri → joi)
  { id: "7-aba2946d", n: 7, nivel: 3, efort: 7664, numere: [38, 10, 19, 16, 44, 9, 42], pereti: [[23, 24], [33, 40], [39, 46]], drum: "SEEENVVNVNEESENNNNVVVSEESVVVSSSSVNNNNNENVVSSSSSS" },
  { id: "7-7008614e", n: 7, nivel: 3, efort: 16955, numere: [32, 23, 28, 3, 45, 22], pereti: [[8, 15], [10, 17], [28, 29], [38, 45]], drum: "VNVSVSSVNNNNNNESENESENEESVSESSSSVVVVNEEENNVNVVVS" },
  { id: "7-e1e1696a", n: 7, nivel: 4, efort: 40049, numere: [40, 17, 28, 5, 48], pereti: [[11, 18], [12, 19], [44, 45]], drum: "SVVNENENNVSVSVNNENVVSSSSESVVNNNNNNEEEESENESSSSSS" },
  { id: "6-7fd15687", n: 6, nivel: 1, efort: 107, numere: [24, 19, 12, 1, 9, 14, 28, 16, 11, 35, 33, 26, 30], pereti: [], drum: "NENVNNESENESSVSESENNNNESSSSSVVVNVSV" },
  { id: "6-c7511854", n: 6, nivel: 1, efort: 180, numere: [25, 34, 17, 3, 10, 28, 21, 18, 0, 7, 2], pereti: [], drum: "VSEEEEENNNNNVVSESSSVVNENVVSVNNNESEN" },
  { id: "6-e3f4ea80", n: 6, nivel: 2, efort: 763, numere: [28, 5, 13, 3, 0, 30, 19, 33, 32], pereti: [], drum: "SENNNNNVSSSVNVVNEENVVVSSSSSENNESESV" },
  { id: "7-ace1ca5e", n: 7, nivel: 2, efort: 1484, numere: [14, 11, 20, 33, 37, 8, 31, 18, 24], pereti: [], drum: "NNEEESENEESVSESVSESSVNVSVNVSVVNENVNENNESSSEENNVS" },
  // săptămâna 50 — pozițiile 343–349 (vineri → joi)
  { id: "7-c0bafb20", n: 7, nivel: 3, efort: 5271, numere: [30, 25, 38, 16, 34, 0, 44], pereti: [[2, 3], [11, 18], [40, 41]], drum: "ENESSSVNVVNNENEEESSSSENNNNNNVSVNVSVNVVSESVSSSSEE" },
  { id: "7-2209942d", n: 7, nivel: 3, efort: 15574, numere: [16, 30, 42, 10, 12, 8], pereti: [[10, 11], [32, 39], [38, 39], [40, 47]], drum: "NNVVSSSSEESVVSEEENNEESVSEENNNNNNVVVSSENESSVVVVNN" },
  { id: "7-96ab2f92", n: 7, nivel: 4, efort: 56305, numere: [24, 0, 35, 8], pereti: [[14, 21], [15, 16], [23, 30]], drum: "VNEESSVVVVNENVNNEEEEEESSSSSSVVVVVVNEEEEENNNNVVVV" },
  { id: "6-5c2f8659", n: 6, nivel: 1, efort: 103, numere: [15, 12, 8, 22, 26, 18, 30, 27, 35, 23, 11, 4, 0], pereti: [], drum: "VVVNEEEESSVVSVNVSSEEENESENNNNNVVVVV" },
  { id: "6-d352da6c", n: 6, nivel: 1, efort: 166, numere: [8, 9, 0, 13, 26, 30, 27, 29, 16, 4], pereti: [], drum: "SENNVVVSESVSEESVVSEEENNESSENNNVNENV" },
  { id: "6-570f3c06", n: 6, nivel: 2, efort: 1217, numere: [22, 10, 9, 26, 1, 7, 25, 29, 35], pereti: [], drum: "ENVNENVVSSSSVNNNNVVSESVSESVSEEEENES" },
  { id: "7-402e35e2", n: 7, nivel: 2, efort: 2406, numere: [16, 7, 11, 38, 23, 37, 22, 33, 0], pereti: [], drum: "VVNEEESENESSVSSVNNVSSVNNVSSSEEEEEENVNENNNNVVVVVV" },
  // săptămâna 51 — pozițiile 350–356 (vineri → joi)
  { id: "7-bf8b61d4", n: 7, nivel: 3, efort: 5651, numere: [38, 47, 40, 24, 26, 42, 6], pereti: [[17, 24], [23, 30], [26, 33]], drum: "NVSSEEEENNVSVNNVVNEEESENNVVVVVSSSSSVNNNNNNEEEEEE" },
  { id: "7-695885d8", n: 7, nivel: 3, efort: 11682, numere: [32, 21, 37, 12, 40], pereti: [[1, 2], [4, 5], [20, 27]], drum: "ENESSSVVVVVVNNNNNNESSSSSENNNENVNEESENESSVVSVSSEE" },
  { id: "7-a3a76ee8", n: 7, nivel: 4, efort: 35492, numere: [18, 32, 14, 39, 6], pereti: [[14, 15], [19, 26], [33, 34], [35, 36]], drum: "ENNVSVNVSSESEESVVSVVNENVNNNVSSSSSSEEEENESENNNNNN" },
  { id: "6-c5cf25ce", n: 6, nivel: 1, efort: 195, numere: [10, 3, 14, 2, 7, 12, 22, 17, 35, 31, 25, 28], pereti: [], drum: "ENVVSSVNNVVSESVSEEEENESSSVVVVVNEEEE" },
  { id: "6-e2515481", n: 6, nivel: 1, efort: 149, numere: [2, 11, 13, 0, 18, 20, 24, 21, 22, 29], pereti: [], drum: "EEESVVVSVNNVSSSEESVVSEEENNNEESVSSEN" },
  { id: "6-0cab3008", n: 6, nivel: 2, efort: 388, numere: [33, 12, 10, 17, 20, 8, 28, 22], pereti: [], drum: "VVVNNNNNEEESENESSVVSVNNVSSSEEESENNV" },
  { id: "7-de531dd1", n: 7, nivel: 2, efort: 4108, numere: [38, 44, 11, 16, 1, 36, 40, 19, 8], pereti: [], drum: "VSEEEENNNNNNVSVNVSSVNNVVSSSSSSENNEEESENNNVSVVVNN" },
  // săptămâna 52 — pozițiile 357–363 (vineri → joi)
  { id: "7-b9e18a6e", n: 7, nivel: 3, efort: 4747, numere: [18, 4, 39, 29, 37, 6, 48], pereti: [[8, 9], [16, 17], [16, 23]], drum: "VNENVVSSVNNVSSSEEEESSVNVVVSSENESEEENNNNNNESSSSSS" },
  { id: "7-ba44d5fd", n: 7, nivel: 3, efort: 14060, numere: [10, 33, 15, 45, 37, 4], pereti: [[2, 9], [35, 36], [36, 43], [40, 41]], drum: "EENESSSSSSVNNNNVVVNVSSEEESSSVNNVVSESVVNNNNNNEEEE" },
  { id: "7-7ae1a3a2", n: 7, nivel: 4, efort: 23069, numere: [24, 3, 40, 7, 4], pereti: [[24, 31], [25, 26], [28, 35], [38, 45]], drum: "ENVVNNESEESSSSVNVSVNNVNNNVSSSSESVSEEEEEENNNNNNVV" },
  { id: "6-bd947623", n: 6, nivel: 1, efort: 71, numere: [1, 5, 17, 35, 32, 28, 21, 10, 20, 31, 12, 7, 0], pereti: [], drum: "EEEESSSSSVVVNEENVNENVVSSVSSVNNNENVN" },
  { id: "6-a7b57a1b", n: 6, nivel: 1, efort: 172, numere: [19, 26, 18, 1, 14, 3, 29, 33, 9, 20], pereti: [], drum: "SESVVNNNNNESSENNEEESSSSSVVNENNNVSSV" },
  { id: "6-eacbad93", n: 6, nivel: 2, efort: 425, numere: [14, 25, 1, 3, 10, 15, 29, 22, 18], pereti: [], drum: "SSVNNVNNESENEEESVVSEESSSVNNVSSVVVNN" },
  { id: "7-408572a3", n: 7, nivel: 2, efort: 3966, numere: [14, 48, 13, 39, 17, 31, 11, 8, 38], pereti: [], drum: "SSSSEEEEEENNNNNNVSSSSSVNNNVSSVNNNEENVVVVSESSSSEE" },
];
// ==== BANC:SFÂRȘIT ====

// ─── Geometria tablei ────────────────────────────────────────────────────────────────

/** Căsuța vecină lui c în direcția d ("N" sus, "S" jos, "E" dreapta, "V" stânga), sau -1 la margine. */
export function vecin(n, c, d) {
  const r = Math.floor(c / n), k = c % n;
  if (d === "N") return r > 0 ? c - n : -1;
  if (d === "S") return r < n - 1 ? c + n : -1;
  if (d === "E") return k < n - 1 ? c + 1 : -1;
  if (d === "V") return k > 0 ? c - 1 : -1;
  return -1;
}

/** Căsuțele a și b sunt vecine sus/jos/stânga/dreapta (nu pe diagonală, nu peste margine). */
export function suntVecine(n, a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n * n || b >= n * n) return false;
  const d = Math.abs(a - b);
  return d === n || (d === 1 && Math.floor(a / n) === Math.floor(b / n));
}

/** Există un perete între căsuțele a și b? */
export function arePerete(p, a, b) {
  const x = Math.min(a, b), y = Math.max(a, b);
  return p.pereti.some(([u, v]) => u === x && v === y);
}

/** Numărul scris în căsuța c (1..K), sau 0 dacă e goală. */
export function numarLa(p, c) {
  return p.numere.indexOf(c) + 1;
}

/** Soluția ca listă de căsuțe (n² indecși), decodată din șirul de direcții. */
export function decodeazaDrum(p) {
  const out = [p.numere[0]];
  for (const d of p.drum) out.push(vecin(p.n, out[out.length - 1], d));
  return out;
}

// ─── Regulile ────────────────────────────────────────────────────────────────────────

/** Câte numere a atins deja traseul (= cel mai mare număr atins, pentru un traseu valid). */
export function numereAtinse(p, traseu) {
  let k = 0;
  for (const c of traseu) if (numarLa(p, c)) k++;
  return k;
}

/**
 * Poate traseul să continue din capătul lui în căsuța c? "" = da; altfel motivul:
 *   "afara"   c nu e pe tablă
 *   "departe" c nu e vecină (sus/jos/stânga/dreapta) cu capătul traseului
 *   "ocupata" c e deja pe traseu (întoarcerea pe pasul anterior o tratează pagina, separat)
 *   "perete"  între capăt și c e un perete
 *   "final"   capătul e pe ultimul număr: din K nu mai pleci până nu e plină tabla
 *   "ordine"  c are un număr, dar nu pe cel care urmează
 */
export function verificaPas(p, traseu, c) {
  const n = p.n, cap = traseu[traseu.length - 1];
  if (!Number.isInteger(c) || c < 0 || c >= n * n) return "afara";
  if (!suntVecine(n, cap, c)) return "departe";
  if (traseu.includes(c)) return "ocupata";
  if (arePerete(p, cap, c)) return "perete";
  if (cap === p.numere[p.numere.length - 1]) return "final";
  const k = numarLa(p, c);
  if (k && k !== numereAtinse(p, traseu) + 1) return "ordine";
  return "";
}

/** Un traseu parțial valid: pornește din 1 și fiecare pas respectă regulile (pentru restaurare). */
export function traseuValid(p, traseu) {
  if (!Array.isArray(traseu) || !traseu.length || traseu[0] !== p.numere[0]) return false;
  for (let i = 1; i < traseu.length; i++) {
    if (verificaPas(p, traseu.slice(0, i), traseu[i])) return false;
  }
  return true;
}

/**
 * Câștig = verificare completă a regulilor, independentă de soluția stocată: n² căsuțe
 * distincte, fiecare pas între vecine fără perete, începe pe 1, se termină pe K și atinge
 * numerele exact în ordinea 1, 2, …, K.
 */
export function eCastig(p, traseu) {
  const n = p.n, N = n * n, K = p.numere.length;
  if (!Array.isArray(traseu) || traseu.length !== N) return false;
  if (traseu[0] !== p.numere[0] || traseu[N - 1] !== p.numere[K - 1]) return false;
  const vazut = new Set();
  let urmator = 1;
  for (let i = 0; i < N; i++) {
    const c = traseu[i];
    if (!Number.isInteger(c) || c < 0 || c >= N || vazut.has(c)) return false;
    vazut.add(c);
    if (i > 0 && (!suntVecine(n, traseu[i - 1], c) || arePerete(p, traseu[i - 1], c))) return false;
    const k = numarLa(p, c);
    if (k) {
      if (k !== urmator) return false;
      urmator++;
    }
  }
  return urmator === K + 1;
}

/** Lungimea celui mai lung început al traseului care coincide cu soluția. */
export function prefixCorect(p, traseu) {
  const sol = decodeazaDrum(p);
  let i = 0;
  while (i < traseu.length && i < sol.length && traseu[i] === sol[i]) i++;
  return i;
}

/**
 * Indiciul: taie traseul la cel mai lung început corect și îl prelungește cu un pas corect.
 * → { traseu, celula } (celula = pasul adăugat), sau null dacă traseul e deja soluția.
 */
export function indiciu(p, traseu) {
  const sol = decodeazaDrum(p);
  const L = Math.max(1, prefixCorect(p, traseu));
  if (L >= sol.length) return null;
  return { traseu: sol.slice(0, L + 1), celula: sol[L] };
}

// ─── Puzzle-ul zilei ─────────────────────────────────────────────────────────────────

/** YYYYMMDD → milisecunde UTC (miezul nopții), ca să numărăm zile reale din calendar. */
function msUTC(zi) {
  return Date.UTC(Math.floor(zi / 10000), Math.floor((zi % 10000) / 100) - 1, zi % 100);
}

/** Zile întregi de la START până la `zi` (YYYYMMDD); zilele dinainte (și seed-urile invalide) → 0. */
export function zileDeLaStart(zi) {
  const d = Math.round((msUTC(zi) - msUTC(START)) / 86400000);
  return d > 0 ? d : 0;
}

/** Indexul în BANC al puzzle-ului zilei. */
export function indexZilei(zi) {
  return zileDeLaStart(zi) % BANC.length;
}

/** Puzzle-ul zilei `zi` (YYYYMMDD). */
export function puzzleZilei(zi) {
  return BANC[indexZilei(zi)];
}

/** Numărul ediției afișat în pagină și în share: 1 în prima zi. */
export function editia(zi) {
  return zileDeLaStart(zi) + 1;
}

/** Ziua săptămânii (0 = duminică … 6 = sâmbătă) în care se joacă poziția i din bancă. */
export function ziuaPozitiei(i) {
  return (new Date(msUTC(START)).getUTCDay() + i) % 7;
}

// ─── Afișare și share ────────────────────────────────────────────────────────────────

/** Secunde → "m:ss" (minutele pot trece de 59: "75:03"). */
export function formatTimp(secunde) {
  const s = Math.max(0, Math.floor(Number(secunde) || 0));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

/** Textul de scor pentru share: „Traseu #12 · 2:05 · fără indicii". */
export function textShare(editie, secunde, indiciiFolosite) {
  return NUME + " #" + editie + " · " + formatTimp(secunde) + (indiciiFolosite ? "" : " · fără indicii");
}

/** Rândul emoji pentru share (emoji doar aici, nu în interfață). */
export function grilaShare(p) {
  return "🧭 " + p.n + "×" + p.n;
}
