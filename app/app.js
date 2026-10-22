/* Sacred Home: launcher + ambient mode. Plain ES5 for Chromium 47. */
(function () {
  var CFG = window.SACRED_CONFIG, Geo = window.Geo;
  var TV_HOST = '127.0.0.1';                       // the TV talking to itself
  var KEYS = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESC: 27,
               RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406 };

  function $(id) { return document.getElementById(id); }

  /* ---------- fit the 1920x1080 stage to any window (TV is native 1080p) ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var st = $('stage'), x = (window.innerWidth - 1920 * s) / 2, y = (window.innerHeight - 1080 * s) / 2;
    st.style.webkitTransform = st.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }

  /* ---------- geometry ---------- */
  function buildMandala() {
    $('l-ring').innerHTML = Geo.svg(700, Geo.ornamentRing(318, 144, 0.2), 'draw');
    $('l-star').innerHTML = Geo.svg(700, Geo.starPolygon(292, 12, 5, 'geo', 1.6) + Geo.starPolygon(292, 8, 3, 'geo faint', 2.2), 'draw');
    $('l-metatron').innerHTML = Geo.svg(700, Geo.metatron(52, 1.0), 'draw');
    $('l-flower').innerHTML = Geo.svg(700, Geo.flowerOfLife(62, 2, 0.4), 'draw');
  }

  function framePath(w, h, c) {   // notched-corner frame
    return 'M' + c + ' 0 H' + (w - c) + ' L' + w + ' ' + c + ' V' + (h - c) + ' L' + (w - c) + ' ' + h +
      ' H' + c + ' L0 ' + (h - c) + ' V' + c + ' Z';
  }
  function frameSvg(w, h) {
    var c = h > 100 ? 18 : 12, p = 4;
    var beads = '<circle class="dot" cx="' + (w / 2) + '" cy="' + p + '" r="2.2"/><circle class="dot" cx="' + (w / 2) + '" cy="' + (h - p) + '" r="2.2"/>';
    return '<svg class="frame" width="' + w + '" height="' + h + '" viewBox="-2 -2 ' + (w + 4) + ' ' + (h + 4) + '">' +
      '<path class="geo" d="' + framePath(w, h, c) + '"/>' +
      '<path class="geo faint" transform="translate(' + p + ' ' + p + ')" d="' + framePath(w - 2 * p, h - 2 * p, c - 2) + '"/>' +
      beads + '</svg>';
  }
  function flourishSvg() {
    var w = 900, m = w / 2, s = '<svg width="' + w + '" height="22" viewBox="0 0 ' + w + ' 22">';
    s += '<line class="geo faint" x1="40" y1="11" x2="' + (m - 40) + '" y2="11"/><line class="geo faint" x1="' + (m + 40) + '" y1="11" x2="' + (w - 40) + '" y2="11"/>';
    s += '<path class="geo strong" d="M' + (m - 14) + ' 11 L' + m + ' 1 L' + (m + 14) + ' 11 L' + m + ' 21 Z"/>';
    s += '<circle class="geo" cx="' + (m - 28) + '" cy="11" r="5"/><circle class="geo" cx="' + (m + 28) + '" cy="11" r="5"/>';
    s += '<circle class="dot" cx="40" cy="11" r="2"/><circle class="dot" cx="' + (w - 40) + '" cy="11" r="2"/></svg>';
    return s;
  }

  /* ---------- tiles ---------- */
  var rows = [[], []], focus = { row: 0, col: 0 };

  function makeTile(item, rowIdx, i, small) {
    var el = document.createElement('div');
    el.className = 'tile';
    el.innerHTML = '<div class="glow"></div>' + (small ? frameSvg(150, 56) : frameSvg(190, 196)) +
      (small ? '' : '<div class="sig">' + Geo.svg(120, Geo.sigil(46, i)) + '</div>') +
      '<div class="label">' + item.name + '</div>';
    el.onclick = function () { focus = { row: rowIdx, col: i }; paintFocus(); activate(item); };
    rows[rowIdx].push({ el: el, item: item });
    return el;
  }

  function buildRows() {
    var i, a = $('row-apps'), b = $('row-inputs');
    for (i = 0; i < CFG.apps.length; i++) a.appendChild(makeTile(CFG.apps[i], 0, i, false));
    for (i = 0; i < CFG.inputs.length; i++) b.appendChild(makeTile(CFG.inputs[i], 1, i, true));
    document.querySelector('.flourish').innerHTML = flourishSvg();
  }

  function paintFocus() {
    var r, c;
    for (r = 0; r < rows.length; r++) for (c = 0; c < rows[r].length; c++) {
      rows[r][c].el.className = 'tile' + (r === focus.row && c === focus.col ? ' focus' : '');
    }
  }

  /* ---------- talking to the TV ---------- */
  function toast(msg) {
    var t = $('toast'); t.innerHTML = msg; t.className = 'show';
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.className = ''; }, 2200);
  }

  function launchApp(id, name) {
    toast('◇ ' + name + ' ◇');
    var url = 'http://' + TV_HOST + ':8001/api/v2/applications/' + id;
    if (window.fetch) { window.fetch(url, { method: 'POST', mode: 'no-cors' })['catch'](function () { toast('could not open ' + name); }); }
    else { var x = new XMLHttpRequest(); x.open('POST', url); x.send(); }
  }

  var ws = null, wsReady = false, wsQueue = [];
  function sendKey(key) {
    var msg = JSON.stringify({ method: 'ms.remote.control',
      params: { Cmd: 'Click', DataOfCmd: key, Option: 'false', TypeOfRemote: 'SendRemoteKey' } });
    if (ws && wsReady) return ws.send(msg);
    wsQueue.push(msg);
    if (ws) return;
    ws = new WebSocket('ws://' + TV_HOST + ':8001/api/v2/channels/samsung.remote.control?name=' + btoa('SacredHome'));
    ws.onmessage = function (e) {
      var d = {}; try { d = JSON.parse(e.data); } catch (err) {}
      if (d.event === 'ms.channel.connect') { wsReady = true; while (wsQueue.length) ws.send(wsQueue.shift()); }
    };
    ws.onclose = ws.onerror = function () { ws = null; wsReady = false; };
  }

  function activate(item) {
    if (item.action === 'ambient') return setAmbient(true);
    if (item.id) return launchApp(item.id, item.name);
    if (item.key) { toast('◇ ' + item.name + ' ◇'); sendKey(item.key); }
  }

  /* ---------- clock & greeting ---------- */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function tick() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), h12 = h % 12 || 12;
    $('time').innerHTML = h12 + ':' + (m < 10 ? '0' : '') + m;
    $('date').innerHTML = DAYS[d.getDay()] + ' · ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
    var part = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Good night';
    $('greeting').innerHTML = part + ', ' + CFG.name + '<small>as above, so below</small>';
  }

  /* ---------- ambient mode with slow burn-in drift ---------- */
  var ambient = false, idleTimer, driftTimer;
  function setAmbient(on) {
    ambient = on;
    $('stage').className = on ? 'ambient' : '';
    var m = $('mandala');
    clearInterval(driftTimer);
    if (on) {
      var drift = function () {
        var dx = Math.round((Math.random() - 0.5) * 140), dy = 150 + Math.round((Math.random() - 0.5) * 80);
        m.style.webkitTransform = m.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.25)';
      };
      drift(); driftTimer = setInterval(drift, 45000);
    } else {
      m.style.webkitTransform = m.style.transform = '';
    }
  }
  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { setAmbient(true); }, CFG.ambientAfterSeconds * 1000);
  }

  /* ---------- remote keys ---------- */
  function onKey(e) {
    var k = e.keyCode;
    resetIdle();
    if (ambient) { setAmbient(false); e.preventDefault(); return; }
    var row = rows[focus.row];
    switch (k) {
      case KEYS.LEFT:  focus.col = Math.max(0, focus.col - 1); break;
      case KEYS.RIGHT: focus.col = Math.min(row.length - 1, focus.col + 1); break;
      case KEYS.UP:
      case KEYS.DOWN: {
        var target = k === KEYS.UP ? 0 : 1;
        if (target !== focus.row) {   // keep roughly the same horizontal position
          var ratio = row.length > 1 ? focus.col / (row.length - 1) : 0;
          focus.row = target; focus.col = Math.round(ratio * (rows[target].length - 1));
        }
        break;
      }
      case KEYS.ENTER: activate(row[focus.col].item); break;
      case KEYS.YELLOW: case KEYS.BACK: case KEYS.ESC: setAmbient(true); break;
      case KEYS.BLUE: location.reload(); break;
      default: return;
    }
    e.preventDefault();
    paintFocus();
  }

  function registerTvKeys() {
    try {
      var names = ['ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'];
      for (var i = 0; i < names.length; i++) window.tizen.tvinputdevice.registerKey(names[i]);
    } catch (e) { /* not on a TV, or TizenBrew already registered them */ }
  }

  /* ---------- boot ---------- */
  fit(); window.onresize = fit;
  buildMandala(); buildRows(); paintFocus(); registerTvKeys();
  tick(); setInterval(tick, 10000);
  document.addEventListener('keydown', onKey);
  document.addEventListener('mousemove', resetIdle);
  resetIdle();
  if (/[?&]ambient/.test(location.search)) setAmbient(true);
})();
