import { EntityManager } from '@mikro-orm/postgresql'
import { WeatherRecord } from '../entities/WeatherRecord.js'
import { CreateWeatherRecordBody, WeatherRecord as WeatherRecordResponse } from '../types/weather.js'

export interface ListOptions {
  sensorName?: string
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  total: number
  data: T[]
}

export class WeatherService {
  constructor(private readonly em: EntityManager) {}

  async create(body: CreateWeatherRecordBody): Promise<WeatherRecordResponse & { createdAt: string }> {
    const record = this.em.create(WeatherRecord, {
      sensorName: body.sensorName,
      sensorDate: new Date(body.sensorDate),
      dataInfo: body.dataInfo,
    })

    await this.em.persistAndFlush(record)

    return this.toResponse(record)
  }

  async list(options: ListOptions): Promise<PaginatedResult<WeatherRecordResponse & { createdAt: string }>> {
    const { sensorName, limit = 20, offset = 0 } = options
    const where = sensorName ? { sensorName } : {}

    const [data, total] = await this.em.findAndCount(WeatherRecord, where, {
      orderBy: { sensorDate: 'desc' },
      limit,
      offset,
    })

    return { total, data: data.map((r) => this.toResponse(r)) }
  }

  async findById(id: string): Promise<(WeatherRecordResponse & { createdAt: string }) | null> {
    const record = await this.em.findOne(WeatherRecord, { id })
    return record ? this.toResponse(record) : null
  }

  private toResponse(record: WeatherRecord): WeatherRecordResponse & { createdAt: string } {
    return {
      id: record.id,
      sensorName: record.sensorName,
      sensorDate: record.sensorDate.toISOString(),
      dataInfo: record.dataInfo,
      createdAt: record.createdAt.toISOString(),
    }
  }
}
