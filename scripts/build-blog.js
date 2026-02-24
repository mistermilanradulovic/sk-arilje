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
const DISQUS_SHORTNAME = process.env.DISQUS_SHORTNAME || '';

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
    .accent-orange { color: var(--clr-theme-2) !important; }
    /* Keep hero/title backgrounds crisp and fully covered */
    .page-title-area {
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
    }
    /* Rich text lists inside posts */
    .blog-details-content ul,
    .blog-details-content ol {
      margin: 0 0 1rem 0;
      padding-left: 1.25rem;
      list-style-position: outside !important;
    }
    .blog-details-content ul { list-style: disc !important; }
    .blog-details-content ol { list-style: decimal !important; }
    .blog-details-content li { margin: 0.25rem 0; }
    .blog-details-content ul ul,
    .blog-details-content ol ol,
    .blog-details-content ul ol,
    .blog-details-content ol ul {
      margin-left: 1rem;
    }
    /* Blog index: inline meta (date + comments) */
    .tp-post-content .meta-list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: flex-end;
      text-align: right;
    }
    .tp-post-content .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .tp-post-content .meta-item .meta-icon { line-height: 1; }
    .tp-post-content .meta-item a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: inherit;
    }
    /* Add a bit more space before the title on cards */
    .tp-post-content .tp-post-title {
      margin-top: 12px;
    }
    /* Comments: keep list reasonably sized with scrolling */
    #comment-list {
      max-height: 480px;
      overflow: auto;
      padding-right: 4px;
    }
    @media (max-width: 767.98px) {
      #comment-list { max-height: 360px; }
    }
    #comment-list::-webkit-scrollbar { width: 8px; }
    #comment-list::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,.2);
      border-radius: 4px;
    }
    #comment-list::-webkit-scrollbar-track { background: transparent; }
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

function renderAsides() {
  return `
  <!-- offset-content start  -->
  <aside class="offset-content-wrapper offset-content-wrapper-army p-relative">
    <button class="offset-content-close">
      <i class="fal fa-times"></i>
    </button>
    <div class="offset-content offset-menu-content offset-content-army">
      <div class="offset-info">
        <div class="offset-logo mb-65">
          <a href="/index.html"><span class="offset-brand">Streljački klub Arilje</span></a>
        </div>
        <div class="offset-info-widget">
          <h4 class="offset-info-heading">O nama</h4>
          <p>Streljački klub Arilje okuplja rekreativce i takmičare svih uzrasta. Naš fokus su bezbednost,
            preciznost i fer-plej, uz stručnu podršku trenera.</p>
        </div>
        <div class="offset-info-widget">
          <h4 class="offset-info-heading">Pozovite nas</h4>
          <div class="footer-widget-contact">
            <ul>
              <li>
                <div class="arm-single-contact">
                  <div class="footer-contact-icon">
                    <i class="flaticon-077-map"></i>
                  </div>
                  <p>Miće Matovića bb, Arilje</p>
                </div>
              </li>
              <li>
                <div class="arm-single-contact">
                  <div class="footer-contact-icon">
                    <i class="flaticon-073-email-2"></i>
                  </div>
                  <p><a href="mailto:info@sk-arilje.rs">info@sk-arilje.rs</a></p>
                </div>
              </li>
              <li>
                <div class="arm-single-contact">
                  <div class="footer-contact-icon">
                    <i class="flaticon-060-call"></i>
                  </div>
                  <p><a href="tel:+381677425456">+381 677 425 456</a></p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="social-links offset-menu-social">
          <ul>
            <li><a href="https://www.facebook.com/skmilosavvujovicarilje" target="_blank"><i class="fab fa-facebook"></i></a></li>
          </ul>
        </div>
      </div>
      <div class="offset-thumb">
        <img src="/assets/img/bg/offset-bg.jpg" alt="img not found">
      </div>
    </div>
  </aside>
  <!-- side toggle start -->
  <aside class="fix">
    <div class="side-info side-info-army">
      <div class="side-info-content">
        <div class="offset-widget offset-header mb-40">
          <div class="row align-items-center">
            <div class="col-9">
              <div class="offset-logo">
                <a href="/index.html">
                  <img src="/assets/img/logo/logo-white.png" alt="Logo">
                </a>
              </div>
            </div>
            <div class="col-3 text-end">
              <button class="side-info-close">
                <i class="fal fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="mobile-menu d-xl-none fix"></div>
        <div class="offset-widget offset-support mb-30">
          <div class="meta-item header-meta-item">
            <a href="tel:+381677425456">
              <div class="meta-item-icon">
                <i class="fas fa-phone-alt"></i>
              </div>
            </a>
            <div class="meta-item-content">
              <div class="meta-title"><span>Pozovite</span> nas</div>
              <p><a href="tel:+381677425456">+381 677 425 456</a></p>
              <p><a href="mailto:info@sk-arilje.rs">info@sk-arilje.rs</a></p>
            </div>
          </div>
        </div>
        <div class="offset-widget offset-social mb-0">
          <div class="social-links">
            <ul>
              <li><a href="https://www.facebook.com/skmilosavvujovicarilje" target="_blank"><i class="fab fa-facebook-f"></i></a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </aside>
  <div class="offcanvas-overlay"></div>`;
}

