export function colorGradation(count: number) {
  return Array.from(Array(count).keys()).map(i => `hsl(var(--vis-secondary-color) / ${1 - (1 / count) * i})`)
}
