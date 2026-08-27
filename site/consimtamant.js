/**
 * GAMES.ro — consimtamant.js · consimțământ analiză trafic (v1)
 * GA4 se încarcă EXCLUSIV după „Accept". Refuzul = zero scripturi de analiză.
 * Alegerea stă în localStorage (gro:consimtamant) și se poate reseta din /cookies.
 * Acesta e SINGURUL loc din site care are voie să atingă googletagmanager —
 * gate-ul fabricii interzice gtag/GA în orice fișier HTML tocmai ca să rămână așa.
 */
(function () {
  var CHEIE = "gro:consimtamant";
  var GA_ID = "G-KKT0VVWR18";

  function citeste() { try { return localStorage.getItem(CHEIE); } catch (e) { return null; } }
  function scrie(v) { try { localStorage.setItem(CHEIE, v); } catch (e) {} }

  function porniGA() {
    if (window.__groGA) return;
    window.__groGA = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  function arataBanner() {
    var b = document.createElement("div");
    b.id = "gro-consimtamant";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", "Consimțământ analiză trafic");
    b.style.cssText = "position:fixed;bottom:16px;left:16px;right:16px;max-width:520px;margin:0 auto;z-index:2147483000;background:#0a0e1c;color:#f2f4ff;border:1px solid rgba(0,229,255,.55);border-radius:12px;padding:16px 18px;font:14px/1.5 ui-sans-serif,system-ui,sans-serif;box-shadow:0 0 24px rgba(0,229,255,.25)";
    b.innerHTML =
      '<p style="margin:0 0 12px">Folosim <strong>Google Analytics</strong> doar ca să înțelegem traficul — și doar dacă accepți. Fără accept: zero cookie-uri de analiză. <a href="/cookies" style="color:#00e5ff">Detalii</a></p>' +
      '<div style="display:flex;gap:10px">' +
      '<button id="gro-accept" style="flex:1;padding:10px;border-radius:8px;border:1px solid #00e5ff;background:#00e5ff;color:#05060f;font-weight:700;font-size:14px;cursor:pointer">Accept</button>' +
      '<button id="gro-refuz" style="flex:1;padding:10px;border-radius:8px;border:1px solid #9aa3c0;background:transparent;color:#f2f4ff;font-weight:700;font-size:14px;cursor:pointer">Refuz</button>' +
      "</div>";
    document.body.appendChild(b);
    document.getElementById("gro-accept").onclick = function () { scrie("acceptat"); b.remove(); porniGA(); };
    document.getElementById("gro-refuz").onclick = function () { scrie("refuzat"); b.remove(); };
  }

  window.groConsimtamant = {
    stare: citeste,
    reseteaza: function () { try { localStorage.removeItem(CHEIE); } catch (e) {} location.reload(); }
  };

  function start() {
    var v = citeste();
    if (v === "acceptat") porniGA();
    else if (v !== "refuzat") arataBanner();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
