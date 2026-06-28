import { useState } from 'react'
import type { PluginItem, PluginType } from '../types'

const RAW_BASE = 'https://raw.githubusercontent.com/SharonLK/ofek-marketplace/main'
const LOCAL_BASE = '.opencode'
const GLOBAL_BASE = '~/.config/opencode'

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

function buildInstallCommand(entry: FileEntry, plugin: PluginItem, targetBase: string): string {
  const cfg = TYPE_CONFIG[entry.type]
  const prefix = getPluginPrefix(plugin)
  const relDir = cfg.dir.replace('.opencode/', '')
  const url = `${RAW_BASE}/${prefix}/${relDir}/${entry.name}/${cfg.ext}`
  const installDir = `${targetBase}/${relDir}/${entry.name}`
  const installPath = `${installDir}/${cfg.ext}`
  return `mkdir -p ${installDir}\ncurl -o ${installPath} ${url}`
}

export default function PluginDetailModal({ plugin, onClose }: PluginDetailModalProps) {
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null)

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

  const handleCopy = (key: string, command: string) => {
    navigator.clipboard.writeText(command).then(() => {
      setCopiedIdx(key)
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
                    const localKey = `${idx}-local`
                    const globalKey = `${idx}-global`
                    const localCommand = buildInstallCommand(entry, plugin, LOCAL_BASE)
                    const globalCommand = buildInstallCommand(entry, plugin, GLOBAL_BASE)
                    return (
                      <div
                        key={`${entry.type}-${entry.name}`}
                        className="bg-black rounded-lg border border-neutral-800 p-4"
                      >
                        <div>
                          <div className="text-xs text-neutral-500 font-medium mb-1">
                            Local project install <span className="text-neutral-400">— {entry.name}</span>
                          </div>
                          <pre className="text-sm text-cyan-400 font-mono whitespace-pre-wrap m-0 select-all">
                            {localCommand}
                          </pre>
                          <div className="mt-1.5 flex justify-end">
                            <button
                              onClick={() => handleCopy(localKey, localCommand)}
                              className="px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                            >
                              {copiedIdx === localKey ? 'Copied!' : 'Copy Local'}
                            </button>
                          </div>
                        </div>

                        <hr className="border-neutral-700 my-4" />

                        <div>
                          <div className="text-xs text-neutral-500 font-medium mb-1">
                            Global (user-wide) install
                          </div>
                          <pre className="text-sm text-cyan-400 font-mono whitespace-pre-wrap m-0 select-all">
                            {globalCommand}
                          </pre>
                          <div className="mt-1.5 flex justify-end">
                            <button
                              onClick={() => handleCopy(globalKey, globalCommand)}
                              className="px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                            >
                              {copiedIdx === globalKey ? 'Copied!' : 'Copy Global'}
                            </button>
                          </div>
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
