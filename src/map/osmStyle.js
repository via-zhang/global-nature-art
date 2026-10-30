// OSM's standard raster tiles
// In dark mode the same tiles are inverted to get a dark basemap.
export const RASTER_PAINT = {
  light: {
    'raster-brightness-min': 0,
    'raster-brightness-max': 1,
    'raster-hue-rotate': 0,
    'raster-saturation': 0,
    'raster-contrast': 0,
  },
  dark: {
    'raster-brightness-min': 1,
    'raster-brightness-max': 0.08,
    'raster-hue-rotate': 180,
    'raster-saturation': -0.35,
    'raster-contrast': 0.1,
  },
}

export const BACKGROUND = { light: '#aad3df', dark: '#0f1a24' }

const SKY = {
  light: {
    'sky-color': '#bcd9ea',
    'horizon-color': '#ffffff',
    'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
  },
  dark: {
    'sky-color': '#0d1b2a',
    'horizon-color': '#1f3b52',
    'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
  },
}

// `globe: false` gives a flat (Mercator) map, used by the Guess where? game.
export function buildStyle(theme, { globe = true } = {}) {
  return {
    version: 8,
    ...(globe && { projection: { type: 'globe' }, sky: SKY[theme] }),
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        maxzoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': BACKGROUND[theme] },
      },
      { id: 'osm', type: 'raster', source: 'osm', paint: RASTER_PAINT[theme] },
    ],
  }
}
