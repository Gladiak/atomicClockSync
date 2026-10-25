import { build } from 'esbuild';
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(`${root}assets/world`, { recursive: true });
await build({ entryPoints: [`${root}scripts/world-vendor-entry.mjs`], outfile: `${root}assets/world/vendor.mjs`,
  bundle: true, format: 'esm', minify: true, target: 'es2022', legalComments: 'eof' });
const vendorPath = `${root}assets/world/vendor.mjs`;
await writeFile(vendorPath, (await readFile(vendorPath,'utf8')).split('\n').map(line=>line.trimEnd()).join('\n').trimEnd()+'\n');
await copyFile(`${root}node_modules/world-atlas/countries-50m.json`, `${root}assets/world/countries-50m.json`);
let notices = 'WORLD VIEW — THIRD-PARTY SOFTWARE LICENSES\n\n';
for (const name of ['d3-geo', 'd3-array', 'internmap', 'topojson-client', 'astronomy-engine', 'world-atlas']) {
  const pkg = JSON.parse(await readFile(`${root}node_modules/${name}/package.json`, 'utf8'));
  const license = name === 'astronomy-engine'
    ? (await readFile(`${root}node_modules/${name}/esm/astronomy.js`, 'utf8')).split('*/', 1)[0] + '*/'
    : await readFile(`${root}node_modules/${name}/LICENSE`, 'utf8');
  notices += `${name} ${pkg.version}\n${license}\n\n`;
}
await writeFile(`${root}assets/world/SOFTWARE_LICENSES.txt`, notices.trimEnd()+'\n');
console.log('Built offline cartography and astronomy bundle, map and license notices.');
