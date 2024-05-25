<template>
  <main class="grid gap-8 lg:grid-cols-12">
    <DashboardMetricsLocations class="col-span-1 lg:col-span-8" />
    <DashboardMetricsGroup
      class="lg:col-span-4"
      :tabs="['country', 'region', 'city']"
    />
    <DashboardMetricsGroup
      class="lg:col-span-6"
      :tabs="['referer', 'slug']"
    />
    <DashboardMetricsGroup
      class="lg:col-span-6"
      :tabs="['language', 'timezone']"
    />
    <DashboardMetricsGroup
      class="lg:col-span-6"
      :tabs="['device', 'deviceType']"
    />
    <DashboardMetricsGroup
      class="lg:col-span-6"
      :tabs="['os', 'browser', 'browserType']"
    />
  </main>
</template>
