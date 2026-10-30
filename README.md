# Bird Art Atlas

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

## Games

The **Games** button opens a popup on the map listing three games built from the drawings. Each game opens full screen and has its own link:

| Game | Link | How it works |
|---|---|---|
| Pair birds | `/#games/pair` | Memory game. Easy (3×4), Normal (4×4) or Hard (4×5). Each mismatched pair counts as a try. |
| Guess who? | `/#games/who` | 5 rounds. Name the bird from 2 tiles of its drawing (3 guesses, free extra tiles), then pick its IUCN status. |
| Guess where? | `/#games/where` | 5 rounds. Drop a pin where the iNaturalist observation was made and see how far off you were. |

`/#games` opens the games popup. In a game, ‹ returns to the popup, and Esc, ✕ or the browser's Back button returns to the globe.

The games pick birds at random from `src/data/artworks.js`, so new drawings join automatically. Guess who? uses the `conservationStatus` field and Guess where? uses `lat`/`lng`. Don't give a drawing the id `games`, since that's reserved for these links. The game code lives in `src/games/` and only downloads when a game is opened.
