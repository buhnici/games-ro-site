// ==== PREȚUL CORECT — modul ES, v2 (24.09.2026): prețuri de zi cu zi, fiecare cu sursă ====
// SDK-ul jocurilor games.ro se importă de la shell.js
//
// REGULĂ: un preț intră aici DOAR dacă a fost văzut pe sursa lui (site-ul operatorului/autorității
// sau pagina de produs a retailerului, fără promoție) — fără cifre din memorie.
// Tarifele fixe (transport, taxe, abonamente, muzee) au fost reverificate de manager pe sursele oficiale.
// volatil: true = preț de raft/pompă, se schimbă des → de reverificat lunar; pagina afișează data verificării.
// De reverificat curând: STB (propunere de scumpire 3 → 5 lei, STB în insolvență din 8.09.2026).

export const CATEGORII = ["transport", "taxe", "alimente", "carburant", "abonamente", "altele"];

export const PRODUSE = [
  { nume: "Bilet STB 90 de minute (București)", pret: 3, categorie: "transport", sursa: "https://www.stb.ro/tarife", sursa_nume: "stb.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Abonament STB 24 de ore (București)", pret: 8, categorie: "transport", sursa: "https://www.stb.ro/tarife", sursa_nume: "stb.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Abonament STB lunar, suprafață (București)", pret: 80, categorie: "transport", sursa: "https://www.stb.ro/tarife", sursa_nume: "stb.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Bilet integrat STB + metrou, 120 de minute (București)", pret: 7, categorie: "transport", sursa: "https://www.stb.ro/tarife", sursa_nume: "stb.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Abonament integrat STB + metrou, 12 luni (București)", pret: 1410, categorie: "transport", sursa: "https://www.stb.ro/tarife", sursa_nume: "stb.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Bilet metrou București, o călătorie (Metrorex)", pret: 5, categorie: "transport", sursa: "https://www.metrorex.ro/titluri-de-calatorie-tarife", sursa_nume: "metrorex.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Abonament lunar metrou București (Metrorex)", pret: 100, categorie: "transport", sursa: "https://www.metrorex.ro/titluri-de-calatorie-tarife", sursa_nume: "metrorex.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Bilet CTP Cluj-Napoca, o călătorie", pret: 3.5, categorie: "transport", sursa: "https://ctpcj.ro/index.php/ro/despre-noi/stiri/modificari-tarife-titluri-calatorie-2025/1798", sursa_nume: "ctpcj.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Abonament lunar CTP Cluj-Napoca, toate liniile (nominal)", pret: 213, categorie: "transport", sursa: "https://ctpcj.ro/index.php/ro/despre-noi/stiri/modificari-tarife-titluri-calatorie-2025/1798", sursa_nume: "ctpcj.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Bilet tren București Nord – Aeroportul Henri Coandă (Otopeni)", pret: 6.5, categorie: "transport", sursa: "https://www.cfrcalatori.ro/bucuresti-nord-aeroport-henri-coanda/", sursa_nume: "cfrcalatori.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Pașaport simplu electronic", pret: 265, categorie: "taxe", sursa: "https://pasapoarte.mai.gov.ro/3-contravaloare-pasaport-cum-se-poate-achita-contravaloarea-pasaportului/", sursa_nume: "pasapoarte.mai.gov.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Buletin simplu (carte de identitate fără cip)", pret: 40, categorie: "taxe", sursa: "https://evpilfov.ro/contravaloarea-actelor-de-identitate/", sursa_nume: "evpilfov.ro (DJEP Ilfov)", verificat: "2026-09-23", volatil: false },
  { nume: "Permis de conducere (costul documentului)", pret: 139, categorie: "taxe", sursa: "https://dgpci.mai.gov.ro/document-details/taxe/5f8d47b07d66a112ac8acec4", sursa_nume: "dgpci.mai.gov.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Scrisoare internă neprioritară, până la 100 g (Poșta Română)", pret: 5.5, categorie: "taxe", sursa: "https://www.posta-romana.ro/a313/tarife/scrisori-carti-postale/in-romania/corespondenta-intern.html", sursa_nume: "posta-romana.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Lapte Zuzu 1,5% grăsime, 1 L (Mega Image)", pret: 6.39, categorie: "alimente", sursa: "https://www.mega-image.ro/Lactate-si-oua/Lapte-proaspat/Lapte-proaspat-semidegresat/Lapte-1-5-grasime-1L/p/36688", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Pâine albă feliată Vel Pitar, 500 g (Mega Image)", pret: 6.49, categorie: "alimente", sursa: "https://www.mega-image.ro/Paine-cafea-cereale-si-mic-dejun/Paine-si-specialitati/Paine-ambalata/Paine-Alba-feliata-500g/p/70095", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Ouă cod 2, mărime M, 10 bucăți (marca Mega Image)", pret: 13.99, categorie: "alimente", sursa: "https://www.mega-image.ro/Lactate-si-oua/Oua/Oua-cod-2/Oua-cod-2-marime-M-10-bucati/p/48070", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Ulei de floarea-soarelui Floriol, 1 L (Mega Image)", pret: 9.99, categorie: "alimente", sursa: "https://www.mega-image.ro/Ingrediente-culinare/Ulei-otet-si-suc-de-lamaie/Ulei-de-floarea-soarelui/Ulei-de-floarea-soarelui-1L/p/88505", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Zahăr alb cristal Mărgăritar, 1 kg (Mega Image)", pret: 4.39, categorie: "alimente", sursa: "https://www.mega-image.ro/Ingrediente-culinare/Zahar-faina-si-malai/Zahar-alb/Zahar-alb-cristal-1kg/p/49956", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Făină albă de grâu 000 Băneasa, 1 kg (Mega Image)", pret: 3.04, categorie: "alimente", sursa: "https://www.mega-image.ro/Ingrediente-culinare/Zahar-faina-si-malai/Faina/Faina-de-grau-alba-000-superioara-1kg/p/24362", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Cafea măcinată Jacobs Krönung, 250 g (Mega Image)", pret: 31.49, categorie: "alimente", sursa: "https://www.mega-image.ro/Paine-cafea-cereale-si-mic-dejun/Cafea/Cafea-macinata/Cafea-prajita-si-macinata-250g/p/24641", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Plic Nescafé 3in1 Original, 15,5 g (Mega Image)", pret: 1.09, categorie: "alimente", sursa: "https://www.mega-image.ro/Paine-cafea-cereale-si-mic-dejun/Cafea/Cappuccino-mixuri/Cafea-3in1-Original-15-5g/p/66339", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Bere Ursus Premium, doză 0,5 L, fără garanția SGR (Carrefour)", pret: 4.59, categorie: "alimente", sursa: "https://carrefour.ro/produse/bere-ursus-premium-doza-0-5l-19-10005133", sursa_nume: "carrefour.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Apă minerală plată Dorna, 2 L, fără garanția SGR (Mega Image)", pret: 4.39, categorie: "alimente", sursa: "https://www.mega-image.ro/Apa-si-sucuri/Apa/Apa-plata/Apa-minerala-naturala-plata-2L/p/41762", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Coca-Cola, 2 L, fără garanția SGR (Carrefour)", pret: 9.99, categorie: "alimente", sursa: "https://carrefour.ro/produse/coca-cola-gust-original-2l-19-10004739", sursa_nume: "carrefour.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Piept de pui dezosat, fără piele, 1 kg (Auchan)", pret: 33.09, categorie: "alimente", sursa: "https://www.auchan.ro/piept-de-pui-dezosat-auchan-fara-piele-1-kg/p", sursa_nume: "auchan.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Unt nesărat Président 82% grăsime, 200 g (Mega Image)", pret: 13.99, categorie: "alimente", sursa: "https://www.mega-image.ro/Lactate-si-oua/Unt-si-margarina/Unt/Unt-nesarat-82-grasime-200g/p/71627", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Cașcaval Delaco Sofia, 400 g (Mega Image)", pret: 28.99, categorie: "alimente", sursa: "https://www.mega-image.ro/Lactate-si-oua/Branzeturi/Cascaval/Cascaval-Sofia-400g/p/8374", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Banane, 1 kg (Auchan)", pret: 6.99, categorie: "alimente", sursa: "https://www.auchan.ro/banane-1-kg/p", sursa_nume: "auchan.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Ciocolată cu lapte alpin Milka, 90 g (Mega Image)", pret: 9.99, categorie: "alimente", sursa: "https://www.mega-image.ro/Dulciuri-si-snacks/Ciocolata/Tablete-de-ciocolata/Ciocolata-cu-lapte-alpin-90g/p/912", sursa_nume: "mega-image.ro", verificat: "2026-09-23", volatil: true },
  { nume: "Benzină standard 95, 1 litru (Petrom, București)", pret: 9.99, categorie: "carburant", sursa: "https://monitorulpreturilor.info/pmonsvc/Gas/GetGasItemsByLatLon?lon=26.0856&lat=44.4524&buffer=5000&CSVGasCatalogProductIds=11", sursa_nume: "monitorulpreturilor.info (Consiliul Concurenței)", verificat: "2026-09-23", volatil: true },
  { nume: "GPL auto, 1 litru (MOL, București)", pret: 4.7, categorie: "carburant", sursa: "https://monitorulpreturilor.info/pmonsvc/Gas/GetGasItemsByLatLon?lon=26.0856&lat=44.4524&buffer=5000&CSVGasCatalogProductIds=31", sursa_nume: "monitorulpreturilor.info (Consiliul Concurenței)", verificat: "2026-09-23", volatil: true },
  { nume: "Spotify Premium Individual, abonament lunar (România)", pret: 26, categorie: "abonamente", sursa: "https://www.spotify.com/ro-ro/premium/", sursa_nume: "spotify.com", verificat: "2026-09-23", volatil: false },
  { nume: "YouTube Premium Individual, abonament lunar (România)", pret: 32, categorie: "abonamente", sursa: "https://www.youtube.com/premium", sursa_nume: "youtube.com", verificat: "2026-09-23", volatil: false },
  { nume: "Disney+ Standard, abonament lunar (România)", pret: 34.99, categorie: "abonamente", sursa: "https://www.disneyplus.com/ro-ro", sursa_nume: "disneyplus.com", verificat: "2026-09-23", volatil: false },
  { nume: "Bilet adult Muzeul Național de Istorie a României (București)", pret: 32, categorie: "altele", sursa: "https://www.mnir.ro/tarife-mnir/", sursa_nume: "mnir.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Bilet adult Castelul Peleș (parter + primul etaj)", pret: 100, categorie: "altele", sursa: "https://peles.ro/program-si-taxe/", sursa_nume: "peles.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Bilet adult Grădina Zoologică București (Băneasa)", pret: 20, categorie: "altele", sursa: "https://bucurestizoo.ro/program-si-tarife/", sursa_nume: "bucurestizoo.ro", verificat: "2026-09-23", volatil: false },
  { nume: "Bilet adult Salina Turda, de luni până vineri", pret: 75, categorie: "altele", sursa: "https://www.salinaturda.eu/vizitare-si-tarife/", sursa_nume: "salinaturda.eu", verificat: "2026-09-23", volatil: false },
  { nume: "Tur standard Palatul Parlamentului, bilet adult", pret: 85, categorie: "altele", sursa: "https://cic.cdep.ro/vizitare", sursa_nume: "cic.cdep.ro (Camera Deputaților)", verificat: "2026-09-23", volatil: false },
];

/* Algoritm de amestec determinist (xorshift) */
function amestec(seed) {
  let x = seed >>> 0;
  x ^= (x << 13) >>> 0;
  x ^= x >>> 17;
  x ^= (x << 5) >>> 0;
  return x >>> 0; // Convert to unsigned 32-bit
}

/* Returnează 5 indecși determiniști pentru prețurile zilei — maximum 2 din aceeași categorie */
export function produseleZilei(seed) {
  const alese = [];
  const pe = {};
  let x = seed >>> 0;
  let buget = 1000; // plafonul pe categorie cedează doar dacă n-ar mai exista alte categorii
  while (alese.length < 5) {
    x = amestec(x);
    const i = x % PRODUSE.length;
    if (alese.includes(i)) continue;
    const c = PRODUSE[i].categorie;
    if ((pe[c] || 0) >= 2 && buget-- > 0) continue;
    alese.push(i);
    pe[c] = (pe[c] || 0) + 1;
  }
  return alese;
}

/* Calculul scorului */
export function scor(ghicit, real) {
  const dif = Math.abs(ghicit - real) / real;
  if (dif <= 0.05) return 100;
  if (dif >= 0.5) return 0;
  return Math.round(100 * (0.5 - dif) / 0.45);
}
