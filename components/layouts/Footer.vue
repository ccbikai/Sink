<script setup>
import { BloggerIcon, GitHubIcon, GmailIcon, MastodonIcon, TelegramIcon, XIcon } from 'vue3-simple-icons'

const email = ref(null)
onMounted(() => {
  email.value.href = email.value.href.replace('$', '@')
})
</script>

<template>
  <section class="md:pt-6">
    <div class="container flex flex-col items-center py-8 mx-auto sm:flex-row">
      <a
        class="mt-4 text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:mt-0"
        href="https://sink.cool"
        target="_blank"
        title="HTML.ZONE"
      >
        Powered by Sink
      </a>
    </div>
  </section>
</template>
