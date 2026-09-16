// ==== Type Racer RO — modul pur (nu face UI, doar date + logică) ====
// Slug: type-racer-ro
// Date: 20 propoziții românești cu diacritice, gaming/tehnologie/România

export const TEXTE = [
  "Nintendo a lansat Wii în 2006, câștigând popularitate rapidă datorită controllerului inovativ și a jocurilor pentru familie, devenind un succes comercial.",
  "PlayStation 3 a fost un produs premium cu performanțe grafice excepționale și capacitate de stocare uriașă.",
  "Internetul a revoluționat comunicarea, transformând modul în care accesăm conținutul digital în întreaga lume.",
  "Minecraft, creat de Markus Persson, a devenit blockbuster, formând genul jocurilor open-world.",
  "Programatorii folosesc cafeină și energie pentru a rămâne treji în zilele lungi de programare la calculator.",
  "Primul joc lansat pe internet a fost MUD în 1970, formând baza industriei MMORPG și a jocurilor textuale.",
  "Corea de Sud are o industrie gaming uriașă, cunoscută pentru e-sporturi și StarCraft devenit campionat mondial.",
  "Gabe Newell a transformat modul în care jucătorii joacă, fondând platforma Steam care vinde milioane de jocuri.",
  "Roboti asistenți vor asista oamenii în sarcinile repetitive, făcând viitorul tehnologic mai eficient și mai productiv.",
  "Jocurile VR oferă experiențe imersive, permitând explorarea unor lumi virtuale 3D pline de detalii și acțiune.",
  "Bazinul Mediteranean are o climă plăcută vara, atractând milioane de turiști pentru activități culturice și istorice.",
  "România are o istorie bogată, cunoscută pentru tradiții unice și arhitectura medievală din orașele vechi.",
  "Tehnologia 5G va accelera conectivitatea, permițând comunicarea instantanee între dispozitive în întreaga lume.",
  "Unii jucători profesioniști câștigă milioane anual prin turnee și sponsorizări internaționale la nivel mondial.",
  "Inteligenta artificială va schimba fundamental modul de lucru, creând noi oportunități în era automatizării și a robotelor.",
  "Marius, un programator din București, a creat un joc de tip Tetris care a devenit popular pe internet în anii 2000.",
  "Electronic Arts și Ubisoft sunt companii majore de dezvoltare și publicare de jocuri video pentru console și PC.",
  "NVIDIA produce plăci grafice care permit jocurilor să ruleze la rezoluții înalte cu grafică realistă și detaliată.",
  "Valorant, dezvoltat de Riot Games, combină tactică e-sport cu elemente de gameplay de tip FPS în timp real.",
  "Valve Corp a lansat Half-Life în 1998, o jocul FPS revoluționar care a definit genul pentru generații întregi."
];

// Determinist pentru aceeași zi
function indexZi(seed, n) {
  let x = seed >>> 0;
  x ^= (x << 13) >>> 0;
  x ^= x >>> 17;
  x ^= (x << 5) >>> 0;
  return x % n;
}

// Returnează indexul textului zilei, determinist pe zi
export function textZilei(seed) {
  return indexZi(seed, TEXTE.length);
}

// Pliază diacriticele și lowercase
// ă → a, â → a, î → i, ș/ş → s, ț/ț → t
export function pliaza(s) {
  return s.toLowerCase()
          .replace(/ă/g, "a")
          .replace(/â/g, "a")
          .replace(/î/g, "i")
          .replace(/ș/g, "s")
          .replace(/ț/g, "t");
}

// Calculează corectățea și WPM
// textOriginal: string original (cu diacritice)
// textTastat: string tastat (fără diacritice, lowercase)
// ms: timp în milisecunde
export function calcule(textOriginal, textTastat, ms) {
  const originalFaraDiacritice = pliaza(textOriginal);
  const lungime = originalFaraDiacritice.length;

  let corecte = 0;
  for (let i = 0; i < lungime; i++) {
    if (i < textTastat.length && originalFaraDiacritice[i] === textTastat[i]) {
      corecte++;
    }
  }

  // Evităm acuratete = 100 când există erori
  let acuratete = lungime > 0 ? Math.round(100 * corecte / lungime) : 0;
  if (corecte < lungime) {
    acuratete = Math.min(acuratete, 99);
  }

  const wpm = lungime > 0 ? Math.round((corecte / 5) / (ms / 60000)) : 0;

  return { corecte, acuratete, wpm };
}