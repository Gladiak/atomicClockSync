"""Prepare offline GeoNames assets. Usage: python3 scripts/prepare-cities.py dump.zip admin1.txt countryInfo.txt"""
import sys, json, zipfile, unicodedata, hashlib
from pathlib import Path
from datetime import datetime, timezone

root = Path(__file__).resolve().parents[1]
out = root / 'assets/world'
out.mkdir(parents=True, exist_ok=True)
source, admin_file, country_file = map(Path, sys.argv[1:4])
regions = {line.split('\t')[0]: line.split('\t')[1] for line in admin_file.read_text().splitlines() if line and not line.startswith('#')}
countries = {line.split('\t')[0]: line.split('\t')[4] for line in country_file.read_text().splitlines() if line and not line.startswith('#')}
def normalized(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s.casefold()) if not unicodedata.combining(c))
region_names, zones, rows = [], [], []
def index(items, value):
    if value not in items: items.append(value)
    return items.index(value)
with zipfile.ZipFile(source) as archive:
    lines = archive.read('cities1000.txt').decode('utf8').splitlines()
for line in lines:
    c = line.split('\t')
    if len(c) < 19 or not c[17]: continue
    name = c[2] or c[1]
    # Keep local spellings and a bounded set of aliases, never the global alternate-names dump.
    candidates = [c[1]] + sorted(c[3].split(','), key=lambda s: (len(normalized(s)) > 16, len(normalized(s))))
    aliases = []
    for alias in candidates:
        key = normalized(alias)
        if key != normalized(name) and key not in aliases and 2 <= len(key) <= 42:
            if len(aliases) < 24: aliases.append(key)
    rows.append([int(c[0]), name, c[8], index(region_names, regions.get(c[8]+'.'+c[10], '')),
                 index(zones, c[17]), round(float(c[4]), 4), round(float(c[5]), 4), int(c[14]), '|'.join(aliases)])
rows.sort(key=lambda r: -r[7])
data = dict(schema=1, source='GeoNames cities1000', countries=countries, regions=region_names, zones=zones, cities=rows)
(out/'cities.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
# Real locations, grouped into geographic cells for a dense but bounded vector light layer.
cells = {}
for r in rows:
    if r[7] < 3000: continue
    key = (round(r[5]*2), round(r[6]*2))
    if key not in cells: cells[key] = [r[6], r[5], r[7]]
    else: cells[key][2] += r[7]
(out/'lights.json').write_text(json.dumps(list(cells.values()), separators=(',', ':')))
manifest = dict(source='https://download.geonames.org/export/dump/cities1000.zip',
    retrievedAt=datetime.now(timezone.utc).isoformat(), sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
    cityCount=len(rows), lightCount=len(cells), bytes=(out/'cities.json').stat().st_size,
    license='CC BY 4.0', fields=['id','name','country','regionIndex','zoneIndex','latitude','longitude','population','searchAliases'])
(out/'catalog.json').write_text(json.dumps(manifest, indent=2)+'\n')
print(json.dumps(manifest, indent=2))
