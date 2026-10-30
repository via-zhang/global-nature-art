import { imageUrl } from '../data/artworks.js'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:cursor-not-allowed disabled:opacity-50'

export function PrimaryButton({ className = '', ...props }) {
  return (
    <button
      type="button"
      className={`${BASE} bg-moss text-white hover:bg-[#345a42] dark:bg-moss-light dark:text-ink dark:hover:bg-[#a3cdac] ${className}`}
      {...props}
    />
  )
}

export function SecondaryButton({ className = '', ...props }) {
  return (
    <button
      type="button"
      className={`${BASE} bg-stone-200/70 text-ink hover:bg-stone-300/70 dark:bg-white/10 dark:text-stone-100 dark:hover:bg-white/15 ${className}`}
      {...props}
    />
  )
}

// Small card used in end-of-game summaries; opens the drawing on the globe.
export function BirdSummaryRow({ art, onView, children }) {
  return (
    <li className="flex items-center gap-3 rounded-xl p-2 ring-1 ring-black/5 dark:ring-white/10">
      <img src={imageUrl(art, 'thumb')} alt="" className="h-12 w-12 shrink-0 rounded-lg object-contain" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{art.name}</span>
        <span className="block truncate text-xs text-stone-500 italic dark:text-stone-400">{art.scientificName}</span>
        {children}
      </span>
      <button
        type="button"
        onClick={() => onView(art.id)}
        className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-moss hover:bg-moss/10 focus-visible:outline-2 focus-visible:outline-moss dark:text-moss-light dark:hover:bg-moss-light/15"
      >
        View on globe
      </button>
    </li>
  )
}

export function Icon({ children, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const GAME_ICONS = {
  pair: (
    <>
      <rect x="3" y="4" width="8" height="11" rx="1.5" />
      <rect x="13" y="9" width="8" height="11" rx="1.5" />
    </>
  ),
  who: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </>
  ),
  where: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
}
