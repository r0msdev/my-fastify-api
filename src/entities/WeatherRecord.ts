import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core'
import { DataInfo } from '../types/weather.js'

@Entity()
export class WeatherRecord {
  [OptionalProps]?: 'createdAt'

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ type: 'string' })
  sensorName!: string

  @Property({ type: 'datetime' })
  sensorDate!: Date

  @Property({ type: 'jsonb' })
  dataInfo!: DataInfo

  @Property({ type: 'datetime', defaultRaw: 'now()' })
  createdAt: Date = new Date()
}
