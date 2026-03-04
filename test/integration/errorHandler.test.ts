import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import sensible from '@fastify/sensible'
import correlationPlugin from '../../src/plugins/observability/correlation.js'
import errorHandlerPlugin from '../../src/plugins/observability/errorHandler.js'

const buildTestApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false })
  await app.register(sensible)
  await app.register(correlationPlugin)
  await app.register(errorHandlerPlugin)

  app.get('/boom/400', async (_req, reply) => reply.badRequest('Invalid input'))
  app.get('/boom/404', async (_req, reply) => reply.notFound('Resource not found'))
  app.get('/boom/500', async () => { throw new Error('Something exploded') })

  await app.ready()
  return app
}

describe('Error handler', () => {
  let app: FastifyInstance

  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('returns a shaped 400 for badRequest errors', async () => {
    const res = await app.inject({ method: 'GET', url: '/boom/400' })

    expect(res.statusCode).toBe(400)
    const body = res.json<{ statusCode: number; error: string; message: string; correlationId: string }>()
    expect(body.statusCode).toBe(400)
    expect(body.message).toBe('Invalid input')
    expect(typeof body.correlationId).toBe('string')
  })

  it('returns a shaped 404 for notFound errors', async () => {
    const res = await app.inject({ method: 'GET', url: '/boom/404' })

    expect(res.statusCode).toBe(404)
    const body = res.json<{ statusCode: number; message: string }>()
    expect(body.statusCode).toBe(404)
    expect(body.message).toBe('Resource not found')
  })

  it('returns a generic 500 without leaking internal details', async () => {
    const res = await app.inject({ method: 'GET', url: '/boom/500' })

    expect(res.statusCode).toBe(500)
    const body = res.json<{ statusCode: number; message: string; correlationId: string }>()
    expect(body.statusCode).toBe(500)
    expect(body.message).toBe('An unexpected error occurred')
    expect(typeof body.correlationId).toBe('string')
  })
})
