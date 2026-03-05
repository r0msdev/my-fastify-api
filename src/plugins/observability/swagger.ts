import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

const swaggerPlugin: FastifyPluginAsync = fp(async (server) => {
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Fastify API',
        description: 'Fastify REST API template',
        version: '1.0.0',
      },
      tags: [
        { name: 'health', description: 'Health check endpoints' },
        { name: 'weather', description: 'Weather record endpoints' },
      ],
    },
  })

  if (server.config.NODE_ENV !== 'production') {
    await server.register(swaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
    })
  }
})

export default swaggerPlugin
