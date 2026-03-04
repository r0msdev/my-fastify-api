import 'reflect-metadata'
import Fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import sensible from '@fastify/sensible'
import ormPlugin from './plugins/orm.js'
import correlationPlugin from './plugins/correlation.js'
import healthRoutes from './routes/health.js'
import weatherRoutes from './routes/weather.js'

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: 'info',
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
            correlationId: (req as FastifyRequest).correlationId,
          }
        },
      },
    },
  })

  await fastify.register(sensible)
  await fastify.register(correlationPlugin)
  await fastify.register(ormPlugin)
  await fastify.register(healthRoutes)
  await fastify.register(weatherRoutes)

  return fastify
}
