import type { GitHubTreeResponse, PluginItem, PluginManifest, PluginType, TreeNode } from '../types'

const OWNER = 'SharonLK'
const REPO = 'ofek-marketplace'
const BRANCH = 'main'
const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
  return res.json()
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch error: ${res.status} ${res.statusText}`)
  return res.text()
}

async function fetchPluginManifest(pluginPath: string): Promise<PluginManifest | null> {
  try {
    return await fetchJson<PluginManifest>(`${RAW_BASE}/${pluginPath}/.plugin/plugin.json`)
  } catch {
    return null
  }
}

function detectTypes(treeNodes: TreeNode[], pluginPrefix: string): {
  types: PluginType[]
  skillNames: string[]
  hookNames: string[]
  mcpNames: string[]
  agentNames: string[]
} {
  const typeDirs: Record<PluginType, string[]> = {
    skill: [],
    hook: [],
    mcp: [],
    agent: [],
  }

  const prefix = pluginPrefix + '/'
  for (const node of treeNodes) {
    if (!node.path.startsWith(prefix)) continue
    const relative = node.path.slice(prefix.length)

    for (const t of ['skill', 'hook', 'mcp', 'agent'] as PluginType[]) {
      const dirPattern = `${t}s/`
      if (relative.startsWith(dirPattern) && node.type === 'blob') {
        const parts = relative.split('/')
        if (parts.length === 3 && parts[2].endsWith('.md')) {
          typeDirs[t].push(parts[1])
        }
      }
    }
  }

  const types = (Object.entries(typeDirs) as [PluginType, string[]][])
    .filter(([, names]) => names.length > 0)
    .map(([t]) => t)

  return {
    types,
    skillNames: typeDirs.skill,
    hookNames: typeDirs.hook,
    mcpNames: typeDirs.mcp,
    agentNames: typeDirs.agent,
  }
}

export async function fetchTree(): Promise<GitHubTreeResponse> {
  return fetchJson<GitHubTreeResponse>(
    `${API_BASE}/git/trees/${BRANCH}?recursive=1`,
  )
}

export async function fetchPlugins(tree: GitHubTreeResponse): Promise<PluginItem[]> {
  const pluginDirs = new Map<string, { hierarchy: string; pluginPath: string }>()

  for (const node of tree.tree) {
    if (node.type !== 'tree') continue

    const commonMatch = node.path.match(/^common\/plugins\/([^/]+)$/)
    if (commonMatch) {
      pluginDirs.set(commonMatch[1], { hierarchy: 'common', pluginPath: node.path })
      continue
    }

    const unitMatch = node.path.match(/^units\/([^/]+)\/plugins\/([^/]+)$/)
    if (unitMatch) {
      pluginDirs.set(`${unitMatch[2]}-${unitMatch[1]}`, {
        hierarchy: unitMatch[1],
        pluginPath: node.path,
      })
    }
  }

  const results: PluginItem[] = []

  for (const [, { hierarchy, pluginPath }] of pluginDirs) {
    const manifest = await fetchPluginManifest(pluginPath)
    const dirName = pluginPath.split('/').pop() ?? ''
    const name = manifest?.name ?? dirName

    const { types, skillNames, hookNames, mcpNames, agentNames } = detectTypes(
      tree.tree,
      pluginPath,
    )

    const detectedTypes = types.length > 0 ? types : (manifest?.type ? [manifest.type] : [])

    results.push({
      name,
      dirName,
      hierarchy,
      manifest: manifest ?? { name },
      types: detectedTypes,
      skillNames,
      hookNames,
      mcpNames,
      agentNames,
      path: pluginPath,
    })
  }

  return results.sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchFileContent(pluginPath: string, filePath: string): Promise<string> {
  return fetchText(`${RAW_BASE}/${pluginPath}/${filePath}`)
}
