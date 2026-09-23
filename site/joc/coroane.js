// ==== Coroane — datele și logica pură a jocului (fără DOM), testabile în Node (v1, 24.09.2026) ====
// Pagina: site-live/joc/coroane.html · Testul: games/teste/coroane.test.mjs
// Bancul de mai jos e scris de generator (fabrica/generatoare/coroane.mjs, determinist) — nu-l edita
// de mână: rulează generatorul, care înlocuiește tot ce e între markerii BANC.
//
// ─── REGULILE ────────────────────────────────────────────────────────────────────────────
// Grilă n×n împărțită în n zone colorate. O coroană pe fiecare rând, pe fiecare coloană și în
// fiecare zonă; două coroane nu se pot atinge, nici pe diagonală. Fiecare puzzle are exact o soluție
// și se rezolvă doar prin logică, fără ghicit.
//
// ─── FORMATUL UNUI PUZZLE ────────────────────────────────────────────────────────────────
// { id, n, dif, zone, sol }
//   id   = identificator stabil (derivat din conținut) — intră în cheia stării salvate;
//   n    = latura grilei (7, 8 sau 9) = numărul de zone = numărul de coroane;
//   dif  = "usor" | "mediu" | "greu" — cea mai grea regulă de logică de care e nevoie;
//   zone = n rânduri de câte n litere, separate prin "/". Litera e zona căsuței și, totodată,
//          culoarea ei: a → --zona-a … i → --zona-i din pagină (un puzzle n×n are n litere diferite);
//   sol  = n cifre: coloana coroanei pe fiecare rând (0 = prima coloană din stânga).
// Tabla jucătorului = n·n valori, rând după rând: 0 = gol, 1 = ✕ (notița „nu aici"), 2 = coroană.

export const NUME = "Coroane";
export const GOL = 0, X = 1, COROANA = 2;

/** Prima zi de joc (YYYYMMDD, ora României) — ediția #1. */
export const START = 20260925;
/** 52 de săptămâni: multiplu de 7, deci zilele săptămânii rămân aliniate când bancul se reia. */
export const MARIME_BANC = 364;
/** Curba săptămânii, după Date.getUTCDay(): 0 = duminică … 6 = sâmbătă. Luni cel mai ușor, duminică cel mai greu. */
export const CURBA = [
  { n: 9, dif: "greu" },  // duminică
  { n: 7, dif: "usor" },  // luni
  { n: 7, dif: "usor" },  // marți
  { n: 8, dif: "mediu" }, // miercuri
  { n: 8, dif: "mediu" }, // joi
  { n: 8, dif: "greu" },  // vineri
  { n: 8, dif: "greu" },  // sâmbătă
];
export const DIFICULTATE = { usor: "Ușor", mediu: "Mediu", greu: "Greu" };
export const LITERE = "abcdefghi";

