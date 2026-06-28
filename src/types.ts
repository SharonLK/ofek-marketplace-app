export type PluginType = 'skill' | 'hook' | 'mcp' | 'agent'

export interface PluginManifest {
  name: string
  version?: string
  description?: string
  type?: PluginType
}

export interface PluginItem {
  name: string
  dirName: string
  hierarchy: 'common' | string
  manifest: PluginManifest
  types: PluginType[]
  skillNames: string[]
  hookNames: string[]
  mcpNames: string[]
  agentNames: string[]
  path: string
}

export interface TreeNode {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url?: string
}

export interface GitHubTreeResponse {
  sha: string
  url: string
  tree: TreeNode[]
  truncated: boolean
}
