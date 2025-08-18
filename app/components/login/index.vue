<script setup>
import { AlertCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { z } from 'zod'
// 导入UI组件
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/components/ui/auto-form'

const { t } = useI18n()

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
const loginFieldConfig = {
  email: {
    inputProps: {
      type: 'email',
      placeholder: 'your@email.com',
    },
  },
  password: {
    inputProps: {
      type: 'password',
      placeholder: '********',
    },
  },
}

async function onSubmit(form) {
  try {
    const response = await useAPI('/api/auth/login', {
      method: 'POST',
      body: form,
    })
    
    // 存储用户信息和token
    localStorage.setItem('SinkUser', JSON.stringify(response.user))
    localStorage.setItem('SinkSiteToken', response.token)
    
    navigateTo('/dashboard')
  }
  catch (e) {
    console.error(e)
    toast.error(t('login.failed'), {
      description: e.message || t('login.invalid_credentials'),
    })
  }
}
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl">
        {{ $t('login.title') }}
      </CardTitle>
      <CardDescription>
        {{ $t('login.description') }}
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <AutoForm
        class="space-y-6"
        :schema="LoginSchema"
        :field-config="loginFieldConfig"
        @submit="onSubmit"
      >
        <Button class="w-full">
          {{ $t('login.submit') }}
        </Button>
        <div class="text-center text-sm text-muted-foreground">
          {{ $t('login.dont_have_account') }} 
          <a href="/dashboard/register" class="text-primary hover:underline">
            {{ $t('login.register_link') }}
          </a>
        </div>
      </AutoForm>
    </CardContent>
  </Card>
</template>
