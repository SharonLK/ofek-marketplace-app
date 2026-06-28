import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchPlugins, fetchTree } from '../api/github'
import FilterBar from '../components/FilterBar'
import PluginDetailModal from '../components/PluginDetailModal'
import PluginGrid from '../components/PluginGrid'
import { fuzzyMatch } from '../utils/search'
import type { PluginItem, PluginType } from '../types'

export default function HomePage() {
  const [plugins, setPlugins] = useState<PluginItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedPlugin = useMemo(() => {
    const name = searchParams.get('plugin')
    const hierarchy = searchParams.get('hierarchy')
    if (!name || !hierarchy || plugins.length === 0) return null
    return plugins.find((p) => p.name === name && p.hierarchy === hierarchy) ?? null
  }, [searchParams, plugins])

  const handleSelectPlugin = useCallback((plugin: PluginItem) => {
    setSearchParams({ plugin: plugin.name, hierarchy: plugin.hierarchy }, { replace: true })
  }, [setSearchParams])

  const handleCloseModal = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const [selectedTypes, setSelectedTypes] = useState<PluginType[]>([])
  const [selectedHierarchy, setSelectedHierarchy] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchTree()
      .then((tree) => fetchPlugins(tree))
      .then((items) => {
        if (!cancelled) {
          setPlugins(items)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  const handleTypeToggle = useCallback((t: PluginType) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )
  }, [])

  const hierarchies = useMemo(() => {
    const set = new Set(plugins.map((p) => p.hierarchy))
    return Array.from(set).sort()
  }, [plugins])

  const filtered = useMemo(() => {
    return plugins.filter((p) => {
      if (selectedTypes.length > 0 && !p.types.some((t) => selectedTypes.includes(t))) return false
      if (selectedHierarchy !== null && p.hierarchy !== selectedHierarchy) return false
      if (search && !fuzzyMatch(p.name, search) && !fuzzyMatch(p.manifest.description ?? '', search)) {
        return false
      }
      return true
    })
  }, [plugins, selectedTypes, selectedHierarchy, search])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        <span className="ml-3 text-neutral-400">Loading plugins...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-2">Failed to load plugins</p>
        <p className="text-sm text-neutral-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-200 m-0">Plugin Marketplace</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Browse {plugins.length} plugins from the Ofek organization
        </p>
      </div>
      <FilterBar
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
        hierarchies={hierarchies}
        selectedHierarchy={selectedHierarchy}
        onHierarchyChange={setSelectedHierarchy}
        search={search}
        onSearchChange={setSearch}
      />
      <PluginGrid plugins={filtered} onSelect={handleSelectPlugin} search={search} />
      {selectedPlugin && (
        <PluginDetailModal plugin={selectedPlugin} onClose={handleCloseModal} />
      )}
    </>
  )
}
