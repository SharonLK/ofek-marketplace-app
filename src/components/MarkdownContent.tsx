import { useMemo } from 'react'

interface MarkdownContentProps {
  content: string
}

function renderMarkdown(md: string): string {
  const codeBlocks: string[] = []

  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length
    const langClass = lang ? ` class="language-${lang}"` : ''
    codeBlocks.push(
      `<pre class="bg-neutral-800 rounded-lg p-4 my-3 overflow-x-auto text-sm"><code${langClass}>${code.trim()}</code></pre>`,
    )
    return `\x00CODEBLOCK${idx}\x00`
  })

  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-neutral-200 mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-neutral-200 mt-6 mb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-neutral-200 mt-6 mb-3">$1</h1>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-neutral-200">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code class="bg-neutral-800 px-1 py-0.5 rounded text-sm text-cyan-400">$1</code>')
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 text-neutral-300">$1</li>')
  html = html.replace(/\n\n/g, '</p><p class="text-neutral-300 mb-2">')
  html = html.replace(/\n/g, '<br/>')

  html = `<p class="text-neutral-300 mb-2">${html}</p>`

  html = html.replace(/\x00CODEBLOCK(\d+)\x00/g, (_, idx) => codeBlocks[Number(idx)])

  return html
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
