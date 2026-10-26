import { t, onLanguageChange } from './i18n.mjs';

const KEY = 'atomic.sidebar.v1';
export function createSidebar({ persist }) {
  const sidebar = document.querySelector('.sidebar');
  const nav = sidebar.querySelector('nav'), handle = document.getElementById('sidebar-toggle');
  const groups = [...nav.querySelectorAll('[data-nav-group]')];
  const toggle = group => group.querySelector('.nav-group-toggle');
  const panel = group => group.querySelector('.nav-group-collapse');
  let expanded = 'signal', wide = false, hover = false, latched = false;
  let suppressHover = false, suppressFocus = false, layoutTimer, leaveTimer;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved?.version === 1 && (saved.expanded === null || groups.some(group => group.dataset.navGroup === saved.expanded))) expanded = saved.expanded;
  } catch { /* Unreadable preferences use the initial signal group. */ }
  function badges() {
    for (const group of groups) {
      const selected = group.querySelector('.nav-item.selected');
      group.classList.toggle('has-current-page', Boolean(selected));
      const name = group.querySelector('.nav-group-label').textContent;
      toggle(group).title = selected ? `${name} · ${selected.textContent.trim()}` : name;
    }
    for(const button of sidebar.querySelectorAll('.sidebar-utilities [data-page]'))button.title=button.textContent.trim();
    handle.setAttribute('aria-label', t(wide ? 'Collapse navigation' : 'Expand navigation'));
    handle.title = handle.getAttribute('aria-label');
  }
  function apply(animate = true) {
    nav.classList.toggle('sidebar-initializing', !animate);
    for (const group of groups) {
      const open = wide && group.dataset.navGroup === expanded, content = panel(group);
      toggle(group).setAttribute('aria-expanded', String(open));
      content.setAttribute('aria-hidden', String(!open));
      if (!open && content.contains(document.activeElement)) toggle(group).focus({ preventScroll: true });
      content.inert = !open;
    }
    badges();
    clearTimeout(layoutTimer);
    nav.dataset.reflow = 'true';
    nav.dispatchEvent(new Event('sidebar-layout'));
    layoutTimer = setTimeout(() => {
      delete nav.dataset.reflow;
      nav.classList.remove('sidebar-initializing');
      nav.dispatchEvent(new Event('sidebar-layout'));
    }, animate ? 300 : 0);
  }
  function setWide(value) {
    if (value === wide) return;
    wide = value;
    sidebar.classList.toggle('is-expanded', wide);
    sidebar.dataset.expanded = String(wide);
    handle.setAttribute('aria-expanded', String(wide));
    apply();
  }
  function keyboardFocus() {
    return !suppressFocus && sidebar.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
  }
  function updateWidth() { setWide((hover && !suppressHover) || latched || keyboardFocus()); }
  sidebar.addEventListener('pointerenter', () => { clearTimeout(leaveTimer); hover = true; updateWidth(); });
  sidebar.addEventListener('pointerleave', event => {
    hover = false; suppressHover = false;
    if (event.pointerType === 'touch') { latched = true; return; }
    latched = false;
    leaveTimer = setTimeout(updateWidth, 150);
  });
  // Also handle an explicit opener when the pointer is already outside the
  // rail (for example an accessibility click), without requiring a re-entry.
  document.addEventListener('pointermove', event => {
    if (latched && event.pointerType !== 'touch' && !sidebar.contains(event.target)) {
      latched = false; hover = false; clearTimeout(leaveTimer);
      leaveTimer = setTimeout(updateWidth, 150);
    }
  });
  sidebar.addEventListener('focusin', event => {
    clearTimeout(leaveTimer);
    if (event.target !== handle) suppressFocus = false;
    updateWidth();
  });
  sidebar.addEventListener('focusout', () => queueMicrotask(updateWidth));
  handle.addEventListener('click', () => {
    if (wide) { latched = false; suppressHover = true; suppressFocus = true; setWide(false); }
    else { latched = true; suppressHover = false; setWide(true); }
  });
  document.addEventListener('pointerdown', event => {
    if (!sidebar.contains(event.target)) { latched = false; queueMicrotask(updateWidth); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hover = latched = false; suppressFocus = true; setWide(false); }
  });
  function open(id) {
    if (expanded === id) return;
    expanded = id; apply(); persist(KEY, { version: 1, expanded });
  }
  for (const [index, group] of groups.entries()) {
    const button = toggle(group), id = group.dataset.navGroup;
    button.addEventListener('click', () => {
      if (!wide) { latched = true; setWide(true); open(id); }
      else open(expanded === id ? null : id);
    });
    group.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault(); if (expanded === id) open(null); button.focus();
      } else if (event.target === button) {
        if (event.key === 'ArrowRight') { event.preventDefault(); setWide(true); if (expanded !== id) open(id); else group.querySelector('[data-page]').focus(); }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); toggle(groups[(index + (event.key === 'ArrowDown' ? 1 : groups.length - 1)) % groups.length]).focus(); }
        if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); toggle(event.key === 'Home' ? groups[0] : groups.at(-1)).focus(); }
      }
    });
  }
  apply(false);
  onLanguageChange(badges);
  return {
    revealSelection(reveal = true) {
      const group = nav.querySelector('.nav-item.selected')?.closest('[data-nav-group]');
      if (group && reveal) open(group.dataset.navGroup);
      badges();
    }
  };
}
