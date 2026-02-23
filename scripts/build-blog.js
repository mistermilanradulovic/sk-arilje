#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');
const contentful = require('contentful');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getEnv(name, fallback) {
  const v = process.env[name] || fallback;
  if (!v) {
    console.error(`[build-blog] Missing required env var ${name}`);
    process.exit(1);
  }
  return v;
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderHead({ title, description }) {
  return `<!DOCTYPE html>
<html class="no-js" lang="sr-RS">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>${htmlEscape(title)}</title>
  <meta name="description" content="${htmlEscape(description || '')}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="shortcut icon" type="image/x-icon" href="/assets/img/favicon.png">
  <link rel="stylesheet" href="/assets/css/preloader.css">
  <link rel="stylesheet" href="/assets/css/bootstrap.css">
  <link rel="stylesheet" href="/assets/css/meanmenu.css">
  <link rel="stylesheet" href="/assets/css/animate.min.css">
  <link rel="stylesheet" href="/assets/css/swiper-bundle.css">
  <link rel="stylesheet" href="/assets/css/backToTop.css">
  <link rel="stylesheet" href="/assets/css/magnific-popup.css">
  <link rel="stylesheet" href="/assets/css/nice-select.css">
  <link rel="stylesheet" href="/assets/css/fontAwesome5Pro.css">
  <link rel="stylesheet" href="/assets/css/flaticon.css">
  <link rel="stylesheet" href="/assets/css/slick.css">
  <link rel="stylesheet" href="/assets/css/odometer.css">
  <link rel="stylesheet" href="/assets/css/default.css">
  <link rel="stylesheet" href="/assets/css/style.css">
  <style>
    /* Keep hero/title backgrounds crisp and fully covered */
    .page-title-area {
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
    }
    /* Filter UI — highlight active selections, blend with theme */
    .sidebar-category a {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      margin: 0 8px 8px 0;
      border: 1px solid rgba(0,0,0,.08);
      border-radius: 2px;
      line-height: 1.1;
      background: #fff;
      color: inherit;
      transition: all .2s ease;
    }
    .sidebar-category a:hover {
      border-color: var(--clr-theme-2);
      color: var(--clr-theme-2);
    }
    .sidebar-category a.active {
      background: var(--clr-theme-2);
      color: #fff;
      border-color: var(--clr-theme-2);
      font-weight: 600;
    }
    .sidebar-blog-tags .blog-tag {
      border: 1px solid rgba(0,0,0,.08);
      padding: 6px 12px;
      margin: 0 6px 8px 0;
      border-radius: 2px;
      display: inline-block;
      transition: all .2s ease;
      background: #fff;
      color: inherit;
    }
    .sidebar-blog-tags .blog-tag.active {
      background: var(--clr-theme-2);
      color: #fff;
      border-color: var(--clr-theme-2);
    }
    /* Removed active filters summary UI */
    /* Compact heading variant for blog index */
    .page-title-area.page-title--compact {
      padding-top: 60px !important;
      padding-bottom: 50px !important;
      min-height: 0 !important;
    }
    @media (min-width: 768px) {
      .page-title-area.page-title--compact {
        padding-top: 80px !important;
        padding-bottom: 60px !important;
      }
    }
    @media (min-width: 1200px) {
      .page-title-area.page-title--compact {
        padding-top: 90px !important;
        padding-bottom: 70px !important;
      }
    }
    .page-title-area.page-title--compact .page-title {
      margin-bottom: 6px !important;
    }
    /* Index card thumbnails: consistent aspect, no distortion */
    .tp-post-thumb img {
      width: 100%;
      height: 240px;
      object-fit: cover;
      display: block;
    }
    @media (min-width: 1200px) {
      .tp-post-thumb img { height: 260px; }
    }
    /* Pagination tap targets */
    .basic-pagination ul {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .basic-pagination .page-numbers,
    .basic-pagination .prev,
    .basic-pagination .next {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 38px;
      height: 38px;
      padding: 0 12px;
      border: 1px solid rgba(0,0,0,.12);
      border-radius: 2px;
      color: inherit;
      background: #fff;
      transition: all .2s ease;
    }
    .basic-pagination .page-numbers:hover,
    .basic-pagination .prev:hover,
    .basic-pagination .next:hover {
      border-color: var(--clr-theme-2);
      color: var(--clr-theme-2);
    }
    .basic-pagination .current {
      background: var(--clr-theme-2);
      color: #fff;
      border-color: var(--clr-theme-2);
    }
    .basic-pagination .disabled {
      opacity: .5;
      pointer-events: none;
    }
    /* Post inline/hero image: scale responsively */
    .blog-details-thumb img,
    .blog-details-content img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto 20px auto;
    }
    /* Rich text figures */
    .blog-details-content figure {
      margin: 0 0 20px 0;
    }
    .blog-details-content figure img {
      margin: 0;
    }
    .blog-details-content figcaption {
      text-align: center;
      font-size: 0.95rem;
      opacity: .8;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="mouseCursor cursor-outer"></div>
  <div class="mouseCursor cursor-inner"><span></span></div>
  <header>
    <div id="header-sticky" class="header-main header-main2">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-xl-12 col-lg-12">
            <div class="header-main-content-wrapper">
              <div class="header-main-left header-main-left-header2">
                <div class="header-logo header2-logo"></div>
              </div>
              <div class="header-main-right header-main-right-header2">
                <div class="main-menu main-menu2 d-none d-xl-block">
                  <nav id="mobile-menu">
                    <ul>
                      <li><a href="/index.html">Početna</a></li>
                      <li><a href="javascript:void(0)">O nama</a></li>
                      <li><a href="javascript:void(0)">Usluge</a></li>
                      <li class="menu-item-has-children"><a href="/blog/">Blog</a></li>
                      <li><a href="/contact.html">Kontakt</a></li>
                    </ul>
                  </nav>
                </div>
                <div class="menu-bar">
                  <a class="offset-btn d-none d-xl-inline-block" href="javascript:void(0)">
                    <div class="dot-icon">
                      <img src="/assets/img/icons/side-toggle.png" alt="img not found">
                    </div>
                  </a>
                  <a class="side-toggle d-xl-none" href="javascript:void(0)">
                    <div class="dot-icon">
                      <img src="/assets/img/icons/side-toggle.png" alt="img not found">
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>`;
}

function renderFooter() {
  return `
  <!-- preloader -->
  <div id="preloader">
    <div id="ctn-preloader" class="ctn-preloader">
      <div class="animation-preloader">
        <div class="spinner"></div>
        <div class="txt-loading">
          <span data-text-preloader="A" class="letters-loading">A</span>
          <span data-text-preloader="R" class="letters-loading">R</span>
          <span data-text-preloader="M" class="letters-loading">M</span>
          <span data-text-preloader="A" class="letters-loading">A</span>
          <span data-text-preloader="D" class="letters-loading">D</span>
          <span data-text-preloader="O" class="letters-loading">O</span>
        </div>
      </div>
      <div class="loader">
        <div class="row">
          <div class="col-3 loader-section section-left"><div class="bg"></div></div>
          <div class="col-3 loader-section section-left"><div class="bg"></div></div>
          <div class="col-3 loader-section section-right"><div class="bg"></div></div>
          <div class="col-3 loader-section section-right"><div class="bg"></div></div>
        </div>
      </div>
    </div>
  </div>
  <!-- back to top -->
  <div class="progress-wrap">
    <svg class="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
      <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
    </svg>
  </div>
  <!-- JS stack aligned with site pages -->
  <script src="/assets/js/vendor/jquery-3.6.0.min.js"></script>
  <script src="/assets/js/vendor/waypoints.min.js"></script>
  <script src="/assets/js/bootstrap.bundle.min.js"></script>
  <script src="/assets/js/meanmenu.js"></script>
  <script src="/assets/js/swiper-bundle.min.js"></script>
  <script src="/assets/js/magnific-popup.min.js"></script>
  <script src="/assets/js/backToTop.js"></script>
  <script src="/assets/js/nice-select.min.js"></script>
  <script src="/assets/js/ajax-form.js"></script>
  <script src="/assets/js/wow.min.js"></script>
  <script src="/assets/js/isotope.pkgd.min.js"></script>
  <script src="/assets/js/imagesloaded.pkgd.min.js"></script>
  <script src="/assets/js/jquery.appear.js"></script>
  <script src="/assets/js/jquery.odometer.min.js"></script>
  <script src="/assets/js/slick.min.js"></script>
  <script src="/assets/js/js_circle-progress.min.js"></script>
  <script src="/assets/js/main.js"></script>
</body>
</html>`;
}

function renderIndex(posts) {
  // Derive categories and tags from posts (optional fields)
  const allCategories = new Set();
  const allTags = new Set();
  posts.forEach(p => {
    (p.categories || []).forEach(c => allCategories.add(String(c)));
    (p.tags || []).forEach(t => allTags.add(String(t)));
  });
  const categories = Array.from(allCategories).sort((a, b) => a.localeCompare(b));
  const tags = Array.from(allTags).sort((a, b) => a.localeCompare(b));
  const recent = posts.slice(0, Math.min(5, posts.length));

  const items = posts.map(p => {
    const dateStr = p.date ? format(new Date(p.date), 'dd.MM.yyyy') : '';
    const img = p.heroThumb || p.heroImage || '/assets/img/blog/blog-default.jpg';
    const desc = sanitizeHtml(p.description || '', { allowedTags: [], allowedAttributes: {} });
    const dataCats = (p.categories || []).join(',').toLowerCase();
    const dataTags = (p.tags || []).join(',').toLowerCase();
    return `<div class="col-xl-6 col-lg-6 col-md-12 mb-30 blog-card"
        data-title="${htmlEscape(p.title).toLowerCase()}"
        data-desc="${htmlEscape(desc).toLowerCase()}"
        data-categories="${htmlEscape(dataCats)}"
        data-tags="${htmlEscape(dataTags)}">
      <article class="tp-post tp-post-grid">
        <div class="tp-post-thumb p-relative fix">
          <a href="/blog/${p.slug}/"><img src="${img}" alt="${htmlEscape(p.title)}" loading="lazy" decoding="async"></a>
        </div>
        <div class="tp-post-content">
          <div class="tp-post-meta">
            <span><i class="fal fa-calendar-alt"></i> ${dateStr}</span>
          </div>
          <h3 class="tp-post-title"><a href="/blog/${p.slug}/">${htmlEscape(p.title)}</a></h3>
          <p>${htmlEscape(desc)}</p>
          <div class="tp-post-btn"><a class="arm-btn" href="/blog/${p.slug}/"><span class="circle-btn"><i class="fal fa-long-arrow-right"></i></span>Pročitajte više</a></div>
        </div>
      </article>
    </div>`;
  }).join('\n');

  return `
${renderHead({ title: 'Blog | Streljački klub Arilje', description: 'Najnovije vesti i objave' })}
<main>
  <section class="page-title-area page-title--compact" data-background="/assets/img/bg/page-title-bg.jpg">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="page-title-wrapper">
            <h1 class="page-title mb-10">Blog</h1>
            <p>Najnovije vesti i objave kluba.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="blog-area pt-80 pb-80">
    <div class="container">
      <div class="row wow fadeInUp" data-wow-delay=".2s">
        <div class="col-lg-8">
          <div id="blog-grid" class="row">
            ${items || '<p>Trenutno nema objava.</p>'}
          </div>
          <div class="basic-pagination mt-40">
            <ul id="blog-pagination" aria-label="Paginacija objava"></ul>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="sidebar-widget-wrapper mb-60">
            <div class="blog-sidebar-widget mb-30">
              <h4 class="sidebar-widget-title">Pretraga</h4>
              <div class="sidebar-search">
                <div class="search-input-field sidebar-search">
                  <input id="blog-search" type="text" placeholder="Pretraži objave…">
                  <button type="button"><i class="far fa-search"></i></button>
                </div>
              </div>
            </div>
            ${categories.length ? `
            <div class="blog-sidebar-widget mb-30">
              <h4 class="sidebar-widget-title">Kategorije</h4>
              <div class="category-list sidebar-category">
                <ul id="blog-categories">
                  ${categories.map(c => `<li><a href="#" data-category="${htmlEscape(c)}">${htmlEscape(c)}</a></li>`).join('')}
                </ul>
              </div>
            </div>` : ''}
            <div class="blog-sidebar-widget mb-30">
              <h4 class="sidebar-widget-title">Skorašnje objave</h4>
              <div class="sidebar-blog-list">
                ${recent.map(r => `
                  <div class="sidebar-blog">
                    <div class="blog-thumb">
                      <a href="/blog/${r.slug}/">
                        <img src="${r.heroThumb || r.heroImage || '/assets/img/blog/blog-default.jpg'}" alt="${htmlEscape(r.title)}" loading="lazy">
                      </a>
                    </div>
                    <div class="blog-content">
                      <h4 class="blog-title"><a href="/blog/${r.slug}/">${htmlEscape(r.title)}</a></h4>
                      <div class="meta-list">
                        <div class="meta-item">
                          <div class="meta-icon"><i class="flaticon-048-calendar"></i></div>
                          <div class="meta-text">${r.date ? format(new Date(r.date), 'dd.MM.yyyy') : ''}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ${tags.length ? `
            <div class="blog-sidebar-widget mb-30">
              <h4 class="sidebar-widget-title">Oznake</h4>
              <div class="sidebar-blog-tags" id="blog-tags">
                ${tags.map(t => `<a href="#" class="blog-tag" data-tag="${htmlEscape(t)}">${htmlEscape(t)}</a>`).join(' ')}
              </div>
            </div>` : ''}
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
<script>
(function(){
  var qEl = document.getElementById('blog-search');
  var grid = document.getElementById('blog-grid');
  var catList = document.getElementById('blog-categories');
  var tagList = document.getElementById('blog-tags');
  var state = { q: '', categories: [], tags: [], page: 1, pageSize: 6, total: 0 };
  var pager = document.getElementById('blog-pagination');

  function renderPagination(total, current) {
    if (!pager) return;
    pager.innerHTML = '';
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (totalPages <= 1) { return; }
    function li(html, cls, attrs) {
      var el = document.createElement('li');
      if (cls) el.className = cls;
      el.innerHTML = html;
      if (attrs) Object.keys(attrs).forEach(function(k){ el.firstElementChild && el.firstElementChild.setAttribute(k, attrs[k]); });
      pager.appendChild(el);
    }
    // Prev
    li('<a href="#" class="prev" aria-label="Prethodna stranica"><i class="fal fa-arrow-left"></i></a>', (current<=1?'disabled':''), { 'data-page': String(current-1) });
    // Page numbers (simple 1..N; can add ellipsis later if needed)
    for (var i=1;i<=totalPages;i++){
      if (i === current) {
        li('<span class="page-numbers current" aria-current="page">'+i+'</span>');
      } else {
        li('<a href="#" class="page-numbers">'+i+'</a>', '', { 'data-page': String(i), 'aria-label': 'Idi na stranicu '+i });
      }
    }
    // Next
    li('<a href="#" class="next" aria-label="Sledeća stranica"><i class="fal fa-arrow-right"></i></a>', (current>=totalPages?'disabled':''), { 'data-page': String(current+1) });
  }
  function attachPager() {
    if (!pager) return;
    pager.addEventListener('click', function(e){
      var a = e.target.closest('a[data-page]');
      if (!a) return;
      e.preventDefault();
      var p = parseInt(a.getAttribute('data-page'), 10);
      if (!isNaN(p) && p >= 1) {
        state.page = p;
        load();
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  function cardHtml(item){
    var dateStr = item.date ? new Date(item.date) : null;
    var dateTxt = dateStr ? (('0'+dateStr.getDate()).slice(-2)+'.'+('0'+(dateStr.getMonth()+1)).slice(-2)+'.'+dateStr.getFullYear()) : '';
    var img = item.heroThumb || item.heroImage || '/assets/img/blog/blog-default.jpg';
    var safeTitle = item.title || '';
    var safeDesc = (item.description || '');
    return '<div class="col-xl-6 col-lg-6 col-md-12 mb-30">'+
      '<article class="tp-post tp-post-grid">'+
        '<div class="tp-post-thumb p-relative fix">'+
          '<a href="/blog/'+item.slug+'/"><img src="'+img+'" alt="'+escapeHtml(safeTitle)+'" loading="lazy" decoding="async"></a>'+
        '</div>'+
        '<div class="tp-post-content">'+
          '<div class="tp-post-meta"><span><i class="fal fa-calendar-alt"></i> '+(dateTxt||'')+'</span></div>'+
          '<h3 class="tp-post-title"><a href="/blog/'+item.slug+'/">'+escapeHtml(safeTitle)+'</a></h3>'+
          '<p>'+escapeHtml(safeDesc)+'</p>'+
          '<div class="tp-post-btn"><a class="arm-btn" href="/blog/'+item.slug+'/"><span class="circle-btn"><i class="fal fa-long-arrow-right"></i></span>Pročitajte više</a></div>'+
        '</div>'+
      '</article>'+
    '</div>';
  }
  function renderGrid(items){
    if (!grid) return;
    grid.innerHTML = items.map(cardHtml).join('') || '<p>Trenutno nema objava.</p>';
  }
  function buildUrl(){
    var base = '/.netlify/functions/blog';
    var u = new URL(base, window.location.origin);
    u.searchParams.set('page', String(state.page));
    u.searchParams.set('pageSize', String(state.pageSize));
    if (state.q) u.searchParams.set('q', state.q);
    if (state.categories && state.categories.length) u.searchParams.set('categories', state.categories.join(','));
    if (state.tags && state.tags.length) u.searchParams.set('tags', state.tags.join(','));
    return u.toString();
  }
  function load(){
    var url = buildUrl();
    fetch(url).then(function(r){ return r.json(); }).then(function(data){
      state.total = data.total || 0;
      renderGrid(data.items || []);
      renderPagination(state.total, state.page);
    }).catch(function(){ /* noop */ });
  }
  function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}

  if (qEl) {
    qEl.addEventListener('input', function(){
      state.q = (qEl.value||'').trim();
      state.page = 1;
      load();
    });
  }
  if (catList) {
    catList.addEventListener('click', function(e){
      var a = e.target.closest('a[data-category]');
      if (!a) return;
      e.preventDefault();
      var sel = (a.getAttribute('data-category')||'');
      var idx = state.categories.map(function(v){return v.toLowerCase();}).indexOf(sel.toLowerCase());
      if (idx === -1) state.categories.push(sel); else state.categories.splice(idx, 1);
      Array.prototype.forEach.call(catList.querySelectorAll('a'), function(el){
        var v = (el.getAttribute('data-category')||'');
        el.classList.toggle('active', state.categories.map(function(x){return x.toLowerCase();}).indexOf(v.toLowerCase()) !== -1);
      });
      state.page = 1;
      load();
    });
  }
  if (tagList) {
    tagList.addEventListener('click', function(e){
      var a = e.target.closest('a[data-tag]');
      if (!a) return;
      e.preventDefault();
      var sel = (a.getAttribute('data-tag')||'');
      var idx = state.tags.map(function(v){return v.toLowerCase();}).indexOf(sel.toLowerCase());
      if (idx === -1) state.tags.push(sel); else state.tags.splice(idx, 1);
      Array.prototype.forEach.call(tagList.querySelectorAll('a'), function(el){
        var v = (el.getAttribute('data-tag')||'');
        el.classList.toggle('active', state.tags.map(function(x){return x.toLowerCase();}).indexOf(v.toLowerCase()) !== -1);
      });
      state.page = 1;
      load();
    });
  }
  // initial paint
  attachPager();
  load();
})();
</script>
${renderFooter()}
`;
}

function renderPost(post) {
  const dateStr = post.date ? format(new Date(post.date), 'dd.MM.yyyy') : '';
  const img = post.heroContent || post.heroImage || '/assets/img/blog/blog-default.jpg';
  const headerBg = post.heroFull || post.heroImage || '/assets/img/bg/page-title-bg.jpg';
  return `
${renderHead({ title: `${post.title} | Streljački klub Arilje`, description: post.description || '' })}
<main>
  <section class="page-title-area" data-background="${headerBg}">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="page-title-wrapper">
            <h1 class="page-title mb-10">${htmlEscape(post.title)}</h1>
            <p><i class="fal fa-calendar-alt"></i> ${dateStr}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="blog-details-area pt-60 pb-80">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="blog-details-wrapper">
            <div class="blog-details-thumb mb-30">
              <img src="${img}" alt="${htmlEscape(post.title)}" loading="eager" decoding="async" fetchpriority="high">
            </div>
            ${post.tags && post.tags.length ? `
            <div class="sidebar-blog-tags mb-20">
              ${post.tags.map(t => `<a href="/blog/" class="blog-tag">#${htmlEscape(t)}</a>`).join(' ')}
            </div>` : ''}
            <div class="blog-details-content">
              ${post.htmlBody}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
${renderFooter()}
`;
}

async function fetchPosts() {
  const space = getEnv('CONTENTFUL_SPACE_ID');
  const token = getEnv('CONTENTFUL_CDA_TOKEN');
  const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';

  const client = contentful.createClient({
    space,
    accessToken: token,
    environment,
    host: 'cdn.contentful.com'
  });

  const res = await client.getEntries({
    content_type: 'blogPost',
    order: '-fields.date',
    limit: 100
  });

  return (res.items || []).map(item => {
    const f = item.fields || {};
    const title = f.title || 'Bez naslova';
    const slug = (f.slug || slugify(String(title), { lower: true, strict: true })) || String(item.sys.id);
    const description = f.description || '';
    // Helper to build transformed Contentful image URLs
    const buildImageUrl = (u, params) => {
      if (!u) return '';
      const base = u.startsWith('//') ? `https:${u}` : u;
      const joiner = base.includes('?') ? '&' : '?';
      return `${base}${joiner}${params}`;
    };
    let heroImage = '';
    let heroThumb = '';
    let heroContent = '';
    let heroFull = '';
    if (f.heroImage && f.heroImage.fields && f.heroImage.fields.file && f.heroImage.fields.file.url) {
      const raw = f.heroImage.fields.file.url;
      const base = raw.startsWith('//') ? `https:${raw}` : raw;
      heroImage = base;
      // Thumbnails for cards (approx 720x400), webp if possible
      heroThumb = buildImageUrl(raw, 'w=720&h=400&fit=fill&fm=webp&q=80');
      // In-post main image (limit width to 1280)
      heroContent = buildImageUrl(raw, 'w=1280&fm=webp&q=82');
      // Header background (wide)
      heroFull = buildImageUrl(raw, 'w=1920&fm=webp&q=82');
    }
    const body = f.body || '';
    // Optional taxonomy
    function normalizeArray(value) {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
      return [ value ];
    }
    function extractLabel(v) {
      if (!v) return '';
      if (typeof v === 'string') return v;
      if (v.fields && (v.fields.title || v.fields.name)) return v.fields.title || v.fields.name;
      if (v.sys && v.sys.id) return v.sys.id;
      return String(v);
    }
    let categories = [];
    // fields.categories can be array of strings or references; fields.category single string
    normalizeArray(f.categories).forEach(v => { const lbl = extractLabel(v); if (lbl) categories.push(lbl); });
    if (f.category) categories.push(extractLabel(f.category));
    categories = Array.from(new Set(categories.map(s => String(s))));

    let tags = [];
    // fields.tags can be array/string/references; fields.tag single
    normalizeArray(f.tags).forEach(v => { const lbl = extractLabel(v); if (lbl) tags.push(lbl); });
    if (f.tag) tags.push(extractLabel(f.tag));
    // Contentful metadata tags (system-level)
    if (item.metadata && Array.isArray(item.metadata.tags)) {
      item.metadata.tags.forEach(t => {
        if (t && t.sys && t.sys.id) tags.push(t.sys.id);
      });
    }
    tags = Array.from(new Set(tags.map(s => String(s))));
    let htmlBody = '';
    if (body && body.nodeType) {
      // Rich text
      htmlBody = documentToHtmlString(body);
    } else if (typeof body === 'string') {
      // Markdown or HTML string – allow basic HTML
      htmlBody = sanitizeHtml(body, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3', 'figure', 'figcaption' ]),
        allowedAttributes: {
          a: [ 'href', 'name', 'target', 'rel' ],
          img: [ 'src', 'srcset', 'alt', 'title', 'width', 'height' ]
        }
      });
    }
    return {
      id: item.sys.id,
      title,
      slug,
      date: f.date || item.sys.createdAt,
      description,
      heroImage,
      heroThumb,
      heroContent,
      heroFull,
      categories,
      tags,
      htmlBody
    };
  });
}

async function main() {
  ensureDir(BLOG_DIR);
  const posts = await fetchPosts();

  // Write index
  const indexHtml = renderIndex(posts);
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), indexHtml, 'utf8');

  // Write posts
  for (const p of posts) {
    const postDir = path.join(BLOG_DIR, p.slug);
    ensureDir(postDir);
    const html = renderPost(p);
    fs.writeFileSync(path.join(postDir, 'index.html'), html, 'utf8');
  }

  console.log(`[build-blog] Generated ${posts.length} posts.`);
}

main().catch(err => {
  console.error('[build-blog] Failed:', err && err.stack || err);
  process.exit(1);
});

