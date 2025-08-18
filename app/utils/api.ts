import { defu } from 'defu'
import { toast } from 'vue-sonner'

export function useAPI(api: string, options?: object): Promise<unknown> {
  const token = localStorage.getItem('SinkSiteToken') || ''
  console.log(`API调用: ${api}, Token存在: ${!!token}, Token长度: ${token.length}`)
  
  return $fetch(api, defu(options || {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })).catch((error) => {
    console.error(`API错误: ${api}`, error)
    if (error?.status === 401) {
      console.log('未授权，清除token并跳转登录')
      localStorage.removeItem('SinkSiteToken')
      navigateTo('/dashboard/login')
    }
    if (error?.data?.statusMessage) {
      toast(error?.data?.statusMessage)
    }
    return Promise.reject(error)
  })
}
