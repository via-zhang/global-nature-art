import { useEffect, useRef } from 'react'
import { GAMES } from './meta.js'
import { GAME_ICONS, Icon } from './ui.jsx'

// Popup listing the games, shown over the map under the Games button.
export default function GamesMenu({ onOpen, onClose, buttonRef }) {
  const ref = useRef(null)

  useEffect(() => {
    ref.current?.querySelector('button[data-game]')?.focus({ preventScroll: true })

    // Capture phase so Esc closes only this popup, not the drawing panel too.
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      onClose()
      buttonRef.current?.focus()
    }
    const onPointerDown = (e) => {
      if (!ref.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) onClose()
    }
    window.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [onClose, buttonRef])

  return (
    <div
      ref={ref}
      id="games-menu"
      role="dialog"
      aria-labelledby="games-menu-title"
      className="absolute top-full right-0 z-30 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-paper/95 p-2 shadow-xl ring-1 ring-black/5 backdrop-blur-md dark:bg-[#151c22]/95 dark:ring-white/10"
    >
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <h2 id="games-menu-title" className="font-display text-lg font-semibold">
          Games
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close games menu"
          title="Close"
          className="grid h-8 w-8 place-items-center rounded-full text-stone-500 hover:bg-stone-200/70 focus-visible:outline-2 focus-visible:outline-moss dark:text-stone-400 dark:hover:bg-white/10"
        >
          <Icon className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" />
          </Icon>
        </button>
      </div>
      <ul>
        {GAMES.map((g) => (
          <li key={g.id}>
            <button
              type="button"
              data-game={g.id}
              onClick={() => onOpen(g.id)}
              className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-stone-200/60 focus-visible:outline-2 focus-visible:outline-moss dark:hover:bg-white/5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-moss/10 text-moss dark:bg-moss-light/15 dark:text-moss-light">
                <Icon>{GAME_ICONS[g.id]}</Icon>
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{g.name}</span>
                <span className="block text-sm text-stone-600 dark:text-stone-400">{g.blurb}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