// ==== BANC:ÎNCEPUT — scris de fabrica/generatoare/coroane.mjs; nu edita de mână ====
export const BANC = [
  { id: "0j6lg05", n: 8, dif: "greu", zone: "iiiiiddd/eieiiggd/eeeigggg/eeeggggg/eeaaggbb/ehhaagaf/ehaaaaaf/ehhhhaff", sol: "51406372" }, // 0: 20260925
  { id: "1xhk9zm", n: 8, dif: "greu", zone: "bbbbeeee/bbbbbeee/bggbaeee/bgggaadd/bbgaaaah/bbfaaaah/fffafahh/fffffccc", sol: "40263715" }, // 1: 20260926
  { id: "043jvjo", n: 9, dif: "greu", zone: "fgggggddd/ffgbbgddd/aggggdddd/aagggdddd/aaeiiiiii/aaeeeeiii/aaaehhhii/hhhhhccii/hccccciii", sol: "042713685" }, // 2: 20260927
  { id: "17uhnj7", n: 7, dif: "usor", zone: "gggggcc/ggggggg/gbbgddg/bbaadhe/eeahhhe/eehhhee/eeeeeee", sol: "6350241" }, // 3: 20260928
  { id: "0j5w8nt", n: 7, dif: "usor", zone: "ccheegg/ccheegg/chhbegg/chhbbgg/hhabbgg/aaaabbg/aaaffbg", sol: "0416253" }, // 4: 20260929
  { id: "0ylrfx6", n: 8, dif: "mediu", zone: "igbbbhhc/iggbbhcc/gggbbhhc/ggbbhhhh/ggeeeehh/dggeeeeh/ddggeahh/dggaaaah", sol: "02736415" }, // 5: 20260930
  { id: "025y6nj", n: 8, dif: "mediu", zone: "ffaaaaah/ffaaaaah/cfaaaahh/cfagabbh/iiggggbh/iiigeeee/iiieeiee/iiiiiiie", sol: "14057362" }, // 6: 20261001
  { id: "0z8k8rq", n: 8, dif: "greu", zone: "ccccchee/cccchhhe/ccccchhe/cicchhee/iiigbbaa/idiggbba/idgggaaa/idddddda", sol: "04715362" }, // 7: 20261002
  { id: "0lzd8yj", n: 8, dif: "greu", zone: "dddiiiii/diiieeii/dgiieeei/dgeeeeee/ggbeeaeh/gbbaeahh/aaaaaahc/aaaaahhc", sol: "03152647" }, // 8: 20261003
  { id: "0lf1dmk", n: 9, dif: "greu", zone: "bbbbbffff/bbbbbggff/bebbbbgff/bebebggff/eeeeeggif/ehaaaggii/hhaaggggi/chhddgddi/chhhddddd", sol: "258374160" }, // 9: 20261004
  { id: "0erj04t", n: 7, dif: "usor", zone: "aaaaaah/ddaaaah/ddaaaee/ddddgge/ddgdggg/diggggc/iiicccc", sol: "6250413" }, // 10: 20261005
  { id: "0ppy93i", n: 7, dif: "usor", zone: "iiddddh/iiidddh/iiiddaa/eiigdga/eiigggg/eeegbgg/ebbbbbb", sol: "6351402" }, // 11: 20261006
  { id: "0jwvkh8", n: 8, dif: "mediu", zone: "aaahhhhh/adaaeebb/ddaaeebf/ddggggbf/ddiigbbb/diiggbgb/iiiigggg/iiiigggg", sol: "30471526" }, // 12: 20261007
  { id: "084dxuv", n: 8, dif: "mediu", zone: "hhhheeee/hdhhhbbb/hdhaabbg/hddaaafg/dddadafg/iidddggg/iiidddgg/iiidddgg", sol: "40536271" }, // 13: 20261008
  { id: "0m5mf3h", n: 8, dif: "greu", zone: "eeeeeidd/eeeiiiid/bbggiddd/bggiiidd/ggggiddd/cggggddd/cccggadd/ccccaahh", sol: "24163057" }, // 14: 20261009
  { id: "1lrzc8z", n: 8, dif: "greu", zone: "iiiiiicc/iieiiicc/iieeiiic/eeeggggg/eebbggda/ebbgggda/bbbbgdda/hhbbgdaa", sol: "36247150" }, // 15: 20261010
  { id: "0vz1cns", n: 9, dif: "greu", zone: "eeeeeehhc/eeehhhhhc/eeeehhhhc/beehhhhcc/bbaaaadic/bbffaadic/fffaaagii/fffafgggg/fffffffgg", sol: "138064752" }, // 16: 20261011
  { id: "1rpu6xn", n: 7, dif: "usor", zone: "dddiicc/agdiicg/agggiig/aaagggg/aeeggbg/aeeegbe/aeeeeee", sol: "6240351" }, // 17: 20261012
  { id: "185zjb4", n: 7, dif: "usor", zone: "caaaddd/ccaaaad/haaaagg/haaabgg/eeeebgg/eeggbgg/eeggggg", sol: "5130246" }, // 18: 20261013
  { id: "1vfq4uu", n: 8, dif: "mediu", zone: "ffffbbbb/fffffffb/ffcfbbbb/cccaabbb/ggaaaahb/gddaahhe/gggaeeee/gggeeeee", sol: "37246150" }, // 19: 20261014
  { id: "0nqs0k4", n: 8, dif: "mediu", zone: "iiiiiiig/iiciiiig/cccccggg/ggggggge/gggbbbbe/daabaahe/daaaahhe/aaaaaaee", sol: "42573061" }, // 20: 20261015
  { id: "0fzy7ap", n: 8, dif: "greu", zone: "ieeeeaah/ieehhahh/ieehhhhh/iieeehbb/iiiebbbb/fiigbbbb/figggbbb/fcccggbb", sol: "35716042" }, // 21: 20261016
  { id: "16sn86x", n: 8, dif: "greu", zone: "ccggahhh/icggaahh/iigbaahh/iigbeaah/iieeeaad/eiieeadd/eeeeaaad/eeeeaaad", sol: "02631475" }, // 22: 20261017
  { id: "1ytsf39", n: 9, dif: "greu", zone: "ccaaaahhh/cgaaahhhh/cggfabbhh/gggfbbeeh/ddgggbeeh/dddgebeeh/ddigeeeii/ddieeeiii/ddiiiiiii", sol: "403528617" }, // 23: 20261018
  { id: "1ai8yrp", n: 7, dif: "usor", zone: "aabbgdd/aagggdi/aaagggi/aaeeeii/aheeeie/hheheee/hhhhhee", sol: "2536041" }, // 24: 20261019
  { id: "05x8a7d", n: 7, dif: "usor", zone: "eeeeeaa/behaaaa/bhhahha/hhhhhaa/dhhhdaa/dddddgg/ddiiddg", sol: "1502463" }, // 25: 20261020
  { id: "18ifk5u", n: 8, dif: "mediu", zone: "ddddgggg/dddgggcc/hhaggggc/hhaagigc/heaeeiii/beeeiiii/beeeeiii/eeeeiiii", sol: "35172046" }, // 26: 20261021
  { id: "1r0w09w", n: 8, dif: "mediu", zone: "iiiicccc/gigggffa/gigggafa/gggbeaaa/bgbbeaaa/bbbbehhh/bbhhhhhh/bbbhhhhh", sol: "51627403" }, // 27: 20261022
  { id: "0ipz5ob", n: 8, dif: "greu", zone: "ccccheee/giihhhee/giiieeee/gggggeee/gggggbbe/dgaaaaaa/dgdaaaaa/ddddaaaa", sol: "04275163" }, // 28: 20261023
  { id: "0ozawaw", n: 8, dif: "greu", zone: "fiiigggg/fifiiggd/fifffadd/ffffaadd/fffaaadd/faaaahdd/baaahhhd/bbaaeehd", sol: "16273504" }, // 29: 20261024
  { id: "0adrysd", n: 9, dif: "greu", zone: "ccgeeiiii/cggggiiii/ggggggggi/gbgbgdggd/fbbbadddd/ffaaaaddd/faaaaaahd/faffaaahd/fffffahhh", sol: "308417526" }, // 30: 20261025
  { id: "0zabgbx", n: 7, dif: "usor", zone: "eaaaaad/eaeaaad/eeebbgg/eeeebgg/eggebgg/eiggggg/iiiiccc", sol: "2630514" }, // 31: 20261026
  { id: "0cnh1k3", n: 7, dif: "usor", zone: "cccgbbe/iciggee/iiiggee/iiggeee/dddgaea/dddaaaa/ddaaaaa", sol: "4130526" }, // 32: 20261027
  { id: "02f2k6f", n: 8, dif: "mediu", zone: "chhhaaaf/chhhhaaf/cchhhaff/ggaaaaaf/gggaaaff/igggggbb/iddggggb/iiddgggb", sol: "74152603" }, // 33: 20261028
  { id: "1bw01pu", n: 8, dif: "mediu", zone: "aaaaaaah/aaaahhhh/adaaeeeh/ddgaeeeh/gggaeeei/gggeeeii/cgiiiiif/cciiiiif", sol: "35142607" }, // 34: 20261029
  { id: "07flzmj", n: 8, dif: "greu", zone: "cggggggd/ciggaaad/iigggaad/iegggaad/eeaaaaaa/eehhaabh/eeehhbbh/eehhhhhh", sol: "03174625" }, // 35: 20261030
  { id: "1sjqia2", n: 8, dif: "greu", zone: "eeeebbbb/eeeebbbb/eeebbfab/eebbbfaa/egggaaaa/gggdddda/iidddddh/iiiiddhh", sol: "42571306" }, // 36: 20261031
  { id: "0x6s4s3", n: 9, dif: "greu", zone: "bfgcccccc/bfgcacccc/bbgcahhhh/ggggaaehh/gggaaaeee/gddddaeee/gggdieeee/giddiiiei/iiiiiiiii", sol: "160825374" }, // 37: 20261101
  { id: "02wfe4l", n: 7, dif: "usor", zone: "bbeeeee/hhhhhea/dhddaea/ddddaaa/dddddga/iididgg/iiiiiig", sol: "0514263" }, // 38: 20261102
  { id: "10xd31q", n: 7, dif: "usor", zone: "heeeeee/hhebbbb/heeeggg/haegggg/aaggigi/addgigi/ddiiiii", sol: "0631524" }, // 39: 20261103
  { id: "1xvhbse", n: 8, dif: "mediu", zone: "ddgggggg/ddgggbgg/iddgbbgg/iiggbbaa/cccffaaa/ccccaaaa/ccccaaaa/hhhccaaa", sol: "75204631" }, // 40: 20261104
  { id: "1wn4ou8", n: 8, dif: "mediu", zone: "iiiiifff/iiifffff/iiiffaaf/gifffaaf/gcccaaab/gcaaaaab/ggddddhh/gggdddhh", sol: "13502746" }, // 41: 20261105
  { id: "1gik9oo", n: 8, dif: "greu", zone: "beehhccc/beaahccc/aaaahhhc/aaaaahii/ggadahii/ggddddii/ggdddiii/gggiiiii", sol: "20735146" }, // 42: 20261106
  { id: "1o961v1", n: 8, dif: "greu", zone: "hhhhhhhh/hhhhhhhb/hhhaebbb/ccaaeebb/ccageebb/cccggeee/fccieeee/ffiiiiii", sol: "27351406" }, // 43: 20261107
  { id: "04snt3j", n: 9, dif: "greu", zone: "hbbgccfff/hbbgggfaf/hebbggaaa/eebggggaa/eegggaaaa/eeeegdaaa/eieggddaa/eieiddaad/eiiiidddd", sol: "580241736" }, // 44: 20261108
  { id: "08uqnnp", n: 7, dif: "usor", zone: "aaaaaad/aaaaddd/heaaddd/heeagdg/heegggg/bbgggcc/bgggggc", sol: "3502416" }, // 45: 20261109
  { id: "0s0a7bn", n: 7, dif: "usor", zone: "ccccchh/cccggah/cccggah/iggggah/iidggah/iddaaae/iidddae", sol: "5130246" }, // 46: 20261110
  { id: "1b75a3a", n: 8, dif: "mediu", zone: "bbhheeei/bhhhheei/hhhddiii/haadddii/aaddddic/aaadddgc/aaadaggc/aaaaaagg", sol: "40263751" }, // 47: 20261111
  { id: "0t49jkb", n: 8, dif: "mediu", zone: "dddddhhh/dddaaaeh/dddgaaee/dddggaee/dggggeee/gggbgeee/ggfbgeei/gffbbbei", sol: "50461372" }, // 48: 20261112
  { id: "1kwax2y", n: 8, dif: "greu", zone: "aeeebggg/aabbbgbg/aaabbbbg/aaabbggg/aaffgggd/fafffggd/ffffiidd/fffcciii", sol: "14062753" }, // 49: 20261113
  { id: "0q464hw", n: 8, dif: "greu", zone: "ggggggcc/ggggiiic/gggggcic/gfggcccc/fffacccc/bbaahcch/bhhhhhhh/bbeeeehh", sol: "25713064" }, // 50: 20261114
  { id: "1ts5kjs", n: 9, dif: "greu", zone: "gggggccii/ggggggiie/dgagggeee/daagbggee/ddaabbbbe/daahhhhbb/aaaaaahhh/faaaahhhh/ffaaahhhh", sol: "573840261" }, // 51: 20261115
  { id: "1uczuxl", n: 7, dif: "usor", zone: "dggggcc/dggggci/dddgggi/dddggge/ddaaeee/daahhhe/aaahhee", sol: "5260413" }, // 52: 20261116
  { id: "1alqeyl", n: 7, dif: "usor", zone: "hhhhhdd/ehahddd/ehaaadd/eaaaddi/aaaddii/gagdggc/ggggggc", sol: "1403526" }, // 53: 20261117
  { id: "0vufqr2", n: 8, dif: "mediu", zone: "bbbbaaad/ebbffadd/eeaaaadd/eaaaaddd/ehhhdddg/ehccgggg/hhccgggg/hhhccggg", sol: "13572064" }, // 54: 20261118
  { id: "1fsbxx7", n: 8, dif: "mediu", zone: "aaaadddd/aaaddddd/afaadddg/fffaadgg/ffbaaddg/fbbbeidi/bbheeiii/bhheeiii", sol: "35702461" }, // 55: 20261119
  { id: "1c6iu87", n: 8, dif: "greu", zone: "iccgggbb/iiggbbbb/iiggbbbb/iigbbbbb/ddggbabe/dagaaaee/aaaahhee/aaaaahhh", sol: "20361475" }, // 56: 20261120
  { id: "09dbf8x", n: 8, dif: "greu", zone: "eehhhhaa/hhhhahaa/hhhaaaad/hhhcaaad/ccccggdd/ccccgidd/fccccidd/fiiiiidd", sol: "16275304" }, // 57: 20261121
  { id: "1yld862", n: 9, dif: "greu", zone: "hhheeeeii/dheeeieii/dhagiiiii/daagiiiif/aagggiiff/aaaggccff/gggggggff/bgbbfffff/bbbbbffff", sol: "260715384" }, // 58: 20261122
  { id: "011x1xo", n: 7, dif: "usor", zone: "bbbhhcc/bbeehhc/eeehhhh/geeehhh/giehhah/iieeaaa/ieeeaaa", sol: "2640513" }, // 59: 20261123
  { id: "0ddakgo", n: 7, dif: "usor", zone: "ehhhhhc/ehahccc/hhacccf/daaafff/ddgafff/dggffff/ggggfff", sol: "4053162" }, // 60: 20261124
  { id: "1a1e612", n: 8, dif: "mediu", zone: "eeeeebbb/eeeeeebb/iigebbbb/iigebgbb/ccggggab/cccccaaa/cccchhaa/ccchhddd", sol: "53026147" }, // 61: 20261125
  { id: "1aaw1f1", n: 8, dif: "mediu", zone: "hhhccccc/hhhccccc/hhaacggg/hhhafggg/hhaaffgg/ddaabggg/daaabegg/ddaeeeee", sol: "30275146" }, // 62: 20261126
  { id: "0rdbw0y", n: 8, dif: "greu", zone: "fffffbbb/fcccchhb/fccccahe/cccccaae/ccccaaee/cggaaage/cgggggge/iigggeee", sol: "50624731" }, // 63: 20261127
  { id: "0kikh07", n: 8, dif: "greu", zone: "gggiiidd/ggggddda/gccggaaa/ccggaafa/cgggafff/ccgcaaaf/cccchbff/chhhhbbb", sol: "36047152" }, // 64: 20261128
  { id: "1568z3q", n: 9, dif: "greu", zone: "bbbbeeeee/bbheeehee/bbhhhehhe/bbhchhhhe/baaccciie/baggcccii/aagggccfi/ddgggcgfi/ddddgggii", sol: "506318472" }, // 65: 20261129
  { id: "1pndxvt", n: 7, dif: "usor", zone: "eehdddd/eehdddd/eeeaadd/eeeeaad/eegggdd/igggggd/iicccgg", sol: "2615304" }, // 66: 20261130
  { id: "046gfxs", n: 7, dif: "usor", zone: "ieeeehh/iieeeea/cgeeeaa/cgggaad/cggggad/cgggddd/gggggdd", sol: "6135042" }, // 67: 20261201
  { id: "1csgmha", n: 8, dif: "mediu", zone: "dddddaeh/daaaaaeh/dddgeeee/ggggggee/cgciiiii/cccciiii/cccciiff/ccccifff", sol: "73061425" }, // 68: 20261202
  { id: "06u2nuq", n: 8, dif: "mediu", zone: "hhhheeee/hheeeeee/hhhheebb/chhhhebb/ccaaaaaa/ccgaaada/iiggaddd/ggggdddd", sol: "25704613" }, // 69: 20261203
  { id: "0lv705s", n: 8, dif: "greu", zone: "eddddddg/eddddggg/eeaadddg/eehaaddg/ihhhaggg/ihcaaggg/icccccgg/iccccffg", sol: "57142036" }, // 70: 20261204
  { id: "02q97ru", n: 8, dif: "greu", zone: "dhhhccii/dhhhccci/ddacccci/daaaafcf/dabaafcf/gababfff/gbbbbbbb/gbbbbbbb", sol: "27163504" }, // 71: 20261205
  { id: "0td9unm", n: 9, dif: "greu", zone: "ddddiiicc/ddddicccc/ddadiccff/ddaaggggf/aaaaabgbb/aaaabbbbb/ahhhhbbeb/aeeeeeeeb/eeeeeeeee", sol: "571864203" }, // 72: 20261206
  { id: "1ae4jzb", n: 7, dif: "usor", zone: "beehhhd/bbeeadd/beeaaad/bbbbadd/bbaaaaa/bbggaaa/bggccca", sol: "3614025" }, // 73: 20261207
  { id: "170881w", n: 7, dif: "usor", zone: "ddddddd/ddidddd/iiigaad/eiegeaa/eeeeeaa/eebeehh/ebbbhhh", sol: "4253061" }, // 74: 20261208
  { id: "1ydq7l8", n: 8, dif: "mediu", zone: "aaaagccc/adddgcci/aggdgcci/aaggggii/aggggiii/hbbbgiii/heebeiii/eeeeeiii", sol: "16357204" }, // 75: 20261209
  { id: "0i0g2nl", n: 8, dif: "mediu", zone: "iiiiiebb/ciiieeeh/ccieeeeh/gggeeeeh/ggaaaehh/dgaahhhh/dgaaahhh/ddaaahhh", sol: "63025741" }, // 76: 20261210
  { id: "12oty9z", n: 8, dif: "greu", zone: "ggiiiihh/ggggcchh/ggccchhh/gaaaahhd/ggaaaadd/gbaaaddd/bbaadddd/eeaaaddd", sol: "52463170" }, // 77: 20261211
  { id: "0jbkd4g", n: 8, dif: "greu", zone: "fffaahhc/faaahhhc/ffaaaahh/aaaaeehh/aaaeeehh/ggggieee/gdgiieee/ddiieeee", sol: "70635241" }, // 78: 20261212
  { id: "1xtd2z1", n: 9, dif: "greu", zone: "eehhhdddd/eeehhhddd/eehhadddd/hhhhaagdi/bhbaaaggi/bhbaaacii/bbbacccii/bbbaffffi/bbbbbbfii", sol: "502638471" }, // 79: 20261213
  { id: "1e5pkoj", n: 7, dif: "usor", zone: "bhhdddd/behhadd/eehhaad/eeehadd/eeeaagg/iieeaag/ieegggg", sol: "0362415" }, // 80: 20261214
  { id: "1k3uhab", n: 7, dif: "usor", zone: "ddddhhh/gdgaaaa/gggaaaa/ccggaaa/iciggea/iiieeea/iieeeea", sol: "6130425" }, // 81: 20261215
  { id: "0hsq4c8", n: 8, dif: "mediu", zone: "aaaahhhd/aaaaahdd/bbbaaadg/beeagggg/eeeegigg/eeeiiicc/eiiiiiii/eeiiiiii", sol: "52604731" }, // 82: 20261216
  { id: "142yf5w", n: 8, dif: "mediu", zone: "ddiiiiic/ddddiiic/ddddiccc/ddadggcc/aaaagggc/aaaaeegg/haheeggg/hhhebbgg", sol: "31726405" }, // 83: 20261217
  { id: "17au74b", n: 8, dif: "greu", zone: "bbbggccc/hhbggccc/heeegcic/eeeegcii/egggggii/eaadddii/eaaaaddd/eaaaaaaa", sol: "16024753" }, // 84: 20261218
  { id: "00bx8q1", n: 8, dif: "greu", zone: "ffiebbbb/ffiebbbb/faeehhbb/aaehhhhb/aaahhhbb/aaaaahhb/ddddaaag/dddaaagg", sol: "20357416" }, // 85: 20261219
  { id: "12mhvs3", n: 9, dif: "greu", zone: "gccffiiii/ggciiiidd/ggccggddd/gggggaddd/gbbbbaddd/bbaaaaddd/ebhhaaaad/ebhhaaadd/eeehhhaad", sol: "362481705" }, // 86: 20261220
  { id: "1uz86c6", n: 7, dif: "usor", zone: "iiiiidd/idddddd/iiigadd/ciggada/cggaaaa/cccaaae/cchheee", sol: "1530462" }, // 87: 20261221
  { id: "0rwqnaw", n: 7, dif: "usor", zone: "eeeeaaa/eeeeeea/eebbaaa/eebbaad/gggbggd/ccggggi/cccccii", sol: "4136205" }, // 88: 20261222
  { id: "0gv972l", n: 8, dif: "mediu", zone: "ddddddde/aadaddde/aadahhee/aadahhee/aaaaheei/affbbeei/ffffbbgg/fffffggg", sol: "20647315" }, // 89: 20261223
  { id: "1kpg0ps", n: 8, dif: "mediu", zone: "bbgaaadd/gggaaadd/ggfffaad/ggfaaahh/ggffahhh/gffaachh/giccaccc/iicccccc", sol: "02753614" }, // 90: 20261224
  { id: "0781nwc", n: 8, dif: "greu", zone: "hhhhheee/hhaeeeee/hhaaaaaa/haadagga/aaadggbb/daddgbbb/dddiifbf/dddiifff", sol: "14257036" }, // 91: 20261225
  { id: "0pz9izb", n: 8, dif: "greu", zone: "gggiiccc/ggeeiccc/ggeeehhc/bgehehhc/beehhhaa/bebbbhha/bbbhhhha/bbbbbhdd", sol: "35024716" }, // 92: 20261226
  { id: "0ycsly9", n: 9, dif: "greu", zone: "ccggiifff/ccgiiiiii/cggidiiii/ggggddddd/gggddaddd/ggggdaadh/ggaadahhh/baaaaaaae/baaaaaaee", sol: "615248307" }, // 93: 20261227
  { id: "0q8ipkd", n: 7, dif: "usor", zone: "ebbbggg/eebbggg/ehhbaag/aaaaagg/ffaadgg/ffaddgg/ffadddg", sol: "3024615" }, // 94: 20261228
  { id: "1kvu4as", n: 7, dif: "usor", zone: "gggbbbb/ggggggb/igbbbbb/ieeeebb/eeeeehh/aeaaaah/aaadddd", sol: "1603524" }, // 95: 20261229
  { id: "1fvwnqx", n: 8, dif: "mediu", zone: "iiiiiiii/iiigcccf/iiggaaff/eigggaaa/eggbgbah/bggbgbhh/bbbbbbhh/bbbbbbhh", sol: "14750263" }, // 96: 20261230
  { id: "1yc7ckq", n: 8, dif: "mediu", zone: "ffffggdd/ffffagdg/ffffaggg/fccaaggb/ccccaabb/hchheeee/hhhhheee/hhheeeee", sol: "46037152" }, // 97: 20261231
  { id: "1nogabo", n: 8, dif: "greu", zone: "eeegdddd/eeggdddd/egggaddd/eiigaddd/iiccaaah/iiifaaah/iiffaaah/iiiffaaa", sol: "02613574" }, // 98: 20270101
  { id: "0gm4bum", n: 8, dif: "greu", zone: "iiigdddd/gggggggd/gggdddgd/cgggdddd/cccaaaad/hcheeeaa/hchhbeaa/hhhhbbaa", sol: "13706425" }, // 99: 20270102
  { id: "1iatjye", n: 9, dif: "greu", zone: "iiiiieeeh/iiiiieehh/idddgeebb/ddddgbbbb/addggggff/adaggggcf/aaaagcgcc/aaaggcccc/aaacccccc", sol: "570628413" }, // 100: 20270103
  { id: "0rfqwkw", n: 7, dif: "usor", zone: "ciieeee/cgeeeee/cggbbee/ggggbaa/gdgggga/dddddda/ddddddd", sol: "1504263" }, // 101: 20270104
  { id: "00pas83", n: 7, dif: "usor", zone: "eeehhaa/ggeeaaa/ggbbaad/gbbaaad/ggggadd/ggggddd/giiiddd", sol: "4251603" }, // 102: 20270105
  { id: "08t9rfn", n: 8, dif: "mediu", zone: "aaaaaahh/aaaahhhh/aaddddhh/addidddh/gggiiddh/ggeeiiic/geeiiicc/bbeeiicc", sol: "47530261" }, // 103: 20270106
  { id: "1dep5rp", n: 8, dif: "mediu", zone: "hhhhhhhb/hhhehhbb/hheehbbb/aeeeeeeb/aaeeeeif/agggiiif/ddggggif/diiiiiif", sol: "46207315" }, // 104: 20270107
  { id: "1bh6hn1", n: 8, dif: "greu", zone: "ggggggdd/gggbeggd/bbbbeadd/eeeeeada/heeeeaaa/hheaaaaa/cheaaafa/chhhaaff", sol: "47253160" }, // 105: 20270108
  { id: "0bzbhf0", n: 8, dif: "greu", zone: "iccccccc/icaaahhh/icabahhh/ffabeeeh/ffabeeee/fbbbbeee/bbbeeeee/bbbbeegg", sol: "30471526" }, // 106: 20270109
  { id: "19d907w", n: 9, dif: "greu", zone: "eeehddddd/ehhhaaddd/eeaaaagdd/aaaaaggdd/aaaagggid/aaggggiid/baggiiiii/bbgiicffi/bggggccci", sol: "138246075" }, // 107: 20270110
  { id: "1l6qz9v", n: 7, dif: "usor", zone: "ggggdaa/ggdddaa/gdddaaa/dddhhhe/hdhhhbe/hhhhhbb/hccchbb", sol: "0246351" }, // 108: 20270111
  { id: "1081u8j", n: 7, dif: "usor", zone: "dddaaaa/iidahhh/iiieehh/ieeeehh/iiiiehe/iicgeee/iicggee", sol: "1350624" }, // 109: 20270112
  { id: "1ppoxx2", n: 8, dif: "mediu", zone: "hcccffii/hcaafffi/haaaaffi/heeaaafi/hheeeagg/eeeebbbg/eeebbbbb/eebbbbbb", sol: "61530724" }, // 110: 20270113
  { id: "13juv6q", n: 8, dif: "mediu", zone: "aaaeebbh/aageehhh/ddggeehh/ddggeehe/idgggeee/iiiggggg/iiiiigcg/iiiiiccg", sol: "50741362" }, // 111: 20270114
  { id: "0p1lt07", n: 8, dif: "greu", zone: "idabbeee/idaaaaee/idaaeeee/dddaeeeh/gggaaehh/ccgaaaah/cccaahhh/cccccchh", sol: "30614275" }, // 112: 20270115
  { id: "1q6uh0e", n: 8, dif: "greu", zone: "fffffbba/ffffffaa/fffaafaa/cfffaaad/cciiddad/iiiddddd/egggdddd/eegggggd", sol: "64702531" }, // 113: 20270116
  { id: "02m17dy", n: 9, dif: "greu", zone: "fffcccaaa/fbbgcaaaa/bbbgaahaa/bbbggahhh/bgggddhhh/bgggddddh/eeeggddhh/eeiiddddd/eeiiddddd", sol: "507286413" }, // 114: 20270117
  { id: "10d67mt", n: 7, dif: "usor", zone: "iiiiigg/iigiggg/figggbg/figgabg/ffcgabe/ffcaaee/faaaaae", sol: "1405263" }, // 115: 20270118
  { id: "1fs25vv", n: 7, dif: "usor", zone: "ddddiii/haddddi/haaddii/hadddgi/aaagggi/ffagggg/ffbbggg", sol: "6420513" }, // 116: 20270119
  { id: "0sbeg5a", n: 8, dif: "mediu", zone: "ccccccii/cccgciii/cggggiii/fffaggii/aaaagiii/abbggggi/bbbbggee/hhhbbeee", sol: "57403162" }, // 117: 20270120
  { id: "0165u4f", n: 8, dif: "mediu", zone: "cccggaaa/ccgggaad/cccfaadd/cccfaadh/ciifahhh/ciifaabh/iiifffbh/iiffffbb", sol: "37405162" }, // 118: 20270121
  { id: "1ybx6ar", n: 8, dif: "greu", zone: "hhhdgggc/hhhddgcc/haaaggii/aaaagiii/aaaaggii/aabggiii/abbbgiii/aabeeiii", sol: "36025714" }, // 119: 20270122
  { id: "04sp49p", n: 8, dif: "greu", zone: "ddggggcc/dggggccc/daaagccc/aabbggic/aeebbgic/aeebhccc/ahhhhhhh/hhhhhhhh", sol: "14736205" }, // 120: 20270123
  { id: "1n9xr8c", n: 9, dif: "greu", zone: "ccccgbbbb/fccggggbh/fccgggbbh/ficgggbeh/figggaaeh/iigaaaahh/iddaaaaah/idaaahhah/iddaaahhh", sol: "306471582" }, // 121: 20270124
  { id: "1emzfbo", n: 7, dif: "usor", zone: "fiiiiii/ffgiiii/fagieii/aaddeee/aadhheh/aaaahhh/aaaaahh", sol: "4203516" }, // 122: 20270125
  { id: "1uzstai", n: 7, dif: "usor", zone: "ffaaahh/faaaahe/faaaahe/aaaeeee/aggggge/dgggbbe/dggggbe", sol: "1536240" }, // 123: 20270126
  { id: "190e1r8", n: 8, dif: "mediu", zone: "dddddahh/ddiddaee/iiiddaae/iiidaaee/iiidagge/iiigggee/ccggbbbb/cggggbbb", sol: "60247315" }, // 124: 20270127
  { id: "0rgohnp", n: 8, dif: "mediu", zone: "bbeeeeee/hheegeee/hhegggee/hhhccgge/hhcccigi/hacciigi/aafffiii/affiiiii", sol: "07524136" }, // 125: 20270128
  { id: "0joj67r", n: 8, dif: "greu", zone: "ccchiiii/ccchhddi/cccchadd/ccachaad/ccaahaad/cffaaaad/fffffagg/fbbggggg", sol: "50473162" }, // 126: 20270129
  { id: "1xl5b4v", n: 8, dif: "greu", zone: "dhhhhhhh/deehaahh/iieaaahc/ieeaaacc/eeeeeacc/eeeegaac/bbeegaag/bbbbgggg", sol: "06153742" }, // 127: 20270130
  { id: "17k3qng", n: 9, dif: "greu", zone: "aaaabgggg/aaafbbggg/aaafffggg/aaaaccccc/hhhhhhcii/heehiicii/eeeheiiii/eeeeeeiii/eeeeeeddi", sol: "483160527" }, // 128: 20270131
  { id: "117n365", n: 7, dif: "usor", zone: "dddggbb/ddggeeb/dddaaeb/dddaaaa/ddaahaa/hdhhhaa/hhhccaa", sol: "6251304" }, // 129: 20270201
  { id: "0yrwo7c", n: 7, dif: "usor", zone: "ieeaadd/iieeaad/iiieadd/iieegdd/ieeeggg/igggggb/icccggb", sol: "3052461" }, // 130: 20270202
  { id: "1tmwm74", n: 8, dif: "mediu", zone: "ccggggge/cggddaee/iigdaaae/iiddahaa/iiidahha/iffaahha/ffaahhhh/fffahhhh", sol: "50731462" }, // 131: 20270203
  { id: "184aokc", n: 8, dif: "mediu", zone: "daaaaccc/dddaahhh/dddaaaeh/ddggeeeh/ddigeebh/diiieebe/iiiiieee/iiiieeee", sol: "53720614" }, // 132: 20270204
  { id: "11fydvq", n: 8, dif: "greu", zone: "eeeeeiii/eeeeeeei/beeeaeii/bbhaagff/bbhagggf/hhhagccc/hccccccc/hhhhcccc", sol: "52037461" }, // 133: 20270205
  { id: "0fnj6xp", n: 8, dif: "greu", zone: "ggggebbb/ggggeebb/gdgbbbbb/ddgaabfb/dddhafff/dddhafff/didddiif/diiiiiif", sol: "15746302" }, // 134: 20270206
  { id: "0irahwj", n: 9, dif: "greu", zone: "eeddaaaaa/eiddddahh/eiccgaaah/eiiigaaah/eeiggggfh/eeeebgfff/eebbbbfff/eebbbffbf/bbbbbbbbf", sol: "263185704" }, // 135: 20270207
  { id: "1juqouc", n: 7, dif: "usor", zone: "iiieeee/iiiiiee/diiieee/ddgieea/dgggbha/ggbbbhh/gggbbbh", sol: "4206153" }, // 136: 20270208
  { id: "17ske12", n: 7, dif: "usor", zone: "gggbbee/ggggeeh/idgaeeh/idaaehh/idaahhh/ddahhhh/daahhhh", sol: "4250316" }, // 137: 20270209
  { id: "0s6b3kk", n: 8, dif: "mediu", zone: "dddddiii/ddddddii/dddddgie/hhadggge/haagggbe/haaaggbb/hhhagbbb/hhaaffbb", sol: "52703164" }, // 138: 20270210
  { id: "1aql6sj", n: 8, dif: "mediu", zone: "iigggggd/iiiiggdd/iiigggdd/fiiigddd/ffccchdh/fffchhdh/bbfchhhh/baaahhhh", sol: "52604713" }, // 139: 20270211
  { id: "1csj3rd", n: 8, dif: "greu", zone: "hhhhaaaa/ehhaaaaa/eeeaaaaa/eebgggad/eebbggdd/eegbggdd/eeggggii/eggggcci", sol: "13026475" }, // 140: 20270212
  { id: "13oedbv", n: 8, dif: "greu", zone: "hhhhhhhh/ieeeehhh/iieeehah/iiieeeah/cffaaaaa/ccggaaaa/cggggaad/cgggaadd", sol: "53162047" }, // 141: 20270213
  { id: "0lkikft", n: 9, dif: "greu", zone: "cccaaaaaa/cgcccahha/cggggaahh/gggggaaah/gggddadhh/ggiidddhh/giiidddeb/gffidieeb/gffiiiiee", sol: "537042861" }, // 142: 20270214
  { id: "0amb4do", n: 7, dif: "usor", zone: "aaaaadd/aaaaddi/aaaaadi/eggagdi/eeggggi/bbbgggc/bbbbgcc", sol: "2460315" }, // 143: 20270215
  { id: "0w3gz2v", n: 7, dif: "usor", zone: "ccggeea/ccggbba/cgggbga/cigggga/iiddgaa/idddddd/ddddddd", sol: "5142603" }, // 144: 20270216
  { id: "0nrlcse", n: 8, dif: "mediu", zone: "iiiicccc/iiiccccc/iiigggcc/ieeeegcc/eebbggcf/eebaffcf/eehaffff/hhhaafff", sol: "60513724" }, // 145: 20270217
  { id: "01ph653", n: 8, dif: "mediu", zone: "eeebbbbb/hhebbgbb/haaagggg/aaaggggg/adaddggc/adddigcc/ddiiiici/dddiiiii", sol: "17025364" }, // 146: 20270218
  { id: "0khruye", n: 8, dif: "greu", zone: "dddgiiii/daagggei/daaageee/daaegeeh/aaaeeeeh/afaaabbb/afafffbb/ffffbbbb", sol: "53074261" }, // 147: 20270219
  { id: "1qacyv1", n: 8, dif: "greu", zone: "cgbbbeee/cgggggee/cccaggei/chaaggei/chhaaggg/cchhdddd/cchhhddd/chhhhddd", sol: "26473051" }, // 148: 20270220
  { id: "1kcs8hv", n: 9, dif: "greu", zone: "diicccccc/iicccccfc/iiiggfffc/eiigggfcc/eegggacch/bggggahhh/bggbaahhh/bbbbahhhh/bbbbbbhhh", sol: "082613574" }, // 149: 20270221
  { id: "0s414hf", n: 7, dif: "usor", zone: "iiiffff/eeeaaaf/ehhaaaa/hhhaaaa/hhhhagg/hhdhddd/hdddddd", sol: "2603514" }, // 150: 20270222
  { id: "1tfxzmc", n: 7, dif: "usor", zone: "ddddddh/gddddhh/ggddhhh/ggdaahb/gggaaeb/ccgaaeb/cggaaee", sol: "2046315" }, // 151: 20270223
  { id: "1x9zk9g", n: 8, dif: "mediu", zone: "ddhhhhaa/dddhaaaa/dgaaaaaa/ggggbaaa/gggbbbaa/ieebbfff/ieebbfbb/eeebbbbb", sol: "41635702" }, // 152: 20270224
  { id: "1od62yh", n: 8, dif: "mediu", zone: "bbbbbbee/bbbeeeee/bbhheeae/hhhaaeae/hchaaaaa/cccccgad/ccggggdd/ciigggdd", sol: "05361742" }, // 153: 20270225
  { id: "1g5jndt", n: 8, dif: "greu", zone: "iiidddaa/iciddaaa/gcggdaea/ggggdaea/gggddhea/bbbhdhee/hhbhhhee/hhhhhhhe", sol: "07136425" }, // 154: 20270226
  { id: "00c22ls", n: 8, dif: "greu", zone: "bbggggcc/bggggiii/bgggdddd/beaadddd/eeahhddd/aeahhhhh/aaahhhhh/aaaahhhh", sol: "75306142" }, // 155: 20270227
  { id: "1vmj52h", n: 9, dif: "greu", zone: "ddddaahhe/ddddaahhe/dddaahhaa/ddddaaaaa/diiddaaaf/iiiiggaff/iiiggggbf/ccccggbbf/cgggggbff", sol: "485027316" }, // 156: 20270228
  { id: "1lon8b9", n: 7, dif: "usor", zone: "eeeiiic/beeeeic/bbbeegc/bbbbbgg/gggbbgg/gaggggg/gaddddd", sol: "4260513" }, // 157: 20270301
  { id: "0cn9xm2", n: 7, dif: "usor", zone: "bbbgggg/bbbbbgg/bbbgggd/bbbbagd/hhhaagi/hheeegi/heeeiii", sol: "3164025" }, // 158: 20270302
  { id: "0zgmfft", n: 8, dif: "mediu", zone: "aaaddddd/aaaaaddd/eaagaadd/eeagggdd/eeeggggi/bbhcciii/hhhcciii/hhhciiii", sol: "63057142" }, // 159: 20270303
  { id: "035sw19", n: 8, dif: "mediu", zone: "hhhhbbbb/chhaabeb/cchdabee/ciddaaee/cigaaeee/ccgaaeee/cgggaaee/cccggeee", sol: "27351604" }, // 160: 20270304
  { id: "0kb8lxi", n: 8, dif: "greu", zone: "daaaaaaf/ddaaafff/hdhaaabb/hhhbbbbb/eeeeebgb/eggggggg/eiigiggg/eeiiiigg", sol: "71425063" }, // 161: 20270305
  { id: "14mbxhe", n: 8, dif: "greu", zone: "hhhdddaa/hhhaaaaa/hbhbbeea/hbbbbeee/bbbgeeii/gbbggiii/gbbggici/gggggcci", sol: "31724605" }, // 162: 20270306
  { id: "1m8ntrc", n: 9, dif: "greu", zone: "chhhheeee/cccheeeee/hhhheegge/hhhhbggee/hhhhbbggg/aaahbgggd/aabbbgggd/faggbggdd/fffgggiii", sol: "513642807" }, // 163: 20270307
  { id: "1b9w0tk", n: 7, dif: "usor", zone: "eeiiiii/eeeegii/begggii/beeeggg/bhaaagg/hhdddgg/ddddggg", sol: "5206413" }, // 164: 20270308
  { id: "04cura1", n: 7, dif: "usor", zone: "iieaggd/eeeagdd/eaaaaad/eeeahhh/beeehhh/bebbhhh/bbbbbbb", sol: "0463152" }, // 165: 20270309
  { id: "08ytqgk", n: 8, dif: "mediu", zone: "ccccccci/ccchciii/ahhhchii/aahhhhdi/aaaaaddi/aaagdddi/beegggdi/beeedddd", sol: "47516302" }, // 166: 20270310
  { id: "1rpz2rl", n: 8, dif: "mediu", zone: "ddddiicc/dddggggc/dddggggg/adaagggb/aaaaaabb/hahaaaae/hhheeaae/hhhheeee", sol: "57246130" }, // 167: 20270311
  { id: "0hz86vn", n: 8, dif: "greu", zone: "iiiiiiii/ieggggcc/ieebgccc/ieebffcc/eeebaacc/eeeaaacc/eeeaahcc/aaaahhhc", sol: "02753146" }, // 168: 20270312
  { id: "00mxv6c", n: 8, dif: "greu", zone: "eehhhhha/ieehhhaa/iehhhhaa/iidddaaf/gddaaaff/gggaaaaf/gbgaafff/gbbbbfff", sol: "62035174" }, // 169: 20270313
  { id: "1eov9dt", n: 9, dif: "greu", zone: "aaaddgggg/ffadddgcc/faaggggcc/bbaaggggc/bbbggggii/bbbggiiii/bbbegiiii/hbheeiiii/hhhhhiiii", sol: "250861374" }, // 170: 20270314
  { id: "0ye7fbv", n: 7, dif: "usor", zone: "iiiiidd/iiigddd/gigggdd/ggggaad/bggaadd/bbbeaad/bbeehhd", sol: "1624035" }, // 171: 20270315
  { id: "0ogpwms", n: 7, dif: "usor", zone: "aaaafff/aaaafii/baaccii/bgggiii/beeiiii/eeeeeie/eeeeeee", sol: "6142053" }, // 172: 20270316
  { id: "03yl9db", n: 8, dif: "mediu", zone: "ieeebbhh/ieeebehh/iiieeeeh/iiiieehh/iiieeaah/igggaadd/igggaaad/ggcccaad", sol: "46305172" }, // 173: 20270317
  { id: "0nyzb8k", n: 8, dif: "mediu", zone: "ccffffgg/ccffffgi/cccaffgi/cchafagi/hchaaadi/hchaeedi/hhhheiii/hhhhiiii", sol: "72036415" }, // 174: 20270318
  { id: "0aknefn", n: 8, dif: "greu", zone: "eiiidddd/eeegggdd/eeegdddd/bebgggdd/bbbggggd/bbbggaaa/bbggccha/bbggccha", sol: "20531746" }, // 175: 20270319
  { id: "1trlbko", n: 8, dif: "greu", zone: "ddddiiii/dddiiiii/ddddiicc/aaddgigc/aaaagggc/ehabgggg/ehabbggg/hhhhbbgg", sol: "35716042" }, // 176: 20270320
  { id: "009f8fd", n: 9, dif: "greu", zone: "ggggggggb/gggggggbb/ffggaabbb/ffcgeaeee/fhcgeeeee/fhcgiedde/icciiddde/iiiiddddd/iiiiddddd", sol: "470518263" }, // 177: 20270321
  { id: "0sovm8o", n: 7, dif: "usor", zone: "dddggga/iddggga/iidaaga/ieaaaaa/eeeeeea/behheea/bhhheaa", sol: "2516403" }, // 178: 20270322
  { id: "13iki84", n: 7, dif: "usor", zone: "bbeeeaa/beeaead/bbeaaad/bhhhaag/hhhaagg/cchhhcg/ccccccc", sol: "2640531" }, // 179: 20270323
  { id: "1hn7pac", n: 8, dif: "mediu", zone: "cccgggbb/ccccggga/cccgggaa/icggagaa/iiggaaae/dddgahee/dddddhhh/ddddddhh", sol: "61304752" }, // 180: 20270324
  { id: "0s88ux2", n: 8, dif: "mediu", zone: "ifffffff/iiffffff/iiifcccf/diifggcf/ddgggccc/daggahcc/aaaaahhc/aaaaeehh", sol: "71603524" }, // 181: 20270325
  { id: "15am54h", n: 8, dif: "greu", zone: "iieeeeaa/digeaaaa/digeaaha/dggeeehh/gggeeeeh/ggggbbbh/ccggbbhh/cccgbbbb", sol: "16047352" }, // 182: 20270326
  { id: "0bng6a6", n: 8, dif: "greu", zone: "bbbbgiii/bebbgidi/eebeggdi/eeeeegdd/eeaaaddd/eeahaaad/eehhaaaa/eehaaaff", sol: "50413726" }, // 183: 20270327
  { id: "08nry6e", n: 9, dif: "greu", zone: "hheeebbff/hhheeeaaf/hhhaaaaaf/hhhhaffff/hhhhaaaff/hhaaaaafi/hdddaaafi/ddddgcafi/ddgggccfi", sol: "630748152" }, // 184: 20270328
  { id: "1fmkc4x", n: 7, dif: "usor", zone: "cccggdd/ccggggd/cccgggd/cgggaad/cggeaad/iieeeaa/iiehhaa", sol: "6205314" }, // 185: 20270329
  { id: "1tvqixd", n: 7, dif: "usor", zone: "ggggbbb/gggbbeb/ggahhee/gaaaaae/aaaaaae/adaeeee/dddiiii", sol: "5042613" }, // 186: 20270330
  { id: "1ki1j2z", n: 8, dif: "mediu", zone: "ggcchhee/gggcchhe/gggcchhe/bbgccchh/gggcchhh/gggggahh/iddaaahh/iiddaaaa", sol: "62417503" }, // 187: 20270331
  { id: "0asrj53", n: 8, dif: "mediu", zone: "bbbbbeee/bbgggeee/bbbgaeee/fffgaeee/cfaaahhe/caadahhh/ccadaahh/hhhhhhhh", sol: "14620357" }, // 188: 20270401
  { id: "154igtt", n: 8, dif: "greu", zone: "hhbeiiii/hhbeeiii/abbbeggi/aaaggggi/aaffgcii/affffccc/afffcccc/fffffffc", sol: "14257063" }, // 189: 20270402
  { id: "14ggiu3", n: 8, dif: "greu", zone: "idhhhhhh/iddahhhh/ddaahhhe/dggaheee/ggaaaabb/ggggaabb/gggaaaff/ggggaaaf", sol: "04153627" }, // 190: 20270403
  { id: "1sr6dah", n: 9, dif: "greu", zone: "aaffbbgii/aabbbgggi/aahhbbggg/addhebbgg/aadheebee/aahheeeee/hhhhhehee/cchhhhhee/ccchhheee", sol: "385720416" }, // 191: 20270404
  { id: "1oy4wex", n: 7, dif: "usor", zone: "aaaeegg/adaabbg/ddaggbg/dddgggg/ddiiigc/dddiicc/ddiiicc", sol: "4053162" }, // 192: 20270405
  { id: "0h2kp40", n: 7, dif: "usor", zone: "eeeeeee/eebeheh/ebbehhh/bbbeahh/bbggaah/gggdddd/iiddddd", sol: "3614250" }, // 193: 20270406
  { id: "1bvgm2i", n: 8, dif: "mediu", zone: "ffffffff/ffffffii/aaafffii/haaaaagi/haeggagi/eeeggggd/eebbgggd/eeebggdd", sol: "57204136" }, // 194: 20270407
  { id: "082i7z4", n: 8, dif: "mediu", zone: "iiiiffff/iiifffff/igicffff/igccaaaf/iehcaaaf/iehhddaa/eehhddaa/eeehhaaa", sol: "27163504" }, // 195: 20270408
  { id: "023jiag", n: 8, dif: "greu", zone: "bbeeeeei/bbbeaeii/bgbaaadd/bgggaadh/ggccahhh/gggcahhh/gggchhhh/gggccchh", sol: "27064153" }, // 196: 20270409
  { id: "0o06pbg", n: 8, dif: "greu", zone: "bbbaaacc/beeaaach/beaahhhh/eeaaaaah/eaaaahhh/eeegaahh/eeigddhh/eeigdddh", sol: "06147352" }, // 197: 20270410
  { id: "0xmx06z", n: 9, dif: "greu", zone: "ccccccfff/ccccccaff/hccccaaff/hhhcaaabb/ehhaaggbg/ehhaaggbg/eeeeegggg/iiieggggg/iiiggggdd", sol: "620475318" }, // 198: 20270411
  { id: "1rpa3ca", n: 7, dif: "usor", zone: "bbbbaaa/bbbaaaa/bgggffa/bbgffaa/bggccaa/beehcaa/eeehhaa", sol: "6052413" }, // 199: 20270412
  { id: "06y38x9", n: 7, dif: "usor", zone: "hhhhhdd/eeaaaad/eaaaaag/eaaffgg/babbbgg/bbbbggg/bbggggg", sol: "2604135" }, // 200: 20270413
  { id: "1rocqsl", n: 8, dif: "mediu", zone: "hhheeeei/hheeeeii/hhheeeii/dddddiif/dddgggff/dddggggf/dddaggbf/daaabbbf", sol: "02614735" }, // 201: 20270414
  { id: "15oedqe", n: 8, dif: "mediu", zone: "hhaaaddd/haaaaadg/aaaffaag/aaaffaeg/bbffieee/fbfiieee/fffiiiee/fffiiiie", sol: "50273164" }, // 202: 20270415
  { id: "1fem7o7", n: 8, dif: "greu", zone: "hhhhbbbb/dhhhhbbb/dhhhbbbb/daaeeebb/ddaaaeee/daaageie/daaggiii/aaaaggcc", sol: "15042637" }, // 203: 20270416
  { id: "0x0rgm3", n: 8, dif: "greu", zone: "beeeeiii/bbbeeeii/hhaeaeii/aaaaagii/adagggic/adaaagcc/dddggggg/ddddgggg", sol: "04162753" }, // 204: 20270417
  { id: "1c3r63m", n: 9, dif: "greu", zone: "bbgggfffi/bbgggfiii/ggggggiee/cgcggdiee/cccgdddee/hchaaaeee/hchaheeee/hhhhheeee/hhhhhheee", sol: "702641385" }, // 205: 20270418
  { id: "0r0so8i", n: 7, dif: "usor", zone: "hhaaadd/hhaeadg/heeegdg/eeeeggg/eeegggg/eeiggcg/eeiiicg", sol: "6204153" }, // 206: 20270419
  { id: "1dzo6ve", n: 7, dif: "usor", zone: "ggggggg/dagggii/daaggci/daeggci/haeeiii/haeeeei/hheeiii", sol: "4025361" }, // 207: 20270420
  { id: "13g7iqt", n: 8, dif: "mediu", zone: "ddiiiigc/ddiiiggc/iiieeggg/iieeebgb/eeeeebbb/aehheebb/aehhhbbb/aahhhhbb", sol: "17264053" }, // 208: 20270421
  { id: "12kwscx", n: 8, dif: "mediu", zone: "iddhhhhh/iiddddhh/eddhdhhh/eedhhhhh/eeeeeaah/begggaaa/bbbgggaa/bbbfffaa", sol: "03716425" }, // 209: 20270422
  { id: "1x19dwh", n: 8, dif: "greu", zone: "gaaaaddd/ggaeaddd/ggaeaahh/egeeehhh/eeehhhhh/eeeehccc/ebehhcic/ebbhccic", sol: "35024716" }, // 210: 20270423
  { id: "0b773dz", n: 8, dif: "greu", zone: "eeaaaaff/eeeaaaff/ebggdaaa/ebggdaah/gbgddddh/gggdhhdh/gigddhhh/iidddhhh", sol: "62531740" }, // 211: 20270424
  { id: "1suirki", n: 9, dif: "greu", zone: "diieeeeee/deeeeehee/deaaaeheb/daaaahheb/ggfcchhhb/ggffccchh/gggfccchh/ggcccccch/ggcccccch", sol: "250483716" }, // 212: 20270425
  { id: "1b30mg1", n: 7, dif: "usor", zone: "ddiiiii/ddidicc/ddddgcg/ddddggg/daddggg/aaaaage/ahheeee", sol: "3504162" }, // 213: 20270426
  { id: "0h561xd", n: 7, dif: "usor", zone: "hhhhhdi/chhhhdi/cchdddi/hhhhddd/ehhaagg/eeaaaag/eaaaaag", sol: "6042513" }, // 214: 20270427
  { id: "10iwfgn", n: 8, dif: "mediu", zone: "eeeeeegg/beheeegd/bhhhaagd/hhhaaadd/hhhhaaaa/hhhhcaaf/hhhcccaf/cccccfff", sol: "26074135" }, // 215: 20270428
  { id: "1l72ip2", n: 8, dif: "mediu", zone: "eeeeiiii/eeeegddd/eeeggddh/eeggddhh/eebggahh/bebbgahh/bbbbgahc/bbbaaacc", sol: "41526073" }, // 216: 20270429
  { id: "1e51jfg", n: 8, dif: "greu", zone: "haaddddd/haaaaddd/hhaaaadd/hhbbaddd/heebeegg/hhebeigc/hheeeigc/eeeeiiii", sol: "15036274" }, // 217: 20270430
  { id: "0xhfiij", n: 8, dif: "greu", zone: "iccgggdd/icgggddd/iigggada/eigaaada/eigaaaaa/eeeeaafa/ehheaafa/hhhaafff", sol: "27415360" }, // 218: 20270501
  { id: "10ngsna", n: 9, dif: "greu", zone: "beeeehhhc/beehhhhhc/bbbbbhahh/bfaaaaaaa/gfaaaaada/gffgggada/ggggiiddd/ggiiidddd/gdddddddd", sol: "385062417" }, // 219: 20270502
  { id: "0ep0cra", n: 7, dif: "usor", zone: "bbhhhhe/bbhaahe/bbbaaaa/bbbgada/bbbgadd/bggggdd/ggggiii", sol: "2630514" }, // 220: 20270503
  { id: "1i0xsf3", n: 7, dif: "usor", zone: "aaaahhc/haahhcc/hhhhhcc/eehhccc/eiddgcc/eiiggcc/iigggcc", sol: "5260314" }, // 221: 20270504
  { id: "138e7r7", n: 8, dif: "mediu", zone: "ichhhaaa/iccchhaa/iiggdaaa/ggggddda/gbgdddaa/gbgdaaaa/bbgaaeea/gggeeeee", sol: "42035716" }, // 222: 20270505
  { id: "1y0c0w7", n: 8, dif: "mediu", zone: "cccgggee/ccccgbba/icggggba/icggggaa/iiiigdda/ffidddda/fiidddda/iiddddda", sol: "75164203" }, // 223: 20270506
  { id: "1hn78k1", n: 8, dif: "greu", zone: "eeigdddd/eeiggggd/eiiegddd/eeeeaadd/eeaaaadd/eeeaaahd/beeahhhh/bbhhhhcc", sol: "52413607" }, // 224: 20270507
  { id: "1hw4kaf", n: 8, dif: "greu", zone: "ffiiieeb/fffiiieb/ffiiieeb/ffciiigg/ffcididg/faaddddg/faaadddd/fadddddd", sol: "57362041" }, // 225: 20270508
  { id: "0kt3hmw", n: 9, dif: "greu", zone: "hhhhhhddd/ebhhhdddd/ebhdddddd/eehhhhaad/aeahaaagd/aaaaaaggd/aacacccgg/aacccciig/fffccciig", sol: "318057462" }, // 226: 20270509
  { id: "05txfzy", n: 7, dif: "usor", zone: "eeeeaaa/ebeaaaa/gbaaaaa/gbaaaad/ggggddd/gggiidd/cciiiii", sol: "3516240" }, // 227: 20270510
  { id: "0nrydom", n: 7, dif: "usor", zone: "eeeeebb/iegegbg/igggggg/iggggdd/faagddd/ffaggdd/faaaddd", sol: "2504613" }, // 228: 20270511
  { id: "1rmdoat", n: 8, dif: "mediu", zone: "hhhbgggg/ahabgggg/aaafgggd/acafgddd/acffgddd/acffggdd/cccffiid/cccciiid", sol: "03527146" }, // 229: 20270512
  { id: "1k6voud", n: 8, dif: "mediu", zone: "ggggiiii/ggiiieii/ggffieee/gccfieee/gciiieee/gcccchee/aaccchbb/hhhhhhhb", sol: "24631507" }, // 230: 20270513
  { id: "1gqmkrn", n: 8, dif: "greu", zone: "aaaffffi/aaccccii/haaaccii/haddgiii/dddgggie/ddggggge/dggggeee/dgggeeee", sol: "35206147" }, // 231: 20270514
  { id: "18wg45v", n: 8, dif: "greu", zone: "heeeeeee/heeheegg/hhhheeaa/hhhhheea/hhchbbba/hhccffaa/cccciffa/ccciifaa", sol: "16074253" }, // 232: 20270515
  { id: "1m7npj6", n: 9, dif: "greu", zone: "ggggggccc/ggggggccc/ggidgcccc/igidggccc/iiiddacfc/eeiedaafa/eeeehaaaa/eeehhhaaa/eeebbbaaa", sol: "263071485" }, // 233: 20270516
  { id: "0wei4h9", n: 7, dif: "usor", zone: "ddhhhhh/dddhhbb/dddhbbb/aaahhhe/aaaahee/faaaaei/ffffaei", sol: "3142506" }, // 234: 20270517
  { id: "0lphua9", n: 7, dif: "usor", zone: "ccccchh/cccchhh/caaaheh/aaaaaee/adaaabe/addggbe/aaggggg", sol: "0426153" }, // 235: 20270518
  { id: "1sehhrm", n: 8, dif: "mediu", zone: "ddddddaa/ggdaaaaa/cgaahaha/cggahhha/cgeehhha/ggeeebhh/ggeeebhh/iieeebhh", sol: "47026351" }, // 236: 20270519
  { id: "0kumc6d", n: 8, dif: "mediu", zone: "dddhhhbb/dddaahbb/gddahheb/gggaaheb/gggaaeee/cgggggii/cgccgggi/cccccccc", sol: "46135270" }, // 237: 20270520
  { id: "1uohy9k", n: 8, dif: "greu", zone: "dddaaaaa/gdddddda/gggggaaa/gggeeaaa/iiiieaaa/iiiiehha/fiiiichh/ffiicchh", sol: "73142605" }, // 238: 20270521
  { id: "14lrff6", n: 8, dif: "greu", zone: "bbeeeeee/beeeaaee/bbbeaahh/gggaaaaa/ggggaaaa/cccgaaad/iicgaddd/iiigdddd", sol: "40753162" }, // 239: 20270522
  { id: "00zlxj5", n: 9, dif: "greu", zone: "dddggggcc/ddaaaagcc/ddaaegggc/ddaaegccc/hddaeiicc/haaaeeiii/hahaeeiii/hhhhbbfii/hhhhbbfii", sol: "318205746" }, // 240: 20270523
  { id: "0sq5exp", n: 7, dif: "usor", zone: "ddggggi/daaagii/aaaaeii/aaaeeii/aaheeei/bahehee/bhhhhee", sol: "1462503" }, // 241: 20270524
  { id: "0ajp0w9", n: 7, dif: "usor", zone: "aaaaebb/aaagebb/ddggebb/ddggbbb/iggggbb/iiggggb/iicccgg", sol: "2416053" }, // 242: 20270525
  { id: "0adkycv", n: 8, dif: "mediu", zone: "fiiiiccc/ffcccccc/ffccchcc/ffaahhhc/fffaaahh/ffaaaehh/ffageebh/gggggbbh", sol: "14027536" }, // 243: 20270526
  { id: "0tdvmew", n: 8, dif: "mediu", zone: "hhhhccci/hhccciii/hhhccccc/hhaacccf/haaccgff/daaaagfb/dgggggbb/dggggggg", sol: "15372064" }, // 244: 20270527
  { id: "1rsrhqp", n: 8, dif: "greu", zone: "diiiiiee/ddiiiiie/ddggeeee/ddggggge/dddgagbb/ddaaaaaa/aaahhccc/aaahcccc", sol: "17046253" }, // 245: 20270528
  { id: "022kx0g", n: 8, dif: "greu", zone: "baaaaddd/bfaddddd/ffaaagdd/faaaeggd/faaeeegg/fffiiegg/fciiiegg/cccciiii", sol: "06135742" }, // 246: 20270529
  { id: "1ptcqlh", n: 9, dif: "greu", zone: "ccgggfiee/cggggfiee/ccgagiiee/aaaagieeb/aaaggeeeb/aaaaeeebb/daaaahebb/dahhhhhbb/ddddhhhhh", sol: "506472831" }, // 247: 20270530
  { id: "0d4zg8w", n: 7, dif: "usor", zone: "ccccggg/ccchagg/ccchadd/chhhaaa/hhhaaaa/haaaafa/hbbbbff", sol: "4061352" }, // 248: 20270531
  { id: "1ygth20", n: 7, dif: "usor", zone: "dddddda/ddddaaa/iddddaa/iiiggaa/iiccggg/iccggbg/iiffbbg", sol: "1604253" }, // 249: 20270601
  { id: "0m1wgv6", n: 8, dif: "mediu", zone: "bbbbfiii/gbbfffii/gbbafiic/gbbaficc/geeacccc/eeaahccc/ehhhhccc/ehhhcccc", sol: "75203146" }, // 250: 20270602
  { id: "1r12gxv", n: 8, dif: "mediu", zone: "ddggbbff/ddgbbaff/ddgaaaaa/dgggeeaa/diigeehh/iieeeeeh/iiiieeee/iiiiieee", sol: "63520741" }, // 251: 20270603
  { id: "1cdzzm0", n: 8, dif: "greu", zone: "diiigggg/digggggg/didddggg/dddddgee/hdddggee/hadaaaae/haaafabe/hhaaffbb", sol: "15270364" }, // 252: 20270604
  { id: "0rl2vp6", n: 8, dif: "greu", zone: "eeeeeehh/eeeeeehh/aaaehhhh/daaahhhh/daaaaacc/dgggafcc/ggggbffc/ggggbbfc", sol: "36207514" }, // 253: 20270605
  { id: "0voyygq", n: 9, dif: "greu", zone: "iifaddddd/iffaadhhd/ifaahhhhd/cccahhehh/ggcaaaeeh/ggcaaaeee/ggggabeee/ggggbbeee/ggggggeee", sol: "081742536" }, // 254: 20270606
  { id: "1xm2fhn", n: 7, dif: "usor", zone: "eeeeeee/eeggiii/eeggddd/eeagddd/ebaaadd/ebbhddd/bbbhddd", sol: "0526413" }, // 255: 20270607
  { id: "13gn1j0", n: 7, dif: "usor", zone: "dddddii/ddgggii/ddgggic/aaagggc/eeggggg/ebbbbbb/ebbbbbb", sol: "5162403" }, // 256: 20270608
  { id: "0q7ni46", n: 8, dif: "mediu", zone: "ddggggii/dgggggii/gggeeeie/gggeeeee/bbbeeeee/ffbbbehh/faabaeaa/faaaaaaa", sol: "13642705" }, // 257: 20270609
  { id: "0r0io6r", n: 8, dif: "mediu", zone: "iiiddhhh/iiiddhah/iiddaaah/idddaahh/iddaaehh/idaageeb/gggggeeb/gccgggeb", sol: "60425731" }, // 258: 20270610
  { id: "01anrmg", n: 8, dif: "greu", zone: "iiiicccc/iiiicaaa/iifffffa/iiifaaaa/iiffbaaa/ggffbeae/dgfgbeee/dggggeee", sol: "51364702" }, // 259: 20270611
  { id: "07d5662", n: 8, dif: "greu", zone: "ggggciii/dgaaciii/ddaaccii/hdaaacci/haaaffii/hhabbffi/haaafffi/hafffiii", sol: "37152460" }, // 260: 20270612
  { id: "0auh732", n: 9, dif: "greu", zone: "iddaaaaae/iiddaaaee/gddddaaeb/gdddddahb/gdddddahh/ggdaaaaah/ggggccaah/ggffchhhh/gffcccchh", sol: "075831462" }, // 261: 20270613
  { id: "1e17j2o", n: 7, dif: "usor", zone: "aaaaahh/aahhhhh/aaheehb/aeeebbb/eeegggg/eeeggdg/eeiiidg", sol: "0461352" }, // 262: 20270614
  { id: "0dy4fza", n: 7, dif: "usor", zone: "ahhhhhd/aahhhdd/aahhhdd/eaadddd/egggddd/eeegggi/ebbggii", sol: "4150362" }, // 263: 20270615
  { id: "1qmuiao", n: 8, dif: "mediu", zone: "ggggccch/bggggach/bggggaah/bbbggdaa/beegidda/bbeeiddd/eeeiiiid/eeeeiiii", sol: "47260531" }, // 264: 20270616
  { id: "0e1kklr", n: 8, dif: "mediu", zone: "ggggiiii/gggggddd/gggggddd/gbgddddd/bbgaahhh/beeeaahh/beeehhhc/eeeeeehc", sol: "40513627" }, // 265: 20270617
  { id: "1cnfhy7", n: 8, dif: "greu", zone: "cccccggg/hccggggi/hhhbgeei/hhabggii/aaabgiii/ddagggii/ddgggiii/ddddiiii", sol: "40631572" }, // 266: 20270618
  { id: "1q750ro", n: 8, dif: "greu", zone: "diiiiccc/diicccgc/diiiiggg/ddgggggg/daggggbb/aaagggeb/faagageb/ffaaaeeb", sol: "35047261" }, // 267: 20270619
  { id: "0bmqzfq", n: 9, dif: "greu", zone: "hhheeaccc/hheeaaacc/hhaaaaagg/haaaaaagg/haaagaggg/ddddggggg/dddgggbbg/dddiiffbb/ddddiifbb", sol: "825041736" }, // 268: 20270620
  { id: "1c4ppoh", n: 7, dif: "usor", zone: "iiieeee/ddgggeg/adggggg/adddggc/aahhcgc/hahcccc/hhhhccc", sol: "2514063" }, // 269: 20270621
  { id: "1ktcql6", n: 7, dif: "usor", zone: "ddddiee/dgdiiie/dgggeee/dggggae/gggggae/bgaaaaa/bbaaffa", sol: "1362504" }, // 270: 20270622
  { id: "0f0zl60", n: 8, dif: "mediu", zone: "hhhhheee/hhhhheee/accchhhe/acahhhee/aaaabbbe/aadggbbb/ddddggbb/diiggggg", sol: "47306251" }, // 271: 20270623
  { id: "1ss4iay", n: 8, dif: "mediu", zone: "ggccfffa/gggffffa/ggaaaaaa/gggaaaaa/gbggddda/bbggdddd/eegiiddd/eiiidddd", sol: "35726140" }, // 272: 20270624
  { id: "0phrbza", n: 8, dif: "greu", zone: "ddaaaaaa/idddaaaa/iiggaaaf/eiiieabf/eeeeeabf/eeeebabb/eeehbbbb/eehhhbbb", sol: "05317264" }, // 273: 20270625
  { id: "002hn60", n: 8, dif: "greu", zone: "eeeaaaff/eeeeaaff/eiieeaff/iigaaaaf/iggaahaa/iggdhhaa/cgddhhhh/cggddhhh", sol: "73162504" }, // 274: 20270626
  { id: "0p2v12x", n: 9, dif: "greu", zone: "bbbbbgddd/bbbbbgggd/ffbbfgdgd/fffffgddd/ffffaaadd/ffffaeahd/icfaaeehh/icaaaehhh/ccaaeeeee", sol: "368247051" }, // 275: 20270627
  { id: "0rl1vdd", n: 7, dif: "usor", zone: "ggbbeii/gggaeei/ggaaaee/daaaaae/ddaaaee/daaahhe/ddhhhhe", sol: "2613504" }, // 276: 20270628
  { id: "0j1hox5", n: 7, dif: "usor", zone: "bbbbeee/bbbgeee/gbgggii/ggggddi/ggddddd/gddddda/gddhhaa", sol: "4150263" }, // 277: 20270629
  { id: "0ko5c4t", n: 8, dif: "mediu", zone: "bbbbbfff/bebbffff/aeebbfff/aagbffff/agggcffi/ddggccii/dggggcii/dggiiiii", sol: "46203157" }, // 278: 20270630
  { id: "0eqslrv", n: 8, dif: "mediu", zone: "baaadddd/bbaaaadd/baaaaddd/ggggaadd/ggggeahh/cgggehhe/ciggehhe/ciiieeee", sol: "51426073" }, // 279: 20270701
  { id: "0pjqhrl", n: 8, dif: "greu", zone: "ccgiiiii/cggddddd/gggaddhd/gaaadahd/gggaaahh/geeeaeeh/beeeeeeh/bbbbhhhh", sol: "60531742" }, // 280: 20270702
  { id: "0wni4ih", n: 8, dif: "greu", zone: "iiiiiddd/gigggddd/gggaddhd/gggaaahd/gggahahh/gbeahhhc/bbeahhhc/aaaahhhc", sol: "35146207" }, // 281: 20270703
  { id: "1ii8lx0", n: 9, dif: "greu", zone: "ffaaaeeeb/faaaaeeeb/aaagaeeee/hadggegee/hddggggee/hddddggee/hdddggiee/hddddiiii/hdddiiccc", sol: "182530647" }, // 282: 20270704
  { id: "0k7fxhv", n: 7, dif: "usor", zone: "ddaaaaa/ddaaahe/dddahhe/dddgbbe/dddggbb/dgggggg/dgcccgg", sol: "2640513" }, // 283: 20270705
  { id: "09k7wl7", n: 7, dif: "usor", zone: "iiiggbb/iiiiebh/ddiieeh/dddieeh/ddddhhh/dddhhhh/daaaahh", sol: "3524061" }, // 284: 20270706
  { id: "1yvyrjb", n: 8, dif: "mediu", zone: "dggbbbbh/dggbbgbh/ddggggbh/aaggeeee/aaageeee/aaaaaeee/ccffaaae/cccaaeee", sol: "57136420" }, // 285: 20270707
  { id: "1vldrfw", n: 8, dif: "mediu", zone: "ffaabbgg/afaabbgg/afaaeegg/aaaaaggi/hhaagggi/hhddddii/hhhddddd/hhhhdddd", sol: "51462730" }, // 286: 20270708
  { id: "0shwexg", n: 8, dif: "greu", zone: "bbbbgggg/bbbbgagd/bbbggadd/bbggaadh/fffgaadh/iifffaaa/iffcaaaa/iiicccaa", sol: "51647203" }, // 287: 20270709
  { id: "11z5jh0", n: 8, dif: "greu", zone: "iiiieeee/iieiieee/cieeeebh/cieegebh/cgeegahh/gggggaha/dgdagaaa/dddaaaaa", sol: "41607352" }, // 288: 20270710
  { id: "0guih24", n: 9, dif: "greu", zone: "bbbbbffff/bbbbbffaf/bhbaaaaaf/hhhhahaff/hehhhhaff/iehhhcaff/iehhcccff/iiiiiggff/iiiddgggg", sol: "827315064" }, // 289: 20270711
  { id: "1g6uh7u", n: 7, dif: "usor", zone: "fiifbbb/ffffbbb/afaabbb/aaaggbb/haaeggb/hheeebb/hhheebb", sol: "1362504" }, // 290: 20270712
  { id: "12zot83", n: 7, dif: "usor", zone: "ddggggg/dddgggg/addgbgg/aaaabbg/aaaaebe/faaaeee/ffaaeii", sol: "3142605" }, // 291: 20270713
  { id: "1guuojq", n: 8, dif: "mediu", zone: "ffaaaaaa/faaaaaaa/fbeeeaaa/fbbeegad/iggggggd/iiggccgg/iggccccc/gggccccc", sol: "16427305" }, // 292: 20270714
  { id: "1dz4z3l", n: 8, dif: "mediu", zone: "ggbbeeeh/gggbehhh/gggeehcc/gdggaacc/dddaaccc/dddacccc/ddddiccc/ddiiiccc", sol: "63504172" }, // 293: 20270715
  { id: "0ofec3b", n: 8, dif: "greu", zone: "iiiiiiff/iidigfff/dddggfff/dddagfff/dhaabffb/dhhbbffb/hhebbbbb/hheebbbb", sol: "57403162" }, // 294: 20270716
  { id: "1ej93tx", n: 8, dif: "greu", zone: "ccfffiif/hcffffff/haaaabfb/haaabbbb/hheabbbb/hheaaegb/hheeeegg/hhhheggg", sol: "51624037" }, // 295: 20270717
  { id: "15w2hn0", n: 9, dif: "greu", zone: "dddddddcc/ddddahhci/aaaaahhci/ahhahhhhh/aehhhhbbb/aeehhggbb/aaehhbgbb/aaeafbbbb/aaaafffff", sol: "718035264" }, // 296: 20270718
  { id: "0tet30f", n: 7, dif: "usor", zone: "iiiddda/eigggga/eeeagaa/eeeaaaf/bbeeaaf/beebaff/bbbbfff", sol: "3142506" }, // 297: 20270719
  { id: "1w71vnf", n: 7, dif: "usor", zone: "adddddd/aadddhd/aaaaahh/aaeehhh/faaehhh/faeehch/bbbhhcc", sol: "4163052" }, // 298: 20270720
  { id: "1n1ruwa", n: 8, dif: "mediu", zone: "ddddgggc/ddddagic/dhdaagii/hhaaggii/hhhaaeei/hhhhaeei/hhhhheee/hhbbbeee", sol: "47063152" }, // 299: 20270721
  { id: "0jkico3", n: 8, dif: "mediu", zone: "ggiidddd/ggggdddd/bbbgaadd/bbeeaaaa/bbeeeaaa/bbeeaaaa/beeeeaaf/bhhhaaff", sol: "25364071" }, // 300: 20270722
  { id: "1e9ex0t", n: 8, dif: "greu", zone: "hhaaafff/hhhhaaaa/hhaaabbb/hhhhaaee/hhhaaaee/hddaggee/dddggiee/ddiiiiie", sol: "60573142" }, // 301: 20270723
  { id: "1jc7qg2", n: 8, dif: "greu", zone: "eeeegiii/eeeegiii/ehheeeii/ebhheiii/bbhaeeii/ffaaeeid/fffaaadd/aaaadddd", sol: "47520316" }, // 302: 20270724
  { id: "0tsjpi0", n: 9, dif: "greu", zone: "hhhhcffff/hhhcciifi/hhcccciii/hhcccciee/hhcggcgeb/hhccgcgeb/haaaggggb/haaaagggg/hddaagggg", sol: "506274831" }, // 303: 20270725
  { id: "0ius0nz", n: 7, dif: "usor", zone: "hhhhhhh/hhhhhhc/ahccccc/aaagccc/bgggiic/bbggfif/bbfffff", sol: "2603514" }, // 304: 20270726
  { id: "0ju1uvx", n: 7, dif: "usor", zone: "dhhhhhh/dddhhbh/adahbbb/aaahbee/aahhbbe/faaeeee/ffaeeii", sol: "3142605" }, // 305: 20270727
  { id: "1uh5o56", n: 8, dif: "mediu", zone: "ddifffff/dgiccccf/dggccccc/ddgaaccc/ddddaaaa/ddhaaeee/dhhhaeee/dhheeeee", sol: "27164035" }, // 306: 20270728
  { id: "14h6qcj", n: 8, dif: "mediu", zone: "aaaadddd/ccaadddd/hhaaddgd/hhhaaggg/eeeegggg/iieeeggg/eiebbbbg/eeebbbgg", sol: "30726415" }, // 307: 20270729
  { id: "1wzz3d4", n: 8, dif: "greu", zone: "bbbggccc/begggggc/beeadggg/aaaaddgg/aaaadggi/ahaadggi/hhaddddd/hhhhhhdd", sol: "50263741" }, // 308: 20270730
  { id: "0nfz9yo", n: 8, dif: "greu", zone: "aaahhhhh/adaaahhh/ddaaahbb/daadhheb/ddddhheb/diiieeeb/iiicgggb/iiicgbbb", sol: "42706153" }, // 309: 20270731
  { id: "0knmi7z", n: 9, dif: "greu", zone: "eeeeebfff/eeeebbbff/eheaaafff/ehhhaafff/ehahaaffc/aaaaacccc/addaaggcc/dddaddggi/dddddgggi", sol: "041627583" }, // 310: 20270801
  { id: "0eewbpq", n: 7, dif: "usor", zone: "hhdddgb/hhdaagb/hhaaabb/hhhaaff/hhccaff/hcccfff/hcccfff", sol: "5263041" }, // 311: 20270802
  { id: "1gyquzv", n: 7, dif: "usor", zone: "gaaaaff/geahaaf/geahaaa/beehhaa/behhhaa/bbhhhhd/bbbhhhd", sol: "5041362" }, // 312: 20270803
  { id: "1fnpuuk", n: 8, dif: "mediu", zone: "ddddhhhh/ddahhhhh/ddaaahhe/ddggahee/gggaaaae/cgggggee/cigggeeb/ciiieeeb", sol: "51462073" }, // 313: 20270804
  { id: "1p5n6ks", n: 8, dif: "mediu", zone: "hhhhhhha/bhhhaaaa/bbbhhaaa/ebbbeaad/eeeeeadd/eeieeaaa/eeiiiggg/eeiicccg", sol: "35170264" }, // 314: 20270805
  { id: "1rl63dw", n: 8, dif: "greu", zone: "ddddhhha/gdddddaa/ggdgdaaa/ggggaaaa/ciigggaa/ciigggaa/ciiiieee/ffiiieee", sol: "64730251" }, // 315: 20270806
  { id: "1talftx", n: 8, dif: "greu", zone: "ggaaaaaa/cggddaae/ccgdaaae/ciddahae/iiddhhee/idddhhhe/iddhhhhh/dddhhhbb", sol: "52031746" }, // 316: 20270807
  { id: "0bvfcwk", n: 9, dif: "greu", zone: "bbeeeeeee/bbheeegee/bbhhaagee/bbaaagggg/bbbaaaggg/bffaddggg/ffffiiigg/ffffiiccc/fffffffff", sol: "520374681" }, // 317: 20270808
  { id: "1ysm2bc", n: 7, dif: "usor", zone: "bbeeiii/bbeggdd/bbbgggd/bbbbgdd/bbgggda/bbfggda/ffffaaa", sol: "4205361" }, // 318: 20270809
  { id: "1yl4oow", n: 7, dif: "usor", zone: "aaaaaaa/hhaaaaa/hhaeaad/hheeaad/eeeggdd/eiiigdd/iiccggd", sol: "5062413" }, // 319: 20270810
  { id: "0s0bt2i", n: 8, dif: "mediu", zone: "hbbggdda/hbbbgaaa/hbbbgaee/bbbggeee/gggggeei/ccgggiei/ccgggiii/cccciiii", sol: "57026314" }, // 320: 20270811
  { id: "06tojsk", n: 8, dif: "mediu", zone: "iiiiffaa/iiiggffa/iiigbbba/eieeaaaa/eeeeaaaa/eeehadda/eehhadda/hhhhhddd", sol: "53614027" }, // 321: 20270812
  { id: "1di7kty", n: 8, dif: "greu", zone: "fffffaaa/fifffffa/iicgfaaa/iicgaaha/iicaahha/iiieehbb/ieeeebbb/eeeeeeeb", sol: "47362051" }, // 322: 20270813
  { id: "07fw2v4", n: 8, dif: "greu", zone: "aahhhhbb/aaaaahbb/aaaabbbb/aggbbbbb/ddggggbb/ddgggfff/dggffffc/iiiicccc", sol: "41620573" }, // 323: 20270814
  { id: "1pjvx5q", n: 9, dif: "greu", zone: "eeeaaaaff/ehhbabaff/eebbbbaaa/eebbbggad/bbbggggad/ggggggddd/cggcggdid/ccccgiiid/ccccccidd", sol: "716024853" }, // 324: 20270815
  { id: "014v8tx", n: 7, dif: "usor", zone: "hhhddgc/hdddggc/hhdgggi/hhaaggi/ahaagii/ahaaeei/aaaaeee", sol: "6130524" }, // 325: 20270816
  { id: "0vfiw0f", n: 7, dif: "usor", zone: "ggggggc/gggiicc/ggeeehh/aeeeeeh/aaaebhh/aaabbah/aaaaaah", sol: "6402531" }, // 326: 20270817
  { id: "0spfecw", n: 8, dif: "mediu", zone: "fffiiiii/fffiiiii/aaadddig/aaaaadig/aaheggig/hhhegggg/hhbegggg/hbbeeggg", sol: "61537024" }, // 327: 20270818
  { id: "0v17tjo", n: 8, dif: "mediu", zone: "bbbfffff/bbbbffff/beebaaff/eeaaaaaa/egadahaa/iggdhhaa/iiddhhaa/iiiddhaa", sol: "63175204" }, // 328: 20270819
  { id: "1imnzyx", n: 8, dif: "greu", zone: "gggggddd/gggggddi/gggddddi/bggadddi/begaddii/beaaaaci/eeaaahcc/eeeeehcc", sol: "27403615" }, // 329: 20270820
  { id: "12ugirz", n: 8, dif: "greu", zone: "aaaaaaff/aaabggii/aabbggei/aabbeeee/dabbbbee/dabbbbee/dhbbbbhe/dhhhhhhe", sol: "64751302" }, // 330: 20270821
  { id: "1fjmfv3", n: 9, dif: "greu", zone: "aahheeiii/aaeeeeiii/aaeaaeeei/daaaaeeii/dadaaaaci/ddddggfci/dggdggfff/ddgggbfbb/ddgggbbbb", sol: "248170635" }, // 331: 20270822
  { id: "0f8tjjn", n: 7, dif: "usor", zone: "hheeebb/dhaaabb/ddadabb/ddddgbg/idddgbg/iiggggg/igggggg", sol: "3142506" }, // 332: 20270823
  { id: "1kgtljo", n: 7, dif: "usor", zone: "ddhhccc/daahhhc/daaahhh/gabaeee/gabaeee/gbbeeee/bbbbbee", sol: "1640352" }, // 333: 20270824
  { id: "195z7uk", n: 8, dif: "mediu", zone: "hdddddii/hhadddii/eaaggdgi/eagggggi/aaaagggc/fafaffgc/ffffffcc/ffffffcc", sol: "41705362" }, // 334: 20270825
  { id: "1cvzzxe", n: 8, dif: "mediu", zone: "hhhhddda/hhaadaaa/ehaaaaac/eeaaagcc/bbagagci/bbagggii/bbggggii/bggggiii", sol: "24036157" }, // 335: 20270826
  { id: "0xirimz", n: 8, dif: "greu", zone: "ccccccgb/cccgcggb/iccgggbb/ifccgbbb/iffcabbb/fffaaahe/aaffahhe/aaaaaahh", sol: "13052746" }, // 336: 20270827
  { id: "0fzbtue", n: 8, dif: "greu", zone: "hheeeeee/aheeeeee/aheeggbe/aaaeggbb/aagggggb/ffffcgbb/ffficggb/ffiiigbb", sol: "61527403" }, // 337: 20270828
  { id: "0lgcdwm", n: 9, dif: "greu", zone: "bbffffccc/bbbfffffi/bfffffiii/bbggfiiii/ebbgadddd/eeeeaadhd/eeeaaadhh/eeaaeaaah/eeeeeaaaa", sol: "702536481" }, // 338: 20270829
  { id: "0n898cj", n: 7, dif: "usor", zone: "baadddd/bbaaagd/bbgaagg/bbggggg/bbegggg/bbegccc/bbeiicc", sol: "1604253" }, // 339: 20270830
  { id: "1y91w0b", n: 7, dif: "usor", zone: "iiidddd/igddddd/gggdddh/bggddah/bggggah/bggaaaa/eeggaaa", sol: "2460351" }, // 340: 20270831
  { id: "1cigc38", n: 8, dif: "mediu", zone: "ddaaaaaf/daaaaaaf/gggaeeaa/gbbbeaaa/gggeeeee/gggiieii/gcgiiiii/ccgiiiii", sol: "70635241" }, // 341: 20270901
  { id: "00w7kze", n: 8, dif: "mediu", zone: "dddggggc/daddgggc/aaagggii/afagegii/ffggeiii/fbbgeeee/bbbeeeee/bbbeeeee", sol: "73526041" }, // 342: 20270902
  { id: "199h2km", n: 8, dif: "greu", zone: "ggggggch/iggggcch/igggggcc/igbbgffc/eggbbbff/eeeeabbf/eeaeaaaf/eeaaafff", sol: "75203146" }, // 343: 20270903
  { id: "0mnuzhf", n: 8, dif: "greu", zone: "bggddddd/bbgddadd/gggdaaad/gggggeaa/ggggeeaa/geeeehha/ieiiichh/iiiiccch", sol: "03174625" }, // 344: 20270904
  { id: "02mp5al", n: 9, dif: "greu", zone: "fffaaahhh/ffbbbaadd/fbbbggddd/bbbggdddd/ebbggdggd/eeeggggdd/ggggcgidi/ggcgcgidi/gcccciiii", sol: "750281364" }, // 345: 20270905
  { id: "1r2v39x", n: 7, dif: "usor", zone: "dddiiee/ddgieee/dggggee/ddgggge/hdggeee/hddggeb/aaaggbb", sol: "4153062" }, // 346: 20270906
  { id: "0x48pbf", n: 7, dif: "usor", zone: "aaaaggg/daaaeeg/daheeeb/dahheeb/dahhieb/ddddiee/dddddde", sol: "5136240" }, // 347: 20270907
  { id: "07q5psv", n: 8, dif: "mediu", zone: "iiieeebb/iigeeeeb/gggaeeeh/gaaahhhh/gddacchh/ddaaaccc/daaaaacc/aaaacccc", sol: "27406135" }, // 348: 20270908
  { id: "1pxurod", n: 8, dif: "mediu", zone: "ffffffff/aafffacc/aafaaacc/aaaaagcc/aeeeeggc/hheiiigc/beeeeiic/bbeeeeii", sol: "47352061" }, // 349: 20270909
  { id: "1q1jwo6", n: 8, dif: "greu", zone: "hhaggggg/hhaagddd/haaaggid/hhacccii/eaaaaccc/eaafffcf/eeaaafff/eeeaffff", sol: "35072614" }, // 350: 20270910
  { id: "0jl222p", n: 8, dif: "greu", zone: "ciiiieee/cccgeeeh/cgggbbeh/ggggbbbh/ggaaaahh/gaaahhhh/ggaahhhh/dddaaahh", sol: "46051372" }, // 351: 20270911
  { id: "17z31it", n: 9, dif: "greu", zone: "hhhhheeee/hdhhaaaae/hddaaaeee/ddgaaaaee/ddgaaaaeb/igggggbbb/iiifffbbb/iciffbbbb/ccffffbbb", sol: "731685240" }, // 352: 20270912
  { id: "13atzj3", n: 7, dif: "usor", zone: "didddhh/didhhhb/diddhbb/ddddhhe/dgdhhhe/ggaahae/gaaaaae", sol: "1352604" }, // 353: 20270913
  { id: "0y0n28y", n: 7, dif: "usor", zone: "iiieeeb/iiiggeb/iiiggbb/iiggggb/iggaabb/dgdaaaa/ddddhha", sol: "3162405" }, // 354: 20270914
  { id: "12uyj49", n: 8, dif: "mediu", zone: "eeeicccc/eeiigggg/eegggggg/ebggagaa/bbaaaaaa/bbhhdddd/hhhddddd/hhdddddd", sol: "63157024" }, // 355: 20270915
  { id: "11sozp6", n: 8, dif: "mediu", zone: "dddgiiif/dddgiiif/haagggii/haagbgei/haagbbee/aaabbeee/aabbeeee/aaaeeeee", sol: "72630415" }, // 356: 20270916
  { id: "0rl9l3t", n: 8, dif: "greu", zone: "cchhdddd/chhdddgg/chhdgggg/chaggggg/chaaaggg/hhaabbgg/hhaaeeei/hhhaaeii", sol: "03162475" }, // 357: 20270917
  { id: "15todin", n: 8, dif: "greu", zone: "dddaaagg/ddaabbbb/aaahbebb/ahahbebe/chhheeee/chheeeee/ccheieie/ccciiiii", sol: "70263514" }, // 358: 20270918
  { id: "0ig8jww", n: 9, dif: "greu", zone: "gbbbbbbbf/gbggbbbbf/gggggbbff/iggggggff/iiidaaaff/iiidhhaff/eihhhaaff/eeeehcaff/eeehhccff", sol: "728036415" }, // 359: 20270919
  { id: "0hlxbvm", n: 7, dif: "usor", zone: "aaaaaah/ddgggah/dggggee/iggggee/iccggee/iiciiie/iiiiiii", sol: "1603524" }, // 360: 20270920
  { id: "02m4ghn", n: 7, dif: "usor", zone: "affaaad/aaaaead/aahaead/aahheei/bhheeei/bbeeeii/bbbeeei", sol: "1364250" }, // 361: 20270921
  { id: "18innc2", n: 8, dif: "mediu", zone: "dddddggg/ddaddggg/aaaggggc/hbbbgggc/hbeeiigc/heeeiccc/eeiiiccc/eeiiiccc", sol: "42635071" }, // 362: 20270922
  { id: "0a82s38", n: 8, dif: "mediu", zone: "gggccccc/ggaaachh/ggaahhhh/iddahhhh/idaaebbb/ddaeebbb/aaaeeeeb/aaaeeebb", sol: "25703146" }, // 363: 20270923
];
// ==== BANC:SFÂRȘIT ====

