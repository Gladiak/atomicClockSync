// Motion only decorates navigation: visibility, focus and view lifecycles update
// synchronously, so previews and live audio never wait for an animation.
export function createSectionTransitions() {
  const nav = document.querySelector('.sidebar nav');
  const heading = document.querySelector('.page-header > div');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = [...nav.querySelectorAll('[data-page]')];
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.prepend(indicator);
  let selected = nav.querySelector('.selected');
  const animations = new Set();
  const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

  function positionIndicator() {
    indicator.style.height = `${selected.offsetHeight}px`;
    indicator.style.transform = `translateY(${selected.offsetTop}px)`;
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
  reducedMotion.addEventListener('change', cancel);

  return (previousPage, nextPage) => {
    if (previousPage === nextPage) {
      selected = nav.querySelector('.selected');
      positionIndicator();
      return;
    }
    // Read the rail's current visual position before cancelling: a second click
    // smoothly retargets it from wherever the previous animation has reached.
    const from = getComputedStyle(indicator).transform;
    const previousIndex = buttons.indexOf(selected);
    cancel();
    selected = nav.querySelector('.selected');
    const direction = buttons.indexOf(selected) < previousIndex ? -1 : 1;
    positionIndicator();
    if (reducedMotion.matches || document.hidden) return;

    animate(indicator, [{ transform: from }, { transform: indicator.style.transform }], 440);
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
