<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Link as LinkIcon, Trash2, Eye, Filter } from 'lucide-vue-next'

const { t } = useI18n()
const links = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filters = ref({
  user: '',
  status: 'all',
})

async function fetchLinks() {
  loading.value = true
  try {
    const response = await useAPI('/api/admin/links')
    links.value = response.data || []
  } catch (e) {
    console.error(e)
    toast.error(t('admin.links.fetch_failed'), {
      description: e.message,
    })
  } finally {
    loading.value = false
  }
}

async function deleteLink(linkId) {
  if (confirm(t('admin.links.delete_confirm'))) {
    try {
      // 注意：实际删除链接的API需要单独实现
      // 这里仅作示例
      links.value = links.value.filter(link => link.id !== linkId)
      toast.success(t('admin.links.delete_success'))
    } catch (e) {
      console.error(e)
      toast.error(t('admin.links.delete_failed'), {
        description: e.message,
      })
    }
  }
}

async function applyFilters() {
  // 实现筛选逻辑
  fetchLinks() // 实际应用中应该传递筛选参数
}

onMounted(() => {
  fetchLinks()
})
</script>

<template>
  <main class="space-y-6">
    <DashboardBreadcrumb title="Links Management" />
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 class="text-2xl font-bold">
        {{ $t('admin.links.title') }}
      </h1>
      
      <div class="flex w-full sm:w-auto gap-2">
        <div class="relative w-full sm:w-64">
          <Filter class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="{{ $t('admin.links.filter_placeholder') }}"
            class="w-full sm:w-64 pl-8"
            v-model="searchQuery"
            @keyup.enter="applyFilters"
          />
        </div>
        
        <Dropdown>
          <DropdownTrigger as-child>
            <Button variant="secondary" class="gap-2">
              {{ t('admin.links.filter_status') }}
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownMenuItem @click="() => { filters.status = 'all'; applyFilters() }">{{ t('admin.links.all') }}</DropdownMenuItem>
            <DropdownMenuItem @click="() => { filters.status = 'active'; applyFilters() }">{{ t('admin.links.active') }}</DropdownMenuItem>
            <DropdownMenuItem @click="() => { filters.status = 'expired'; applyFilters() }">{{ t('admin.links.expired') }}</DropdownMenuItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
    
    <div class="rounded-lg border">
      <div class="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ $t('common.id') }}</TableHead>
              <TableHead>{{ $t('common.slug') }}</TableHead>
              <TableHead>{{ $t('common.url') }}</TableHead>
              <TableHead>{{ $t('common.user') }}</TableHead>
              <TableHead>{{ $t('common.created_at') }}</TableHead>
              <TableHead>{{ $t('common.expiration') }}</TableHead>
              <TableHead class="text-right">{{ $t('common.actions') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="link in links" :key="link.id">
              <TableCell>{{ link.id }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <LinkIcon class="h-6 w-6 rounded-full bg-primary/10 text-primary" />
                  <span>{{ link.slug }}</span>
                </div>
              </TableCell>
              <TableCell class="max-w-xs truncate">
                <a href="{{ link.url }}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                  {{ link.url }}
                </a>
              </TableCell>
              <TableCell>
                {{ link.username || link.userId }}
              </TableCell>
              <TableCell>{{ new Date(link.createdAt * 1000).toLocaleDateString() }}</TableCell>
              <TableCell>
                <Badge variant="secondary" :class="link.expiration && link.expiration < Date.now() / 1000 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">{{ 
                  link.expiration ? new Date(link.expiration * 1000).toLocaleDateString() : t('common.never') 
                }}</Badge>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="deleteLink(link.id)">
                    <Trash2 class="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div class="flex items-center justify-between px-4 py-3 border-t">
        <div class="text-sm text-muted-foreground">
          {{ $t('common.total_count', { count: links.length }) }}
        </div>
      </div>
    </div>
  </main>
</template>