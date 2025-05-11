<script setup>
import { useClipboard } from '@vueuse/core'
import { CalendarPlus2, Copy, CopyCheck, Eraser, Hourglass, Link as LinkIcon, QrCode, SquareChevronDown, SquarePen } from 'lucide-vue-next'
import { parseURL } from 'ufo'
import { toast } from 'vue-sonner'
import QRCode from './QRCode.vue'

const props = defineProps({
  link: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['update:link'])

const { t } = useI18n()
const editPopoverOpen = ref(false)

const { host, origin } = location

function getLinkHost(url) {
  const { host } = parseURL(url)
  return host
}

const shortLink = computed(() => `${origin}/${props.link.slug}`)
const linkIcon = computed(() => `https://unavatar.io/${getLinkHost(props.link.url)}?fallback=https://sink.cool/icon.png`)

const { copy, copied } = useClipboard({ source: shortLink.value, copiedDuring: 400 })

function updateLink(link, type) {
  emit('update:link', link, type)
  editPopoverOpen.value = false
}

function copyLink() {
  copy(shortLink.value)
  toast(t('links.copy_success'))
}
</script>

<template>
  <Card>
    <NuxtLink
      class="flex flex-col p-4 space-y-3"
      :to="`/dashboard/link?slug=${link.slug}`"
    >
      <div class="flex items-center justify-center space-x-3">
        <Avatar>
          <AvatarImage
            :src="linkIcon"
            alt="@radix-vue"
            loading="lazy"
          />
          <AvatarFallback>
            <img
              src="/icon.png"
              alt="Sink"
              loading="lazy"
            >
          </AvatarFallback>
        </Avatar>

        <div class="flex-1 overflow-hidden">
          <div class="flex items-center">
            <div class="font-bold leading-5 truncate text-md">
              {{ host }}/{{ link.slug }}
            </div>

            <CopyCheck
              v-if="copied"
              class="w-4 h-4 ml-1 shrink-0"
              @click.prevent
            />
            <Copy
              v-else
              class="w-4 h-4 ml-1 shrink-0"
              @click.prevent="copyLink"
            />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <p class="text-sm truncate">
                  {{ link.comment || link.title || link.description }}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-[90svw] break-all">
                  {{ link.comment || link.title || link.description }}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <a
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
        >
          <LinkIcon class="w-5 h-5" />
        </a>

        <Popover>
          <PopoverTrigger>
            <QrCode
              class="w-5 h-5"
              @click.prevent
            />
          </PopoverTrigger>
          <PopoverContent>
            <QRCode
              :data="shortLink"
              :image="linkIcon"
            />
          </PopoverContent>
        </Popover>

        <Popover v-model:open="editPopoverOpen">
          <PopoverTrigger>
            <SquareChevronDown
              class="w-5 h-5"
              @click.prevent
            />
          </PopoverTrigger>
          <PopoverContent
            class="w-auto p-0"
            :hide-when-detached="false"
          >
            <DashboardLinksEditor
              :link="link"
              @update:link="updateLink"
            >
              <div
                class="cursor-pointer flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <SquarePen
                  class="w-5 h-5 mr-2"
                />
                {{ $t('common.edit') }}
              </div>
            </DashboardLinksEditor>

            <Separator />

            <DashboardLinksDelete
              :link="link"
              @update:link="updateLink"
            >
              <div
                class="cursor-pointer flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <Eraser
                  class="w-5 h-5 mr-2"
                /> {{ $t('common.delete') }}
              </div>
            </DashboardLinksDelete>
          </PopoverContent>
        </Popover>
      </div>
      <div class="flex w-full h-5 space-x-2 text-sm">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <span class="inline-flex items-center leading-5 whitespace-nowrap"><CalendarPlus2 class="w-4 h-4 mr-1" /> {{ shortDate(link.createdAt) }}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Created At: {{ longDate(link.createdAt) }}</p>
              <p>Updated At: {{ longDate(link.updatedAt) }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <template v-if="link.expiration">
          <Separator orientation="vertical" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <span class="inline-flex items-center leading-5 whitespace-nowrap"><Hourglass class="w-4 h-4 mr-1" /> {{ shortDate(link.expiration) }}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expires At: {{ longDate(link.expiration) }}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </template>
        <Separator orientation="vertical" />
        <span class="truncate">{{ link.url }}</span>
      </div>
    </NuxtLink>
  </Card>
</template>
