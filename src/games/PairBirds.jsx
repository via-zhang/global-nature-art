import { useEffect, useRef, useState } from 'react'
import { artworks, imageUrl } from '../data/artworks.js'
import { draw, shuffle } from './utils.js'
import { BirdSummaryRow, PrimaryButton } from './ui.jsx'

const LEVELS = {
  easy: { label: 'Easy', cols: 4, rows: 3 },
  normal: { label: 'Normal', cols: 4, rows: 4 },
  hard: { label: 'Hard', cols: 4, rows: 5 },
}
const FLIP_BACK_MS = 900

// Remembered for "New game" / "Play again" within this visit.
let lastLevel = 'normal'

function deal(level) {
  const { cols, rows } = LEVELS[level]
  const birds = draw('pair', artworks, (cols * rows) / 2)
  return shuffle([...birds, ...birds]).map((art, i) => ({ key: i, art }))
}

const canPlay = (level) => artworks.length >= (LEVELS[level].cols * LEVELS[level].rows) / 2

export default function PairBirds({ onViewBird, onPlayAgain }) {
  const [level, setLevel] = useState(() => (canPlay(lastLevel) ? lastLevel : 'easy'))
  const [cards, setCards] = useState(() => deal(level))
  const [open, setOpen] = useState([]) // indexes of face-up, unmatched cards (max 2)
  const [matched, setMatched] = useState(() => new Set()) // artwork ids
  const [tries, setTries] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const pairs = cards.length / 2
  const done = matched.size === pairs

  const changeLevel = (next) => {
    clearTimeout(timer.current)
    lastLevel = next
    setLevel(next)
    setCards(deal(next))
    setOpen([])
    setMatched(new Set())
    setTries(0)
    setAnnouncement(`${LEVELS[next].label}: ${(LEVELS[next].cols * LEVELS[next].rows) / 2} pairs`)
  }

  const flip = (i) => {
    if (open.length === 2 || open.includes(i) || matched.has(cards[i].art.id)) return
    const nextOpen = [...open, i]
    setOpen(nextOpen)
    if (nextOpen.length < 2) {
      setAnnouncement(cards[i].art.name)
      return
    }
    const [a, b] = nextOpen.map((n) => cards[n].art)
    if (a.id === b.id) {
      const nextMatched = new Set(matched).add(a.id)
      setMatched(nextMatched)
      setOpen([])
      setAnnouncement(
        nextMatched.size === pairs
          ? `All pairs found in ${tries} ${tries === 1 ? 'try' : 'tries'}!`
          : `Match: ${a.name}`,
      )
    } else {
      // A miss counts as one try; flip both back after a moment.
      setTries((t) => t + 1)
      setAnnouncement(`${b.name}. No match.`)
      timer.current = setTimeout(() => setOpen([]), FLIP_BACK_MS)
    }
  }

  const { cols } = LEVELS[level]

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="radiogroup"
          aria-label="Difficulty"
          className="flex rounded-full bg-stone-200/70 p-1 text-sm font-medium dark:bg-white/10"
        >
          {Object.entries(LEVELS).map(([id, l]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={level === id}
              disabled={!canPlay(id)}
              title={canPlay(id) ? undefined : `Needs ${(l.cols * l.rows) / 2} birds`}
              onClick={() => level !== id && changeLevel(id)}
              className={`rounded-full px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-moss disabled:opacity-40 ${
                level === id
                  ? 'bg-white text-ink shadow-sm dark:bg-stone-100'
                  : 'text-stone-600 hover:text-ink dark:text-stone-300 dark:hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          <span className="font-semibold text-ink tabular-nums dark:text-stone-100">{matched.size}</span>/{pairs} pairs
          · <span className="font-semibold text-ink tabular-nums dark:text-stone-100">{tries}</span>{' '}
          {tries === 1 ? 'try' : 'tries'}
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {cards.map((card, i) => {
          const isMatched = matched.has(card.art.id)
          const faceUp = isMatched || open.includes(i)
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => flip(i)}
              aria-label={isMatched ? `${card.art.name}, matched` : faceUp ? card.art.name : `Card ${i + 1}, face down`}
              aria-disabled={faceUp}
              className="group aspect-square rounded-xl perspective-[800px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              <span
                className={`relative block h-full w-full transition-transform duration-300 transform-3d motion-reduce:transition-none ${
                  faceUp ? 'rotate-y-180' : ''
                }`}
              >
                {/* Back of the card */}
                <span className="absolute inset-0 grid place-items-center rounded-xl bg-moss text-white/80 shadow-sm backface-hidden group-hover:bg-[#345a42] dark:bg-[#2d4a38] dark:group-hover:bg-[#365a44]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-1/3 w-1/3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 4c-6 0-11 4-12 10l-3 6M8 14h6M10 10h6" />
                  </svg>
                </span>
                {/* Face: the drawing */}
                <span
                  className={`absolute inset-0 rotate-y-180 rounded-xl bg-paper p-1 shadow-sm ring-2 backface-hidden dark:bg-[#1b232b] ${
                    isMatched ? 'ring-moss dark:ring-moss-light' : 'ring-transparent'
                  }`}
                >
                  <img
                    src={imageUrl(card.art, 'thumb')}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-contain"
                  />
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {done && (
        <section
          aria-label="Results"
          className="mt-2 rounded-2xl bg-paper p-5 shadow-sm ring-1 ring-black/5 dark:bg-[#151c22] dark:ring-white/10"
        >
          <h2 className="font-display text-2xl font-semibold">
            Solved in {tries} {tries === 1 ? 'try' : 'tries'}!
          </h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {tries === 0 ? 'A perfect game.' : 'Each mismatched pair counts as one try.'} You found these birds:
          </p>
          <ul className="mt-4 grid gap-2">
            {[...new Map(cards.map((c) => [c.art.id, c.art])).values()].map((art) => (
              <BirdSummaryRow key={art.id} art={art} onView={onViewBird} />
            ))}
          </ul>
          <PrimaryButton onClick={onPlayAgain} className="mt-5">
            Play again
          </PrimaryButton>
        </section>
      )}
    </div>
  )
}