// ─── Ziua ───────────────────────────────────────────────────────────────────────────────

/** YYYYMMDD → milisecunde UTC (miezul nopții), ca să numărăm zile reale din calendar. */
function msUTC(zi) {
  return Date.UTC(Math.floor(zi / 10000), Math.floor((zi % 10000) / 100) - 1, zi % 100);
}

/** Zile întregi de la START până la `zi` (YYYYMMDD). Zilele de dinainte (și seed-urile invalide) → 0. */
export function zileDeLaStart(zi) {
  const d = Math.round((msUTC(zi) - msUTC(START)) / 86400000);
  return d > 0 ? d : 0;
}

/** Ziua săptămânii pentru YYYYMMDD: 0 = duminică … 6 = sâmbătă. */
export function ziuaSaptamanii(zi) {
  return new Date(msUTC(zi)).getUTCDay();
}

/**
 * Puzzle-ul zilei `zi` (YYYYMMDD): BANC[index % 364], cu index = zile de la START.
 * → { puzzle, index, editie } ; ediția afișată = index + 1 (continuă să crească după ce bancul se reia).
 */
export function puzzleZilei(zi) {
  const index = zileDeLaStart(zi);
  return { puzzle: BANC[index % BANC.length], index, editie: index + 1 };
}

// ─── Puzzle ─────────────────────────────────────────────────────────────────────────────

