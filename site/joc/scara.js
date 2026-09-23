// Scara — datele și logica pură a jocului (fără DOM), testabile în Node (v1, 24.09.2026).
// Pagina: site-live/joc/scara.html · Testul: games/teste/scara.test.mjs
//
// ─── CE ESTE O SCARĂ ─────────────────────────────────────────────────────────────────
// 6 cuvinte de aceeași lungime (4 sau 5 litere), în ordinea scării: [SUS, M1, M2, M3, M4, JOS].
// Două cuvinte vecine diferă printr-o singură literă, pe aceeași poziție; oricare două
// cuvinte care NU sunt vecine diferă prin cel puțin două litere — așa ordinea e unică
// (până la inversare). Regulile țin și după plierea diacriticelor (Ș→S, Ț→T, Ă/Â→A, Î→I),
// iar două cuvinte ale aceleiași scări nu se pot plia la fel (jucătorul poate scrie fără
// diacritice). Le verifică testul, pentru fiecare scară din bancă.
//
// ─── FORMATUL UNEI SCĂRI ─────────────────────────────────────────────────────────────
//   id       — unic, stabil (e în cheia de salvare a zilei): capetele pliate, „sus-jos”
//   lungime  — 4 sau 5
//   cuvinte  — cele 6 cuvinte, MAJUSCULE, cu diacritice corecte (ș/ț cu virgulă), în ordine
//   indicii  — câte un indiciu pe cuvânt, în aceeași ordine (≤ 70 de caractere, fără cuvânt
//              sau rădăcina lui)
//   amestec  — ordinea în care apar cele 4 cuvinte din mijloc (indici 1..4 în `cuvinte`);
//              niciodată [1,2,3,4] sau [4,3,2,1]
//   surse    — pagina dexonline pe care a fost verificat fiecare cuvânt (nu apare în joc)
//
// Cuvintele: substantive și adjective uzuale, la forma de dicționar (substantive la
// nominativ singular nearticulat, adjective la masculin singular), fiecare confirmat pe
// dexonline.ro (pagina arată cel puțin o definiție cu exact acest cuvânt-titlu).

/** Prima zi de joc (YYYYMMDD, ora României). Ziua de dinainte primește tot ediția 1. */
export const START = 20260925;

/** Literele alfabetului românesc, majuscule (cu virgulă sub Ș și Ț). */
export const LITERE = "AĂÂBCDEFGHIÎJKLMNOPQRSȘTȚUVWXYZ";

