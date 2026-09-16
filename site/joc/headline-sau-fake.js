// ==== Headline sau Fake? — modul pur (nu face UI, doar date + logică) ====
// Slug: headline-sau-fake
// Date: 24 întrebări gaming/tehnologie (fapte reale + false plauzibile)

export const INTREBARI = [
  { text: "Minecraft este cel mai bine vândut joc video din istorie.", adevarat: true,
    explicatie: "Adevărat. Peste 300 de milioane de copii vândute, mai mult decât orice alt joc." },
  { text: "Tetris a fost creat în 1984, în Uniunea Sovietică, de Alexei Pajitnov.", adevarat: true,
    explicatie: "Adevărat. Pajitnov l-a scris la Academia de Științe din Moscova, pe un computer Elektronika 60." },
  { text: "Mario a apărut prima dată în jocul Donkey Kong, în 1981.", adevarat: true,
    explicatie: "Adevărat. Pe atunci nici nu se numea Mario, ci „Jumpman”." },
  { text: "Prima consolă PlayStation a fost lansată de Sony în Japonia, în 1994.", adevarat: true,
    explicatie: "Adevărat. A ajuns în Europa și America în 1995 și a vândut peste 100 de milioane de unități." },
  { text: "Jocul E.T. pentru Atari 2600 a fost făcut în doar circa cinci săptămâni.", adevarat: true,
    explicatie: "Adevărat. Graba lansării pentru Crăciunul 1982 l-a transformat în simbolul crizei jocurilor din 1983." },
  { text: "Pac-Man a fost creat în Japonia, la compania Namco.", adevarat: true,
    explicatie: "Adevărat. Designerul Toru Iwatani l-a lansat în 1980, inspirat de o pizza din care lipsea o felie." },
  { text: "Seria The Witcher este realizată de un studio din Polonia.", adevarat: true,
    explicatie: "Adevărat. CD Projekt Red, din Varșovia, pornind de la cărțile polonezului Andrzej Sapkowski." },
  { text: "Nintendo a fost fondată în secolul al XIX-lea, ca producător de cărți de joc.", adevarat: true,
    explicatie: "Adevărat. Compania există din 1889 și a produs cărți de joc hanafuda aproape un secol." },
  { text: "GTA V a vândut peste 200 de milioane de copii.", adevarat: true,
    explicatie: "Adevărat. Este printre cele mai profitabile produse de divertisment din istorie, nu doar dintre jocuri." },
  { text: "Platforma Steam aparține companiei Valve.", adevarat: true,
    explicatie: "Adevărat. Valve a lansat Steam în 2003, inițial pentru actualizările propriilor jocuri." },
  { text: "Primul joc FIFA a apărut în 1993.", adevarat: true,
    explicatie: "Adevărat. FIFA International Soccer a fost lansat de EA în decembrie 1993." },
  { text: "Consola Wii de la Nintendo se controla cu telecomenzi cu senzor de mișcare.", adevarat: true,
    explicatie: "Adevărat. Wii Remote a făcut din mișcare principala formă de control și a cucerit publicul casual în 2006." },
  { text: "Prima consolă Xbox a fost lansată de Apple.", adevarat: false,
    explicatie: "Fals. Xbox este consola Microsoft, lansată în 2001. Apple nu a lansat niciodată o consolă de jocuri dedicată." },
  { text: "PlayStation 2 a fost lansată în 1999.", adevarat: false,
    explicatie: "Fals. PS2 a apărut în martie 2000 în Japonia. A devenit cea mai vândută consolă din istorie." },
  { text: "Halo: Combat Evolved a fost lansat mai întâi pe PC.", adevarat: false,
    explicatie: "Fals. Halo a debutat pe Xbox în 2001, ca titlu de lansare al consolei; pe PC a ajuns abia în 2003." },
  { text: "Counter-Strike a început ca joc de sine stătător creat de Valve.", adevarat: false,
    explicatie: "Fals. A început în 1999 ca mod de Half-Life făcut de doi fani, Minh Le și Jess Cliffe; Valve l-a cumpărat apoi." },
  { text: "Fortnite a fost creat de studioul japonez Capcom.", adevarat: false,
    explicatie: "Fals. Fortnite este făcut de Epic Games, companie americană, și a explodat în 2017 cu modul Battle Royale." },
  { text: "Lara Croft, eroina din Tomb Raider, a fost creată în Franța.", adevarat: false,
    explicatie: "Fals. Tomb Raider a fost creat în Marea Britanie, la studioul Core Design din Derby, în 1996." },
  { text: "Super Mario Bros. a fost lansat pentru prima dată pe PlayStation.", adevarat: false,
    explicatie: "Fals. Super Mario Bros. a apărut în 1985 pe consola Nintendo NES, cu un deceniu înaintea PlayStation." },
  { text: "League of Legends se joacă exclusiv pe console.", adevarat: false,
    explicatie: "Fals. LoL este un joc de PC; tocmai asta l-a făcut coloana vertebrală a esportului pe computer." },
  { text: "Căștile de realitate virtuală au fost inventate după anul 2015.", adevarat: false,
    explicatie: "Fals. Experimente VR există din anii '60 (Sensorama, „Sabia lui Damocle”); 2015-2016 doar le-a adus în comerț." },
  { text: "Sega mai produce și astăzi propriile console de jocuri.", adevarat: false,
    explicatie: "Fals. După eșecul consolei Dreamcast, Sega a ieșit din piața de console în 2001 și face doar jocuri." },
  { text: "Primul turneu de jocuri video din lume a avut loc în 2010.", adevarat: false,
    explicatie: "Fals. Încă din 1972 studenții de la Stanford concurau la Spacewar!, cu un abonament la Rolling Stone drept premiu." },
  { text: "Primul joc video creat în România a apărut abia după anul 2010.", adevarat: false,
    explicatie: "Fals. Jocuri românești există încă din anii '80-'90, pe calculatoarele HC și Spectrum, iar studiouri locale publicau comercial din anii 2000." },
];

// Determinist pentru aceeași zi: xorshift
function indexZi(seed, n) {
  let x = seed >>> 0;
  x ^= (x << 13) >>> 0;
  x ^= x >>> 17;
  x ^= (x << 5) >>> 0;
  return x % n;
}

// Returns 8 distinct indices from 0 to INTREBARI.length-1, determinist pe zi
export function intrebarileZilei(seed) {
  const ZI = seed >>> 0;
  const all = [];
  for (let i = 0; i < 8; i++) {
    all.push(indexZi(ZI + i, INTREBARI.length));
  }
  // Verifică unicitate (eventually fix dacă e caz excepțional)
  const unice = new Set(all);
  if (unice.size !== 8) {
    // Fallback: înlocuiește duplicatele cu index-uri rămase
    for (let i = 0; i < INTREBARI.length && unice.size < 8; i++) {
      if (!unice.has(i)) unice.add(i);
    }
  }
  return Array.from(unice);
}

// Verifică răspunsul de un jucător: corect = true, aproape = true/false
// corect: toate 8 sunt pe partea corectă
// aproape: exact 4-6 sunt corecte
export function evalueazaRaspuns(raspunsuri, intrebariZilei) {
  let corecte = 0;
  for (let i = 0; i < raspunsuri.length; i++) {
    const intrebareIdx = intrebariZilei[i];
    if (raspunsuri[i] === INTREBARI[intrebareIdx].adevarat) {
      corecte++;
    }
  }
  if (corecte === 8) return { corect: true, aproape: false };
  if (corecte >= 4) return { corect: false, aproape: true };
  return { corect: false, aproape: false };
}