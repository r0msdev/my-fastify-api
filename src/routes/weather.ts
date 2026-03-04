import { FastifyPluginAsync } from 'fastify'
import { CreateWeatherRecordBody, WeatherRecord as WeatherRecordType } from '../types/weather.js'
import { createSchema, listSchema, getByIdSchema } from '../schemas/weather.js'
import { WeatherRecord } from '../entities/WeatherRecord.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

function toResponse(record: WeatherRecord): WeatherRecordType & { createdAt: string } {
  return {
    id: record.id,
    sensorName: record.sensorName,
    sensorDate: record.sensorDate.toISOString(),
    dataInfo: record.dataInfo,
    createdAt: record.createdAt.toISOString(),
  }
}

// ── Routes ───────────────────────────────────────────────────────────────────

const weatherRoutes: FastifyPluginAsync = async (server) => {
  // POST /weather
  server.post<{ Body: CreateWeatherRecordBody }>(
    '/weather',
    { schema: createSchema },
    async (request, reply) => {
      const { sensorName, sensorDate, dataInfo } = request.body

      const record = request.em.create(WeatherRecord, {
        sensorName,
        sensorDate: new Date(sensorDate),
        dataInfo,
      })
      await request.em.persistAndFlush(record)

      return reply.code(201).send(toResponse(record))
    }
  )

  // GET /weather
  server.get<{
    Querystring: { sensorName?: string; limit?: number; offset?: number }
  }>('/weather', { schema: listSchema }, async (request, reply) => {
    const { sensorName, limit = 20, offset = 0 } = request.query

    const where = sensorName ? { sensorName } : {}

    const [data, total] = await request.em.findAndCount(WeatherRecord, where, {
      orderBy: { sensorDate: 'desc' },
      limit,
      offset,
    })

    return reply.send({ total, data: data.map(toResponse) })
  })

  // GET /weather/:id
  server.get<{ Params: { id: string } }>(
    '/weather/:id',
    { schema: getByIdSchema },
    async (request, reply) => {
      const record = await request.em.findOne(WeatherRecord, { id: request.params.id })

      if (!record) {
        return reply.code(404).send({ message: 'Weather record not found' })
      }

      return reply.send(toResponse(record))
    }
  )
}

export default weatherRoutes
