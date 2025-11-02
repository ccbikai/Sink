<template>
  <div
    class="
      mt-16
      md:mt-0 md:py-12
    "
  >
    <h2 class="text-center font-bold text-slate-600">
      {{ $t('home.logos.title') }}
    </h2>
    <div
      class="
        mt-10 flex flex-wrap items-center justify-center gap-8
        md:gap-20
      "
    >
      <img
        class="aspect-1256/632 w-64"
        alt="Cloudflare"
        src="@/assets/images/cloudflare.png"
      >
      <img
        class="aspect-1256/632 w-64"
        alt="Nuxt.js"
        src="@/assets/images/nuxtjs.png"
      >
    </div>
  </div>
</template>
