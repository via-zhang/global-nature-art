import { useEffect, useRef, useState } from 'react'
import { imageUrl } from '../data/artworks.js'
import ConservationTag from './ConservationTag.jsx'

export default function DetailPanel({ art, index, total, onClose, onPrev, onNext }) {
  const [variant, setVariant] = useState('color')
  const closeRef = useRef(null)

  // Default back to the colored drawing whenever a new artwork opens.
  useEffect(() => {
    setVariant('color')
  }, [art?.id])

  useEffect(() => {
    if (!art) return
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      // Arrow keys pan the map when it has focus; only page drawings elsewhere.
      if (e.target.closest?.('.maplibregl-map, input, textarea')) return
      if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [art, onClose, onPrev, onNext])

  useEffect(() => {
    if (art) closeRef.current?.focus({ preventScroll: true })
  }, [art?.id])

  const open = Boolean(art)

  return (
    <aside
      aria-label={art ? `${art.name} details` : undefined}
      aria-hidden={!open}
      inert={!open}
      className={[
        'pointer-events-auto absolute z-20 flex flex-col overflow-hidden bg-paper shadow-2xl transition-all duration-300 ease-out dark:bg-[#151c22]',
        // Mobile: bottom sheet. Desktop: floating card on the right.
        'inset-x-0 bottom-0 max-h-[78dvh] rounded-t-3xl',
        'sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[400px] sm:rounded-3xl',
        open
          ? 'translate-y-0 opacity-100 sm:translate-x-0'
          : 'translate-y-full opacity-0 sm:translate-x-[calc(100%+2rem)] sm:translate-y-0',
      ].join(' ')}
    >
      {art && (
        <>
          <div className="flex justify-center pt-2 sm:hidden" aria-hidden="true">
            <span className="h-1.5 w-10 rounded-full bg-stone-300 dark:bg-stone-600" />
          </div>

          <div className="flex items-center justify-between gap-2 px-5 pt-3 sm:pt-5">
            <span className="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-stone-400">
              Drawing {index + 1} of {total}
            </span>
            <div className="flex items-center gap-1">
              <IconButton label="Previous drawing" onClick={onPrev}>
                <path d="M15 18l-6-6 6-6" />
              </IconButton>
              <IconButton label="Next drawing" onClick={onNext}>
                <path d="M9 6l6 6-6 6" />
              </IconButton>
              <IconButton label="Close" onClick={onClose} buttonRef={closeRef}>
                <path d="M6 6l12 12M18 6L6 18" />
              </IconButton>
            </div>
          </div>

          <div className="overflow-y-auto px-5 pb-5">
            <div className="relative mt-3 overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
              <img
                key={`${art.id}-color`}
                src={imageUrl(art, 'color')}
                alt={`Colored drawing of a ${art.name}`}
                className={`mx-auto block aspect-square max-h-[38dvh] w-full object-contain sm:max-h-none transition-opacity duration-300 ${variant === 'color' ? 'opacity-100' : 'opacity-0'}`}
              />
              {art.hasSketch && (
                <img
                  key={`${art.id}-sketch`}
                  src={imageUrl(art, 'sketch')}
                  alt={`Pencil sketch of a ${art.name}`}
                  className={`absolute inset-0 block h-full w-full object-contain transition-opacity duration-300 ${variant === 'sketch' ? 'opacity-100' : 'opacity-0'}`}
                />
              )}
            </div>

            {art.hasSketch && (
              <div
                role="radiogroup"
                aria-label="Image version"
                className="mt-3 grid grid-cols-2 rounded-full bg-stone-200/70 p-1 text-sm font-medium dark:bg-white/10"
              >
                {[
                  ['color', 'Drawing'],
                  ['sketch', 'Sketch'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={variant === value}
                    onClick={() => setVariant(value)}
                    className={`rounded-full px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-moss ${
                      variant === value
                        ? 'bg-white text-ink shadow-sm dark:bg-stone-100'
                        : 'text-stone-600 hover:text-ink dark:text-stone-300 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <h2 className="mt-5 font-display text-3xl leading-tight font-semibold">{art.name}</h2>
            <p className="mt-1 text-lg text-stone-600 italic dark:text-stone-300">{art.scientificName}</p>
            {art.conservationStatus && (
              <ConservationTag status={art.conservationStatus} href={art.conservationUrl} className="mt-3" />
            )}

            <dl className="mt-5 space-y-3 border-t border-stone-200 pt-4 text-sm dark:border-white/10">
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500 dark:text-stone-400">Reference photo (iNaturalist)</dt>
                <dd className="text-right font-medium">{art.credit}</dd>
              </div>
              {art.observedOn && (
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500 dark:text-stone-400">Date observed</dt>
                  <dd className="text-right font-medium">{art.observedOn}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500 dark:text-stone-400">Location</dt>
                <dd className="text-right font-medium tabular-nums">{formatCoords(art.lat, art.lng)}</dd>
              </div>
            </dl>

            <a
              href={art.observationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-moss px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#345a42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss dark:bg-moss-light dark:text-ink dark:hover:bg-[#a3cdac]"
            >
              View observation on iNaturalist
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </>
      )}
    </aside>
  )
}

function IconButton({ label, onClick, children, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-moss dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-white"
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

function formatCoords(lat, lng) {
  const f = (v, pos, neg) => `${Math.abs(v).toFixed(3)}° ${v >= 0 ? pos : neg}`
  return `${f(lat, 'N', 'S')}, ${f(lng, 'E', 'W')}`
}
