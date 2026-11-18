/* =========================================================
   给「红军日记」版补上史料附页配图（不需要改 game.js）
   用法：放在 game.js 之后加载
   <script src="art.js"></script>
   ========================================================= */
(function () {
  'use strict';

  // 十二站配图，顺序与 game.js 里 HISTORY_CARDS 一致
  var IMAGES = [
    'assets/history/yudu-bridge.jpg',    // 01 于都河
    'assets/history/xiangjiang.jpg',     // 02 湘江
    'assets/history/zunyi.jpg',          // 03 遵义
    'assets/history/chishui.jpg',        // 04 赤水
    'assets/history/jinsha-river.jpg',   // 05 金沙江
    'assets/history/luding-bridge.jpg',  // 06 泸定桥
    'assets/history/snow-mountain.jpg',  // 07 夹金山
    'assets/history/grassland.jpg',      // 08 松草地
    'assets/history/mountain-pass.jpg',  // 09 腊子口
    'assets/history/wuqi-cave.jpg',      // 10 吴起镇
    'assets/history/huining.jpg',        // 11 会宁
    'assets/history/spark.jpg'           // 12 最后一页
  ];

  var STYLE = [
    '.source-card-art{position:relative;margin:-2px 0 12px;padding:6px 6px 5px;',
    'background:linear-gradient(178deg,#fdf6e6,#f4e6cc);border:1px solid rgba(92,66,38,.24);',
    'box-shadow:2px 5px 12px rgba(70,45,20,.16),inset 0 0 18px rgba(120,80,30,.05);',
    'transform:rotate(-.35deg);}',
    '.source-card-art[hidden]{display:none}',
    '.source-card-art::before{content:"";position:absolute;top:-7px;left:50%;width:52px;height:14px;',
    'transform:translateX(-50%) rotate(-2deg);background:rgba(213,193,154,.72);',
    'border:1px solid rgba(120,90,50,.1);box-shadow:0 1px 2px rgba(70,45,20,.08);}',
    '.source-card-art img{display:block;width:100%;height:auto;',
    'filter:sepia(.42) saturate(.62) contrast(1.05) brightness(1.02);}',
    '.source-card-art .art-cap{display:block;margin:5px 2px 0;',
    'font-family:var(--print,serif);font-size:8.5px;letter-spacing:.12em;color:rgba(92,66,38,.62);}',
    '@media(max-width:760px){.source-card-art{padding:5px 5px 4px;margin-bottom:10px}}'
  ].join('');

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  ready(function () {
    var card = document.getElementById('sourceCard');
    if (!card || document.getElementById('sourceCardArt')) return;

    var style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    var host = document.createElement('div');
    host.className = 'source-card-art';
    host.id = 'sourceCardArt';
    host.setAttribute('aria-hidden', 'true');
    host.hidden = true;
    card.insertBefore(host, card.firstChild);

    var kicker = document.getElementById('sourceCardKicker');

    // 预取十二张配图，翻到史料附页时不再出现半张空白
    function preload() {
      IMAGES.forEach(function (src) {
        var pre = new Image();
        pre.decoding = 'async';
        pre.src = src;
      });
    }
    if ('requestIdleCallback' in window) window.requestIdleCallback(preload, { timeout: 2500 });
    else window.setTimeout(preload, 1200);

    // 「史料附页 · 第 07 张 / 共 12 张」
    function currentIndex() {
      var text = (kicker && kicker.textContent) || '';
      var match = text.match(/第\s*(\d+)\s*张/);
      if (!match) return -1;
      var index = Number(match[1]) - 1;
      return index >= 0 && index < IMAGES.length ? index : -1;
    }

    function render() {
      var index = currentIndex();
      if (index < 0) { host.hidden = true; return; }
      var src = IMAGES[index];
      if (host.dataset.src !== src) {
        host.dataset.src = src;
        host.innerHTML = '<img src="' + src + '" alt="" decoding="async" loading="eager">';
        var img = host.firstChild;
        // 图片缺失时整块收起，不显示破图
        img.addEventListener('error', function () { host.hidden = true; });
        // 十二张里的最后一张换成「合上日记」的说明
        var cap = document.createElement('span');
        cap.className = 'art-cap';
        cap.textContent = (index === IMAGES.length - 1 ? '日记最后一页 · ' : '') + '史料附页 · 图 ' + (index + 1) + ' / 12';
        host.appendChild(cap);
      }
      host.hidden = false;
    }

    var observer = new MutationObserver(render);
    observer.observe(card, { attributes: true, attributeFilter: ['hidden', 'class'] });
    if (kicker) observer.observe(kicker, { childList: true, characterData: true, subtree: true });
    render();
  });
})();
