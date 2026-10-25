import { CONSERVATION_STATUS } from '../data/artworks.js'

// IUCN Red List status. `compact` shows just the code (e.g. in lists).
export default function ConservationTag({ status, compact = false, className = '' }) {
  const info = CONSERVATION_STATUS[status]
  if (!info) return null
  const title = `IUCN Red List: ${info.label}`

  if (compact) {
    return (
      <abbr
        title={title}
        className={`inline-block shrink-0 rounded px-1 text-[10px] leading-4 font-bold tracking-wide no-underline ${className}`}
        style={{ backgroundColor: info.bg, color: info.fg }}
      >
        {status}
        <span className="sr-only"> ({info.label})</span>
      </abbr>
    )
  }

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 ${className}`}
    >
      <span
        className="grid h-6 min-w-6 place-items-center rounded-full px-1 text-[11px] font-bold"
        style={{ backgroundColor: info.bg, color: info.fg }}
        aria-hidden="true"
      >
        {status}
      </span>
      {info.label}
      <span className="text-xs font-normal text-stone-500 dark:text-stone-400">IUCN Red List</span>
    </span>
  )
}
