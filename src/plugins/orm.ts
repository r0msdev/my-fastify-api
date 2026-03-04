import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { MikroORM, EntityManager } from '@mikro-orm/postgresql'
import config from '../../mikro-orm.config.js'

declare module 'fastify' {
  interface FastifyInstance {
    orm: MikroORM
  }
  interface FastifyRequest {
    em: EntityManager
  }
}

const ormPlugin: FastifyPluginAsync = fp(async (server) => {
  const orm = await MikroORM.init(config)

  server.decorate('orm', orm)

  // Fork a request-scoped EntityManager for each request (required by MikroORM identity map)
  server.addHook('onRequest', async (request) => {
    request.em = orm.em.fork()
  })

  server.addHook('onClose', async () => {
    await orm.close()
  })
})

export default ormPlugin
