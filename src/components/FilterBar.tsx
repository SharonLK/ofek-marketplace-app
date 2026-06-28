import type { PluginType } from '../types'

const TYPE_COLORS: Record<PluginType, string> = {
  skill: 'bg-emerald-600 hover:bg-emerald-500',
  hook: 'bg-violet-600 hover:bg-violet-500',
  mcp: 'bg-amber-600 hover:bg-amber-500',
  agent: 'bg-rose-600 hover:bg-rose-500',
}

interface FilterBarProps {
  selectedTypes: PluginType[]
  onTypeToggle: (t: PluginType) => void
  hierarchies: string[]
  selectedHierarchy: string | null
  onHierarchyChange: (h: string | null) => void
  search: string
  onSearchChange: (s: string) => void
}

const ALL_TYPES: PluginType[] = ['skill', 'hook', 'mcp', 'agent']

export default function FilterBar({
  selectedTypes,
  onTypeToggle,
  hierarchies,
  selectedHierarchy,
  onHierarchyChange,
  search,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-neutral-400 mr-1">Type:</span>
        {ALL_TYPES.map((t) => {
          const active = selectedTypes.includes(t)
          return (
            <button
              key={t}
              onClick={() => onTypeToggle(t)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                active
                  ? TYPE_COLORS[t] + ' text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}s
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-neutral-400 mr-1">Source:</span>
        <button
          onClick={() => onHierarchyChange(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedHierarchy === null
              ? 'bg-cyan-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          All
        </button>
        {hierarchies.map((h) => (
          <button
            key={h}
            onClick={() => onHierarchyChange(h)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedHierarchy === h
                ? 'bg-cyan-600 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {h === 'common' ? 'Common' : h}
          </button>
        ))}
      </div>

      <div>
        <input
          type="text"
          placeholder="Search plugins..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 text-sm"
        />
      </div>
    </div>
  )
}