/** Zona fiecărei căsuțe, ca index de literă (a = 0 … i = 8), rând după rând. */
export function zoneDin(p) {
  const litere = p.zone.replaceAll("/", "");
  const z = new Int8Array(p.n * p.n);
  for (let x = 0; x < z.length; x++) z[x] = LITERE.indexOf(litere[x]);
  return z;
}

/** Căsuțele soluției: 1 unde stă o coroană. */
export function solutieDin(p) {
  const s = new Uint8Array(p.n * p.n);
  for (let r = 0; r < p.n; r++) s[r * p.n + Number(p.sol[r])] = 1;
  return s;
}

const seAting = (n, a, b) => Math.abs(((a / n) | 0) - ((b / n) | 0)) <= 1 && Math.abs((a % n) - (b % n)) <= 1;

// ─── Reguli ─────────────────────────────────────────────────────────────────────────────

/**
 * Perechile de coroane care încalcă regulile: [{ a, b, motiv }], motiv = "rand" | "coloana" |
 * "zona" | "atingere" (primul motiv găsit, în ordinea asta). zone = zoneDin(p).
 */
export function conflicte(n, zone, tabla) {
  const coroane = [];
  for (let x = 0; x < n * n; x++) if (tabla[x] === COROANA) coroane.push(x);
  const out = [];
  for (let i = 0; i < coroane.length; i++) {
    for (let j = i + 1; j < coroane.length; j++) {
      const a = coroane[i], b = coroane[j];
      const motiv = ((a / n) | 0) === ((b / n) | 0) ? "rand"
        : a % n === b % n ? "coloana"
        : zone[a] === zone[b] ? "zona"
        : seAting(n, a, b) ? "atingere"
        : null;
      if (motiv) out.push({ a, b, motiv });
    }
  }
  return out;
}

