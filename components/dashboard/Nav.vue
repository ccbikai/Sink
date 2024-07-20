<script setup>
const route = useRoute()
</script>

<template>
  <nav class="flex justify-between">
    <Tabs
      v-if="route.path !== '/dashboard/link'"
      :default-value="route.path"
      @update:model-value="navigateTo"
    >
      <TabsList>
        <TabsTrigger
          value="/dashboard/links"
        >
          Links
        </TabsTrigger>
        <TabsTrigger value="/dashboard/analysis">
          Analysis
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <slot name="left" />
    <div>
      <slot />
    </div>
  </nav>
</template>
