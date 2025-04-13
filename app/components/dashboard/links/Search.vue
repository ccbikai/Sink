<script setup>
import { createReusableTemplate, useMagicKeys, useMediaQuery } from '@vueuse/core'
import { useFuse } from '@vueuse/integrations/useFuse'

const [TriggerTemplate, TriggerComponent] = createReusableTemplate()
const [SearchTemplate, SearchComponent] = createReusableTemplate()

const isDesktop = useMediaQuery('(min-width: 640px)')

const router = useRouter()

const isOpen = ref(false)
const searchTerm = ref('')
const selectedLink = ref(null)

const links = ref([])

const { results: filteredLinks } = useFuse(searchTerm, links, {
  fuseOptions: {
    keys: ['slug', 'url', 'comment'],
  },
  resultLimit: 20,
})

const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey))
      e.preventDefault()
  },
})

watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1])
    isOpen.value = true
})

function selectLink(link) {
  isOpen.value = false
  router.push({
    path: '/dashboard/link',
    query: { slug: link.slug },
  })
}

async function getLinks() {
  links.value = await useAPI('/api/link/search')
}

onMounted(() => {
  getLinks()
})
</script>

<template>
  <TriggerTemplate>
    <Button
      variant="outline"
      size="sm"
      class="relative justify-start w-full h-10 bg-background text-muted-foreground sm:w-32 md:w-48"
    >
      <span class="hidden md:inline-flex">{{ $t('links.search_placeholder') }}</span>
      <span class="inline-flex md:hidden">{{ $t('common.search') }}</span>
      <kbd class="pointer-events-none absolute right-[0.3rem] top-[0.6rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span class="text-xs">⌘</span>K
      </kbd>
    </Button>
  </TriggerTemplate>
  <SearchTemplate>
    <Command v-model:search-term="searchTerm" v-model="selectedLink" class="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
      <CommandInput :placeholder="$t('links.search_placeholder')" />
      <CommandList>
        <CommandEmpty v-if="searchTerm">
          {{ $t('links.no_results') }}
        </CommandEmpty>
        <CommandGroup :heading="$t('links.group_title')">
          <CommandItem v-for="link in filteredLinks" :key="link.item?.id" class="cursor-pointer" :value="link.item" @select="selectLink(link.item)">
            <div class="flex gap-1 w-full">
              <div class="inline-flex overflow-hidden flex-1 gap-1 items-center">
                <div class="text-sm font-medium">
                  {{ link.item?.slug }}
                </div>
                <div class="flex-1 text-xs truncate text-muted-foreground">
                  ({{ link.item?.url }})
                </div>
              </div>
              <Badge v-if="link.item?.comment" variant="secondary">
                <div class="truncate max-w-24">
                  {{ link.item?.comment }}
                </div>
              </Badge>
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </SearchTemplate>
  <Dialog v-if="isDesktop" v-model:open="isOpen">
    <DialogTrigger as-child>
      <TriggerComponent />
    </DialogTrigger>
    <DialogContent class="overflow-hidden p-0 shadow-lg">
      <SearchComponent />
    </DialogContent>
  </Dialog>
  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <TriggerComponent />
    </DrawerTrigger>
    <DrawerContent class="h-[500px]">
      <SearchComponent />
    </DrawerContent>
  </Drawer>
</template>
