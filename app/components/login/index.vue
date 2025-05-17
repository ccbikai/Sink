<script setup>
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useAuth } from '@vueuse/firebase'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const { $auth } = useNuxtApp()
const { isAuthenticated, user } = useAuth($auth)
const isLoading = ref(false)

const { previewMode } = useRuntimeConfig().public

async function signInWithGoogle() {
  if (!$auth) {
    toast.error(t('login.error'), {
      description: 'Firebase is not initialized',
    })
    return
  }

  try {
    isLoading.value = true
    const provider = new GoogleAuthProvider()
    await signInWithPopup($auth, provider)
    navigateTo('/dashboard')
  }
  catch (e) {
    console.error(e)
    toast.error(t('login.failed'), {
      description: e.message,
    })
  }
  finally {
    isLoading.value = false
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
      <Button
        class="w-full"
        :disabled="isLoading"
        @click="signInWithGoogle"
      >
        <img
          src="/google.svg"
          alt="Google"
          class="w-5 h-5 mr-2"
        >
        {{ isLoading ? $t('login.loading') : $t('login.google') }}
      </Button>
    </CardContent>
  </Card>
</template>
