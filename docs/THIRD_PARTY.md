# World View data and software

World View is an offline vector visualization. Geographic and city data are bundled with the app. City lights are an illustrative rendering of population-weighted settlement locations, not measured light emissions or live satellite imagery.

## Geographic data

- **Natural Earth** country boundaries and land geometry, supplied through **world-atlas 2.0.2**, at 1:50 million scale. Natural Earth data are public domain. The world-atlas conversion is distributed under the ISC license. Source: <https://github.com/topojson/world-atlas> and <https://www.naturalearthdata.com/about/>. This bundled map is a fixed edition and does not update boundaries automatically.
- **GeoNames** city data, downloaded on 25 October 2026 from <https://download.geonames.org/export/dump/cities1000.zip>, with region and country names from the same export service. Licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Credit: [GeoNames](https://www.geonames.org/). Data are supplied without a guarantee of completeness or accuracy.

The GeoNames extract has been modified: unnecessary fields were removed, coordinates rounded to four decimal places, duplicate aliases normalized and limited, region/time-zone strings indexed, and settlement points aggregated into half-degree cells for illustrative lighting. The bundled catalog contains **171,637 localities** and **18,650 light groups**. Its approximately 20 MB city JSON is loaded and indexed by a dedicated worker only when city search is first focused. Searchable localities are independent of the light layer.

Source ZIP SHA-256: `b5542441a467eeb6a761e3c10ce27fd25115dc255b96bd6702963a3542889ab2`.

The catalog metadata and schema are in `assets/world/catalog.json`. Refreshing the catalog can change counts, aliases and names. No city search is sent to a server.

## Astronomy and software

The offline bundle is built from pinned development dependencies:

- **Astronomy Engine 2.1.19**, Don Cross — MIT. Solar position, equinoxes, solstices and apparent sunrise/sunset. <https://github.com/cosinekitty/astronomy>
- **d3-geo 3.1.1**, Mike Bostock and contributors — ISC. Natural Earth projection, spherical geometry and SVG paths. <https://d3js.org/d3-geo>
- **topojson-client 3.1.0**, Mike Bostock — ISC. TopoJSON conversion and shared boundaries. <https://github.com/topojson/topojson-client>
- Transitive cartography dependencies **d3-array** and **internmap** — ISC.

Full software copyright and license notices are included with packaged apps in `assets/world/SOFTWARE_LICENSES.txt`. These data and dependencies retain their own licenses; the project's MIT license does not replace them.

## Radio coverage

The five nominal range rings use the **approximate reception ranges in the Casio module 3179 manual**, page 2: DCF77/MSF 1,500 km, WWVB 3,000 km, JJY 60 kHz 1,000 km and BPC 1,500 km. They are geodesic distances on a spherical Earth. They are not field-strength contours, current station-status reports or reception predictions. Ground conditions, receiver sensitivity, interference, ionospheric conditions and time of day affect actual reception.

Sources: [Casio 3179 manual](https://www.casio.com/content/dam/casio/global/support/manuals/watches/pdf/31/3179/qw3179_EN.pdf), [NIST WWVB coverage](https://tf.nist.gov/stations/wwvbcoverage.htm), [NICT JJY propagation](https://www.nict.go.jp/en/sts/jjy_signal.html).

## Rebuilding the assets

```sh
npm ci
npm run build:world
```

The bundled city catalog is committed to the repository; normal builds and use require no data download. To deliberately refresh it, download `cities1000.zip`, `admin1CodesASCII.txt` and `countryInfo.txt` from the [GeoNames export service](https://download.geonames.org/export/dump/), then run:

```sh
python3 scripts/prepare-cities.py /path/to/cities1000.zip /path/to/admin1CodesASCII.txt /path/to/countryInfo.txt
```

Review changed data, metadata, tests, documentation counts and attribution before distributing refreshed assets.
