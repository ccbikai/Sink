<script setup>
import { AreaChart } from 'lucide-vue-next'
import { GitHubIcon } from 'vue3-simple-icons'

const { title, description, github } = useAppConfig()

useHead({
  script: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js',
      integrity: 'sha512-jEnuDt6jfecCjUkg1Vr3qhJbCMhflQPHs2G3HQkadEcN/nwOEU8p/COswDkX4/xqt/UFvHiU+HNdvF/if19prg==',
      crossorigin: 'anonymous',
      referrerpolicy: 'no-referrer',
    },
  ],
})

onMounted(() => {
  // This is a workaround to ensure lottie is defined
  const interval = setInterval(() => {
    if (typeof lottie !== 'undefined') {
      clearInterval(interval)
      lottie.loadAnimation({
        container: document.getElementById('lottie-container'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/paperplane.lottie',
      })
    }
  }, 100)
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
      <div id="lottie-container" class="w-[512px] h-[512px]" />
    </div>
  </main>
</template>
