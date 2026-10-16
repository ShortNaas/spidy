!(function (w, d, n, h, l) {
  "use strict";
  if (n.doNotTrack === "1" || w.doNotTrack === "1") return;
  var s = d.currentScript;
  if (!s) return;
  var id = s.getAttribute("data-site");
  if (!id) return;
  var ep = s.getAttribute("data-endpoint") || (s.src ? s.src.replace(/\/s\.js(\?.*)?$/, "/api/e").replace(/\/a\.js(\?.*)?$/, "/api/collect") : "/api/collect");
  var prev = "";

  function track() {
    var p = l.pathname || "/";
    if (p === prev) return;
    prev = p;
    var r = "";
    try {
      if (d.referrer) {
        var u = new URL(d.referrer).hostname;
        if (u && u !== l.hostname) r = u;
      }
    } catch (_) {}

    var b = JSON.stringify({ site_id: id, path: p, referrer: r });
    if (n.sendBeacon) {
      n.sendBeacon(ep, b);
    } else {
      fetch(ep, {
        method: "POST",
        body: b,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(function () {});
    }
  }

  var ps = h.pushState;
  if (ps) {
    h.pushState = function () {
      ps.apply(this, arguments);
      track();
    };
    w.addEventListener("popstate", track);
  }

  if (d.readyState === "complete") track();
  else w.addEventListener("load", track);
})(window, document, navigator, history, location);