function renderFooter() {
  return `
  <!-- preloader -->
  <div id="preloader">
    <div id="ctn-preloader" class="ctn-preloader">
      <div class="animation-preloader">
        <div class="spinner"></div>
        <div class="txt-loading">
          <span data-text-preloader="S" class="letters-loading">S</span>
          <span data-text-preloader="K" class="letters-loading">K</span>
          <span data-text-preloader="&#160;" class="letters-loading">&#160;</span>
          <span data-text-preloader="A" class="letters-loading">A</span>
          <span data-text-preloader="R" class="letters-loading">R</span>
          <span data-text-preloader="I" class="letters-loading">I</span>
          <span data-text-preloader="Lj" class="letters-loading">Lj</span>
          <span data-text-preloader="E" class="letters-loading">E</span>
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
${renderAsides()}
<main>
  <section class="page-title-area page-title--compact" data-background="/assets/img/bg/page-title-bg.jpg">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="page-title-wrapper">
            <h1 class="page-title mb-10">Blog</h1>
            <p>Najnovije <span class="accent-orange">vesti</span> i <span class="accent-orange">objave</span> kluba.</p>
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
            <div class="blog-sidebar-widget mb-30">
              <h4 class="sidebar-widget-title">Kategorije</h4>
              <div class="category-list sidebar-category">
                <ul id="blog-categories">
                  ${categories.map(c => `<li><a href="#" data-category="${htmlEscape(c)}">${htmlEscape(c)}</a></li>`).join('')}
                </ul>
              </div>
            </div>
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
            <div class="blog-sidebar-widget mb-30">
              <h4 class="sidebar-widget-title">Oznake</h4>
              <div class="sidebar-blog-tags" id="blog-tags">
                ${tags.map(t => `<a href="#" class="blog-tag" data-tag="${htmlEscape(t)}">${htmlEscape(t)}</a>`).join(' ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
<script>
(function(){
  // Ensure the correct nav item is marked active on blog pages
  function markActiveBlog() {
    try {
      var candidates = document.querySelectorAll('#mobile-menu a, .mobile-menu a');
      candidates.forEach(function(a){
        a.classList.remove('active');
        var li = a.closest('li');
        if (li) li.classList.remove('active');
      });
      var blogLinks = document.querySelectorAll('#mobile-menu a[href="/blog/"], .mobile-menu a[href="/blog/"]');
      blogLinks.forEach(function(a){
        a.classList.add('active');
        var li = a.closest('li');
        if (li) li.classList.add('active');
      });
      var homeLinks = document.querySelectorAll('#mobile-menu a[href="/index.html"], .mobile-menu a[href="/index.html"]');
      homeLinks.forEach(function(a){
        a.classList.remove('active');
        var li = a.closest('li');
        if (li) li.classList.remove('active');
      });
    } catch (e) {}
  }
  // Run immediately and after menu plugins initialize
  markActiveBlog();
  setTimeout(markActiveBlog, 300);
  setTimeout(markActiveBlog, 800);

  var qEl = document.getElementById('blog-search');
  var grid = document.getElementById('blog-grid');
  var catList = document.getElementById('blog-categories');
  var tagList = document.getElementById('blog-tags');
  var state = { q: '', categories: [], tags: [], page: 1, pageSize: 6, total: 0 };
  var pager = document.getElementById('blog-pagination');
  var allItems = null; // master list

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
          '<div class="tp-post-meta">'+
            '<div class="meta-list">'+
              '<div class="meta-item">'+
                '<div class="meta-icon"><i class="flaticon-048-calendar"></i></div>'+
                '<div class="meta-text">'+(dateTxt||'')+'</div>'+
              '</div>'+
              '<div class="meta-item">'+
                '<a href="/blog/'+item.slug+'/#comments">'+
                  '<div class="meta-icon"><i class="flaticon-055-speech-bubble"></i></div>'+
                  '<div class="meta-text"><span class="comment-count" data-slug="'+escapeHtml(item.slug)+'">0</span> komentara</div>'+
                '</a>'+
              '</div>'+
            '</div>'+
          '</div>'+
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
  function normalized(arr){ return (arr||[]).map(function(x){return String(x).toLowerCase();}); }
  function matchesItem(it){
    // text search
    if (state.q) {
      var t = (it.title||'').toLowerCase();
      var d = (it.description||'').toLowerCase();
      var q = state.q.toLowerCase();
      if (t.indexOf(q) === -1 && d.indexOf(q) === -1) return false;
    }
    // categories
    if (state.categories && state.categories.length) {
      var postCats = normalized(it.categoriesNames || []);
      var needed = normalized(state.categories);
      var any = needed.some(function(n){ return postCats.indexOf(n) !== -1; });
      if (!any) return false;
    }
    // tags
    if (state.tags && state.tags.length) {
      var postTags = normalized(it.tagsPlain || []);
      var neededT = normalized(state.tags);
      var anyT = neededT.some(function(n){ return postTags.indexOf(n) !== -1; });
      if (!anyT) return false;
    }
    return true;
  }
  function applyFilters(){
    if (!allItems) return;
    var list = allItems.filter(matchesItem);
    state.total = list.length;
    var totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * state.pageSize;
    var slice = list.slice(start, start + state.pageSize);
    renderGrid(slice);
    renderPagination(state.total, state.page);
    // Update comment counts for visible cards
    updateCommentCounts();
  }
  function loadAllIfNeeded(){
    if (allItems) { applyFilters(); return; }
    var u = new URL('/.netlify/functions/blog', window.location.origin);
    u.searchParams.set('page','1'); u.searchParams.set('pageSize','1000');
    fetch(u.toString()).then(function(r){ return r.json(); }).then(function(data){
      allItems = (data.items||[]).slice();
      // sort newest first client-side to be safe
      allItems.sort(function(a,b){
        var da = a.date ? new Date(a.date).getTime() : 0;
        var db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      });
      applyFilters();
    }).catch(function(){ renderGrid([]); });
  }
  function updateCommentCounts(){
    var nodes = grid.querySelectorAll('.comment-count[data-slug]');
    nodes.forEach(function(span){
      var slug = span.getAttribute('data-slug') || '';
      if (!slug) return;
      fetch('/.netlify/functions/comments?slug='+encodeURIComponent(slug))
        .then(function(r){ return r.json(); })
        .then(function(d){
          var n = (d && Array.isArray(d.items)) ? d.items.length : 0;
          span.textContent = String(n);
        })
        .catch(function(){
          // leave default 0 on error
        });
    });
  }
  function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}

  if (qEl) {
    qEl.addEventListener('input', function(){
      state.q = (qEl.value||'').trim();
      state.page = 1;
      applyFilters();
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
      // maintain categoryIds union from selected anchors (if present), without relying on CSS.escape
      var selectedIds = [];
      var links = catList.querySelectorAll('a[data-category]');
      var selectedLC = (state.categories||[]).map(function(n){ return String(n).toLowerCase(); });
      links.forEach(function(link){
        var nameLC = String(link.getAttribute('data-category')||'').toLowerCase();
        if (selectedLC.indexOf(nameLC) !== -1) {
          var ids = link.getAttribute('data-idlist') || '';
          if (ids) {
            ids.split(',').forEach(function(id){ if (id) selectedIds.push(id); });
          }
        }
      });
      // de-duplicate ids
      state.categoryIds = Array.from(new Set(selectedIds));
      Array.prototype.forEach.call(catList.querySelectorAll('a'), function(el){
        var v = (el.getAttribute('data-category')||'');
        el.classList.toggle('active', state.categories.map(function(x){return x.toLowerCase();}).indexOf(v.toLowerCase()) !== -1);
      });
      state.page = 1;
      applyFilters();
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
      applyFilters();
    });
  }
  // Fetch aggregates for category counts and tags
  (function loadAggregates(){
    var u = new URL('/.netlify/functions/blog', window.location.origin);
    u.searchParams.set('aggregate','1');
    fetch(u.toString()).then(function(r){return r.json();}).then(function(data){
      if (data && (data.categoriesDetailed || data.categories) && catList) {
        var items = [];
        if (Array.isArray(data.categoriesDetailed) && data.categoriesDetailed.length) {
          items = data.categoriesDetailed.map(function(it){
            var ids = (it.ids||[]).join(',');
            return '<li><a href="#" data-category="'+escapeHtml(it.name)+'" data-idlist="'+escapeHtml(ids)+'">'+escapeHtml(it.name)+' (<span class="category-items">'+(it.count||0)+'</span>)</a></li>';
          });
        } else if (data.categories) {
          var names = Object.keys(data.categories).sort(function(a,b){ return a.localeCompare(b); });
          items = names.map(function(name){
            return '<li><a href="#" data-category="'+escapeHtml(name)+'">'+escapeHtml(name)+' (<span class="category-items">'+(data.categories[name]||0)+'</span>)</a></li>';
          });
        }
        var html = items.join('');
        var ul = document.getElementById('blog-categories');
        if (ul) ul.innerHTML = html;
      }
      if (data && data.tags && tagList && tagList.children.length === 0) {
        var tnames = Object.keys(data.tags).sort(function(a,b){ return a.localeCompare(b); });
        tagList.innerHTML = tnames.map(function(t){ return '<a href="#" class="blog-tag" data-tag="'+escapeHtml(t)+'">'+escapeHtml(t)+'</a>'; }).join(' ');
      }
    }).catch(function(){});
  })();
  // initial paint
  attachPager();
  loadAllIfNeeded();
})();
</script>
${renderFooter()}
`;
}

