<script setup>
import { Ellipsis, X } from 'lucide-vue-next'
import { GitHubIcon } from 'vue3-simple-icons'

const showMenu = ref(false)
const { title, github } = useAppConfig()
</script>

<template>
  <section class="pb-6">
    <nav class="container relative z-50 h-24 select-none">
      <div
        class="container relative flex flex-wrap items-center justify-between h-24 px-0 mx-auto overflow-hidden font-medium border-b border-gray-200 md:overflow-visible lg:justify-center"
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
              <img
                src="/sink.png"
                :alt="title"
                class="w-full h-full rounded-full"
              >
            </span>
            <span class="mx-2">{{ title }}</span>
          </a>
        </div>

        <div
          class="top-0 left-0 items-start w-full h-full p-4 text-sm bg-gray-900 bg-opacity-50 md:items-center md:w-3/4 md:absolute lg:text-base md:bg-transparent md:p-0 md:relative md:flex"
          :class="{ 'flex fixed': showMenu, 'hidden': !showMenu }"
          @touchmove.prevent
        >
          <div
            class="flex-col w-full h-auto overflow-hidden rounded-lg bg-background md:overflow-visible md:rounded-none md:relative md:flex md:flex-row"
          >
            <a
              href="/"
              :title="title"
              class="inline-flex items-center w-auto h-16 px-4 text-xl font-black leading-none text-gray-900 dark:text-gray-100 md:hidden"
            >
              <span
                class="flex items-center justify-center w-8 h-8 text-white bg-gray-900 rounded-full"
              >
                <img
                  src="/sink.png"
                  :alt="title"
                  class="w-full h-full rounded-full"
                >
              </span>
              <span class="mx-2">{{ title }}</span>
            </a>
            <div class="w-auto mx-4" />
            <div
              class="flex flex-col items-start justify-end w-full pt-4 md:items-center md:flex-row md:py-0"
            >
              <a
                class="w-full px-6 py-2 mr-0 text-gray-700 cursor-pointer dark:text-gray-300 md:px-3 md:mr-2 lg:mr-3 md:w-auto"
                href="/dashboard"
                :title="`${title} Dashboard`"
              >{{ $t('dashboard.title') }}</a>
              <a
                :href="github"
                target="_blank"
                title="Github"
                class="inline-flex items-center w-full px-6 py-3 text-sm font-medium leading-4 text-white bg-gray-900 md:px-3 md:w-auto md:rounded-full hover:bg-gray-800 focus:outline-none md:focus:ring-2 focus:ring-0 focus:ring-offset-2 focus:ring-gray-800 mr-2"
              >
                <GitHubIcon
                  class="w-5 h-5 mr-1"
                />
                GitHub</a>

              <SwitchLanguage />

              <SwitchTheme />
            </div>
          </div>
        </div>

        <div
          class="absolute right-0 flex flex-col items-center justify-center w-10 h-10 rounded-full cursor-pointer md:hidden hover:bg-muted"
          :class="{ 'right-2': showMenu }"
          @click="showMenu = !showMenu"
        >
          <Ellipsis
            v-show="!showMenu"
            class="w-6 h-6"
          />
          <X
            v-show="showMenu"
            class="w-6 h-6"
          />
        </div>
      </div>
    </nav>
  </section>
</template>
