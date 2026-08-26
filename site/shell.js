/**
 * GAMES.RO — shell.js · SDK-ul comun al jocurilor (v1)
 * Zero dependențe. ES module. Logica de zi/streak/share pe localStorage.
 * Paginile de joc îl includ inline (cu comentariu-sursă) sau ca modul.
 */

const TZ = "Europe/Bucharest";
const PREFIX = "gro:";

/* localStorage poate lipsi (Node, private mode cu quota 0) — guard peste tot. */
const store = (() => {
  try {
    const t = "__gro_t__";
    localStorage.setItem(t, "1");
    localStorage.removeItem(t);
    return localStorage;
  } catch {
    const mem = new Map();
    return {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
    };
  }
})();

/** Data României ca "YYYYMMDD" (număr întreg) pentru o zi dată (default: acum). */
function ziuaRO(date = new Date()) {
  const parts = new Intl.DateTimeFormat("ro-RO", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  return Number(`${get("year")}${get("month")}${get("day")}`);
}

/** Cheia de storage pentru un joc într-o zi. */
const cheie = (slug, zi) => `${PREFIX}${slug}:${zi}`;

/** Ziua anterioară (ca YYYYMMDD), corect peste luni/ani. */
function ziuaAnterioara(zi) {
  const y = Math.floor(zi / 10000), m = Math.floor((zi % 10000) / 100), d = zi % 100;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.getUTCFullYear() * 10000 + (dt.getUTCMonth() + 1) * 100 + dt.getUTCDate();
}

export const GamesRO = {
  /** Seed determinist al zilei (întreg) — același pentru toți jucătorii în aceeași zi RO. */
  seedAzi() {
    return ziuaRO();
  },

  /** Marchează jocul ca jucat azi (idempotent). Opțional: scorul serializabil. */
  marcheazaJucat(slug, scor = null) {
    const k = cheie(slug, ziuaRO());
    const val = scor === null ? "1" : JSON.stringify(scor);
    store.setItem(k, val);
  },

  /** A fost jucat azi? */
  eJucatAzi(slug) {
    return store.getItem(cheie(slug, ziuaRO())) !== null;
  },

  /** Zile consecutive jucate, terminând azi sau ieri (streak-ul nu moare până nu sare o zi). */
  streak(slug) {
    let zi = ziuaRO();
    let n = 0;
    if (store.getItem(cheie(slug, zi)) === null) {
      zi = ziuaAnterioara(zi);            // azi încă nejucat → streak-ul curge din ieri
    }
    while (store.getItem(cheie(slug, zi)) !== null) {
      n += 1;
      zi = ziuaAnterioara(zi);
    }
    return n;
  },

  /**
   * Share-ul rezultatului: text + grilă emoji (emoji-urile sunt PERMISE aici —
   * e conținut pentru WhatsApp/clipboard, nu UI-ul site-ului).
   * Returnează "shared" | "copied" | false.
   */
  async share(slug, emojiGrid, scorText) {
    const nr = ziuaRO() % 10000;          // număr scurt de ediție, ex. #0827
    const text = `GAMES.ro · ${slug} #${nr}\n${scorText}\n${emojiGrid}\nhttps://games.ro/joc/${slug}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text });
        return "shared";
      }
    } catch { /* utilizatorul a anulat — încearcă clipboard */ }
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return "copied";
      }
    } catch { /* clipboard refuzat */ }
    return false;
  },

  /** Starea tuturor jocurilor cunoscute — pentru header-ul homepage-ului. */
  statsToate(sluguri = ["geo-ro", "pretul-corect", "headline-sau-fake", "conexiuni-ro", "blocuri", "aripi", "cuvantul-zilei"]) {
    const out = {};
    for (const s of sluguri) {
      out[s] = { jucatAzi: this.eJucatAzi(s), streak: this.streak(s) };
    }
    return out;
  },
};

export default GamesRO;
