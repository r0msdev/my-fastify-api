import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'crypto'

declare module 'fastify' {
  interface FastifyRequest {
    correlationId: string
  }
}

const correlationPlugin: FastifyPluginAsync = fp(async (server) => {
  server.decorateRequest('correlationId', '')

  server.addHook('onRequest', async (request, reply) => {
    const id =
      (request.headers['x-correlation-id'] as string | undefined) ??
      (request.headers['x-request-id'] as string | undefined) ??
      randomUUID()

    request.correlationId = id
    void reply.header('x-correlation-id', id)
  })
})

export default correlationPlugin
