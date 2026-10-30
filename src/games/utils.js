export function shuffle(items) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Picks `n` different artworks at random. Each game keeps its own shuffled
// "bag", so playing again favours birds that haven't come up yet; the bag
// refills once every bird has been used. New birds join automatically.
const bags = new Map()

export function draw(key, pool, n) {
  const ids = pool.map((a) => a.id)
  const count = Math.min(n, ids.length)
  let bag = (bags.get(key) ?? []).filter((id) => ids.includes(id))
  const picked = []
  while (picked.length < count) {
    if (!bag.length) bag = shuffle(ids.filter((id) => !picked.includes(id)))
    picked.push(bag.pop())
  }
  bags.set(key, bag)
  return picked.map((id) => pool.find((a) => a.id === id))
}

// Great-circle distance in kilometres.
export function distanceKm(a, b) {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)))
}

// Points along the great circle from a to b, as [lng, lat]. Longitudes are
// unwrapped so the line doesn't jump across the map at the antimeridian.
export function greatCircle(a, b, steps = 64) {
  const rad = Math.PI / 180
  const toVec = (p) => [
    Math.cos(p.lat * rad) * Math.cos(p.lng * rad),
    Math.cos(p.lat * rad) * Math.sin(p.lng * rad),
    Math.sin(p.lat * rad),
  ]
  const va = toVec(a)
  const vb = toVec(b)
  const angle = Math.acos(Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])))
  if (angle < 1e-9)
    return [
      [a.lng, a.lat],
      [b.lng, b.lat],
    ]
  const coords = []
  let prevLng = null
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const s1 = Math.sin((1 - t) * angle) / Math.sin(angle)
    const s2 = Math.sin(t * angle) / Math.sin(angle)
    const [x, y, z] = [0, 1, 2].map((k) => s1 * va[k] + s2 * vb[k])
    const lat = Math.atan2(z, Math.hypot(x, y)) / rad
    let lng = Math.atan2(y, x) / rad
    if (prevLng !== null) lng += Math.round((prevLng - lng) / 360) * 360
    prevLng = lng
    coords.push([lng, lat])
  }
  return coords
}

export function formatDistance(km) {
  const mi = km * 0.621371
  const fmt = (v) => (v < 10 ? v.toFixed(1) : Math.round(v).toLocaleString())
  return `${fmt(km)} km (${fmt(mi)} mi)`
}
