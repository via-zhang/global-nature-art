// One entry per drawing. `id` must match the file names in art/:
//   art/<id>.png         colored drawing
//   art/<id>_sketch.png  sketch (optional)
// `conservationStatus` is optional: one of the IUCN Red List codes below.
export const artworks = [
  {
    id: 'vermilion_flycatcher',
    name: 'Vermilion Flycatcher',
    scientificName: 'Pyrocephalus rubinus',
    lat: 32.7541583333,
    lng: -117.2437305556,
    credit: '© John Bruin',
    observationUrl: 'https://www.inaturalist.org/observations/410573080',
    hasSketch: true,
  },
  {
    id: 'diederik_cuckoo',
    name: 'Diederik Cuckoo',
    scientificName: 'Chrysococcyx caprius',
    lat: -24.394339,
    lng: 31.7779551,
    credit: '© Greg Lasley',
    observationUrl: 'https://www.inaturalist.org/observations/167560',
    hasSketch: true,
  },
  {
    id: 'blue_jay',
    name: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    lat: 45.6886111117,
    lng: -73.6863888883,
    credit: '© Nabil Zariffa',
    observationUrl: 'https://www.inaturalist.org/observations/410569832',
    hasSketch: true,
  },
  {
    id: 'cherry_tanager',
    name: 'Cherry-throated Tanager',
    scientificName: 'Nemosia rourei',
    lat: -20.4852106261,
    lng: -41.0654825376,
    credit: '© Gabriel Bonfa',
    observationUrl: 'https://www.inaturalist.org/observations/143115740',
    hasSketch: true,
    conservationStatus: 'CR',
  },
  {
    id: 'great_hornbill',
    name: 'Great Hornbill',
    scientificName: 'Buceros bicornis',
    lat: 6.2865940385,
    lng: 99.6428146512,
    credit: '© Jono Dashper',
    observationUrl: 'https://www.inaturalist.org/observations/153788800',
    hasSketch: true,
    conservationStatus: 'VU',
  },
  {
    id: 'ariel_toucan',
    name: 'Ariel Toucan',
    scientificName: 'Ramphastos vitellinus ssp. ariel',
    lat: -24.2073913763,
    lng: -47.0880679946,
    credit: '© Luciano Bernardes',
    observationUrl: 'https://www.inaturalist.org/observations/124152728',
    hasSketch: true,
    conservationStatus: 'EN',
  },
]

// IUCN Red List categories, using the Red List's own color scheme.
export const CONSERVATION_STATUS = {
  EX: { label: 'Extinct', bg: '#000000', fg: '#ffffff' },
  EW: { label: 'Extinct in the Wild', bg: '#542344', fg: '#ffffff' },
  CR: { label: 'Critically Endangered', bg: '#d81e05', fg: '#ffffff' },
  EN: { label: 'Endangered', bg: '#fc7f3f', fg: '#1d1d1d' },
  VU: { label: 'Vulnerable', bg: '#f9e814', fg: '#1d1d1d' },
  NT: { label: 'Near Threatened', bg: '#cce226', fg: '#1d1d1d' },
  LC: { label: 'Least Concern', bg: '#60c659', fg: '#1d1d1d' },
  DD: { label: 'Data Deficient', bg: '#d1d1c6', fg: '#1d1d1d' },
}

const base = import.meta.env.BASE_URL

export const imageUrl = (art, variant = 'color') =>
  `${base}art/${art.id}${variant === 'sketch' ? '_sketch' : variant === 'thumb' ? '_thumb' : ''}.webp`
