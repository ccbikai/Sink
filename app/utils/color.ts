export function colorGradation(count: number) {
  return Array.from({ length: count }, (_, i) => `hsl(var(--vis-primary-color) / ${1 - (1 / count) * i})`)
}
