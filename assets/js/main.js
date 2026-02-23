/***************************************************
==================== JS INDEX ======================
****************************************************
// 00. PreLoader
// 02. Mobile Menu
// 03. Sidebar
// 04. Sticky Header Js
// 05. Data Background
// 06. Nice Select
// 07. settings append in body
// 08. settings open btn
// 09. Mouse Custom Cursor
// 10. rtl & color setting 
// 11. slider__active Js
// 12. Masonary Js
// 13. magnificPopup js 
// 14. Wow Js
// 15. InHover Active Js
// 16. testimonial-activation
// 17. op-gallery-activation
// 18. service-slider activation
// 19. brand-active activation
// 20. blog-slide activation
// 21. team activation
// 22. testimonial activation
// 23. video activation
// 24. pricing activation
// 25. Services Details Circle Js 
// 26. Active Odometer Counter 
// 27. video play 
// 28. load more btn 

****************************************************/

(function($) {
	"use strict"

	var windowOn = $(window);
	
	// Redirect Netlify Identity invite links (with #recovery_token) to auth page
	(function () {
		try {
			if (window && window.location && window.location.hash) {
				var h = String(window.location.hash || '').toLowerCase();
				var hasIdentityToken = h.indexOf('recovery_token') !== -1 || h.indexOf('invite_token') !== -1 || h.indexOf('confirmation_token') !== -1;
				if (!hasIdentityToken) return;
				try {
					// Remember we saw a token so auth page can proceed even if widget clears it
					window.sessionStorage && window.sessionStorage.setItem('identity_token_seen', '1');
				} catch (e) {}
				var path = (window.location.pathname || '');
				// Prefer Netlify hosted Identity portal for reliability
				if (path.indexOf('/.netlify/identity/') === -1) {
					window.location.replace('/.netlify/identity/' + window.location.hash);
				}
			}
		} catch (e) {}
	})();
	
	// 00. PreLoader
	function loader() {
		$(window).on('load', function () {
			$('#ctn-preloader').addClass('loaded');
			$("#loading").fadeOut(500);

			if ($('#ctn-preloader').hasClass('loaded')) {
				$('#preloader').delay(900).queue(function () {
					$(this).remove();
				});
			}
		});
	}
	loader();
	
	// 02. Mobile Menu
	$("#mobile-menu").meanmenu({
		meanMenuContainer: ".mobile-menu",
		meanScreenWidth: "1199",
		meanExpand: ['<i class="fal fa-plus"></i>'],
		meanContract: ['<i class="fal fa-minus"></i>'],
	});
	$("#mobile-menu-media-all").meanmenu({
		meanMenuContainer: ".mobile-menu-media-all",
		meanScreenWidth: "8000",
		meanExpand: ['<i class="fal fa-plus"></i>'],
		meanContract: ['<i class="fal fa-minus"></i>'],
	});

	// Mark active page in main and side menus for consistency across pages
	docReady(function () {
		try {
			// Normalize side menu content across all pages (match homepage)
			(function standardizeSideMenus() {
				var sideInfo = document.querySelector('.side-info .side-info-content');
				if (sideInfo) {
					// Ensure header brand
					var header = sideInfo.querySelector('.offset-header .offset-logo');
					if (!header) {
						var headerWrap = sideInfo.querySelector('.offset-header');
						if (!headerWrap) {
							headerWrap = document.createElement('div');
							headerWrap.className = 'offset-widget offset-header mb-40';
							var row = document.createElement('div');
							row.className = 'row align-items-center';
							row.innerHTML = '<div class="col-9"><div class="offset-logo"></div></div><div class="col-3 text-end"><button class="side-info-close"><i class="fal fa-times"></i></button></div>';
							headerWrap.appendChild(row);
							sideInfo.insertBefore(headerWrap, sideInfo.firstChild);
							header = headerWrap.querySelector('.offset-logo');
						} else {
							var existing = headerWrap.querySelector('.offset-logo');
							if (existing) header = existing;
						}
					}
					if (header) {
						header.innerHTML = '<a href="index.html"><span class="offset-brand">Streljački klub Arilje</span></a>';
					}

					// Ensure mobile menu container exists (don’t remove its content)
					if (!sideInfo.querySelector('.mobile-menu')) {
						var mobile = document.createElement('div');
						mobile.className = 'mobile-menu d-xl-none fix';
						// Place after header
						var headerWidget = sideInfo.querySelector('.offset-header');
						if (headerWidget && headerWidget.parentNode === sideInfo) {
							sideInfo.insertBefore(mobile, headerWidget.nextSibling);
						} else {
							sideInfo.insertBefore(mobile, sideInfo.firstChild);
						}
					}

					// Support (Pozovite nas) block
					var support = sideInfo.querySelector('.offset-support');
					if (!support) {
						support = document.createElement('div');
						support.className = 'offset-widget offset-support mb-30';
						sideInfo.appendChild(support);
					}
					support.innerHTML = '' +
						'<div class="meta-item header-meta-item">' +
						'  <a href="tel:+381677425456">' +
						'    <div class="meta-item-icon"><i class="fas fa-phone-alt"></i></div>' +
						'  </a>' +
						'  <div class="meta-item-content">' +
						'    <div class="meta-title"><span>Pozovite</span> nas</div>' +
						'    <p><a href="tel:+381677425456">+381 677 425 456</a></p>' +
						'    <p><a href="mailto:info@sk-arilje.rs">info@sk-arilje.rs</a></p>' +
						'  </div>' +
						'</div>';

					// Social block
					var social = sideInfo.querySelector('.offset-social');
					if (!social) {
						social = document.createElement('div');
						social.className = 'offset-widget offset-social mb-0';
						sideInfo.appendChild(social);
					}
					social.innerHTML = '' +
						'<div class="social-links">' +
						'  <ul>' +
						'    <li><a href="https://www.facebook.com/skmilosavvujovicarilje" target="_blank"><i class="fab fa-facebook"></i></a></li>' +
						'    <li><a href="#" target="_blank"><i class="fab fa-twitter"></i></a></li>' +
						'    <li><a href="#" target="_blank"><i class="fab fa-linkedin-in"></i></a></li>' +
						'    <li><a href="#" target="_blank"><i class="fab fa-youtube"></i></a></li>' +
						'  </ul>' +
						'</div>';
				}

				// Standardize offset overlay content
				var offsetContent = document.querySelector('.offset-content-wrapper .offset-content');
				if (offsetContent) {
					offsetContent.innerHTML = '' +
						'<div class="offset-info">' +
						'  <div class="offset-logo mb-65"><a href="index.html"><span class="offset-brand">Streljački klub Arilje</span></a></div>' +
						'  <div class="offset-info-widget">' +
						'    <h4 class="offset-info-heading">O nama</h4>' +
						'    <p>Streljački klub Arilje okuplja rekreativce i takmičare svih uzrasta. Naš fokus su bezbednost, preciznost i fer-plej, uz stručnu podršku trenera.</p>' +
						'  </div>' +
						'  <div class="offset-info-widget">' +
						'    <h4 class="offset-info-heading">Pozovite nas</h4>' +
						'    <div class="footer-widget-contact">' +
						'      <ul>' +
						'        <li><div class="arm-single-contact"><div class="footer-contact-icon"><i class="flaticon-077-map"></i></div><p>Miće Matovića bb, Arilje</p></div></li>' +
						'        <li><div class="arm-single-contact"><div class="footer-contact-icon"><i class="flaticon-073-email-2"></i></div><p><a href="mailto:info@sk-arilje.rs">info@sk-arilje.rs</a></p></div></li>' +
						'        <li><div class="arm-single-contact"><div class="footer-contact-icon"><i class="flaticon-060-call"></i></div><p><a href="tel:+381677425456">+381 677 425 456</a></p></div></li>' +
						'      </ul>' +
						'    </div>' +
						'  </div>' +
						'  <div class="social-links offset-menu-social">' +
						'    <ul>' +
						'      <li><a href="https://www.facebook.com/skmilosavvujovicarilje" target="_blank"><i class="fab fa-facebook"></i></a></li>' +
						'      <li><a href="#" target="_blank"><i class="fab fa-twitter"></i></a></li>' +
						'      <li><a href="#" target="_blank"><i class="fab fa-linkedin-in"></i></a></li>' +
						'      <li><a href="#" target="_blank"><i class="fab fa-youtube"></i></a></li>' +
						'    </ul>' +
						'  </div>' +
						'</div>' +
						'<div class="offset-thumb"><img src="assets/img/bg/offset-bg.jpg" alt="img not found"></div>';
				}
			})();

			// Normalize current path to support pretty URLs like /blog/
			var pathname = window.location.pathname || '/';
			var current;
			if (pathname === '/' || pathname === '') {
				current = 'index.html';
			} else if (pathname === '/blog/' || pathname.indexOf('/blog/') === 0) {
				current = '/blog/'; // special key for blog section
			} else {
				current = pathname.split('/').pop() || 'index.html';
			}
			if (String(current).indexOf('#') > -1) current = String(current).split('#')[0];

			function mark(container) {
				if (!container) return;
				// reset existing
				container.querySelectorAll('a.active').forEach(function(a){ a.classList.remove('active'); });
				container.querySelectorAll('li.active').forEach(function(li){ li.classList.remove('active'); });
				if (current === '/blog/') {
					container.querySelectorAll('a[href="/blog/"]').forEach(function(a){
						a.classList.add('active');
						var li = a.closest('li');
						if (li) li.classList.add('active');
					});
				} else {
					var links = container.querySelectorAll('a[href]');
					links.forEach(function (a) {
						var href = a.getAttribute('href') || '';
						if (href === '#' || href === 'javascript:void(0)') return;
						var file = href.split('/').pop();
						if (file === '') file = 'index.html';
						if (file === current) {
							a.classList.add('active');
							var li = a.closest('li');
							if (li) li.classList.add('active');
						}
					});
				}
			}

			function markMenus() {
				// main desktop nav
				var mainNav = document.querySelector('nav#mobile-menu');
				mark(mainNav);
				// side/mobile menu (populated by meanmenu)
				var sideMobile = document.querySelector('.side-info .mobile-menu');
				mark(sideMobile);
				// meanmenu container (if different)
				var meanNav = document.querySelector('.mean-nav');
				mark(meanNav);
			}
			markMenus();
			// Re-mark after meanmenu populates
			var mobileHost = document.querySelector('.side-info .mobile-menu') || document.querySelector('.mobile-menu');
			if (mobileHost && window.MutationObserver) {
				var obs = new MutationObserver(function(){ markMenus(); });
				obs.observe(mobileHost, { childList: true, subtree: true });
			}
			// Also re-run on load and shortly after to catch late init
			window.addEventListener('load', function(){ setTimeout(markMenus, 50); setTimeout(markMenus, 400); });

			// Disable specific items in side menu only
			(function disableSideMenuLinks() {
				var sideMenu = document.querySelector('.side-info .mobile-menu');
				if (!sideMenu) return;
				['about.html', 'services.html'].forEach(function (path) {
					sideMenu.querySelectorAll('a[href="' + path + '"]').forEach(function (a) {
						a.setAttribute('href', 'javascript:void(0)');
						a.classList.add('is-disabled');
						a.addEventListener('click', function (e) { e.preventDefault(); }, { once: true });
					});
				});
			})();
		} catch (e) {}
	});

	// On homepage and contact page, disable links to any other internal pages (keep elements visible)
	docReady(function () {
		try {
			var current = window.location.pathname.split('/').pop() || 'index.html';
			if (current.indexOf('#') > -1) current = current.split('#')[0];
			if (current === '') current = 'index.html';
			if (current !== 'index.html' && current !== 'contact.html') return;

			function disableAnchor(a) {
				if (!a || a.getAttribute('data-guard-disabled') === '1') return;
				a.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); }, true);
				a.setAttribute('href', 'javascript:void(0)');
				a.removeAttribute('target');
				a.setAttribute('aria-disabled', 'true');
				a.setAttribute('tabindex', '-1');
				a.setAttribute('data-guard-disabled', '1');
			}

			function processAllAnchors() {
				var anchors = document.querySelectorAll('a[href]');
				anchors.forEach(function (a) {
					var raw = a.getAttribute('href');
					if (!raw) return;
					var href = raw.trim();
					var lower = href.toLowerCase();
					// allow benign links
					if (lower === '#' || lower === '') return;
					if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('javascript:')) return;
					// case: hash link that mistakenly points to an html file (e.g. "#blog-details.html")
					if (lower.startsWith('#')) {
						var frag = lower.slice(1);
						if (/\.html(?:[#?].*)?$/i.test(frag)) {
							disableAnchor(a);
						}
						return;
					}
					var url;
					try { url = new URL(href, window.location.href); } catch (e) { return; }
					// external links allowed
					if (url.origin !== window.location.origin) return;
					var path = url.pathname.split('/').pop() || 'index.html';
					if (path === '') path = 'index.html';
					// only target html pages other than allowed ones
					if (!/\.html$/i.test(path)) return;
					if (path === 'index.html' || path === 'contact.html' || path === 'blog.html') return;
					disableAnchor(a);
				});
			}

			// initial run
			processAllAnchors();
			// run again after sliders/menus initialize
			setTimeout(processAllAnchors, 300);
			setTimeout(processAllAnchors, 1200);
			// observe DOM mutations (e.g., slider clones)
			var observer;
			try {
				observer = new MutationObserver(function () { processAllAnchors(); });
				observer.observe(document.body, { childList: true, subtree: true });
			} catch (e) {}
		} catch (e) {}
	});

	// 03. Sidebar
	$(".sidebar-toggle-btn").on("click", function () {
		$(".sidebar__area").addClass("sidebar-opened");
		$(".body-overlay").addClass("opened");
	});
	$(".sidebar__close-btn").on("click", function () {
		$(".sidebar__area").removeClass("sidebar-opened");
		$(".body-overlay").removeClass("opened");
	});

	// 04. Sticky Header Js
	var lastScrollTop = 200;
	$(window).scroll(function(event){
	  var scroll = $(this).scrollTop();
	  if (scroll > lastScrollTop){
		$('#header-sticky').removeClass('sticky');
	  }else {
		$('#header-sticky').addClass('sticky');
	  }
  
	  if (scroll < 200) {
		$("#header-sticky").removeClass("sticky");
	  }
	  lastScrollTop = scroll;
	});	

	// 05. Data Background
	$("[data-background]").each(function () {
		$(this).css(
			"background-image",
			"url( " + $(this).attr("data-background") + "  )"
		);
	});

	// 06. Nice Select
	$("select").niceSelect();

	// side - info
	$(".side-info-close,.offcanvas-overlay").on("click", function () {
		$(".side-info").removeClass("info-open");
		$(".offcanvas-overlay").removeClass("overlay-open");
	});
	$(".side-toggle").on("click", function () {
		$(".side-info").addClass("info-open");
		$(".offcanvas-overlay").addClass("overlay-open");
	});

	$(".offset-btn").on("click",function(){
		$(".offset-content-wrapper").addClass("offset-show");
	});
	$(".offset-content-close").on("click",function(){
		$(".offset-content-wrapper").removeClass("offset-show");
	});

	// service hover Js
	$(".single-service").on("mouseenter", function () {
		$(this).addClass("active").siblings().removeClass("active");
	});
	
	// 07. settings append in body
	function tp_settings_append($x) {
	var settings = $("body");
	let dark;
	$x == true ? (dark = "d-block") : (dark = "d-none");
	var settings_html = `<div class="bd-theme-settings-area transition-3">
		<div class="bd-theme-wrapper">
			<div class="bd-theme-header text-center">
				<h4 class="bd-theme-header-title">Theme Settings</h4>
			</div>

			<!-- THEME TOGGLER -->
			<div class="bd-theme-toggle mb-20 ${dark}" style="display:none">
				<label class="bd-theme-toggle-main" for="bd-theme-toggler">
					<span class="bd-theme-toggle-dark"><i class="fa-light fa-moon"></i> Dark</span>
					<input type="checkbox" id="bd-theme-toggler">
					<i class="bd-theme-toggle-slide"></i>
					<span class="bd-theme-toggle-light active"><i class="fa-light fa-sun-bright"></i> Light</span>
				</label>
			</div>

			<!--  RTL SETTINGS -->
			<div class="bd-theme-dir mb-20">
				<label class="bd-theme-dir-main" for="bd-dir-toggler">
					<span class="bd-theme-dir-rtl"> RTL</span>
					<input type="checkbox" id="bd-dir-toggler">
					<i class="bd-theme-dir-slide"></i>
					<span class="bd-theme-dir-ltr active"> LTR</span>
				</label>
			</div>

			<!-- COLOR SETTINGS -->
			<div class="bd-theme-settings">
				<div class="bd-theme-settings-wrapper">
					<div class="bd-theme-settings-open">
					<button class="bd-theme-settings-open-btn">
						<span class="bd-theme-settings-gear">
							<i class="fal fa-cog"></i>
						</span>
						<span class="bd-theme-settings-close">
							<i class="fal fa-times"></i>
						</span>
					</button>
					</div>
					<div class="row row-cols-4 gy-2 gx-2">
					<div class="col">
						<div class="bd-theme-color-item bd-color-active">
						<button class="bd-theme-color-btn bd-color-settings-btn d-none" data-color-default="#ffaf00" type="button" data-color="#ffaf00"></button>
							<button class="bd-theme-color-btn bd-color-settings-btn" type="button" data-color="#ffaf00"></button>
						</div>
					</div>
					<div class="col">
						<div class="bd-theme-color-item bd-color-active">
							<button class="bd-theme-color-btn bd-color-settings-btn" type="button" data-color="#92942e"></button>
						</div>
					</div>
					<div class="col">
						<div class="bd-theme-color-item bd-color-active">
							<button class="bd-theme-color-btn bd-color-settings-btn" type="button" data-color="#8098ff"></button>
						</div>
					</div>
					<div class="col">
						<div class="bd-theme-color-item bd-color-active">
							<button class="bd-theme-color-btn bd-color-settings-btn" type="button" data-color="#f46100"></button>
						</div>
					</div>
					</div>
				</div>
				<div class="bd-theme-color-input">
					<h6>Choose Custom Color</h6>
					<input type="color" id="bd-color-setings-input" value="#0b3d2c">
					<label id="bd-theme-color-label" for="bd-color-setings-input"></label>
				</div>
			</div>
		</div>
		</div>`;

	settings.append(settings_html);
	}
	// tp_settings_append(false); // Disabled: remove floating theme settings gear
	// Ensure no leftover settings panel exists
	(function removeThemeSettings() {
		var el = document.querySelector('.bd-theme-settings-area');
		if (el && el.parentNode) el.parentNode.removeChild(el);
	})();

	// 08. settings open btn
	$(".bd-theme-settings-open-btn").on("click", function () {
	$(".bd-theme-settings-area").toggleClass("settings-opened");
	});

	// 09. Mouse Custom Cursor
	function itCursor() {
	var myCursor = jQuery(".mouseCursor");
	if (myCursor.length) {
		if ($("body")) {
		const e = document.querySelector(".cursor-inner"),
			t = document.querySelector(".cursor-outer");
		let n,
			i = 0,
			o = !1;
		(window.onmousemove = function (s) {
			o ||
			(t.style.transform =
				"translate(" + s.clientX + "px, " + s.clientY + "px)"),
			(e.style.transform =
				"translate(" + s.clientX + "px, " + s.clientY + "px)"),
			(n = s.clientY),
			(i = s.clientX);
		}),
			$("body").on("mouseenter", "button, a, .cursor-pointer", function () {
			e.classList.add("cursor-hover"), t.classList.add("cursor-hover");
			}),
			$("body").on("mouseleave", "button, a, .cursor-pointer", function () {
			($(this).is("a", "button") &&
				$(this).closest(".cursor-pointer").length) ||
				(e.classList.remove("cursor-hover"),
				t.classList.remove("cursor-hover"));
			}),
			(e.style.visibility = "visible"),
			(t.style.visibility = "visible");
		}
	}
	}
	itCursor();

	$(".slider-drag").on("mouseenter", function () {
		$(".mouseCursor").addClass("cursor-big");
	});
	$(".slider-drag").on("mouseleave", function () {
		$(".mouseCursor").removeClass("cursor-big");
	});

	// 10. rtl & color setting 
	// rtl settings
	function tp_rtl_settings() {
	$("#bd-dir-toggler").on("change", function () {
		toggle_rtl();
		window.location.reload();
	});

	// set toggle theme scheme
	function tp_set_scheme(tp_dir) {
		localStorage.setItem("tp_dir", tp_dir);
		document.documentElement.setAttribute("dir", tp_dir);

		if (tp_dir === "rtl") {
		var list = $("[href='assets/css/bootstrap.css']");
		$(list).attr("href", "assets/css/bootstrap.rtl.css");
		} else {
		var list = $("[href='assets/css/bootstrap.css']");
		$(list).attr("href", "assets/css/bootstrap.css");
		}
	}

	// toogle theme scheme
	function toggle_rtl() {
		if (localStorage.getItem("tp_dir") === "rtl") {
		tp_set_scheme("ltr");
		var list = $("[href='assets/css/bootstrap.rtl.css']");
		$(list).attr("href", "assets/css/bootstrap.css");
		} else {
		tp_set_scheme("rtl");
		var list = $("[href='assets/css/bootstrap.css']");
		$(list).attr("href", "assets/css/bootstrap.rtl.css");
		}
	}

	// set the first theme scheme
	function tp_init_dir() {
		if (localStorage.getItem("tp_dir") === "rtl") {
		tp_set_scheme("rtl");
		var list = $("[href='assets/css/bootstrap.css']");
		$(list).attr("href", "assets/css/bootstrap.rtl.css");
		document.getElementById("bd-dir-toggler").checked = true;
		} else {
		tp_set_scheme("ltr");
		document.getElementById("bd-dir-toggler").checked = false;
		var list = $("[href='assets/css/bootstrap.css']");
		$(list).attr("href", "assets/css/bootstrap.css");
		}
	}
	tp_init_dir();
	}
	if ($("#bd-dir-toggler").length > 0) {
	tp_rtl_settings();
	}

	var tp_rtl = localStorage.getItem("tp_dir");
	let rtl_setting = tp_rtl == "rtl" ? true : false;

	// dark light mode toggler
	function tp_theme_toggler() {
	$("#bd-theme-toggler").on("change", function () {
		toggleTheme();
	});

	// set toggle theme scheme
	function tp_set_scheme(tp_theme) {
		localStorage.setItem("tp_theme_scheme", tp_theme);
		document.documentElement.setAttribute("bd-theme", tp_theme);
	}

	// toogle theme scheme
	function toggleTheme() {
		if (localStorage.getItem("tp_theme_scheme") === "bd-theme-dark") {
		tp_set_scheme("bd-theme-light");
		} else {
		tp_set_scheme("bd-theme-dark");
		}
	}

	// set the first theme scheme
	function tp_init_theme() {
		if (localStorage.getItem("tp_theme_scheme") === "bd-theme-dark") {
		tp_set_scheme("bd-theme-dark");
		document.getElementById("bd-theme-toggler").checked = true;
		} else {
		tp_set_scheme("bd-theme-light");
		document.getElementById("bd-theme-toggler").checked = false;
		}
	}
	tp_init_theme();
	}
	if ($("#bd-theme-toggler").length > 0) {
	tp_theme_toggler();
	}

	// color settings
	function tp_color_settings() {
	// set color scheme
	function tp_set_color(tp_color_scheme) {
		localStorage.setItem("tp_color_scheme", tp_color_scheme);
		document
		.querySelector(":root")
		.style.setProperty("--clr-theme-2", tp_color_scheme);
		document.getElementById("bd-color-setings-input").value = tp_color_scheme;
		document.getElementById("bd-theme-color-label").style.backgroundColor =
		tp_color_scheme;
	}

	// set color
	function tp_set_input() {
		var color = localStorage.getItem("tp_color_scheme");
		document.getElementById("bd-color-setings-input").value = color;
		document.getElementById("bd-theme-color-label").style.backgroundColor =
		color;
	}
	tp_set_input();

	function tp_init_color() {
		var defaultColor = $(".bd-color-settings-btn").attr("data-color-default");
		var setColor = localStorage.getItem("tp_color_scheme");

		if (setColor != null) {
		} else {
		setColor = defaultColor;
		}

		if (defaultColor !== setColor) {
		document
			.querySelector(":root")
			.style.setProperty("--clr-theme-2", setColor);
		document.getElementById("bd-color-setings-input").value = setColor;
		document.getElementById("bd-theme-color-label").style.backgroundColor =
			setColor;
		tp_set_color(setColor);
		} else {
		document
			.querySelector(":root")
			.style.setProperty("--clr-theme-2", defaultColor);
		document.getElementById("bd-color-setings-input").value = defaultColor;
		document.getElementById("bd-theme-color-label").style.backgroundColor =
			defaultColor;
		tp_set_color(defaultColor);
		}
	}
	tp_init_color();

	let themeButtons = document.querySelectorAll(".bd-color-settings-btn");

	themeButtons.forEach((color) => {
		color.addEventListener("click", () => {
		let datacolor = color.getAttribute("data-color");
		document
			.querySelector(":root")
			.style.setProperty("--clr-theme-2", datacolor);
		document.getElementById("bd-theme-color-label").style.backgroundColor =
			datacolor;
		tp_set_color(datacolor);
		});
	});

	const colorInput = document.querySelector("#bd-color-setings-input");
	const colorVariable = "--clr-theme-2";

	colorInput.addEventListener("change", function (e) {
		var clr = e.target.value;
		document.documentElement.style.setProperty(colorVariable, clr);
		tp_set_color(clr);
		tp_set_check(clr);
	});

	function tp_set_check(clr) {
		const arr = Array.from(document.querySelectorAll("[data-color]"));

		var a = localStorage.getItem("tp_color_scheme");

		let test = arr
		.map((color) => {
			let datacolor = color.getAttribute("data-color");

			return datacolor;
		})
		.filter((color) => color == a);

		var arrLength = test.length;

		if (arrLength == 0) {
		$(".bd-color-active").removeClass("active");
		} else {
		$(".bd-color-active").addClass("active");
		}
	}

	function tp_check_color() {
		var a = localStorage.getItem("tp_color_scheme");

		var list = $(`[data-color="${a}"]`);

		list
		.parent()
		.addClass("active")
		.parent()
		.siblings()
		.find(".bd-color-active")
		.removeClass("active");
	}
	tp_check_color();

	$(".bd-color-active").on("click", function () {
		$(this)
		.addClass("active")
		.parent()
		.siblings()
		.find(".bd-color-active")
		.removeClass("active");
	});
	}
	if (
		$(".bd-color-settings-btn").length > 0 &&
		$("#bd-color-setings-input").length > 0 &&
		$("#bd-theme-color-label").length > 0
	) {
	tp_color_settings();
	}

	// 11. slider__active Js
	if (jQuery(".slider__active").length > 0) {
		let sliderActive1 = ".slider__active";
		let sliderInit1 = new Swiper(sliderActive1, {
			// Optional parameters
			slidesPerView: 1,
			slidesPerColumn: 1,
			paginationClickable: true,
			loop: true,
			speed: 1000,
			effect: "fade",
			rtl: rtl_setting,
			observer: true,
			observeParents: true,
			autoplay: {
				delay: 10000,
			},

			// If we need pagination
			pagination: {
				el: ".slider-pagination",
				clickable: true,
				renderBullet: function (index, className) {
				  return '<span class="' + className + '">' + '<button>'+ '0' +(  index + 1)+'</button>' + "</span>";
				},
			},

			// Navigation arrows
			navigation: {
				nextEl: ".slider-button-next",
				prevEl: ".slider-button-prev",
			},

			a11y: false,
		});

		function animated_swiper(selector, init) {
			let animated = function animated() {
				$(selector + " [data-animation]").each(function () {
					let anim = $(this).data("animation");
					let delay = $(this).data("delay");
					let duration = $(this).data("duration");

					$(this)
						.removeClass("anim" + anim)
						.addClass(anim + " animated")
						.css({
							webkitAnimationDelay: delay,
							animationDelay: delay,
							webkitAnimationDuration: duration,
							animationDuration: duration,
						})
						.one(
							"webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
							function () {
								$(this).removeClass(anim + " animated");
							}
						);
				});
			};
			animated();
			// Make animated when slide change
			init.on("slideChange", function () {
				$(sliderActive1 + " [data-animation]").removeClass("animated");
			});
			init.on("slideChange", animated);
		}

		animated_swiper(sliderActive1, sliderInit1);
	}

	if (jQuery(".slider__active-2").length > 0) {
		let sliderActive1 = ".slider__active-2";
		let sliderInit1 = new Swiper(sliderActive1, {
			// Optional parameters
			slidesPerView: 1,
			slidesPerColumn: 1,
			paginationClickable: true,
			loop: true,
			speed: 1000,
			effect: "fade",
			rtl: rtl_setting,
			observer: true,
			observeParents: true,
			autoplay: {
				delay: 10000,
			},

			// If we need pagination
			pagination: {
				el: ".swiper-paginations",
				// dynamicBullets: true,
				clickable: true,
			},

			// Navigation arrows
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},

			a11y: false,
		});

		function animated_swiper(selector, init) {
			let animated = function animated() {
				$(selector + " [data-animation]").each(function () {
					let anim = $(this).data("animation");
					let delay = $(this).data("delay");
					let duration = $(this).data("duration");

					$(this)
						.removeClass("anim" + anim)
						.addClass(anim + " animated")
						.css({
							webkitAnimationDelay: delay,
							animationDelay: delay,
							webkitAnimationDuration: duration,
							animationDuration: duration,
						})
						.one(
							"webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
							function () {
								$(this).removeClass(anim + " animated");
							}
						);
				});
			};
			animated();
			// Make animated when slide change
			init.on("slideChange", function () {
				$(sliderActive1 + " [data-animation]").removeClass("animated");
			});
			init.on("slideChange", animated);
		}

		animated_swiper(sliderActive1, sliderInit1);
	}

	var themeSlider = new Swiper(".classname", {
		slidesPerView: 1,
		spaceBetween: 30,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		observer: true,
		observeParents: true,
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},
		breakpoints: {
			1200: {
				slidesPerView: 3,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},
	});

	// 12. Masonary Js
	$(".grid").imagesLoaded(function () {
		// init Isotope
		var $grid = $(".grid").isotope({
			itemSelector: ".grid-item",
			percentPosition: true,
			filter: ".c-1",
			masonry: {
				// use outer width of grid-sizer for columnWidth
				columnWidth: ".grid-item",
			},
		});

		// filter items on button click
		$(".masonary-menu").on("click", "button", function () {
			var filterValue = $(this).attr("data-filter");
			$grid.isotope({ filter: filterValue });
		});

		//for menu active class
		$(".masonary-menu button").on("click", function (event) {
			$(this).siblings(".active").removeClass("active");
			$(this).addClass("active");
			event.preventDefault();
		});
	});

	// Masonary Js
	$(".blog-grid").imagesLoaded(function () {
		// init Isotope
		var $grid = $(".blog-grid").isotope({
			itemSelector: ".grid-item",
			percentPosition: true,
			masonry: {
				// use outer width of grid-sizer for columnWidth
				columnWidth: ".grid-item",
			},
		});
	});

	// 13. magnificPopup js 
	/* magnificPopup img view */
	$(".popup-image").magnificPopup({
		type: "image",
		gallery: {
			enabled: true,
		},
	});

	/* magnificPopup video view */
	$(".popup-video").magnificPopup({
		type: "iframe",
	});

	// 14. Wow Js
	new WOW().init();

	// 15. InHover Active Js
	$(".hover__active").on("mouseenter", function () {
		$(this)
			.addClass("active")
			.parent()
			.siblings()
			.find(".hover__active")
			.removeClass("active");
	});

	// 16. testimonial-activation
	const testitmonial = new Swiper(".testimonial-active", {
		// Default parameters
		slidesPerView: 1,
		spaceBetween: 10,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		observer: true,
		observeParents: true,
		pagination: {
			el: ".testimonial-pagination",
			clickable: true,
		},
		navigation: {
			nextEl: ".testimonial-button-next",
			prevEl: ".testimonial-button-prev",
		},
		// Responsive breakpoints
		breakpoints: {
			// when window width is >= 320px
			320: {
				slidesPerView: 1,
				spaceBetween: 20,
			},
			// when window width is >= 480px
			480: {
				slidesPerView: 1,
				spaceBetween: 30,
			},
			// when window width is >= 640px
			640: {
				slidesPerView: 1,
				spaceBetween: 40,
			},
		},
	});

	// 17. op-gallery-activation
	const opGallery = new Swiper(".operation-gallery-slider", {
		// Default parameters
		slidesPerView: 1,
		spaceBetween: 30,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		observer: true,
		observeParents: true,
		autoplay: {
			delay: 5000,
			disableOnInteraction: true,
			pauseOnMouseEnter: true,
		},
		pagination: {
			el: ".op-gallery-pagination",
			clickable: true,
		},
		navigation: {
			nextEl: ".op-gallery-button-next",
			prevEl: ".op-gallery-button-prev",
		},
		// Responsive breakpoints
		breakpoints: {
			// when window width is >= 320px
			320: {
				slidesPerView: 1,
			},
			480: {
				slidesPerView: 1,
			},
			640: {
				slidesPerView: 2,
			},
			991: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 3,
			},
		},
	});

	// 18. service-slider activation
	var swiper = new Swiper(".service-slider", {
		slidesPerView: 2,
		spaceBetween: 30,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		observer: true,
		observeParents: true,
		autoplay: {
			delay: 3500,
			disableOnInteraction: false,
			pauseOnMouseEnter: true,
		},
		grabCursor: true,
		loopAdditionalSlides: 2,
		pagination: {
			el: ".service-pagination",
			clickable: true,
		},
		// Responsive breakpoints
		breakpoints: {
			576: {
				slidesPerView: 2.6,
			},
			768: {
				slidesPerView: 3.6,
			},
			991: {
				slidesPerView: 5,
			},
			1200: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 4,
			},
		},
	});

	// service2 activation
	const service2slider = new Swiper(".service2-slider", {
		slidesPerView: 1,
		spaceBetween: 30,
		observer: true,
		observeParents: true,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		autoplay: {
			delay: 5000,
			disableOnInteraction: true,
			pauseOnMouseEnter: true,
		},
		pagination: {
			el: ".service2-pagination",
			clickable: true,
		},
		navigation: {
			nextEl: ".service2-slider-button-next",
			prevEl: ".service2-slider-button-prev",
		},
		// Responsive breakpoints
		breakpoints: {
			576: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 2,
			},
			991: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 4,
			},
		},
	});


	// 19. brand-active activation
	$('.brand-active').slick({
		dots: false,
		arrows: false,
		infinite: true,
		speed: 1000,
		autoplay: true,
		slidesToShow: 5,
		draggable:true,
		rtl: rtl_setting,
		responsive: [
		  {
			breakpoint: 1201,
			settings: {
			  slidesToShow: 4
			}
		  },
		  {
			breakpoint: 991,
			settings: {
			  slidesToShow: 3
			}
		  },
		  {
			breakpoint: 768,
			settings: {
			  slidesToShow: 2
			}
		  },
		  {
			breakpoint: 576,
			settings: {
			  slidesToShow: 2
			}
		  },
		  {
			breakpoint: 450,
			settings: {
			  slidesToShow: 1
			}
		  }
		]
	});

	// 20. blog-slide activation
	const blogslider = new Swiper(".blog-slider", {
		slidesPerView: 1,
		spaceBetween: 30,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		observer: true,
		observeParents: true,
		autoplay: {
			delay: 5000,
			pauseOnMouseEnter: true,
		},
		pagination: {
			el: ".blog-pagination",
			clickable: true,
		},
		navigation: {
			nextEl: ".blog-slider-button-next",
			prevEl: ".blog-slider-button-prev",
		},
		// Responsive breakpoints
		breakpoints: {
			// when window width is >= 320px
			320: {
				slidesPerView: 1,
			},
			480: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 2,
			},
			991: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 2,
			},
			1400: {
				slidesPerView: 2,
			},
		},
	});

	const blogslider2 = new Swiper(".blog-slider-2", {
		slidesPerView: 1,
		spaceBetween: 30,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		observer: true,
		observeParents: true,
		autoplay: {
			delay: 5000,
			pauseOnMouseEnter: true,
		},
		pagination: {
			el: ".blog-2-pagination",
			clickable: true,
		},
	});

	// 21. team activation
	const teamslider = new Swiper(".team-slider", {
		slidesPerView: 1,
		spaceBetween: 30,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		observer: true,
		observeParents: true,
		autoplay: {
			delay: 5000,
			pauseOnMouseEnter: true,
		},
		pagination: {
			el: ".team-pagination",
			clickable: true,
		},
		navigation: {
			nextEl: ".team-slider-button-next",
			prevEl: ".team-slider-button-prev",
		},
		// Responsive breakpoints
		breakpoints: {
			576: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 2,
			},
			991: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 3,
			},
		},
	});

	// team-3 activation
	const team3slider = new Swiper(".team-3-slider", {
		slidesPerView: 1,
		spaceBetween: 30,
		observer: true,
		observeParents: true,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		autoplay: {
			delay: 5000,
			pauseOnMouseEnter: true,
		},
		pagination: {
			el: ".team-3-pagination",
			clickable: true,
		},
		navigation: {
			nextEl: ".team-3-slider-button-next",
			prevEl: ".team-3-slider-button-prev",
		},
		// Responsive breakpoints
		breakpoints: {
			576: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 2,
			},
			991: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 3,
			},
		},
	});
	
	// 22. testimonial activation
	const testimonialslider = new Swiper(".testimonial-slider", {
		slidesPerView: 1,
		spaceBetween: 30,
		observer: true,
		observeParents: true,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		autoplay: {
			delay: 5000,
			pauseOnMouseEnter: true,
		},
		pagination: {
			el: ".testimonial-pagination",
			clickable: true,
		},
		navigation: {
			nextEl: ".testimonial-slider-button-next",
			prevEl: ".testimonial-slider-button-prev",
		},
		// Responsive breakpoints
		breakpoints: {
			// when window width is >= 320px
			320: {
				slidesPerView: 1,
				spaceBetween: 50,
			},
			480: {
				slidesPerView: 1,
				spaceBetween: 50,
			},
			640: {
				slidesPerView: 1,
				spaceBetween: 50,
			},
			991: {
				slidesPerView: 1,
				spaceBetween: 50,
			},
			1200: {
				slidesPerView: 2,
			},
			1400: {
				slidesPerView: 2,
			},
		},
	});

	// testimonial2 activation
	const testimonialslider2 = new Swiper(".testimonial-slider-2", {
		slidesPerView: 1,
		spaceBetween: 30,
		observer: true,
		observeParents: true,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		autoplay: {
			delay: 5000,
			pauseOnMouseEnter: true,
		},
		pagination: {
			el: ".testimonial-pagination-2",
			clickable: true,
		},
		navigation: {
			nextEl: ".testimonial-slider-button-next-2",
			prevEl: ".testimonial-slider-button-prev-2",
		},
	});


	// vertical-testimonial activation 
	if ($(".vertical-testimonial-slider").length > 0) {
		$(".vertical-testimonial-slider").slick({
			slidesToShow: 3,
			slidesToScroll: 1,
			autoplay: true,
			autoplaySpeed: 5000,
			vertical: true,
			arrows: true,
			centerMode: true,
			verticalSwiping: true,
			prevArrow:
				'<button type="button" class="vertical-testimonial-prev nav-square-btn"><i class="fal fa-angle-up"></i></button>',
			nextArrow:
				'<button type="button" class="vertical-testimonial-next nav-square-btn"><i class="fal fa-angle-down"></i></button>',
			appendArrows: $(".vertical-testimonial-navigation"),
		});

	}
	if ($(".testimonial-thumb").length > 0) {
		$(".testimonial-thumb").slick({
			slidesToShow: 3,
			slidesToScroll: 1,
			asNavFor: ".vertical-testimonial-slider",
			dots: false,
			centerMode: true,
			focusOnSelect: true,
			arrows: false,
			rtl: rtl_setting,
		});
	}

	// 23. video activation
	const videoslider = new Swiper(".video-slider", {
		slidesPerView: 1,
		spaceBetween: 30,
		observer: true,
		observeParents: true,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		autoplay: {
			delay: 5000,
			pauseOnMouseEnter: true,
		},
		pagination: {
			el: ".video-pagination",
			clickable: true,
		},
		navigation: {
			nextEl: ".video-slider-button-next",
			prevEl: ".video-slider-button-prev",
		},
	});

	// 24. pricing activation
	const pricingslider = new Swiper(".pricing-slider", {
		slidesPerView: 1,
		spaceBetween: 30,
		observer: true,
		observeParents: true,
		loop: true,
		speed: 1000,
		rtl: rtl_setting,
		autoplay: {
			delay: 5000,
			pauseOnMouseEnter: true,
		},
		pagination: {
			el: ".pricing-pagination",
			clickable: true,
		},
		navigation: {
			nextEl: ".pricing-slider-button-next",
			prevEl: ".pricing-slider-button-prev",
		},
		// Responsive breakpoints
		breakpoints: {
			// when window width is >= 320px
			320: {
				slidesPerView: 1,
			},
			480: {
				slidesPerView: 1,
			},
			640: {
				slidesPerView: 1,
			},
			991: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 3,
			},
		},
	});

	// 25. Services Details Circle Js 
	$("#percentage").waypoint(function () {
		// circle-1
		$('.circle_counter').map(function (i, elem) {
			let count = Number($(this).data("count")) ? Number($(this).data("count")) : 0;

			$(elem).circleProgress({
				value: count / 100,
				size: 90,
				thickness: 2,
				lineCap: 'round',
				emptyFill: "#FFECBF",
				fill: '#FFAF00'
			}).on('circle-animation-progress', function (event, progress) {
				$(this).find('.counter_percentage').html(Math.round(count * progress) + '<i>%</i>');
			});
		});
	}, {
		offset: 'bottom-in-view'
	});
	
	
	// 26. Active Odometer Counter 
	jQuery('.odometer').appear(function (e) {
		var odo = jQuery(".odometer");
		odo.each(function () {
			var countNumber = jQuery(this).attr("data-count");
			jQuery(this).html(countNumber);
		});
	});

	function docReady(fn) {
		// see if DOM is already available
		if (document.readyState === "complete" || document.readyState === "interactive") {
			// call on next available tick
			setTimeout(fn, 1);
		} else {
			document.addEventListener("DOMContentLoaded", fn);
		}
	}

	// 27. video play 
	docReady(function () {
		$(".thumbnail").on({
			mouseenter: function () {
				$(this).children("video").get(0).play();
			},
			mouseleave: function () {
				$(this).children("video").get(0).pause();
				// $(this).children("video").get(0).currentTime = 0;
			}
		});
	});

	// 28. load more btn 
	$(".load-more-btn").on("click", function(){
		var $this = $(this).text("").html('<i class="fa fa-spinner fa-spin"></i>');
		window.setTimeout(function(){
		   $this.html('').text("Load More");
		},3000);
	  });

	// Netlify contact form - AJAX submit, show message, no reload
	docReady(function () {
		var form = document.querySelector('form[name="contact"]');
		if (!form) return;

		// normalize form attributes for Netlify and AJAX
		form.setAttribute('method', 'POST');
		form.setAttribute('action', '/');
		form.setAttribute('accept-charset', 'utf-8');

		// ensure hidden form-name is present for Netlify
		if (!form.querySelector('input[name="form-name"]')) {
			var hidden = document.createElement('input');
			hidden.type = 'hidden';
			hidden.name = 'form-name';
			hidden.value = form.getAttribute('name') || 'contact';
			form.appendChild(hidden);
		}

		function serializeFormData(f) {
			var formData = new FormData(f);
			return new URLSearchParams(formData).toString();
		}

		function setStatus(message, isError) {
			var statusEl = form.querySelector('.form-status');
			if (!statusEl) return;
			statusEl.style.display = 'block';
			statusEl.style.color = isError ? '#c0392b' : '#0b3d2c';
			if (statusEl.classList) {
				statusEl.classList.toggle('is-error', !!isError);
				statusEl.classList.toggle('is-success', !isError);
			}
			statusEl.textContent = message;
		}

		form.addEventListener('submit', function (e) {
			e.preventDefault();

			// clear previous status
			var statusEl = form.querySelector('.form-status');
			if (statusEl) {
				statusEl.style.display = 'none';
				statusEl.textContent = '';
			}

			// HTML5 validation first
			if (!form.checkValidity()) {
				setStatus('Molimo popunite obavezna polja.', true);
				form.reportValidity();
				return;
			}

			var submitBtn = form.querySelector('button[type="submit"]');
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Slanje...';
			}

			var bodyEncoded = serializeFormData(form);

			// Local preview fallback: simulate success so UX is testable before deploy
			var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
			if (isLocal) {
				setTimeout(function () {
					setStatus('Hvala! Poruka je uspešno poslata.', false);
					form.reset();
					if (submitBtn) {
						submitBtn.disabled = false;
						submitBtn.textContent = 'Pošaljite';
					}
					// auto-hide after a few seconds
					setTimeout(function () { if (statusEl) statusEl.style.display = 'none'; }, 4000);
				}, 600);
				return;
			}

			fetch('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: bodyEncoded
			}).then(function (resp) {
				if (resp.ok || resp.redirected) {
					setStatus('Hvala! Poruka je uspešno poslata.', false);
					form.reset();
					setTimeout(function () { if (statusEl) statusEl.style.display = 'none'; }, 4000);
				} else {
					setStatus('Došlo je do greške. Pokušajte ponovo.', true);
				}
			}).catch(function () {
				setStatus('Došlo je do greške pri slanju. Pokušajte ponovo.', true);
			}).finally(function () {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.textContent = 'Pošaljite';
				}
			});
		});

		// Clear status when user edits fields
		form.addEventListener('input', function () {
			var statusEl = form.querySelector('.form-status');
			if (statusEl) statusEl.style.display = 'none';
		});
	});

	// (Removed global capture submit for contact to avoid blocking element-level handler)

	// Netlify newsletter forms (support multiple) - AJAX submit, show message, no reload
	docReady(function () {
		var nforms = document.querySelectorAll('form[name="newsletter"], form[name="newsletter-footer"]');
		if (!nforms.length) return;

		function serializeFormData(ff) {
			var formData = new FormData(ff);
			return new URLSearchParams(formData).toString();
		}
		function attachNewsletterHandler(nform) {
			// normalize attributes
			nform.setAttribute('method', 'POST');
			nform.setAttribute('action', '/');
			nform.setAttribute('accept-charset', 'utf-8');

			if (!nform.querySelector('input[name="form-name"]')) {
				var hidden = document.createElement('input');
				hidden.type = 'hidden';
				hidden.name = 'form-name';
				hidden.value = nform.getAttribute('name') || 'newsletter';
				nform.appendChild(hidden);
			}

			function setNStatus(message, isError) {
				var statusEl = nform.querySelector('.form-status');
				if (!statusEl) return;
				statusEl.style.display = 'block';
				statusEl.style.color = isError ? '#c0392b' : '#0b3d2c';
				if (statusEl.classList) {
					statusEl.classList.toggle('is-error', !!isError);
					statusEl.classList.toggle('is-success', !isError);
				}
				statusEl.textContent = message;
			}

			nform.addEventListener('submit', function (e) {
				e.preventDefault();
				var statusEl = nform.querySelector('.form-status');
				if (statusEl) {
					statusEl.style.display = 'none';
					statusEl.textContent = '';
				}

				if (!nform.checkValidity()) {
					setNStatus('Unesite ispravnu e-mail adresu.', true);
					nform.reportValidity();
					return;
				}

				var submitBtn = nform.querySelector('button[type="submit"]');
				if (submitBtn) {
					submitBtn.disabled = true;
					submitBtn.classList.add('is-loading');
					if (typeof submitBtn.blur === 'function') submitBtn.blur();
				}

				var bodyEncoded = serializeFormData(nform);
				var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
				if (isLocal) {
					setTimeout(function () {
						setNStatus('Hvala! Uspešno ste se prijavili.', false);
						nform.reset();
						if (submitBtn) {
							submitBtn.disabled = false;
							submitBtn.classList.remove('is-loading');
						}
						setTimeout(function () { if (statusEl) statusEl.style.display = 'none'; }, 4000);
					}, 600);
					return;
				}

				fetch('/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: bodyEncoded
				}).then(function (resp) {
					if (resp.ok || resp.redirected) {
						setNStatus('Hvala! Uspešno ste se prijavili.', false);
						nform.reset();
						setTimeout(function () { if (statusEl) statusEl.style.display = 'none'; }, 4000);
					} else {
						setNStatus('Došlo je do greške. Pokušajte ponovo.', true);
					}
				}).catch(function () {
					setNStatus('Došlo je do greške pri slanju. Pokušajte ponovo.', true);
				}).finally(function () {
					if (submitBtn) {
						submitBtn.disabled = false;
						submitBtn.classList.remove('is-loading');
					}
				});
			});
		}

		nforms.forEach(attachNewsletterHandler);
	});

	// (Removed global capture submit for newsletter to avoid recursion)

	// Dynamic current year in footer copyrights
	docReady(function () {
		try {
			var currentYear = new Date().getFullYear();
			var targets = document.querySelectorAll('.copyright-text, .copyright-1-text, .site-copyright, .footer-copyright');
			targets.forEach(function (el) {
				el.innerHTML = el.innerHTML.replace(/(?:&copy;|©)\s*\d{4}/i, '&copy; ' + currentYear);
			});
		} catch (e) {}
	});

})(jQuery);