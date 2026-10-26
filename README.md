# Global Nature Art

Drawings of wildlife from iNaturalist observations, placed on an interactive 3D globe.

Built with React, Tailwind CSS v4, Vite and MapLibre GL (globe projection) over OpenStreetMap raster tiles (no API key needed). Dark mode uses the same tiles with inverted colors.

## Run it

```sh
npm install
npm run dev
npm run build
```

## Adding a drawing

1. Put the full-size images in `art/` (local only, not committed):
   - `art/<id>.png` is the colored drawing.
   - `art/<id>_sketch.png` is the sketch (optional).
2. Add an entry with the same `id` to [`src/data/artworks.js`](src/data/artworks.js).
   - Optionally add `conservationStatus` with an IUCN Red List code (`EX`, `EW`, `CR`, `EN`, `VU`, `NT`, `LC` or `DD`) to show a colored status tag, and `conservationUrl` to link the tag to the species' IUCN Red List page.

`npm run dev` and `npm run build` run `scripts/build-images.mjs` first and writes compressed WebP files to `public/art/`: a 1400px image for the viewer and a 256px thumbnail for the map. Commit the generated files in `public/art/`.

Selecting a drawing updates the URL hash (for example `/#blue_jay`).
