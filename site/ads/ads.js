/**
 * GAMES.RO ads — ads.js · loader universal (~2KB)
 * Folosire: <div data-gro-ad="home-cabinet"></div> + <script src="/ads/ads.js" defer></script>
 * Randează nativ (moștenește tokens.css unde există), etichetează RECLAMĂ,
 * trimite beacon de afișare și click. Zero cookie-uri, zero terți.
 */
(function () {
  "use strict";
  var BASE = (document.currentScript && document.currentScript.src.indexOf("games.ro") !== -1)
    ? "https://games.ro/ads/" : "/ads/";
  var SITE = location.hostname.replace(/^www\./, "");

  function beacon(e, zone, cid) {
    try {
      navigator.sendBeacon(BASE + "ads.php", new Blob(
        [JSON.stringify({ e: e, zone: zone, cid: cid })], { type: "text/plain" }
      ));
    } catch (_) {}
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function render(slot, zone, data) {
    var c = data.creative || {};
    var a = el("a", "gro-ad-card");
    a.href = c.url || "#";
    a.rel = "sponsored noopener";
    a.target = "_blank";
    a.style.cssText = "display:block;text-decoration:none;color:inherit;height:100%";

    var label = el("div", "gro-ad-label", c.label || "RECLAMĂ");
    label.style.cssText = "font-family:var(--font-mono,monospace);font-size:10px;letter-spacing:.2em;color:var(--amber,#ffb300);margin-bottom:8px";
    a.appendChild(label);

    if (c.img && /^https:\/\/(cdn\.shopify\.com|gb\.ro|games\.ro)\//.test(c.img)) {
      var img = el("img", "gro-ad-img");
      img.src = c.img; img.alt = c.title || ""; img.loading = "lazy";
      img.style.cssText = "width:100%;height:110px;object-fit:contain;margin-bottom:10px;filter:drop-shadow(0 0 8px rgba(255,179,0,.25))";
      a.appendChild(img);
    }
    a.appendChild(el("div", "gro-ad-title", c.title || ""));
    a.lastChild.style.cssText = "font-family:var(--font-mono,monospace);font-weight:700;font-size:.85rem;color:var(--text,#f2f4ff);line-height:1.4";
    if (c.desc) {
      a.appendChild(el("div", "gro-ad-desc", c.desc));
      a.lastChild.style.cssText = "font-family:var(--font-mono,monospace);font-size:.72rem;color:var(--text-dim,#9aa3c0);margin-top:6px;line-height:1.5";
    }
    var foot = el("div", "gro-ad-foot");
    foot.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:8px";
    if (c.price) {
      foot.appendChild(el("span", "gro-ad-price", c.price));
      foot.lastChild.style.cssText = "font-family:var(--font-mono,monospace);font-weight:700;color:var(--live,#39ff88)";
    }
    foot.appendChild(el("span", "gro-ad-cta", c.cta || "Vezi"));
    foot.lastChild.style.cssText = "font-family:var(--font-mono,monospace);font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:var(--amber,#ffb300);border:1px solid var(--amber,#ffb300);border-radius:6px;padding:8px 14px";
    a.appendChild(foot);

    a.addEventListener("click", function () { beacon("click", zone, data.cid); });
    slot.textContent = "";
    slot.appendChild(a);
    beacon("imp", zone, data.cid);
  }

  function load(slot) {
    var zone = slot.getAttribute("data-gro-ad");
    if (!zone) return;
    fetch(BASE + "ads.php?zone=" + encodeURIComponent(zone) + "&site=" + encodeURIComponent(SITE))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.creative) render(slot, zone, d); })
      .catch(function () { /* slotul rămâne gol — zero layout shift, dimensiunea e rezervată de pagină */ });
  }

  function init() {
    var slots = document.querySelectorAll("[data-gro-ad]");
    for (var i = 0; i < slots.length; i++) load(slots[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
