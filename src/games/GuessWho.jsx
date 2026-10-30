import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { artworks, imageUrl, CONSERVATION_STATUS } from '../data/artworks.js'
import ConservationTag from '../components/ConservationTag.jsx'
import { draw, shuffle } from './utils.js'
import { BirdSummaryRow, PrimaryButton, SecondaryButton } from './ui.jsx'

const ROUNDS = 5
const GRID = 4
const MAX_GUESSES = 3
const START_TILES = 2
const MIN_COVERAGE = 0.2 // a tile must be at least this much drawing to be revealed
const STATUS_CHOICES = ['LC', 'NT', 'VU', 'EN', 'CR']

// Fraction of each tile (row by row) that is drawing rather than background.
// Transparent and near-white pixels both count as background.
const coverageCache = new Map()
async function measureTiles(art) {
  if (coverageCache.has(art.id)) return coverageCache.get(art.id)
  const img = new Image()
  img.src = imageUrl(art, 'color')
  await img.decode()
  const size = GRID * 16
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)
  const coverage = new Array(GRID * GRID).fill(0)
  const cell = size / GRID
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const isBackground = data[i + 3] < 40 || (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235)
      if (!isBackground) coverage[Math.floor(y / cell) * GRID + Math.floor(x / cell)]++
    }
  }
  const result = { coverage: coverage.map((c) => c / (cell * cell)), ratio: img.naturalWidth / img.naturalHeight }
  coverageCache.set(art.id, result)
  return result
}

// Random unrevealed tiles with enough drawing; falls back to the most-drawn ones.
function pickTiles(coverage, revealed, count) {
  const hidden = coverage.map((c, i) => ({ c, i })).filter(({ i }) => !revealed.includes(i))
  const good = shuffle(hidden.filter(({ c }) => c >= MIN_COVERAGE))
  const rest = hidden.filter(({ c }) => c < MIN_COVERAGE && c > 0.02).sort((a, b) => b.c - a.c)
  return [...good, ...rest].slice(0, count).map(({ i }) => i)
}

