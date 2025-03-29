<script setup>
import { Laptop, Moon, Settings as SettingsIcon, Sun } from 'lucide-vue-next'

const colorMode = useColorMode()
const nuxtApp = useNuxtApp()
const i18n = nuxtApp.$i18n
const { setLocale, locales } = useI18n()
const currentLocale = ref(i18n.locale.value)
const dialogOpen = ref(false)

watch(currentLocale, (newLocale) => {
  setLocale(newLocale)
})
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogTrigger as-child>
      <Button variant="ghost">
        <SettingsIcon class="w-5 h-5" />
        <span class="sr-only">{{ $t('settings') }}</span>
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ $t('settings') }}</DialogTitle>
      </DialogHeader>
      <div class="py-4 space-y-4">
        <div class="space-y-4">
          <h4 class="text-sm font-medium leading-none">
            {{ $t('theme.title') }}
          </h4>
          <div class="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              :class="{ 'border-primary': colorMode.preference === 'light' }"
              @click="colorMode.preference = 'light'"
            >
              <Sun class="w-4 h-4 mr-2" />
              {{ $t('theme.light') }}
            </Button>
            <Button
              variant="outline"
              :class="{ 'border-primary': colorMode.preference === 'dark' }"
              @click="colorMode.preference = 'dark'"
            >
              <Moon class="w-4 h-4 mr-2" />
              {{ $t('theme.dark') }}
            </Button>
            <Button
              variant="outline"
              :class="{ 'border-primary': colorMode.preference === 'system' }"
              @click="colorMode.preference = 'system'"
            >
              <Laptop class="w-4 h-4 mr-2" />
              {{ $t('theme.system') }}
            </Button>
          </div>
        </div>
        <Separator />
        <div class="space-y-4">
          <h4 class="text-sm font-medium leading-none">
            {{ $t('language.title') }}
          </h4>
          <div class="flex items-center space-x-4">
            <Select v-model="currentLocale">
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="$t('layouts.header.select_language')" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="locale in locales"
                    :key="locale.code"
                    :value="locale.code"
                  >
                    <div class="flex items-center">
                      <span class="mr-2">{{ locale.emoji }}</span>
                      {{ locale.name }}
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button>{{ $t('common.close') }}</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
