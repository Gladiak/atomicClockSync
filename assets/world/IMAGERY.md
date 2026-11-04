# Earth surface imagery

`blue-marble-natural-earth.webp` (4000 × 1760, approximately 0.9 MB) is derived from the NASA Earth Observatory **Blue Marble: Next Generation** August 2004 global mosaic with topography and bathymetry.

Source: [NASA Blue Marble collection](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/).

Original JPEG (5400 × 2700): https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/august/world.topo.bathy.200408.3x5400x2700.jpg

Retrieved 2026-11-04. Source SHA-256: `f76d7b94445e8975a755c849ddaa93ed07b7e01118fb0b7e6bc5546a68c18d5c`.

Credit: **NASA Earth Observatory, Blue Marble: Next Generation**, Reto Stöckli / NASA Goddard Space Flight Center and the contributing data teams. The NASA imagery is separate from this repository's software license; see [NASA imagery usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). No endorsement is implied.

The build uses the same Natural Earth 1 projection and fitted 1000 × 440 coordinate frame as the SVG overlays. An inverse projection and bilinear resampling produce the 4× raster, with transparency outside the globe and WebP quality .94. No AI images or runtime imagery requests are used. Rebuild from the downloaded JPEG:

```sh
./node_modules/.bin/electron scripts/build-world-texture.cjs /tmp/atomic-blue-marble-august.jpg
```

This fixed historical surface does not change with the preview date. Day/night, twilight, city/station positions and nominal radio coverage are separate calculated/vector overlays. City lights remain illustrative population-based points. The Your now dashboard shares this photographic surface and the World View Satellite/Map preference. The ISS Observatory map keeps its existing vector rendering.
