import { useCallback, useEffect, useRef, useState } from 'react'
import Globe from './components/Globe.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import ConservationTag from './components/ConservationTag.jsx'
import { artworks, imageUrl } from './data/artworks.js'

function useTheme() {
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', next)
      } catch {}
      return next
    })
  }, [])
  return [theme, toggle]
}

const idFromHash = () => {
  const id = decodeURIComponent(window.location.hash.slice(1))
  return artworks.some((a) => a.id === id) ? id : null
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const [selectedId, setSelectedId] = useState(idFromHash)
  const [listOpen, setListOpen] = useState(() => window.innerWidth >= 640)
  const globeRef = useRef(null)

  const selectedIndex = artworks.findIndex((a) => a.id === selectedId)
  const selected = artworks[selectedIndex] ?? null

  const select = useCallback((id) => {
    setSelectedId(id)
    if (window.innerWidth < 640) setListOpen(false)
  }, [])

  // Bring the selection into view if it's hidden (also on first load when
  // opened via a #link). Visible points don't move the globe.
  useEffect(() => {
    if (!selected) return
    const t = setTimeout(() => globeRef.current?.showIfHidden(selected), 50)
    return () => clearTimeout(t)
  }, [selected])

  // Mirror the selection in the URL hash so drawings can be linked directly.
  useEffect(() => {
    const hash = selectedId ? `#${selectedId}` : ''
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash || window.location.pathname + window.location.search)
    }
  }, [selectedId])

  useEffect(() => {
    const onHash = () => setSelectedId(idFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const close = useCallback(() => setSelectedId(null), [])
  const step = useCallback(
    (delta) => {
      const i = (selectedIndex + delta + artworks.length) % artworks.length
      setSelectedId(artworks[i].id)
    },
    [selectedIndex],
  )
  const prev = useCallback(() => step(-1), [step])
  const next = useCallback(() => step(1), [step])

  return (
    <main className="relative h-full w-full overflow-hidden">
      <Globe ref={globeRef} artworks={artworks} theme={theme} selectedId={selectedId} onSelect={select} />

      {/* Top bar: title + gallery list on the left, controls on the right */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-4">
        <section
          className={`pointer-events-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xs min-w-0 flex-col rounded-2xl sm:max-h-[calc(100dvh-2rem)] bg-paper/90 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-opacity dark:bg-[#151c22]/90 dark:ring-white/10 ${
            selected ? 'max-sm:opacity-0 max-sm:pointer-events-none' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => setListOpen((o) => !o)}
            aria-expanded={listOpen}
            aria-controls="artwork-list"
            className="flex w-full shrink-0 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-moss"
          >
            <span className="min-w-0">
              <span className="block font-display text-xl leading-tight font-semibold">Bird Art Atlas</span>
              <span className="block text-xs text-stone-600 dark:text-stone-400">
                {artworks.length} drawings from iNaturalist observations
              </span>
            </span>
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 shrink-0 text-stone-500 transition-transform ${listOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {listOpen && (
            <ul
              id="artwork-list"
              className="min-h-0 flex-1 overflow-y-auto border-t border-stone-200 p-2 dark:border-white/10"
            >
              {artworks.map((art) => (
                <li key={art.id}>
                  <button
                    type="button"
                    onClick={() => select(art.id)}
                    aria-current={art.id === selectedId ? 'true' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-moss ${
                      art.id === selectedId
                        ? 'bg-moss/10 dark:bg-moss-light/15'
                        : 'hover:bg-stone-200/60 dark:hover:bg-white/5'
                    }`}
                  >
                    <img
                      src={imageUrl(art, 'thumb')}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-lg object-contain ring-1 ring-black/5 dark:ring-white/10"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold">{art.name}</span>
                        {art.conservationStatus && <ConservationTag status={art.conservationStatus} compact />}
                      </span>
                      <span className="block truncate text-xs text-stone-500 italic dark:text-stone-400">
                        {art.scientificName}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div
          className={`pointer-events-auto flex shrink-0 gap-2 ${selected ? 'sm:mr-[416px]' : ''} transition-[margin] duration-300`}
        >
          <ControlButton label="Reset view" onClick={() => globeRef.current?.resetView()}>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
          </ControlButton>
          <ControlButton
            label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </>
            ) : (
              <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
            )}
          </ControlButton>
        </div>
      </div>

      <DetailPanel
        art={selected}
        index={selectedIndex}
        total={artworks.length}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </main>
  )
}

function ControlButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-full bg-paper/90 text-ink shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-moss dark:bg-[#151c22]/90 dark:text-stone-100 dark:ring-white/10 dark:hover:bg-[#1e2730]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  )
}
