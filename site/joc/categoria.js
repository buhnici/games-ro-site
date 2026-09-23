// Categoria — banca de puzzle-uri + potrivirea răspunsurilor + alegerea zilei (v1, 24.09.2026).
// Modul pur, fără DOM, testabil în Node. Pagina: site-live/joc/categoria.html
// Testul: games/teste/categoria.test.mjs (rulează: node games/teste/categoria.test.mjs)
//
// ─── JOCUL ───────────────────────────────────────────────────────────────────────────
// În fiecare zi, o categorie ascunsă. Cinci indicii apar pe rând, de la cel mai ambiguu la
// cel mai evident. După fiecare indiciu, jucătorul are o singură încercare. Scorul = câte
// indicii i-au trebuit (1–5).
//
// ─── FORMATUL UNUI PUZZLE ─────────────────────────────────────────────────────────────
//   id        — unic, stabil (intră în cheia de stocare a zilei; nu-l redenumi după lansare)
//   categorie — numele afișat la final
//   indicii   — 5 cuvinte distincte, TOATE din categorie; indiciul 1 se potrivește și cu
//               „momeala" (altă categorie plauzibilă), indiciul 5 face categoria aproape evidentă
//   explicatie— o frază afișată la final
//   momeala   — categoria-capcană a primului indiciu (nu apare în joc; o testăm ca greșită)
//   accepta   — formulări acceptate întocmai (comparate după normalizeaza())
//   chei      — seturi de tulpini: răspunsul e corect dacă, pentru UN set, FIECARE tulpină e
//               începutul unei tulpini din răspuns (vezi potrivire())
//   teste     — da: răspunsuri care TREBUIE acceptate; nu: care TREBUIE respinse;
//               aproape (opțional): respinse, dar cu mesajul „Aproape!"
//   surse     — paginile pe care am verificat faptele care nu sunt cunoștințe generale
//   domeniu   — pentru varietate: două zile la rând nu au același domeniu (verifică testul)
//   ro        — true = aromă românească (minimum 60% din bancă, verifică testul)
//
// Ordinea din BANC e ordinea zilelor. Puzzle-uri noi: la coada listei, cu același format.

/** Prima zi de joc (YYYYMMDD, ora României). Ediția #1. */
export const START = 20260925;

/** Încercări pe zi = numărul de indicii. */
export const MAX_INCERCARI = 5;

/** Răspunsuri mai lungi de atât (cuvinte, fără cuvintele de legătură) sunt refuzate de pagină
 *  fără să consume încercarea — altfel s-ar putea „ghici" cu o listă de categorii. */
export const MAX_CUVINTE = 8;