export const BANC = [
  {
    id: "mapa-sina", lungime: 4,
    cuvinte: ["MAPĂ", "MASĂ", "CASĂ", "CANĂ", "CINĂ", "ȘINĂ"],
    indicii: [
      "Dosar sau servietă în care porți acte",
      "Mobilă cu picioare la care se mănâncă",
      "Locuință, cămin",
      "Recipient cu toartă pentru ceai sau lapte",
      "Ultima mâncare a zilei, seara",
      "Bara de oțel pe care rulează trenul",
    ],
    amestec: [2, 4, 1, 3],
    surse: {
      "MAPĂ": "https://dexonline.ro/definitie/mapă",
      "MASĂ": "https://dexonline.ro/definitie/masă",
      "CASĂ": "https://dexonline.ro/definitie/casă",
      "CANĂ": "https://dexonline.ro/definitie/cană",
      "CINĂ": "https://dexonline.ro/definitie/cină",
      "ȘINĂ": "https://dexonline.ro/definitie/șină",
    },
  },
  {
    id: "ceara-scuza", lungime: 5,
    cuvinte: ["CEARĂ", "SEARĂ", "SCARĂ", "SCALĂ", "SCULĂ", "SCUZĂ"],
    indicii: [
      "Din ea se fac lumânări; o produc albinele",
      "Partea zilei dintre apus și noapte",
      "Te ajută să urci treaptă cu treaptă",
      "Șir gradat de valori, ca la termometru",
      "Unealtă de meserie",
      "Motivul pe care îl dai când întârzii",
    ],
    amestec: [3, 2, 4, 1],
    surse: {
      "CEARĂ": "https://dexonline.ro/definitie/ceară",
      "SEARĂ": "https://dexonline.ro/definitie/seară",
      "SCARĂ": "https://dexonline.ro/definitie/scară",
      "SCALĂ": "https://dexonline.ro/definitie/scală",
      "SCULĂ": "https://dexonline.ro/definitie/sculă",
      "SCUZĂ": "https://dexonline.ro/definitie/scuză",
    },
  },
  {
    id: "cada-data", lungime: 4,
    cuvinte: ["CADĂ", "LADĂ", "LAVĂ", "TAVĂ", "TATĂ", "DATĂ"],
    indicii: [
      "Vas mare din baie, în care te speli",
      "Cutie mare de lemn, pentru zestre sau fructe",
      "Rocă topită care curge din vulcan",
      "Platou pe care aduci pahare sau coci prăjituri",
      "Părintele de sex masculin",
      "Ziua, luna și anul din calendar",
    ],
    amestec: [1, 3, 2, 4],
    surse: {
      "CADĂ": "https://dexonline.ro/definitie/cadă",
      "LADĂ": "https://dexonline.ro/definitie/ladă",
      "LAVĂ": "https://dexonline.ro/definitie/lavă",
      "TAVĂ": "https://dexonline.ro/definitie/tavă",
      "TATĂ": "https://dexonline.ro/definitie/tată",
      "DATĂ": "https://dexonline.ro/definitie/dată",
    },
  },
  {
    id: "musca-varza", lungime: 5,
    cuvinte: ["MUSCĂ", "MASCĂ", "MARCĂ", "BARCĂ", "BARZĂ", "VARZĂ"],
    indicii: [
      "Insectă care bâzâie pe lângă ureche",
      "Îți acoperă fața la carnaval",
      "Numele unui produs sau al unei firme; și timbru",
      "Vas mic cu vâsle, pentru lac sau râu",
      "Pasăre cu picioare lungi, cu cuibul pe stâlpi",
      "Legumă din ale cărei frunze se fac sarmale",
    ],
    amestec: [2, 3, 1, 4],
    surse: {
      "MUSCĂ": "https://dexonline.ro/definitie/muscă",
      "MASCĂ": "https://dexonline.ro/definitie/mască",
      "MARCĂ": "https://dexonline.ro/definitie/marcă",
      "BARCĂ": "https://dexonline.ro/definitie/barcă",
      "BARZĂ": "https://dexonline.ro/definitie/barză",
      "VARZĂ": "https://dexonline.ro/definitie/varză",
    },
  },
  {
    id: "circ-mers", lungime: 4,
    cuvinte: ["CIRC", "CERC", "CERB", "VERB", "VERS", "MERS"],
    indicii: [
      "Spectacol cu clovni și acrobați, sub cupolă",
      "Figură geometrică perfect rotundă",
      "Animal al pădurii cu coarne ramificate",
      "Partea de vorbire care exprimă o acțiune",
      "Un rând dintr-o poezie",
      "Felul în care pășește cineva; și orarul trenurilor",
    ],
    amestec: [3, 1, 2, 4],
    surse: {
      "CIRC": "https://dexonline.ro/definitie/circ",
      "CERC": "https://dexonline.ro/definitie/cerc",
      "CERB": "https://dexonline.ro/definitie/cerb",
      "VERB": "https://dexonline.ro/definitie/verb",
      "VERS": "https://dexonline.ro/definitie/vers",
      "MERS": "https://dexonline.ro/definitie/mers",
    },
  },
  {
    id: "coaja-roata", lungime: 5,
    cuvinte: ["COAJĂ", "COALĂ", "BOALĂ", "BOABĂ", "ROABĂ", "ROATĂ"],
    indicii: [
      "Învelișul tare al unui fruct sau al pâinii",
      "Foaie mare de hârtie",
      "Suferință tratată de medic",
      "Fruct mic și rotund, ca la strugure sau fasole",
      "Cărucior cu mânere, pentru nisip și pământ",
      "Are spițe la bicicletă și cauciuc la mașină",
    ],
    amestec: [4, 2, 1, 3],
    surse: {
      "COAJĂ": "https://dexonline.ro/definitie/coajă",
      "COALĂ": "https://dexonline.ro/definitie/coală",
      "BOALĂ": "https://dexonline.ro/definitie/boală",
      "BOABĂ": "https://dexonline.ro/definitie/boabă",
      "ROABĂ": "https://dexonline.ro/definitie/roabă",
      "ROATĂ": "https://dexonline.ro/definitie/roată",
    },
  },
  {
    id: "hora-tura", lungime: 4,
    cuvinte: ["HORĂ", "SORĂ", "SOBĂ", "TOBĂ", "TUBĂ", "TURĂ"],
    indicii: [
      "Dans popular în cerc, cu mâinile prinse",
      "Fiica acelorași părinți ca tine",
      "Aparat de încălzit cu lemne, adesea din teracotă",
      "Instrument de percuție la care cânți cu bețe",
      "Instrument mare de alamă, cu sunet grav",
      "Piesă de șah care merge doar pe orizontală sau verticală",
    ],
    amestec: [1, 4, 2, 3],
    surse: {
      "HORĂ": "https://dexonline.ro/definitie/horă",
      "SORĂ": "https://dexonline.ro/definitie/soră",
      "SOBĂ": "https://dexonline.ro/definitie/sobă",
      "TOBĂ": "https://dexonline.ro/definitie/tobă",
      "TUBĂ": "https://dexonline.ro/definitie/tubă",
      "TURĂ": "https://dexonline.ro/definitie/tură",
    },
  },
  {
    id: "lipie-punte", lungime: 5,
    cuvinte: ["LIPIE", "LINIE", "LINTE", "MINTE", "MUNTE", "PUNTE"],
    indicii: [
      "Turtă subțire de pâine, bună de rulat",
      "Se trage cu rigla",
      "Leguminoasă cu boabe mici și plate",
      "Inteligență, judecată",
      "Ceahlăul sau Retezatul, de pildă",
      "Podeaua unei nave; și un pod îngust",
    ],
    amestec: [3, 1, 4, 2],
    surse: {
      "LIPIE": "https://dexonline.ro/definitie/lipie",
      "LINIE": "https://dexonline.ro/definitie/linie",
      "LINTE": "https://dexonline.ro/definitie/linte",
      "MINTE": "https://dexonline.ro/definitie/minte",
      "MUNTE": "https://dexonline.ro/definitie/munte",
      "PUNTE": "https://dexonline.ro/definitie/punte",
    },
  },
  {
    id: "brat-neam", lungime: 4,
    cuvinte: ["BRAȚ", "BRAD", "GRAD", "GRAM", "GEAM", "NEAM"],
    indicii: [
      "Membrul de la umăr până la palmă",
      "Conifer împodobit cu globuri de Crăciun",
      "Unitate pentru temperatură sau pentru unghiuri",
      "Unitate de masă notată cu litera g",
      "Placă de sticlă dintr-o fereastră",
      "Familie în sens larg, rudenie; și popor",
    ],
    amestec: [4, 1, 3, 2],
    surse: {
      "BRAȚ": "https://dexonline.ro/definitie/braț",
      "BRAD": "https://dexonline.ro/definitie/brad",
      "GRAD": "https://dexonline.ro/definitie/grad",
      "GRAM": "https://dexonline.ro/definitie/gram",
      "GEAM": "https://dexonline.ro/definitie/geam",
      "NEAM": "https://dexonline.ro/definitie/neam",
    },
  },
  {
    id: "bilet-buton", lungime: 5,
    cuvinte: ["BILET", "BALET", "BALOT", "BALON", "BATON", "BUTON"],
    indicii: [
      "Îl cumperi pentru tren sau pentru concert",
      "Dans clasic pe vârfuri, ca «Lacul lebedelor»",
      "Pachet mare și legat, de paie sau de fân",
      "Se umflă cu heliu la petreceri",
      "Bucată lunguiață de ciocolată sau de salam",
      "Îl apeși la lift sau la sonerie",
    ],
    amestec: [4, 2, 3, 1],
    surse: {
      "BILET": "https://dexonline.ro/definitie/bilet",
      "BALET": "https://dexonline.ro/definitie/balet",
      "BALOT": "https://dexonline.ro/definitie/balot",
      "BALON": "https://dexonline.ro/definitie/balon",
      "BATON": "https://dexonline.ro/definitie/baton",
      "BUTON": "https://dexonline.ro/definitie/buton",
    },
  },
  {
    id: "fata-oaza", lungime: 4,
    cuvinte: ["FATĂ", "PATĂ", "PARĂ", "VARĂ", "VAZĂ", "OAZĂ"],
    indicii: [
      "Tânără, domnișoară",
      "Urmă murdară pe haine",
      "Fruct în formă de clopot, rudă cu mărul",
      "Anotimpul vacanței mari",
      "Vas în care pui florile",
      "Loc cu apă și palmieri în mijlocul deșertului",
    ],
    amestec: [1, 3, 4, 2],
    surse: {
      "FATĂ": "https://dexonline.ro/definitie/fată",
      "PATĂ": "https://dexonline.ro/definitie/pată",
      "PARĂ": "https://dexonline.ro/definitie/pară",
      "VARĂ": "https://dexonline.ro/definitie/vară",
      "VAZĂ": "https://dexonline.ro/definitie/vază",
      "OAZĂ": "https://dexonline.ro/definitie/oază",
    },
  },
  {
    id: "harpa-pista", lungime: 5,
    cuvinte: ["HARPĂ", "HARTĂ", "TARTĂ", "TASTĂ", "PASTĂ", "PISTĂ"],
    indicii: [
      "Instrument triunghiular cu multe corzi ciupite",
      "Desenul unui teritoriu, cu drumuri, râuri și orașe",
      "Prăjitură cu fructe pe un aluat fraged",
      "Buton apăsat când scrii la calculator",
      "Cea de dinți se pune pe periuță",
      "Drum pentru decolarea avioanelor sau pentru alergări",
    ],
    amestec: [2, 4, 3, 1],
    surse: {
      "HARPĂ": "https://dexonline.ro/definitie/harpă",
      "HARTĂ": "https://dexonline.ro/definitie/hartă",
      "TARTĂ": "https://dexonline.ro/definitie/tartă",
      "TASTĂ": "https://dexonline.ro/definitie/tastă",
      "PASTĂ": "https://dexonline.ro/definitie/pastă",
      "PISTĂ": "https://dexonline.ro/definitie/pistă",
    },
  },
  {
    id: "stup-umil", lungime: 4,
    cuvinte: ["STUP", "STOP", "STOL", "STIL", "UTIL", "UMIL"],
    indicii: [
      "Casa albinelor",
      "Semn de circulație octogonal, roșu",
      "Grup de păsări care zboară împreună",
      "Fel propriu de a scrie sau de a se îmbrăca",
      "Folositor, practic",
      "Modest, supus, fără trufie",
    ],
    amestec: [2, 4, 1, 3],
    surse: {
      "STUP": "https://dexonline.ro/definitie/stup",
      "STOP": "https://dexonline.ro/definitie/stop",
      "STOL": "https://dexonline.ro/definitie/stol",
      "STIL": "https://dexonline.ro/definitie/stil",
      "UTIL": "https://dexonline.ro/definitie/util",
      "UMIL": "https://dexonline.ro/definitie/umil",
    },
  },
  {
    id: "curba-turma", lungime: 5,
    cuvinte: ["CURBĂ", "CURSĂ", "BURSĂ", "BURTĂ", "TURTĂ", "TURMĂ"],
    indicii: [
      "Cotitură a drumului",
      "Întrecere de viteză; și capcană",
      "Bani primiți lunar de elevul sau studentul silitor",
      "Abdomen, pântece",
      "Plăcintă plată, coaptă pe vatră",
      "Grup de oi păzit de cioban",
    ],
    amestec: [3, 2, 4, 1],
    surse: {
      "CURBĂ": "https://dexonline.ro/definitie/curbă",
      "CURSĂ": "https://dexonline.ro/definitie/cursă",
      "BURSĂ": "https://dexonline.ro/definitie/bursă",
      "BURTĂ": "https://dexonline.ro/definitie/burtă",
      "TURTĂ": "https://dexonline.ro/definitie/turtă",
      "TURMĂ": "https://dexonline.ro/definitie/turmă",
    },
  },
  {
    id: "lana-mura", lungime: 4,
    cuvinte: ["LÂNĂ", "LUNĂ", "LUPĂ", "CUPĂ", "CURĂ", "MURĂ"],
    indicii: [
      "Firul tuns de pe oaie",
      "Satelitul natural al Pământului",
      "Lentilă care mărește, preferata detectivilor",
      "Trofeu sau pahar cu picior",
      "Tratament ținut o vreme, de pildă cu ceaiuri",
      "Fruct negru și zemos de pe un tufiș spinos",
    ],
    amestec: [1, 3, 2, 4],
    surse: {
      "LÂNĂ": "https://dexonline.ro/definitie/lână",
      "LUNĂ": "https://dexonline.ro/definitie/lună",
      "LUPĂ": "https://dexonline.ro/definitie/lupă",
      "CUPĂ": "https://dexonline.ro/definitie/cupă",
      "CURĂ": "https://dexonline.ro/definitie/cură",
      "MURĂ": "https://dexonline.ro/definitie/mură",
    },
  },
  {
    id: "aport-soare", lungime: 5,
    cuvinte: ["APORT", "SPORT", "SPART", "START", "STARE", "SOARE"],
    indicii: [
      "Contribuție adusă la o reușită comună",
      "Activitate fizică de întrecere, ca fotbalul",
      "Cum e un pahar scăpat pe gresie",
      "Semnalul de plecare într-o întrecere",
      "Situație, dispoziție: de bine sau de rău",
      "Steaua în jurul căreia se rotește Pământul",
    ],
    amestec: [2, 3, 1, 4],
    surse: {
      "APORT": "https://dexonline.ro/definitie/aport",
      "SPORT": "https://dexonline.ro/definitie/sport",
      "SPART": "https://dexonline.ro/definitie/spart",
      "START": "https://dexonline.ro/definitie/start",
      "STARE": "https://dexonline.ro/definitie/stare",
      "SOARE": "https://dexonline.ro/definitie/soare",
    },
  },
  {
    id: "card-fals", lungime: 4,
    cuvinte: ["CARD", "CALD", "CALE", "VALE", "VALS", "FALS"],
    indicii: [
      "Bucată de plastic pentru plăți fără numerar",
      "Cum e ceaiul proaspăt turnat sau o zi de iulie",
      "Drum, direcție; cea ferată e pentru trenuri",
      "Depresiune între dealuri sau munți",
      "Dans în trei timpi, celebru la Viena",
      "Care nu e adevărat; și o imitație",
    ],
    amestec: [3, 1, 2, 4],
    surse: {
      "CARD": "https://dexonline.ro/definitie/card",
      "CALD": "https://dexonline.ro/definitie/cald",
      "CALE": "https://dexonline.ro/definitie/cale",
      "VALE": "https://dexonline.ro/definitie/vale",
      "VALS": "https://dexonline.ro/definitie/vals",
      "FALS": "https://dexonline.ro/definitie/fals",
    },
  },
  {
    id: "coama-pluta", lungime: 5,
    cuvinte: ["COAMĂ", "COASĂ", "CLASĂ", "PLASĂ", "PLATĂ", "PLUTĂ"],
    indicii: [
      "Părul lung de pe gâtul calului sau al leului",
      "Unealtă cu lamă lungă pentru tăiat iarba",
      "Sala în care învață elevii",
      "Împletitură cu ochiuri, de pescuit sau de tenis",
      "Suma dată în schimbul unui lucru sau al unei munci",
      "Ambarcațiune din bușteni legați; și dopul de sticlă",
    ],
    amestec: [4, 2, 1, 3],
    surse: {
      "COAMĂ": "https://dexonline.ro/definitie/coamă",
      "COASĂ": "https://dexonline.ro/definitie/coasă",
      "CLASĂ": "https://dexonline.ro/definitie/clasă",
      "PLASĂ": "https://dexonline.ro/definitie/plasă",
      "PLATĂ": "https://dexonline.ro/definitie/plată",
      "PLUTĂ": "https://dexonline.ro/definitie/plută",
    },
  },
  {
    id: "mama-poza", lungime: 4,
    cuvinte: ["MAMĂ", "RAMĂ", "RANĂ", "PANĂ", "PAZĂ", "POZĂ"],
    indicii: [
      "Cea care te-a adus pe lume",
      "Cadrul unui tablou",
      "Tăietură sau zgârietură care sângerează",
      "Fulg din aripa unei păsări; și defectul unei mașini",
      "Supravegherea unui loc de către un gardian",
      "Fotografie",
    ],
    amestec: [1, 4, 2, 3],
    surse: {
      "MAMĂ": "https://dexonline.ro/definitie/mamă",
      "RAMĂ": "https://dexonline.ro/definitie/ramă",
      "RANĂ": "https://dexonline.ro/definitie/rană",
      "PANĂ": "https://dexonline.ro/definitie/pană",
      "PAZĂ": "https://dexonline.ro/definitie/pază",
      "POZĂ": "https://dexonline.ro/definitie/poză",
    },
  },
  {
    id: "molid-zodie", lungime: 5,
    cuvinte: ["MOLID", "MOLIE", "MOȘIE", "ROȘIE", "RODIE", "ZODIE"],
    indicii: [
      "Conifer înalt, din lemnul căruia se fac viori",
      "Fluture mic care roade hainele de lână",
      "Proprietate mare de pământ a unui boier",
      "Fruct-legumă zemos, baza sosului de pizza",
      "Fruct cu sute de semințe roșii, suculente",
      "Berbec, Leu sau Scorpion, în horoscop",
    ],
    amestec: [3, 1, 4, 2],
    surse: {
      "MOLID": "https://dexonline.ro/definitie/molid",
      "MOLIE": "https://dexonline.ro/definitie/molie",
      "MOȘIE": "https://dexonline.ro/definitie/moșie",
      "ROȘIE": "https://dexonline.ro/definitie/roșie",
      "RODIE": "https://dexonline.ro/definitie/rodie",
      "ZODIE": "https://dexonline.ro/definitie/zodie",
    },
  },
  {
    id: "cent-rece", lungime: 4,
    cuvinte: ["CENT", "LENT", "LENE", "LEGE", "REGE", "RECE"],
    indicii: [
      "A suta parte dintr-un euro sau dintr-un dolar",
      "Care se mișcă încet, fără grabă",
      "Unul dintre cele șapte păcate capitale",
      "Normă votată de Parlament",
      "Monarh; la șah, piesa care trebuie apărată",
      "Cum e zăpada sau apa de izvor",
    ],
    amestec: [4, 1, 3, 2],
    surse: {
      "CENT": "https://dexonline.ro/definitie/cent",
      "LENT": "https://dexonline.ro/definitie/lent",
      "LENE": "https://dexonline.ro/definitie/lene",
      "LEGE": "https://dexonline.ro/definitie/lege",
      "REGE": "https://dexonline.ro/definitie/rege",
      "RECE": "https://dexonline.ro/definitie/rece",
    },
  },
  {
    id: "basca-gazda", lungime: 5,
    cuvinte: ["BASCĂ", "BANCĂ", "BANDĂ", "BARDĂ", "GARDĂ", "GAZDĂ"],
    indicii: [
      "Beretă plată, purtată de pictori",
      "Instituție care dă credite; și scaun lung în parc",
      "Fâșie lungă: adezivă, de alergare sau de hoți",
      "Topor cu tăiș lat, pentru cioplit lemnul",
      "Soldații care păzesc palatul",
      "Cel care primește musafiri",
    ],
    amestec: [4, 2, 3, 1],
    surse: {
      "BASCĂ": "https://dexonline.ro/definitie/bască",
      "BANCĂ": "https://dexonline.ro/definitie/bancă",
      "BANDĂ": "https://dexonline.ro/definitie/bandă",
      "BARDĂ": "https://dexonline.ro/definitie/bardă",
      "GARDĂ": "https://dexonline.ro/definitie/gardă",
      "GAZDĂ": "https://dexonline.ro/definitie/gazdă",
    },
  },
  {
    id: "grup-tren", lungime: 4,
    cuvinte: ["GRUP", "TRUP", "TRUC", "TROC", "TRON", "TREN"],
    indicii: [
      "Mai multe persoane adunate laolaltă",
      "Corpul omului",
      "Șmecherie, figură de iluzionist",
      "Schimb de mărfuri fără bani",
      "Scaunul regelui",
      "Circulă pe șine, cu locomotivă și vagoane",
    ],
    amestec: [1, 3, 4, 2],
    surse: {
      "GRUP": "https://dexonline.ro/definitie/grup",
      "TRUP": "https://dexonline.ro/definitie/trup",
      "TRUC": "https://dexonline.ro/definitie/truc",
      "TROC": "https://dexonline.ro/definitie/troc",
      "TRON": "https://dexonline.ro/definitie/tron",
      "TREN": "https://dexonline.ro/definitie/tren",
    },
  },
  {
    id: "coral-dosar", lungime: 5,
    cuvinte: ["CORAL", "MORAL", "MORAR", "MOLAR", "DOLAR", "DOSAR"],
    indicii: [
      "Formează recifuri colorate în mările calde",
      "Care respectă binele și cinstea",
      "Meseriașul care macină grâne în făină",
      "Dinte mare din spate, pentru mestecat",
      "Moneda Statelor Unite",
      "Mapă cu acte despre un caz",
    ],
    amestec: [2, 4, 3, 1],
    surse: {
      "CORAL": "https://dexonline.ro/definitie/coral",
      "MORAL": "https://dexonline.ro/definitie/moral",
      "MORAR": "https://dexonline.ro/definitie/morar",
      "MOLAR": "https://dexonline.ro/definitie/molar",
      "DOLAR": "https://dexonline.ro/definitie/dolar",
      "DOSAR": "https://dexonline.ro/definitie/dosar",
    },
  },
  {
    id: "fata-gard", lungime: 4,
    cuvinte: ["FAȚĂ", "FAZĂ", "BAZĂ", "BARĂ", "GARĂ", "GARD"],
    indicii: [
      "Chipul: ochii, nasul, gura și obrajii",
      "Etapă a unui proces; și luminile mari ale mașinii",
      "Partea pe care se sprijină ceva; temelie",
      "Bucată lungă de metal; și cea de la poarta de fotbal",
      "Locul unde trenurile opresc și pleacă",
      "Împrejmuire în jurul curții",
    ],
    amestec: [2, 4, 1, 3],
    surse: {
      "FAȚĂ": "https://dexonline.ro/definitie/față",
      "FAZĂ": "https://dexonline.ro/definitie/fază",
      "BAZĂ": "https://dexonline.ro/definitie/bază",
      "BARĂ": "https://dexonline.ro/definitie/bară",
      "GARĂ": "https://dexonline.ro/definitie/gară",
      "GARD": "https://dexonline.ro/definitie/gard",
    },
  },
  {
    id: "goana-zeama", lungime: 5,
    cuvinte: ["GOANĂ", "GEANĂ", "GEACĂ", "TEACĂ", "TEAMĂ", "ZEAMĂ"],
    indicii: [
      "Alergătură grăbită, urmărire",
      "Fir de păr de pe marginea pleoapei",
      "Haină scurtă, de primăvară sau de toamnă",
      "Învelișul sabiei; și păstaia fasolei",
      "Frică, spaimă",
      "Lichidul dintr-o ciorbă sau din fructe stoarse",
    ],
    amestec: [3, 2, 4, 1],
    surse: {
      "GOANĂ": "https://dexonline.ro/definitie/goană",
      "GEANĂ": "https://dexonline.ro/definitie/geană",
      "GEACĂ": "https://dexonline.ro/definitie/geacă",
      "TEACĂ": "https://dexonline.ro/definitie/teacă",
      "TEAMĂ": "https://dexonline.ro/definitie/teamă",
      "ZEAMĂ": "https://dexonline.ro/definitie/zeamă",
    },
  },
  {
    id: "bila-gena", lungime: 4,
    cuvinte: ["BILĂ", "MILĂ", "MINĂ", "VINĂ", "VENĂ", "GENĂ"],
    indicii: [
      "Sferă mică de rulment; și lichidul amar din ficat",
      "Compasiune față de cel necăjit",
      "Loc de unde se scoate cărbune; și vârful creionului",
      "Răspunderea pentru o greșeală",
      "Vas de sânge care duce sângele spre inimă",
      "Unitate a eredității, scrisă în ADN",
    ],
    amestec: [1, 3, 2, 4],
    surse: {
      "BILĂ": "https://dexonline.ro/definitie/bilă",
      "MILĂ": "https://dexonline.ro/definitie/milă",
      "MINĂ": "https://dexonline.ro/definitie/mină",
      "VINĂ": "https://dexonline.ro/definitie/vină",
      "VENĂ": "https://dexonline.ro/definitie/venă",
      "GENĂ": "https://dexonline.ro/definitie/genă",
    },
  },
  {
    id: "clapa-creta", lungime: 5,
    cuvinte: ["CLAPĂ", "CLIPĂ", "CLIMĂ", "CLEMĂ", "CREMĂ", "CRETĂ"],
    indicii: [
      "Tastă albă sau neagră a pianului",
      "Moment foarte scurt",
      "Vremea tipică a unei regiuni, pe termen lung",
      "Clește mic cu arc, pentru prins cabluri",
      "Se întinde pe tort sau pe piele",
      "Se scrie cu ea pe tablă",
    ],
    amestec: [2, 3, 1, 4],
    surse: {
      "CLAPĂ": "https://dexonline.ro/definitie/clapă",
      "CLIPĂ": "https://dexonline.ro/definitie/clipă",
      "CLIMĂ": "https://dexonline.ro/definitie/climă",
      "CLEMĂ": "https://dexonline.ro/definitie/clemă",
      "CREMĂ": "https://dexonline.ro/definitie/cremă",
      "CRETĂ": "https://dexonline.ro/definitie/cretă",
    },
  },
  {
    id: "poem-tarc", lungime: 4,
    cuvinte: ["POEM", "POET", "PORT", "PORC", "PARC", "ȚARC"],
    indicii: [
      "Operă în versuri, mai lungă",
      "Autor de versuri, precum Eminescu",
      "Loc unde acostează navele",
      "Animal de fermă care grohăie",
      "Grădină publică cu alei și bănci",
      "Loc îngrădit pentru animale sau pentru joaca bebelușului",
    ],
    amestec: [3, 1, 2, 4],
    surse: {
      "POEM": "https://dexonline.ro/definitie/poem",
      "POET": "https://dexonline.ro/definitie/poet",
      "PORT": "https://dexonline.ro/definitie/port",
      "PORC": "https://dexonline.ro/definitie/porc",
      "PARC": "https://dexonline.ro/definitie/parc",
      "ȚARC": "https://dexonline.ro/definitie/țarc",
    },
  },
  {
    id: "bolta-taina", lungime: 5,
    cuvinte: ["BOLTĂ", "BALTĂ", "HALTĂ", "HAITĂ", "HAINĂ", "TAINĂ"],
    indicii: [
      "Tavan arcuit, ca la o biserică veche",
      "Apă adunată după ploaie",
      "Stație mică de tren",
      "Grup de lupi care vânează împreună",
      "Veșmânt; iarna porți una groasă",
      "Secret bine păstrat",
    ],
    amestec: [4, 2, 1, 3],
    surse: {
      "BOLTĂ": "https://dexonline.ro/definitie/boltă",
      "BALTĂ": "https://dexonline.ro/definitie/baltă",
      "HALTĂ": "https://dexonline.ro/definitie/haltă",
      "HAITĂ": "https://dexonline.ro/definitie/haită",
      "HAINĂ": "https://dexonline.ro/definitie/haină",
      "TAINĂ": "https://dexonline.ro/definitie/taină",
    },
  },
  {
    id: "iapa-ruda", lungime: 4,
    cuvinte: ["IAPĂ", "SAPĂ", "SUPĂ", "SUTĂ", "RUTĂ", "RUDĂ"],
    indicii: [
      "Femela calului",
      "Unealtă de grădină pentru afânat pământul",
      "Fel lichid servit la începutul mesei",
      "Numărul format din zece zeci",
      "Traseu stabilit, de pildă al unui autobuz",
      "Membru al familiei, precum un unchi sau un văr",
    ],
    amestec: [1, 4, 2, 3],
    surse: {
      "IAPĂ": "https://dexonline.ro/definitie/iapă",
      "SAPĂ": "https://dexonline.ro/definitie/sapă",
      "SUPĂ": "https://dexonline.ro/definitie/supă",
      "SUTĂ": "https://dexonline.ro/definitie/sută",
      "RUTĂ": "https://dexonline.ro/definitie/rută",
      "RUDĂ": "https://dexonline.ro/definitie/rudă",
    },
  },
  {
    id: "fraga-proba", lungime: 5,
    cuvinte: ["FRAGĂ", "FRAZĂ", "FRIZĂ", "PRIZĂ", "PROZĂ", "PROBĂ"],
    indicii: [
      "Căpșună mică, sălbatică, din pădure",
      "Propoziții legate, încheiate cu punct",
      "Bandă decorativă pe partea de sus a unui zid",
      "Aici bagi ștecherul",
      "Scriere fără versuri: romane, nuvele",
      "Încercare, test; și dovadă la tribunal",
    ],
    amestec: [3, 1, 4, 2],
    surse: {
      "FRAGĂ": "https://dexonline.ro/definitie/fragă",
      "FRAZĂ": "https://dexonline.ro/definitie/frază",
      "FRIZĂ": "https://dexonline.ro/definitie/friză",
      "PRIZĂ": "https://dexonline.ro/definitie/priză",
      "PROZĂ": "https://dexonline.ro/definitie/proză",
      "PROBĂ": "https://dexonline.ro/definitie/probă",
    },
  },
  {
    id: "corp-gest", lungime: 4,
    cuvinte: ["CORP", "CORT", "COST", "ROST", "REST", "GEST"],
    indicii: [
      "Trupul unei ființe; în fizică, orice obiect",
      "Adăpost de pânză pentru camping",
      "Prețul plătit pentru ceva",
      "Sens, noimă; poezia se învață «pe de...»",
      "Banii primiți înapoi la casă",
      "Mișcare a mâinii care spune ceva",
    ],
    amestec: [4, 1, 3, 2],
    surse: {
      "CORP": "https://dexonline.ro/definitie/corp",
      "CORT": "https://dexonline.ro/definitie/cort",
      "COST": "https://dexonline.ro/definitie/cost",
      "ROST": "https://dexonline.ro/definitie/rost",
      "REST": "https://dexonline.ro/definitie/rest",
      "GEST": "https://dexonline.ro/definitie/gest",
    },
  },
  {
    id: "colos-mosor", lungime: 5,
    cuvinte: ["COLOS", "COCOS", "COCOR", "COTOR", "MOTOR", "MOSOR"],
    indicii: [
      "Statuie uriașă, ca aceea din Rodos",
      "Nucă tropicală cu lapte înăuntru",
      "Pasăre călătoare cu gât lung, zboară în formă de V",
      "Partea cărții unde sunt prinse filele; și tulpina verzei",
      "Inima unei mașini",
      "Bobina pe care e înfășurată ața",
    ],
    amestec: [4, 2, 3, 1],
    surse: {
      "COLOS": "https://dexonline.ro/definitie/colos",
      "COCOS": "https://dexonline.ro/definitie/cocos",
      "COCOR": "https://dexonline.ro/definitie/cocor",
      "COTOR": "https://dexonline.ro/definitie/cotor",
      "MOTOR": "https://dexonline.ro/definitie/motor",
      "MOSOR": "https://dexonline.ro/definitie/mosor",
    },
  },
  {
    id: "guma-rasa", lungime: 4,
    cuvinte: ["GUMĂ", "GAMĂ", "VAMĂ", "VATĂ", "RATĂ", "RASĂ"],
    indicii: [
      "Șterge urmele de creion; se și mestecă",
      "Do, re, mi, fa, sol, la, si",
      "Punctul de control de la graniță",
      "Bumbac pufos din trusa medicală",
      "Sumă plătită lunar la bancă",
      "Varietate a unei specii: labrador, ciobănesc...",
    ],
    amestec: [1, 3, 4, 2],
    surse: {
      "GUMĂ": "https://dexonline.ro/definitie/gumă",
      "GAMĂ": "https://dexonline.ro/definitie/gamă",
      "VAMĂ": "https://dexonline.ro/definitie/vamă",
      "VATĂ": "https://dexonline.ro/definitie/vată",
      "RATĂ": "https://dexonline.ro/definitie/rată",
      "RASĂ": "https://dexonline.ro/definitie/rasă",
    },
  },
  {
    id: "iarna-marfa", lungime: 5,
    cuvinte: ["IARNĂ", "IARBĂ", "BARBĂ", "BARJĂ", "MARJĂ", "MARFĂ"],
    indicii: [
      "Anotimpul cu zăpadă",
      "Crește pe pajiște și e păscută de vaci",
      "Moș Crăciun are una lungă și albă",
      "Navă fără motor, trasă pe fluviu de un remorcher",
      "Spațiul alb lăsat pe laturile paginii; și rezervă",
      "Produse de vânzare dintr-un magazin",
    ],
    amestec: [2, 4, 3, 1],
    surse: {
      "IARNĂ": "https://dexonline.ro/definitie/iarnă",
      "IARBĂ": "https://dexonline.ro/definitie/iarbă",
      "BARBĂ": "https://dexonline.ro/definitie/barbă",
      "BARJĂ": "https://dexonline.ro/definitie/barjă",
      "MARJĂ": "https://dexonline.ro/definitie/marjă",
      "MARFĂ": "https://dexonline.ro/definitie/marfă",
    },
  },
  {
    id: "ogor-plan", lungime: 4,
    cuvinte: ["OGOR", "OGAR", "OLAR", "CLAR", "CLAN", "PLAN"],
    indicii: [
      "Teren arat, bun de semănat",
      "Câine de vânătoare zvelt și foarte rapid",
      "Meșter care modelează vase de lut la roată",
      "Limpede, ușor de înțeles",
      "Grup de familii înrudite, ca la scoțieni",
      "Proiect pentru ce urmează să faci",
    ],
    amestec: [2, 4, 1, 3],
    surse: {
      "OGOR": "https://dexonline.ro/definitie/ogor",
      "OGAR": "https://dexonline.ro/definitie/ogar",
      "OLAR": "https://dexonline.ro/definitie/olar",
      "CLAR": "https://dexonline.ro/definitie/clar",
      "CLAN": "https://dexonline.ro/definitie/clan",
      "PLAN": "https://dexonline.ro/definitie/plan",
    },
  },
  {
    id: "birou-codru", lungime: 5,
    cuvinte: ["BIROU", "BAROU", "CAROU", "CADOU", "CADRU", "CODRU"],
    indicii: [
      "Masă de lucru; și încăperea în care lucrezi",
      "Asociația avocaților dintr-un județ",
      "Pătrățel dintr-un model de cămașă",
      "Dar primit de ziua ta",
      "Ramă, contur; și imaginea dintr-un film",
      "Pădure mare și bătrână, în poezia populară",
    ],
    amestec: [3, 2, 4, 1],
    surse: {
      "BIROU": "https://dexonline.ro/definitie/birou",
      "BAROU": "https://dexonline.ro/definitie/barou",
      "CAROU": "https://dexonline.ro/definitie/carou",
      "CADOU": "https://dexonline.ro/definitie/cadou",
      "CADRU": "https://dexonline.ro/definitie/cadru",
      "CODRU": "https://dexonline.ro/definitie/codru",
    },
  },
  {
    id: "manz-toga", lungime: 4,
    cuvinte: ["MÂNZ", "MÂNĂ", "ZÂNĂ", "ZONĂ", "TONĂ", "TOGĂ"],
    indicii: [
      "Puiul iepei",
      "Parte a corpului cu cinci degete",
      "Ființă fermecată din povești, cu baghetă",
      "Regiune, porțiune dintr-un teritoriu",
      "O mie de kilograme",
      "Veșmânt purtat de romani și de judecători",
    ],
    amestec: [1, 3, 2, 4],
    surse: {
      "MÂNZ": "https://dexonline.ro/definitie/mânz",
      "MÂNĂ": "https://dexonline.ro/definitie/mână",
      "ZÂNĂ": "https://dexonline.ro/definitie/zână",
      "ZONĂ": "https://dexonline.ro/definitie/zonă",
      "TONĂ": "https://dexonline.ro/definitie/tonă",
      "TOGĂ": "https://dexonline.ro/definitie/togă",
    },
  },
  {
    id: "ferma-vorba", lungime: 5,
    cuvinte: ["FERMĂ", "FORMĂ", "FORȚĂ", "TORȚĂ", "TORBĂ", "VORBĂ"],
    indicii: [
      "Gospodărie cu animale și culturi",
      "Contur, înfățișare: rotundă, pătrată...",
      "Putere fizică",
      "Făclie aprinsă, precum flacăra olimpică",
      "Traistă, sac de pânză purtat pe umăr",
      "Cuvânt rostit",
    ],
    amestec: [2, 3, 1, 4],
    surse: {
      "FERMĂ": "https://dexonline.ro/definitie/fermă",
      "FORMĂ": "https://dexonline.ro/definitie/formă",
      "FORȚĂ": "https://dexonline.ro/definitie/forță",
      "TORȚĂ": "https://dexonline.ro/definitie/torță",
      "TORBĂ": "https://dexonline.ro/definitie/torbă",
      "VORBĂ": "https://dexonline.ro/definitie/vorbă",
    },
  },
  {
    id: "nisa-sita", lungime: 4,
    cuvinte: ["NIȘĂ", "FIȘĂ", "FILĂ", "VILĂ", "VITĂ", "SITĂ"],
    indicii: [
      "Adâncitură în perete pentru o statuie",
      "Foaie cu date, de pildă la medic sau la bibliotecă",
      "Pagină dintr-o carte sau dintr-un caiet",
      "Casă luxoasă, adesea cu grădină",
      "Animal mare de fermă: bou sau vacă",
      "Unealtă cu ochiuri fine pentru cernut făina",
    ],
    amestec: [3, 1, 2, 4],
    surse: {
      "NIȘĂ": "https://dexonline.ro/definitie/nișă",
      "FIȘĂ": "https://dexonline.ro/definitie/fișă",
      "FILĂ": "https://dexonline.ro/definitie/filă",
      "VILĂ": "https://dexonline.ro/definitie/vilă",
      "VITĂ": "https://dexonline.ro/definitie/vită",
      "SITĂ": "https://dexonline.ro/definitie/sită",
    },
  },
  {
    id: "aripa-trust", lungime: 5,
    cuvinte: ["ARIPĂ", "GRIPĂ", "GRUPĂ", "TRUPĂ", "TRUSĂ", "TRUST"],
    indicii: [
      "O au păsările și avioanele",
      "Boală cu febră, frecventă iarna",
      "Diviziune a unei clase sau a unui campionat",
      "Formație de actori sau de muzicieni",
      "Cutie cu instrumente: de prim ajutor sau de machiaj",
      "Grup mare de firme sub aceeași conducere",
    ],
    amestec: [4, 2, 1, 3],
    surse: {
      "ARIPĂ": "https://dexonline.ro/definitie/aripă",
      "GRIPĂ": "https://dexonline.ro/definitie/gripă",
      "GRUPĂ": "https://dexonline.ro/definitie/grupă",
      "TRUPĂ": "https://dexonline.ro/definitie/trupă",
      "TRUSĂ": "https://dexonline.ro/definitie/trusă",
      "TRUST": "https://dexonline.ro/definitie/trust",
    },
  },
];

