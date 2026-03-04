import 'dotenv/config'
import { defineConfig } from '@mikro-orm/postgresql'
import { Migrator } from '@mikro-orm/migrations'
import { WeatherRecord } from './src/entities/WeatherRecord.js'

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: [WeatherRecord],
  extensions: [Migrator],
  migrations: {
    path: './migrations',
    glob: '!(*.d).{js,ts}',
  },
  dynamicImportProvider: (id) => import(id),
  debug: process.env.NODE_ENV === 'development',
})
