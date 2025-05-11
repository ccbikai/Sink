<script setup>
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'

// const time = inject('time')
// const filters = inject('filters')
const logs = ref([])

async function getEvents() {
  const data = await useAPI('/api/logs/events', {
    query: {
      startAt: 1746945961,
    },
  })
  console.log(data)
  logs.value = data
}

// const stopWatchQueryChange = watch([time, filters], getLinkViews, {
//   deep: true,
// })

onMounted(async () => {
  getEvents()
})

// onBeforeUnmount(() => {
//   stopWatchQueryChange()
// })

const columns = [
  {
    accessorKey: 'slug',
    header: () => h('div', { class: 'text-left' }, 'Slug'),
    cell: ({ row }) => {
      return h('div', { class: 'text-left font-medium' }, row.original.slug)
    },
  },
  {
    accessorKey: 'url',
    header: () => h('div', { class: 'text-left' }, 'URL'),
    cell: ({ row }) => {
      return h('div', { class: 'text-left' }, row.original.url)
    },
  },
  {
    accessorKey: 'ip',
    header: () => h('div', { class: 'text-left' }, 'IP'),
    cell: ({ row }) => {
      return h('div', { class: 'text-left' }, row.original.ip)
    },
  },
  {
    accessorKey: 'referer',
    header: () => h('div', { class: 'text-left' }, 'Referer'),
    cell: ({ row }) => {
      return h('div', { class: 'text-left' }, row.original.referer)
    },
  },
  {
    accessorKey: 'country',
    header: () => h('div', { class: 'text-left' }, 'Country'),
    cell: ({ row }) => {
      return h('div', { class: 'text-left' }, row.original.country)
    },
  },
]

const table = useVueTable({
  get data() { return logs.value },
  get columns() { return columns },
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <TableHead v-for="header in headerGroup.headers" :key="header.id">
          <FlexRender
            v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
            :props="header.getContext()"
          />
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <template v-if="table.getRowModel().rows?.length">
        <TableRow
          v-for="row in table.getRowModel().rows" :key="row.id"
          :data-state="row.getIsSelected() ? 'selected' : undefined"
        >
          <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </TableCell>
        </TableRow>
      </template>
      <template v-else>
        <TableRow>
          <TableCell :colspan="columns.length" class="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>
</template>