/** 1 pentru fiecare coroană implicată într-un conflict. */
export function coroaneInConflict(n, zone, tabla) {
  const f = new Uint8Array(n * n);
  for (const { a, b } of conflicte(n, zone, tabla)) f[a] = f[b] = 1;
  return f;
}

/**
 * Auto-✕: 1 pentru căsuțele excluse de coroanele puse (rândul, coloana, zona fiecărei coroane și
 * cele 8 căsuțe vecine), fără căsuțele cu coroană. Doar pentru afișare — nu intră în tablă.
 */
export function excluse(n, zone, tabla) {
  const e = new Uint8Array(n * n);
  for (let x = 0; x < n * n; x++) {
    if (tabla[x] !== COROANA) continue;
    for (let y = 0; y < n * n; y++) {
      if (((y / n) | 0) === ((x / n) | 0) || y % n === x % n || zone[y] === zone[x] || seAting(n, x, y)) e[y] = 1;
    }
  }
  for (let x = 0; x < n * n; x++) if (tabla[x] === COROANA) e[x] = 0;
  return e;
}

/** Câștig: exact n coroane și niciun conflict (deci câte una pe rând, coloană și zonă, fără atingeri). */
export function eRezolvat(n, zone, tabla) {
  let k = 0;
  for (let x = 0; x < n * n; x++) if (tabla[x] === COROANA) k++;
  return k === n && conflicte(n, zone, tabla).length === 0;
}

