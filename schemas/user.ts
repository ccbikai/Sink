import { z } from 'zod'
import { nanoid } from './link'

export const UserSchema = z.object({
  id: z.string().trim().max(26).default(nanoid(10)),
  username: z.string().trim().min(3).max(50),
  email: z.string().trim().email().max(255),
  password: z.string().trim().min(8),
  role: z.enum(['user', 'admin']).default('user'),
  createdAt: z.number().int().safe().default(() => Math.floor(Date.now() / 1000)),
  updatedAt: z.number().int().safe().default(() => Math.floor(Date.now() / 1000)),
  isActive: z.boolean().default(true),
})

export type User = z.infer<typeof UserSchema>

export const RegisterSchema = UserSchema.omit({ id: true, role: true, createdAt: true, updatedAt: true, isActive: true })

export type RegisterData = z.infer<typeof RegisterSchema>

export const LoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8),
})