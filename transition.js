/* =========================================================
   给「红军日记」版补上翻页转场（不需要改 game.js）
   用法：放在 game.js 之后加载（可与 art.js 并存）
   <script src="transition.js"></script>
   ========================================================= */
(function () {
  'use strict';

  // 十二页的标题与日期，顺序与 game.js 里 STAGES 一致
  var PAGES = [
    { name: '于都出发', date: '1934.10', place: '江西·于都', img: 'assets/history/yudu-bridge.jpg' },
    { name: '血战湘江', date: '1934.11', place: '广西·湘江', img: 'assets/history/xiangjiang.jpg' },
    { name: '遵义会议', date: '1935.01', place: '贵州·遵义', img: 'assets/history/zunyi.jpg' },
    { name: '四渡赤水', date: '1935.01—03', place: '川黔滇边', img: 'assets/history/chishui.jpg' },
    { name: '巧渡金沙江', date: '1935.05', place: '云南·皎平渡', img: 'assets/history/jinsha-river.jpg' },
    { name: '飞夺泸定桥', date: '1935.05', place: '四川·泸定', img: 'assets/history/luding-bridge.jpg' },
    { name: '翻越夹金山', date: '1935.06', place: '四川·宝兴', img: 'assets/history/snow-mountain.jpg' },
    { name: '穿越草地', date: '1935.08', place: '四川·松潘', img: 'assets/history/grassland.jpg' },
    { name: '突破腊子口', date: '1935.09', place: '甘肃·迭部', img: 'assets/history/mountain-pass.jpg' },
    { name: '吴起镇', date: '1935.10', place: '陕西·吴起', img: 'assets/history/wuqi-cave.jpg' },
    { name: '会宁会师', date: '1936.10', place: '甘肃·会宁', img: 'assets/history/huining.jpg' },
    { name: '星火相传', date: '1936.10.22', place: '甘肃·会宁', img: 'assets/history/spark.jpg' }
  ];

  var HOLD = 1150;      // 停留时长（毫秒）
  var FADE = 260;       // 淡出时长

  var STYLE = [
    '.page-transition{position:fixed;inset:0;z-index:130;display:grid;place-items:center;overflow:hidden;',
    'background:#1a110a;opacity:0;transition:opacity .24s ease;pointer-events:auto;cursor:pointer}',
    '.page-transition[hidden]{display:none}',
    '.page-transition.is-open{opacity:1}',
    '.pt-glow{position:absolute;inset:0;pointer-events:none;',
    'background:radial-gradient(ellipse 60% 46% at 50% 34%,rgba(255,196,128,.1),transparent 70%),',
    'radial-gradient(ellipse 70% 60% at 50% 100%,rgba(0,0,0,.55),transparent 70%)}',
    '.pt-inner{position:relative;display:flex;flex-direction:column;align-items:center;',
    'gap:14px;padding:20px;transform:translateY(8px);opacity:0;',
    'transition:opacity .34s ease .04s,transform .48s cubic-bezier(.2,.7,.3,1) .04s}',
    '.page-transition.is-open .pt-inner{opacity:1;transform:none}',
    '.pt-kicker{margin:0;display:flex;align-items:center;gap:10px;font-family:var(--print,serif);',
    'font-size:10px;letter-spacing:.28em;color:#b9965f}',
    '.pt-kicker i{display:block;width:26px;height:1px;background:linear-gradient(90deg,transparent,#b9965f)}',
    '.pt-kicker b{font-weight:400;letter-spacing:.12em;color:#e8c485}',
    '.pt-plate{position:relative;margin:0;padding:8px;background:linear-gradient(178deg,#f7ecd6,#ead8b6);',
    'border:1px solid rgba(92,66,38,.3);box-shadow:0 24px 60px rgba(0,0,0,.55),0 2px 0 rgba(255,245,225,.06)}',
    'transform:rotate(-.4deg)}',
    '.pt-plate img{display:block;width:min(74vw,640px);height:auto;',
    'filter:sepia(.4) saturate(.66) contrast(1.04) brightness(1.02)}',
    '.pt-plate::before{content:"";position:absolute;top:-10px;left:50%;width:70px;height:18px;',
    'transform:translateX(-50%) rotate(-2deg);background:rgba(213,193,154,.78);',
    'border:1px solid rgba(120,90,50,.12);box-shadow:0 2px 4px rgba(50,30,10,.2)}',
    '.pt-name{margin:2px 0 0;font-family:var(--hand,"STXingkai",serif);font-weight:400;',
    'font-size:clamp(30px,4.6vw,52px);letter-spacing:.1em;color:#f4e3c2;text-shadow:0 2px 26px rgba(0,0,0,.6)}',
    '.pt-meta{margin:0;font-family:var(--print,serif);font-size:11.5px;letter-spacing:.16em;color:#c3ab84}',
    '.pt-line{width:min(260px,54vw);height:2px;margin-top:6px;background:rgba(232,196,133,.18);overflow:hidden}',
    '.pt-line i{display:block;height:100%;background:linear-gradient(90deg,#b42d20,#e8c485);',
    'transform:scaleX(0);transform-origin:0 50%}',
    '@media(max-width:760px){.pt-plate img{width:86vw}.pt-name{font-size:30px}.pt-inner{gap:10px}}',
    '@media(prefers-reduced-motion:reduce){.page-transition,.pt-inner{transition:none}.pt-inner{transform:none}}'
  ].join('');

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  ready(function () {
    var hudNo = document.getElementById('hudStationNo');
    var gameScreen = document.getElementById('gameScreen');
    if (!hudNo || document.getElementById('pageTransition')) return;

    var style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'page-transition';
    wrap.id = 'pageTransition';
    wrap.hidden = true;
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<div class="pt-glow"></div>' +
      '<div class="pt-inner">' +
        '<p class="pt-kicker">翻到下一页 <i></i> 第 <b data-pt="no">02</b> 页</p>' +
        '<figure class="pt-plate"><img alt="" decoding="async"></figure>' +
        '<h2 class="pt-name"></h2>' +
        '<p class="pt-meta"></p>' +
        '<div class="pt-line"><i></i></div>' +
      '</div>';
    document.body.appendChild(wrap);

    var plateImg = wrap.querySelector('.pt-plate img');
    var nameEl = wrap.querySelector('.pt-name');
    var metaEl = wrap.querySelector('.pt-meta');
    var noEl = wrap.querySelector('[data-pt="no"]');
    var barEl = wrap.querySelector('.pt-line i');

    var timer = 0;
    var lastPage = null;
    var open = false;

    function close() {
      if (!open) return;
      open = false;
      window.clearTimeout(timer);
      wrap.classList.remove('is-open');
      window.setTimeout(function () {
        if (!wrap.classList.contains('is-open')) wrap.hidden = true;
      }, FADE);
    }

    // 翻到第 n 页（n 从 1 开始）
    function play(pageNo) {
      var page = PAGES[pageNo - 1];
      if (!page) return;
      noEl.textContent = ('0' + pageNo).slice(-2);
      nameEl.textContent = page.name;
      metaEl.textContent = page.date + ' · ' + page.place;
      if (plateImg.getAttribute('src') !== page.img) plateImg.setAttribute('src', page.img);
      wrap.hidden = false;
      void wrap.offsetWidth;
      wrap.classList.add('is-open');
      open = true;
      barEl.style.transition = 'none';
      barEl.style.transform = 'scaleX(0)';
      // 强制重排后再启动进度条，避免被合并掉
      void barEl.offsetWidth;
      barEl.style.transition = 'transform ' + HOLD + 'ms linear';
      barEl.style.transform = 'scaleX(1)';
      window.clearTimeout(timer);
      timer = window.setTimeout(close, HOLD);
    }

    wrap.addEventListener('click', close);
    document.addEventListener('keydown', function (event) {
      if (!open) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') close();
    }, true);

    // 题目页每翻一页，都会改写 #hudStationNo
    var observer = new MutationObserver(function () {
      if (!gameScreen || gameScreen.hidden) { lastPage = null; return; }
      var pageNo = parseInt(hudNo.textContent, 10);
      if (!pageNo) return;
      if (lastPage === null) { lastPage = pageNo; return; }   // 开局第一页不播
      if (pageNo === lastPage) return;
      var forward = pageNo > lastPage;
      lastPage = pageNo;
      if (forward) play(pageNo);
    });
    observer.observe(hudNo, { childList: true, characterData: true, subtree: true });

    // 重新开始/回到首页时复位，避免下一局第一页误播
    if (gameScreen) {
      new MutationObserver(function () {
        if (gameScreen.hidden) lastPage = null;
      }).observe(gameScreen, { attributes: true, attributeFilter: ['hidden'] });
    }
  });
})();
