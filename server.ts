import 'dotenv/config'
import Fastify from 'fastify'
import prismaPlugin from './src/plugins/prisma.js'
import weatherRoutes from './src/routes/weather.js'

const fastify = Fastify({
  logger: true
})

await fastify.register(prismaPlugin)
await fastify.register(weatherRoutes)

fastify.get('/', async (_request, _reply) => {
  return { hello: 'world' }
})

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()