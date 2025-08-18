<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { User, UserPlus, Search, Trash2, Eye } from 'lucide-vue-next'

const { t } = useI18n()
const users = ref([])
const loading = ref(false)

async function fetchUsers() {
  loading.value = true
  try {
    const response = await useAPI('/api/admin/users')
    users.value = response.data || []
  } catch (e) {
    console.error(e)
    toast.error(t('admin.users.fetch_failed'), {
      description: e.message,
    })
  } finally {
    loading.value = false
  }
}

async function deleteUser(userId) {
  if (confirm(t('admin.users.delete_confirm'))) {
    try {
      // 注意：实际删除用户的API需要单独实现
      // 这里仅作示例
      users.value = users.value.filter(user => user.id !== userId)
      toast.success(t('admin.users.delete_success'))
    } catch (e) {
      console.error(e)
      toast.error(t('admin.users.delete_failed'), {
        description: e.message,
      })
    }
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <main class="space-y-6">
    <DashboardBreadcrumb title="Users Management" />
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 class="text-2xl font-bold">
        {{ $t('admin.users.title') }}
      </h1>
      
      <div class="flex w-full sm:w-auto gap-2">
        <div class="relative w-full sm:w-64">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="{{ $t('common.search') }}"
            class="w-full sm:w-64 pl-8"
            v-model="searchQuery"
          />
        </div>
        
        <Button class="gap-2">
          <UserPlus class="h-4 w-4" />
          {{ $t('admin.users.add_user') }}
        </Button>
      </div>
    </div>
    
    <div class="rounded-lg border">
      <div class="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ $t('common.id') }}</TableHead>
              <TableHead>{{ $t('common.username') }}</TableHead>
              <TableHead>{{ $t('common.email') }}</TableHead>
              <TableHead>{{ $t('common.role') }}</TableHead>
              <TableHead>{{ $t('common.status') }}</TableHead>
              <TableHead>{{ $t('common.created_at') }}</TableHead>
              <TableHead class="text-right">{{ $t('common.actions') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.id">
              <TableCell>{{ user.id }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <User class="h-6 w-6 rounded-full bg-primary/10 text-primary" />
                  <span>{{ user.username }}</span>
                </div>
              </TableCell>
              <TableCell>{{ user.email }}</TableCell>
              <TableCell>
                <Badge variant="secondary">{{ user.role }}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">{{ 
                  user.isActive ? t('common.active') : t('common.inactive') 
                }}</Badge>
              </TableCell>
              <TableCell>{{ new Date(user.createdAt * 1000).toLocaleDateString() }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="deleteUser(user.id)">
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
          {{ $t('common.total_count', { count: users.length }) }}
        </div>
      </div>
    </div>
  </main>
</template>