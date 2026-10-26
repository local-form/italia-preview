// Logo / wordmark: always back to the very top (the sticky header made a plain #top link land in place)
document.querySelectorAll('a[href="#top"]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
}));

// Open-now line and today's hours (hours from their current website; confirm with owner)
(function () {
  var HOURS = { 1: [11, 21], 2: [11, 21], 3: [11, 21], 4: [11, 21], 5: [11, 21], 6: [11, 21] };
  var now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
  var row = document.querySelector('.hours tr[data-d="' + d + '"]');
  if (row) row.classList.add('today');
  var line = document.getElementById('open-line'), t = HOURS[d];
  if (!line) return;
  if (t && h >= t[0] && h < t[1]) { line.textContent = 'Open now per listed hours · call to confirm'; line.classList.add('is-open'); }
  else if (t && h < t[0]) line.textContent = 'Opens today at 11am';
  else line.textContent = d === 0 || d === 6 ? 'Sunday hours: call ahead' : 'Closed now · opens tomorrow at 11am';
  if (d === 6 && h >= 21) line.textContent = 'Closed now · Sunday hours: call ahead';
})();

// Bottom Call/Order bar: shown once the hero buttons have scrolled away, hidden again while the footer is on screen
(function () {
  var bar = document.querySelector('.mbar'), foot = document.querySelector('.foot'), cta = document.querySelector('.hero .cta');
  if (!bar || !foot || !cta || !('IntersectionObserver' in window)) return;
  var heroGone = false, footIn = false;
  function sync() { bar.classList.toggle('is-shown', heroGone && !footIn); }
  document.documentElement.classList.add('has-bar');
  new IntersectionObserver(function (e) { heroGone = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; sync(); }).observe(cta);
  new IntersectionObserver(function (e) { footIn = e[0].isIntersecting; sync(); }).observe(foot);
})();

// standard scroll reveal (PREVIEW-STANDARD.md)
(() => {
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
  const n = new Map();
  els.forEach(e => { const p = e.parentElement, i = n.get(p) || 0; e.style.setProperty('--d', i * .08 + 's'); n.set(p, i + 1); });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .01, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
  setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-visible'); }), 1500);
})();

// Local Form request form (shared across previews): reads the request back and sends nothing.
document.querySelectorAll('form[data-lf-request]').forEach(form => {
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  form.querySelectorAll('input[type=date]').forEach(d => d.min = today.toISOString().slice(0, 10));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const parts = [...form.querySelectorAll('[data-sum]')].map(el => {
      if (el.type === 'radio') return el.checked ? el.value : '';
      let v = el.value.trim(); if (!v) return '';
      if (el.type === 'date') v = new Date(v + 'T00:00').toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'});
      return el.dataset.sum.replace('%', v);
    }).filter(Boolean);
    const name = (form.elements.name?.value || '').trim(), done = form.querySelector('.lf-done'), b = document.createElement('b'), p = document.createElement('span');
    b.textContent = `Your request: ${parts.join(' · ')}${name ? ` (for ${name})` : ''}`;
    p.textContent = form.dataset.lfConfirm;
    done.replaceChildren(b, p); done.hidden = false; done.scrollIntoView({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });
});
