import { CONSERVATION_STATUS } from '../data/artworks.js'

// IUCN Red List status. `compact` shows just the code (e.g. in lists).
// With `href`, the full tag links to the species' Red List assessment.
export default function ConservationTag({ status, href, compact = false, className = '' }) {
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

  const Tag = href ? 'a' : 'span'
  const linkProps = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Tag
      {...linkProps}
      title={title}
      className={`inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 ${
        href
          ? 'transition-colors hover:bg-stone-200/60 focus-visible:outline-2 focus-visible:outline-moss dark:hover:bg-white/5'
          : ''
      } ${className}`}
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
      {href && (
        <>
          <svg
            viewBox="0 0 24 24"
            className="-ml-1 h-3.5 w-3.5 text-stone-500 dark:text-stone-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </Tag>
  )
}
