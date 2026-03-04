import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import envPlugin from '@fastify/env'

export interface AppConfig {
  DATABASE_URL: string
  PORT: number
  NODE_ENV: string
}

const schema = {
  type: 'object',
  required: ['DATABASE_URL'],
  properties: {
    DATABASE_URL: { type: 'string' },
    PORT: { type: 'integer', default: 3000 },
    NODE_ENV: { type: 'string', default: 'development' },
  },
}

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig
  }
}

const configPlugin: FastifyPluginAsync = fp(async (server) => {
  await server.register(envPlugin, {
    schema,
    dotenv: true,
  })
})

export default configPlugin
