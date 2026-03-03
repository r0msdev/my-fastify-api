import { FastifyPluginAsync, FastifySchema } from 'fastify'
import { CreateWeatherRecordBody, DataInfo, WeatherRecord } from '../types/weather.js'

// ── JSON Schema for validation ──────────────────────────────────────────────

const dataInfoSchema = {
  type: 'object',
  required: ['Temperature', 'TemperatureMax', 'TemperatureMin', 'Humidity', 'Rainfall'],
  properties: {
    Temperature: { type: 'number' },
    TemperatureMax: { type: 'number' },
    TemperatureMin: { type: 'number' },
    Humidity: { type: 'number' },
    Rainfall: { type: 'number' },
  },
} as const

const weatherRecordSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    sensorName: { type: 'string' },
    sensorDate: { type: 'string', format: 'date-time' },
    dataInfo: dataInfoSchema,
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const

const createSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['sensorName', 'sensorDate', 'dataInfo'],
    properties: {
      sensorName: { type: 'string' },
      sensorDate: { type: 'string', format: 'date-time' },
      dataInfo: dataInfoSchema,
    },
  },
  response: { 201: weatherRecordSchema },
}

const listSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      sensorName: { type: 'string' },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      offset: { type: 'integer', minimum: 0, default: 0 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        data: { type: 'array', items: weatherRecordSchema },
      },
    },
  },
}

const getByIdSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
  },
  response: { 200: weatherRecordSchema },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toResponse(record: {
  id: string
  sensorName: string
  sensorDate: Date
  dataInfo: unknown
  createdAt: Date
}): WeatherRecord & { createdAt: string } {
  return {
    id: record.id,
    sensorName: record.sensorName,
    sensorDate: record.sensorDate.toISOString(),
    dataInfo: record.dataInfo as DataInfo,
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

      const record = await server.prisma.weatherRecord.create({
        data: {
          sensorName,
          sensorDate: new Date(sensorDate),
          dataInfo: dataInfo as unknown as Record<string, number>,
        },
      })

      return reply.code(201).send(toResponse(record))
    }
  )

  // GET /weather
  server.get<{
    Querystring: { sensorName?: string; limit?: number; offset?: number }
  }>('/weather', { schema: listSchema }, async (request, reply) => {
    const { sensorName, limit = 20, offset = 0 } = request.query

    const where = sensorName ? { sensorName } : {}

    const [total, data] = await server.prisma.$transaction([
      server.prisma.weatherRecord.count({ where }),
      server.prisma.weatherRecord.findMany({
        where,
        orderBy: { sensorDate: 'desc' },
        take: limit,
        skip: offset,
      }),
    ])

    return reply.send({ total, data: data.map(toResponse) })
  })

  // GET /weather/:id
  server.get<{ Params: { id: string } }>(
    '/weather/:id',
    { schema: getByIdSchema },
    async (request, reply) => {
      const record = await server.prisma.weatherRecord.findUnique({
        where: { id: request.params.id },
      })

      if (!record) {
        return reply.code(404).send({ message: 'Weather record not found' })
      }

      return reply.send(toResponse(record))
    }
  )
}

export default weatherRoutes
