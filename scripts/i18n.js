'use strict';

// Pre-translated posts live in the site's source/_translations/<lang>/<post-file>.md
// (front-matter `title` + markdown body). A missing file means "show the original".
const fs = require('fs');
const path = require('path');
const { parse } = require('hexo-front-matter');

const LANGS = ['en', 'zh'];
const cache = new Map();

function load(file) {
  let stat;
  try {
    stat = fs.statSync(file);
  } catch (e) {
    return null;
  }
  const hit = cache.get(file);
  if (hit && hit.mtime === stat.mtimeMs) return hit.value;

  const data = parse(fs.readFileSync(file, 'utf8'));
  const value = {
    title: data.title,
    content: hexo.render.renderSync({ text: data._content, engine: 'markdown' })
  };
  cache.set(file, { mtime: stat.mtimeMs, value });
  return value;
}

hexo.extend.helper.register('post_i18n', function(post) {
  const name = path.basename(post.source || '');
  const result = {};
  if (!name) return result;
  LANGS.forEach(lang => {
    const value = load(path.join(hexo.source_dir, '_translations', lang, name));
    if (value) result[lang] = value;
  });
  return result;
});
