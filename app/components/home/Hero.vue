<script setup>
import { ref, onMounted } from 'vue'
import { AreaChart } from 'lucide-vue-next'
import { GitHubIcon } from 'vue3-simple-icons'

const { title, description, github } = useAppConfig()
const lottiePlayer = ref(null)

useHead({
  script: [
    {
      src: 'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs',
      type: 'module',
    },
  ],
})

onMounted(() => {
  // Use a timeout to ensure the player is ready
  setTimeout(() => {
    if (lottiePlayer.value) {
      lottiePlayer.value.play()
    }
  }, 100) // A small delay can help
})
</script>

<template>
  <main
    class="grid pt-8 pb-4 lg:grid-cols-2 place-items-center md:py-12"
  >
    <div class="text-center lg:text-left">
      <h1
        class="text-4xl font-bold lg:text-6xl xl:text-7xl lg:tracking-tight xl:tracking-tighter"
      >
        {{ title }}
      </h1>
      <p class="max-w-xl mt-4 text-base text-slate-600 md:text-lg">
        {{ description }}
      </p>
      <div class="flex flex-col items-center gap-3 mt-6 sm:flex-row">
        <HomeLink
          href="/dashboard"
          target="_blank"
          title="Dashboard"
          class="flex items-center justify-center w-full gap-1 sm:w-auto"
          rel="noopener"
        >
          <AreaChart
            class="w-5 h-5"
          />
          {{ $t('dashboard.title') }}
        </HomeLink>
        <HomeLink
          size="lg"
          type="outline"
          rel="noopener"
          :href="github"
          title="Github"
          class="flex items-center justify-center w-full gap-1 sm:w-auto"
          target="_blank"
        >
          <GitHubIcon
            class="w-5 h-5"
          />
          GitHub Repo
        </HomeLink>
      </div>
    </div>
    <div class="hidden py-6 md:block">
      <ClientOnly>
        <dotlottie-player
          ref="lottiePlayer"
          src="/paperplane.lottie"
          loop
          style="width: 512px; height: 512px;"
        />
      </ClientOnly>
    </div>
  </main>
</template>