/**
 * Un pas corect, luat din soluția stocată:
 *  1. o coroană pusă greșit → devine ✕;
 *  2. un ✕ pus pe locul unei coroane → devine coroană;
 *  3. altfel, o coroană lipsă — cea din rândul/coloana/zona cu cele mai puține locuri libere
 *     (adică pasul pe care l-ar găsi cel mai repede un om).
 * → { celula, valoare, motiv: "coroana-gresita" | "x-gresit" | "coroana-lipsa" } sau null (tabla e completă).
 */
export function indiciu(p, tabla) {
  const n = p.n, zone = zoneDin(p), sol = solutieDin(p);
  for (let x = 0; x < n * n; x++) if (tabla[x] === COROANA && !sol[x]) return { celula: x, valoare: X, motiv: "coroana-gresita" };
  for (let x = 0; x < n * n; x++) if (tabla[x] === X && sol[x]) return { celula: x, valoare: COROANA, motiv: "x-gresit" };
  const ex = excluse(n, zone, tabla);
  const liber = (y) => tabla[y] === GOL && !ex[y];
  let best = null, bestLibere = Infinity;
  for (let x = 0; x < n * n; x++) {
    if (!sol[x] || tabla[x] !== GOL) continue;
    let rand = 0, col = 0, zona = 0;
    for (let y = 0; y < n * n; y++) {
      if (!liber(y)) continue;
      if (((y / n) | 0) === ((x / n) | 0)) rand++;
      if (y % n === x % n) col++;
      if (zone[y] === zone[x]) zona++;
    }
    const libere = Math.min(rand, col, zona);
    if (libere < bestLibere) { bestLibere = libere; best = x; }
  }
  return best === null ? null : { celula: best, valoare: COROANA, motiv: "coroana-lipsa" };
}

