/* Criterion 3: saved user data (bookings) in localStorage as JSON.
   Connect on EVERY page (before the page's own script) so the navbar counter works everywhere.
   Navbar markup to add on every page:
   <li><a href="my-tickets.html">My tickets <span class="nav-count" data-bookings-count>0</span></a></li>
*/
var LO = window.LO || {};

LO.bookings = (function () {
  var KEY = 'lo-bookings';

  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(data) ? data : [];   // works when storage is empty or broken
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
    updateCounter();
  }

  function add(booking) {
    var list = read();
    booking.id = Date.now() + '-' + Math.floor(Math.random() * 1000);
    list.push(booking);
    write(list);
    return booking;
  }

  function remove(id) {
    write(read().filter(function (b) { return b.id !== id; }));
  }

  function clear() {
    write([]);
  }

  function count() {
    return read().reduce(function (sum, b) { return sum + (Number(b.qty) || 0); }, 0);
  }

  function total() {
    return read().reduce(function (sum, b) { return sum + (Number(b.total) || 0); }, 0);
  }

  function updateCounter() {
    var n = count();
    var els = document.querySelectorAll('[data-bookings-count]');
    for (var i = 0; i < els.length; i++) els[i].textContent = n;
  }

  document.addEventListener('DOMContentLoaded', updateCounter);

  return { read: read, add: add, remove: remove, clear: clear, count: count, total: total };
})();