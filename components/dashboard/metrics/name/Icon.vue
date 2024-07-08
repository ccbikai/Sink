<script setup>
// https://vue3-simple-icons.wyatt-herkamp.dev/
import {
  AndroidIcon,
  AppleIcon,
  DebianIcon,
  FacebookIcon,
  FirefoxBrowserIcon,
  GoogleChromeIcon,
  GoogleIcon,
  HuaweiIcon,
  IOsIcon,
  InternetExplorerIcon,
  LinuxIcon,
  MacOsIcon,
  MicrosoftEdgeIcon,
  OperaIcon,
  SafariIcon,
  SamsungIcon,
  UbuntuIcon,
  VivoIcon,
  WeChatIcon,
  WindowsIcon,
  XiaomiIcon,
  YandexCloudIcon,
} from 'vue3-simple-icons'

import {
  Globe,
  Laptop,
  MonitorCheck,
  Smartphone,
  Tablet,
  Terminal,
} from 'lucide-vue-next'

defineProps({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'browser',
  },
})

const iconMaps = {
  'android': AndroidIcon,
  'browser': Globe,
  'chrome': GoogleChromeIcon,
  'chrome headless': GoogleChromeIcon,
  'chrome webview': GoogleChromeIcon,
  'chromium': GoogleChromeIcon,
  'curl': Terminal,
  'debian': DebianIcon,
  'desktop': MonitorCheck,
  'edge': MicrosoftEdgeIcon,
  'facebook': FacebookIcon,
  'facebookexternalhit': FacebookIcon,
  'firefox': FirefoxBrowserIcon,
  'googlebot': GoogleIcon,
  'googlebot-image': GoogleIcon,
  'harmonyos': HuaweiIcon,
  'huawei browser': HuaweiIcon,
  'ie': InternetExplorerIcon,
  'ios': IOsIcon,
  'ipad': AppleIcon,
  'iphone': AppleIcon,
  'ipod': AppleIcon,
  'laptop': Laptop,
  'linux': LinuxIcon,
  'macintosh': AppleIcon,
  'macos': MacOsIcon,
  'miui browser': XiaomiIcon,
  'mobile': Smartphone,
  'mobile chrome': GoogleChromeIcon,
  'mobile firefox': FirefoxBrowserIcon,
  'mobile safari': SafariIcon,
  'opera': OperaIcon,
  'os': MonitorCheck,
  'safari': SafariIcon,
  'samsung internet': SamsungIcon,
  'tablet': Tablet,
  'ubuntu': UbuntuIcon,
  'vivo browser': VivoIcon,
  'wechat': WeChatIcon,
  'windows': WindowsIcon,
  'yandex': YandexCloudIcon,
}
</script>

<template>
  <div class="w-full truncate">
    <component
      :is="iconMaps[name.toLowerCase()] || iconMaps[type]"
      class="w-5 h-5 py-0.5 float-left"
    />
    <span>{{ name }}</span>
  </div>
</template>
