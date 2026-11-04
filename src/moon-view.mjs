import {createMoonSurface} from './moon-surface.mjs';
import { t, decimal, locale, dateTimeFormat, numberFormat, onLanguageChange } from './i18n.mjs';
import { moonState, lunarEvents } from './moon-math.mjs';
import { DAY, localDateKey } from './world-math.mjs';

const pad = value => String(value).padStart(2, '0');
const count = numberFormat({ maximumFractionDigits: 0 });
const utcDay = epoch => new Date(epoch).toISOString().slice(0, 10);
const validEpoch = epoch => Number.isFinite(epoch) && epoch >= Date.parse('1900-01-01T00:00Z') && epoch < Date.UTC(2101,0,1);
export function createMoonView({ onPreviewChange, getNow, getObserver, chooseCity, getReference }) {
  const $ = id => document.getElementById(`moon-${id}`);
  const surface=createMoonSurface($('disc'),{minimumSize:512,onSurfaceChange:paintSurfaceCredit});
  let visible = false, timer, preview = null, cacheKey = '', state, events;
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
  function paintSurfaceCredit(){
    const photographic=surface.isPhotographic();
    $('terrain').hidden=photographic;
    $('terrain').textContent=t('ILLUSTRATIVE TERRAIN · PHASE ORIENTATION SCHEMATIC');
    $('texture-source').textContent=t('NASA LRO / LROC · CALCULATED PHASE')+' ↗';
    $('texture-source').hidden=!photographic;
    $('stage').setAttribute('aria-label',t(photographic?'Calculated lunar phase with NASA surface imagery':'Calculated lunar phase with illustrative terrain'));
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
      surface.draw(state.phase);
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
  function setPreview(epoch, announce=true) {
    if (!validEpoch(epoch)) return false;
    preview = epoch; if(visible)render(true); if(announce)onPreviewChange?.(epoch); return true;
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
  $('live').addEventListener('click', () => { preview = null; cacheKey = ''; render(true); onPreviewChange?.(null); });
  onLanguageChange(() => { paintSurfaceCredit();if (visible) render(true); });
  return {getEpoch:()=>preview??getNow(),setPreview(value){if(value===null){preview=null;cacheKey='';if(visible)render(true);}else setPreview(value,false);}, setVisible(value) {
    if (visible === value) return;
    visible = value;surface.setVisible(value); clearInterval(timer);
    if (value) { render(true); timer = setInterval(render, 1000); }
  } };
}
