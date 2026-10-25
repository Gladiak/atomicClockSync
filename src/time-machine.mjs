import { t, locale, dateTimeFormat, numberFormat, onLanguageChange } from './i18n.mjs';
import { HISTORICAL_EVENTS, HISTORICAL_SOURCES, historicalElapsed, normalizeMoments, parseMomentDate, capsuleIsOpen } from './time-machine-data.mjs';

const count = numberFormat();
const pad = value => String(value).padStart(2, '0');
const utcDate = dateTimeFormat({ timeZone:'UTC', day:'2-digit', month:'short', year:'numeric' });
const utcTime = dateTimeFormat({ timeZone:'UTC', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23' });
export function createTimeMachineView({ getNow, persist, notify }) {
  const $ = id => document.getElementById(`tm-${id}`);
  let saved;
  try { saved = JSON.parse(localStorage.getItem('atomic.moments')); } catch { /* Fresh local archive. */ }
  let moments = normalizeMoments(saved), selected = HISTORICAL_EVENTS.find(event => event.id === 'apollo');
  let visible = false, timer, preview = null, editing = null, deleting = null, personalKey = '', tab = 'history';
  const rows = new Map();
  function renderList() {
    const query = $('search').value.trim().toLowerCase(), category = $('category').value;
    $('events').replaceChildren(); rows.clear();
    const matches = HISTORICAL_EVENTS.filter(event => (category === 'all' || event.category === category)
      && `${event.title} ${t(event.title)} ${event.date} ${event.place} ${t(event.place)} ${event.detail} ${t(event.detail)} ${event.fact} ${t(event.fact)} ${event.era} ${t(event.era)}`.toLowerCase().includes(query));
    for (const event of matches) {
      const button = document.createElement('button');
      button.className = 'tm-event'; button.dataset.event = event.id;
      for (const [tag, text] of [['span', `${event.date.slice(0,4)} / ${t(event.category).toUpperCase()}`], ['strong', t(event.title)], ['small', utcDate.format(event.epoch)]]) {
        const node = document.createElement(tag); node.textContent = text; button.append(node);
      }
      button.addEventListener('click', () => { selected = event; preview = null; render(); revealSelected(); });
      $('events').append(button); rows.set(event.id, button);
    }
    $('empty').hidden = matches.length > 0;
    $('event-count').textContent = t("{0} / {1} MOMENTS", matches.length, HISTORICAL_EVENTS.length);
    if (matches.length && !matches.includes(selected)) { selected = matches[0]; preview = null; }
    $('exhibit').hidden = matches.length === 0;
    render();
    if (visible) revealSelected();
  }
  function revealSelected() {
    const row = rows.get(selected.id); if (!row) return;
    const list = $('events'), top = row.getBoundingClientRect().top-list.getBoundingClientRect().top;
    if (top < 0) list.scrollTop += top;
    else if (top + row.offsetHeight > list.clientHeight) list.scrollTop += top + row.offsetHeight-list.clientHeight;
  }
  function render() {
    const now = getNow(), elapsed = historicalElapsed(selected, now);
    for (const [id, row] of rows) row.setAttribute('aria-pressed', String(id === selected.id));
    $('stage').dataset.scene = selected.scene;
    $('stage').dataset.event = selected.id;
    $('era').textContent = t(selected.era);
    $('title').textContent = t(selected.title);
    $('place').textContent = t(selected.place);
    $('stamp').textContent = `${utcDate.format(selected.epoch)} · ${selected.precision === 'day' ? t('DATE ONLY') : utcTime.format(selected.epoch) + ' UTC'}`;
    $('story').textContent = t(selected.detail);
    $('fact').textContent = t(selected.fact);
    $('fact-label').textContent = t(selected.factLabel);
    $('source').dataset.reference = selected.source;
    $('source').textContent = t("{0} source ↗", HISTORICAL_SOURCES[selected.source].label);
    $('days').textContent = count.format(elapsed.days);
    $('subday').hidden = elapsed.precision === 'day';
    $('second-unit').hidden = elapsed.precision !== 'second';
    for (const unit of ['hours','minutes','seconds']) $(unit).textContent = pad(elapsed[unit] ?? 0);
    $('elapsed-label').textContent = elapsed.precision === 'day' ? t("CALENDAR DAYS SINCE · UTC DATE") : t("{0} SINCE THIS MOMENT", elapsed.precision === 'approximate' ? t("APPROXIMATE TIME") : t("TIME"));
    $('precision').textContent = { day:t("Date documented; no time of day assumed."), approximate:t("Historical time is approximate; counter shown to the minute."), minute:t("Documented to the minute."), second:t("Documented to the second.") }[selected.precision];
    $('travel').textContent = preview ? t("↺ Return to now") : t("↶ Explore this moment");
    $('travel').setAttribute('aria-pressed', String(preview !== null));
    $('mode').textContent = preview ? t("RECONSTRUCTION") : t("LIVE REFERENCE");
    const shown = preview ? selected.epoch + performance.now()-preview.started : now;
    const shownTime = preview && selected.precision !== 'second' ? utcTime.format(shown).slice(0,5) : utcTime.format(shown);
    $('clock').textContent = selected.precision === 'day' && preview ? utcDate.format(selected.epoch) : `${preview && selected.precision === 'approximate' ? '≈ ' : ''}${utcDate.format(shown)} · ${shownTime} UTC`;
    $('clock').dateTime = new Date(shown).toISOString();
    $('preview-note').textContent = preview ? t("Historical scene preview · elapsed counter still uses the real present.") : t("An original illustrated scene. Select a moment to begin your journey.");
    if (tab === 'personal') renderPersonal(now);
  }
  function save(next) {
    if (!persist('atomic.moments', next)) return false;
    moments = next; personalKey = ''; renderPersonal(getNow()); return true;
  }
  function resetForm() { editing = null; $('form').reset(); $('save').textContent = t("Save moment"); $('cancel').hidden = true; $('kind').disabled = false; $('form-status').textContent = ''; }
  function renderPersonal(now) {
    const key = `${Math.floor(now/1000)}:${moments.length}:${deleting}`;
    if (personalKey === key) return;
    personalKey = key;
    // Retain focused controls while ticking counters; rebuild only when the archive changes.
    const ids = moments.map(moment => moment.id).join(',') + ':' + deleting;
    if ($('moments').dataset.ids !== ids) {
      $('moments').dataset.ids = ids;
      $('moments').replaceChildren();
      for (const moment of [...moments].sort((a,b) => a.epoch-b.epoch)) {
        const card = document.createElement('article'); card.className = 'tm-personal-card'; card.dataset.moment = moment.id;
        const heading = document.createElement('div'); heading.className = 'tm-personal-heading';
        const title = document.createElement('h3'); title.textContent = moment.title;
        const badge = document.createElement('span'); badge.className = 'tm-personal-kind'; badge.textContent = moment.kind === 'capsule' ? t("TIME CAPSULE") : t("PERSONAL MOMENT"); heading.append(title,badge);
        const time = document.createElement('time'); time.textContent = `${utcDate.format(moment.epoch)} · ${utcTime.format(moment.epoch)} UTC`; time.dateTime = new Date(moment.epoch).toISOString();
        const duration = document.createElement('strong'); duration.className = 'tm-personal-duration';
        const note = document.createElement('p'); note.className = 'tm-personal-note';
        const actions = document.createElement('div'); actions.className = 'tm-personal-actions';
        const edit = document.createElement('button'); edit.textContent = t("Edit"); edit.className = 'text-button'; edit.dataset.action = 'edit';
        edit.addEventListener('click', () => {
          if (!capsuleIsOpen(moment,getNow())) return;
          editing = moment.id; $('title-input').value = moment.title; $('when').value = new Date(moment.epoch).toISOString().slice(0,16);
          $('kind').value = moment.kind; $('kind').disabled = moment.kind === 'capsule'; $('note').value = moment.note;
          $('save').textContent = t("Save changes"); $('cancel').hidden = false; $('title-input').focus();
        });
        const remove = document.createElement('button'); remove.className = 'text-button'; remove.textContent = t("Delete");
        remove.addEventListener('click', () => { deleting = moment.id; personalKey = ''; renderPersonal(getNow()); });
        actions.append(edit,remove);
        if (deleting === moment.id) {
          actions.replaceChildren();
          const label = document.createElement('span'); label.textContent = t("Delete this keepsake?");
          const confirm = document.createElement('button'); confirm.className = 'text-button'; confirm.textContent = t("Delete permanently"); confirm.dataset.action = 'confirm-delete';
          confirm.addEventListener('click', () => {
            if (save(moments.filter(item => item.id !== moment.id))) { if (editing === moment.id) resetForm(); deleting = null; personalKey = ''; renderPersonal(getNow()); $('title-input').focus(); }
          });
          const cancel = document.createElement('button'); cancel.className = 'text-button'; cancel.textContent = t("Keep it");
          cancel.addEventListener('click', () => { deleting = null; personalKey = ''; renderPersonal(getNow()); });
          actions.append(label,confirm,cancel);
        }
        card.append(heading,time,duration,note,actions); $('moments').append(card);
      }
    }
    for (const card of $('moments').children) {
      const moment = moments.find(item => item.id === card.dataset.moment), open = capsuleIsOpen(moment,now);
      const delta = historicalElapsed({ ...moment, precision:'minute' },now);
      card.querySelector('.tm-personal-duration').textContent = `${count.format(delta.days)}d ${pad(delta.hours)}h ${pad(delta.minutes)}m ${delta.past ? t("ago") : t("to go")}`;
      card.querySelector('.tm-personal-note').textContent = open ? (moment.note || t("A moment worth remembering.")) : t("SEALED · Your message opens on the date above.");
      const edit = card.querySelector('[data-action=edit]'); if (edit) edit.disabled = !open;
      card.classList.toggle('sealed',!open);
    }
    $('no-moments').hidden = moments.length > 0;
    $('moment-count').textContent = t("{0} / 100 LOCAL KEEPSAKES", moments.length);
  }
  $('search').addEventListener('input',renderList); $('category').addEventListener('change',renderList);
  $('travel').addEventListener('click', () => { preview = preview ? null : { started:performance.now() }; render(); });
  for (const button of document.querySelectorAll('[data-tm-tab]')) button.addEventListener('click', () => {
    tab = button.dataset.tmTab;
    for (const item of document.querySelectorAll('[data-tm-tab]')) item.setAttribute('aria-pressed',String(item === button));
    $('history').hidden = tab !== 'history'; $('personal').hidden = tab !== 'personal'; render();
  });
  $('cancel').addEventListener('click',resetForm);
  $('form').addEventListener('submit', event => {
    event.preventDefault();
    const epoch = parseMomentDate($('when').value), title = $('title-input').value.trim(), kind = $('kind').value, note = $('note').value.trim();
    if (epoch === null || !title || !['moment','capsule'].includes(kind)) { $('form-status').textContent = t("Enter a title and a valid UTC date between 1900 and 2100."); return; }
    if (kind === 'capsule' && !editing && (epoch <= getNow() || !note)) { $('form-status').textContent = t("A new capsule needs a future opening date and a message."); return; }
    if (!editing && moments.length >= 100) { $('form-status').textContent = t("Your archive is full. Delete a keepsake before adding another."); return; }
    const moment = { id:editing || crypto.randomUUID(),title:title.slice(0,80),epoch,kind,note:note.slice(0,2000) };
    const next = editing ? moments.map(item => item.id === editing ? moment : item) : [...moments,moment];
    // Invalidate the DOM identity when an existing title/date/note changes.
    if (save(next)) { $('moments').dataset.ids = ''; personalKey = ''; renderPersonal(getNow()); resetForm(); notify(kind === 'capsule' ? t("Time capsule sealed on this device.") : t("Your moment is saved on this device.")); }
  });
  onLanguageChange(() => { $('save').textContent = t(editing ? 'Save changes' : 'Save moment'); personalKey = ''; $('moments').dataset.ids = ''; renderList(); });
  renderList();
  return { setVisible(value) {
    if (value === visible) return;
    visible = value; clearInterval(timer);
    if (value) { render(); revealSelected(); timer = setInterval(render,1000); }
    else preview = null;
  } };
}
