<script setup>
import { onMounted } from 'vue'
import { AreaChart } from 'lucide-vue-next'
import { GitHubIcon } from 'vue3-simple-icons'

const { title, description, github } = useAppConfig()

// Import dotLottie player on client-side only
onMounted(async () => {
  await import('@dotlottie/player-component')
})
</script>

<template>
  <main class="grid pt-8 pb-4 lg:grid-cols-2 place-items-center md:py-12">
    <div class="text-center lg:text-left">
      <h1 class="text-4xl font-bold lg:text-6xl xl:text-7xl lg:tracking-tight xl:tracking-tighter">
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
          <AreaChart class="w-5 h-5" />
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
          <GitHubIcon class="w-5 h-5" />
          GitHub Repo
        </HomeLink>
      </div>
    </div>
    <div class="py-6">
      <ClientOnly>
        <div class="w-[512px] h-[512px]">
          <dotlottie-player
            src="/paperplane.lottie"
            background="transparent"
            speed="1"
            loop
            autoplay
            class="w-full h-full"
          />
        </div>
      </ClientOnly>
    </div>
  </main>
</template>
