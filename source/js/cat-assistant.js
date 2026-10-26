// Bookworm cat: a floating bubble that opens a chat popup with three fixed questions.
// Rendered inside a Shadow DOM so page styles and widget styles never touch each other.
(function () {
  var dataEl = document.getElementById('cat-data');
  if (!dataEl) return;
  var data = JSON.parse(dataEl.textContent);

  var CSS = `
    :host {
      --paper: var(--background-color, #fff);
      --ink: var(--text-color, #000);
      --muted: var(--gray-color, #999);
      --line: var(--border-color, #eaeaea);
      --soft: var(--code-background, #f8f8f8);
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 2147483000;
      font-size: 14px;
    }
    * { box-sizing: border-box; }
    button { font: inherit; color: inherit; }

    .bubble {
      width: 56px;
      height: 56px;
      border: 0;
      border-radius: 50%;
      background: var(--ink);
      color: var(--paper);
      cursor: pointer;
      display: grid;
      place-items: center;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      transition: transform 0.18s ease;
    }
    .bubble:hover { transform: translateY(-2px); }
    .bubble:focus-visible, .chip:focus-visible, .close:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 3px;
    }
    .bubble svg { width: 30px; height: 30px; }
    .bubble .cat { font-size: 30px; line-height: 1; }
    .bubble .x { display: none; }
    :host([open]) .bubble .cat { display: none; }
    :host([open]) .bubble .x { display: block; width: 20px; height: 20px; }

    .window {
      position: absolute;
      right: 0;
      bottom: 76px;
      width: 340px;
      max-width: calc(100vw - 32px);
      display: flex;
      flex-direction: column;
      background: var(--paper);
      color: var(--ink);
      border: 1px solid var(--line);
      border-radius: 14px;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
      transform-origin: calc(100% - 28px) calc(100% + 48px);
      opacity: 0;
      transform: scale(0.92) translateY(8px);
      visibility: hidden;
      transition: opacity 0.16s ease, transform 0.16s ease, visibility 0s 0.16s;
    }
    :host([open]) .window {
      opacity: 1;
      transform: none;
      visibility: visible;
      transition: opacity 0.16s ease, transform 0.16s ease;
    }

    .ears {
      position: absolute;
      top: -15px;
      left: 22px;
      width: 76px;
      height: 16px;
      pointer-events: none;
    }
    .ears .fill { fill: var(--paper); }
    .ears .edge { fill: none; stroke: var(--line); stroke-width: 1; stroke-linejoin: round; }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 12px 12px 18px;
      border-bottom: 1px solid var(--line);
      font-family: Monaco, monospace;
      font-size: 13px;
      font-weight: bold;
    }
    .avatar { margin-right: 8px; font-size: 18px; vertical-align: -2px; }
    .close {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
    }
    .close:hover { background: var(--soft); color: var(--ink); }

    .log {
      height: 320px;
      max-height: 55vh;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Songti SC", serif;
      line-height: 1.55;
    }
    .msg {
      max-width: 85%;
      padding: 8px 12px;
      border-radius: 14px;
      word-break: break-word;
      animation: rise 0.18s ease both;
    }
    .bot { align-self: flex-start; background: var(--soft); border-bottom-left-radius: 4px; }
    .me { align-self: flex-end; background: var(--ink); color: var(--paper); border-bottom-right-radius: 4px; }
    .msg a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
    @keyframes rise { from { opacity: 0; transform: translateY(4px); } }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 12px 14px 14px;
      border-top: 1px solid var(--line);
    }
    .chip {
      padding: 6px 12px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--paper);
      cursor: pointer;
      font-size: 13px;
    }
    .chip:hover { border-color: var(--ink); }

    @media (max-width: 480px) {
      :host { right: 16px; bottom: 16px; }
      .window { width: calc(100vw - 32px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .window, .msg, .bubble { transition: none; animation: none; }
    }
  `;

  var CAT = '<span class="cat" aria-hidden="true">😺</span>';
  var X = '<svg class="x" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var EARS = '<svg class="ears" viewBox="0 0 76 16" aria-hidden="true"><path class="fill" d="M0 17L10 1 22 17zM54 17L66 1 76 17z"/><path class="edge" d="M0 16L10 1 22 16M54 16L66 1 76 16"/></svg>';

  var host = document.createElement('div');
  host.id = 'cat-assistant';
  var root = host.attachShadow({mode: 'open'});
  root.innerHTML =
    '<style>' + CSS + '</style>' +
    '<div class="window" role="dialog" aria-label="Bookworm cat">' + EARS +
      '<header><span><span class="avatar" aria-hidden="true">😺</span>Bookworm cat</span><button class="close" type="button" aria-label="Close">×</button></header>' +
      '<div class="log" aria-live="polite"></div>' +
      '<div class="chips">' +
        '<button class="chip" type="button" data-q="intro">introduce the website</button>' +
        '<button class="chip" type="button" data-q="summary">summary</button>' +
        '<button class="chip" type="button" data-q="recommend">recommend a book</button>' +
      '</div>' +
    '</div>' +
    '<button class="bubble" type="button" aria-label="Open bookworm cat" aria-expanded="false">' + CAT + X + '</button>';
  document.body.appendChild(host);

  var log = root.querySelector('.log');
  var bubble = root.querySelector('.bubble');

  function add(cls, text, link) {
    var el = document.createElement('div');
    el.className = 'msg ' + cls;
    el.textContent = text;
    if (link) {
      if (text) el.appendChild(document.createElement('br'));
      var a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.title;
      el.appendChild(a);
    }
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  var answers = {
    intro: function () { add('bot', data.intro); },
    summary: function () {
      var s = data.summary;
      if (s.title) return add('bot', '“' + s.title + '”: ' + (s.text || 'No summary available.'));
      add('bot', s.count + ' posts so far. Top tags: ' + s.tags.join(', ') + '. The latest:');
      s.latest.forEach(function (p) { add('bot', '', p); });
    },
    recommend: function () {
      add('bot', 'Try this one:', data.books[Math.floor(Math.random() * data.books.length)]);
    }
  };

  function setOpen(open) {
    host.toggleAttribute('open', open);
    bubble.setAttribute('aria-expanded', String(open));
    bubble.setAttribute('aria-label', open ? 'Close bookworm cat' : 'Open bookworm cat');
    if (open && !log.children.length) add('bot', "I'm your bookworm servant. Pick a question below.");
  }

  bubble.addEventListener('click', function () { setOpen(!host.hasAttribute('open')); });
  root.querySelector('.close').addEventListener('click', function () { setOpen(false); bubble.focus(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && host.hasAttribute('open')) { setOpen(false); bubble.focus(); }
  });
  root.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      add('me', chip.textContent);
      answers[chip.dataset.q]();
    });
  });
})();
