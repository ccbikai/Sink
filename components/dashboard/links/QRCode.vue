<script setup>
import { Button } from '#components'
import { Download } from 'lucide-vue-next'
import QRCodeStyling from 'qr-code-styling'
import { ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
})
const color = ref('#000000')
const options = {
  width: 256,
  height: 256,
  data: props.data,
  margin: 10,
  qrOptions: { typeNumber: '0', mode: 'Byte', errorCorrectionLevel: 'Q' },
  imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 2 },
  dotsOptions: { type: 'dots', color: '#000000', gradient: null },
  backgroundOptions: { color: '#ffffff', gradient: null },
  image: props.image,
  dotsOptionsHelper: {
    colorType: { single: true, gradient: false },
    gradient: {
      linear: true,
      radial: false,
      color1: '#6a1a4c',
      color2: '#6a1a4c',
      rotation: '0',
    },
  },
  cornersSquareOptions: { type: 'extra-rounded', color: '#000000' },
  cornersSquareOptionsHelper: {
    colorType: { single: true, gradient: false },
    gradient: {
      linear: true,
      radial: false,
      color1: '#000000',
      color2: '#000000',
      rotation: '0',
    },
  },
  cornersDotOptions: { type: 'dot', color: '#000000' },
  cornersDotOptionsHelper: {
    colorType: { single: true, gradient: false },
    gradient: {
      linear: true,
      radial: false,
      color1: '#000000',
      color2: '#000000',
      rotation: '0',
    },
  },
  backgroundOptionsHelper: {
    colorType: { single: true, gradient: false },
    gradient: {
      linear: true,
      radial: false,
      color1: '#ffffff',
      color2: '#ffffff',
      rotation: '0',
    },
  },
}

const qrCode = new QRCodeStyling(options)
const qrCodeEl = ref(null)

function updateColor(newColor) {
  qrCode.update({
    dotsOptions: { type: 'dots', color: newColor, gradient: null },
    cornersSquareOptions: { type: 'extra-rounded', color: newColor },
    cornersDotOptions: { type: 'dot', color: newColor },
  })
}

watch(color, (newColor) => {
  updateColor(newColor)
})

function downloadQRCode() {
  const slug = props.data.split('/').pop()
  qrCode.download({
    extension: 'png',
    name: `qr_${slug}`,
  })
}

onMounted(() => {
  qrCode.append(qrCodeEl.value)
})
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      ref="qrCodeEl"
      :data-text="data"
    />
    <div class="flex items-center gap-2">
      <div class="relative flex items-center">
        <div
          class="w-8 h-8 rounded-full border cursor-pointer overflow-hidden"
          :style="{ backgroundColor: color }"
        >
          <input
            v-model="color"
            type="color"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Change QR code color"
          >
        </div>
      </div>
      <Button variant="outline" @click="downloadQRCode">
        <Download class="w-4 h-4 mr-2" />
        Download QR Code
      </Button>
    </div>
  </div>
</template>
