import { t, decimal, locale, dateTimeFormat, numberFormat, onLanguageChange } from './i18n.mjs';
import { moonState, lunarEvents, moonSurfaceLight } from './moon-math.mjs';
import { DAY, localDateKey } from './world-math.mjs';

const pad = value => String(value).padStart(2, '0');
const count = numberFormat({ maximumFractionDigits: 0 });
const utcDay = epoch => new Date(epoch).toISOString().slice(0, 10);
const validEpoch = epoch => Number.isFinite(epoch) && epoch >= Date.parse('1900-01-01T00:00Z') && epoch <= Date.parse('2100-12-31T23:59Z');
function texture(canvas) {
  const ctx = canvas.getContext('2d'), size = canvas.width;
  let seed = 88;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.fillStyle = '#b7b8b4'; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 180; i++) {
    const x = random()*size, y = random()*size, radius = 2 + random()*30;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, i < 35 ? '#333a3d70' : '#45484935'); gradient.addColorStop(1, '#6b6b6b00');
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI*2); ctx.fill();
    if (i > 35) {
      ctx.strokeStyle = '#eef0dd55'; ctx.lineWidth = .6;
      ctx.beginPath(); ctx.arc(x, y, radius*.62, .2, 3.5); ctx.stroke();
    }
  }
  const data = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < data.data.length; i += 4) {
    const grain = (random() - .5)*14;
    for (let c = 0; c < 3; c++) data.data[i+c] += grain;
  }
  return data;
}
export function createMoonView({ getNow, getObserver, chooseCity, getReference }) {
  const $ = id => document.getElementById(`moon-${id}`);
  const canvas = $('disc'), ctx = canvas.getContext('2d'), base = texture(canvas);
  let visible = false, timer, preview = null, cacheKey = '', state, events, drawnPhase = null;
  const eventCache = new Map();
  const quarterButtons = Array.from({length:4}, () => {
    const button = document.createElement('button'); button.className = 'moon-quarter';
    for (const tag of ['span','strong','small']) button.append(document.createElement(tag));
    button.firstElementChild.setAttribute('aria-hidden','true');
    button.addEventListener('click', () => setPreview(Number(button.dataset.epoch)));
    return button;
  });
  $('quarters').append(...quarterButtons);
  const localFormat = (epoch, city, options) => dateTimeFormat({ timeZone: city.timeZone, ...options }).format(epoch);
  function draw(phase) {
    if (drawnPhase !== null && Math.abs(phase - drawnPhase) < .01) return;
    drawnPhase = phase;
    const size = canvas.width, image = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const index = (y*size + x)*4, nx = (x+.5-size/2)/(size/2), ny = (y+.5-size/2)/(size/2);
      const light = moonSurfaceLight(nx, ny, phase);
      if (light === null) continue;
      const shade = .055 + .945*Math.pow(light, .57);
      for (let c = 0; c < 3; c++) image.data[index+c] = base.data[index+c]*shade;
      image.data[index+3] = Math.round(255*Math.min(1, (1 - Math.hypot(nx, ny))*size/2));
    }
    ctx.putImageData(image, 0, 0);
  }
  function render(force = false) {
    const epoch = preview ?? getNow(), city = getObserver();
    const key = `${Math.floor(epoch/60000)}:${city.latitude}:${city.longitude}:${city.timeZone}`;
    if (force || key !== cacheKey) {
      cacheKey = key;
      state = moonState(epoch, city);
      const dayKey = `${localDateKey(epoch, city.timeZone)}:${city.latitude}:${city.longitude}:${city.timeZone}`;
      events = eventCache.get(dayKey);
      if (!events || events.quarters[0].epoch <= epoch || events.fullMoon <= epoch || force) {
        events = lunarEvents(epoch, city);
        eventCache.set(dayKey, events);
        if (eventCache.size > 40) eventCache.delete(eventCache.keys().next().value);
      }
      draw(state.phase);
      $('phase').textContent = t(state.name);
      $('illumination').textContent = `${decimal(state.fraction*100, 1)}%`;
      $('distance').textContent = `${count.format(state.distanceKm)} km`;
      $('age').textContent = t("{0} days", events.previousNew === null ? '—' : decimal((epoch-events.previousNew)/DAY, 1));
      $('altitude').textContent = `${decimal(state.altitude, 1)}°`;
      $('azimuth').textContent = `${decimal(state.azimuth, 1)}°`;
      $('visibility').textContent = state.altitude > 0 ? t("ABOVE YOUR HORIZON") : t("BELOW YOUR HORIZON");
      $('visibility').classList.toggle('above', state.altitude > 0);
      $('direction').textContent = state.waxing ? t("WAXING / RIGHT SIDE LIT") : t("WANING / LEFT SIDE LIT");
      for (const field of ['rise', 'set']) $(field).textContent = events[field] === null ? t("No event today") : localFormat(events[field], city, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
      $('local-day').textContent = localFormat(epoch, city, { weekday: 'short', day: '2-digit', month: 'short' });
      $('observer').textContent = `⌖ ${city.name} ↗`;
      $('observer').title = t("{0} · {1} · choose observing city in World View", city.name, city.timeZone);
      $('zone').textContent = city.timeZone;
      events.quarters.forEach((event,index) => {
        const button = quarterButtons[index];
        button.dataset.epoch = event.epoch;
        button.disabled = !validEpoch(event.epoch);
        button.children[0].dataset.quarter = event.quarter;
        button.children[1].textContent = t(event.name);
        button.children[2].textContent = localFormat(event.epoch, city, { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hourCycle:'h23' });
      });
    }
    $('clock').textContent = localFormat(epoch, city, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    $('clock').dateTime = new Date(epoch).toISOString();
    $('mode').textContent = preview === null ? t("LIVE") : t("PREVIEW");
    $('mode').classList.toggle('preview', preview !== null);
    $('reference').textContent = preview === null ? getReference() : t("Independent preview");
    const seconds = Math.max(0, Math.floor((events.fullMoon-epoch)/1000));
    $('countdown').textContent = `${Math.floor(seconds/86400)}d ${pad(Math.floor(seconds/3600)%24)}h ${pad(Math.floor(seconds/60)%60)}m ${pad(seconds%60)}s`;
    if (document.activeElement !== $('date')) $('date').value = utcDay(epoch);
    if (document.activeElement !== $('hour')) $('hour').value = new Date(epoch).getUTCHours()*60 + new Date(epoch).getUTCMinutes();
    $('hour').setAttribute('aria-valuetext', `${pad(new Date(epoch).getUTCHours())}:${pad(new Date(epoch).getUTCMinutes())} UTC`);
    $('utc').textContent = `${pad(new Date(epoch).getUTCHours())}:${pad(new Date(epoch).getUTCMinutes())} UTC`;
    $('previous').disabled = !validEpoch(epoch-DAY);
    $('next').disabled = !validEpoch(epoch+DAY);
  }
  function setPreview(epoch) {
    if (!validEpoch(epoch)) return false;
    preview = epoch; render(true); return true;
  }
  $('observer').addEventListener('click', chooseCity);
  $('date').addEventListener('change', () => {
    const day = Date.parse(`${$('date').value}T00:00Z`), minutes = Number($('hour').value);
    if (!setPreview(day + minutes*60000)) render();
  });
  $('hour').addEventListener('input', () => {
    const epoch = preview ?? getNow(), day = Math.floor(epoch/DAY)*DAY;
    setPreview(day + Number($('hour').value)*60000);
  });
  for (const [id, days] of [['previous', -1], ['next', 1]]) $(id).addEventListener('click', () => setPreview((preview ?? getNow()) + days*DAY));
  $('live').addEventListener('click', () => { preview = null; cacheKey = ''; render(true); });
  onLanguageChange(() => { if (visible) render(true); });
  return { setVisible(value) {
    if (visible === value) return;
    visible = value; clearInterval(timer);
    if (value) { render(true); timer = setInterval(render, 1000); }
  } };
}
