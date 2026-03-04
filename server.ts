import 'reflect-metadata'
import { buildApp } from './src/app.js'

const fastify = await buildApp()

const shutdown = async (signal: string) => {
  fastify.log.info({ signal }, 'Shutting down gracefully')
  await fastify.close()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

try {
  await fastify.listen({ port: fastify.config.PORT, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}