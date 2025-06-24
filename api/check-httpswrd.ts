export default defineEventHandler(async (event: Parameters<typeof defineEventHandler>[0]) => {
  const body = await readBody<{ username: string, password: string }>(event)

  const correctUsername = process.env.HTTPSWRD_USERNAME
  const correctPassword = process.env.HTTPSWRD_PASSWORD

  if (!correctUsername || !correctPassword) {
    return { success: false, error: 'Server misconfigured' }
  }

  if (body.username === correctUsername && body.password === correctPassword) {
    return { success: true }
  }

  return { success: false }
})