export default function GuessWho({ onViewBird, onPlayAgain }) {
  const birds = useMemo(() => draw('who', artworks, ROUNDS), [])
  const [roundIndex, setRoundIndex] = useState(0)
  const [results, setResults] = useState([])
  const finished = results.length === birds.length

  if (finished) {
    const birdScore = results.filter((r) => r.birdCorrect).length
    const statusScore = results.filter((r) => r.statusCorrect).length
    return (
      <div className="mx-auto max-w-xl px-4 py-6">
        <h2 className="font-display text-3xl font-semibold">Game over</h2>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          You named{' '}
          <strong className="text-ink dark:text-stone-100">
            {birdScore}/{birds.length}
          </strong>{' '}
          birds and got{' '}
          <strong className="text-ink dark:text-stone-100">
            {statusScore}/{birds.length}
          </strong>{' '}
          IUCN statuses right.
        </p>
        <ul className="mt-5 grid gap-2">
          {results.map((r) => (
            <BirdSummaryRow key={r.art.id} art={r.art} onView={onViewBird}>
              <span className="mt-0.5 block text-xs text-stone-600 dark:text-stone-400">
                {r.birdCorrect ? `✓ Named in ${r.guesses} ${r.guesses === 1 ? 'guess' : 'guesses'}` : '✗ Not named'} ·{' '}
                {r.statusCorrect ? '✓' : '✗'} Status
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

  return (
    <Round
      key={birds[roundIndex].id}
      art={birds[roundIndex]}
      number={roundIndex + 1}
      total={birds.length}
      score={results.filter((r) => r.birdCorrect).length}
      onDone={(result) => {
        setResults((rs) => [...rs, result])
        setRoundIndex((i) => Math.min(i + 1, birds.length - 1))
      }}
    />
  )
}

function Round({ art, number, total, score, onDone }) {
  const [tiles, setTiles] = useState(null) // { coverage, ratio }
  const [revealed, setRevealed] = useState([])
  const [wrong, setWrong] = useState([]) // wrong guesses (artworks)
  const [birdCorrect, setBirdCorrect] = useState(null) // null while guessing
  const [statusPick, setStatusPick] = useState(null)
  const statusRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    measureTiles(art).then((t) => {
      if (cancelled) return
      setTiles(t)
      setRevealed(pickTiles(t.coverage, [], START_TILES))
    })
    return () => {
      cancelled = true
    }
  }, [art])

  const guessing = birdCorrect === null
  const hintTiles = tiles && guessing ? pickTiles(tiles.coverage, revealed, 1) : []
  const statusAnswer = art.conservationStatus
  const statusChoices =
    STATUS_CHOICES.includes(statusAnswer) || !statusAnswer ? STATUS_CHOICES : [...STATUS_CHOICES, statusAnswer]

  useEffect(() => {
    if (!guessing) statusRef.current?.focus({ preventScroll: false })
  }, [guessing])

  const guess = (pick) => {
    if (pick.id === art.id) return setBirdCorrect(true)
    const nextWrong = [...wrong, pick]
    setWrong(nextWrong)
    if (nextWrong.length >= MAX_GUESSES) setBirdCorrect(false)
  }

  const finishRound = () =>
    onDone({
      art,
      birdCorrect,
      guesses: wrong.length + (birdCorrect ? 1 : 0),
      statusCorrect: !statusAnswer || statusPick === statusAnswer,
    })

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
      <div>
        <p className="mb-2 flex justify-between text-sm text-stone-600 dark:text-stone-400">
          <span>
            Bird <strong className="text-ink dark:text-stone-100">{number}</strong> of {total}
          </span>
          <span>
            Named: <strong className="text-ink tabular-nums dark:text-stone-100">{score}</strong>
          </span>
        </p>
        <div
          className="relative mx-auto w-full max-w-[min(100%,52dvh)] overflow-hidden rounded-2xl bg-paper ring-1 ring-black/5 md:max-w-none dark:bg-[#1b232b] dark:ring-white/10"
          style={{ aspectRatio: tiles?.ratio ?? 1 }}
        >
          <img
            src={imageUrl(art, 'color')}
            alt={guessing ? 'Mystery bird, partly hidden' : `Drawing of a ${art.name}`}
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain select-none"
          />
          <div
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, gridTemplateRows: `repeat(${GRID}, 1fr)` }}
            aria-hidden="true"
          >
            {Array.from({ length: GRID * GRID }, (_, i) => {
              // Covers stay covered while the tiles are being measured.
              const shown = tiles && (!guessing || revealed.includes(i))
              return (
                <span
                  key={i}
                  className={`border border-black/5 bg-stone-300 transition-opacity duration-500 motion-reduce:transition-none dark:border-white/5 dark:bg-[#2a333c] ${
                    shown ? 'opacity-0' : ''
                  }`}
                  style={
                    !guessing ? { transitionDelay: `${(i % GRID) * 40 + Math.floor(i / GRID) * 40}ms` } : undefined
                  }
                />
              )
            })}
          </div>
        </div>
        {guessing && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <SecondaryButton onClick={() => setRevealed((r) => [...r, ...hintTiles])} disabled={!hintTiles.length}>
              Reveal another tile
            </SecondaryButton>
            <span className="text-xs text-stone-500 dark:text-stone-400">{revealed.length}/16 tiles shown</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {guessing ? (
          <>
            <div>
              <h2 className="font-display text-2xl font-semibold">Which bird is this?</h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Search by common or scientific name.{' '}
                <strong className="text-ink dark:text-stone-100">
                  {MAX_GUESSES - wrong.length} {MAX_GUESSES - wrong.length === 1 ? 'guess' : 'guesses'} left
                </strong>
              </p>
            </div>
            <BirdSearch exclude={wrong.map((w) => w.id)} onPick={guess} />
            {wrong.length > 0 && (
              <ul aria-label="Wrong guesses" className="flex flex-wrap gap-2">
                {wrong.map((w) => (
                  <li
                    key={w.id}
                    className="rounded-full bg-[#d81e05]/10 px-3 py-1 text-sm text-[#b31803] line-through dark:text-[#ff8a75]"
                  >
                    {w.name}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <div aria-live="polite">
              <p
                className={`text-sm font-semibold ${birdCorrect ? 'text-moss dark:text-moss-light' : 'text-[#b31803] dark:text-[#ff8a75]'}`}
              >
                {birdCorrect ? `Correct${wrong.length ? '' : ' on the first guess'}!` : 'Out of guesses. It was the…'}
              </p>
              <h2 className="font-display text-3xl font-semibold">{art.name}</h2>
              <p className="text-lg text-stone-600 italic dark:text-stone-300">{art.scientificName}</p>
            </div>

            <div
              role="group"
              aria-labelledby="status-question"
              className="rounded-2xl bg-paper p-4 ring-1 ring-black/5 dark:bg-[#151c22] dark:ring-white/10"
            >
              <h3 id="status-question" ref={statusRef} tabIndex={-1} className="mb-3 font-semibold focus:outline-none">
                What's its IUCN Red List status?
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {statusChoices.map((code) => {
                  const info = CONSERVATION_STATUS[code]
                  const picked = statusPick === code
                  const isAnswer = statusPick && code === statusAnswer
                  return (
                    <button
                      key={code}
                      type="button"
                      disabled={!!statusPick}
                      onClick={() => setStatusPick(code)}
                      aria-pressed={picked}
                      className={`flex items-center gap-2 rounded-xl p-2 text-left text-sm font-medium ring-1 transition-colors focus-visible:outline-2 focus-visible:outline-moss disabled:cursor-default ${
                        isAnswer
                          ? 'ring-2 ring-moss dark:ring-moss-light'
                          : picked
                            ? 'ring-2 ring-[#d81e05]'
                            : 'ring-black/10 enabled:hover:bg-stone-200/60 dark:ring-white/15 dark:enabled:hover:bg-white/5'
                      } ${statusPick && !isAnswer && !picked ? 'opacity-50' : ''}`}
                    >
                      <span
                        className="grid h-7 min-w-7 place-items-center rounded-full px-1 text-[11px] font-bold"
                        style={{ backgroundColor: info.bg, color: info.fg }}
                        aria-hidden="true"
                      >
                        {code}
                      </span>
                      {info.label}
                      {isAnswer && <span className="ml-auto text-moss dark:text-moss-light">✓</span>}
                    </button>
                  )
                })}
              </div>
              {statusPick && (
                <p aria-live="polite" className="mt-3 text-sm">
                  {statusPick === statusAnswer ? 'Right! ' : 'Not quite. '}
                  {statusAnswer ? (
                    <>
                      It's <ConservationTag status={statusAnswer} href={art.conservationUrl} className="mt-2" />
                    </>
                  ) : (
                    'This bird has no status recorded.'
                  )}
                </p>
              )}
            </div>

            {statusPick && (
              <PrimaryButton onClick={finishRound} className="self-start">
                {number === total ? 'See results' : 'Next bird →'}
              </PrimaryButton>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Type-to-filter list of every bird (combobox pattern).
function BirdSearch({ exclude, onPick }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = useId()
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const q = query.trim().toLowerCase()
  const options = artworks.filter(
    (a) =>
      !exclude.includes(a.id) && (!q || a.name.toLowerCase().includes(q) || a.scientificName.toLowerCase().includes(q)),
  )

  useEffect(() => setActive(0), [query])
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const pick = (art) => {
    onPick(art)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // First Enter reopens the list (e.g. after a wrong guess); the next one picks.
      if (open && options[active]) pick(options[active])
      else setOpen(true)
    } else if (e.key === 'Escape' && open) {
      e.preventDefault() // keep the games overlay open
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
        aria-label="Search birds"
        placeholder="Search birds…"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="w-full rounded-xl bg-paper px-4 py-3 text-base ring-1 ring-black/10 outline-none placeholder:text-stone-400 focus:ring-2 focus:ring-moss dark:bg-[#151c22] dark:ring-white/15 dark:focus:ring-moss-light"
      />
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Birds"
          className="absolute inset-x-0 top-full z-10 mt-1 max-h-72 overflow-y-auto rounded-xl bg-paper p-1 shadow-lg ring-1 ring-black/10 dark:bg-[#1b232b] dark:ring-white/15"
        >
          {options.length === 0 && <li className="px-3 py-2 text-sm text-stone-500">No birds match “{query}”.</li>}
          {options.map((art, i) => (
            <li
              key={art.id}
              id={`${listId}-${i}`}
              data-index={i}
              role="option"
              aria-selected={i === active}
              // mousedown (not click) so the input's blur doesn't close the list first
              onMouseDown={(e) => {
                e.preventDefault()
                pick(art)
              }}
              onMouseMove={() => setActive(i)}
              className={`cursor-pointer rounded-lg px-3 py-2 ${i === active ? 'bg-moss/10 dark:bg-moss-light/15' : ''}`}
            >
              <span className="block text-sm font-semibold">{art.name}</span>
              <span className="block text-xs text-stone-500 italic dark:text-stone-400">{art.scientificName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
