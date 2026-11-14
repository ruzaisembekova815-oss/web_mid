/* Renders saved bookings on my-tickets.html: list, counter, total,
   remove one by one, clear all, empty state. */
(function () {
  var list = document.getElementById('ticket-list');
  var empty = document.getElementById('tickets-empty');
  var summary = document.getElementById('tickets-summary');
  var clearBtn = document.getElementById('clear-all');

  function money(n) { return '$' + Number(n).toFixed(2); }

  function render() {
    var items = LO.bookings.read();
    list.innerHTML = '';

    if (items.length === 0) {
      empty.hidden = false;
      summary.hidden = true;
      clearBtn.hidden = true;
      return;
    }
    empty.hidden = true;
    summary.hidden = false;
    clearBtn.hidden = false;

    items.forEach(function (b) {
      var li = document.createElement('li');
      li.className = 'card ticket-item';
      li.setAttribute('data-id', b.id);

      var info = document.createElement('div');
      // textContent (not innerHTML) so user input can never inject HTML
      var title = document.createElement('h2');
      title.textContent = b.event;
      var details = document.createElement('p');
      details.textContent = b.date + ' | ' + b.type + ' | Seats: ' + (b.seats || 'none') +
        ' | Tickets: ' + b.qty + ' | ' + b.name;
      var price = document.createElement('p');
      price.innerHTML = '<strong></strong>';
      price.firstChild.textContent = money(b.total);
      info.appendChild(title);
      info.appendChild(details);
      info.appendChild(price);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-remove';
      btn.textContent = 'Remove';
      btn.setAttribute('aria-label', 'Remove booking for ' + b.event);
      btn.addEventListener('click', function () {
        LO.bookings.remove(b.id);
        render();
      });

      li.appendChild(info);
      li.appendChild(btn);
      list.appendChild(li);
    });

    document.getElementById('tickets-count').textContent = LO.bookings.count();
    document.getElementById('tickets-total').textContent = money(LO.bookings.total());
  }

  clearBtn.addEventListener('click', function () {
    LO.bookings.clear();
    render();
  });

  render();
})();