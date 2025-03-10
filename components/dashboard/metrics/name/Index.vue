<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
})

function formatName(name, type) {
  if (!name || typeof Intl === 'undefined')
    return name

  try {
    if (type === 'country') {
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
      return `${getFlag(name)} ${regionNames.of(name)}`
    }
    if (type === 'language') {
      const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })
      return languageNames.of(name)
    }
    return name
  }
  catch (e) {
    console.error(e)
    return name
  }
}
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger class="w-full text-left">
        <DashboardMetricsNameReferer
          v-if="name && type === 'referer'"
          :name="name"
        />
        <DashboardMetricsNameSlug
          v-else-if="name && type === 'slug'"
          :name="name"
        />
        <DashboardMetricsNameIcon
          v-else-if="name && ['os', 'browser', 'browserType', 'device', 'deviceType'].includes(type)"
          :name="name"
          :type="type"
        />
        <div
          v-else
          class="w-full truncate"
        >
          {{ formatName(name, type) || $t('dashboard.none') }}
        </div>
      </TooltipTrigger>
      <TooltipContent v-if="name">
        <p>
          {{ formatName(name, type) }}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
