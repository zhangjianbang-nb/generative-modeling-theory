/* 概率演化与生成动力学 · 站点逻辑（懒加载每章 chunk） */
(function () {
  'use strict';

  var CORE = window.__CORE || { parts: [], chapters: 0, cjk: 0, total: 0, generated: 0 };
  var article = document.getElementById('article');
  var tocEl = document.getElementById('toc');
  var loading = null;

  var ORDER = [];
  CORE.parts.forEach(function (p) {
    p.chapters.forEach(function (c) { ORDER.push({ cid: c.id, title: c.title, part: p.id }); });
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
  }

  function fmt(n) { return (n || 0).toLocaleString('en-US'); }

  /* ---------------- TOC ---------------- */
  function buildToc() {
    var html = '';
    CORE.parts.forEach(function (p) {
      html += '<div class="part-group"><div class="part-head"><b>' + esc(p.short) + '</b><span>' +
        p.chapters.length + ' 章</span></div><ul class="chapter-list">';
      p.chapters.forEach(function (c) {
        var done = (c.missing === 0) ? ' done' : '';
        html += '<li><a class="chapter-link' + done + '" data-cid="' + c.id + '" href="#' + c.id + '">' +
          '<span class="cid">' + c.id.toUpperCase() + '</span><span class="cn">' + esc(c.title) +
          '</span><span class="dot"></span></a></li>';
      });
      html += '</ul></div>';
    });
    tocEl.innerHTML = html;
  }

  function markActive(cid) {
    var links = tocEl.querySelectorAll('.chapter-link');
    var active = null;
    for (var i = 0; i < links.length; i++) {
      var on = links[i].getAttribute('data-cid') === cid;
      links[i].classList.toggle('active', on);
      if (on) active = links[i];
    }
    if (active) {
      var r = active.getBoundingClientRect();
      var tr = tocEl.getBoundingClientRect();
      if (r.top < tr.top || r.bottom > tr.bottom) {
        tocEl.scrollTop += (r.top - tr.top) - tocEl.clientHeight / 2;
      }
    }
  }

  /* ---------------- KaTeX ---------------- */
  function renderMath(root) {
    if (!window.katex) return;
    var blocks = root.querySelectorAll('.math-display');
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i];
      var tex = (el.textContent || '').trim().replace(/^\$\$/, '').replace(/\$\$$/, '');
      try {
        katex.render(tex, el, { displayMode: true, throwOnError: false, strict: false, trust: true });
        fitDisplay(el);
      } catch (e) { el.classList.add('math-error'); }
    }
    var inlines = root.querySelectorAll('.math-inline');
    for (var j = 0; j < inlines.length; j++) {
      var e2 = inlines[j];
      var t2 = (e2.textContent || '').trim().replace(/^\$/, '').replace(/\$$/, '');
      try {
        katex.render(t2, e2, { displayMode: false, throwOnError: false, strict: false, trust: true });
      } catch (e) { e2.classList.add('math-error'); }
    }
    fitAll(root);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { fitAll(root); });
    } else {
      setTimeout(function () { fitAll(root); }, 400);
    }
  }

  function fitAll(root) {
    var blocks = root.querySelectorAll('.math-display');
    for (var i = 0; i < blocks.length; i++) fitDisplay(blocks[i]);
  }

  /* 轻度超宽的展示公式按 0.78–1.0 缩放至容器宽度；超过 1.25 倍者保留横向滚动。 */
  function fitDisplay(el) {
    var kd = el.querySelector('.katex-display');
    if (!kd || !kd.clientWidth) return;
    if (kd.scrollWidth <= kd.clientWidth + 1) return;
    var cur = 1.0;
    for (var it = 0; it < 6 && kd.scrollWidth > kd.clientWidth + 1 && cur > 0.78; it++) {
      cur = Math.max(0.78, cur - 0.04);
      kd.style.fontSize = (1.05 * cur).toFixed(3) + 'em';
    }
  }

  /* ---------------- 首页 ---------------- */
  function frontPage() {
    markActive(null);
    var cards = '';
    CORE.parts.forEach(function (p) {
      var cj = p.chapters.reduce(function (a, c) { return a + (c.cjk || 0); }, 0);
      cards += '<div class="front-card"><h4>' + esc(p.title) + '</h4>' +
        '<p><span class="n">' + p.chapters.length + '</span> 章 · ' + fmt(cj) + ' 汉字</p>' +
        '<p>' + esc(p.chapters[0].focus || '') + '</p></div>';
    });
    article.innerHTML =
      '<div class="chapter"><div class="chapter-head"><div class="chapter-label">TOTAL CONTENTS</div>' +
      '<h2>总目：一条概率路径，四种生成语言</h2></div>' +
      '<p class="lede">本书只讲理论与数学：每个概念先给定义，每个命题先列假设，每个定理给证明或完整证明思路，每个公式给出推导链，每章末给出反例与边界。代码只作为公式的可执行校验，不作为工程教程。</p>' +
      '<div class="front-grid">' + cards + '</div>' +
      '<h3>统一骨架</h3>' +
      '<p>四种生成范式共享同一个对象：概率测度随时间的演化 $\\mu_t$。自回归把它写成离散条件链，扩散写成随机微分方程，流写成连续性方程，联合生成写成耦合测度的传输。三条恒等式贯穿全书：</p>' +
      '<div class="math-display">$$\\partial_t p_t=-\\nabla\\cdot(p_t f)+\\tfrac12 g^2\\Delta p_t$$</div>' +
      '<div class="math-display">$$dX_t=\\left[f-g^2\\nabla\\log p_t\\right]dt+g\\,d\\bar W_t$$</div>' +
      '<div class="math-display">$$\\dot x_t=f-\\tfrac12 g^2\\nabla\\log p_t,\\qquad \\partial_t p_t+\\nabla\\cdot(p_t v_t)=0$$</div>' +
      '<p>第一式是 Fokker–Planck 方程，第二式是反向时间 SDE，第三式是概率流 ODE 与连续性方程。三者不可互相替代：反向漂移与前向漂移相差 $g^2\\nabla\\log p_t$，而概率流速度只相差 $\\tfrac12 g^2\\nabla\\log p_t$。把这两者混为一谈，是扩散理论最常见的错误，本书用三个独立定理把它们分开。</p>' +
      '<h3>阅读路径</h3>' +
      '<ol><li><strong>第一部（自回归）</strong>：概率空间、链式法则、信息论、softmax 几何、attention 的条件期望解释、教师强制与暴露偏差、采样与 KV cache、表达力与统计边界。</li>' +
      '<li><strong>第二部（扩散）</strong>：布朗运动与 Itô 引理、Fokker–Planck、VP/VE 闭式、Anderson 反向 SDE、概率流 ODE、score matching、ELBO、DDPM/DDIM、引导、离散扩散、数值积分与精确似然。</li>' +
      '<li><strong>第三部（流）</strong>：推前测度与变量变换、normalizing flow、Neural ODE、Liouville 与连续性方程、flow matching、CFM 回归等价定理、Benamou–Brenier、rectified flow、stochastic interpolants、Schrödinger bridge、flow maps、Riemannian flow matching。</li>' +
      '<li><strong>第四部（联合）</strong>：联合分布与因子化、联合 AR/diffusion/flow、混合与块级生成、Copula、PoE/MoE、互信息与 Total Correlation、不可识别性、联合 ELBO、联合误差分解、统一框架与选型判据。</li></ol>' +
      '<h3>写法约定</h3>' +
      '<p>全书符号分三级：全局符号（$\\mathcal X,\\mu,\\mu_t,T,\\pi,\\mathcal L$）、领域符号（$s_\\theta$ 表 score，$v_\\theta$ 表速度，$p_\\theta(x_i\\mid x_{&lt;i})$ 表自回归条件）与章节局部符号。每个命题标注所需假设；反例节逐条拆掉一个假设，展示结论如何失效。代码实验室给出输入输出契约、张量形状、稳定性条件与断言。</p>' +
      '<p style="color:var(--muted);font-size:13.5px;font-family:var(--sans)">当前进度：' +
      fmt(CORE.generated) + ' / ' + fmt(CORE.total) + ' 节已生成，累计 ' + fmt(CORE.cjk) + ' 汉字。</p>' +
      '</div>';
    renderMath(article);
    document.title = '概率演化与生成动力学 · 总目';
  }

  /* ---------------- 章 ---------------- */
  /* claims 是“中文正文 + LaTeX 片段”的混合串：中文必须走正文，只有数学片段进 KaTeX。
     整句塞进 $...$ 会把中文按数学排版，字距挤压、公式与汉字粘连，看起来像乱码。 */
  var CJK_CH = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;
  var MATH_MARK = /[\\_^{}=<>]/;

  function claimHtml(c) {
    var out = '', math = '', text = '';
    function flushMath() {
      if (!math) return;
      var s = math;
      math = '';
      if (MATH_MARK.test(s)) out += '<span class="math-inline">$' + esc(s.trim()) + '$</span>';
      else out += esc(s);
    }
    function flushText() {
      if (!text) return;
      out += esc(text);
      text = '';
    }
    var i = 0, n = c.length;
    while (i < n) {
      if (c.substr(i, 6) === '\\text{') {
        // \text{...} 里的中文属于公式，整块保留给 KaTeX（按花括号配平扫描）
        flushText();
        var j = i + 6, depth = 1;
        while (j < n && depth) {
          if (c.charAt(j) === '{') depth++;
          else if (c.charAt(j) === '}') depth--;
          j++;
        }
        math += c.slice(i, j);
        i = j;
        continue;
      }
      var ch = c.charAt(i);
      if (CJK_CH.test(ch)) {
        flushMath();
        text += ch;
      } else if (/\s/.test(ch)) {
        if (math) math += ch; else text += ch;
      } else {
        flushText();
        math += ch;
      }
      i++;
    }
    flushMath();
    flushText();
    return out;
  }

  function chapterHeadHtml(payload, idx) {
    var meta = '<div class="chapter-meta">' +
      '<span class="pill">第 ' + (idx + 1) + ' 章</span>' +
      '<span class="pill">' + payload.topics.length + ' 节</span>' +
      '<span class="pill">' + fmt(payload.cjk) + ' 汉字</span>' +
      (payload.missing && payload.missing.length ? '<span class="pill err">待生成 ' + payload.missing.length + ' 节</span>' : '') +
      '</div>';
    var focus = payload.focus ? '<div class="chapter-focus">' + esc(payload.focus) + '</div>' : '';
    var claims = '';
    if (payload.claims && payload.claims.length) {
      claims = '<div class="claim-box"><h4>本章 canonical claims</h4><ol>';
      payload.claims.forEach(function (c) { claims += '<li>' + claimHtml(c) + '</li>'; });
      claims += '</ol></div>';
    }
    return '<div class="chapter-head"><div class="chapter-label">' + payload.id.toUpperCase() + '</div>' +
      '<h2>' + esc(payload.title) + '</h2></div>' + meta + focus + claims;
  }

  function navHtml(cid) {
    var i = -1;
    for (var k = 0; k < ORDER.length; k++) if (ORDER[k].cid === cid) { i = k; break; }
    var prev = i > 0 ? ORDER[i - 1] : null;
    var next = i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : null;
    var h = '<div class="chapter-nav">';
    h += prev ? '<a class="pv" href="#' + prev.cid + '">← ' + esc(prev.title) + '</a>' : '<span></span>';
    h += next ? '<a class="nx" href="#' + next.cid + '">' + esc(next.title) + ' →</a>' : '<span></span>';
    h += '</div>';
    return h;
  }

  var currentCid = "";

  function scrollToAnchor(hid) {
    var el = document.getElementById(hid);
    if (el) el.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }

  function renderChapter(payload, anchor) {
    var idx = -1;
    for (var k = 0; k < ORDER.length; k++) if (ORDER[k].cid === payload.id) { idx = k; break; }
    article.innerHTML = '<div class="chapter">' + chapterHeadHtml(payload, idx) +
      (payload.html || '<p class="loading">本章尚未生成。</p>') + navHtml(payload.id) + '</div>';
    currentCid = payload.id;
    renderMath(article);
    markActive(payload.id);
    document.title = payload.title + ' · 概率演化与生成动力学';
    bindCopy();
    if (anchor) scrollToAnchor(anchor); else window.scrollTo(0, 0);
  }

  function loadChapter(cid, anchor) {
    if (!cid) { frontPage(); return; }
    if (window.__CH && window.__CH[cid]) { renderChapter(window.__CH[cid], anchor); return; }
    article.innerHTML = '<div class="loading">正在载入 ' + esc(cid.toUpperCase()) + ' …</div>';
    var s = document.createElement('script');
    s.src = 'data/ch/' + cid + '.js';
    s.onload = function () {
      if (window.__CH && window.__CH[cid]) renderChapter(window.__CH[cid], anchor);
      else article.innerHTML = '<div class="loading err">章节数据缺失：' + esc(cid) + '</div>';
    };
    s.onerror = function () {
      article.innerHTML = '<div class="loading err">无法载入 ' + esc(cid) + '（data/ch/' + cid + '.js 不存在）</div>';
    };
    document.head.appendChild(s);
  }

  function route() {
    var h = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    // 节内锚点：章id--h-标题 可深链到任意一节；旧式 h-标题 只在本章内滚动，不再当作章 id
    var m = h.match(/^([a-z]{2}\d{2})--h-(.+)$/);
    if (m) {
      document.body.classList.add('reading');
      if (m[1] === currentCid) scrollToAnchor(h);
      else loadChapter(m[1], h);
      return;
    }
    if (/^h-/.test(h)) {
      if (document.getElementById(h)) scrollToAnchor(h);
      return;
    }
    var isChapter = !!h && h !== 'top' && h !== 'intro';
    document.body.classList.toggle('reading', isChapter);
    if (!isChapter) { currentCid = ''; frontPage(); return; }
    loadChapter(h);
  }

  /* ---------------- 交互 ---------------- */
  function bindCopy() {
    var btns = article.querySelectorAll('.copy-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = function () {
        var pre = this.closest('.code-block').querySelector('pre');
        var txt = pre ? pre.innerText : '';
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
        var old = this.textContent;
        this.textContent = '已复制';
        var self = this;
        setTimeout(function () { self.textContent = old; }, 1200);
      };
    }
  }

  var bar = document.querySelector('#progress span');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    document.getElementById('toTop').classList.toggle('show', h.scrollTop > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  document.getElementById('toTop').onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };

  var root = document.documentElement;
  var saved = localStorage.getItem('gm-theme');
  if (saved) root.setAttribute('data-theme', saved);
  document.getElementById('themeToggle').onclick = function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    localStorage.setItem('gm-theme', t);
  };

  var tocWrap = document.getElementById('tocWrap');
  document.getElementById('tocToggle').onclick = function () {
    tocWrap.classList.toggle('open');
    this.setAttribute('aria-expanded', tocWrap.classList.contains('open'));
  };
  document.getElementById('tocClose').onclick = function () { tocWrap.classList.remove('open'); };
  tocEl.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('.chapter-link') : null;
    if (a) tocWrap.classList.remove('open');
  });

  window.addEventListener('hashchange', route);

  buildToc();
  if (window.__TOTALS) {
    var el = document.getElementById('statCjk');
    if (el && window.__TOTALS.cjk) el.textContent = fmt(window.__TOTALS.cjk);
  }
  route();
  onScroll();
})();