function renderPost(post, prev, next, related) {
  const dateStr = post.date ? format(new Date(post.date), 'dd.MM.yyyy') : '';
  const img = post.heroContent || post.heroImage || '/assets/img/blog/blog-default.jpg';
  const headerBg = post.heroFull || post.heroImage || '/assets/img/bg/page-title-bg.jpg';
  return `
${renderHead({ title: `${post.title} | Streljački klub Arilje`, description: post.description || '' })}
${renderAsides()}
<main>
  <section class="page-title-area page-title--compact" data-background="${headerBg}">
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
            <div class="sidebar-blog-tags mb-20">
              ${post.tags.map(t => `<a href="/blog/" class="blog-tag">#${htmlEscape(t)}</a>`).join(' ')}
            </div>
            <div class="blog-details-content">
              ${post.htmlBody}
            </div>
            <div class="blog-share mb-30">
              <div class="share-icon"><i class="flaticon-119-share"></i></div>
              <div class="social-links blog-social">
                <ul>
                  <li><a href="#" class="share-btn" data-net="facebook" aria-label="Podeli na Facebook"><i class="fab fa-facebook"></i></a></li>
                  <li><a href="#" class="share-btn" data-net="twitter" aria-label="Podeli na X"><i class="fab fa-twitter"></i></a></li>
                  <li><a href="#" class="share-btn" data-net="linkedin" aria-label="Podeli na LinkedIn"><i class="fab fa-linkedin-in"></i></a></li>
                </ul>
              </div>
            </div>
            ${ (prev || next) ? `
            <div class="d-flex justify-content-between align-items-center mt-20 mb-10">
              ${prev ? `<a class="arm-btn" href="/blog/${prev.slug}/" aria-label="Starija objava"><span class="circle-btn"><i class="fal fa-long-arrow-left"></i></span>Prethodna</a>` : '<span></span>'}
              ${next ? `<a class="arm-btn" href="/blog/${next.slug}/" aria-label="Novija objava">Sledeća<span class="circle-btn"><i class="fal fa-long-arrow-right"></i></span></a>` : '<span></span>'}
            </div>` : '' }
            ${related && related.length ? `
            <div class="mt-30">
              <h4 class="mb-15">Možda će Vam se svideti</h4>
              <div class="row">
                ${related.slice(0,3).map(r => `
                <div class="col-md-4 mb-20">
                  <article class="tp-post tp-post-grid">
                    <div class="tp-post-thumb p-relative fix"><a href="/blog/${r.slug}/"><img src="${r.heroThumb || r.heroImage || '/assets/img/blog/blog-default.jpg'}" alt="${htmlEscape(r.title)}" loading="lazy"></a></div>
                    <div class="tp-post-content"><h4 class="tp-post-title" style="font-size:16px;"><a href="/blog/${r.slug}/">${htmlEscape(r.title)}</a></h4></div>
                  </article>
                </div>`).join('')}
              </div>
            </div>` : ''}
            <div class="mt-40" id="comments">
              <h4 class="mb-15">Komentari</h4>
              <div id="comment-list" class="mb-20" aria-live="polite"></div>
              <form id="comment-form" class="comment-form">
                <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">
                <div class="row g-3">
                  <div class="col-md-6"><input class="form-control" type="text" name="name" placeholder="Vaše ime*" required></div>
                  <div class="col-md-6"><input class="form-control" type="email" name="email" placeholder="E-mail (opciono)"></div>
                  <div class="col-12"><textarea class="form-control" name="message" rows="4" placeholder="Vaš komentar*" required></textarea></div>
                  <div class="col-12"><button class="arm-btn" type="submit"><span class="circle-btn"><i class="fal fa-paper-plane"></i></span>Pošalji komentar</button></div>
                </div>
                <p id="comment-status" class="mt-2" style="opacity:.85"></p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
<script>
(function(){
  // Share handlers
  function openShare(net){
    var u = encodeURIComponent(window.location.href);
    var t = encodeURIComponent(document.title || '');
    var share = '';
    if (net === 'facebook') share = 'https://www.facebook.com/sharer/sharer.php?u='+u;
    if (net === 'twitter') share = 'https://twitter.com/intent/tweet?url='+u+'&text='+t;
    if (net === 'linkedin') share = 'https://www.linkedin.com/sharing/share-offsite/?url='+u;
    if (share) window.open(share, '_blank', 'noopener,noreferrer,width=700,height=500');
  }
  document.querySelectorAll('.share-btn').forEach(function(a){
    a.addEventListener('click', function(e){ e.preventDefault(); openShare(a.getAttribute('data-net')); });
  });
  // Auto-link phone numbers in post content
  (function linkifyPhones(){
    var root = document.querySelector('.blog-details-content');
    if (!root) return;
    // Use RegExp constructor with escaped backslashes to survive template-string emission
    var phoneRe = new RegExp("(\\\\+?\\\\d[\\\\d\\\\s\\\\/\\\\-]{6,}\\\\d)","g"); // simple, robust pattern
    function normalizeTel(txt){
      var hasPlus = txt.trim().charAt(0) === '+';
      var digits = txt.replace(/[^\d]/g,'');
      return (hasPlus ? '+' : '') + digits;
    }
    function processNode(node){
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.nodeValue;
        if (!phoneRe.test(text)) return;
        phoneRe.lastIndex = 0;
        var frag = document.createDocumentFragment();
        var lastIndex = 0, m;
        while ((m = phoneRe.exec(text)) !== null) {
          var before = text.slice(lastIndex, m.index);
          if (before) frag.appendChild(document.createTextNode(before));
          var telText = m[1];
          var a = document.createElement('a');
          a.href = 'tel:' + normalizeTel(telText);
          a.textContent = telText.trim();
          a.setAttribute('aria-label','Pozovi '+telText.trim());
          frag.appendChild(a);
          lastIndex = phoneRe.lastIndex;
        }
        var after = text.slice(lastIndex);
        if (after) frag.appendChild(document.createTextNode(after));
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'A') {
        var child = node.firstChild;
        while (child) {
          var next = child.nextSibling;
          processNode(child);
          child = next;
        }
      }
    }
    processNode(root);
  })();
  // Contentful-native comments
  var slug = ${JSON.stringify(post.slug)};
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function fmt(iso){try{var d=new Date(iso);return d.toLocaleDateString('sr-Latn-RS',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()+'.';}catch(e){return ''}}
  function renderComments(list){
    var box = document.getElementById('comment-list'); if (!box) return;
    if (!list || !list.length) { box.innerHTML = '<p style="opacity:.8">Još uvek nema komentara.</p>'; return; }
    box.innerHTML = list.map(function(it){
      return '<div class="mb-15"><strong>'+esc(it.name||'Anonimno')+'</strong> <span style="opacity:.7">— '+fmt(it.createdAt)+'</span><div>'+esc(it.message||'')+'</div></div>';
    }).join('');
  }
  function loadComments(){
    fetch('/.netlify/functions/comments?slug='+encodeURIComponent(slug))
      .then(function(r){return r.json();})
      .then(function(d){ renderComments(d.items || []); })
      .catch(function(){});
  }
  loadComments();
  var form = document.getElementById('comment-form');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(form);
      var payload = {
        slug: slug,
        name: fd.get('name')||'',
        email: fd.get('email')||'',
        message: fd.get('message')||'',
        website: fd.get('website')||''
      };
      var status = document.getElementById('comment-status');
      if (status) status.textContent = 'Slanje komentara…';
      fetch('/.netlify/functions/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j }; }); })
      .then(function(res){
        if (res.ok) {
          if (status) status.textContent = 'Komentar objavljen.';
          form.reset();
          loadComments();
        } else {
          if (status) status.textContent = 'Greška pri slanju komentara.';
        }
      }).catch(function(){
        if (status) status.textContent = 'Greška pri slanju komentara.';
      });
    });
  }
  function markActiveBlog() {
    try {
      var candidates = document.querySelectorAll('#mobile-menu a, .mobile-menu a');
      candidates.forEach(function(a){
        a.classList.remove('active');
        var li = a.closest('li');
        if (li) li.classList.remove('active');
      });
      var blogLinks = document.querySelectorAll('#mobile-menu a[href="/blog/"], .mobile-menu a[href="/blog/"]');
      blogLinks.forEach(function(a){
        a.classList.add('active');
        var li = a.closest('li');
        if (li) li.classList.add('active');
      });
      var homeLinks = document.querySelectorAll('#mobile-menu a[href="/index.html"], .mobile-menu a[href="/index.html"]');
      homeLinks.forEach(function(a){
        a.classList.remove('active');
        var li = a.closest('li');
        if (li) li.classList.remove('active');
      });
    } catch (e) {}
  }
  markActiveBlog();
  setTimeout(markActiveBlog, 300);
  setTimeout(markActiveBlog, 800);
})();
</script>
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
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3', 'figure', 'figcaption', 'ul', 'ol', 'li', 'br' ]),
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

  // Ensure strict newest->oldest ordering by parsed date
  const sorted = posts.slice().sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da; // newer first
  });

  // Write posts
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    // In our UX: "Sledeća" = newer (to the left), "Prethodna" = older (to the right)
    const next = sorted[i - 1] || null; // newer
    const prev = sorted[i + 1] || null; // older
    // Related: pick by simple score on shared tags/categories, then fallback by recency
    const others = sorted.filter(x => x.slug !== p.slug);
    const scored = others.map(x => {
      let score = 0;
      const pCats = new Set((p.categories||[]).map(String));
      const pTags = new Set((p.tags||[]).map(String));
      (x.categories||[]).forEach(c => { if (pCats.has(String(c))) score += 2; });
      (x.tags||[]).forEach(t => { if (pTags.has(String(t))) score += 1; });
      return { x, score, date: x.date ? new Date(x.date).getTime() : 0 };
    }).sort((a,b) => (b.score - a.score) || (b.date - a.date)).map(s => s.x).slice(0,3);
    const postDir = path.join(BLOG_DIR, p.slug);
    ensureDir(postDir);
    const html = renderPost(p, prev, next, scored);
    fs.writeFileSync(path.join(postDir, 'index.html'), html, 'utf8');
  }

  console.log(`[build-blog] Generated ${posts.length} posts.`);
}

main().catch(err => {
  console.error('[build-blog] Failed:', err && err.stack || err);
  process.exit(1);
});

