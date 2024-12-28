<template>
  <main class="grid gap-8 lg:grid-cols-12">
    <LazyDashboardMetricsLocations class="col-span-1 lg:col-span-8" />
    <DashboardMetricsGroup
      class="lg:col-span-4"
      :tabs="['国家', '地区/省份', '城市']"
    />
    <DashboardMetricsGroup
      class="lg:col-span-6"
      :tabs="['引用者', 'slug']"
    />
    <DashboardMetricsGroup
      class="lg:col-span-6"
      :tabs="['语言', '时区']"
    />
    <DashboardMetricsGroup
      class="lg:col-span-6"
      :tabs="['设备', '设备类型']"
    />
    <DashboardMetricsGroup
      class="lg:col-span-6"
      :tabs="['系统', '浏览器', '浏览器类型']"
    />
  </main>
</template>