// ─── Litere și diacritice ─────────────────────────────────────────────────────────

const PLIERE = { "Ă": "A", "Â": "A", "Î": "I", "Ș": "S", "Ț": "T" };

/** Majuscule, compuse (NFC), cu Ş/Ţ (sedilă, din tastaturi vechi) aduse la Ș/Ț (virgulă). */
export function majuscule(s) {
  return String(s ?? "").normalize("NFC").toUpperCase().replace(/Ş/g, "Ș").replace(/Ţ/g, "Ț");
}

/** Plierea diacriticelor: Ș→S, Ț→T, Ă/Â→A, Î→I (și variantele cu sedilă). */
export function pliaza(s) {
  return majuscule(s).replace(/[ĂÂÎȘȚ]/g, (c) => PLIERE[c]);
}

/** Doar literele românești dintr-un text tastat, ca majuscule; restul (cifre, spații…) se ignoră. */
export function literele(text) {
  return [...majuscule(text)].filter((c) => LITERE.includes(c));
}

/** Pe câte poziții diferă două cuvinte de aceeași lungime (Infinity dacă lungimile diferă). */
export function diferente(a, b) {
  const x = [...String(a)], y = [...String(b)];
  if (x.length !== y.length) return Infinity;
  let n = 0;
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) n++;
  return n;
}

