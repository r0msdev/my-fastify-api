import 'reflect-metadata'
import 'dotenv/config'
import Fastify from 'fastify'
import ormPlugin from './src/plugins/orm.js'
import weatherRoutes from './src/routes/weather.js'

const fastify = Fastify({
  logger: true
})

await fastify.register(ormPlugin)
await fastify.register(weatherRoutes)

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()