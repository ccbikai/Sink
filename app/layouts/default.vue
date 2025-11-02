<template>
  <main class="flex min-h-screen flex-col">
    <LayoutsHeader />
    <section class="flex flex-1">
      <div class="container">
        <slot />
      </div>
    </section>
    <LayoutsFooter />
  </main>
</template>
