export function isContentEmpty(content) {
  if (!content?.trim()) return true
  const div = document.createElement('div')
  div.innerHTML = content
  return !div.textContent?.trim()
}

export function isHtmlContent(content) {
  return /<[a-z][\s\S]*>/i.test(content ?? '')
}
