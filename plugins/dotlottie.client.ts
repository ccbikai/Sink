export default defineNuxtPlugin(() => {
  if (process.client) {
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs'
    script.type = 'module'
    document.head.appendChild(script)
  }
})
