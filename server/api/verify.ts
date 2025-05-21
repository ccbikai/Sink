defineRouteMeta({
  openAPI: {
    description: 'Verify the site token',
    security: openAPISecurity,
    responses: {
      200: {
        description: 'The site token is valid',
      },
      default: {
        description: 'The site token is invalid',
      },
    },
  },
})

export default eventHandler(() => {
  return {
    name: 'Sink',
    url: 'https://sink.cool',
  }
})
