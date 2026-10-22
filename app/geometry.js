/* Sacred geometry SVG builders. Plain ES5 so it runs on the 2017 TV (Chromium 47).
 * Every builder returns SVG markup centered on (0,0); wrap it with svg(size, inner).
 * Strokes get a dasharray equal to their length so CSS can "draw them in". */
(function (global) {
  var TAU = Math.PI * 2;

  function n(v) { return Math.round(v * 100) / 100; }

  function drawStyle(len, delay) {
    return ' style="stroke-dasharray:' + n(len) + ';stroke-dashoffset:' + n(len) +
      ';-webkit-animation-delay:' + n(delay) + 's;animation-delay:' + n(delay) + 's"';
  }

  function circle(cx, cy, r, cls, delay) {
    return '<circle class="' + (cls || '') + '" cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"' +
      (delay === undefined ? '' : drawStyle(TAU * r, delay)) + '/>';
  }

  function line(x1, y1, x2, y2, cls, delay) {
    var len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    return '<line class="' + (cls || '') + '" x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '"' +
      (delay === undefined ? '' : drawStyle(len, delay)) + '/>';
  }

  function polar(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }

  /* Flower of Life: hex lattice of circles of radius r out to `rings`, plus a bounding circle. */
  function flowerOfLife(r, rings, delay) {
    var out = '', i = 0, q, s, x, y, d;
    for (q = -rings; q <= rings; q++) {
      for (s = -rings; s <= rings; s++) {
        if (Math.abs(q + s) > rings) continue;
        x = r * (q + s / 2);
        y = r * (s * Math.sqrt(3) / 2);
        d = Math.sqrt(x * x + y * y);
        out += circle(x, y, r, 'geo', delay + d / r * 0.35 + (i++ % 3) * 0.05);
      }
    }
    out += circle(0, 0, r * (rings + 1), 'geo strong', delay + 1.2);
    return out;
  }

  /* Metatron's Cube: 13 Fruit-of-Life centers, every pair joined. */
  function metatron(u, delay) {
    var pts = [[0, 0]], k, a, i, j, out = '', c = 0;
    for (k = 0; k < 6; k++) {
      a = k * TAU / 6 - Math.PI / 2;
      pts.push(polar(2 * u, a));
      pts.push(polar(4 * u, a));
    }
    for (i = 0; i < pts.length; i++) {
      for (j = i + 1; j < pts.length; j++) {
        out += line(pts[i][0], pts[i][1], pts[j][0], pts[j][1], 'geo faint', delay + (c++ % 26) * 0.06);
      }
    }
    for (i = 0; i < pts.length; i++) out += circle(pts[i][0], pts[i][1], u, 'geo faint', delay + 0.8 + i * 0.05);
    return out;
  }

  /* Ornamental ring: main circle, inner hairline, ticks (every 6th long) and bead dots. */
  function ornamentRing(r, ticks, delay) {
    var out = circle(0, 0, r, 'geo strong', delay) + circle(0, 0, r - 14, 'geo faint', delay + 0.3), k, a, p1, p2, len;
    for (k = 0; k < ticks; k++) {
      a = k * TAU / ticks;
      len = k % 6 === 0 ? 22 : 9;
      p1 = polar(r + 4, a);
      p2 = polar(r + 4 + len, a);
      out += line(p1[0], p1[1], p2[0], p2[1], k % 6 === 0 ? 'geo strong' : 'geo', delay + 0.6 + k * 0.012);
      if (k % 6 === 3) {
        p1 = polar(r - 26, a);
        out += '<circle class="dot" cx="' + n(p1[0]) + '" cy="' + n(p1[1]) + '" r="2.4"/>';
      }
    }
    return out;
  }

  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  /* Star polygon {p/q}: the sigil used for app tiles and as an outer ornament.
   * When p and q share a factor (e.g. {6/2}) it is a compound figure, so draw each rotated loop. */
  function starPolygon(r, p, q, cls, delay) {
    var loops = gcd(p, q), m = p / loops, out = '', L, k, a, d, len, prev, pt;
    for (L = 0; L < loops; L++) {
      d = 'M'; len = 0; prev = null;
      for (k = 0; k <= m; k++) {
        a = (L + k * q) % p * TAU / p - Math.PI / 2;
        pt = polar(r, a);
        d += (k ? ' L' : '') + n(pt[0]) + ' ' + n(pt[1]);
        if (prev) len += Math.sqrt(Math.pow(pt[0] - prev[0], 2) + Math.pow(pt[1] - prev[1], 2));
        prev = pt;
      }
      out += '<path class="' + (cls || 'geo') + '" d="' + d + '"' + (delay === undefined ? '' : drawStyle(len, delay + L * 0.2)) + '/>';
    }
    return out;
  }

  /* Small ornament for tiles: star + two concentric rings + 4 cardinal beads. */
  var SIGILS = [[5, 2], [6, 2], [7, 3], [8, 3], [9, 4], [10, 3], [12, 5], [7, 2], [9, 2], [12, 4]];
  function sigil(r, seed) {
    var p = SIGILS[seed % SIGILS.length][0], q = SIGILS[seed % SIGILS.length][1];
    var out = circle(0, 0, r, 'geo') + circle(0, 0, r * 0.62, 'geo faint') + starPolygon(r * 0.92, p, q, 'geo strong'), k, b;
    for (k = 0; k < 4; k++) {
      b = polar(r + 7, k * TAU / 4);
      out += '<circle class="dot" cx="' + n(b[0]) + '" cy="' + n(b[1]) + '" r="2"/>';
    }
    return out;
  }

  function svg(size, inner, cls) {
    var h = size / 2;
    return '<svg class="' + (cls || '') + '" xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
      '" viewBox="' + (-h) + ' ' + (-h) + ' ' + size + ' ' + size + '">' + inner + '</svg>';
  }

  global.Geo = {
    svg: svg, circle: circle, line: line, flowerOfLife: flowerOfLife, metatron: metatron,
    ornamentRing: ornamentRing, starPolygon: starPolygon, sigil: sigil
  };
})(window);
