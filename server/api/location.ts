defineRouteMeta({
  openAPI: {
    description: 'Get the location of the user',
    security: securitySchemes,
  },
})

export default eventHandler((event) => {
  const { request: { cf } } = event.context.cloudflare
  return {
    latitude: cf.latitude,
    longitude: cf.longitude,
  }
})
