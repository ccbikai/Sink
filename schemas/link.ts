import { z } from 'zod'
import { customAlphabet } from 'nanoid'

const { slugRegex } = useAppConfig()
const { caseSensitive } = useRuntimeConfig()

const slugDefaultLength = +useRuntimeConfig().public.slugDefaultLength

export function nanoid(length: number = slugDefaultLength) {
  return caseSensitive
    ? customAlphabet('23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ', length)
    : customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', length)
}

export const LinkSchema = z.object({
  id: z.string().trim().max(26).default(nanoid(10)),
  url: z.string().trim().url().max(2048),
  slug: z.string().trim().max(2048).regex(new RegExp(slugRegex)).default(nanoid()),
  comment: z.string().trim().max(2048).optional(),
  createdAt: z.number().int().safe().default(() => Math.floor(Date.now() / 1000)),
  updatedAt: z.number().int().safe().default(() => Math.floor(Date.now() / 1000)),
  expiration: z.number().int().safe().refine(expiration => expiration > Math.floor(Date.now() / 1000), {
    message: 'expiration must be greater than current time',
    path: ['expiration'], // 这里指定错误消息关联到哪个字段
  }).optional(),
  title: z.string().trim().max(2048).optional(),
  description: z.string().trim().max(2048).optional(),
  image: z.string().trim().url().max(2048).optional(),
})
