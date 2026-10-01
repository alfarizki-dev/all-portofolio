/* ============================================
   Alfa Rizki — Portfolio
   Main interactions + theme + space layer
   ============================================ */
(function () {
  'use strict';

  var body = document.body;
  var root = document.documentElement;
  var navbar = document.getElementById('navbar');
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var overlay = document.getElementById('navOverlay');
  var progress = document.getElementById('scrollProgress');
  var backTop = document.getElementById('backTop');
  var yearEl = document.getElementById('year');
  var form = document.getElementById('contactForm');
  var themeToggle = document.getElementById('themeToggle');
  var themeWash = document.getElementById('themeWash');
  var spaceLayer = document.getElementById('spaceLayer');
  var mobileMenuClose = document.getElementById('mobileMenuClose');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Theme toggle (Night Moon / Sunset) ---------- */
  var THEME_KEY = 'alfa-portfolio-theme';
  var washTimer = null;

  function applyTheme(theme, animate) {
    if (theme === 'sunset') {
      root.setAttribute('data-theme', 'sunset');
    } else {
      root.removeAttribute('data-theme');
    }

    if (themeToggle) {
      var isSunset = theme === 'sunset';
      themeToggle.setAttribute('aria-pressed', isSunset ? 'true' : 'false');
      themeToggle.setAttribute('title', isSunset ? 'Mode malam' : 'Mode terang');
    }

    /* Cinematic sky wash on manual toggle */
    if (animate && themeWash) {
      themeWash.classList.add('is-active');
      clearTimeout(washTimer);
      washTimer = setTimeout(function () {
        themeWash.classList.remove('is-active');
      }, 950);
    }

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      /* ignore storage errors */
    }
  }

  function currentTheme() {
    return root.getAttribute('data-theme') === 'sunset' ? 'sunset' : 'night';
  }

  var savedTheme = 'night';
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || 'night';
  } catch (err) {
    savedTheme = 'night';
  }
  applyTheme(savedTheme, false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'sunset' ? 'night' : 'sunset', true);
    });
  }

  /* ---------- Mobile navigation ---------- */
  function openNav() {
    body.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Tutup menu navigasi');
  }

  function closeNav() {
    body.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Buka menu navigasi');
  }

  function toggleNav() {
    body.classList.contains('nav-open') ? closeNav() : openNav();
  }

  hamburger.addEventListener('click', toggleNav);
  overlay.addEventListener('click', closeNav);
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeNav);
  }

  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeNav();
  });

  /* ---------- Scroll: navbar, progress, back-to-top, active link, parallax ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var spaceObjs = spaceLayer
    ? Array.prototype.slice.call(spaceLayer.querySelectorAll('.space-obj'))
    : [];
  var spaceSpeeds = [0.08, 0.12, 0.05, 0.07, 0.04, 0.1, 0.06];

  /* Cache layout metrics — avoid forced reflow on every scroll frame */
  var sectionTops = [];
  var navActive = 'beranda';
  var lastParallaxY = -1;
  var spaceScrollY = 0;
  var mouseNX = 0;
  var mouseNY = 0;
  var mouseActive = false;

  function updateSpaceParallax() {
    if (!spaceLayer || !spaceObjs.length) return;
    spaceLayer.style.transform = 'translate3d(0,' + spaceScrollY * 0.12 + 'px,0)';
    spaceObjs.forEach(function (obj, i) {
      var sp = spaceSpeeds[i % spaceSpeeds.length];
      var scrollTy = spaceScrollY * sp * -0.3;
      var depth = (i % 4) + 1;
      var mx = mouseActive ? mouseNX * depth * 14 : 0;
      var my = mouseActive ? mouseNY * depth * 10 : 0;
      obj.style.translate = mx.toFixed(1) + 'px ' + (scrollTy + my).toFixed(1) + 'px';
    });
  }

  function measureLayout() {
    sectionTops = sections.map(function (sec) {
      return { id: sec.id, top: sec.offsetTop };
    });
    lastParallaxY = -1;
    onScroll();
  }

  var resizeTimer = null;
  window.addEventListener(
    'resize',
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measureLayout, 150);
    },
    { passive: true }
  );

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (y > 24) {
      if (!navbar.classList.contains('scrolled')) navbar.classList.add('scrolled');
    } else if (navbar.classList.contains('scrolled')) {
      navbar.classList.remove('scrolled');
    }

    if (y > 600) {
      if (!backTop.classList.contains('visible')) backTop.classList.add('visible');
    } else if (backTop.classList.contains('visible')) {
      backTop.classList.remove('visible');
    }

    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = docH > 0 ? y / docH : 0;
    progress.style.transform = 'scaleX(' + ratio + ')';

    /* Parallax drift — skip if scroll delta is negligible */
    if (spaceLayer && Math.abs(y - lastParallaxY) > 2 && y < window.innerHeight * 1.2) {
      lastParallaxY = y;
      spaceScrollY = y;
      updateSpaceParallax();
    }

    /* Active nav — only write DOM when section changes */
    var current = 'beranda';
    for (var i = 0; i < sectionTops.length; i++) {
      if (sectionTops[i].top - 140 <= y) current = sectionTops[i].id;
    }

    if (current !== navActive) {
      navActive = current;
      navAnchors.forEach(function (a) {
        var href = a.getAttribute('href') || '';
        var on = href === '#' + current;
        if (on) {
          if (!a.classList.contains('active')) a.classList.add('active');
        } else if (a.classList.contains('active')) {
          a.classList.remove('active');
        }
      });
    }
  }

  var ticking = false;
  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  measureLayout();

  /* ---------- Hero mouse parallax (space objects react to cursor) ---------- */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var heroSection = document.getElementById('beranda');
  var parallaxTicking = false;

  if (canHover && heroSection && spaceLayer) {
    heroSection.addEventListener(
      'mousemove',
      function (e) {
        var rect = heroSection.getBoundingClientRect();
        mouseNX = (e.clientX - rect.left) / rect.width - 0.5;
        mouseNY = (e.clientY - rect.top) / rect.height - 0.5;
        mouseActive = true;

        /* Star field parallax via CSS variables */
        heroSection.style.setProperty('--mx', mouseNX.toFixed(3));
        heroSection.style.setProperty('--my', mouseNY.toFixed(3));

        if (!parallaxTicking) {
          parallaxTicking = true;
          requestAnimationFrame(function () {
            updateSpaceParallax();
            parallaxTicking = false;
          });
        }
      },
      { passive: true }
    );

    heroSection.addEventListener(
      'mouseleave',
      function () {
        mouseActive = false;
        mouseNX = 0;
        mouseNY = 0;
        heroSection.style.setProperty('--mx', '0');
        heroSection.style.setProperty('--my', '0');
        updateSpaceParallax();
      },
      { passive: true }
    );
  }

  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Smooth anchor scroll with navbar offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = anchor.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      closeNav();

      var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---------- Reveal on scroll (blocks + word-by-word) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var textEls = document.querySelectorAll('.reveal-text');

  /* Split text nodes into word spans while keeping inline markup */
  function wrapWords(el) {
    if (el.dataset.wordsReady === '1') return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim().length) textNodes.push(node);
    }

    var wordIndex = 0;
    textNodes.forEach(function (tn) {
      var frag = document.createDocumentFragment();
      var parts = tn.textContent.split(/(\s+)/);
      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          var span = document.createElement('span');
          span.className = 'word';
          span.style.setProperty('--i', wordIndex++);
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    el.dataset.wordsReady = '1';
  }

  textEls.forEach(wrapWords);

  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      revealObs.observe(el);
    });

    var textObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            textObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -30px 0px' }
    );

    textEls.forEach(function (el) {
      textObs.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
    textEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- Skill bars ---------- */
  var skillPanels = document.querySelectorAll('[data-skills]');

  function fillBars(panel) {
    panel.querySelectorAll('.bar > i').forEach(function (bar) {
      var level = bar.getAttribute('data-level') || '0';
      bar.style.width = level + '%';
    });
  }

  if ('IntersectionObserver' in window) {
    var barObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            fillBars(entry.target);
            barObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    skillPanels.forEach(function (panel) {
      barObs.observe(panel);
    });
  } else {
    skillPanels.forEach(fillBars);
  }

  /* ---------- Counter animation ---------- */
  var counters = document.querySelectorAll('.count-up');

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = 1200;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (c) {
      countObs.observe(c);
    });
  } else {
    counters.forEach(function (c) {
      c.textContent = c.getAttribute('data-target') || '0';
    });
  }

  /* ---------- Project card 3D tilt + shine ---------- */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover) {
    document.querySelectorAll('.project-card').forEach(function (card) {
      var shine = card.querySelector('.project-card__shine');

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 6;
        var ry = (px - 0.5) * 8;

        card.classList.add('is-tilting');
        card.style.transform =
          'translateY(-6px) perspective(900px) rotateX(' +
          rx.toFixed(2) +
          'deg) rotateY(' +
          ry.toFixed(2) +
          'deg)';

        if (shine) {
          shine.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          shine.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        }
      });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  /* ---------- Typing effect (hero subtitle) ---------- */
  var typeTarget = document.querySelector('.type-static');
  if (typeTarget) {
    var phrases = [
      'Web developer',
      'Front-end learner',
      'Fresh graduate IT',
    ];
    var phraseIndex = 0;
    var charIndex = phrases[0].length;
    var deleting = false;

    function typeLoop() {
      var current = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        typeTarget.textContent = current.slice(0, charIndex);
        if (charIndex >= current.length) {
          deleting = true;
          setTimeout(typeLoop, 2200);
          return;
        }
        setTimeout(typeLoop, 70 + Math.random() * 40);
      } else {
        charIndex--;
        typeTarget.textContent = current.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeLoop, 400);
          return;
        }
        setTimeout(typeLoop, 36);
      }
    }

    setTimeout(typeLoop, 2600);
  }

  /* ---------- Copy to clipboard chips ---------- */
  document.querySelectorAll('.chip--copy').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var text = chip.getAttribute('data-copy') || '';
      var label = chip.querySelector('.chip__label');
      if (!text) return;

      function done() {
        chip.classList.add('is-copied');
        if (label) {
          var prev = label.textContent;
          label.textContent = 'Tersalin!';
          setTimeout(function () {
            label.textContent = prev;
            chip.classList.remove('is-copied');
          }, 1600);
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    });
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } catch (err) {
      /* ignore */
    }
    document.body.removeChild(ta);
  }

  /* ---------- Contact form → mailto ---------- */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = (form.elements.name.value || '').trim();
      var email = (form.elements.email.value || '').trim();
      var subject = (form.elements.subject.value || '').trim();
      var message = (form.elements.message.value || '').trim();

      var bodyText =
        'Nama: ' + name + '\n' +
        'Email: ' + email + '\n\n' +
        message;

      var mailto =
        'mailto:alfarizki067@gmail.com' +
        '?subject=' + encodeURIComponent('[Portofolio] ' + subject) +
        '&body=' + encodeURIComponent(bodyText);

      window.location.href = mailto;
    });
  }
})();
