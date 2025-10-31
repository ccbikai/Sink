<script setup>
import { AlignJustify, Plane, X } from 'lucide-vue-next'
import { GitHubIcon } from 'vue3-simple-icons'

const showMenu = ref(false)
const { title, github } = useAppConfig()
</script>

<template>
  <section class="border-b">
    <nav class="container relative z-50 h-24 select-none">
      <div
        class="container relative flex flex-wrap items-center justify-between h-24 px-0 mx-auto overflow-hidden font-medium md:overflow-visible lg:justify-center"
      >
        <div class="flex items-center justify-start w-1/4 h-full pr-4">
          <a
            href="/"
            :title="title"
            class="flex items-center py-4 space-x-2 text-xl font-black text-gray-900 dark:text-gray-100 md:py-0"
          >
            <span
              class="flex items-center justify-center w-8 h-8 rounded-full"
            >
              <Plane class="w-full h-full rounded-full" />
            </span>
            <span class="mx-2">{{ title }}</span>
          </a>
        </div>

        <!-- Mobile menu -->
        <div
          v-if="showMenu"
          class="fixed inset-0 z-50 flex flex-col w-full h-full p-4 text-sm bg-background md:hidden"
          @touchmove.prevent
        >
          <div class="flex items-center justify-between">
            <a
              href="/"
              :title="title"
              class="inline-flex items-center w-auto h-16 px-4 text-xl font-black leading-none text-gray-900 dark:text-gray-100"
            >
              <span
                class="flex items-center justify-center w-8 h-8 text-white bg-gray-900 rounded-full"
              >
                <Plane class="w-full h-full rounded-full" />
              </span>
              <span class="mx-2">{{ title }}</span>
            </a>
            <button
              class="p-2 rounded-full hover:bg-muted"
              @click="showMenu = false"
            >
              <X class="w-6 h-6" />
            </button>
          </div>
          <div class="flex flex-col items-center justify-center flex-1 gap-6 text-xl">
            <a
              class="cursor-pointer"
              href="/dashboard"
              :title="`${title} Dashboard`"
            >{{ $t('dashboard.title') }}</a>
            <a
              :href="github"
              target="_blank"
              title="Github"
              class="inline-flex items-center gap-2"
            >
              <GitHubIcon
                class="w-5 h-5"
              />
              GitHub
            </a>

            <div class="flex items-center gap-4 mt-4">
              <SwitchLanguage />
              <SwitchTheme />
            </div>
          </div>
        </div>

        <!-- Desktop menu -->
        <div
          class="top-0 left-0 items-center justify-end hidden w-full h-full p-4 text-sm md:w-3/4 md:absolute lg:text-base md:p-0 md:relative md:flex"
        >
          <NuxtLink
            class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/10 hover:text-primary"
            href="/dashboard"
            :title="`${title} Dashboard`"
          >
            {{ $t('dashboard.title') }}
          </NuxtLink>
          <NuxtLink
            :href="github"
            target="_blank"
            title="Github"
            class="inline-flex items-center justify-center px-4 py-2 mr-2 text-sm font-medium text-white transition-colors rounded-md whitespace-nowrap bg-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90"
          >
            <GitHubIcon
              class="w-5 h-5 mr-1"
            />
            GitHub
          </NuxtLink>
          <div class="flex items-center">
            <SwitchLanguage />
            <SwitchTheme />
          </div>
        </div>

        <!-- Mobile menu toggle -->
        <div
          class="absolute right-0 flex flex-col items-center justify-center w-10 h-10 rounded-full cursor-pointer md:hidden hover:bg-muted"
          @click="showMenu = !showMenu"
        >
          <AlignJustify class="w-6 h-6" />
        </div>
      </div>
    </nav>
  </section>
</template>
