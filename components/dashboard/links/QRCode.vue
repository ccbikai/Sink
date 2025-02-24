<script setup>
import { Button } from '#components'
import { Download } from 'lucide-vue-next'
import QRCodeStyling from 'qr-code-styling'

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

function downloadQRCode() {
  qrCode.download({
    extension: 'png',
    name: `qr-${props.data}`,
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
    <Button variant="outline" @click="downloadQRCode">
      <Download class="w-4 h-4 mr-2" />
      Download QR Code
    </Button>
  </div>
</template>
