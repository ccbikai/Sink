<script setup>
provide('id', ref())
</script>

<template>
  <main class="space-y-6">
    <DashboardBreadcrumb title="Analysis" />
    <LazyDashboard />
  </main>
</template>
