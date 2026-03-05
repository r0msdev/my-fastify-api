import { FastifySchema } from 'fastify'
import { metaSchema } from '../../schemas/meta.js'

export const dataInfoSchema = {
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

export const weatherRecordSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    sensorName: { type: 'string' },
    sensorDate: { type: 'string', format: 'date-time' },
    dataInfo: dataInfoSchema,
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const

export const createSchema: FastifySchema = {
  tags: ['weather'],
  summary: 'Create a weather record',
  operationId: 'createWeatherRecord',
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

export const listSchema: FastifySchema = {
  tags: ['weather'],
  summary: 'List weather records',
  operationId: 'listWeatherRecords',
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
        meta: metaSchema,
        data: { type: 'array', items: weatherRecordSchema },
      },
    },
  },
}

export const getByIdSchema: FastifySchema = {
  tags: ['weather'],
  summary: 'Get a weather record by ID',
  operationId: 'getWeatherRecordById',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
  },
  response: { 200: weatherRecordSchema },
}
