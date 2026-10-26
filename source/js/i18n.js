// One-click language switch: original / all English / all Chinese.
// Translations are pre-rendered into the page; this only flips html[data-lang].
(function() {
  var OPTIONS = [
    {lang: 'orig', label: '原', title: 'Original (as written)'},
    {lang: 'en', label: 'EN', title: 'Read in English'},
    {lang: 'zh', label: '中', title: '中文阅读'}
  ];
  var root = document.documentElement;
  var originalTitle = document.title;
  var originalLang = root.getAttribute('lang');

  function currentLang() {
    return root.getAttribute('data-lang') || 'orig';
  }

  function updateDocumentTitle(lang) {
    var postTitle = document.querySelector('.article-title .i18n');
    var shown = postTitle && postTitle.classList.contains('has-' + lang)
      ? postTitle.querySelector('.lang-' + lang)
      : null;
    var origEl = postTitle && postTitle.querySelector('.lang-orig');
    document.title = shown && origEl
      ? originalTitle.replace(origEl.textContent.trim(), shown.textContent.trim())
      : originalTitle;
    root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en' : originalLang);
  }

  function setLang(lang, buttons) {
    if (lang === 'orig') root.removeAttribute('data-lang');
    else root.setAttribute('data-lang', lang);
    try {
      localStorage.setItem('lang', lang);
    } catch (e) {}
    buttons.forEach(function(b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    updateDocumentTitle(lang);
  }

  document.addEventListener('DOMContentLoaded', function() {
    var box = document.createElement('div');
    box.className = 'lang-toggle';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Language');
    var buttons = OPTIONS.map(function(o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = o.label;
      b.title = o.title;
      b.dataset.lang = o.lang;
      b.addEventListener('click', function() { setLang(o.lang, buttons); });
      box.appendChild(b);
      return b;
    });
    document.body.appendChild(box);
    setLang(currentLang(), buttons);
  });
})();