// ─── Timp, share, stare salvată ─────────────────────────────────────────────────────────

/** Secunde → „m:ss" (ex. 154 → „2:34"). */
export function formatTimp(secunde) {
  const s = Math.max(0, Math.floor(Number(secunde) || 0));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

/** Textul de share: „Coroane #12 · 2:34" + „ · fără indicii" dacă n-a cerut niciun indiciu. */
export function textShare(editie, secunde, indicii) {
  return NUME + " #" + editie + " · " + formatTimp(secunde) + (indicii ? "" : " · fără indicii");
}

/** Grila de share: un singur rând scurt (emoji doar aici, nu în interfață). */
export function grilaShare(n) {
  return "👑 " + n + "×" + n;
}

/**
 * Starea salvată (JSON) → { tabla: Uint8Array, timp, indicii, gata } sau null dacă e invalidă.
 * `gata` se recalculează din tablă — nu ne bazăm pe ce scrie în stocare.
 */
export function stareDin(text, p) {
  try {
    const s = JSON.parse(text);
    if (!s || typeof s.tabla !== "string" || s.tabla.length !== p.n * p.n || !/^[012]+$/.test(s.tabla)) return null;
    const tabla = Uint8Array.from(s.tabla, Number);
    const timp = Number.isFinite(s.timp) && s.timp >= 0 ? s.timp : 0;
    const indicii = Number.isInteger(s.indicii) && s.indicii >= 0 ? s.indicii : 0;
    return { tabla, timp, indicii, gata: eRezolvat(p.n, zoneDin(p), tabla) };
  } catch {
    return null;
  }
}

/** Starea de salvat, ca text JSON. */
export function stareText(tabla, timp, indicii, gata) {
  return JSON.stringify({ tabla: Array.from(tabla).join(""), timp: Math.round(timp * 10) / 10, indicii, gata });
}
