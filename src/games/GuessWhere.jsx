import { useEffect, useMemo, useRef, useState } from 'react'
import { LngLatBounds, Map as MapLibreMap, Marker, NavigationControl } from 'maplibre-gl'
import { artworks, imageUrl } from '../data/artworks.js'
import ConservationTag from '../components/ConservationTag.jsx'
import { BACKGROUND, RASTER_PAINT, buildStyle } from '../map/osmStyle.js'
import { distanceKm, draw, formatDistance, greatCircle } from './utils.js'
import { BirdSummaryRow, PrimaryButton } from './ui.jsx'

const ROUNDS = 5
const WORLD_VIEW = { center: [10, 20], zoom: window.innerWidth < 640 ? 0 : 1.2 }

function rating(km) {
  if (km <= 50) return 'Bullseye!'
  if (km <= 250) return 'Very close!'
  if (km <= 1000) return 'Same region'
  if (km <= 3000) return 'Right part of the world'
  if (km <= 8000) return 'A long way off'
  return 'Other side of the world'
}

function pinElement() {
  const el = document.createElement('div')
  el.innerHTML = `<svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true">
    <path d="M15 39s13-12.6 13-23A13 13 0 002 16c0 10.4 13 23 13 23z" fill="#3f6b4f" stroke="#fff" stroke-width="2.5"/>
    <circle cx="15" cy="15.5" r="5" fill="#fff"/></svg>`
  el.style.cursor = 'grab'
  el.style.filter = 'drop-shadow(0 2px 3px rgb(0 0 0 / 0.35))'
  return el
}

function answerElement(art) {
  const el = document.createElement('div')
  el.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none'
  el.innerHTML = `<span style="width:56px;height:56px;border-radius:10px;background:var(--card-bg);border:2px solid var(--card-border);box-shadow:0 4px 12px rgb(0 0 0 / .3);overflow:hidden">
      <img src="${imageUrl(art, 'thumb')}" alt="" style="width:100%;height:100%;object-fit:contain"/></span>
    <span style="width:16px;height:16px;border-radius:9999px;background:var(--color-accent);border:2.5px solid #fff;box-shadow:0 1px 4px rgb(0 0 0 / .35)"></span>`
  return el
}

