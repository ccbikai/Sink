import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { config } from './config'

describe('sink test', async () => {
  await setup(config)

  it('home page should return 200', async () => {
    const response = await fetch('/')
    expect(response.status).toBe(200)
  })
})
