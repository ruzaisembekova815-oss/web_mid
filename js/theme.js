/* Criterion 2: theme toggle. Connect in <head> of EVERY page (no defer),
   so the saved theme is applied before the page is painted (no flash).
   ADJUST: NAV_SELECTOR must match the list inside your navbar. */
(function () {
  var KEY = 'lo-theme';
  var NAV_SELECTOR = 'nav ul';
  var root = document.documentElement;

  function getSaved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) { /* storage blocked: ignore */ }
  }
  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      var isDark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.textContent = isDark ? 'Light' : 'Dark';
      root.setAttribute('data-bs-theme', theme);
    }
  }

  // 1. Apply immediately
  apply(getSaved() === 'dark' || getSaved() === 'light' ? getSaved() : systemTheme());

  // 2. Build the button when the navbar exists
  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector(NAV_SELECTOR);
    if (!nav || document.getElementById('theme-toggle')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'theme-toggle';
    btn.className = 'theme-toggle';
    
    var holder = nav.tagName === 'UL' ? document.createElement('li') : nav;
    holder.appendChild(btn);
    if (holder !== nav) nav.appendChild(holder);
    holder.className = 'nav-item ms-md-auto';

    apply(root.getAttribute('data-theme'));

    // A real <button> works with Enter and Space, so keyboard support is built in
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      save(next);
    });
  });
})();