<script setup>
import { useUrlSearchParams, watchDebounced } from '@vueuse/core'
import { safeDestr } from 'destr'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { VList } from 'virtua/vue'

const emit = defineEmits(['change'])

const links = ref([])
const isOpen = ref(false)
const selectedLinks = ref([])

async function getLinks() {
  links.value = await useAPI('/api/link/search')
}

onMounted(() => {
  getLinks()
})

watchDebounced(selectedLinks, (value) => {
  emit('change', 'slug', value.join(','))
}, { debounce: 500, maxWait: 1000 })

function restoreFilters() {
  const searchParams = useUrlSearchParams('history')
  if (searchParams.filters) {
    const filters = safeDestr(searchParams.filters)
    if (filters.slug) {
      selectedLinks.value = filters.slug.split(',')
    }
  }
}

onBeforeMount(() => {
  restoreFilters()
})
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="isOpen"
        class="flex justify-between w-full sm:w-48"
      >
        <div class="flex-1 font-normal text-left truncate" :class="selectedLinks.length ? 'text-foreground' : 'text-muted-foreground'">
          {{ selectedLinks.length ? selectedLinks.join(', ') : 'Filter Links...' }}
        </div>
        <ChevronsUpDown class="ml-2 w-4 h-4 opacity-50 shrink-0" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="p-0 w-full sm:w-48">
      <Command v-model="selectedLinks" multiple>
        <CommandInput placeholder="Filter Links..." />
        <CommandEmpty>No link found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <VList
              v-slot="{ item: link }"
              :data="links"
              :style="{ height: '292px' }"
            >
              <CommandItem
                :value="link.slug"
              >
                <Check
                  :class="cn(
                    'mr-2 h-4 w-4',
                    selectedLinks.includes(link.slug) ? 'opacity-100' : 'opacity-0',
                  )"
                />
                {{ link.slug }}
              </CommandItem>
            </VList>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
