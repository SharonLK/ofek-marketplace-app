import { getHighlightSegments } from '../utils/search'
import type { PluginItem, PluginType } from '../types'

const TYPE_BADGES: Record<PluginType, { label: string; color: string }> = {
  skill: { label: 'Skill', color: 'bg-emerald-600' },
  hook: { label: 'Hook', color: 'bg-violet-600' },
  mcp: { label: 'MCP', color: 'bg-amber-600' },
  agent: { label: 'Agent', color: 'bg-rose-600' },
}

interface PluginCardProps {
  plugin: PluginItem
  onSelect: (plugin: PluginItem) => void
  search?: string
}

function HighlightedText({ text, query }: { text: string; query?: string }) {
  const segments = getHighlightSegments(text, query ?? '')
  return (
    <>
      {segments.map((s, i) =>
        s.highlighted ? (
          <mark key={i} className="bg-cyan-500/30 text-cyan-200 rounded-sm px-0.5">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}

export default function PluginCard({ plugin, onSelect, search }: PluginCardProps) {
  return (
    <button
      onClick={() => onSelect(plugin)}
      className="block w-full text-left bg-neutral-900 rounded-lg border border-neutral-800 p-4 hover:border-cyan-500 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-neutral-200 m-0">
          <HighlightedText text={plugin.name} query={search} />
        </h3>
        <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded">
          {plugin.hierarchy === 'common' ? 'Common' : plugin.hierarchy}
        </span>
      </div>
      {plugin.manifest.description && (
        <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
          <HighlightedText text={plugin.manifest.description} query={search} />
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {plugin.types.map((t) => (
          <span
            key={t}
            className={`text-xs px-2 py-0.5 rounded-full text-white ${TYPE_BADGES[t].color}`}
          >
            {TYPE_BADGES[t].label}
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400">
        {plugin.skillNames.map((s) => (
          <span key={s}>skill: {s}</span>
        ))}
        {plugin.hookNames.map((s) => (
          <span key={s}>hook: {s}</span>
        ))}
        {plugin.mcpNames.map((s) => (
          <span key={s}>mcp: {s}</span>
        ))}
        {plugin.agentNames.map((s) => (
          <span key={s}>agent: {s}</span>
        ))}
      </div>
    </button>
  )
}
