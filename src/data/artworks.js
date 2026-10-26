// One entry per drawing. `id` must match the file names in art/:
//   art/<id>.png         colored drawing
//   art/<id>_sketch.png  sketch (optional)
// `observedOn` is the iNaturalist observation date, shown as written.
// `conservationStatus` is optional: one of the IUCN Red List codes below.
// `conservationUrl` (optional) links the status tag to the species' Red List page.
// Shown in alphabetical order by common name.
export const artworks = [
  {
    id: 'vermilion_flycatcher',
    name: 'Vermilion Flycatcher',
    scientificName: 'Pyrocephalus rubinus',
    lat: 32.7541583333,
    lng: -117.2437305556,
    credit: '© John Bruin',
    observationUrl: 'https://www.inaturalist.org/observations/410573080',
    observedOn: 'Oct 12, 2026 · 8:49 AM PDT',
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
    observedOn: 'Jan 14, 2006',
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
    observedOn: 'Oct 23, 2026 · 1:29 PM EDT',
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
    observedOn: 'November 2022',
    hasSketch: true,
    conservationStatus: 'CR',
    conservationUrl: 'https://www.iucnredlist.org/species/22722293/130617765',
  },
  {
    id: 'great_hornbill',
    name: 'Great Hornbill',
    scientificName: 'Buceros bicornis',
    lat: 6.2865940385,
    lng: 99.6428146512,
    credit: '© Jono Dashper',
    observationUrl: 'https://www.inaturalist.org/observations/153788800',
    observedOn: 'September 2019',
    hasSketch: true,
    conservationStatus: 'VU',
    conservationUrl: 'https://www.iucnredlist.org/species/22682453/184603863',
  },
  {
    id: 'ariel_toucan',
    name: 'Ariel Toucan',
    scientificName: 'Ramphastos vitellinus ssp. ariel',
    lat: -24.2073913763,
    lng: -47.0880679946,
    credit: '© Luciano Bernardes',
    observationUrl: 'https://www.inaturalist.org/observations/124152728',
    observedOn: 'June 2016',
    hasSketch: true,
    conservationStatus: 'NT',
    conservationUrl: 'https://www.iucnredlist.org/species/22726233/221624536',
  },
  {
    id: 'regent_honeyeater',
    name: 'Regent Honeyeater',
    scientificName: 'Anthochaera phrygia',
    lat: -36.1367589599,
    lng: 146.6616756321,
    credit: '© Philip Dubbin',
    observationUrl: 'https://www.inaturalist.org/observations/35401668',
    observedOn: 'Aug 23, 2019 · 11:26 AM AEST',
    hasSketch: true,
    conservationStatus: 'CR',
    conservationUrl: 'https://www.iucnredlist.org/species/22704415/130992272',
  },
  {
    id: 'blue_macaw',
    name: 'Blue-throated Macaw',
    scientificName: 'Ara glaucogularis',
    lat: -15.1515736225,
    lng: -64.6773598812,
    credit: '© David J Barton',
    observationUrl: 'https://www.inaturalist.org/observations/408762570',
    observedOn: 'September 2026',
    hasSketch: true,
    conservationStatus: 'CR',
    conservationUrl: 'https://www.iucnredlist.org/species/22685542/196624397',
  },
].sort((a, b) => a.name.localeCompare(b.name))

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