/** Vecini pe scară: diferă printr-o singură literă — și cu diacritice, și fără. */
export function suntVecini(a, b) {
  return diferente(a, b) === 1 && diferente(pliaza(a), pliaza(b)) === 1;
}

/**
 * Proprietatea scării pentru cuvintele date, în ordinea dată: vecinii diferă printr-o literă,
 * ne-vecinii prin cel puțin două (după pliere), iar formele pliate sunt toate diferite.
 */
export function esteScara(cuvinte) {
  const pliate = cuvinte.map(pliaza);
  if (new Set(pliate).size !== cuvinte.length) return false;
  for (let i = 0; i < cuvinte.length; i++) {
    for (let j = i + 1; j < cuvinte.length; j++) {
      const bun = j === i + 1 ? suntVecini(cuvinte[i], cuvinte[j]) : diferente(pliate[i], pliate[j]) >= 2;
      if (!bun) return false;
    }
  }
  return true;
}

/** Cuvântul tastat e corect dacă are lungimea bună și, pliat, e identic cu răspunsul pliat. */
export function eCorect(tastat, cuvant) {
  const t = literele(tastat);
  return t.length === [...cuvant].length && pliaza(t.join("")) === pliaza(cuvant);
}

// ─── Ordonarea și capetele ────────────────────────────────────────────────────────

