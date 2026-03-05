import { FastifyPluginAsync } from 'fastify'

const healthRoutes: FastifyPluginAsync = async (server) => {
  server.get('/health', {
    schema: {
      tags: ['health'],
      summary: 'Health check',
      operationId: 'healthCheck',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            uptime: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (_request, reply) => {
    return reply.send({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  })
}

export default healthRoutes
