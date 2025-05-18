import { useEventBus } from '@vueuse/core'

export const globalTrafficEvent = useEventBus(Symbol('traffic'))
