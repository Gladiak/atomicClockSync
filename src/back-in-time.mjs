// Film wall times interpreted in Hill Valley's California time zone.
// Sources and the Pacific-time convention are documented in docs/THIRD_PARTY.md.
export const MOVIE_DATES = Object.freeze([
  { id: 'west', title: 'The Old West', date: 'SEP 02 1885', epoch: Date.parse('1885-09-02T08:00:00-08:00'), part: 'PART III', icon: '✳', tagline: 'Eight horses. Still no roads.', detail: 'Marty arrives in 1885. The DeLorean could use a little horsepower.' },
  { id: 'arrival', title: 'Hello, 1955', date: 'NOV 05 1955', epoch: Date.parse('1955-11-05T06:00:00-08:00'), part: 'PART I', icon: '↶', tagline: 'A rather unexpected detour.', detail: 'The time-circuit destination that starts it all. Mind the pine tree.' },
  { id: 'lightning', title: 'Save the clock tower', date: 'NOV 12 1955', epoch: Date.parse('1955-11-12T22:04:00-08:00'), part: 'PART I', icon: 'ϟ', tagline: 'One bolt. A very tight schedule.', detail: '10:04 PM. A lightning bolt, a clock tower and some spectacular timing.' },
  { id: 'pines', title: 'Twin Pines Mall', date: 'OCT 26 1985', epoch: Date.parse('1985-10-26T01:21:00-07:00'), part: 'PART I', icon: '⌁', tagline: 'Einstein is one minute ahead.', detail: 'The first successful test. Einstein returns; the parking lot gets interesting.' },
  { id: 'future', title: 'Welcome to the future', date: 'OCT 21 2015', epoch: Date.parse('2015-10-21T16:29:00-07:00'), part: 'PART II', icon: '↗', tagline: 'Where is my hoverboard?', detail: 'Marty, Doc and Jennifer arrive in 2015. Hoverboards were supposed to be a thing.' },
]);

const pacific = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const pad = value => String(value).padStart(2, '0');
const number = new Intl.NumberFormat('en-US');
export function hillValleyTime(epoch) {
  return Object.fromEntries(pacific.formatToParts(epoch).filter(p => p.type !== 'literal').map(p => [p.type, p.value.toUpperCase()]));
}
export function elapsedTime(eventEpoch, nowEpoch) {
  const seconds = Math.floor(Math.abs(nowEpoch - eventEpoch) / 1000);
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60, past: nowEpoch >= eventEpoch };
}

const segments = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'].map(s => new Set(s));
const polygons = [
  ['a', '5,2 21,2 24,5 21,8 5,8 2,5'], ['b', '22,9 25,6 25,24 22,27 19,24 19,12'],
  ['c', '22,29 25,32 25,50 22,53 19,50 19,32'], ['d', '5,51 18,51 21,54 18,57 5,57 2,54'],
  ['e', '1,32 4,29 7,32 7,50 4,53 1,50'], ['f', '1,9 4,6 7,9 7,24 4,27 1,24'],
  ['g', '5,25 18,25 21,28 18,31 5,31 2,28'],
];
function digit() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 27 59');
  svg.setAttribute('aria-hidden', 'true');
  for (const [name, points] of polygons) {
    const shape = document.createElementNS(svg.namespaceURI, 'polygon');
    shape.setAttribute('points', points);
    shape.dataset.segment = name;
    svg.append(shape);
  }
  return svg;
}
function createCircuit(id, label) {
  const root = document.getElementById(id);
  const fields = ['month', 'day', 'year', 'hour', 'minute'].map((name, index) => {
    const field = document.createElement('div');
    field.className = 'bttf-field';
    const caption = document.createElement('span');
    caption.textContent = ['MONTH', 'DAY', 'YEAR', 'HOUR', 'MIN'][index];
    const display = document.createElement('div');
    display.className = 'bttf-led';
    if (index) for (let i = 0; i < (index === 2 ? 4 : 2); i++) display.append(digit());
    field.append(caption, display);
    root.append(field);
    return { name, display };
  });
  const plate = document.createElement('strong');
  plate.className = 'bttf-circuit-label';
  plate.textContent = label;
  root.append(plate);
  return epoch => {
    const time = hillValleyTime(epoch);
    for (const { name, display } of fields) {
      const value = time[name];
      if (display.dataset.value === value) continue;
      display.dataset.value = value;
      if (name === 'month') display.textContent = value;
      else [...display.children].forEach((svg, i) => {
        for (const shape of svg.children) shape.classList.toggle('lit', segments[Number(value[i])].has(shape.dataset.segment));
      });
    }
    root.setAttribute('aria-label', `${label}: ${time.month} ${time.day}, ${time.year}, ${time.hour}:${time.minute} Pacific time`);
  };
}

