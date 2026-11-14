/* jQuery effects (criterion 5). Load jQuery BEFORE this file.
   ADJUST: '.glossary h3' / '.glossary' to match your glossary markup on index.html.
   Needs '#result' on tickets.html and the .back-top class in CSS (see below). */
jQuery(function ($) {

  // Effect 1: smooth scroll for in-page links
  $('a[href^="#"]').on('click', function (e) {
    const $target = $(this.hash);
    if (this.hash.length > 1 && $target.length) {
      e.preventDefault();
      $('html, body').stop(true).animate({ scrollTop: $target.offset().top - 70 }, 500);
    }
  });

  // Effect 2: back-to-top button (fades in and out once, not on every scroll event)
  const $top = $('<button type="button" class="back-top" aria-label="Back to top">↑</button>')
    .hide().appendTo('body');
  let topVisible = false;

  $(window).on('scroll', function () {
    const show = $(this).scrollTop() > 400;
    if (show && !topVisible) {
      topVisible = true;
      $top.stop(true, true).fadeIn(200);
    } else if (!show && topVisible) {
      topVisible = false;
      $top.stop(true, true).fadeOut(200);
    }
  });

  $top.on('click', function () {
    $('html, body').stop(true).animate({ scrollTop: 0 }, 500);
  });

  // Effect 3: result block appears after a successful booking.
  // IMPORTANT: the form handler must call  $(document).trigger('ticket-booked');
  $(document).on('ticket-booked', function () {
    $('#result').stop(true, true).css({ opacity: 0, marginTop: 20 })
      .animate({ opacity: 1, marginTop: 0 }, 400);
  });

  // Effect 4: glossary accordion (a different kind of effect: slideToggle)
  $('.glossary h3').attr({ tabindex: 0, role: 'button', 'aria-expanded': 'true' })
    .on('click keydown', function (e) {
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const $h = $(this);
      $h.next('p').stop(true, true).slideToggle(200);
      $h.attr('aria-expanded', $h.attr('aria-expanded') !== 'true');
    });
});

/* ---- Add to your CSS (uses variables, works in both modes) ----

html { scroll-padding-top: 70px; }

.back-top {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent-text);
  font-size: 1.25rem;
  cursor: pointer;
  z-index: 50;
  transition: transform .15s ease;
}
.back-top:hover { transform: translateY(-2px); }
.back-top:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }

.glossary h3 { cursor: pointer; }
*/