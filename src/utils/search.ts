export function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true
  let qi = 0
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  for (let ti = 0; ti < lower.length && qi < q.length; ti++) {
    if (lower[ti] === q[qi]) {
      qi++
    }
  }
  return qi === q.length
}

export function getHighlightSegments(
  text: string,
  query: string,
): { text: string; highlighted: boolean }[] {
  if (!query) return [{ text, highlighted: false }]

  const lower = text.toLowerCase()
  const q = query.toLowerCase()

  const matchedIndices = new Set<number>()
  let qi = 0
  for (let ti = 0; ti < lower.length && qi < q.length; ti++) {
    if (lower[ti] === q[qi]) {
      matchedIndices.add(ti)
      qi++
    }
  }
  if (qi !== q.length) return [{ text, highlighted: false }]

  const segments: { text: string; highlighted: boolean }[] = []
  let current = ''
  let currentHighlighted = matchedIndices.has(0)

  for (let i = 0; i < text.length; i++) {
    const isHighlighted = matchedIndices.has(i)
    if (isHighlighted === currentHighlighted) {
      current += text[i]
    } else {
      segments.push({ text: current, highlighted: currentHighlighted })
      current = text[i]
      currentHighlighted = isHighlighted
    }
  }
  segments.push({ text: current, highlighted: currentHighlighted })

  return segments
}
