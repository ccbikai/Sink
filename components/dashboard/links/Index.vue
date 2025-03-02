<script setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#components'
import { useInfiniteScroll } from '@vueuse/core'
import { ArrowUpDown, Loader } from 'lucide-vue-next'

const links = ref([])
const limit = 24
let cursor = ''
let listComplete = false
let listError = false
const sortBy = ref('newest')

const displayedLinks = computed(() => {
  const sorted = [...links.value]
  switch (sortBy.value) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    case 'az':
      return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    case 'za':
      return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
    default:
      return sorted
  }
})

async function getLinks() {
  try {
    const data = await useAPI('/api/link/list', {
      query: {
        limit,
        cursor,
      },
    })
    links.value = links.value.concat(data.links).filter(Boolean) // Sometimes cloudflare will return null, filter out
    cursor = data.cursor
    listComplete = data.list_complete
    listError = false
  }
  catch (error) {
    console.error(error)
    listError = true
  }
}

const { isLoading } = useInfiniteScroll(
  document,
  getLinks,
  {
    distance: 150,
    interval: 1000,
    canLoadMore: () => {
      return !listError && !listComplete
    },
  },
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
    <div class="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm">
            <ArrowUpDown class="mr-2 h-4 w-4" />
            Sort by: {{
              sortBy === 'newest' ? 'Newest First'
              : sortBy === 'oldest' ? 'Oldest First'
                : sortBy === 'az' ? 'A to Z'
                  : 'Z to A'
            }}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click="sortBy = 'newest'">
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem @click="sortBy = 'oldest'">
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuItem @click="sortBy = 'az'">
            A to Z
          </DropdownMenuItem>
          <DropdownMenuItem @click="sortBy = 'za'">
            Z to A
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DashboardLinksLink
        v-for="link in displayedLinks"
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
      No more links
    </div>
    <div
      v-if="listError"
      class="flex items-center justify-center text-sm"
    >
      Loading links failed,
      <Button variant="link" @click="getLinks">
        Try again
      </Button>
    </div>
  </main>
</template>
