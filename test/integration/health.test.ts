import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import sensible from '@fastify/sensible'
import correlationPlugin from '../../src/plugins/observability/correlation.js'
import healthRoutes from '../../src/routes/health/index.js'

const buildTestApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false })
  await app.register(sensible)
  await app.register(correlationPlugin)
  await app.register(healthRoutes)
  await app.ready()
  return app
}

describe('GET /health', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns 200 with status ok, uptime and timestamp', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ status: string; uptime: number; timestamp: string }>()
    expect(body.status).toBe('ok')
    expect(typeof body.uptime).toBe('number')
    expect(typeof body.timestamp).toBe('string')
  })

  it('echoes the x-correlation-id header', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { 'x-correlation-id': 'test-trace-id' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.headers['x-correlation-id']).toBe('test-trace-id')
  })

  it('generates a correlation id when none is provided', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' })

    const correlationId = res.headers['x-correlation-id']
    expect(typeof correlationId).toBe('string')
    expect((correlationId as string).length).toBeGreaterThan(0)
  })
})
