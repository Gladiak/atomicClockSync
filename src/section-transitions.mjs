// Motion only decorates navigation: visibility, focus and view lifecycles update
// synchronously, so previews and live audio never wait for an animation.
export function createSectionTransitions() {
  const sidebar = document.querySelector('.sidebar');
  const nav = sidebar.querySelector('nav');
  const heading = document.querySelector('.page-header > div');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = [...sidebar.querySelectorAll('[data-page]')];
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.prepend(indicator);
  let selected = sidebar.querySelector('.selected');
  let lastSelected = selected;
  const animations = new Set();
  const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

  function positionIndicator() {
    if (!selected || !nav.contains(selected) || selected.closest('[inert]')) { indicator.hidden = true; return; }
    indicator.hidden = false;
    const item = selected.getBoundingClientRect(), rail = nav.getBoundingClientRect();
    indicator.style.height = `${Math.max(0, item.height - 14)}px`;
    indicator.style.left = `${item.left - rail.left + 1}px`;
    indicator.style.width = '1px';
    indicator.style.right = 'auto';
    indicator.style.transform = `translateY(${item.top - rail.top + nav.scrollTop + 7}px)`;
  }
  function cancel() {
    for (const animation of animations) animation.cancel();
    animations.clear();
  }
  function animate(element, keyframes, duration) {
    const animation = element.animate(keyframes, { duration, easing });
    animations.add(animation);
    animation.onfinish = animation.oncancel = () => animations.delete(animation);
  }
  positionIndicator();
  const layout = new ResizeObserver(positionIndicator);
  layout.observe(nav);
  for (const panel of nav.querySelectorAll('.nav-group-collapse')) layout.observe(panel);
  nav.addEventListener('sidebar-layout', () => {
    for (const animation of indicator.getAnimations()) animation.cancel();
    selected = sidebar.querySelector('.selected');
    positionIndicator();
  });
  reducedMotion.addEventListener('change', cancel);

  return (previousPage, nextPage) => {
    if (previousPage === nextPage) {
      selected = sidebar.querySelector('.selected');
      lastSelected = selected;
      positionIndicator();
      return;
    }
    // Read the rail's current visual position before cancelling: a second click
    // smoothly retargets it from wherever the previous animation has reached.
    const from = getComputedStyle(indicator).transform;
    const previousIndex = buttons.indexOf(lastSelected);
    cancel();
    selected = sidebar.querySelector('.selected');
    lastSelected = selected;
    const direction = buttons.indexOf(selected) < previousIndex ? -1 : 1;
    positionIndicator();
    if (reducedMotion.matches || document.hidden) return;

    if (!indicator.hidden && nav.dataset.reflow !== 'true') animate(indicator, [{ transform: from }, { transform: indicator.style.transform }], 440);
    animate(nextPage, [
      { opacity: 0, transform: `translate3d(${direction * 22}px, 8px, 0) scale(0.985)` },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', offset: 1 },
    ], 460);
    animate(heading, [
      { opacity: 0, transform: 'translate3d(0, 7px, 0)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    ], 340);
  };
}
