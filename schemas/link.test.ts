import { describe, it, expect } from 'vitest'
import { LinkSchema } from './link'

describe('LinkSchema - max_views', () => {
  const baseLinkData = {
    url: 'https://example.com',
    // slug is optional and defaults, so not strictly needed for max_views tests
  }

  it('should succeed when max_views is a valid positive integer', () => {
    const result = LinkSchema.safeParse({ ...baseLinkData, max_views: 100 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.max_views).toBe(100)
    }
  })

  it('should fail when max_views is 0', () => {
    const result = LinkSchema.safeParse({ ...baseLinkData, max_views: 0 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(issue => issue.path.includes('max_views'))
      expect(issue).toBeDefined()
      expect(issue?.message).toBe('Number must be greater than 0')
    }
  })

  it('should fail when max_views is a negative integer', () => {
    const result = LinkSchema.safeParse({ ...baseLinkData, max_views: -10 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(issue => issue.path.includes('max_views'))
      expect(issue).toBeDefined()
      expect(issue?.message).toBe('Number must be greater than 0')
    }
  })

  it('should fail when max_views is a non-integer number', () => {
    const result = LinkSchema.safeParse({ ...baseLinkData, max_views: 10.5 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(issue => issue.path.includes('max_views'))
      expect(issue).toBeDefined()
      expect(issue?.message).toBe('Expected integer, received float')
    }
  })

  it('should fail when max_views is a string', () => {
    const result = LinkSchema.safeParse({ ...baseLinkData, max_views: '100' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(issue => issue.path.includes('max_views'))
      expect(issue).toBeDefined()
      expect(issue?.message).toBe('Expected number, received string')
    }
  })

  it('should succeed when max_views is undefined (not provided)', () => {
    const result = LinkSchema.safeParse({ ...baseLinkData })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.max_views).toBeUndefined()
    }
  })

  it('should succeed when max_views is undefined (explicitly)', () => {
    const result = LinkSchema.safeParse({ ...baseLinkData, max_views: undefined })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.max_views).toBeUndefined()
    }
  })

  it('should fail when max_views is null', () => {
    // Zod's .optional() makes a field allow `undefined` but not `null` by default.
    // To allow `null`, `.nullable()` would be needed.
    const result = LinkSchema.safeParse({ ...baseLinkData, max_views: null })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(issue => issue.path.includes('max_views'))
      expect(issue).toBeDefined()
      // Example message, actual message might vary slightly based on Zod version
      expect(issue?.message).toContain('Expected number, received null')
    }
  })
})
