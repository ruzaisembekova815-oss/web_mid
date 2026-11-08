$(function () {
  // 1. Smooth scroll for in-page links (#weekend, #points, #terms...)
  $('a[href^="#"]').on('click', function (e) {
    const $target = $(this.hash);
    if (this.hash.length > 1 && $target.length) {
      e.preventDefault();
      $('html, body').stop(true).animate({ scrollTop: $target.offset().top - 70 }, 500);
    }
  });

  // 2. Back-to-top button: created by jQuery, fades in after scrolling
  const $top = $('<button type="button" class="back-top" aria-label="Back to top">↑</button>')
    .hide().appendTo('body');
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 400) $top.stop(true, true).fadeIn(200);
    else $top.stop(true, true).fadeOut(200);
  });
  $top.on('click', function () {
    $('html, body').stop(true).animate({ scrollTop: 0 }, 500);
  });

  // 3. The ticket slides in after booking (event sent from tickets.js)
  $(document).on('ticket-booked', function () {
    $('#result').stop(true, true).css({ opacity: 0, marginTop: 20 })
      .animate({ opacity: 1, marginTop: 0 }, 400);
  });
});