import 'reflect-metadata'
import 'dotenv/config'
import Fastify, { FastifyRequest } from 'fastify'
import sensible from '@fastify/sensible'
import ormPlugin from './src/plugins/orm.js'
import correlationPlugin from './src/plugins/correlation.js'
import healthRoutes from './src/routes/health.js'
import weatherRoutes from './src/routes/weather.js'

const fastify = Fastify({
  logger: {
    level: 'info',
    serializers: {
      req (req) {
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

const shutdown = async (signal: string) => {
  fastify.log.info({ signal }, 'Shutting down gracefully')
  await fastify.close()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

try {
  await fastify.listen({ port: 3000, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}