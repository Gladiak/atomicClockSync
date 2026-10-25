export const normalizeSearch = value => String(value).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export function cityFromRow(row, catalog) {
  return { id: row[0], name: row[1], country: catalog.countries[row[2]] || row[2], region: catalog.regions[row[3]],
    timeZone: catalog.zones[row[4]], latitude: row[5], longitude: row[6] };
}
export function createCityIndex(catalog) {
  return catalog.cities.map(row => {
    const name = normalizeSearch(row[1]), aliases = row[8].split('|').map(normalizeSearch);
    return { name, aliases, key: [name, ...aliases, normalizeSearch(catalog.countries[row[2]]), row[2].toLowerCase(),
      normalizeSearch(catalog.regions[row[3]])].join('|') };
  });
}
export function searchCities(query, catalog, index, limit = 8) {
  const fullKey = normalizeSearch(query), words = fullKey.split(' ');
  const last = words.at(-1)?.toUpperCase();
  const country = words.length>1 && last.length===2 && catalog.countries[last] ? last : null;
  if(country)words.pop();
  const key = words.join(' ');
  if (key.length < 2) return [];
  const found = [];
  for (let i = 0; i < index.length; i++) {
    const item = index[i];
    if(country && catalog.cities[i][2]!==country)continue;
    if (!words.every(word => item.key.includes(word))) continue;
    const score = item.name === key || item.aliases.includes(key) ? 0 : item.name.startsWith(key) ? 1
      : item.aliases.some(a=>a.startsWith(key)) ? 3 : item.name.includes(key) ? 4 : 5;
    found.push({ i, score });
  }
  found.sort((a,b)=>a.score-b.score || a.i-b.i);
  return found.slice(0,limit).map(hit=>cityFromRow(catalog.cities[hit.i],catalog));
}
