import { FastifyPluginAsync } from 'fastify'
import { CreateWeatherRecordBody } from '../../types/weather.js'
import { createSchema, listSchema, getByIdSchema } from './schema.js'
import { WeatherService } from '../../services/WeatherService.js'

const weatherRoutes: FastifyPluginAsync = async (server) => {
  // POST /weather
  server.post<{ Body: CreateWeatherRecordBody }>(
    '/weather',
    { schema: createSchema },
    async (request, reply) => {
      const service = new WeatherService(request.em)
      const record = await service.create(request.body)
      return reply.code(201).send(record)
    }
  )

  // GET /weather
  server.get<{
    Querystring: { sensorName?: string; limit?: number; offset?: number }
  }>('/weather', { schema: listSchema }, async (request, reply) => {
    const service = new WeatherService(request.em)
    const result = await service.list(request.query)
    return reply.send(result)
  })

  // GET /weather/:id
  server.get<{ Params: { id: string } }>(
    '/weather/:id',
    { schema: getByIdSchema },
    async (request, reply) => {
      const service = new WeatherService(request.em)
      const record = await service.findById(request.params.id)

      if (!record) {
        return reply.notFound('Weather record not found')
      }

      return reply.send(record)
    }
  )
}

export default weatherRoutes
