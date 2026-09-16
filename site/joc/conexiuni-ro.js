// Conexiuni RO — 12 puzzle-uri curatoriate de manager (17.09.2026).
// Formă: puzzle = ARRAY de 4 grupe {tema, cuvinte:[4]}; 16 cuvinte UNICE per puzzle.
// Momeli intenționate: kiwi (pasăre, nu fruct), in (țesătură), fluture/spate (înot), nebun (șah).
export const PUZZLES = [
  [
    { tema: "FELINE", cuvinte: ["tigru", "leopard", "pumă", "ghepard"] },
    { tema: "PEȘTI", cuvinte: ["crap", "somn", "biban", "știucă"] },
    { tema: "MONEDE", cuvinte: ["euro", "dolar", "yen", "rublă"] },
    { tema: "INSTRUMENTE CU COARDE", cuvinte: ["vioară", "chitară", "țambal", "harpă"] },
  ],
  [
    { tema: "NUANȚE", cuvinte: ["turcoaz", "indigo", "ocru", "grena"] },
    { tema: "PLANTE AROMATICE", cuvinte: ["cimbru", "busuioc", "mărar", "leuștean"] },
    { tema: "DANSURI POPULARE", cuvinte: ["horă", "sârbă", "brâu", "călușari"] },
    { tema: "RÂURI DIN ROMÂNIA", cuvinte: ["olt", "mureș", "jiu", "someș"] },
  ],
  [
    { tema: "JOCURI DE COPILĂRIE", cuvinte: ["șotron", "elastic", "ascunselea", "leapșa"] },
    { tema: "PIESE DE ȘAH", cuvinte: ["tură", "nebun", "pion", "regină"] },
    { tema: "TRANSPORT DE ALTĂDATĂ", cuvinte: ["căruță", "trăsură", "sanie", "diligență"] },
    { tema: "UNELTE", cuvinte: ["ciocan", "daltă", "pilă", "clește"] },
  ],
  [
    { tema: "MUNȚI DIN ROMÂNIA", cuvinte: ["făgăraș", "bucegi", "retezat", "rodnei"] },
    { tema: "BRÂNZETURI", cuvinte: ["telemea", "cașcaval", "urdă", "năsal"] },
    { tema: "DANSURI LATINO", cuvinte: ["salsa", "tango", "rumba", "samba"] },
    { tema: "METALE", cuvinte: ["fier", "cupru", "zinc", "plumb"] },
  ],
  [
    { tema: "PĂSĂRI CARE NU ZBOARĂ", cuvinte: ["struț", "pinguin", "kiwi", "emu"] },
    { tema: "FRUCTE EXOTICE", cuvinte: ["mango", "papaya", "litchi", "guava"] },
    { tema: "ZODII", cuvinte: ["berbec", "rac", "fecioară", "balanță"] },
    { tema: "PERIOADE DE TIMP", cuvinte: ["secol", "deceniu", "mileniu", "veac"] },
  ],
  [
    { tema: "CAPITALE EUROPENE", cuvinte: ["viena", "praga", "atena", "lisabona"] },
    { tema: "VÂNTURI", cuvinte: ["crivăț", "austru", "băltăreț", "zefir"] },
    { tema: "PRODUSE APICOLE", cuvinte: ["miere", "ceară", "propolis", "polen"] },
    { tema: "OASE", cuvinte: ["femur", "tibie", "radius", "stern"] },
  ],
  [
    { tema: "SPORTURI DE IARNĂ", cuvinte: ["schi", "bob", "biatlon", "patinaj"] },
    { tema: "LEGUME RĂDĂCINOASE", cuvinte: ["morcov", "păstârnac", "ridiche", "sfeclă"] },
    { tema: "ȚESĂTURI", cuvinte: ["mătase", "catifea", "in", "borangic"] },
    { tema: "SEMNE DE PUNCTUAȚIE", cuvinte: ["virgulă", "punct", "cratimă", "paranteză"] },
  ],
  [
    { tema: "ROMANE ROMÂNEȘTI", cuvinte: ["ion", "baltagul", "moromeții", "mara"] },
    { tema: "PRENUME", cuvinte: ["vasile", "maria", "elena", "andrei"] },
    { tema: "INSTRUMENTE DE SUFLAT", cuvinte: ["nai", "fluier", "trompetă", "taragot"] },
    { tema: "METALE PREȚIOASE", cuvinte: ["aur", "argint", "platină", "paladiu"] },
  ],
  [
    { tema: "STILURI DE ÎNOT", cuvinte: ["craul", "bras", "fluture", "spate"] },
    { tema: "INSECTE", cuvinte: ["albină", "greier", "libelulă", "licurici"] },
    { tema: "PĂRȚI ALE CORPULUI", cuvinte: ["umăr", "gleznă", "coapsă", "tâmplă"] },
    { tema: "JOCURI DE CĂRȚI", cuvinte: ["macao", "canastă", "șeptică", "whist"] },
  ],
  [
    { tema: "FENOMENE METEO", cuvinte: ["brumă", "polei", "lapoviță", "vijelie"] },
    { tema: "PRĂJITURI", cuvinte: ["amandină", "savarină", "cremșnit", "joffre"] },
    { tema: "ȚĂRI FĂRĂ IEȘIRE LA MARE", cuvinte: ["elveția", "austria", "ungaria", "serbia"] },
    { tema: "DANSURI DE SALON", cuvinte: ["vals", "polcă", "menuet", "cadril"] },
  ],
  [
    { tema: "CONSTELAȚII", cuvinte: ["orion", "lira", "vulturul", "lebăda"] },
    { tema: "PĂSĂRI DE BALTĂ", cuvinte: ["barză", "stârc", "cocor", "pescăruș"] },
    { tema: "PIETRE PREȚIOASE", cuvinte: ["rubin", "safir", "smarald", "topaz"] },
    { tema: "TIPURI DE PÂINE", cuvinte: ["franzelă", "baghetă", "lipie", "graham"] },
  ],
  [
    { tema: "ARTE MARȚIALE", cuvinte: ["judo", "karate", "aikido", "sumo"] },
    { tema: "GUSTURI", cuvinte: ["dulce", "sărat", "amar", "acru"] },
    { tema: "ANOTIMPURI", cuvinte: ["primăvară", "vară", "toamnă", "iarnă"] },
    { tema: "FORME GEOMETRICE", cuvinte: ["romb", "trapez", "elipsă", "hexagon"] },
  ],
];

