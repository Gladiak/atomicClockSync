# Lunar surface imagery

`lro-nearside.webp` is a 2048 × 2048 orthographic near-side albedo disc derived from the 2019 8192 × 4096 colour map in the [NASA CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/).

Credit: **NASA's Scientific Visualization Studio**; Ernie Wright (USRA), NASA/LRO/LROC and the contributing instrument teams. The map uses LROC WAC imagery and a LOLA-derived polar fill. See the source page for full credits and processing details. [NASA SVS usage information](https://svs.gsfc.nasa.gov/help/#usage) identifies this material as public domain. The imagery is distributed under those terms, separately from the repository's software license. No NASA endorsement is implied.

Original: https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_8k.tif

Retrieved: 2026-11-04. Original TIFF SHA-256: `4af8b0cd4d50c30851359d98e7e72040240dd8d03256b58b345b5b76e9edb4ef`.

The build script projects longitude 0° / latitude 0° facing the viewer, with north up and east right, using bilinear sampling and a transparent antialiased limb, then encodes WebP at quality .96. No AI imagery is used. The app adds calculated spherical illumination at runtime. It does not model libration, local apparent rotation, eclipse shadows or topographic self-shadowing.

To rebuild, download the original TIFF and convert it losslessly to PNG (for example, on macOS):

```sh
sips -s format png /tmp/lroc_color_poles_8k.tif --out /tmp/lroc_color_poles_8k.png
./node_modules/.bin/electron scripts/build-moon-texture.cjs /tmp/lroc_color_poles_8k.png
```

The source TIFF and full global PNG are build inputs; only the approximately 1.1 MB disc is bundled. No image download is needed at runtime.
