// The games, in menu order. `id` is used in the URL: #games/<id>.
export const GAMES = [
  {
    id: 'pair',
    name: 'Pair birds',
    blurb: 'Flip cards to match the same bird drawing.',
  },
  {
    id: 'who',
    name: 'Guess who?',
    blurb: 'Name the bird species with part of the drawing hidden.',
  },
  {
    id: 'where',
    name: 'Guess where?',
    blurb: 'Drop a pin where you think each bird was observed.',
  },
]

export const gameHash = (game) => (game === 'hub' ? '#games' : `#games/${game}`)

// Reads #games or #games/<id> from the URL; null for anything else.
export function gameFromHash(hash) {
  const h = decodeURIComponent(hash.replace(/^#/, ''))
  if (h === 'games') return 'hub'
  const m = h.match(/^games\/([\w-]+)$/)
  return m && GAMES.some((g) => g.id === m[1]) ? m[1] : null
}
