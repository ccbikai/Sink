export function colorGradation(count: number) {
  return Array.from({ length: count }, (_, i) => `hsl(var(--vis-secondary-color) / ${1 - (1 / count) * i})`)
}