/* Amestec determinist (xorshift) — același pentru toți jucătorii în aceeași zi. */
function amestecSeed(seed) {
  let x = seed >>> 0;
  x ^= (x << 13) >>> 0;
  x ^= x >>> 17;
  x ^= (x << 5) >>> 0;
  return x >>> 0;
}

/** Indexul puzzle-ului zilei — determinist, ne-secvențial. */
export function puzzleZilei(seed) {
  return amestecSeed(seed) % PUZZLES.length;
}

/** Ordinea de afișare a celor 16 cuvinte — amestec determinist pe seed. */
export function ordineaZilei(seed, n = 16) {
  const idx = Array.from({ length: n }, (_, i) => i);
  let x = amestecSeed(seed ^ 0x9e3779b9);
  for (let i = n - 1; i > 0; i--) {
    x = amestecSeed(x);
    const j = x % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/**
 * Evaluează o încercare de 4 cuvinte contra puzzle-ului (array de 4 grupe).
 * → { corect, tema|null, grupa|null, aproape } ; aproape = exact 3 din aceeași grupă.
 */
export function evalueazaIncercare(puzzle, patruCuvinte) {
  let maxim = 0, gasit = -1;
  for (let g = 0; g < puzzle.length; g++) {
    const inGrupa = patruCuvinte.filter((c) => puzzle[g].cuvinte.includes(c)).length;
    if (inGrupa > maxim) { maxim = inGrupa; gasit = g; }
  }
  if (maxim === 4) return { corect: true, tema: puzzle[gasit].tema, grupa: gasit, aproape: false };
  return { corect: false, tema: null, grupa: null, aproape: maxim === 3 };
}
