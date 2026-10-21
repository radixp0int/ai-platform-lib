/* Shared assistant avatars. Avatars.svg(id, {size, state}) returns markup.
   Colours come from CSS custom properties on any ancestor:
   --av-brand, --av-warm, --av-ink (glyph colour on brand), --av-marble, --av-shade, --av-deep */
(function () {
  var uid = 0;

  // Archimedean spiral from the outer edge inward, as an SVG path.
  function spiral(cx, cy, r0, r1, turns, start, dir) {
    var steps = Math.round(turns * 48), d = '';
    for (var k = 0; k <= steps; k++) {
      var t = k / steps, a = start + dir * t * turns * Math.PI * 2, r = r0 + (r1 - r0) * t;
      d += (k ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2);
    }
    return d;
  }

  var UP = -Math.PI / 2;
  var VOLUTE_L = spiral(15, 22.5, 6.2, 3.1, 1.2, UP, -1);
  var VOLUTE_R = spiral(33, 22.5, 6.2, 3.1, 1.2, UP, 1);

  var BEADS = (function () {
    var s = '';
    for (var k = 0; k < 30; k++) {
      var a = (k / 30) * Math.PI * 2;
      s += '<circle cx="' + (24 + 20.6 * Math.cos(a)).toFixed(2) + '" cy="' + (24 + 20.6 * Math.sin(a)).toFixed(2) + '" r=".95"/>';
    }
    return s;
  })();

  // Marble bust parts, shared by the bust and its variants.
  function bustBody() {
    return '<path class="av-m" d="M7 48 C8.5 41.5 14 38.2 24 38.2 C34 38.2 39.5 41.5 41 48 Z"/>' +
      '<path class="av-w" d="M10.5 48 C13 42.4 19 39.6 27 40.4 C31.5 40.9 35 42.6 37.5 44.6 L36 48 Z"/>';
  }
  function bustHead() {
    return '<g class="av-head">' +
      '<g class="av-s"><circle cx="15.2" cy="16.4" r="3.6"/><circle cx="18" cy="12.4" r="3.8"/><circle cx="22.4" cy="10.4" r="3.9"/><circle cx="27" cy="10.6" r="3.8"/><circle cx="31" cy="12.8" r="3.6"/><circle cx="33" cy="16.8" r="3.2"/></g>' +
      '<ellipse class="av-m" cx="24" cy="22.6" rx="9.6" ry="10.6"/>' +
      '<g class="av-brows av-sd" stroke-width="1.5"><path d="M18.6 17.4 Q20.6 16.2 22.4 17.2"/><path d="M25.6 17.2 Q27.4 16.2 29.4 17.4"/></g>' +
      '<g class="av-eyes"><rect class="av-d" x="19.3" y="19" width="2.6" height="4" rx="1.3"/><rect class="av-d" x="26.1" y="19" width="2.6" height="4" rx="1.3"/></g>' +
      '<g class="av-jaw"><g class="av-s"><circle cx="15.6" cy="27" r="3.4"/><circle cx="16.8" cy="31.4" r="3.7"/><circle cx="19.6" cy="35" r="3.9"/><circle cx="24" cy="36.4" r="4.1"/><circle cx="28.4" cy="35" r="3.9"/><circle cx="31.2" cy="31.4" r="3.7"/><circle cx="32.4" cy="27" r="3.4"/></g>' +
      bustMouth() + '</g>' +
      '</g>';
  }
  function bustMouth() {
    return '<path class="av-m" d="M18.6 28.4 Q24 25.6 29.4 28.4 Q29 33 24 33.4 Q19 33 18.6 28.4 Z"/>' +
      '<path class="av-s" d="M18.4 28.2 Q21 26.1 24 27.3 Q27 26.1 29.6 28.2 Q27.3 29.3 24 28.6 Q20.7 29.3 18.4 28.2 Z"/>' +
      '<path class="av-mouth av-sd" d="M21.2 30.6 Q24 32.6 26.8 30.6" stroke-width="1.6"/>';
  }

  // Curls drawn as small volutes: [cx, cy, r, spiral direction]
  var HAIR_CURLS = [[14.6, 17.6, 4.2, -1], [17.8, 11.8, 4.4, -1], [24, 9.2, 4.6, 1], [30.2, 11.8, 4.4, 1], [33.4, 17.6, 4.2, 1]];
  var BEARD_CURLS = [[15.4, 27.8, 4.2, -1], [17.6, 33.4, 4.4, -1], [24, 36.2, 4.6, 1], [30.4, 33.4, 4.4, 1], [32.6, 27.8, 4.2, 1]];
  function curls(list, delay0) {
    return list.map(function (c, k) {
      return '<circle class="av-s" cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>' +
        '<path class="av-sb av-wind" pathLength="100" style="animation-delay:' + (delay0 + k * 0.12).toFixed(2) + 's" d="' +
        spiral(c[0], c[1], c[2] - 1.1, 0.5, 1.5, UP, c[3]) + '" stroke-width="1.15" opacity=".6"/>';
    }).join('');
  }


  var DRAW = {
    face: function () {
      return '<rect class="av-b" width="48" height="48" rx="16"/>' +
        '<g class="av-eyes"><rect class="av-i" x="15" y="14" width="5" height="10" rx="2.5"/><rect class="av-i" x="28" y="14" width="5" height="10" rx="2.5"/></g>' +
        '<path class="av-mouth av-si" d="M16.5 30.5 Q24 37 31.5 30.5" stroke-width="3.2"/>';
    },

    beard: function () {
      return '<rect class="av-b" width="48" height="48" rx="16"/>' +
        '<g class="av-eyes"><rect class="av-i" x="15" y="12" width="5" height="9" rx="2.5"/><rect class="av-i" x="28" y="12" width="5" height="9" rx="2.5"/></g>' +
        '<g class="av-jaw"><g class="av-i">' +
        '<path d="M9 21.5 C9 26 10.5 27.4 14 27.4 C18 27.4 20.4 26.6 22 25.4 C23.2 24.5 24.8 24.5 26 25.4 C27.6 26.6 30 27.4 34 27.4 C37.5 27.4 39 26 39 21.5 V34 H9 Z"/>' +
        '<circle class="av-curl" cx="13.6" cy="33.4" r="4.8"/><circle class="av-curl" cx="18.6" cy="37.6" r="5"/><circle class="av-curl" cx="24" cy="39.4" r="5.2"/><circle class="av-curl" cx="29.4" cy="37.6" r="5"/><circle class="av-curl" cx="34.4" cy="33.4" r="4.8"/>' +
        '</g><path class="av-mouth av-sb" d="M19 31 Q24 35.2 29 31" stroke-width="2.8"/></g>';
    },

    ionic: function (o) {
      return '<rect class="av-b" width="48" height="48" rx="16"/>' +
        '<g class="av-flutes av-si" stroke-width="1.7" opacity=".4"><path d="M18 39.5V48M22 40V48M26 40V48M30 39.5V48"/></g>' +
        '<rect class="av-i" x="8" y="10.5" width="32" height="3.6" rx="1.8"/>' +
        '<path class="av-si" d="M15 16.5H33" stroke-width="2.6"/>' +
        '<g class="av-volute av-volute-l"><path class="av-si av-wind" pathLength="100" d="' + VOLUTE_L + '" stroke-width="2.6"/></g>' +
        '<g class="av-volute av-volute-r"><path class="av-si av-wind" pathLength="100" d="' + VOLUTE_R + '" stroke-width="2.6"/></g>' +
        '<g class="av-eyes"><circle class="av-i" cx="15" cy="22.5" r="1.9"/><circle class="av-i" cx="33" cy="22.5" r="1.9"/></g>' +
        '<path class="av-mouth av-si" d="M17 31 Q24 37 31 31" stroke-width="3"/>';
    },

    bust: function () {
      var id = 'avb' + (++uid);
      return '<defs><clipPath id="' + id + '"><rect width="48" height="48" rx="16"/></clipPath></defs>' +
        '<rect class="av-b" width="48" height="48" rx="16"/>' +
        '<g class="av-body" clip-path="url(#' + id + ')">' + bustBody() + '</g>' +
        bustHead();
    },

    // Bust variant: hair and beard curls are Ionic volutes.
    curls: function () {
      var id = 'avb' + (++uid);
      return '<defs><clipPath id="' + id + '"><rect width="48" height="48" rx="16"/></clipPath></defs>' +
        '<rect class="av-b" width="48" height="48" rx="16"/>' +
        '<g class="av-body" clip-path="url(#' + id + ')">' + bustBody() + '</g>' +
        '<g class="av-head">' + curls(HAIR_CURLS, 0) +
        '<ellipse class="av-m" cx="24" cy="22.8" rx="9.4" ry="10.4"/>' +
        '<g class="av-brows av-sd" stroke-width="1.5"><path d="M18.6 17.6 Q20.6 16.4 22.4 17.4"/><path d="M25.6 17.4 Q27.4 16.4 29.4 17.6"/></g>' +
        '<g class="av-eyes"><rect class="av-d" x="19.3" y="19.2" width="2.6" height="4" rx="1.3"/><rect class="av-d" x="26.1" y="19.2" width="2.6" height="4" rx="1.3"/></g>' +
        '<g class="av-jaw">' + curls(BEARD_CURLS, 0.6) + bustMouth() + '</g>' +
        '</g>';
    },

    // Bust variant: the portrait struck on a coin with a beaded rim.
    coinbust: function () {
      var id = 'avk' + (++uid);
      return '<defs><clipPath id="' + id + '"><circle cx="24" cy="24" r="18.6"/></clipPath></defs>' +
        '<g class="av-coin">' +
        '<circle class="av-b" cx="24" cy="24" r="23"/>' +
        '<g class="av-beads av-i" opacity=".7">' + BEADS + '</g>' +
        '<circle class="av-si" cx="24" cy="24" r="18.7" stroke-width=".8" opacity=".35"/>' +
        '<g clip-path="url(#' + id + ')"><g transform="translate(24 26.2) scale(.8) translate(-24 -26)">' + bustBody() + bustHead() + '</g></g>' +
        '</g>';
    },

    drachma: function (o) {
      var id = 'avc' + (++uid);
      return '<defs><clipPath id="' + id + '"><circle cx="24" cy="24" r="23"/></clipPath>' +
        '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
        '<g class="av-coin">' +
        '<circle class="av-b" cx="24" cy="24" r="23"/>' +
        '<g class="av-beads av-i" opacity=".7">' + BEADS + '</g>' +
        '<g class="av-profile" transform="translate(22.4 24.4) scale(.9) translate(-24 -24)">' +
        '<path class="av-i" d="M20.6 37.6 L19.4 32.6 C15.2 31.4 12.6 27.6 12.6 22.6 C12.6 15.6 17.4 11.4 23.4 11.4 C28.6 11.4 31.6 14.6 32 18.8 L35.2 23.6 C35.5 24.1 35.2 24.6 34.6 24.6 L32.6 24.8 L32.8 27.2 C34 28.6 33.6 31.2 32.2 32.4 C31.6 35.2 28.6 37.4 25.6 37.4 C24.2 38.6 22 38.8 20.6 37.6 Z"/>' +
        '<g class="av-s2" opacity="1"><circle cx="14.6" cy="18.2" r="3.1"/><circle cx="14" cy="23.6" r="3.1"/><circle cx="17.6" cy="13.8" r="3.1"/><circle cx="22.6" cy="12" r="3"/><circle cx="16" cy="28.4" r="2.9"/></g>' +
        '<g class="av-sb" stroke-width="1.1" opacity=".6"><path d="M15.6 17 a1.4 1.4 0 1 0 .4 2.4"/><path d="M15 22.4 a1.4 1.4 0 1 0 .4 2.4"/><path d="M18.6 12.6 a1.4 1.4 0 1 0 .4 2.4"/><path d="M23.4 10.9 a1.3 1.3 0 1 0 .4 2.2"/><path d="M17 27.2 a1.3 1.3 0 1 0 .4 2.2"/></g>' +
        '<path class="av-sb" d="M27.4 13.4 C24.6 15.4 22.2 18.6 21 22.4" stroke-width="1.3" opacity=".55"/>' +
        '<path class="av-sb" d="M22.4 23.2 C20.6 22.6 19.6 24.6 20.6 26 C21.2 26.9 22.4 26.8 22.8 26" stroke-width="1.3"/>' +
        '<g class="av-eyes"><path class="av-sb" d="M27.2 20.6 Q28.7 18.9 30.2 20.4" stroke-width="1.6"/></g>' +
        '<path class="av-sb" d="M26.6 17.6 Q28.6 16.4 30.8 17.4" stroke-width="1.2" opacity=".7"/>' +
        '<g class="av-jaw"><path class="av-mouth av-sb" d="M29.6 28.2 Q31 29.2 32.4 28.2" stroke-width="1.5"/>' +
        '<path class="av-sb" d="M26 31.4 q1.6 1.4 3.2 0 M23.2 34.4 q1.6 1.4 3.2 0" stroke-width="1.2" opacity=".55"/></g>' +
        '</g>' +
        '<g clip-path="url(#' + id + ')"><rect class="av-glint" x="-30" y="-6" width="16" height="60" fill="url(#' + id + 'g)" transform="rotate(20 24 24)"/></g>' +
        '</g>';
    }
  };

  var CSS = [
    '.av{display:block;overflow:visible;flex-shrink:0}',
    '.av *{transform-box:view-box}',
    '.av-b{fill:var(--av-brand,#004c97)}.av-w{fill:var(--av-warm,#ef6a00)}.av-i{fill:var(--av-ink,#fff)}',
    '.av-m{fill:var(--av-marble,#f3f6f9)}.av-s{fill:var(--av-shade,#c5d1dd)}.av-d{fill:var(--av-deep,#12202e)}',
    '.av-s2{fill:var(--av-ink,#fff)}',
    '.av-si,.av-sb,.av-sd{fill:none;stroke-linecap:round;stroke-linejoin:round}',
    '.av-si{stroke:var(--av-ink,#fff)}.av-sb{stroke:var(--av-brand,#004c97)}.av-sd{stroke:var(--av-deep,#12202e)}',
    /* shared: blink while idle or thinking */
    '.av .av-eyes{transform-origin:24px 18px}',
    '.av.idle .av-eyes,.av.think .av-eyes{animation:av-blink 3.8s ease-in-out infinite}',
    '@keyframes av-blink{0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(.12)}}',
    '.av.talk{animation:av-bob 1.8s ease-in-out infinite}',
    '@keyframes av-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}',
    '.av .av-mouth{transform-origin:24px 32px}',
    '@keyframes av-talk{0%,100%{transform:scale(1,1)}20%{transform:scale(.9,1.9)}45%{transform:scale(1,1.15)}65%{transform:scale(.94,1.65)}85%{transform:scale(1,1.25)}}',
    /* face */
    '.av-face.talk .av-mouth{animation:av-talk .9s ease-in-out infinite}',
    '.av-face.think{animation:av-drift 3s ease-in-out infinite}',
    '@keyframes av-drift{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3px) rotate(5deg)}}',
    /* beard: the whole jaw moves when talking, curls ripple while thinking */
    '.av-beard .av-eyes{transform-origin:24px 16.5px}',
    '.av-beard.talk .av-jaw{animation:av-jaw .45s ease-in-out infinite alternate}',
    '.av-beard.talk .av-mouth{transform-origin:24px 32px;animation:av-talk .9s ease-in-out infinite}',
    '@keyframes av-jaw{from{transform:translateY(0)}to{transform:translateY(1.3px)}}',
    '.av-beard.think .av-eyes{animation:av-blink 3.8s ease-in-out infinite,av-glance 3s ease-in-out infinite}',
    '.av-beard .av-curl{transform-origin:center;transform-box:fill-box}',
    '.av-beard.think .av-curl{animation:av-curl 1.5s ease-in-out infinite}',
    '.av-beard.think .av-curl:nth-of-type(2){animation-delay:.15s}.av-beard.think .av-curl:nth-of-type(3){animation-delay:.3s}.av-beard.think .av-curl:nth-of-type(4){animation-delay:.45s}.av-beard.think .av-curl:nth-of-type(5){animation-delay:.6s}',
    '@keyframes av-curl{0%,60%,100%{transform:scale(1)}30%{transform:scale(1.12)}}',
    '@keyframes av-glance{0%,100%{translate:0 0}40%,70%{translate:-1.6px -1.2px}}',
    /* ionic: the volute eyes rewind while thinking */
    '.av-ionic .av-eyes{transform-origin:24px 22.5px}',
    '.av-ionic.idle .av-eyes,.av-ionic.think .av-eyes{animation:av-blink-i 4.2s ease-in-out infinite}',
    '@keyframes av-blink-i{0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(.1)}}',
    '.av-ionic .av-wind{stroke-dasharray:100 100}',
    '.av-ionic.think .av-wind{animation:av-wind 2.2s cubic-bezier(.6,0,.3,1) infinite}',
    '@keyframes av-wind{0%{stroke-dashoffset:0}45%{stroke-dashoffset:-100}45.01%{stroke-dashoffset:100}100%{stroke-dashoffset:0}}',
    '.av-ionic.talk .av-mouth{animation:av-talk .9s ease-in-out infinite}',
    '.av-ionic.talk .av-volute-l,.av-ionic.talk .av-volute-r{animation:av-lift .9s ease-in-out infinite}',
    '@keyframes av-lift{0%,100%{transform:translateY(0)}35%{transform:translateY(-.8px)}}',
    /* bust: a nod while talking, a head tilt and raised brows while thinking */
    '.av-bust .av-eyes{transform-origin:24px 21px}',
    '.av-bust .av-head{transform-origin:24px 38px}',
    '.av-bust.talk{animation:none}',
    '.av-bust.talk .av-head{animation:av-nod 1.6s ease-in-out infinite}',
    '.av-bust.talk .av-mouth{transform-origin:24px 31px;animation:av-talk .9s ease-in-out infinite}',
    '@keyframes av-nod{0%,100%{transform:rotate(0)}30%{transform:rotate(-2deg) translateY(.4px)}65%{transform:rotate(1.5deg)}}',
    '.av-bust.think .av-head{animation:av-tilt 3.2s ease-in-out infinite}',
    '.av-bust.think .av-brows{animation:av-brow 3.2s ease-in-out infinite}',
    '.av-bust.think .av-eyes{animation:av-blink 3.8s ease-in-out infinite,av-glance-r 3.2s ease-in-out infinite}',
    '@keyframes av-tilt{0%,100%{transform:rotate(0)}40%,75%{transform:rotate(6deg)}}',
    '@keyframes av-brow{0%,100%{transform:translateY(0)}40%,75%{transform:translateY(-1.3px)}}',
    '@keyframes av-glance-r{0%,100%{translate:0 0}40%,75%{translate:1.2px -1.2px}}',
    /* drachma: a glint at rest, a spin while thinking */
    '.av-drachma .av-eyes{transform-origin:28.7px 20px}',
    '.av-drachma .av-coin{transform-origin:24px 24px}',
    '.av-drachma .av-glint{animation:av-glint 7s ease-in-out infinite}',
    '@keyframes av-glint{0%,78%{transform:rotate(20deg) translateX(0)}96%,100%{transform:rotate(20deg) translateX(74px)}}',
    '.av-drachma.think .av-coin{animation:av-spin 1.8s cubic-bezier(.45,0,.55,1) infinite}',
    '@keyframes av-spin{0%{transform:scaleX(1)}25%{transform:scaleX(.08)}50%{transform:scaleX(-1)}75%{transform:scaleX(.08)}100%{transform:scaleX(1)}}',
    '.av-drachma.talk .av-mouth{transform-origin:31px 28.6px;animation:av-talk .9s ease-in-out infinite}',
    '.av-drachma.talk .av-jaw{transform-origin:22px 25px;animation:av-chin .45s ease-in-out infinite alternate}',
    '@keyframes av-chin{from{transform:rotate(0)}to{transform:rotate(2.5deg)}}',
    /* bust variants share the bust's moves; these add their own */
    '.av-curls .av-wind{stroke-dasharray:100 100}',
    '.av-curls.think .av-wind{animation:av-wind 2.6s cubic-bezier(.6,0,.3,1) infinite}',
    /* done: a little hop and a happy squint, once */
    '.av.done{animation:av-done .8s cubic-bezier(.3,1.5,.5,1) 1}',
    '.av.done .av-eyes{animation:av-squint .9s ease-out 1}',
    '@keyframes av-done{0%{transform:scale(1)}35%{transform:scale(1.1) translateY(-2px)}100%{transform:scale(1)}}',
    '@keyframes av-squint{0%,100%{transform:scaleY(1)}30%,75%{transform:scaleY(.4)}}',
    /* error: a small head shake, once */
    '.av.error{animation:av-shake .6s ease-in-out 1}',
    '@keyframes av-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-2px)}40%,80%{transform:translateX(2px)}}',
    '@media (prefers-reduced-motion: reduce){.av,.av *{animation:none!important}}'
  ].join('\n');

  var EXTRA = { curls: 'av-bust', coinbust: 'av-bust' };

  function injectCss() {
    if (document.getElementById('av-css')) return;
    var s = document.createElement('style');
    s.id = 'av-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  window.Avatars = {
    list: [
      { id: 'face', name: 'Current face', short: 'Face' },
      { id: 'beard', name: 'Bearded face', short: 'Beard' },
      { id: 'ionic', name: 'Ionic capital', short: 'Ionic' },
      { id: 'bust', name: 'Marble bust', short: 'Bust' },
      { id: 'drachma', name: 'Drachma', short: 'Drachma' },
      { id: 'curls', name: 'Volute curls', short: 'Volutes', base: 'bust' },
      { id: 'coinbust', name: 'Coin portrait', short: 'Coin', base: 'bust' }
    ],
    svg: function (id, o) {
      o = o || {};
      injectCss();
      var size = o.size || 48;
      return '<svg class="av av-' + id + ' ' + (EXTRA[id] ? EXTRA[id] + ' ' : '') + (o.state || 'idle') + '" width="' + size + '" height="' + size + '" viewBox="0 0 48 48" aria-hidden="true">' + DRAW[id](o) + '</svg>';
    },
    setState: function (el, state) {
      el.classList.remove('idle', 'talk', 'think', 'done', 'error');
      el.classList.add(state);
    }
  };
})();
