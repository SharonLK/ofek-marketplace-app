import { useState } from 'react'
import type { PluginItem, PluginType } from '../types'

const RAW_BASE = 'https://raw.githubusercontent.com/SharonLK/ofek-marketplace/main'

const TYPE_CONFIG: Record<PluginType, { label: string; dir: string; ext: string; color: string }> = {
  skill: { label: 'Skills', dir: '.opencode/skills', ext: 'SKILL.md', color: 'bg-emerald-600' },
  hook: { label: 'Hooks', dir: '.opencode/hooks', ext: 'HOOK.md', color: 'bg-violet-600' },
  mcp: { label: 'MCPs', dir: '.opencode/mcps', ext: 'MCP.md', color: 'bg-amber-600' },
  agent: { label: 'Agents', dir: '.opencode/agents', ext: 'AGENT.md', color: 'bg-rose-600' },
}

interface PluginDetailModalProps {
  plugin: PluginItem
  onClose: () => void
}

interface FileEntry {
  type: PluginType
  name: string
}

function getPluginPrefix(plugin: PluginItem): string {
  if (plugin.hierarchy === 'common') {
    return `common/plugins/${plugin.dirName}`
  }
  return `units/${plugin.hierarchy}/plugins/${plugin.dirName}`
}

function buildInstallCommand(entry: FileEntry, plugin: PluginItem): string {
  const cfg = TYPE_CONFIG[entry.type]
  const prefix = getPluginPrefix(plugin)
  const url = `${RAW_BASE}/${prefix}/${cfg.dir.replace('.opencode/', '')}/${entry.name}/${cfg.ext}`
  const targetPath = `${cfg.dir}/${entry.name}/${cfg.ext}`
  return `mkdir -p ${cfg.dir}/${entry.name}\ncurl -o ${targetPath} ${url}`
}

export default function PluginDetailModal({ plugin, onClose }: PluginDetailModalProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const entries: FileEntry[] = []
  for (const t of plugin.types) {
    const names =
      t === 'skill'
        ? plugin.skillNames
        : t === 'hook'
          ? plugin.hookNames
          : t === 'mcp'
            ? plugin.mcpNames
            : plugin.agentNames
    for (const n of names) {
      entries.push({ type: t, name: n })
    }
  }

  const handleCopy = (idx: number, command: string) => {
    navigator.clipboard.writeText(command).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/60" />
      <div
        className="relative bg-neutral-900 rounded-lg border border-neutral-800 p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 text-xl leading-none bg-neutral-800 rounded-full w-8 h-8 flex items-center justify-center"
        >
          &times;
        </button>

        <div className="mb-6">
          <div className="flex items-start justify-between mb-3 pr-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-200 m-0">{plugin.name}</h1>
              {plugin.manifest.description && (
                <p className="text-neutral-400 mt-1">{plugin.manifest.description}</p>
              )}
            </div>
            <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded shrink-0">
              {plugin.hierarchy === 'common' ? 'Common' : plugin.hierarchy}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {plugin.types.map((t) => (
              <span
                key={t}
                className={`text-xs px-2 py-0.5 rounded-full text-white ${TYPE_CONFIG[t].color}`}
              >
                {TYPE_CONFIG[t].label}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {entries.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              No installable components for this plugin.
            </div>
          )}

          {plugin.types.map((t) => {
            const typeEntries = entries.filter((e) => e.type === t)
            if (typeEntries.length === 0) return null
            const cfg = TYPE_CONFIG[t]

            return (
              <div key={t}>
                <h2 className="text-lg font-semibold text-neutral-200 m-0 mb-3">
                  Install {cfg.label}
                </h2>
                <div className="space-y-3">
                  {typeEntries.map((entry) => {
                    const idx = entries.indexOf(entry)
                    const command = buildInstallCommand(entry, plugin)
                    return (
                      <div
                        key={`${entry.type}-${entry.name}`}
                        className="bg-black rounded-lg border border-neutral-800 p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full text-white ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-sm text-neutral-300 font-mono">{entry.name}</span>
                        </div>
                        <pre className="text-sm text-cyan-400 font-mono whitespace-pre-wrap m-0 select-all">
                          {command}
                        </pre>
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => handleCopy(idx, command)}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                          >
                            {copiedIdx === idx ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
