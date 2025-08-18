<script setup>
import { AlertCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { z } from 'zod'
// 导入UI组件
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AutoForm } from '@/components/ui/auto-form'

const { t } = useI18n()

const RegisterSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
})

const registerFieldConfig = {
  username: {
    inputProps: {
      type: 'text',
      placeholder: 'JohnDoe',
    },
  },
  email: {
    inputProps: {
      type: 'email',
      placeholder: 'john@example.com',
    },
  },
  password: {
    inputProps: {
      type: 'password',
      placeholder: '********',
    },
  },
}

const { previewMode } = useRuntimeConfig().public

async function onSubmit(form) {
  try {
    const response = await useAPI('/api/auth/register', {
      method: 'POST',
      body: form,
    })
    
    // 注册成功后，自动登录用户
    try {
      // 调用登录API自动登录
      const loginResponse = await useAPI('/api/auth/login', {
        method: 'POST',
        body: {
          email: form.email,
          password: form.password
        },
      })
      
      // 存储用户信息和token
      localStorage.setItem('SinkUser', JSON.stringify(loginResponse.user))
      localStorage.setItem('SinkSiteToken', loginResponse.token)
      
      toast.success(t('register.success'), {
        description: t('register.success_and_logged_in'),
      })
      
      navigateTo('/dashboard')
    } catch (loginError) {
      // 如果自动登录失败，提示用户手动登录
      toast.success(t('register.success'), {
        description: t('register.success_manual_login'),
      })
      
      navigateTo('/dashboard/login')
    }
  }
  catch (e) {
    console.error(e)
    toast.error(t('register.failed'), {
      description: e.message,
    })
  }
}
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl">
        {{ $t('register.title') }}
      </CardTitle>
      <CardDescription>
        {{ $t('register.description') }}
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <AutoForm
        class="space-y-6"
        :schema="RegisterSchema"
        :field-config="registerFieldConfig"
        @submit="onSubmit"
      >
        <Button class="w-full">
          {{ $t('register.submit') }}
        </Button>
        <div class="text-center text-sm text-muted-foreground">
          {{ $t('register.already_have_account') }} 
          <a href="/dashboard/login" class="text-primary hover:underline">
            {{ $t('register.login_link') }}
          </a>
        </div>
      </AutoForm>
    </CardContent>
  </Card>
</template>