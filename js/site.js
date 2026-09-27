/* Deutsch Deluxe — site.js
   Shared behaviour: sticky header menu, EN/AR toggle (data-i18n), WhatsApp deep links,
   contact form -> WhatsApp / mailto, current-year, active nav. No dependencies. */
(function () {
  'use strict';

  var WA_NUMBER = '201115578909';
  var EMAIL = 'deutschdeluxe30@gmail.com';
  var STORAGE_KEY = 'dd-lang';
  var doc = document;
  var root = doc.documentElement;

  /* ------------------------------------------------------------------
     i18n
     English is authored in the HTML. Arabic strings live in js/i18n.js
     (window.DD_I18N.ar). On first switch we cache the English markup on
     each node so we can toggle back without a reload.
  ------------------------------------------------------------------ */
  var dict = (window.DD_I18N && window.DD_I18N.ar) || {};

  function currentLang() {
    return root.getAttribute('lang') === 'ar' ? 'ar' : 'en';
  }

  function translateNode(el, lang) {
    var key = el.getAttribute('data-i18n');
    if (key) {
      if (el.dataset.i18nEn === undefined) el.dataset.i18nEn = el.innerHTML;
      if (lang === 'ar' && Object.prototype.hasOwnProperty.call(dict, key)) {
        el.innerHTML = dict[key];
      } else {
        el.innerHTML = el.dataset.i18nEn;
      }
    }
    var attrSpec = el.getAttribute('data-i18n-attr');
    if (attrSpec) {
      attrSpec.split(',').forEach(function (pair) {
        var parts = pair.split(':');
        var attr = parts[0].trim();
        var k = (parts[1] || '').trim();
        if (!attr || !k) return;
        var cacheName = 'i18nEnAttr' + attr.replace(/[^a-z0-9]/gi, '_');
        if (el.dataset[cacheName] === undefined) el.dataset[cacheName] = el.getAttribute(attr) || '';
        if (lang === 'ar' && Object.prototype.hasOwnProperty.call(dict, k)) {
          el.setAttribute(attr, dict[k]);
        } else {
          el.setAttribute(attr, el.dataset[cacheName]);
        }
      });
    }
  }

  function applyLang(lang, persist) {
    lang = lang === 'ar' ? 'ar' : 'en';
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    var nodes = doc.querySelectorAll('[data-i18n], [data-i18n-attr]');
    for (var i = 0; i < nodes.length; i++) translateNode(nodes[i], lang);

    var toggles = doc.querySelectorAll('.lang-toggle');
    for (var t = 0; t < toggles.length; t++) {
      toggles[t].querySelector('.lang-label').textContent = lang === 'ar' ? 'English' : 'العربية';
      toggles[t].setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
      toggles[t].setAttribute('lang', lang === 'ar' ? 'en' : 'ar');
    }
    updateWhatsAppLinks();
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage may be blocked */ }
    }
    doc.dispatchEvent(new CustomEvent('dd:lang', { detail: { lang: lang } }));
  }

  function initLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { saved = null; }
    var params = new URLSearchParams(location.search);
    var fromUrl = params.get('lang');
    var lang = fromUrl === 'ar' || fromUrl === 'en' ? fromUrl : saved;
    if (lang === 'ar') applyLang('ar', !!fromUrl);
    else applyLang('en', false);

    var toggles = doc.querySelectorAll('.lang-toggle');
    for (var t = 0; t < toggles.length; t++) {
      toggles[t].addEventListener('click', function () {
        applyLang(currentLang() === 'ar' ? 'en' : 'ar', true);
      });
    }
  }

  /* ------------------------------------------------------------------
     WhatsApp deep links
     <a data-wa="courses.a1">  -> message from dictionary (EN in data-wa-en
     attribute or from WA_MESSAGES, AR from i18n dict "wa.<key>").
  ------------------------------------------------------------------ */
  var WA_MESSAGES = {
    general: 'Hello Deutsch Deluxe! I would like to know more about your German courses. Could you share the next start dates, schedules and fees?',
    placement: 'Hello Deutsch Deluxe! I would like to book a free placement chat and find the right level for me.',
    a1: 'Hello Deutsch Deluxe! I am interested in the A1 course. Please share the next start date, schedule options and fees.',
    a2: 'Hello Deutsch Deluxe! I am interested in the A2 course. Please share the next start date, schedule options and fees.',
    b1: 'Hello Deutsch Deluxe! I am interested in the B1 course. Please share the next start date, schedule options and fees.',
    b2: 'Hello Deutsch Deluxe! I am interested in the B2 course. Please share the next start date, schedule options and fees.',
    c1: 'Hello Deutsch Deluxe! I am interested in the C1 course. Please share the next start date, schedule options and fees.',
    exam: 'Hello Deutsch Deluxe! I am interested in an exam preparation course (Goethe / ÖSD / telc). Please share the next dates and fees.',
    medical: 'Hello Deutsch Deluxe! I am a doctor / nurse and I am interested in the B2-C1 medical German and Fachsprachprüfung track.',
    ausbildung: 'Hello Deutsch Deluxe! I am interested in the Ausbildung / work in Germany track (A1 to B1). Please share the details.',
    study: 'Hello Deutsch Deluxe! I want to study in Germany and need German for university. Please share the recommended path and fees.',
    kids: 'Hello Deutsch Deluxe! I would like to ask about German courses for kids and teens.',
    travel: 'Hello Deutsch Deluxe! I would like to learn German for travel / personal interest. Please share the options.',
    bundle: 'Hello Deutsch Deluxe! I would like to ask about the A1+A2 bundle offer and installment options.',
    visit: 'Hello Deutsch Deluxe! I would like to visit the center in Nasr City. When can I come by?'
  };

  function waUrl(message) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
  }

  function updateWhatsAppLinks() {
    var lang = currentLang();
    var links = doc.querySelectorAll('[data-wa]');
    for (var i = 0; i < links.length; i++) {
      var key = links[i].getAttribute('data-wa') || 'general';
      var msg = WA_MESSAGES[key] || WA_MESSAGES.general;
      if (lang === 'ar' && dict['wa.' + key]) msg = dict['wa.' + key];
      links[i].setAttribute('href', waUrl(msg));
      links[i].setAttribute('target', '_blank');
      links[i].setAttribute('rel', 'noopener noreferrer');
    }
  }

  /* ------------------------------------------------------------------
     Header: mobile menu + active nav
  ------------------------------------------------------------------ */
  function initMenu() {
    var btn = doc.querySelector('.menu-btn');
    var panel = doc.getElementById('mobile-nav');
    if (!btn || !panel) return;
    function setOpen(open) {
      panel.classList.toggle('open', open);
      doc.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        var first = panel.querySelector('a');
        if (first) first.focus();
      }
    }
    btn.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) { setOpen(false); btn.focus(); }
    });
    // Close if the viewport grows past the desktop breakpoint
    var mq = window.matchMedia('(min-width: 1140px)');
    var onChange = function (ev) { if (ev.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }

  function initScrollUi() {
    var header = doc.querySelector('.site-header');
    var toTop = doc.querySelector('.to-top');
    var ticking = false;
    function update() {
      var y = window.scrollY || doc.documentElement.scrollTop;
      if (header) header.classList.toggle('scrolled', y > 8);
      if (toTop) toTop.classList.toggle('show', y > 600);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
    if (toTop) {
      toTop.addEventListener('click', function () {
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        var skipTarget = doc.getElementById('top') || doc.body;
        skipTarget.setAttribute('tabindex', '-1');
        skipTarget.focus({ preventScroll: true });
      });
    }
  }

  function markActiveNav() {
    var path = location.pathname.split('/').pop() || 'index.html';
    var links = doc.querySelectorAll('.nav a, .mobile-nav a.item');
    for (var i = 0; i < links.length; i++) {
      var full = links[i].getAttribute('href') || '';
      var href = full.split('#')[0];
      if (href && href === path && full.indexOf('#') === -1) links[i].setAttribute('aria-current', 'page');
    }
  }

  /* ------------------------------------------------------------------
     Forms: contact form -> WhatsApp (primary) or mailto (fallback)
  ------------------------------------------------------------------ */
  function fieldValue(form, name) {
    var el = form.elements[name];
    return el ? String(el.value || '').trim() : '';
  }

  function validate(form) {
    var ok = true;
    var required = form.querySelectorAll('[required]');
    for (var i = 0; i < required.length; i++) {
      var el = required[i];
      var wrap = el.closest('.field');
      var valid = el.checkValidity();
      if (wrap) wrap.classList.toggle('error', !valid);
      if (!valid && ok) { el.focus(); ok = false; }
    }
    return ok;
  }

  function buildContactMessage(form, lang) {
    var name = fieldValue(form, 'name');
    var phone = fieldValue(form, 'phone');
    var email = fieldValue(form, 'email');
    var topic = fieldValue(form, 'topic');
    var msg = fieldValue(form, 'message');
    var topicEl = form.elements.topic;
    var topicLabel = topicEl && topicEl.selectedOptions && topicEl.selectedOptions[0] ? topicEl.selectedOptions[0].textContent.trim() : topic;
    if (lang === 'ar') {
      return 'أهلًا دويتش ديلوكس!\n' +
        'الاسم: ' + name + '\n' +
        'الهاتف: ' + phone + '\n' +
        (email ? 'البريد الإلكتروني: ' + email + '\n' : '') +
        'الموضوع: ' + topicLabel + '\n' +
        (msg ? 'الرسالة: ' + msg : '');
    }
    return 'Hello Deutsch Deluxe!\n' +
      'Name: ' + name + '\n' +
      'Phone: ' + phone + '\n' +
      (email ? 'Email: ' + email + '\n' : '') +
      'Topic: ' + topicLabel + '\n' +
      (msg ? 'Message: ' + msg : '');
  }

  function initContactForm() {
    var form = doc.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var lang = currentLang();
      var text = buildContactMessage(form, lang);
      var channel = (e.submitter && e.submitter.getAttribute('data-channel')) || 'whatsapp';
      if (channel === 'email') {
        var subject = lang === 'ar' ? 'استفسار من موقع دويتش ديلوكس' : 'Inquiry from deutschdeluxe.site';
        location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      } else {
        window.open(waUrl(text), '_blank', 'noopener');
      }
      var done = doc.getElementById('contact-done');
      if (done) { done.hidden = false; done.focus(); }
    });
  }

  /* ------------------------------------------------------------------
     Misc
  ------------------------------------------------------------------ */
  function initYear() {
    var els = doc.querySelectorAll('[data-year]');
    for (var i = 0; i < els.length; i++) els[i].textContent = String(new Date().getFullYear());
  }

  // Expose a tiny API for placement.js and inline needs
  window.DD = {
    lang: currentLang,
    waUrl: waUrl,
    email: EMAIL,
    t: function (key, fallback) {
      return currentLang() === 'ar' && dict[key] ? dict[key] : fallback;
    }
  };

  function init() {
    initMenu();
    initScrollUi();
    markActiveNav();
    initYear();
    initContactForm();
    initLang();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
