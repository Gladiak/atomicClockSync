# Data, software and creative references

## Japanese interface font

`assets/fonts/NotoSansJP.ttf` is the unmodified Noto Sans JP variable font from [Google Fonts](https://github.com/google/fonts/tree/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/notosansjp), revision `e7db6ca603fd4862010383ff17ffd6cc4ffac1c0`. It is distributed under **SIL Open Font License 1.1**, included in `assets/fonts/NotoSansJP-OFL.txt`. SHA-256: `c2f3b4d463500a2ddcd3849cded1fceeb9fd6d1c32e6cbecd568453ba50fc68f`. The font is bundled locally for Japanese glyph fallback; no external font service is contacted.

World View is an offline vector visualization. Geographic and city data are bundled with the app. City lights are an illustrative rendering of population-weighted settlement locations, not measured light emissions or live satellite imagery.

## Light Travel

Light Travel uses the bundled **Astronomy Engine 2.1.19** `BackdatePosition` calculation for the Sun, Moon and seven planets relative to Earth's centre at reception. The earlier emission/reflection position determines geometric distance and vacuum light time. `HelioVector` and `Ecliptic` provide the directions in the schematic orbit diagram. The stars, shaded planets, rings and light effects are original SVG/CSS artwork; no external imagery is loaded.

The fixture `test/fixtures/light-time-jpl.json` records independent [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) samples for the Sun, Moon, Mars and Neptune at **2026-10-25 12:00 UTC**, observer centre `500@399`, quantity **21: one-way down-leg light-time**. Each sample retains its exact query URL. Tests allow 0.002 seconds for the Moon, 0.05 seconds for the Sun/Mars and 0.5 seconds for Neptune; this validates the educational model at the sampled epoch, not precision over every supported date. See the [Horizons manual](https://ssd.jpl.nasa.gov/horizons/manual.html).

Displayed times begin at the source's emission or reflection and end at Earth's centre. The Sun-to-planet leg, surface location, atmospheric effects and visibility are excluded. Orbit radii and body sizes are illustrative. The feature runs offline and is not an observing or navigation instrument. Its science links include NASA's explanation of [looking back in time with light](https://science.nasa.gov/mission/webb/science-overview/science-explainers/how-does-webb-see-back-in-time/).

## Moon Observatory and historical journeys

Moon Observatory uses **Astronomy Engine 2.1.19** for lunar phase, illuminated fraction, geocentric distance, topocentric equatorial/horizon coordinates, apparent rise/set, previous new Moon and upcoming quarter phases. These functions are bundled in the existing offline vendor file; its MIT notice is retained in `assets/world/SOFTWARE_LICENSES.txt`. [JavaScript reference](https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md), [NASA lunar phases](https://science.nasa.gov/moon/moon-phases/). No NASA texture or imagery is bundled: the lunar albedo/craters are generated procedurally and illumination is applied to a schematic sphere. Apparent horizon/orientation, terrain, libration and eclipses are not rendered as photographic observations.

Historical records are curated from these primary sources:

- **Wright Flyer**, 17 December 1903, approximately 10:35 EST / 15:35 UTC: [National Park Service](https://www.nps.gov/articles/wrightflyer.htm). The counter is marked approximate and omits seconds.
- **Sputnik 1**, 4 October 1957: [NASA history](https://www.nasa.gov/history/monograph10/sputnite.html). The record intentionally uses date-only precision without choosing among published launch-time conventions.
- **Vostok 1**, 12 April 1961 at 06:07 UTC: [ESA flight chronology](https://www.esa.int/About_Us/50_years_of_ESA/50_years_of_humans_in_space/The_flight_of_Vostok_1). Minute precision.
- **Apollo 11 lunar landing**, 20 July 1969 at 20:17:39 GMT, and **first footstep**, 21 July 1969 at 02:56:15 GMT: [NASA mission summary](https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_11a_Summary.htm). The app treats the recorded GMT values as UTC clock timestamps; other summaries can round touchdown by a second.
- **Voyager 1 launch**, 5 September 1977 at 12:56:01 UT: [NASA mission record](https://science.nasa.gov/mission/voyager/voyager-1/).
- **Web software placed in the public domain**, 30 April 1993: [CERN](https://home.cern/science/computing/the-birth-of-the-web). Date-only precision.

Stories are original short summaries and historical scenes are original SVG illustrations, not archival images. Counters use JavaScript timestamps rather than a leap-second-aware time scale; date-only counters use UTC calendar boundaries. Personal keepsakes are local user content and have no external data source.

### Full historical catalogue

The 96 journeys are ordered chronologically across Space, Astronomy, Time science, Discovery and Timekeeping. Their 87 institutional and publication references are shared between the UI and Electron’s external-link allowlist in `assets/time-machine/sources.json`. Original added narratives and metadata are in `src/time-machine-expansion.mjs`; their five translations are in `src/locales/time-machine-expansion.mjs`.

Day-only dates use UTC calendar-day counting without asserting that UTC existed in those eras. The 1905 Einstein records identify journal receipt dates, not publication dates. Pound–Rebka and Hafele–Keating use publication dates; modern NIST records use the announcement date. The 1955 caesium record is the Nature paper's publication date. The 1972 leap-second record uses calendar days, not a JavaScript representation of 23:59:60.

Explorer 1 (1 February 1958), Mariner 4 (15 July 1965), Kepler (7 March 2009), Cassini (1 July 2004), MESSENGER (18 March 2011), Curiosity (6 August 2012) and Hayabusa2's capsule return (5 December 2020) follow the UTC date rather than a locally reported date. JAXA records Hayabusa2 capsule landing around 02:54 JST on 6 December: the previous date in UTC. Voyager 1's heliopause crossing is the retrospectively identified 25 August 2012 boundary event; it does not mean the spacecraft left the entire Solar System or the Oort Cloud.

New illustrations of curved spacetime, quantum transitions, eclipse geometry, planetary encounters, radio astronomy, the microwave sky and landers are schematic SVG art, not observational images or instrument readings.

| Date | Journey | Precision | Primary source |
| --- | --- | --- | --- |
| 1582-10-15 | The calendar skips ten days | day | [Vatican Observatory](https://www.vaticanobservatory.va/en/history/astronomy-calendars-and-religion) |
| 1610-01-07 | Small lights around Jupiter | day | [NASA](https://www.nasa.gov/history/410-years-ago-galileo-discovers-jupiters-moons/) |
| 1783-11-21 | The sky becomes a destination | day | [Smithsonian](https://airandspace.si.edu/stories/editorial/presidential-writings-reveal-early-interest-ballooning) |
| 1846-09-23 | A calculation finds a planet | day | [NASA](https://www.nasa.gov/history/175-years-ago-astronomers-discover-neptune-the-eighth-planet/) |
| 1883-11-18 | The day the clocks agreed | day | [Library of Congress](https://www.loc.gov/item/today-in-history/november-18) |
| 1900-12-14 | Energy comes in small packets | day | [Max Planck Society](https://www.max-planck.mpg.de/seite11/english.html) |
| 1903-12-17 | Twelve seconds that changed flight | approximate | [NPS](https://www.nps.gov/articles/wrightflyer.htm) |
| 1905-06-30 | Distant clocks need a new agreement | day | [American Institute of Physics](https://history.aip.org/exhibits/einstein/chron-1905.htm) |
| 1905-09-27 | Mass and energy share a secret | day | [American Institute of Physics](https://history.aip.org/exhibits/einstein/chron-1905.htm) |
| 1915-11-25 | Gravity becomes geometry | day | [Max Planck Institute](https://einstein-virtuell.mpiwg-berlin.mpg.de/VEA/SC854034901_MOD1479463207_SEQ923184502_SL2034834684_en.html) |
| 1919-05-29 | An eclipse puts gravity to the test | day | [ESA](https://www.esa.int/Science_Exploration/Space_Science/29_May) |
| 1930-02-18 | A moving speck reveals Pluto | day | [Lowell Observatory](https://lowell.edu/this-week-in-astronomy-history-feb-15-21/) |
| 1949-01-06 | An atom-inspired clock begins to tick | day | [NIST](https://www.nist.gov/timelinelist) |
| 1955-08-13 | Caesium offers a steadier reference | day | [Nature · Essen & Parry](https://www.nature.com/articles/176280a0) |
| 1957-10-04 | Earth gets a new companion | day | [NASA](https://www.nasa.gov/history/monograph10/sputnite.html) |
| 1958-02-01 | A small satellite finds a radiation belt | day | [NASA](https://science.nasa.gov/mission/explorer-1/) |
| 1959-01-02 | A missed Moon opens a new path | day | [NASA / NSSDC](https://nssdc.gsfc.nasa.gov/planetary/lunar/lunarussr.html) |
| 1960-04-01 | Gravity changes the colour of light | day | [Physical Review Letters](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.4.337) |
| 1961-04-12 | One human. One orbit. | minute | [ESA](https://www.esa.int/About_Us/50_years_of_ESA/50_years_of_humans_in_space/The_flight_of_Vostok_1) |
| 1962-12-14 | Venus meets a visitor from Earth | day | [NASA](https://science.nasa.gov/mission/mariner-2/) |
| 1963-06-16 | Seagull reaches the stars | day | [NASA](https://www.nasa.gov/history/sally-ride-first-american-woman-in-space/) |
| 1965-03-18 | Outside the spacecraft | day | [NASA](https://www.nasa.gov/history/space-station-20th-spacewalking-history/) |
| 1965-07-15 | Mars comes into close-up | day | [NASA](https://science.nasa.gov/mission/mariner-4/) |
| 1966-02-03 | A camera survives the lunar landing | day | [NASA / NSSDC](https://nssdc.gsfc.nasa.gov/planetary/lunar/lunarussr.html) |
| 1967-11-28 | The sky sends a remarkably regular beat | day | [University of Cambridge](https://www.cam.ac.uk/stories/journeysofdiscovery-pulsars) |
| 1968-12-21 | Round the Moon and back | minute | [NASA](https://www.nasa.gov/missions/apollo/apollo-8-mission-details/) |
| 1969-07-20 | The Eagle has landed | second | [NASA](https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_11a_Summary.htm) |
| 1969-07-21 | A footprint beyond Earth | second | [NASA](https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_11a_Summary.htm) |
| 1969-10-29 | Two letters connect two worlds | day | [UCLA](https://www.lk.cs.ucla.edu/internet_first_words.html) |
| 1969-12-25 | A quartz crystal reaches the wrist | day | [Seiko Museum](https://museum.seiko.co.jp/en/knowledge/Quartz01/) |
| 1970-04-17 | A damaged spacecraft brings its crew home | day | [NASA](https://www.nasa.gov/mission/apollo-13/) |
| 1970-12-15 | A signal rises from the Venusian furnace | day | [NASA / HEASARC](https://heasarc.gsfc.nasa.gov/docs/heasarc/headates/1970.html) |
| 1971-11-14 | Another planet gains an orbiter | day | [NASA](https://science.nasa.gov/mission/mariner-9/) |
| 1972-01-01 | Atomic seconds meet Earth’s rotation | day | [NIST](https://www.nist.gov/pml/time-and-frequency-division/popular-links/walk-through-time/walk-through-time-world-time-scales) |
| 1972-06-30 | A minute receives an extra second | day | [NIST](https://www.nist.gov/pml/time-and-frequency-division/time-realization/leap-seconds) |
| 1972-07-14 | Clocks return with different times | day | [Science · Hafele & Keating](https://doi.org/10.1126/science.177.4044.168) |
| 1972-12-07 | Apollo leaves Earth one last time | day | [NASA](https://www.nasa.gov/mission/apollo-17/) |
| 1973-12-04 | The giant planet receives its first visitor | day | [NASA](https://science.nasa.gov/mission/pioneer-10/) |
| 1975-07-17 | Two spacecraft share a doorway | day | [NASA](https://www.nasa.gov/missions/apollo-soyuz/the-apollo-soyuz-mission/) |
| 1976-07-20 | A laboratory opens on Mars | day | [NASA](https://science.nasa.gov/mission/viking-1/) |
| 1977-08-20 | A grand tour begins | second | [NASA](https://science.nasa.gov/mission/voyager/voyager-2/) |
| 1977-09-05 | A message to the stars | second | [NASA](https://science.nasa.gov/mission/voyager/voyager-1/) |
| 1979-03-05 | Jupiter’s moons become active worlds | day | [NASA](https://science.nasa.gov/mission/voyager/voyager-1/) |
| 1980-11-12 | A spacecraft reads Saturn’s rings | day | [NASA](https://science.nasa.gov/mission/voyager/voyager-1/) |
| 1981-04-12 | A spacecraft with wings | second | [NASA](https://www.nasa.gov/mission/sts-1/) |
| 1986-01-24 | A sideways world fills the instruments | day | [NASA](https://science.nasa.gov/mission/voyager/voyager-2/) |
| 1986-03-14 | Halley reveals its dark nucleus | day | [ESA](https://www.esa.int/Science_Exploration/Space_Science/Giotto_overview) |
| 1989-08-25 | The grand tour reaches Neptune | day | [NASA](https://science.nasa.gov/mission/voyager/voyager-2/) |
| 1989-11-18 | A satellite listens to the Big Bang’s echo | day | [NASA](https://science.nasa.gov/mission/cobe/) |
| 1990-04-24 | An observatory above the air | second | [NASA](https://science.nasa.gov/mission/hubble/observatory/missions-to-hubble/deployment/) |
| 1993-04-30 | A world of connections | day | [CERN](https://home.cern/science/computing/the-birth-of-the-web) |
| 1995-10-06 | Another Sun has a planet | day | [University of Geneva](https://www.unige.ch/medias/en/2025/la-premiere-exoplanete-etait-decouverte-il-y-30-ans-lunige) |
| 1995-12-07 | A probe dives as an orbiter arrives | day | [NASA](https://science.nasa.gov/mission/galileo/) |
| 1997-07-04 | Small wheels on a red world | day | [NASA](https://science.nasa.gov/mission/mars-pathfinder/) |
| 1999-12-29 | A fountain helps define the second | day | [NIST](https://www.nist.gov/news-events/news/1999/12/nist-f1-cesium-fountain-clock) |
| 2000-05-02 | Civilian GPS gains a clearer signal | day | [GPS.gov / USAF](https://archive.gps.gov/systems/gps/modernization/sa/data/) |
| 2000-11-02 | A home above the world | day | [NASA](https://www.nasa.gov/humans-in-space/expedition-1-kicks-off-science-aboard-international-space-station/) |
| 2001-06-30 | A map begins at the dawn of time | day | [NASA](https://science.nasa.gov/mission/wmap/) |
| 2004-07-01 | Saturn becomes a long-term destination | day | [NASA](https://science.nasa.gov/mission/cassini/quick-facts/) |
| 2005-01-14 | A parachute opens beneath alien clouds | day | [ESA](https://www.esa.int/Newsroom/Press_Releases/Europe_reaches_new_frontier_Huygens_lands_on_Titan) |
| 2006-01-19 | A long road to Pluto begins | day | [NASA](https://science.nasa.gov/mission/new-horizons/) |
| 2007-01-09 | A computer in your pocket | day | [Apple](https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/) |
| 2008-09-10 | A first lap beneath the border | minute | [CERN](https://home.cern/first-beam-in-the-lhc-accelerating-science/) |
| 2009-03-07 | A patient eye searches for other worlds | day | [NASA](https://science.nasa.gov/mission/kepler/in-depth/) |
| 2009-05-14 | Two observatories chase ancient light | day | [ESA](https://www.esa.int/Enabling_Support/Operations/Planck_operations) |
| 2010-09-23 | Time changes over a single step | day | [NIST](https://www.nist.gov/news-events/news/2010/09/nist-pair-aluminum-atomic-clocks-reveal-einsteins-relativity-personal-scale) |
| 2011-03-18 | Mercury gains its first orbiter | day | [NASA](https://science.nasa.gov/mission/messenger/) |
| 2012-07-04 | A particle steps out of theory | day | [CERN](https://home.cern/cern-experiments-observe-particle-consistent-with-long-sought-higgs-boson/) |
| 2012-08-06 | A sky crane lowers a laboratory | day | [NASA](https://science.nasa.gov/mission/msl-curiosity/) |
| 2012-08-25 | A spacecraft crosses the Sun’s bubble | day | [NASA](https://science.nasa.gov/mission/voyager/voyager-1/) |
| 2014-11-12 | Touchdown on a comet | day | [ESA](https://www.esa.int/Newsroom/Press_Releases/Touchdown%21_Rosetta_s_Philae_probe_lands_on_comet) |
| 2014-12-05 | A new capsule tests the way home | day | [NASA](https://www.nasa.gov/specials/orionfirstflight/) |
| 2015-04-21 | A colder clock sees finer time | day | [NIST / JILA](https://www.nist.gov/news-events/news/2015/04/getting-better-all-time-jila-strontium-atomic-clock-sets-new-records) |
| 2015-07-14 | A distant point becomes a world | minute | [NASA](https://science.nasa.gov/mission/new-horizons/) |
| 2015-09-14 | Listening to space-time | day | [LIGO / Caltech](https://www.ligo.caltech.edu/detection) |
| 2016-09-30 | A comet escort ends on the surface | day | [ESA](https://rosetta.esa.int/) |
| 2017-08-17 | One collision, many messengers | day | [LIGO / Caltech](https://www.ligo.caltech.edu/news/ligo20171016) |
| 2018-08-12 | A heat shield heads toward the Sun | day | [NASA](https://science.nasa.gov/mission/parker-solar-probe/) |
| 2018-11-16 | The world votes for natural constants | day | [BIPM](https://www.bipm.org/documents/20126/35655029/CGPM26.pdf/f1d8d7e6-2570-9479-9ee9-bb8d86138fe9) |
| 2019-01-01 | A quiet relic meets a fast visitor | day | [NASA](https://science.nasa.gov/mission/new-horizons/) |
| 2019-04-10 | The shadow becomes visible | day | [EHT Collaboration](https://eventhorizontelescope.org/press-release-april-10-2019-astronomers-capture-first-image-black-hole) |
| 2019-05-20 | Nature becomes the ruler | day | [NIST](https://www.nist.gov/si-redefinition) |
| 2019-12-18 | Known planets get a closer look | day | [ESA](https://www.esa.int/Newsroom/Press_Releases/Liftoff_for_Cheops_ESA_s_exoplanet_mission) |
| 2020-12-05 | Ryugu sends a parcel to Earth | day | [JAXA](https://www.hayabusa2.jaxa.jp/en/news/schedule/) |
| 2021-02-18 | A laboratory reaches Jezero | day | [NASA](https://spaceplace.nasa.gov/mars-2020/en/) |
| 2021-04-19 | The Wright moment on Mars | day | [NASA](https://www.nasa.gov/news-release/nasas-ingenuity-mars-helicopter-succeeds-in-historic-first-flight/) |
| 2021-12-25 | A golden eye leaves Earth | minute | [NASA](https://science.nasa.gov/mission/webb/faqs-full/) |
| 2022-02-16 | A millimetre separates two times | day | [NIST / JILA](https://www.nist.gov/news-events/news/2022/02/jila-atomic-clocks-measure-einsteins-general-relativity-millimeter-scale) |
| 2022-05-12 | Our galaxy’s dark heart takes shape | day | [ESO / EHT](https://www.eso.org/public/news/eso2208-eht-mw/) |
| 2022-07-12 | Ancient light, a new view | day | [NASA](https://svs.gsfc.nasa.gov/14180/) |
| 2022-09-26 | A deliberate impact changes an orbit | day | [NASA](https://science.nasa.gov/mission/dart/) |
| 2022-11-16 | Orion begins a lunar rehearsal | day | [NASA](https://www.nasa.gov/mission/artemis-i/) |
| 2023-07-01 | A new map explores the dark Universe | day | [ESA](https://www.esa.int/Newsroom/Press_Releases/ESA_s_Euclid_lifts_off_on_quest_to_unravel_the_cosmic_mystery_of_dark_matter_and_dark_energy) |
| 2023-09-24 | A piece of an asteroid comes home | day | [NASA](https://science.nasa.gov/mission/osiris-rex/) |
| 2023-10-03 | Light captures an electron’s moment | day | [Nobel Foundation](https://www.nobelprize.org/prizes/physics/2023/press-release/) |
| 2024-07-01 | A lattice of light sharpens the second | day | [NIST / JILA](https://www.nist.gov/news-events/news/2024/07/worlds-most-accurate-and-precise-atomic-clock-pushes-new-frontiers-physics) |

## Back in Time film references

Back in Time is an unofficial fan tribute inspired by the Back to the Future trilogy. Its seven-segment instruments and flux-capacitor schematic are original SVG/CSS artwork; no film stills, logos, fonts, music, dialogue recordings or other media assets are bundled. Film titles and character references identify the inspiration; they do not imply affiliation or endorsement.

Chronology references: the [official film FAQ](https://www.backtothefuture.com/movies/faq), the [film timeline](https://backtothefuture.fandom.com/wiki/Back_to_the_Future_timeline), and the [journey chronology](https://backtothefutureblog.art.blog/2020/05/03/space-time-continuum/). The selected moments are 2 September 1885 at 08:00, the destination circuit setting of 5 November 1955 at 06:00 (not Marty's later arrival), 12 November 1955 at 22:04, Einstein's return on 26 October 1985 at 01:21, and 21 October 2015 at 16:29.

For reproducible elapsed durations, fictional Hill Valley is interpreted as California using `America/Los_Angeles`. Event offsets are Pacific standard time (UTC−08:00) in September 1885 and November 1955, and Pacific daylight time (UTC−07:00) in October 1985 and October 2015. These are an app convention for interpreting fictional on-screen local clocks, rather than a claim that the films specify UTC timestamps. Durations use actual seconds with 86,400-second days. The present and elapsed counters use the app's NTP/system time reference; cinematic travel affects only the green display.

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

## ISS sources and orbit software

- **CelesTrak GP data**, NORAD 25544, OMM-compatible JSON: <https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=JSON>. Requests are limited to at most one per two hours, with a persistent cache and provider Retry-After support. [Usage policy](https://celestrak.org/usage-policy.php).
- **Where the ISS at**: position reports and an ISS TLE fallback, using <https://api.wheretheiss.at/v1/satellites/25544> and its `/tles` endpoint. The app requests reports at most every ten seconds while ISS Observatory is visible and backs off on failure. [Provider documentation](https://wheretheiss.at/w/developer).
- **satellite.js 7.1.0**, Shashwat Kandadai and UCSC Jack Baskin School of Engineering — MIT. Its pure JavaScript SGP4, coordinate transforms, solar-position and shadow routines are bundled locally. The optional WASM modules are not included. Full license notice: `assets/iss/LICENSE.txt`. [Source](https://github.com/shashwatak/satellite-js).
- Station background: [NASA facts](https://www.nasa.gov/international-space-station/space-station-facts-and-figures/), [NASA orbit tutorial](https://eol.jsc.nasa.gov/Tools/orbitTutorial.htm), [NASA sighting guidance](https://spotthestation.nasa.gov/faq.cfm), [NASA station overview](https://www.nasa.gov/international-space-station/space-station-overview/).
- Official live-view link: [Canadian Space Agency / NASA](https://www.asc-csa.gc.ca/eng/iss/watch-live.asp). Video opens externally and can be interrupted or unavailable.
- ACES background: [ESA mission](https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/ACES_Atomic_Clock_Ensemble_in_Space), [installation on 25 April 2025](https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/ACES_finds_its_home_in_orbit).

The ISS is represented by an original vector schematic, not an official engineering drawing or a depiction of its current visiting-vehicle/array configuration. No NASA/ESA images, onboard telemetry, crew feed, live video or ACES clock measurements are bundled or claimed as live data. Orbital estimates, educational relativity calculations and curated mission facts are identified separately.

The reproducible orbit fixture in `test/fixtures/iss-omm.json` is a CelesTrak ISS element set with epoch 24 October 2026, used only for tests. A timestamped WTIA position retrieved on 25 October 2026 is retained as a numeric reference vector in `test/iss.test.mjs`. Test fixtures are not packaged as a live-data fallback.

```sh
npm run build:iss
npm run test:iss
```

## Application manual screenshots

`assets/guide/` contains original screenshots of this application's interface: fourteen views in each of the six supported languages. They are captured by `scripts/capture-manual.cjs` using an isolated temporary profile, synthetic watch/history/accuracy records and the repository's ISS fixture; no user records are included. Bluetooth detections are simulated for illustration; no physical reception is implied. Screenshots are examples, not evidence of physical reception. Interface artwork, map data and fonts retain their existing licenses and attribution documented above.

## Bluetooth runtime and protocol

Bluetooth uses [Bleak](https://github.com/hbldh/bleak) (MIT) and its platform
dependencies. The frozen worker is built with [PyInstaller](https://pyinstaller.org/),
whose bootloader distribution exception permits bundling applications. Installed
dependency notices are copied into the worker's `THIRD_PARTY_LICENSES` directory.

The small time-only protocol implementation references Ivo Zivkov's MIT-licensed
[gshock_api](https://github.com/izivkov/gshock_api) and
[GShockAPI](https://github.com/izivkov/GShockAPI). The retained notice is in
`bluetooth/LICENSE.gshock-api.txt` and is bundled with the worker. See
[Bluetooth documentation](BLUETOOTH.md) for pinned source revisions and scope.
