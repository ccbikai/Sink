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

const locale = useI18n().locale

function formatName(name, type) {
  if (!name || typeof Intl === 'undefined')
    return name

  try {
    if (type === 'country') {
      const regionNames = new Intl.DisplayNames([locale.value], { type: 'region' })
      return `${getFlag(name)} ${regionNames.of(name)}`
    }
    if (type === 'language') {
      const languageNames = new Intl.DisplayNames([locale.value], { type: 'language' })
      return languageNames.of(name)
    }

    // TODO: Add support for timezone
    // if (type === 'timezone' && typeof Intl.TimeZone === 'function') {
    //   const tz = new Intl.TimeZone(name)
    //   return tz.getDisplayName(locale.value, { type: 'long' })
    // }

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
        <DashboardAnalysisMetricsNameReferer
          v-if="name && type === 'referer'"
          :name="name"
        />
        <DashboardAnalysisMetricsNameSlug
          v-else-if="name && type === 'slug'"
          :name="name"
        />
        <DashboardAnalysisMetricsNameIcon
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
