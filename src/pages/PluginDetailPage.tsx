import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchFileContent, fetchPlugins, fetchTree } from '../api/github'
import MarkdownContent from '../components/MarkdownContent'
import type { PluginItem, PluginType } from '../types'

const TYPE_LABELS: Record<PluginType, { label: string; dir: string; color: string }> = {
  skill: { label: 'Skills', dir: 'skills', color: 'bg-emerald-600' },
  hook: { label: 'Hooks', dir: 'hooks', color: 'bg-violet-600' },
  mcp: { label: 'MCPs', dir: 'mcps', color: 'bg-amber-600' },
  agent: { label: 'Agents', dir: 'agents', color: 'bg-rose-600' },
}

interface FileEntry {
  name: string
  type: PluginType
  content: string
  loading: boolean
}

export default function PluginDetailPage() {
  const { name } = useParams<{ name: string }>()
  const [plugin, setPlugin] = useState<PluginItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [files, setFiles] = useState<FileEntry[]>([])

  useEffect(() => {
    if (!name) return
    let cancelled = false

    setLoading(true)
    setError(null)

    fetchTree()
      .then((tree) => fetchPlugins(tree))
      .then((items) => {
        if (cancelled) return
        const found = items.find((p) => p.name === name)
        if (!found) {
          setError(`Plugin "${name}" not found`)
          setLoading(false)
          return
        }
        setPlugin(found)

        const entries: FileEntry[] = []
        for (const t of found.types) {
          const names =
            t === 'skill'
              ? found.skillNames
              : t === 'hook'
                ? found.hookNames
                : t === 'mcp'
                  ? found.mcpNames
                  : found.agentNames

          for (const n of names) {
            entries.push({
              name: n,
              type: t,
              content: '',
              loading: true,
            })
          }
        }
        setFiles(entries)
        setLoading(false)

        entries.forEach((entry, idx) => {
          const ext = entry.type === 'skill' ? 'SKILL' : entry.type === 'hook' ? 'HOOK' : entry.type === 'mcp' ? 'MCP' : 'AGENT'
          const filePath = `${TYPE_LABELS[entry.type].dir}/${entry.name}/${ext}.md`
          fetchFileContent(found.path, filePath)
            .then((content) => {
              if (cancelled) return
              setFiles((prev) => {
                const next = [...prev]
                next[idx] = { ...next[idx], content, loading: false }
                return next
              })
            })
            .catch(() => {
              if (cancelled) return
              setFiles((prev) => {
                const next = [...prev]
                next[idx] = { ...next[idx], content: 'Error loading content', loading: false }
                return next
              })
            })
        })
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [name])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        <span className="ml-3 text-neutral-400">Loading plugin...</span>
      </div>
    )
  }

  if (error || !plugin) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-2">{error || 'Plugin not found'}</p>
        <Link to="/" className="text-cyan-500 hover:underline text-sm">
          Back to marketplace
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="text-cyan-500 hover:underline text-sm mb-4 inline-block">
        &larr; Back to marketplace
      </Link>

      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-200 m-0">{plugin.name}</h1>
            {plugin.manifest.description && (
              <p className="text-neutral-400 mt-1">{plugin.manifest.description}</p>
            )}
          </div>
          <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded">
            {plugin.hierarchy === 'common' ? 'Common' : plugin.hierarchy}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {plugin.types.map((t) => (
            <span
              key={t}
              className={`text-xs px-2 py-0.5 rounded-full text-white ${TYPE_LABELS[t].color}`}
            >
              {TYPE_LABELS[t].label}
            </span>
          ))}
        </div>
      </div>

      {files.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          No plugin files to display.
        </div>
      )}

      {files.map((file) => (
        <div key={`${file.type}-${file.name}`} className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${TYPE_LABELS[file.type].color}`}>
              {TYPE_LABELS[file.type].label}
            </span>
            <h2 className="text-lg font-semibold text-neutral-200 m-0">{file.name}</h2>
          </div>
          {file.loading ? (
            <div className="flex items-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500" />
              <span className="ml-2 text-sm text-neutral-500">Loading...</span>
            </div>
          ) : (
            <MarkdownContent content={file.content} />
          )}
        </div>
      ))}
    </div>
  )
}