/**
 * Verifică ordinea aleasă de jucător pentru cele 4 cuvinte din mijloc (indici 1..4 în
 * `cuvinte`, de sus în jos). Fiecare cuvânt trebuie să difere de vecinul lui printr-o singură
 * literă; scara se acceptă în ambele sensuri: → "direct" ([1,2,3,4]) sau "invers" ([4,3,2,1]).
 * Orice altă ordine → null.
 */
export function directiaOrdinii(puzzle, ordine) {
  if (!Array.isArray(ordine) || ordine.length !== 4) return null;
  if ([...ordine].sort().join(",") !== "1,2,3,4") return null;
  for (let k = 0; k < 3; k++) {
    if (!suntVecini(puzzle.cuvinte[ordine[k]], puzzle.cuvinte[ordine[k + 1]])) return null;
  }
  const s = ordine.join(",");
  return s === "1,2,3,4" ? "direct" : s === "4,3,2,1" ? "invers" : null;
}

/** Pentru afișaj: care perechi alăturate din ordinea curentă diferă printr-o singură literă. */
export function legaturi(puzzle, ordine) {
  const out = [];
  for (let k = 0; k + 1 < ordine.length; k++) {
    out.push(suntVecini(puzzle.cuvinte[ordine[k]], puzzle.cuvinte[ordine[k + 1]]));
  }
  return out;
}

