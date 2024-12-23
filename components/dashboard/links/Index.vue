<script setup>
import { Loader } from 'lucide-vue-next'
import { useInfiniteScroll } from '@vueuse/core'

const links = ref([])
const limit = 24
let cursor = ''
let listComplete = false

async function getLinks() {
  const data = await useAPI('/api/link/list', {
    query: {
      limit,
      cursor,
    },
  })
  links.value = links.value.concat(data.links).filter(Boolean) // Sometimes cloudflare will return null, filter out
  cursor = data.cursor
  listComplete = data.list_complete
}

const { isLoading } = useInfiniteScroll(
  document,
  getLinks,
  { distance: 150, interval: 1000, canLoadMore: () => !listComplete },
)

function updateLinkList(link, type) {
  if (type === 'edit') {
    const index = links.value.findIndex(l => l.id === link.id)
    links.value[index] = link
  }
  else if (type === 'delete') {
    const index = links.value.findIndex(l => l.id === link.id)
    links.value.splice(index, 1)
  }
  else {
    links.value.unshift(link)
  }
}
</script>

<template>
  <main class="space-y-6">
    <div class="flex flex-col gap-6 sm:gap-2 sm:flex-row sm:justify-between">
      <DashboardNav class="flex-1">
        <DashboardLinksEditor @update:link="updateLinkList" />
      </DashboardNav>
      <LazyDashboardLinksSearch />
    </div>
    <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DashboardLinksLink
        v-for="link in links"
        :key="link.id"
        :link="link"
        @update:link="updateLinkList"
      />
    </section>
    <div
      v-if="isLoading"
      class="flex items-center justify-center"
    >
      <Loader class="animate-spin" />
    </div>
    <div
      v-if="!isLoading && listComplete"
      class="flex items-center justify-center text-sm"
    >
      No more
    </div>
  </main>
</template>
