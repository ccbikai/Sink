<script setup>
const slug = useRoute().query.slug

const link = ref({})
const id = computed(() => link.value.id)

provide('id', id)

async function getLink() {
  const data = await useAPI('/api/link/query', {
    query: {
      slug,
    },
  })
  // data.id = 'y1c4fhirl5'
  link.value = data
}

function updateLink(link, type) {
  if (type === 'delete') {
    navigateTo('/dashboard/links', {
      replace: true,
    })
  }
}

onMounted(() => {
  getLink()
})
</script>

<template>
  <main class="space-y-6">
    <DashboardBreadcrumb title="Link" />
    <DashboardLinksLink
      v-if="link.id"
      :link="link"
      @update:link="updateLink"
    />
    <DashboardAnalysis
      v-if="link.id"
      :link="link"
    />
  </main>
</template>