/**
 * Capetele după sensul ales: ce cuvânt (indice în `cuvinte`) stă sus și jos și cine e vecinul
 * lui din mijloc. Scara ordonată invers are primul și ultimul cuvânt inversate.
 */
export function capete(directie) {
  return directie === "invers"
    ? { sus: 5, jos: 0, vecinSus: 4, vecinJos: 1 }
    : { sus: 0, jos: 5, vecinSus: 1, vecinJos: 4 };
}

// ─── Indicii („Dezvăluie o literă”) ───────────────────────────────────────────────

/**
 * Poziția de dezvăluit: prima poziție încă nedezvăluită pe care litera tastată lipsește sau e
 * greșită (comparat fără diacritice). -1 dacă nu mai e nimic de dezvăluit.
 */
export function pozitieDeDezvaluit(cuvant, litere, dezvaluite = []) {
  const c = [...cuvant];
  for (let i = 0; i < c.length; i++) {
    if (dezvaluite.includes(i)) continue;
    const l = litere[i];
    if (!l || pliaza(l) !== pliaza(c[i])) return i;
  }
  return -1;
}

// ─── Scara zilei ──────────────────────────────────────────────────────────────────

/** YYYYMMDD → milisecunde UTC (miezul nopții), ca să numărăm zile reale din calendar. */
function msUTC(zi) {
  return Date.UTC(Math.floor(zi / 10000), Math.floor((zi % 10000) / 100) - 1, zi % 100);
}

/** Zile întregi de la START până la `zi` (YYYYMMDD); zilele de dinainte (și seed-urile invalide) → 0. */
export function zileDeLaStart(zi) {
  const d = Math.round((msUTC(zi) - msUTC(START)) / 86400000);
  return d > 0 ? d : 0;
}

/** Scara zilei `zi`: { puzzle, index, editie } — index = zile de la START, ediția = index + 1. */
export function scaraZilei(zi) {
  const index = zileDeLaStart(zi);
  return { puzzle: BANC[index % BANC.length], index, editie: index + 1 };
}

// ─── Timp și rezultat ─────────────────────────────────────────────────────────────

/** Secunde → "m:ss" (ex. 75 → "1:15"). */
export function formatTimp(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

/** Textul rezultatului pentru share: "Scara #7 · 2:31" (+ " · fără indicii"). */
export function textScor(editie, sec, indicii) {
  return "Scara #" + editie + " · " + formatTimp(sec) + (indicii === 0 ? " · fără indicii" : "");
}
