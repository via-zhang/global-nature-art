import { useEffect, useRef, useState } from 'react'
import { GAMES } from './meta.js'
import { Icon, SecondaryButton } from './ui.jsx'
import PairBirds from './PairBirds.jsx'
import GuessWho from './GuessWho.jsx'
import GuessWhere from './GuessWhere.jsx'

const COMPONENTS = { pair: PairBirds, who: GuessWho, where: GuessWhere }

// Full-screen overlay for one game. The games list itself is a popup on the map (GamesMenu).
export default function Games({ game, theme, onOpen, onClose, onViewBird }) {
  const [round, setRound] = useState(0) // bumping this remounts the game = new game
  const headingRef = useRef(null)
  const meta = GAMES.find((g) => g.id === game)
  const Game = COMPONENTS[game]

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [game])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !e.defaultPrevented) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="games-title"
      className="fixed inset-0 z-40 flex flex-col bg-[#f3f1ea] text-ink dark:bg-[#0f151b] dark:text-stone-100"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-stone-200 px-3 py-2.5 sm:px-5 dark:border-white/10">
        <button
          type="button"
          onClick={() => onOpen('hub')}
          aria-label="All games"
          title="All games"
          className="grid h-10 w-10 place-items-center rounded-full text-stone-600 hover:bg-stone-200/70 focus-visible:outline-2 focus-visible:outline-moss dark:text-stone-300 dark:hover:bg-white/10"
        >
          <Icon>
            <path d="M15 18l-6-6 6-6" />
          </Icon>
        </button>
        <h1
          id="games-title"
          ref={headingRef}
          tabIndex={-1}
          className="min-w-0 flex-1 truncate font-display text-xl font-semibold focus:outline-none sm:text-2xl"
        >
          {meta.name}
        </h1>
        <SecondaryButton onClick={() => setRound((r) => r + 1)} className="!px-3 !py-2">
          New game
        </SecondaryButton>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close games"
          title="Close games"
          className="grid h-10 w-10 place-items-center rounded-full text-stone-600 hover:bg-stone-200/70 focus-visible:outline-2 focus-visible:outline-moss dark:text-stone-300 dark:hover:bg-white/10"
        >
          <Icon>
            <path d="M6 6l12 12M18 6L6 18" />
          </Icon>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Game
          key={`${game}-${round}`}
          theme={theme}
          onViewBird={onViewBird}
          onPlayAgain={() => setRound((r) => r + 1)}
        />
      </div>
    </div>
  )
}