export function createBackInTimeView({ getNow, getReference }) {
  const $ = id => document.getElementById(`bttf-${id}`);
  const page = document.getElementById('page-back-in-time');
  const destination = createCircuit('bttf-destination', 'DESTINATION TIME');
  const present = createCircuit('bttf-present', 'PRESENT TIME');
  const departed = createCircuit('bttf-departed', 'LAST TIME DEPARTED');
  let selected = MOVIE_DATES.at(-1), visible = false, timer, frame;
  let preview = null, departure = null, pendingDeparture = null, jumping = false, arrivalOpen = false;
  const cards = MOVIE_DATES.map(event => {
    const button = document.createElement('button');
    button.className = 'bttf-date-card';
    button.dataset.destination = event.id;
    for (const [tag, text, className] of [
      ['span', `${event.icon}  ${event.part}`, 'bttf-card-part'], ['time', event.date, 'bttf-card-date'],
      ['strong', event.title, 'bttf-card-title'], ['span', event.tagline, 'bttf-card-tagline'], ['small', '', 'bttf-card-age'],
    ]) {
      const child = document.createElement(tag);
      child.className = className;
      child.textContent = text;
      if (tag === 'time') child.dateTime = new Date(event.epoch).toISOString();
      button.append(child);
    }
    button.addEventListener('click', () => {
      if (jumping || arrivalOpen) return;
      selected = event;
      render();
    });
    $('dates').append(button);
    return button;
  });
  function render() {
    const now = getNow(), elapsed = elapsedTime(selected.epoch, now);
    destination(selected.epoch);
    present(preview ? preview.epoch + now - preview.started : now);
    departed(departure ?? MOVIE_DATES.find(event => event.id === 'pines').epoch);
    $('reference').textContent = preview ? 'CINEMATIC PREVIEW' : getReference();
    $('days').textContent = number.format(elapsed.days);
    for (const field of ['hours', 'minutes', 'seconds']) $(field).textContent = pad(elapsed[field]);
    $('elapsed-label').textContent = elapsed.past ? (selected.id === 'future' ? 'THE FUTURE IS ALREADY HISTORY' : 'TIME SINCE THIS MOVIE MOMENT') : 'TIME UNTIL THIS MOVIE MOMENT';
    $('event-title').textContent = selected.title;
    $('event-detail').textContent = selected.detail;
    $('duration').setAttribute('aria-label', `${elapsed.days} days, ${elapsed.hours} hours, ${elapsed.minutes} minutes, ${elapsed.seconds} seconds ${elapsed.past ? 'since' : 'until'} ${selected.title}`);
    cards.forEach((card, i) => {
      card.setAttribute('aria-pressed', String(MOVIE_DATES[i] === selected));
      card.disabled = jumping || arrivalOpen;
      const age = elapsedTime(MOVIE_DATES[i].epoch, now);
      card.lastElementChild.textContent = `${number.format(age.days)} DAYS ${age.past ? 'AGO' : 'AWAY'}`;
    });
    $('reset').disabled = !preview || jumping || arrivalOpen;
  }
  function closeArrival() {
    arrivalOpen = false;
    $('arrival').hidden = true;
    page.querySelector('.bttf-rack').inert = false;
    page.querySelector('.bttf-reactor').inert = false;
    render();
  }
  function finishJump() {
    jumping = false;
    departure = pendingDeparture;
    page.classList.remove('bttf-jumping');
    preview = { epoch: selected.epoch, started: getNow() };
    $('speed').textContent = '88';
    $('circuit-status').textContent = '● DISPLACED';
    $('reactor-note').textContent = 'Temporal displacement complete. Please account for your pine trees.';
    $('jump').disabled = false;
    $('arrival-note').textContent = `${selected.date} · ${selected.title}. You made it. The space-time continuum seems mostly fine.`;
    arrivalOpen = true;
    $('arrival').hidden = false;
    page.querySelector('.bttf-rack').inert = true;
    page.querySelector('.bttf-reactor').inert = true;
    render();
    $('continue').focus();
  }
  $('jump').addEventListener('click', () => {
    if (jumping || arrivalOpen) return;
    const now = getNow();
    pendingDeparture = preview ? preview.epoch + now - preview.started : now;
    jumping = true;
    $('jump').disabled = true;
    $('circuit-status').textContent = '● CHARGING';
    $('reactor-note').textContent = 'Flux capacitor charging. Hold on to your almanac.';
    render();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finishJump(); return; }
    page.classList.add('bttf-jumping');
    const started = performance.now();
    function accelerate(mono) {
      const progress = Math.min(1, (mono - started) / 2800);
      $('speed').textContent = pad(Math.floor(88 * progress));
      if (progress < 1) frame = requestAnimationFrame(accelerate);
      else finishJump();
    }
    frame = requestAnimationFrame(accelerate);
  });
  $('continue').addEventListener('click', () => { closeArrival(); $('reset').focus(); });
  $('arrival').setAttribute('role', 'region');
  $('arrival').setAttribute('aria-label', 'Temporal displacement complete. Grande Giove!');
  $('reset').addEventListener('click', () => {
    departure = preview ? preview.epoch + getNow() - preview.started : departure;
    preview = null;
    $('speed').textContent = '00';
    $('circuit-status').textContent = '● ONLINE';
    $('reactor-note').textContent = 'Back in the present. The future is still yours to make.';
    render();
    $('jump').focus();
  });
  return {
    setVisible(value) {
      if (value === visible) return;
      visible = value;
      clearInterval(timer);
      if (visible) { render(); timer = setInterval(render, 250); }
      else {
        cancelAnimationFrame(frame);
        jumping = false;
        page.classList.remove('bttf-jumping');
        closeArrival();
        $('jump').disabled = false;
        $('speed').textContent = preview ? '88' : '00';
        $('circuit-status').textContent = preview ? '● DISPLACED' : '● ONLINE';
        $('reactor-note').textContent = preview ? 'Temporal displacement complete.' : 'Flux dispersal: stable. One very questionable idea: ready.';
      }
    },
  };
}
