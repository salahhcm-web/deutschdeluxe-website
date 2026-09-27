/* Deutsch Deluxe — placement.js
   15-question German placement quiz (A1 -> B1), runs fully in the browser.
   Result = first CEFR level not yet mastered (fewer than 4/5 correct at that level).
   Lead form opens a pre-filled WhatsApp message (mailto fallback). No backend. */
(function () {
  'use strict';

  var doc = document;
  var quizRoot = doc.getElementById('quiz');
  if (!quizRoot) return;

  var PASS_MARK = 4; // out of 5 per level

  /* Each question: level, German prompt (gap = ___), options (German), answer index,
     instruction (en/ar). German content stays German in both languages. */
  var QUESTIONS = [
    // ---------- A1 ----------
    { level: 'A1', q: 'Ich ___ Ahmed. Und wie heißt du?', o: ['heißt', 'heißen', 'heiße', 'heißes'], a: 2 },
    { level: 'A1', q: '___ kommst du? — Aus Ägypten.', o: ['Woher', 'Wo', 'Wohin', 'Wer'], a: 0 },
    { level: 'A1', q: 'Das ist ___ Buch.', o: ['eine', 'einen', 'einer', 'ein'], a: 3 },
    { level: 'A1', q: 'Wir ___ heute Deutsch.', o: ['lernt', 'lernen', 'lerne', 'lernst'], a: 1 },
    { level: 'A1', q: 'Hast du ___ Bruder?', o: ['ein', 'einen', 'eine', 'einem'], a: 1 },
    // ---------- A2 ----------
    { level: 'A2', q: 'Gestern ___ ich ins Kino gegangen.', o: ['habe', 'war', 'hatte', 'bin'], a: 3 },
    { level: 'A2', q: 'Ich freue mich ___ das Wochenende.', o: ['auf', 'über', 'für', 'an'], a: 0 },
    { level: 'A2', q: 'Kannst du mir helfen? — Ja, ich helfe ___ gern.', o: ['dich', 'du', 'dir', 'dein'], a: 2 },
    { level: 'A2', q: 'Er ist ___ als sein Bruder.', o: ['größer', 'groß', 'am größten', 'größte'], a: 0 },
    { level: 'A2', q: 'Ich lerne Deutsch, ___ ich in Deutschland arbeiten möchte.', o: ['denn', 'weil', 'deshalb', 'obwohl'], a: 1 },
    // ---------- B1 ----------
    { level: 'B1', q: 'Wenn ich mehr Zeit ___, würde ich jeden Tag Deutsch lernen.', o: ['habe', 'hätte', 'hatte', 'haben'], a: 1 },
    { level: 'B1', q: 'Das Auto, ___ vor dem Haus steht, gehört meiner Nachbarin.', o: ['der', 'die', 'dem', 'das'], a: 3 },
    { level: 'B1', q: 'Das Haus ___ im Jahr 1950 gebaut.', o: ['wurde', 'wird', 'hat', 'worden'], a: 0 },
    { level: 'B1', q: 'Ich habe den Termin ___, weil ich krank war.', o: ['absagen', 'abgesagen', 'abgesagt', 'absagte'], a: 2 },
    { level: 'B1', q: 'Trotz ___ Regens sind wir spazieren gegangen.', o: ['dem', 'den', 'der', 'des'], a: 3 }
  ];

  var LEVELS = ['A1', 'A2', 'B1'];

  /* Result copy. Keys are looked up in the Arabic dictionary via DD.t(key, fallback). */
  var RESULTS = {
    A1: {
      title: 'Start with Hallo — A1 is your level.',
      body: 'You are at the beginning of your German journey (or just below A1). Our A1 course builds your foundations: introducing yourself, everyday situations and your first real conversations.',
      course: 'A1 — Beginner course',
      wa: 'a1'
    },
    A2: {
      title: 'Solid basics — you are ready for A2.',
      body: 'You have mastered the A1 essentials. In A2 you will handle daily life with confidence: shopping, work, appointments, past-tense stories and longer conversations.',
      course: 'A2 — Elementary course',
      wa: 'a2'
    },
    B1: {
      title: 'Strong intermediate — B1 is your next step.',
      body: 'You are comfortable at A2 level. B1 takes you to independent-user level: opinions, arguments, complex sentences — and the level required for Ausbildung visas and many jobs in Germany.',
      course: 'B1 — Intermediate course',
      wa: 'b1'
    },
    B2: {
      title: 'Impressive — you are beyond B1.',
      body: 'You answered our B1 questions with confidence. Our team will assess your speaking and writing to place you in B2 or C1 — or in an exam bootcamp if you are targeting a Goethe, ÖSD or telc certificate.',
      course: 'B2 / C1 — Advanced assessment',
      wa: 'b2'
    }
  };

  var state = { index: 0, answers: new Array(QUESTIONS.length).fill(null), finished: false };

  function t(key, fallback) {
    return window.DD && window.DD.t ? window.DD.t(key, fallback) : fallback;
  }

  function lang() { return window.DD && window.DD.lang ? window.DD.lang() : 'en'; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- Scoring ---------------- */
  function score() {
    var per = { A1: 0, A2: 0, B1: 0 };
    var total = 0;
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (state.answers[i] === QUESTIONS[i].a) { per[QUESTIONS[i].level] += 1; total += 1; }
    }
    var level = 'B2';
    for (var l = 0; l < LEVELS.length; l++) {
      if (per[LEVELS[l]] < PASS_MARK) { level = LEVELS[l]; break; }
    }
    return { per: per, total: total, level: level };
  }

  // Exposed for testing in the console / headless checks
  window.DD_PLACEMENT = {
    questions: QUESTIONS,
    scoreFor: function (answers) {
      var saved = state.answers;
      state.answers = answers;
      var s = score();
      state.answers = saved;
      return s;
    }
  };

  /* ---------------- Rendering ---------------- */
  function renderQuestion() {
    var i = state.index;
    var q = QUESTIONS[i];
    var pct = Math.round((i / QUESTIONS.length) * 100);
    var letters = ['A', 'B', 'C', 'D'];
    var html = '' +
      '<div class="quiz-progress" aria-hidden="true"><span></span></div>' +
      '<div class="quiz-meta">' +
        '<span>' + esc(t('quiz.question', 'Question')) + ' ' + (i + 1) + ' / ' + QUESTIONS.length + '</span>' +
        '<span class="tag fill">' + esc(t('quiz.level', 'Level')) + ' ' + q.level + '</span>' +
      '</div>' +
      '<h2 class="quiz-q" id="quiz-q"><span class="de" lang="de">' + esc(q.q) + '</span></h2>' +
      '<p class="quiz-hint">' + esc(t('quiz.hint', 'Choose the word that fits the gap.')) + '</p>' +
      '<ul class="options" role="list">';
    for (var k = 0; k < q.o.length; k++) {
      var sel = state.answers[i] === k ? ' selected' : '';
      html += '<li><button type="button" class="option' + sel + '" data-opt="' + k + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
        '<span class="key" aria-hidden="true">' + letters[k] + '</span><span class="de" lang="de">' + esc(q.o[k]) + '</span></button></li>';
    }
    html += '</ul>' +
      '<div class="quiz-nav">' +
        '<button type="button" class="btn btn-outline" id="quiz-back"' + (i === 0 ? ' disabled' : '') + '>' + esc(t('quiz.back', 'Back')) + '</button>' +
        '<button type="button" class="btn btn-blue" id="quiz-next"' + (state.answers[i] === null ? ' disabled' : '') + '>' +
          esc(i === QUESTIONS.length - 1 ? t('quiz.finish', 'See my result') : t('quiz.next', 'Next')) + ' <span class="arrow">→</span></button>' +
      '</div>';
    quizRoot.innerHTML = html;
    // Width via CSSOM (inline style attributes are blocked by the strict CSP)
    quizRoot.querySelector('.quiz-progress span').style.width = pct + '%';

    var opts = quizRoot.querySelectorAll('.option');
    for (var o = 0; o < opts.length; o++) {
      opts[o].addEventListener('click', function () {
        state.answers[state.index] = parseInt(this.getAttribute('data-opt'), 10);
        var all = quizRoot.querySelectorAll('.option');
        for (var z = 0; z < all.length; z++) { all[z].classList.remove('selected'); all[z].setAttribute('aria-pressed', 'false'); }
        this.classList.add('selected');
        this.setAttribute('aria-pressed', 'true');
        quizRoot.querySelector('#quiz-next').disabled = false;
      });
    }
    quizRoot.querySelector('#quiz-back').addEventListener('click', function () {
      if (state.index > 0) { state.index -= 1; renderQuestion(); focusQ(); }
    });
    quizRoot.querySelector('#quiz-next').addEventListener('click', function () {
      if (state.answers[state.index] === null) return;
      if (state.index < QUESTIONS.length - 1) { state.index += 1; renderQuestion(); focusQ(); }
      else { state.finished = true; renderResult(); }
    });
  }

  function focusQ() {
    var h = quizRoot.querySelector('#quiz-q');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false }); }
  }

  function resultTexts(level) {
    var r = RESULTS[level];
    return {
      title: t('quiz.result.' + level + '.title', r.title),
      body: t('quiz.result.' + level + '.body', r.body),
      course: t('quiz.result.' + level + '.course', r.course),
      wa: r.wa
    };
  }

  function renderResult() {
    var s = score();
    var r = resultTexts(s.level);
    var isAr = lang() === 'ar';
    var html = '' +
      '<div class="result-card" role="region" aria-labelledby="result-title">' +
        '<span class="glyph-bg" aria-hidden="true">✳</span>' +
        '<span class="label">' + esc(t('quiz.yourResult', 'Your result')) + '</span>' +
        '<div class="big-level" aria-label="' + esc(t('quiz.recommended', 'Recommended level')) + ' ' + s.level + '">' + s.level + (s.level === 'B2' ? '+' : '') + '</div>' +
        '<h2 class="h2" id="result-title" tabindex="-1">' + esc(r.title) + '</h2>' +
        '<p class="lead">' + esc(r.body) + '</p>' +
        '<p class="score">' + esc(t('quiz.score', 'Score')) + ': <strong>' + s.total + ' / ' + QUESTIONS.length + '</strong> · ' + esc(t('quiz.recommendedCourse', 'Recommended course')) + ': <strong>' + esc(r.course) + '</strong></p>' +
        '<div class="breakdown">' +
          '<div><b>' + s.per.A1 + '/5</b><span>A1</span></div>' +
          '<div><b>' + s.per.A2 + '/5</b><span>A2</span></div>' +
          '<div><b>' + s.per.B1 + '/5</b><span>B1</span></div>' +
        '</div>' +
        '<p class="score">' + esc(t('quiz.disclaimer', 'This quick test covers grammar and vocabulary only. Your final placement is confirmed by our team after a short speaking check.')) + '</p>' +
      '</div>' +
      '<div class="card mt-20">' +
        '<span class="label">' + esc(t('quiz.lead.eyebrow', 'Next step')) + '</span>' +
        '<h3 class="h3">' + esc(t('quiz.lead.title', 'Send your result to our team')) + '</h3>' +
        '<p>' + esc(t('quiz.lead.body', 'Leave your details and we will confirm your level, the next start date and your options — usually within a few hours.')) + '</p>' +
        '<form id="lead-form" class="form" novalidate>' +
          '<div class="form-grid">' +
            '<div class="field"><label for="lead-name">' + esc(t('form.name', 'Full name')) + '</label><input id="lead-name" name="name" type="text" autocomplete="name" required><span class="err">' + esc(t('form.required', 'This field is required.')) + '</span></div>' +
            '<div class="field"><label for="lead-phone">' + esc(t('form.phone', 'Phone / WhatsApp')) + '</label><input id="lead-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="+20 1xx xxx xxxx" required><span class="err">' + esc(t('form.required', 'This field is required.')) + '</span></div>' +
            '<div class="field full"><label for="lead-email">' + esc(t('form.email', 'Email')) + ' <span class="muted">(' + esc(t('form.optional', 'optional')) + ')</span></label><input id="lead-email" name="email" type="email" autocomplete="email" dir="ltr"><span class="err">' + esc(t('form.emailInvalid', 'Please enter a valid email address.')) + '</span></div>' +
          '</div>' +
          '<div class="btn-row">' +
            '<button type="submit" class="btn btn-wa" data-channel="whatsapp">' + waIcon() + ' ' + esc(t('quiz.lead.sendWa', 'Send via WhatsApp')) + '</button>' +
            '<button type="submit" class="btn btn-outline" data-channel="email">' + esc(t('quiz.lead.sendMail', 'Send by email instead')) + '</button>' +
          '</div>' +
          '<p class="form-note">' + esc(t('quiz.lead.note', 'Nothing is stored on this website. Your message opens in WhatsApp or your email app, and you send it yourself.')) + '</p>' +
        '</form>' +
        '<p id="lead-done" class="notice" hidden tabindex="-1">' + esc(t('quiz.lead.done', 'Thank you! If WhatsApp did not open, tap the floating WhatsApp button or email us at deutschdeluxe30@gmail.com.')) + '</p>' +
      '</div>' +
      '<div class="btn-row mt-20 jc-center">' +
        '<button type="button" class="btn btn-outline btn-sm" id="quiz-restart">' + esc(t('quiz.restart', 'Take the test again')) + '</button>' +
        '<a class="btn btn-sm btn-ink" href="courses.html">' + esc(t('quiz.viewCourses', 'View all courses')) + '</a>' +
      '</div>';
    quizRoot.innerHTML = html;

    var title = quizRoot.querySelector('#result-title');
    if (title) title.focus();

    quizRoot.querySelector('#quiz-restart').addEventListener('click', function () {
      state = { index: 0, answers: new Array(QUESTIONS.length).fill(null), finished: false };
      renderQuestion();
      focusQ();
    });

    var form = quizRoot.querySelector('#lead-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var req = form.querySelectorAll('input');
      for (var i = 0; i < req.length; i++) {
        var wrap = req[i].closest('.field');
        var valid = req[i].checkValidity();
        wrap.classList.toggle('error', !valid);
        if (!valid && ok) { req[i].focus(); ok = false; }
      }
      if (!ok) return;
      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var email = form.elements.email.value.trim();
      var text;
      if (isAr) {
        text = 'أهلًا دويتش ديلوكس! أنهيت اختبار تحديد المستوى على الموقع.\n' +
          'النتيجة: ' + s.total + '/' + QUESTIONS.length + ' (A1: ' + s.per.A1 + '/5، A2: ' + s.per.A2 + '/5، B1: ' + s.per.B1 + '/5)\n' +
          'المستوى المقترح: ' + s.level + ' — الكورس المقترح: ' + r.course + '\n' +
          'الاسم: ' + name + '\nالهاتف: ' + phone + (email ? '\nالبريد: ' + email : '') +
          '\nمن فضلكم أكدوا لي المستوى وموعد بداية المجموعة القادمة والأسعار.';
      } else {
        text = 'Hello Deutsch Deluxe! I just finished the placement test on your website.\n' +
          'Result: ' + s.total + '/' + QUESTIONS.length + ' (A1: ' + s.per.A1 + '/5, A2: ' + s.per.A2 + '/5, B1: ' + s.per.B1 + '/5)\n' +
          'Suggested level: ' + s.level + ' — recommended course: ' + r.course + '\n' +
          'Name: ' + name + '\nPhone: ' + phone + (email ? '\nEmail: ' + email : '') +
          '\nPlease confirm my level, the next start date and the fees.';
      }
      if (window.DD && window.DD.withRef) text = window.DD.withRef(text, 'result-' + s.level.toLowerCase());
      var channel = (e.submitter && e.submitter.getAttribute('data-channel')) || 'whatsapp';
      if (channel === 'email') {
        var subject = isAr ? 'نتيجة اختبار تحديد المستوى — ' + name : 'Placement test result — ' + name;
        location.href = 'mailto:' + (window.DD ? window.DD.email : 'deutschdeluxe30@gmail.com') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      } else {
        var url = window.DD ? window.DD.waUrl(text) : 'https://wa.me/201115578909?text=' + encodeURIComponent(text);
        window.open(url, '_blank', 'noopener');
      }
      var done = quizRoot.querySelector('#lead-done');
      done.hidden = false;
      done.focus();
    });
  }

  function waIcon() {
    return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.7 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>';
  }

  // Re-render in the current language whenever the toggle is used
  doc.addEventListener('dd:lang', function () {
    if (state.finished) renderResult(); else renderQuestion();
  });

  // Start button (intro card) -> first question
  var start = doc.getElementById('quiz-start');
  var intro = doc.getElementById('quiz-intro');
  if (start && intro) {
    quizRoot.hidden = true;
    start.addEventListener('click', function () {
      intro.hidden = true;
      quizRoot.hidden = false;
      renderQuestion();
      focusQ();
    });
  } else {
    renderQuestion();
  }
})();
