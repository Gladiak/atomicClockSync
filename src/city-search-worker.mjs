import { createCityIndex, searchCities } from './city-search.mjs';
let catalog, index;
const ready = fetch(new URL('../assets/world/cities.json', import.meta.url)).then(response => {
  if (!response.ok) throw new Error('City catalog unavailable');
  return response.json();
}).then(data => {
  catalog = data; index = createCityIndex(data);
  postMessage({ type: 'ready', count: data.cities.length });
}).catch(() => { postMessage({ type: 'error' }); });
onmessage = async ({ data }) => {
  await ready;
  if (!catalog || !index) return;
  postMessage({ type: 'results', request: data.request, cities: searchCities(data.query, catalog, index) });
};
