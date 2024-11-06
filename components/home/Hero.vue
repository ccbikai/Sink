<script setup>
import { onMounted } from 'vue'

// Redirect function
function handleRedirect() {
  window.location.href = 'https://kugie.app'
}

onMounted(() => {
  setTimeout(handleRedirect, 10000)
})
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center relative">
    <div class="flex flex-col items-center space-y-6">
      <img
        src="@/assets/images/kugie_gspace.png"
        alt="Kugie Logo"
        class="w-48 md:w-64 h-auto"
      >

      <HomeLink
        href="https://kugie.app"
        class="px-6 py-3 bg-white rounded-lg text-lg font-medium transition-all hover:bg-gray-100"
        :style="{ color: '#FEAA5C' }"
      >
        kugie.app
      </HomeLink>
    </div>

    <footer class="absolute bottom-4 text-white text-sm">
      2024. Copyright by Kugie.app.
    </footer>
  </main>
</template>

<style scoped>
main {
  background-color: #FEAA5C;
}
</style>
