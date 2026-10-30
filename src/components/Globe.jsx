import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Map as MapLibreMap, Marker, NavigationControl } from 'maplibre-gl'
import { imageUrl } from '../data/artworks.js'
import { buildStyle } from '../map/osmStyle.js'

const THUMB_SIZE = 76 + 6 // card + border
const THUMB_GAP = 8
const DOT_SIZE = 18

// Great-circle angle (degrees) between two points.
function angularDistance(a, b) {
  const rad = Math.PI / 180
  const cos =
    Math.sin(a.lat * rad) * Math.sin(b.lat * rad) +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.cos((a.lng - b.lng) * rad)
  return Math.acos(Math.min(1, Math.max(-1, cos))) / rad
}

const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

function createMarkerElement(art) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'art-marker'
  el.setAttribute('aria-label', `${art.name} (${art.scientificName})`)
  const thumb = document.createElement('span')
  thumb.className = 'art-thumb'
  const img = document.createElement('img')
  img.src = imageUrl(art, 'thumb')
  img.alt = ''
  img.loading = 'lazy'
  img.draggable = false
  thumb.append(img)
  const dot = document.createElement('span')
  dot.className = 'art-dot'
  el.append(thumb, dot)
  return el
}

const Globe = forwardRef(function Globe({ artworks, theme, selectedId, onSelect }, ref) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const selectedRef = useRef(selectedId)
  const onSelectRef = useRef(onSelect)
  const layoutRef = useRef(() => {})
  onSelectRef.current = onSelect

  useImperativeHandle(ref, () => ({
    // Only move the camera when the artwork is out of view (on the far side
    // of the globe or off-screen); then rotate to it without changing zoom.
    showIfHidden(art) {
      const map = mapRef.current
      if (!map) return
      const { width, height } = map.getContainer().getBoundingClientRect()
      const p = map.project([art.lng, art.lat])
      const onScreen = p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height
      if (onScreen && angularDistance(map.getCenter(), art) < 80) return
      map.easeTo({ center: [art.lng, art.lat], duration: 1200, essential: true })
    },
    resetView() {
      mapRef.current?.flyTo({ center: centerOf(artworks), zoom: initialZoom(), duration: 1400 })
    },
  }))

  // Create the map.
  useEffect(() => {
    const map = new MapLibreMap({
      container: containerRef.current,
      style: buildStyle(theme),
      center: centerOf(artworks),
      zoom: initialZoom(),
      maxZoom: 18,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    map.addControl(new NavigationControl({ visualizePitch: true }), 'bottom-right')

    // Decide which thumbnails have room to show without covering other
    // markers or each other.
    let frame = 0
    const layout = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const { width, height } = map.getContainer().getBoundingClientRect()
        const center = map.getCenter()
        const items = markersRef.current.map((m) => {
          const p = map.project(m.marker.getLngLat())
          const angle = angularDistance(center, m.art)
          return { ...m, p, behind: angle > 90, nearEdge: angle > 72 }
        })
        const dots = items
          .filter((i) => !i.behind)
          .map((i) => ({
            id: i.art.id,
            left: i.p.x - DOT_SIZE / 2,
            right: i.p.x + DOT_SIZE / 2,
            top: i.p.y - DOT_SIZE / 2,
            bottom: i.p.y + DOT_SIZE / 2,
          }))
        const placed = []
        items.sort((a, b) => (b.art.id === selectedRef.current) - (a.art.id === selectedRef.current))
        for (const item of items) {
          const { el } = item
          el.classList.toggle('is-hidden', item.behind)
          el.classList.toggle('is-selected', item.art.id === selectedRef.current)
          const box = {
            left: item.p.x - THUMB_SIZE / 2,
            right: item.p.x + THUMB_SIZE / 2,
            top: item.p.y - DOT_SIZE / 2 - THUMB_GAP - THUMB_SIZE,
            bottom: item.p.y - DOT_SIZE / 2,
          }
          const fits =
            !item.nearEdge &&
            box.left >= 0 &&
            box.right <= width &&
            box.top >= 0 &&
            item.p.y <= height &&
            !placed.some((b) => overlaps(b, box)) &&
            !dots.some((d) => d.id !== item.art.id && overlaps(d, box))
          el.classList.toggle('show-thumb', fits)
          if (fits) placed.push(box)
        }
      })
    }
    layoutRef.current = layout
    map.on('move', layout)
    map.on('resize', layout)
    map.on('load', layout)

    return () => {
      cancelAnimationFrame(frame)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep markers in sync with the artwork list.
  useEffect(() => {
    const map = mapRef.current
    const markers = artworks.map((art) => {
      const el = createMarkerElement(art)
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelectRef.current(art.id)
      })
      const marker = new Marker({ element: el, anchor: 'center', opacityWhenCovered: '0' })
        .setLngLat([art.lng, art.lat])
        .addTo(map)
      return { art, el, marker }
    })
    markersRef.current = markers
    layoutRef.current()
    return () => markers.forEach((m) => m.marker.remove())
  }, [artworks])

  useEffect(() => {
    selectedRef.current = selectedId
    layoutRef.current()
  }, [selectedId])

  // Switch light/dark basemap. diff: true only patches the paint properties
  // that changed, so tiles aren't reloaded and the DOM markers are unaffected.
  const styledThemeRef = useRef(theme)
  useEffect(() => {
    if (styledThemeRef.current === theme) return
    styledThemeRef.current = theme
    mapRef.current.setStyle(buildStyle(theme), { diff: true })
  }, [theme])

  // MapLibre sets position: relative on its container, so size it from a wrapper.
  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" aria-label="Interactive globe of drawings" role="region" />
    </div>
  )
})

// Mean position of all artworks on the sphere, so the opening view faces them.
function centerOf(artworks) {
  if (!artworks.length) return [0, 20]
  const rad = Math.PI / 180
  let x = 0,
    y = 0,
    z = 0
  for (const a of artworks) {
    x += Math.cos(a.lat * rad) * Math.cos(a.lng * rad)
    y += Math.cos(a.lat * rad) * Math.sin(a.lng * rad)
    z += Math.sin(a.lat * rad)
  }
  return [Math.atan2(y, x) / rad, Math.atan2(z, Math.hypot(x, y)) / rad]
}

function initialZoom() {
  const w = window.innerWidth
  return w < 640 ? 0.6 : w < 1024 ? 1.2 : 1.6
}

export default Globe
