<script setup>
import { LogOut } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { t } = useI18n()

async function logOut() {
  try {
    // 调用登出API
    await useAPI('/api/auth/logout', {
      method: 'POST',
    })
    
    // 清除本地存储的用户信息
    localStorage.removeItem('SinkUser')
    
    toast.success(t('logout.success'), {
      description: t('logout.success_message'),
    })
    
    navigateTo('/dashboard/login')
  } catch (e) {
    console.error(e)
    // 即使API调用失败，也清除本地状态并跳转
    localStorage.removeItem('SinkUser')
    navigateTo('/dashboard/login')
  }
}
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <LogOut
        class="w-4 h-4 cursor-pointer"
      />
    </AlertDialogTrigger>
    <AlertDialogContent class="max-w-[95svw] max-h-[95svh] md:max-w-lg grid-rows-[auto_minmax(0,1fr)_auto]">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ $t('logout.title') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ $t('logout.confirm') }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ $t('common.cancel') }}</AlertDialogCancel>
        <AlertDialogAction @click="logOut">
          {{ $t('logout.action') }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
