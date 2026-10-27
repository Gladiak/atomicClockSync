import { stationFrameAt, audioEnvelope } from './stations.mjs';

const WINDOW_MS = 12000;
const WIDTH = 640;
const SOFTNESS_MS = 100;
const TRAIL_MS = 180;

function ease(value) {
  const u = Math.max(0, Math.min(1, value));
  return u * u * u * (u * (u * 6 - 15) + 10);
}

export function createWaveform({ svg, getNow, getSettings }) {
  const path = svg.querySelector('#wave-path');
  const cursor = svg.querySelector('#wave-cursor');
  const tail = svg.querySelector('#wave-cursor-trail');
  const gradient = svg.querySelector('#wave-cursor-fade');
  let cache;
  let visible = true;
  let animation = 0;
  let scaleX = 1, scaleY = 1;

  function build(windowStart, stationId, profile) {
    const edges = [];
    let frame = stationFrameAt(stationId, windowStart - 400);
    let base, previous, waveform = '';
    // Include prior samples so smoothing and the short trail remain continuous
    // at a 12-second window or station-frame boundary.
    for (let bin = -4; bin < 120; bin++) {
      const at = windowStart + bin * 100;
      if (at >= frame.start + frame.duration * 1000) frame = stationFrameAt(stationId, at);
      const elapsed = (at - frame.start) / 1000;
      const second = Math.floor(elapsed);
      const y = 12 + (1 - audioEnvelope(frame, second, elapsed - second + .00001, profile)) * 50;
      if (previous === undefined) base = y;
      else if (y !== previous) edges.push({ at, delta: y - previous });
      previous = y;
      if (bin >= 0) waveform += `${bin ? 'L' : 'M'}${bin * WIDTH / 120} ${y} H${(bin + 1) * WIDTH / 120} `;
    }
    path.setAttribute('d', waveform);
    return { windowStart, stationId, profile, base, edges };
  }

  function cursorY(at) {
    let y = cache.base;
    // Smooth the marker only; the plotted envelope and audio keep their exact
    // edges. Causal C2 transitions have no overshoot or anticipatory motion.
    for (const edge of cache.edges) {
      if (edge.at > at) break;
      y += edge.delta * ease((at - edge.at) / SOFTNESS_MS);
    }
    return y;
  }

  function draw(epoch) {
    const { stationId, wave } = getSettings();
    const windowStart = Math.floor(epoch / WINDOW_MS) * WINDOW_MS;
    if (!cache || cache.windowStart !== windowStart || cache.stationId !== stationId || cache.profile !== wave) {
      cache = build(windowStart, stationId, wave);
    }
    const x = (epoch - windowStart) / WINDOW_MS * WIDTH;
    cursor.setAttribute('transform', `translate(${x} ${cursorY(epoch)}) scale(${scaleX} ${scaleY})`);
    const start = Math.max(windowStart, epoch - TRAIL_MS);
    const samples = Math.max(1, Math.ceil((epoch - start) / 6));
    let trace = '';
    for (let i = 0; i <= samples; i++) {
      const at = start + (epoch - start) * i / samples;
      trace += `${i ? 'L' : 'M'}${((at - windowStart) / WINDOW_MS * WIDTH).toFixed(3)} ${cursorY(at).toFixed(3)} `;
    }
    tail.setAttribute('d', trace);
    gradient.setAttribute('x1', (start - windowStart) / WINDOW_MS * WIDTH);
    gradient.setAttribute('x2', Math.max(.001, x));
  }

  function tick() {
    animation = 0;
    if (!visible || document.hidden) return;
    draw(getNow());
    animation = requestAnimationFrame(tick);
  }

  function schedule() {
    if (animation) cancelAnimationFrame(animation);
    animation = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
  }

  new ResizeObserver(() => {
    const bounds = svg.getBoundingClientRect();
    if (bounds.width && bounds.height) {
      // Keep the dot round in screen pixels despite the stretched waveform.
      scaleX = WIDTH / bounds.width;
      scaleY = 80 / bounds.height;
    }
  }).observe(svg);
  document.addEventListener('visibilitychange', schedule);
  schedule();
  return { setVisible(value) { visible = value; schedule(); } };
}