export const BANC = [
  {
    id: "lucruri-cu-dinti",
    categorie: "Lucruri care au dinți",
    indicii: ["Fermoar", "Greblă", "Pieptene", "Fierăstrău", "Roată dințată"],
    explicatie: "Toate au dinți: fermoarul, grebla, pieptenele, fierăstrăul și roata dințată.",
    momeala: "Închizători pentru haine (fermoarul)",
    accepta: ["dinți", "lucruri cu dinți", "lucruri care au dinți", "obiecte cu dinți", "au dinți"],
    chei: [["dint"], ["dantur"], ["zimt"]],
    teste: {
      da: ["lucruri care au dinți", "Lucruri cu dinti", "obiecte cu dinți", "au dinți", "lucruri dințate", "unelte și obiecte cu dinți din casa noastră"],
      nu: ["închizători pentru haine", "unelte de grădină", "unelte", "lucruri ascuțite", "lucruri care taie", "accesorii de păr"],
    },
    surse: ["https://dexonline.ro/definitie/fermoar", "https://dexonline.ro/definitie/greblă"],
    domeniu: "lateral", ro: false,
  },
  {
    id: "statiuni-litoral",
    categorie: "Stațiuni de pe litoralul românesc",
    indicii: ["Venus", "Saturn", "Neptun", "Olimp", "Mamaia"],
    explicatie: "Toate sunt stațiuni de pe litoralul Mării Negre; primele trei poartă nume de planete, iar Olimp e muntele zeilor.",
    momeala: "Planete (Venus, Saturn, Neptun)",
    accepta: ["litoral", "stațiuni de la mare", "stațiuni de pe litoral", "stațiuni la mare", "la mare"],
    chei: [["litoral"], ["statiun", "mar"], ["mar", "neagr"]],
    teste: {
      da: ["stațiuni de pe litoral", "Statiuni de la mare", "litoralul românesc", "stațiunile de pe litoralul Mării Negre", "Marea Neagră", "stațiuni la mare din țara noastră"],
      nu: ["planete", "zei romani", "stațiuni montane", "stațiuni balneare", "orașe", "corpuri cerești"],
      aproape: ["stațiuni", "stațiuni montane"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Litoralul_românesc"],
    domeniu: "geografie", ro: true,
  },
  {
    id: "carne-tocata",
    categorie: "Mâncăruri cu carne tocată",
    indicii: ["Mici", "Perișoare", "Sarmale", "Musaca", "Chiftele"],
    explicatie: "Toate se fac cu carne tocată; „mici” și „perișoare” par la început doar cuvinte despre lucruri mărunte.",
    momeala: "Mâncăruri la grătar (micii)",
    accepta: ["carne tocată", "tocătură"],
    chei: [["carn", "toc"], ["tocatur"]],
    teste: {
      da: ["carne tocată", "Mancaruri cu carne tocata", "preparate din carne tocată", "tocătură", "feluri de mâncare cu carne tocată din țara noastră", "CARNE TOCATA"],
      nu: ["mâncăruri la grătar", "grătar", "mâncăruri românești", "diminutive", "mâncăruri de Crăciun", "legume umplute"],
      aproape: ["mâncăruri cu carne", "carne"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Mititei", "https://ro.wikipedia.org/wiki/Sarmale", "https://ro.wikipedia.org/wiki/Musaca", "https://ro.wikipedia.org/wiki/Salată_de_boeuf"],
    domeniu: "mancare", ro: true,
  },
  {
    id: "opere-creanga",
    categorie: "Opere de Ion Creangă",
    indicii: ["Punguța cu doi bani", "Capra cu trei iezi", "Ursul păcălit de vulpe", "Povestea lui Harap-Alb", "Amintiri din copilărie"],
    explicatie: "Toate sunt scrise de Ion Creangă; primele două au și câte un număr în titlu.",
    momeala: "Titluri care conțin un număr",
    accepta: ["Creangă", "Ion Creangă"],
    chei: [["creang"]],
    teste: {
      da: ["Ion Creangă", "opere de Creanga", "povești de Ion Creangă", "scrierile lui Creangă", "CREANGA", "cărți scrise de Creangă, din țara noastră"],
      nu: ["titluri care conțin un număr", "basme cu animale", "povești", "opere de Eminescu", "Ispirescu", "basme românești"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Ion_Creangă"],
    domeniu: "literatura", ro: true,
  },
  {
    id: "termeni-sah",
    categorie: "Termeni din șah",
    indicii: ["Pat", "Nebun", "Remiză", "Gambit", "Rocadă"],
    explicatie: "Toate sunt termeni din șah: patul duce la remiză, nebunul e o piesă, iar gambitul și rocada sunt mutări.",
    momeala: "Mobilier (patul)",
    accepta: ["șah", "termeni din șah", "șahul"],
    chei: [["sah"]],
    teste: {
      da: ["termeni din șah", "Sah", "cuvinte din jocul de șah", "șahul", "vocabular de șahist", "termeni de sah"],
      nu: ["mobilier", "piese de mobilier", "jocuri de cărți", "sporturi", "adjective"],
    },
    surse: ["https://dexonline.ro/definitie/pat", "https://dexonline.ro/definitie/remiză", "https://dexonline.ro/definitie/gambit", "https://dexonline.ro/definitie/rocadă"],
    domeniu: "joc", ro: false,
  },
  {
    id: "dansuri-populare",
    categorie: "Dansuri populare românești",
    indicii: ["Brâul", "Ciobănașul", "Alunelul", "Sârba", "Hora"],
    explicatie: "Toate sunt dansuri populare românești; brâul e și cingătoarea din portul popular.",
    momeala: "Piese ale costumului popular (brâul)",
    accepta: ["dansuri", "jocuri populare", "jocuri populare românești", "jocuri tradiționale", "jocuri tradiționale românești", "hore", "hore și sârbe"],
    chei: [["dans"]],
    teste: {
      da: ["dansuri populare", "Dansuri", "dansuri populare din tara noastra", "jocuri populare", "DANSURI TRADITIONALE ROMANESTI", "dansul popular"],
      nu: ["piese ale costumului popular", "port popular", "cântece populare", "instrumente populare", "diminutive", "meserii"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Categorie:Dansuri_populare_românești", "https://ro.wikipedia.org/wiki/Brâu_(dans)", "https://ro.wikipedia.org/wiki/Ciobănașul", "https://ro.wikipedia.org/wiki/Alunelul"],
    domeniu: "folclor", ro: true,
  },
  {
    id: "metale",
    categorie: "Metale",
    indicii: ["Mercur", "Cobalt", "Plumb", "Cupru", "Fier"],
    explicatie: "Toate sunt metale; mercurul e și o planetă, iar cobaltul și o nuanță de albastru.",
    momeala: "Planete (Mercur)",
    accepta: ["metale", "metal"],
    chei: [["meta"], ["element", "meta"]],
    teste: {
      da: ["metale", "Metal", "metalele", "elemente metalice", "metale grele", "METALE DIN TABELUL PERIODIC"],
      nu: ["planete", "culori", "nuanțe de albastru", "elemente chimice", "minerale", "gaze nobile"],
      aproape: ["elemente chimice"],
    },
    surse: [],
    domeniu: "stiinta", ro: false,
  },
  {
    id: "orase-romania",
    categorie: "Orașe din România",
    indicii: ["Brad", "Vulcan", "Roman", "Bușteni", "Baia Mare"],
    explicatie: "Toate sunt orașe din România; primele trei sunt și cuvinte obișnuite: brad, vulcan, roman.",
    momeala: "Copaci (bradul)",
    accepta: ["orașe", "orașe din România", "municipii", "localități"],
    chei: [["oras"], ["municip"], ["localit"]],
    teste: {
      da: ["orașe", "Orase din Romania", "orașe din țara noastră", "orașul", "municipii și orașe", "orase romanesti"],
      nu: ["copaci", "forme de relief", "genuri literare", "stațiuni montane", "județe", "sate"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Brad,_Hunedoara", "https://ro.wikipedia.org/wiki/Vulcan,_Hunedoara", "https://ro.wikipedia.org/wiki/Roman,_Neamț", "https://ro.wikipedia.org/wiki/Bușteni"],
    domeniu: "geografie", ro: true,
  },
  {
    id: "cuvinte-pentru-bani",
    categorie: "Cuvinte pentru „bani”",
    indicii: ["Mălai", "Cașcaval", "Verzișori", "Lovele", "Parale"],
    explicatie: "Toate înseamnă „bani” în vorbirea familiară sau în argou; mălaiul și cașcavalul par la început de mâncat.",
    momeala: "Alimente (mălai, cașcaval)",
    accepta: ["bani", "banii", "sinonime pentru bani", "argou pentru bani", "cuvinte pentru bani"],
    chei: [["ban", "cuvint"], ["ban", "sinonim"], ["ban", "argo"], ["ban", "popul"], ["ban", "expres"], ["ban", "denumir"], ["ban", "famil"], ["banut"]],
    teste: {
      da: ["bani", "Cuvinte pentru bani", "sinonime pentru bani", "banii în argou", "denumiri populare pentru bani din țara noastră", "BANI"],
      nu: ["alimente", "mâncăruri", "brânzeturi", "monede vechi", "culori"],
    },
    surse: ["https://dexonline.ro/definitie/mălai", "https://dexonline.ro/definitie/cașcaval", "https://dexonline.ro/definitie/verzișor", "https://dexonline.ro/definitie/lovele", "https://dexonline.ro/definitie/para"],
    domeniu: "limba", ro: true,
  },
  {
    id: "obiceiuri-anul-nou",
    categorie: "Obiceiuri de Anul Nou",
    indicii: ["Capra", "Ursul", "Semănatul", "Sorcova", "Plugușorul"],
    explicatie: "Toate sunt obiceiuri românești de Anul Nou; capra și ursul sunt aici jocuri cu măști, nu animale.",
    momeala: "Animale domestice (capra)",
    accepta: ["obiceiuri de iarnă", "obiceiuri de Anul Nou", "datini", "urături", "tradiții de Anul Nou", "obiceiuri de Revelion"],
    chei: [["obicei", "anul"], ["obicei", "iarn"], ["obicei", "revelion"], ["obicei", "craciun"], ["obicei", "sarbator"],
      ["tradit", "anul"], ["tradit", "iarn"], ["tradit", "craciun"], ["datin", "anul"], ["datin", "iarn"],
      ["urat", "anul"], ["colind", "obicei"]],
    teste: {
      da: ["obiceiuri de Anul Nou", "Obiceiuri de iarna", "tradiții de Anul Nou din țara noastră", "datini", "obiceiul de Anul Nou", "obiceiuri de Revelion", "urături"],
      nu: ["animale domestice", "animale", "obiceiuri de Paște", "jocuri de copii", "dansuri populare", "colinde"],
      aproape: ["obiceiuri", "tradiții", "colinde"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Plugușorul", "https://ro.wikipedia.org/wiki/Capra_(etnografie)", "https://ro.wikipedia.org/wiki/Urs_(etnografie)"],
    domeniu: "folclor", ro: true,
  },
  {
    id: "insecte",
    categorie: "Insecte",
    indicii: ["Cosaș", "Călugăriță", "Rădașcă", "Greier", "Buburuză"],
    explicatie: "Toate sunt insecte; cosașul și călugărița par la început un om care cosește și o măicuță.",
    momeala: "Oameni și ocupațiile lor (cosașul)",
    accepta: ["insecte", "insectă", "gâze", "gângănii"],
    chei: [["insect"], ["gang"]],
    teste: {
      da: ["insecte", "Insecta", "gâze", "gângănii", "insectele din grădina noastră", "INSECTE"],
      nu: ["oameni și ocupațiile lor", "meserii", "păsări", "animale", "viermi"],
    },
    surse: ["https://dexonline.ro/definitie/cosaș", "https://dexonline.ro/definitie/călugăriță", "https://dexonline.ro/definitie/rădașcă"],
    domeniu: "natura", ro: false,
  },
  {
    id: "castele",
    categorie: "Castele din România",
    indicii: ["Sturdza", "Cantacuzino", "Corvin", "Peleș", "Bran"],
    explicatie: "Toate dau nume unor castele din România: Sturdza de la Miclăușeni, Cantacuzino din Bușteni, Castelul Corvinilor, Peleș și Bran.",
    momeala: "Familii nobiliare (Sturdza, Cantacuzino)",
    accepta: ["castele", "castele din România", "castelul", "castele românești"],
    chei: [["cast"], ["cetat", "cast"], ["palat", "cast"]],
    teste: {
      da: ["castele", "Castele din Romania", "castelele din țara noastră", "castel", "castele medievale", "castele si palate"],
      nu: ["familii nobiliare", "familii boierești", "domnitori", "cetăți", "mănăstiri", "palate"],
      aproape: ["cetăți", "palate"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Castelul_Sturdza_de_la_Miclăușeni", "https://ro.wikipedia.org/wiki/Castelul_Cantacuzino_din_Bușteni", "https://ro.wikipedia.org/wiki/Castelul_Corvinilor", "https://ro.wikipedia.org/wiki/Castelul_Peleș", "https://ro.wikipedia.org/wiki/Castelul_Bran"],
    domeniu: "patrimoniu", ro: true,
  },
  {
    id: "note-muzicale",
    categorie: "Cuvinte care încep cu o notă muzicală",
    indicii: ["Fasole", "Lapte", "Dolar", "Remorcă", "Solfegiu"],
    explicatie: "Toate încep cu o notă muzicală: FA-sole, LA-pte, DO-lar, RE-morcă, SOL-fegiu.",
    momeala: "Legume (fasolea)",
    accepta: ["note muzicale", "note", "notă", "notele", "do re mi", "do re mi fa sol la si"],
    chei: [["not", "muzic"], ["not", "incep"], ["not", "cuvint"], ["solfeg"]],
    teste: {
      da: ["cuvinte care încep cu o notă muzicală", "Note muzicale", "note", "cuvinte cu note muzicale", "încep cu note", "DO RE MI"],
      nu: ["legume", "alimente", "valute", "instrumente muzicale", "cuvinte lungi"],
      aproape: ["muzică"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Solfegiu"],
    domeniu: "limba", ro: false,
  },
  {
    id: "monede-vechi",
    categorie: "Monede folosite în Țările Române",
    indicii: ["Galben", "Para", "Creițar", "Zlot", "Leu"],
    explicatie: "Toate sunt monede care au circulat pe teritoriul României; galbenul era o monedă de aur, iar creițarul circula în Transilvania.",
    momeala: "Culori (galben)",
    accepta: ["bani", "banii", "bani vechi", "monede", "valute", "bani de altădată"],
    chei: [["moned"], ["monet"], ["valut"], ["ban", "vech"], ["banut"], ["numismat"]],
    teste: {
      da: ["monede", "Monede vechi", "bani vechi", "monedele folosite în țara noastră", "valute", "bani"],
      nu: ["culori", "nuanțe de galben", "fructe", "metale prețioase", "timbre"],
    },
    surse: ["https://dexonline.ro/definitie/galben", "https://dexonline.ro/definitie/para", "https://dexonline.ro/definitie/creițar", "https://dexonline.ro/definitie/zlot"],
    domeniu: "istorie", ro: true,
  },
  {
    id: "deserturi",
    categorie: "Deserturi",
    indicii: ["Lapte de pasăre", "Salam de biscuiți", "Găluște cu prune", "Cozonac", "Papanași"],
    explicatie: "Toate sunt deserturi de pe mesele românești; nici „laptele de pasăre”, nici „salamul de biscuiți” nu sunt ce par.",
    momeala: "Lucruri imposibile („lapte de pasăre”)",
    accepta: ["deserturi", "desert", "dulciuri", "prăjituri", "prăjituri de casă", "prăjituri românești", "prăjituri tradiționale", "dulciuri de casă"],
    chei: [["desert"], ["dulci"], ["prajitur"]],
    teste: {
      da: ["deserturi", "Dulciuri", "prăjituri", "desert românesc", "dulciuri tradiționale din țara noastră", "DULCIURI DE CASA", "prajituri romanesti"],
      nu: ["lucruri imposibile", "mezeluri", "lactate", "mâncăruri de Paște", "aluaturi", "fructe"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Salam_de_biscuiți", "https://ro.wikipedia.org/wiki/Salată_de_boeuf"],
    domeniu: "mancare", ro: true,
  },
  {
    id: "constelatii",
    categorie: "Constelații",
    indicii: ["Echerul", "Lira", "Lebăda", "Pegas", "Ursa Mare"],
    explicatie: "Toate sunt constelații; echerul și lira par la început un instrument de desen și unul muzical.",
    momeala: "Instrumente de desen (echerul)",
    accepta: ["constelații", "constelație", "grupuri de stele"],
    chei: [["constel"], ["grup", "ste"]],
    teste: {
      da: ["constelații", "Constelatii", "constelația", "grupuri de stele", "constelațiile de pe cerul nopții", "CONSTELATII"],
      nu: ["instrumente de desen", "instrumente muzicale", "păsări", "cai", "zodii", "stele"],
      aproape: ["stele"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Constelație"],
    domeniu: "stiinta", ro: false,
  },
  {
    id: "personaje-caragiale",
    categorie: "Personaje de I.L. Caragiale",
    indicii: ["Zoe", "Mitică", "Chiriac", "Goe", "Cațavencu"],
    explicatie: "Toate sunt personaje de Caragiale: Zoe și Cațavencu din „O scrisoare pierdută”, Chiriac din „O noapte furtunoasă”, Mitică și Goe din schițe.",
    momeala: "Prenume (Zoe, Mitică)",
    accepta: ["Caragiale", "I.L. Caragiale", "personaje de Caragiale"],
    chei: [["caragia"]],
    teste: {
      da: ["personaje de Caragiale", "Caragiale", "personajele lui Caragiale", "eroii lui I.L. Caragiale", "PERSONAJE CARAGIALE", "personaje caragialiene"],
      nu: ["prenume", "nume de fete", "personaje de Creangă", "personaje din basme", "diminutive"],
    },
    surse: ["https://ro.wikipedia.org/wiki/O_scrisoare_pierdută", "https://ro.wikipedia.org/wiki/O_noapte_furtunoasă", "https://ro.wikipedia.org/wiki/Ion_Luca_Caragiale"],
    domeniu: "literatura", ro: true,
  },
  {
    id: "rauri",
    categorie: "Râuri din România",
    indicii: ["Olt", "Argeș", "Siret", "Jiu", "Crișul Repede"],
    explicatie: "Toate sunt râuri din România; Olt și Argeș sunt și nume de județe, iar Siret e și numele unui oraș din Bucovina.",
    momeala: "Județe din România (Olt, Argeș)",
    accepta: ["râuri", "râuri din România", "râuri românești", "ape curgătoare"],
    chei: [["rau"], ["ape", "curg"], ["apa", "curg"]],
    teste: {
      da: ["râuri", "Rauri din Romania", "râuri din țara noastră", "RÂUL", "Râurile României", "ape curgătoare", "râuri românești"],
      nu: ["județe", "Județe din România", "orașe", "fluvii", "lacuri", "munți"],
      aproape: ["ape"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Siret", "https://ro.wikipedia.org/wiki/Râul_Jiu", "https://ro.wikipedia.org/wiki/Crișul_Repede"],
    domeniu: "geografie", ro: true,
  },
  {
    id: "lucruri-cu-coada",
    categorie: "Lucruri care au coadă",
    indicii: ["Pian", "Cometă", "Zmeu", "Tigaie", "Mătură"],
    explicatie: "Toate au coadă: pianul cu coadă, coada cometei, a zmeului, a tigăii și coada de mătură.",
    momeala: "Instrumente muzicale (pianul)",
    accepta: ["coadă", "cozi", "lucruri cu coadă", "lucruri care au coadă", "au coadă", "lucruri cu cozi", "obiecte cu cozi", "au cozi"],
    chei: [["coad"]],
    teste: {
      da: ["lucruri care au coadă", "Lucruri cu coada", "au coadă", "obiecte cu coadă", "lucruri cu cozi", "COADA"],
      nu: ["instrumente muzicale", "corpuri cerești", "obiecte de bucătărie", "lucruri care zboară", "animale"],
    },
    surse: ["https://dexonline.ro/definitie/pian", "https://dexonline.ro/definitie/coadă", "https://dexonline.ro/definitie/zmeu"],
    domeniu: "lateral", ro: false,
  },
  {
    id: "jocuri-de-copii",
    categorie: "Jocuri de copii",
    indicii: ["Telefonul fără fir", "Baba-oarba", "Leapșa", "Șotron", "De-a v-ați ascunselea"],
    explicatie: "Toate sunt jocuri de copii, jucate de generații în curtea școlii sau a blocului; telefonul fără fir nu are nevoie de baterii.",
    momeala: "Aparate de comunicare (telefonul)",
    accepta: ["jocuri de copii", "jocuri pentru copii", "jocuri din copilărie", "jocuri copilărești", "jocuri de afară", "jocuri în aer liber"],
    chei: [["joc", "cop"], ["joc", "curt"], ["joc", "afar"], ["joc", "strad"]],
    teste: {
      da: ["jocuri de copii", "Jocuri din copilarie", "jocuri pentru copii", "jocurile copilăriei din țara noastră", "joc de copii", "jocuri în curtea blocului"],
      nu: ["aparate de comunicare", "telefoane", "jocuri de societate", "jocuri de cărți", "sporturi", "jucării"],
      aproape: ["jocuri", "jocuri de societate"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Telefonul_fără_fir", "https://dexonline.ro/definitie/baba-oarba", "https://dexonline.ro/definitie/leapșa", "https://ro.wikipedia.org/wiki/Șotron", "https://dexonline.ro/definitie/ascunselea"],
    domeniu: "folclor", ro: true,
  },
  {
    id: "pesti",
    categorie: "Pești de apă dulce",
    indicii: ["Somn", "Plătică", "Șalău", "Știucă", "Păstrăv"],
    explicatie: "Toate sunt pești de apă dulce; somnul nu e aici cel de noapte.",
    momeala: "Nevoi de bază (somnul)",
    accepta: ["pești", "pește", "pești de apă dulce", "pești de râu"],
    chei: [["pest"]],
    teste: {
      da: ["pești de apă dulce", "Pesti", "pești de râu", "peștii din râurile noastre", "pește", "PESTI DULCICOLI"],
      nu: ["nevoi de bază", "stări", "păsări", "animale acvatice", "fructe de mare"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Somn_(pește)", "https://ro.wikipedia.org/wiki/Plătică", "https://ro.wikipedia.org/wiki/Șalău"],
    domeniu: "natura", ro: false,
  },
  {
    id: "dregatorii",
    categorie: "Dregătorii boierești",
    indicii: ["Portar", "Paharnic", "Stolnic", "Spătar", "Logofăt"],
    explicatie: "Toate sunt dregătorii de la curtea domnească din Țara Românească și Moldova; portarul nu apăra poarta la fotbal, ci primea soliile.",
    momeala: "Posturi dintr-o echipă de fotbal (portarul)",
    accepta: ["dregători", "dregătorii", "boieri", "ranguri boierești", "funcții boierești"],
    chei: [["dregat"], ["boier"], ["curt", "domn"], ["slujb", "curt"], ["funct", "curt"], ["titl", "boier"]],
    teste: {
      da: ["dregătorii boierești", "Dregatori", "boieri", "funcții la curtea domnească", "ranguri boieresti din tara noastra", "dregătoriile de la curte"],
      nu: ["posturi dintr-o echipă de fotbal", "meserii", "grade militare", "titluri nobiliare", "profesii"],
      aproape: ["titluri nobiliare"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Dregător"],
    domeniu: "istorie", ro: true,
  },
  {
    id: "capitale-europene",
    categorie: "Capitale europene",
    indicii: ["Sofia", "Atena", "Valletta", "Lisabona", "București"],
    explicatie: "Toate sunt capitale europene; Sofia și Atena par la început un prenume și o zeiță.",
    momeala: "Prenume feminine (Sofia)",
    accepta: ["capitale", "capitale europene", "capitale din Europa"],
    chei: [["capita"], ["oras", "capita"]],
    teste: {
      da: ["capitale europene", "Capitale", "capitalele Europei", "capitale de țări europene", "CAPITALE DIN EUROPA", "capitala"],
      nu: ["prenume feminine", "zeițe", "orașe din Balcani", "orașe mari", "țări"],
      aproape: ["orașe", "orașe europene"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Mitologie_greacă"],
    domeniu: "geografie", ro: false,
  },
  {
    id: "preparate-din-porc",
    categorie: "Preparate din porc",
    indicii: ["Tobă", "Lebăr", "Caltaboș", "Șorici", "Slănină"],
    explicatie: "Toate sunt preparate tradiționale din porc; toba de aici e mezelul, nu instrumentul.",
    momeala: "Instrumente de percuție (toba)",
    accepta: ["porc", "carne de porc", "preparate din porc"],
    chei: [["porc"], ["mezel", "porc"], ["ignat"], ["craciun", "porc"]],
    teste: {
      da: ["preparate din porc", "Porc", "mâncăruri din carne de porc", "preparate din porc de Ignat, din țara noastră", "PREPARATE PORCESTI", "mezeluri de porc"],
      nu: ["instrumente de percuție", "instrumente muzicale", "mezeluri", "mâncăruri de Crăciun", "lactate", "brânzeturi"],
      aproape: ["mezeluri", "mâncăruri de Crăciun"],
    },
    surse: ["https://dexonline.ro/definitie/tobă", "https://dexonline.ro/definitie/lebăr", "https://dexonline.ro/definitie/caltaboș", "https://dexonline.ro/definitie/șorici", "https://dexonline.ro/definitie/slănină"],
    domeniu: "mancare", ro: true,
  },
  {
    id: "palindroame",
    categorie: "Palindroame",
    indicii: ["Capac", "Potop", "Radar", "Rotor", "Aerisirea"],
    explicatie: "Toate sunt palindroame: se citesc la fel de la stânga la dreapta și de la dreapta la stânga.",
    momeala: "Obiecte de bucătărie (capacul)",
    accepta: ["palindroame", "palindrom", "cuvinte palindrom", "se citesc la fel invers", "se citesc la fel în ambele sensuri"],
    chei: [["palindr"], ["invers"], ["simetric"], ["citesc", "ambel"], ["coad", "cap"]],
    teste: {
      da: ["palindroame", "Palindrom", "cuvinte care se citesc la fel invers", "se citesc la fel de la coadă la cap", "cuvinte simetrice", "PALINDROAME"],
      nu: ["obiecte de bucătărie", "fenomene naturale", "aparate", "anagrame", "cuvinte de cinci litere"],
    },
    surse: ["https://dexonline.ro/definitie/palindrom"],
    domeniu: "limba", ro: false,
  },
  {
    id: "opere-brancusi",
    categorie: "Opere de Constantin Brâncuși",
    indicii: ["Sărutul", "Muza adormită", "Pasărea măiastră", "Masa tăcerii", "Coloana infinitului"],
    explicatie: "Toate sunt sculpturi de Constantin Brâncuși; Coloana infinitului e la Târgu Jiu.",
    momeala: "Gesturi de afecțiune (sărutul)",
    accepta: ["Brâncuși", "Constantin Brâncuși", "sculpturi de Brâncuși"],
    chei: [["brancus"], ["sculpt", "brancus"]],
    teste: {
      da: ["opere de Brâncuși", "Brancusi", "sculpturi de Brâncuși", "lucrările lui Constantin Brâncuși", "operele marelui sculptor Brâncuși din țara noastră", "Constantin Brâncuși"],
      nu: ["gesturi de afecțiune", "tablouri", "opere de Eminescu", "monumente din București", "mobilier"],
      aproape: ["sculpturi"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Constantin_Brâncuși"],
    domeniu: "arta", ro: true,
  },
  {
    id: "sporturi-de-iarna",
    categorie: "Sporturi de iarnă",
    indicii: ["Bob", "Skeleton", "Biatlon", "Patinaj", "Schi"],
    explicatie: "Toate sunt sporturi de iarnă; bobul e și o plantă leguminoasă.",
    momeala: "Leguminoase (bobul)",
    accepta: ["sporturi de iarnă", "sporturi pe zăpadă", "sporturi de iarnă olimpice"],
    chei: [["sport", "iarn"], ["sport", "zapad"], ["sport", "ghea"], ["olimp", "iarn"]],
    teste: {
      da: ["sporturi de iarnă", "Sporturi de iarna", "sporturi practicate iarna", "sporturile olimpice de iarnă", "sport de iarnă", "sporturi pe gheață și zăpadă"],
      nu: ["leguminoase", "legume", "sporturi olimpice", "sporturi extreme", "sporturi cu mingea"],
      aproape: ["sporturi", "sporturi olimpice"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Sporturi_de_iarnă", "https://dexonline.ro/definitie/bob"],
    domeniu: "sport", ro: false,
  },
  {
    id: "mitologie-romaneasca",
    categorie: "Ființe din mitologia românească",
    indicii: ["Sânziene", "Ursitoare", "Solomonari", "Iele", "Strigoi"],
    explicatie: "Toate sunt ființe fabuloase din mitologia populară românească; sânzienele sunt și niște flori de câmp.",
    momeala: "Flori de câmp (sânzienele)",
    // fără cheia simplă „mitolog”: „mitologie greacă” nu e corect aici (dă doar „aproape”)
    accepta: ["mitologie", "mitologie românească", "ființe din mitologia românească", "ființe fabuloase", "folclor", "creaturi mitologice",
      "ființe mitologice", "ființe mitice", "creaturi mitice", "superstiții"],
    chei: [["fabulo"], ["folclor"], ["legend"], ["fantast"], ["supranatur"], ["supersti"], ["credint", "popul"],
      ["mitolog", "romanesc"], ["mitolog", "romanest"], ["mitolog", "romaneasc"], ["mitolog", "popul"],
      ["mitic", "romanesc"], ["mitic", "romanest"], ["mitic", "romaneasc"], ["basm", "mitolog"]],
    teste: {
      da: ["ființe din mitologia românească", "Mitologie", "creaturi mitologice", "ființe fabuloase din folclorul țării noastre", "personaje din legende", "FIINTE SUPRANATURALE"],
      nu: ["flori de câmp", "flori", "personaje din basme", "sărbători", "vrăjitoare", "mitologie greacă"],
      aproape: ["personaje din basme", "mitologie greacă"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Mitologia_românească", "https://dexonline.ro/definitie/sânziene"],
    domeniu: "folclor", ro: true,
  },
  {
    id: "varfuri-muntoase",
    categorie: "Vârfuri muntoase din România",
    indicii: ["Toaca", "Omu", "Negoiu", "Pietrosul", "Moldoveanu"],
    explicatie: "Toate sunt vârfuri din Carpații românești; Moldoveanu, de 2.544 m, e cel mai înalt, iar toaca e și un instrument de lemn.",
    momeala: "Instrumente de percuție (toaca)",
    accepta: ["vârfuri", "vârfuri muntoase", "piscuri"],
    chei: [["varf"], ["pisc"], ["varf", "munt"]],
    teste: {
      da: ["vârfuri", "Varfuri muntoase", "vârfuri din Carpați", "Vârful", "vârfurile munților din țara noastră", "piscuri"],
      nu: ["instrumente de percuție", "instrumente", "munți", "lacuri glaciare", "nume de familie", "masive muntoase"],
      aproape: ["munți", "munții Carpați"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Masivul_Ceahlău", "https://ro.wikipedia.org/wiki/Vârful_Omu", "https://ro.wikipedia.org/wiki/Vârful_Negoiu", "https://ro.wikipedia.org/wiki/Munții_Rodnei", "https://ro.wikipedia.org/wiki/Vârful_Moldoveanu"],
    domeniu: "geografie", ro: true,
  },
  {
    id: "figuri-de-stil",
    categorie: "Figuri de stil",
    indicii: ["Hiperbolă", "Inversiune", "Antiteză", "Personificare", "Metaforă"],
    explicatie: "Toate sunt figuri de stil; hiperbola e și o curbă din geometrie.",
    momeala: "Curbe din geometrie (hiperbola)",
    accepta: ["figuri de stil", "procedee artistice", "figuri retorice", "procedee stilistice"],
    chei: [["fig", "stil"], ["proced", "artist"], ["proced", "stilist"], ["fig", "retoric"], ["stilist"]],
    teste: {
      da: ["figuri de stil", "Figuri de stil", "procedee artistice", "figurile de stil din literatură", "figura de stil", "stilistică"],
      nu: ["curbe din geometrie", "figuri geometrice", "operații matematice", "genuri literare", "părți de vorbire"],
      aproape: ["figuri", "figuri geometrice"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Figură_de_stil"],
    domeniu: "limba", ro: false,
  },
  {
    id: "romane-romanesti",
    categorie: "Romane românești",
    indicii: ["Ion", "Mara", "Baltagul", "Moromeții", "Enigma Otiliei"],
    explicatie: "Toate sunt romane românești clasice, scrise de Rebreanu, Slavici, Sadoveanu, Marin Preda și George Călinescu.",
    momeala: "Prenume (Ion, Mara)",
    // „roman” și „România” au aceeași tulpină, deci romanele se recunosc doar după formulări
    // întregi (accepta), nu după chei cu „roman” — altfel „prenume românești” ar ieși „aproape”.
    accepta: ["romane", "romanele", "roman", "romanul", "romane românești", "romanele românești", "romanul românesc",
      "romane clasice", "romanele clasice", "romanul clasic", "romane clasice românești", "romane românești clasice",
      "romanele românești clasice", "romane din literatura română", "romanele din literatura română", "romanele literaturii române",
      "romane celebre", "romane românești celebre", "romane din țara noastră", "romane de scriitori români", "cărți românești"],
    chei: [["literatur", "clasic"], ["cart", "literar"]],
    teste: {
      da: ["romane", "Romane romanesti", "romane din literatura română", "Romanele clasice", "ROMANE", "romane din tara noastra", "romanul clasic"],
      nu: ["prenume", "prenume românești", "nume de fete", "unelte", "poezii", "orașe din România", "romane de dragoste"],
      aproape: ["literatura română", "cărți"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Ion_(roman)", "https://ro.wikipedia.org/wiki/Mara_(roman)", "https://ro.wikipedia.org/wiki/Baltagul", "https://ro.wikipedia.org/wiki/Moromeții", "https://ro.wikipedia.org/wiki/Enigma_Otiliei"],
    domeniu: "literatura", ro: true,
  },
  {
    id: "animale-care-hiberneaza",
    categorie: "Animale care hibernează",
    indicii: ["Liliac", "Pârș", "Arici", "Marmotă", "Urs"],
    explicatie: "Toate sunt animale care hibernează iarna; liliacul e și un arbust cu flori parfumate.",
    momeala: "Arbuști cu flori (liliacul)",
    accepta: ["hibernare", "hibernează", "animale care hibernează"],
    chei: [["hibern"], ["somn", "iarn"], ["dorm", "iarn"], ["anima", "hibern"]],
    teste: {
      da: ["animale care hibernează", "Animale care hiberneaza", "hibernare", "animale care dorm iarna", "hibernează în timpul iernii", "somn de iarnă"],
      nu: ["arbuști cu flori", "flori", "animale nocturne", "animale sălbatice", "rozătoare"],
      aproape: ["animale", "animale sălbatice"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Hibernare", "https://ro.wikipedia.org/wiki/Chiroptera", "https://dexonline.ro/definitie/pârș", "https://dexonline.ro/definitie/marmotă", "https://en.wikipedia.org/wiki/European_hedgehog", "https://dexonline.ro/definitie/liliac"],
    domeniu: "natura", ro: false,
  },
  {
    id: "masuri-vechi",
    categorie: "Unități de măsură vechi",
    indicii: ["Palmă", "Cot", "Ciocan", "Oca", "Stânjen"],
    explicatie: "Toate sunt vechi unități de măsură românești: palma, cotul și stânjenul pentru lungimi, ciocanul și oca pentru lichide.",
    momeala: "Părți ale corpului (palma, cotul)",
    accepta: ["măsuri", "măsuri vechi", "măsuri vechi românești", "măsuri românești", "unități de măsură", "unități de măsură vechi", "măsuri de altădată"],
    chei: [["unitat", "mas"], ["masur"], ["metrolog"]],
    teste: {
      da: ["unități de măsură vechi", "Unitati de masura", "măsuri vechi", "vechile unități de măsură din țara noastră", "măsuri de altădată", "unitate de măsură"],
      nu: ["părți ale corpului", "unelte", "monede vechi", "obiecte din casă", "cuvinte vechi"],
      aproape: ["unități"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Unități_de_măsură_vechi_românești"],
    domeniu: "istorie", ro: true,
  },
  {
    id: "salata-de-boeuf",
    categorie: "Ingredientele salatei de boeuf",
    indicii: ["Mazăre", "Cartofi", "Morcovi", "Castraveți murați", "Maioneză"],
    explicatie: "Toate intră în salata de boeuf, alături de carnea fiartă tăiată cubulețe.",
    momeala: "Legume (mazărea)",
    accepta: ["salată de boeuf", "boeuf", "salată boeuf", "salată de bof", "salată de beuf", "salată Olivier"],
    chei: [["boeuf"], ["boef"], ["beuf"], ["bof"], ["olivier"], ["salat", "boeuf"], ["ingredient", "boeuf"]],
    teste: {
      da: ["salată de boeuf", "Salata de boeuf", "ingrediente pentru salata de boeuf", "salată de bœuf", "salată boef din țara noastră", "salata Olivier"],
      nu: ["legume", "murături", "salată orientală", "garnituri", "ingrediente pentru sarmale", "salate"],
      aproape: ["salată", "salată orientală", "ingrediente"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Salată_de_boeuf"],
    domeniu: "mancare", ro: true,
  },
  {
    id: "gaze-nobile",
    categorie: "Gaze nobile",
    indicii: ["Neon", "Xenon", "Argon", "Kripton", "Heliu"],
    explicatie: "Toate sunt gaze nobile, din grupa 18 a tabelului periodic; neonul și xenonul sunt și nume de lumini.",
    momeala: "Tipuri de lumini (neon, xenon)",
    accepta: ["gaze nobile", "gaze inerte", "gaze rare"],
    chei: [["gaz", "nob"], ["gaz", "inert"], ["gaz", "rar"], ["element", "nob"]],
    teste: {
      da: ["gaze nobile", "Gaze nobile", "gazele nobile", "gaze inerte", "gaze nobile din tabelul periodic", "GAZE RARE"],
      nu: ["tipuri de lumini", "lumini", "elemente chimice", "metale", "gaze"],
      aproape: ["gaze", "elemente chimice"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Gaz_nobil"],
    domeniu: "stiinta", ro: false,
  },
  {
    id: "cartiere-bucuresti",
    categorie: "Cartiere din București",
    indicii: ["Titan", "Uranus", "Pajura", "Berceni", "Drumul Taberei"],
    explicatie: "Toate sunt cartiere din București; Titan și Uranus trimit la început spre cer, iar pajura e o pasăre.",
    momeala: "Corpuri cerești (Titan, Uranus)",
    accepta: ["București", "cartiere din București", "cartiere bucureștene"],
    chei: [["bucurest"], ["cartier", "capital"], ["cartier", "bucurest"]],
    teste: {
      da: ["cartiere din București", "Cartiere din Bucuresti", "cartierele Capitalei", "București", "zone din București", "cartiere bucurestene"],
      nu: ["corpuri cerești", "planete", "metale", "sateliți", "cartiere din Cluj", "păsări"],
      aproape: ["cartiere", "cartiere din Cluj"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Lista_cartierelor_din_București", "https://ro.wikipedia.org/wiki/Titan_(satelit)"],
    domeniu: "geografie", ro: true,
  },
  {
    id: "lucruri-cu-radacina",
    categorie: "Lucruri care au rădăcină",
    indicii: ["Număr", "Cuvânt", "Dinte", "Păr", "Copac"],
    explicatie: "Toate au rădăcină: rădăcina pătrată a unui număr, rădăcina unui cuvânt, a dintelui, a firului de păr și a copacului.",
    momeala: "Noțiuni de matematică (numărul)",
    accepta: ["rădăcină", "rădăcini", "lucruri cu rădăcină", "lucruri care au rădăcini", "au rădăcini"],
    chei: [["radac"]],
    teste: {
      da: ["lucruri care au rădăcină", "Lucruri cu radacini", "au rădăcini", "rădăcina", "obiecte cu rădăcină", "lucruri cu rădăcini, ca plantele din grădina noastră"],
      nu: ["noțiuni de matematică", "părți ale corpului", "plante", "gramatică", "lucruri care cresc"],
    },
    surse: ["https://dexonline.ro/definitie/rădăcină"],
    domeniu: "lateral", ro: false,
  },
  {
    id: "port-popular",
    categorie: "Piese ale portului popular",
    indicii: ["Cojoc", "Opinci", "Ițari", "Catrință", "Ie"],
    explicatie: "Toate sunt piese ale portului popular românesc: cojocul, opincile, ițarii, catrința și ia.",
    momeala: "Haine de iarnă (cojocul)",
    accepta: ["port popular", "costum popular", "port tradițional", "costume populare", "straie", "straie populare", "haine populare", "haine tradiționale", "port național", "costum național"],
    chei: [["port", "popul"], ["port", "tradit"], ["port", "national"], ["costum", "popul"], ["costum", "tradit"], ["costum", "national"],
      ["hain", "popul"], ["hain", "tradit"], ["hain", "tarane"], ["strai"], ["imbracamint", "tradit"], ["imbracamint", "popul"]],
    teste: {
      da: ["port popular", "Costum popular", "piese ale portului popular românesc", "straie populare din țara noastră", "haine tradiționale", "PORTUL NATIONAL"],
      nu: ["haine de iarnă", "încălțăminte", "haine", "dansuri populare", "palindroame"],
      aproape: ["haine", "haine de iarnă"],
    },
    surse: ["https://dexonline.ro/definitie/catrință", "https://dexonline.ro/definitie/ițari", "https://dexonline.ro/definitie/ie", "https://dexonline.ro/definitie/opincă"],
    domeniu: "folclor", ro: true,
  },
  {
    id: "echipe-fotbal",
    categorie: "Echipe de fotbal românești",
    indicii: ["Oțelul", "Farul", "Petrolul", "Rapid", "Dinamo"],
    explicatie: "Toate sunt echipe de fotbal cu tradiție din România: Oțelul Galați, Farul Constanța, Petrolul Ploiești, Rapid și Dinamo București.",
    momeala: "Metale și aliaje (oțelul)",
    accepta: ["fotbal", "echipe", "echipe de fotbal", "cluburi de fotbal", "cluburi sportive"],
    chei: [["fotbal"], ["echip", "sport"], ["club", "sport"]],
    teste: {
      da: ["echipe de fotbal", "Echipe de fotbal romanesti", "cluburi de fotbal din țara noastră", "fotbal", "cluburi de fotbal românești", "cluburi sportive"],
      nu: ["metale și aliaje", "metale", "combustibili", "vehicule", "cartiere"],
    },
    surse: ["https://ro.wikipedia.org/wiki/SuperLiga_României", "https://ro.wikipedia.org/wiki/SC_Oțelul_Galați", "https://ro.wikipedia.org/wiki/FC_Farul_Constanța", "https://ro.wikipedia.org/wiki/FC_Petrolul_Ploiești"],
    domeniu: "sport", ro: true,
  },
  {
    id: "flori",
    categorie: "Flori",
    indicii: ["Margareta", "Camelia", "Ghiocel", "Bujor", "Lalea"],
    explicatie: "Toate sunt flori; primele trei sunt și prenume: Margareta, Camelia, Ghiocel.",
    momeala: "Prenume feminine (Margareta)",
    accepta: ["flori", "floare", "flori de grădină"],
    chei: [["flor"], ["floar"]],
    teste: {
      da: ["flori", "Floare", "flori de grădină", "florile din grădina noastră", "FLORI", "flori de primăvară"],
      nu: ["prenume feminine", "prenume", "nume de fete", "copaci", "plante aromatice"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Bujor_(dezambiguizare)"],
    domeniu: "natura", ro: false,
  },
  {
    id: "poezii-eminescu",
    categorie: "Poezii de Mihai Eminescu",
    indicii: ["Revedere", "Lacul", "Floare albastră", "Glossă", "Luceafărul"],
    explicatie: "Toate sunt poezii de Mihai Eminescu; „Revedere” nu e aici un salut.",
    momeala: "Saluturi („la revedere”)",
    accepta: ["Eminescu", "Mihai Eminescu"],
    chei: [["eminesc"]],
    teste: {
      da: ["poezii de Eminescu", "Eminescu", "Mihai Eminescu", "operele lui Eminescu", "POEZII EMINESCU", "poeziile poetului nepereche Eminescu"],
      nu: ["saluturi", "lacuri", "flori", "poezii de Coșbuc", "poezii de dragoste", "opere de Creangă"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Mihai_Eminescu"],
    domeniu: "literatura", ro: true,
  },
  {
    id: "lunile-populare",
    categorie: "Numele populare ale lunilor",
    indicii: ["Cuptor", "Florar", "Cireșar", "Brumărel", "Gerar"],
    explicatie: "Toate sunt nume populare ale lunilor: cuptor e iulie, florar e mai, cireșar e iunie, brumărel e octombrie, gerar e ianuarie.",
    momeala: "Obiecte din bucătărie (cuptorul)",
    accepta: ["luni", "lunile", "lunile anului", "luni populare", "calendarul popular", "nume de luni"],
    chei: [["lun"], ["calendar", "popul"]],
    teste: {
      da: ["numele populare ale lunilor", "Lunile anului", "luni", "denumiri populare pentru luni", "lunile anului în calendarul popular", "luna"],
      nu: ["obiecte din bucătărie", "meserii", "anotimpuri", "zilele săptămânii", "păsări"],
    },
    surse: ["https://dexonline.ro/definitie/cuptor", "https://dexonline.ro/definitie/florar", "https://dexonline.ro/definitie/cireșar", "https://dexonline.ro/definitie/brumărel", "https://dexonline.ro/definitie/gerar"],
    domeniu: "limba", ro: true,
  },
  {
    id: "lacuri",
    categorie: "Lacuri din România",
    indicii: ["Roșu", "Ursu", "Vidraru", "Bâlea", "Snagov"],
    explicatie: "Toate sunt lacuri din România: Lacul Roșu, Lacul Ursu de la Sovata, Vidraru, Bâlea și Snagov.",
    momeala: "Culori (roșu)",
    accepta: ["lacuri", "lacul", "lacuri din România"],
    chei: [["lac"]],
    teste: {
      da: ["lacuri", "Lacuri din Romania", "lacuri din țara noastră", "Lacul", "lacurile României", "lacuri de munte"],
      nu: ["culori", "nuanțe de roșu", "râuri", "animale", "stațiuni", "munți"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Lacul_Roșu", "https://ro.wikipedia.org/wiki/Sovata", "https://ro.wikipedia.org/wiki/Lacul_Vidraru", "https://ro.wikipedia.org/wiki/Lacul_Bâlea", "https://ro.wikipedia.org/wiki/Lacul_Snagov"],
    domeniu: "geografie", ro: true,
  },
  {
    id: "zodii",
    categorie: "Zodii",
    indicii: ["Balanță", "Rac", "Săgetător", "Vărsător", "Capricorn"],
    explicatie: "Toate sunt semne zodiacale; balanța și racul par la început un cântar și un animal.",
    momeala: "Instrumente de cântărit (balanța)",
    accepta: ["zodii", "zodiac", "semne zodiacale", "horoscop"],
    chei: [["zod"], ["horoscop"], ["astrolog"], ["constel", "zod"]],
    teste: {
      da: ["zodii", "Zodiac", "semne zodiacale", "zodiile din horoscop", "ZODIE", "constelații zodiacale"],
      nu: ["instrumente de cântărit", "animale", "arme", "meserii", "constelații"],
      aproape: ["constelații"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Zodiac"],
    domeniu: "stiinta", ro: false,
  },
  {
    id: "instrumente-populare",
    categorie: "Instrumente muzicale populare",
    indicii: ["Fluier", "Bucium", "Cobză", "Țambal", "Nai"],
    explicatie: "Toate sunt instrumente din muzica populară românească; fluierul e și cel din gura arbitrului.",
    momeala: "Obiecte de arbitru (fluierul)",
    accepta: ["instrumente muzicale", "instrumente populare", "instrumente tradiționale"],
    chei: [["instrument", "muzic"], ["instrument", "popul"], ["instrument", "tradit"], ["instrument", "folclor"], ["instrument", "lautar"]],
    teste: {
      da: ["instrumente muzicale", "Instrumente populare", "instrumente muzicale traditionale", "instrumente populare românești din țara noastră", "INSTRUMENTE MUZICALE POPULARE", "instrumentele lăutarilor"],
      nu: ["obiecte de arbitru", "fluiere", "instrumente de suflat", "instrumente cu coarde", "unelte", "jucării"],
      aproape: ["instrumente", "instrumente de suflat"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Fluier", "https://ro.wikipedia.org/wiki/Bucium", "https://ro.wikipedia.org/wiki/Cobză", "https://ro.wikipedia.org/wiki/Țambal", "https://ro.wikipedia.org/wiki/Nai"],
    domeniu: "folclor", ro: true,
  },
  {
    id: "branzeturi",
    categorie: "Brânzeturi",
    indicii: ["Șvaițer", "Urdă", "Caș", "Cașcaval", "Telemea"],
    explicatie: "Toate sunt brânzeturi de pe mesele românești; numele șvaițerului vine din germanul „Schweizer”, adică „elvețian”.",
    momeala: "Naționalități (șvaițer, adică elvețian)",
    accepta: ["brânzeturi", "brânză", "brânzeturi românești"],
    chei: [["branz"], ["lactat", "branz"]],
    teste: {
      da: ["brânzeturi", "Branzeturi romanesti", "brânză", "sortimente de brânză din țara noastră", "brânzeturile", "BRANZA"],
      nu: ["naționalități", "mâncăruri elvețiene", "lactate", "mezeluri", "deserturi"],
      aproape: ["lactate"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Năsal_(caș)", "https://dexonline.ro/definitie/șvaițer", "https://dexonline.ro/definitie/urdă", "https://dexonline.ro/definitie/caș"],
    domeniu: "mancare", ro: true,
  },
  {
    id: "zei-greci",
    categorie: "Zei greci",
    indicii: ["Apollo", "Iris", "Ares", "Poseidon", "Zeus"],
    explicatie: "Toți sunt zei din mitologia greacă; Iris, zeița curcubeului, e și o floare, iar Apollo e și un program spațial.",
    momeala: "Misiuni spațiale (Apollo)",
    accepta: ["zei", "zei greci", "zeii Olimpului", "mitologie greacă"],
    chei: [["zei", "grec"], ["zei", "greac"], ["zeu", "grec"], ["zeit", "grec"], ["zeit", "greac"], ["zei", "olimp"], ["zeit", "olimp"], ["mitolog", "grec"], ["mitolog", "greac"], ["olimpien"], ["divinit", "grec"]],
    teste: {
      da: ["zei greci", "Zeii Olimpului", "mitologie greacă", "zeitățile grecești", "zei", "zei din mitologia greaca"],
      nu: ["misiuni spațiale", "zei romani", "planete", "eroi greci", "filozofi greci"],
      aproape: ["zei romani"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Mitologie_greacă", "https://ro.wikipedia.org/wiki/Iris_(mitologie)"],
    domeniu: "cultura-generala", ro: false,
  },
  {
    id: "biserici-pictate",
    categorie: "Biserici pictate din nordul Moldovei",
    indicii: ["Arbore", "Humor", "Probota", "Sucevița", "Voroneț"],
    explicatie: "Toate sunt biserici cu fresce exterioare din nordul Moldovei, în patrimoniul UNESCO; Arbore și Humor par la început un copac și o glumă.",
    momeala: "Copaci (arbore)",
    accepta: ["mănăstiri", "mănăstiri din Bucovina", "mănăstiri pictate", "biserici pictate", "monumente UNESCO"],
    chei: [["manast"], ["biseric", "pict"], ["biseric", "moldov"], ["biseric", "bucovin"], ["biseric", "fresc"], ["bucovin"], ["unesco"], ["fresc"]],
    teste: {
      da: ["mănăstiri din Bucovina", "Manastiri", "biserici pictate", "mănăstirile pictate din țara noastră", "monumente UNESCO", "biserici din Bucovina"],
      nu: ["copaci", "umor", "sate", "orașe din Moldova", "castele", "biserici"],
      aproape: ["biserici"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Bisericile_pictate_din_nordul_Moldovei"],
    domeniu: "patrimoniu", ro: true,
  },
  {
    id: "lucruri-care-se-bat",
    categorie: "Lucruri care se bat",
    indicii: ["Record", "Monedă", "Frișcă", "Cuie", "Covor"],
    explicatie: "Pe toate le „bați”: bați un record, bați monedă, bați frișca, bați cuie și bați covorul.",
    momeala: "Termeni sportivi (recordul)",
    accepta: ["se bat", "lucruri care se bat", "a bate", "bătute"],
    chei: [["bat"]],
    teste: {
      da: ["lucruri care se bat", "Lucruri care se bat", "se bat", "le bați", "verbul a bate", "lucruri pe care le bătem acasă"],
      nu: ["termeni sportivi", "bani", "dulciuri", "lucruri din casă", "unelte"],
    },
    surse: ["https://dexonline.ro/definitie/bate"],
    domeniu: "limba", ro: false,
  },
  {
    id: "pasari-delta",
    categorie: "Păsări din Delta Dunării",
    indicii: ["Bătăuș", "Lopătar", "Cormoran", "Stârc", "Pelican"],
    explicatie: "Toate sunt păsări din Delta Dunării; bătăușul și lopătarul par la început un om certăreț și o unealtă.",
    momeala: "Tipuri de oameni (bătăușul)",
    accepta: ["păsări din Delta Dunării", "păsări de baltă", "păsări de apă", "păsări acvatice", "păsări din deltă"],
    chei: [["pasar", "delt"], ["pasar", "balt"], ["pasar", "apa"], ["pasar", "ape"], ["pasar", "acvatic"], ["pasar", "dunar"], ["pasar", "lac"], ["delt"]],
    teste: {
      da: ["păsări din Delta Dunării", "Pasari de balta", "păsări de apă", "păsările din deltă, din țara noastră", "Delta Dunării", "păsări acvatice"],
      nu: ["tipuri de oameni", "unelte", "păsări", "pești", "animale de la munte"],
      aproape: ["păsări", "păsări migratoare"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Delta_Dunării"],
    domeniu: "natura", ro: true,
  },
  {
    id: "judete",
    categorie: "Județe din România",
    indicii: ["Alba", "Neamț", "Satu Mare", "Vrancea", "Ilfov"],
    explicatie: "Toate sunt județe ale României; „alba” și „neamț” par la început o culoare și o naționalitate.",
    momeala: "Culori (alba)",
    accepta: ["județe", "județul", "județe din România"],
    chei: [["judet"]],
    teste: {
      da: ["județe", "Judete din Romania", "județele țării noastre", "județ", "unități administrative: județe", "judetele Romaniei"],
      nu: ["culori", "naționalități", "orașe", "regiuni istorice", "râuri"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Județele_României"],
    domeniu: "geografie", ro: true,
  },
  {
    id: "operatii-matematice",
    categorie: "Operații matematice",
    indicii: ["Adunare", "Putere", "Scădere", "Împărțire", "Înmulțire"],
    explicatie: "Toate sunt operații matematice; adunarea e și o întrunire, iar puterea vine din ridicarea la putere.",
    momeala: "Întruniri (adunarea)",
    accepta: ["operații matematice", "operații aritmetice", "matematică", "aritmetică", "calcule"],
    chei: [["operat", "matemat"], ["operat", "aritmet"], ["matemat"], ["aritmet"], ["calcul"]],
    teste: {
      da: ["operații matematice", "Operatii aritmetice", "matematică", "operațiile de la matematică", "calcule", "operatii de aritmetica"],
      nu: ["întruniri", "evenimente", "operații chirurgicale", "calități", "semne de punctuație"],
      aproape: ["operații"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Aritmetică", "https://dexonline.ro/definitie/adunare", "https://dexonline.ro/definitie/putere"],
    domeniu: "stiinta", ro: false,
  },
  {
    id: "personaje-basme",
    categorie: "Personaje din basmele românești",
    indicii: ["Prâslea", "Aleodor", "Greuceanu", "Ileana Cosânzeana", "Făt-Frumos"],
    explicatie: "Toate sunt personaje din basmele românești; „prâslea” înseamnă și cel mai mic dintre frați.",
    momeala: "Membri ai familiei (prâslea, mezinul)",
    accepta: ["basme", "personaje din basme", "eroi din basme", "povești", "personaje din povești"],
    chei: [["basm"], ["povest"], ["ispiresc"], ["basm", "mitolog"]],
    teste: {
      da: ["personaje din basme", "Basme romanesti", "eroi de basm", "personajele poveștilor din țara noastră", "povești", "personaje din basmele lui Ispirescu"],
      nu: ["membri ai familiei", "frați", "prenume", "mitologie românească", "personaje de Caragiale"],
      aproape: ["mitologie românească"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Petre_Ispirescu", "https://ro.wikipedia.org/wiki/Mitologia_românească", "https://dexonline.ro/definitie/prâslea"],
    domeniu: "literatura", ro: true,
  },
  {
    id: "sporturi-cu-mingea",
    categorie: "Sporturi cu mingea",
    indicii: ["Golf", "Polo", "Oină", "Tenis", "Fotbal"],
    explicatie: "Toate sunt sporturi cu mingea; golful e și un braț de mare, iar oina e un joc sportiv tradițional românesc.",
    momeala: "Forme de relief (golful)",
    accepta: ["sporturi cu mingea", "sporturi cu minge", "jocuri cu mingea"],
    chei: [["sport", "ming"], ["joc", "ming"]],
    teste: {
      da: ["sporturi cu mingea", "Sporturi cu minge", "jocuri cu mingea", "sporturi care se joacă cu mingea", "sport cu minge", "SPORTURI CU MINGI"],
      nu: ["forme de relief", "tricouri", "sporturi de echipă", "sporturi olimpice", "sporturi de iarnă"],
      aproape: ["sporturi de echipă"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Oină"],
    domeniu: "sport", ro: false,
  },
  {
    id: "sarbatori-primavara",
    categorie: "Sărbători de primăvară",
    indicii: ["Babele", "Mucenici", "Dragobete", "Ziua Femeii", "Mărțișor"],
    explicatie: "Toate sunt sărbători de la sfârșitul iernii și începutul primăverii: Dragobetele pe 24 februarie, Mărțișorul pe 1 martie, Babele între 1 și 9 martie, Ziua Femeii pe 8 martie și Mucenicii pe 9 martie.",
    momeala: "Stânci din Bucegi (Babele)",
    accepta: ["primăvara", "primăvară", "martie", "sărbători de primăvară", "obiceiuri de primăvară", "sărbători din martie"],
    chei: [["sarbat", "primavar"], ["obicei", "primavar"], ["tradit", "primavar"], ["datin", "primavar"], ["zil", "primavar"],
      ["sarbat", "mart"], ["obicei", "mart"], ["tradit", "mart"]],
    teste: {
      da: ["sărbători de primăvară", "Sarbatori de primavara", "primăvara", "obiceiuri de primăvară din țara noastră", "sărbători din martie", "tradiții de primăvară"],
      nu: ["stânci din Bucegi", "formațiuni stâncoase", "dulciuri", "sărbători de iarnă", "obiceiuri de Anul Nou", "flori de primăvară"],
      aproape: ["sărbători"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Baba_Dochia", "https://ro.wikipedia.org/wiki/Mucenici", "https://ro.wikipedia.org/wiki/Dragobete", "https://ro.wikipedia.org/wiki/Mărțișor"],
    domeniu: "folclor", ro: true,
  },
  {
    id: "ciorbe",
    categorie: "Ciorbe",
    indicii: ["Rădăuțeană", "Țărănească", "Storceag", "Perișoare", "Borș"],
    explicatie: "Toate sunt ciorbe românești: rădăuțeană, țărănească, storceagul, ciorba de perișoare și borșul.",
    momeala: "Locuitoare ale unui oraș (rădăuțeană)",
    accepta: ["ciorbe", "ciorbă", "supe", "supă", "supe și ciorbe", "borșuri", "supe românești"],
    chei: [["ciorb"], ["bors"], ["sup", "acr"]],
    teste: {
      da: ["ciorbe", "Ciorbe romanesti", "supe", "ciorbe și borșuri din țara noastră", "ciorbă", "supe acre"],
      nu: ["locuitoare ale unui oraș", "adjective", "mâncăruri cu carne tocată", "salate", "sosuri"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Ciorbă"],
    domeniu: "mancare", ro: true,
  },
  {
    id: "litere-grecesti",
    categorie: "Litere grecești",
    indicii: ["Delta", "Gama", "Sigma", "Omega", "Alfa"],
    explicatie: "Toate sunt litere ale alfabetului grecesc; delta e și forma de relief de la vărsarea unui fluviu.",
    momeala: "Forme de relief (delta)",
    accepta: ["litere grecești", "alfabetul grecesc", "alfabet grecesc"],
    chei: [["liter", "grec"], ["alfabet", "grec"]],
    teste: {
      da: ["litere grecești", "Litere grecesti", "alfabetul grecesc", "literele alfabetului grecesc", "litera greceasca", "LITERE DIN ALFABETUL GREC"],
      nu: ["forme de relief", "termeni muzicali", "simboluri matematice", "litere latine", "alfabetul chirilic"],
      aproape: ["litere", "litere latine"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Alfabetul_grec"],
    domeniu: "stiinta", ro: false,
  },
  {
    id: "animale-salbatice",
    categorie: "Animale sălbatice din România",
    indicii: ["Râs", "Jder", "Capră neagră", "Cocoș de munte", "Lup"],
    explicatie: "Toate sunt animale sălbatice din munții și pădurile României; râsul nu e aici reacția la o glumă.",
    momeala: "Reacții (râsul)",
    accepta: ["animale sălbatice", "sălbăticiuni", "fauna"],
    chei: [["anima", "salbat"], ["salbatic"], ["faun"], ["vanat"], ["anima", "padur"], ["anima", "munt"], ["anima", "carpat"]],
    teste: {
      da: ["animale sălbatice", "Animale salbatice din Romania", "sălbăticiuni", "fauna Carpaților", "animale de pădure din țara noastră", "animalele munților"],
      nu: ["reacții", "emoții", "animale domestice", "păsări", "animale care hibernează"],
      aproape: ["animale", "animale domestice"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Râs_eurasiatic", "https://ro.wikipedia.org/wiki/Jder_de_copac", "https://ro.wikipedia.org/wiki/Capră_neagră", "https://ro.wikipedia.org/wiki/Cocoș_de_munte"],
    domeniu: "natura", ro: true,
  },
  {
    id: "pictori-romani",
    categorie: "Pictori români",
    indicii: ["Aman", "Andreescu", "Tonitza", "Luchian", "Grigorescu"],
    explicatie: "Toate sunt nume de pictori români: Theodor Aman, Ion Andreescu, Nicolae Tonitza, Ștefan Luchian și Nicolae Grigorescu.",
    momeala: "Interjecții vechi („aman!”)",
    accepta: ["pictori", "pictori români", "artiști plastici", "pictura românească"],
    chei: [["pictor"], ["pictur"], ["artist", "plastic"]],
    teste: {
      da: ["pictori români", "Pictori", "pictori din țara noastră", "artiști plastici", "marii pictori romani", "pictorul"],
      nu: ["interjecții vechi", "nume de familie", "scriitori", "sculptori", "compozitori"],
      aproape: ["artiști"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Theodor_Aman", "https://dexonline.ro/definitie/aman", "https://ro.wikipedia.org/wiki/Ion_Andreescu", "https://ro.wikipedia.org/wiki/Nicolae_Tonitza", "https://ro.wikipedia.org/wiki/Ștefan_Luchian", "https://ro.wikipedia.org/wiki/Nicolae_Grigorescu"],
    domeniu: "arta", ro: true,
  },
  {
    id: "regiuni-istorice",
    categorie: "Regiuni istorice ale României",
    indicii: ["Moldova", "Maramureș", "Banat", "Oltenia", "Transilvania"],
    explicatie: "Toate sunt regiuni istorice ale României; Moldova e și un râu, iar Maramureș e și numele unui județ.",
    momeala: "Râuri (Moldova)",
    accepta: ["regiuni", "regiuni istorice", "provincii", "provincii istorice", "zone istorice", "ținuturi"],
    chei: [["regiun"], ["provinc"], ["tinut"], ["zon", "istoric"], ["zon", "etnograf"]],
    teste: {
      da: ["regiuni istorice", "Regiuni istorice ale Romaniei", "provinciile istorice", "regiunile țării noastre", "provincii", "ținuturi istorice"],
      nu: ["râuri", "județe", "țări", "orașe", "munți"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Regiuni_istorice_ale_României", "https://ro.wikipedia.org/wiki/Roman,_Neamț"],
    domeniu: "geografie", ro: true,
  },
  {
    id: "tors-si-tesut",
    categorie: "Unelte pentru tors și țesut",
    indicii: ["Fus", "Furcă", "Vârtelniță", "Suveică", "Război de țesut"],
    explicatie: "Toate sunt unelte ale torsului și țesutului din casa tradițională; fusul nu e aici cel orar.",
    momeala: "Noțiuni de geografie (fusul orar)",
    accepta: ["țesut", "tors", "tors și țesut", "unelte de țesut", "țesătorie"],
    chei: [["tesut"], ["tesat"], ["tors"], ["toarc"], ["unelt", "tesut"]],
    teste: {
      da: ["unelte pentru tors și țesut", "Unelte de tesut", "țesut", "unelte folosite la tors, din țara noastră", "tors si tesut", "războiul de țesut și accesoriile lui"],
      nu: ["noțiuni de geografie", "fus orar", "unelte agricole", "tacâmuri", "instrumente muzicale"],
      aproape: ["unelte", "unelte agricole"],
    },
    surse: ["https://dexonline.ro/definitie/fus", "https://dexonline.ro/definitie/furcă", "https://dexonline.ro/definitie/vârtelniță", "https://dexonline.ro/definitie/suveică"],
    domeniu: "folclor", ro: true,
  },
  {
    id: "statiuni-balneare",
    categorie: "Stațiuni balneare",
    indicii: ["Amara", "Sovata", "Techirghiol", "Băile Felix", "Băile Herculane"],
    explicatie: "Toate sunt stațiuni balneare din România; Băile Herculane e cea mai veche stațiune din țară, iar „Amara” nu e aici un gust.",
    momeala: "Gusturi (amară)",
    accepta: ["stațiuni balneare", "băi", "stațiuni de tratament", "stațiuni balneoclimaterice"],
    chei: [["balnear"], ["balneo"], ["statiun", "tratament"], ["statiun", "terma"], ["statiun", "sanatat"]],
    teste: {
      da: ["stațiuni balneare", "Statiuni balneare", "stațiuni balneoclimaterice din țara noastră", "băi", "stațiuni de tratament", "stațiuni termale"],
      nu: ["gusturi", "stațiuni de pe litoral", "lacuri", "orașe", "stațiuni de schi"],
      aproape: ["stațiuni", "stațiuni de schi"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Amara", "https://ro.wikipedia.org/wiki/Sovata", "https://ro.wikipedia.org/wiki/Techirghiol", "https://ro.wikipedia.org/wiki/Băile_Felix", "https://ro.wikipedia.org/wiki/Băile_Herculane"],
    domeniu: "geografie", ro: true,
  },
  {
    id: "copaci",
    categorie: "Copaci",
    indicii: ["Tei", "Fag", "Plop", "Mesteacăn", "Stejar"],
    explicatie: "Toate sunt copaci; Tei e și un cartier din București.",
    momeala: "Cartiere din București (Tei)",
    accepta: ["copaci", "copac", "arbori", "arbore"],
    chei: [["copac"], ["arbor"], ["foioas"]],
    teste: {
      da: ["copaci", "Arbori", "copaci din pădurile noastre", "arbori foioși", "copac", "COPACII"],
      nu: ["cartiere din București", "flori", "plante", "arbuști", "fructe"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Lista_cartierelor_din_București"],
    domeniu: "natura", ro: false,
  },
  {
    id: "tari-fara-iesire-la-mare",
    categorie: "Țări fără ieșire la mare",
    indicii: ["Ungaria", "Serbia", "Republica Moldova", "Elveția", "Mongolia"],
    explicatie: "Toate sunt țări fără ieșire la mare; primele trei sunt și vecine cu România.",
    momeala: "Vecinii României",
    accepta: ["țări fără ieșire la mare", "fără ieșire la mare", "țări fără mare", "țări continentale"],
    chei: [["far", "mar"], ["iesir", "mar"], ["far", "litoral"], ["far", "coast"], ["continental"]],
    teste: {
      da: ["țări fără ieșire la mare", "Tari fara iesire la mare", "fără ieșire la mare", "state fără acces la mare", "tari fara mare", "țări continentale"],
      nu: ["vecinii României", "țări europene", "țări din Balcani", "țări mici", "țări cu munți"],
    },
    surse: ["https://ro.wikipedia.org/wiki/Țară_fără_ieșire_la_mare"],
    domeniu: "geografie", ro: false,
  },
];

// ─── Potrivirea răspunsurilor ───────────────────────────────────────────────────────

/** Cuvinte de legătură ignorate la potrivire. */
export const STOPWORDS = new Set(["de", "din", "la", "si", "cu", "in", "pe", "un", "o", "a", "al", "ale", "ai", "cel", "cea", "cei", "cele", "lui", "lor"]);

/** Sufixele tăiate de stemming, de la cel mai lung la cel mai scurt. */
const SUFIXE = ["urile", "ilor", "elor", "ului", "uri", "ile", "ele", "lor", "ul", "ii", "ei", "le", "a", "e", "i", "u"];

/**
 * Forma de comparație: NFD fără semne diacritice (acoperă ș/ş și ț/ţ, cu virgulă sau cu
 * sedilă, plus ă, â, î), litere mici, orice nu e literă/cifră → un spațiu, fără spații la
 * capete. Ligaturile œ/æ (din „bœuf”) devin oe/ae.
 */
export function normalizeaza(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Stemming ușor: taie cel mai lung sufix din SUFIXE care lasă o tulpină de minimum 3 litere. */
export function tulpina(cuvant) {
  for (const s of SUFIXE) {
    if (cuvant.endsWith(s) && cuvant.length - s.length >= 3) return cuvant.slice(0, -s.length);
  }
  return cuvant;
}

/** Tulpinile cuvintelor unui text, fără cuvintele de legătură. */
export function tulpini(text) {
  const t = normalizeaza(text);
  return t ? t.split(" ").filter((c) => !STOPWORDS.has(c)).map(tulpina) : [];
}

/** Câte tulpini din setul `set` sunt începutul unei tulpini din `ale`. */
function cateSePotrivesc(set, ale) {
  return set.filter((k) => ale.some((t) => t.startsWith(k))).length;
}

/**
 * Verifică un răspuns. Corect dacă textul normalizat e identic cu o formulare din `accepta`,
 * ori dacă pentru un set din `chei` fiecare tulpină e începutul unei tulpini din răspuns.
 * `aproape` = greșit, dar dintr-un set cu mai multe tulpini se potrivește exact una — pagina
 * spune „Aproape! Mai precis?" (încercarea tot se consumă).
 * @returns {{ corect: boolean, aproape: boolean }}
 */
export function potrivire(text, puzzle) {
  const n = normalizeaza(text);
  const ale = tulpini(text);
  if (!n || !ale.length) return { corect: false, aproape: false };
  for (const a of puzzle.accepta) {
    if (n === normalizeaza(a)) return { corect: true, aproape: false };
  }
  let aproape = false;
  for (const set of puzzle.chei) {
    const k = cateSePotrivesc(set, ale);
    if (k === set.length) return { corect: true, aproape: false };
    if (set.length > 1 && k === 1) aproape = true;
  }
  return { corect: false, aproape };
}

// ─── Ziua ───────────────────────────────────────────────────────────────────────────

/** YYYYMMDD → milisecunde UTC (miezul nopții), ca să numărăm zile reale din calendar. */
function msUTC(zi) {
  return Date.UTC(Math.floor(zi / 10000), Math.floor((zi % 10000) / 100) - 1, zi % 100);
}

/** Zile întregi de la START până la `zi` (YYYYMMDD); zilele de dinainte și seed-urile invalide → 0. */
export function zileDeLaStart(zi) {
  const d = Math.round((msUTC(zi) - msUTC(START)) / 86400000);
  return d > 0 ? d : 0;
}

/** Puzzle-ul zilei `zi` (YYYYMMDD, de la GamesRO.seedAzi()). */
export function puzzleZilei(zi) {
  return BANC[zileDeLaStart(zi) % BANC.length];
}

/** Numărul ediției afișat în pagină și în share: #1 în prima zi. */
export function editia(zi) {
  return zileDeLaStart(zi) + 1;
}

// ─── Share ──────────────────────────────────────────────────────────────────────────

/** Emoji doar pentru textul de share (WhatsApp/clipboard), niciodată în interfață. */
const EMOJI = { gresit: "🟥", aproape: "🟥", sarit: "⬛", corect: "🟩" };

/** Grila de share: câte un pătrat pe încercare, ⬜ pentru încercările nefolosite. */
export function grilaShare(incercari) {
  const folosite = incercari.slice(0, MAX_INCERCARI).map((i) => EMOJI[i.tip] || "🟥");
  return folosite.join("") + "⬜".repeat(MAX_INCERCARI - folosite.length);
}

/** „Categoria #12 · 3/5” la câștig, „Categoria #12 · X/5” altfel. */
export function textScor(editie, incercari) {
  const k = incercari.findIndex((i) => i.tip === "corect");
  return "Categoria #" + editie + " · " + (k >= 0 ? k + 1 : "X") + "/" + MAX_INCERCARI;
}
