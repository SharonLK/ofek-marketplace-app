import type { PluginItem } from '../types'
import PluginCard from './PluginCard'

interface PluginGridProps {
  plugins: PluginItem[]
  onSelect: (plugin: PluginItem) => void
  search?: string
}

export default function PluginGrid({ plugins, onSelect, search }: PluginGridProps) {
  if (plugins.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        No plugins match your filters.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {plugins.map((plugin) => (
        <PluginCard key={`${plugin.hierarchy}-${plugin.name}`} plugin={plugin} onSelect={onSelect} search={search} />
      ))}
    </div>
  )
}
