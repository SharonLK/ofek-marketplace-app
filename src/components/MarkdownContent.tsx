import { useMemo } from 'react'

interface MarkdownContentProps {
  content: string
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-neutral-200 mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-neutral-200 mt-6 mb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-neutral-200 mt-6 mb-3">$1</h1>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-neutral-200">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code class="bg-neutral-800 px-1 py-0.5 rounded text-sm text-cyan-400">$1</code>')
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 text-neutral-300">$1</li>')
  html = html.replace(/\n\n/g, '</p><p class="text-neutral-300 mb-2">')
  html = html.replace(/\n/g, '<br/>')

  return `<p class="text-neutral-300 mb-2">${html}</p>`
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const html = useMemo(() => renderMarkdown(content), [content])

  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