export default function GuessWhere({ theme, onViewBird, onPlayAgain }) {
  const birds = useMemo(() => draw('where', artworks, ROUNDS), [])
  const [roundIndex, setRoundIndex] = useState(0)
  const [guess, setGuess] = useState(null) // { lng, lat }
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState([])
  const [mapFocused, setMapFocused] = useState(false)
  const finished = results.length === birds.length && !revealed

  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const guessMarkerRef = useRef(null)
  const answerMarkerRef = useRef(null)
  const revealedRef = useRef(false)
  revealedRef.current = revealed

  const art = birds[roundIndex]
  const km = guess && revealed ? distanceKm(guess, art) : null

  // Create the map once.
  useEffect(() => {
    if (finished) return
    const map = new MapLibreMap({
      container: containerRef.current,
      style: buildStyle(theme, { globe: false }),
      ...WORLD_VIEW,
      maxZoom: 16,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: { compact: true },
    })
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    map.on('load', () => {
      map.addSource('guess-line', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({
        id: 'guess-line',
        type: 'line',
        source: 'guess-line',
        paint: { 'line-color': '#d9502b', 'line-width': 3, 'line-dasharray': [2, 1.5] },
        layout: { 'line-cap': 'round' },
      })
    })

    const place = (lngLat) => {
      if (revealedRef.current) return
      const { lng, lat } = lngLat.wrap()
      setGuess({ lng, lat })
    }
    map.on('click', (e) => place(e.lngLat))

    // Keyboard: pan with the arrow keys, Enter/Space drops the pin at the crosshair.
    const canvas = map.getCanvasContainer()
    canvas.setAttribute('aria-label', 'Map. Use arrow keys to pan and Enter to drop your pin at the center.')
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        place(map.getCenter())
      }
    }
    // Only show the crosshair for keyboard focus, not after a click or tap.
    const onFocus = (e) => setMapFocused(e.target.matches(':focus-visible'))
    const onBlur = () => setMapFocused(false)
    canvas.addEventListener('keydown', onKey)
    canvas.addEventListener('focusin', onFocus)
    canvas.addEventListener('focusout', onBlur)

    mapRef.current = map
    return () => {
      canvas.removeEventListener('keydown', onKey)
      canvas.removeEventListener('focusin', onFocus)
      canvas.removeEventListener('focusout', onBlur)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  // Recolor the basemap for the theme without reloading the style (which
  // would drop the guess line).
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      for (const [prop, value] of Object.entries(RASTER_PAINT[theme])) map.setPaintProperty('osm', prop, value)
      map.setPaintProperty('background', 'background-color', BACKGROUND[theme])
    }
    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [theme])

  // Show / move the guess pin (draggable until the answer is revealed).
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!guess) {
      guessMarkerRef.current?.remove()
      guessMarkerRef.current = null
      return
    }
    if (!guessMarkerRef.current) {
      const marker = new Marker({ element: pinElement(), anchor: 'bottom', draggable: true })
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat().wrap()
        setGuess({ lng, lat })
      })
      guessMarkerRef.current = marker
    }
    guessMarkerRef.current.setLngLat([guess.lng, guess.lat]).setDraggable(!revealed).addTo(map)
  }, [guess, revealed])

  // Reveal: answer marker, great-circle line, and zoom to fit both points.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !revealed || !guess) return
    const answer = new Marker({ element: answerElement(art), anchor: 'bottom', offset: [0, 8] })
      .setLngLat([art.lng, art.lat])
      .addTo(map)
    answerMarkerRef.current = answer
    const coords = greatCircle(guess, art)
    map.getSource('guess-line')?.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } })
    const bounds = coords.reduce((b, c) => b.extend(c), new LngLatBounds(coords[0], coords[0]))
    map.fitBounds(bounds, { padding: { top: 90, bottom: 240, left: 50, right: 50 }, maxZoom: 7, duration: 1200 })
    return () => {
      answer.remove()
      map.getSource('guess-line')?.setData({ type: 'FeatureCollection', features: [] })
    }
  }, [revealed, art, guess])

  const submit = () => {
    setResults((rs) => [...rs, { art, km: distanceKm(guess, art) }])
    setRevealed(true)
  }

  const next = () => {
    setRevealed(false)
    setGuess(null)
    if (roundIndex < birds.length - 1) {
      setRoundIndex((i) => i + 1)
      mapRef.current?.easeTo({ ...WORLD_VIEW, duration: 900 })
    }
  }

  if (finished) {
    const total = results.reduce((sum, r) => sum + r.km, 0)
    return (
      <div className="mx-auto max-w-xl px-4 py-6">
        <h2 className="font-display text-3xl font-semibold">Game over</h2>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Total distance: <strong className="text-ink dark:text-stone-100">{formatDistance(total)}</strong>
          <br />
          Average per bird:{' '}
          <strong className="text-ink dark:text-stone-100">{formatDistance(total / results.length)}</strong>
        </p>
        <ul className="mt-5 grid gap-2">
          {results.map((r) => (
            <BirdSummaryRow key={r.art.id} art={r.art} onView={onViewBird}>
              <span className="mt-0.5 block text-xs text-stone-600 dark:text-stone-400">
                {formatDistance(r.km)} · {rating(r.km)}
              </span>
            </BirdSummaryRow>
          ))}
        </ul>
        <PrimaryButton onClick={onPlayAgain} className="mt-5">
          Play again
        </PrimaryButton>
      </div>
    )
  }

  const runningTotal = results.reduce((sum, r) => sum + r.km, 0)

  return (
    <div className="flex h-full min-h-[560px] flex-col md:flex-row">
      {/* Clue */}
      <aside className="flex shrink-0 items-center gap-3 border-b border-stone-200 p-3 md:w-80 md:flex-col md:items-stretch md:gap-4 md:border-r md:border-b-0 md:p-5 dark:border-white/10">
        <p className="hidden text-sm text-stone-600 md:block dark:text-stone-400">
          Bird <strong className="text-ink dark:text-stone-100">{roundIndex + 1}</strong> of {birds.length}
          {results.length > 0 && <> · {formatDistance(runningTotal)} so far</>}
        </p>
        <img
          src={imageUrl(art, 'color')}
          alt={`Drawing of a ${art.name}`}
          className="h-20 w-20 shrink-0 rounded-xl bg-paper object-contain ring-1 ring-black/5 md:aspect-square md:h-auto md:w-full dark:bg-[#1b232b] dark:ring-white/10"
        />
        <div className="min-w-0">
          <p className="text-xs text-stone-500 md:hidden dark:text-stone-400">
            Bird {roundIndex + 1} of {birds.length}
          </p>
          <h2 className="truncate font-display text-xl font-semibold md:text-2xl md:whitespace-normal">{art.name}</h2>
          <p className="truncate text-sm text-stone-600 italic md:text-base dark:text-stone-300">
            {art.scientificName}
          </p>
          {art.conservationStatus && (
            <>
              <span className="mt-1 block md:hidden">
                <ConservationTag status={art.conservationStatus} compact />
              </span>
              <span className="mt-3 hidden md:block">
                <ConservationTag status={art.conservationStatus} />
              </span>
            </>
          )}
        </div>
        <p className="hidden text-sm text-stone-600 md:block dark:text-stone-400">
          Where was this bird observed? Click the map to drop your pin (drag it to adjust), then submit.
          <br />
          This species may be found in various places, but you must guess where this particular bird was spotted (and recorded via iNaturalist).
        </p>
      </aside>

      {/* Map */}
      <div className="relative min-h-[360px] flex-1">
        {/* MapLibre sets position: relative on its container, so size it from a wrapper. */}
        <div className="absolute inset-0">
          <div ref={containerRef} className="h-full w-full" />
        </div>
        {mapFocused && !revealed && (
          <span
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-ink drop-shadow-[0_0_2px_white] dark:text-white dark:drop-shadow-[0_0_2px_black]"
            aria-hidden="true"
          >
            +
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 pb-8">
          <div
            aria-live="polite"
            className="pointer-events-auto flex w-full max-w-md flex-col items-center gap-3 rounded-2xl bg-paper/95 p-4 text-center shadow-lg ring-1 ring-black/5 backdrop-blur dark:bg-[#151c22]/95 dark:ring-white/10"
          >
            {!revealed ? (
              <>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {guess ? 'Happy with your pin? Drag it to adjust.' : 'Tap or click the map to drop your pin.'}
                </p>
                <PrimaryButton onClick={submit} disabled={!guess}>
                  Submit guess
                </PrimaryButton>
              </>
            ) : (
              <>
                <p className="font-display text-2xl font-semibold">{rating(km)}</p>
                <p className="text-sm">
                  You were <strong>{formatDistance(km)}</strong> away.
                  {art.observedOn && (
                    <span className="block text-stone-600 dark:text-stone-400">Observed {art.observedOn}</span>
                  )}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href={art.observationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold text-moss hover:bg-moss/10 focus-visible:outline-2 focus-visible:outline-moss dark:text-moss-light dark:hover:bg-moss-light/15"
                  >
                    iNaturalist observation ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <PrimaryButton onClick={next}>
                    {roundIndex === birds.length - 1 ? 'See results' : 'Next bird →'}
                  </PrimaryButton>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
