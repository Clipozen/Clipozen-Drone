/* ==========================================================================
   Clipozen — script.js
   Navigation, scroll reveals, portfolio filter, enquiry form → WhatsApp
   ========================================================================== */

(function () {
  'use strict';

  var WA_NUMBER = '916382620012';
  var waLink = function (text) {
    return 'https://wa.me/' + WA_NUMBER + (text ? '?text=' + encodeURIComponent(text) : '');
  };

  /* ---------------------------------------------------------- Sticky nav */

  var nav = document.getElementById('nav');
  var menu = document.getElementById('menu');
  var burger = document.getElementById('burger');

  var onScroll = function () {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------------------------------------------------- Mobile menu */

  var setMenu = function (open) {
    if (!menu || !burger) return;
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ---------------------------------------------------------- Scroll reveal */

  var reveals = document.querySelectorAll('.rv');

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(reveals, function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------- Portfolio filter */

  var filterBar = document.querySelector('.filters');
  var tiles = document.querySelectorAll('.gallery .tile');

  if (filterBar && tiles.length) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-f]');
      if (!btn) return;

      Array.prototype.forEach.call(filterBar.querySelectorAll('button'), function (b) {
        b.classList.toggle('on', b === btn);
      });

      var want = btn.getAttribute('data-f');
      Array.prototype.forEach.call(tiles, function (tile) {
        var show = want === 'all' || tile.getAttribute('data-c') === want;
        tile.classList.toggle('hide', !show);
      });
    });
  }

  /* ---------------------------------------------------------- Enquiry form */

  var form = document.getElementById('form');
  var status = document.getElementById('status');
  var waBtn = document.getElementById('waBtn');

  var say = function (msg, kind) {
    if (!status) return;
    status.textContent = msg;
    status.className = 'status full' + (kind ? ' ' + kind : '');
  };

  var val = function (name) {
    var f = form && form.elements[name];
    return f && f.value ? f.value.trim() : '';
  };

  var prettyDate = function (iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '-' + parts[1] + '-' + parts[0];
  };

  var buildMessage = function () {
    var lines = ['Hi Clipozen, I\'d like to book a drone shoot.'];
    var add = function (label, v) { if (v) lines.push(label + ': ' + v); };

    add('Name', val('name'));
    add('Phone', val('phone'));
    add('Shoot type', val('type'));
    add('Package', val('package'));
    add('Shoot date', prettyDate(val('date')));
    add('Location', val('location'));
    add('Details', val('message'));

    return lines.join('\n');
  };

  if (form) {
    /* Keep the WhatsApp fallback button in sync as the form is filled in.
       There is no backend on this site, so WhatsApp is the delivery channel. */
    var syncWa = function () {
      if (waBtn) waBtn.href = waLink(buildMessage());
    };
    form.addEventListener('input', syncWa);
    form.addEventListener('change', syncWa);
    syncWa();

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var required = ['name', 'phone', 'type', 'location'];
      var firstBad = null;

      required.forEach(function (name) {
        var field = form.elements[name];
        if (!field) return;
        var empty = !field.value.trim();
        field.classList.toggle('err', empty);
        if (empty && !firstBad) firstBad = field;
      });

      var phone = val('phone').replace(/[^\d]/g, '');
      var phoneField = form.elements['phone'];
      if (!firstBad && phone.length < 10) {
        phoneField.classList.add('err');
        firstBad = phoneField;
        say('That phone number looks too short. Add all 10 digits so we can call you back.', 'bad');
        firstBad.focus();
        return;
      }

      if (firstBad) {
        say('Add your name, phone number, shoot type and location to continue.', 'bad');
        firstBad.focus();
        return;
      }

      say('Opening WhatsApp with your enquiry. Press send there and we\'ll reply shortly.', 'ok');
      window.open(waLink(buildMessage()), '_blank', 'noopener');
    });

    /* Clear the error outline as soon as a field is corrected */
    form.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('err');
    });

    /* Package buttons deep-link people into the form pre-filled */
    Array.prototype.forEach.call(document.querySelectorAll('.price .card'), function (card) {
      var name = card.querySelector('h3');
      var amt = card.querySelector('.amt');
      if (!name || !amt) return;
      var label = name.textContent.trim() + ' (' + amt.textContent.trim() + ')';
      card.addEventListener('click', function (e) {
        if (!e.target.closest('a')) return;
        var sel = form.elements['package'];
        if (!sel) return;
        Array.prototype.forEach.call(sel.options, function (opt) {
          if (opt.text === label) sel.value = opt.value || opt.text;
        });
        syncWa();
      });
    });
  }
})();
