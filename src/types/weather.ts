export interface DataInfo {
  Temperature: number
  TemperatureMax: number
  TemperatureMin: number
  Humidity: number
  Rainfall: number
}

export interface WeatherRecord {
  id: string
  sensorName: string
  sensorDate: string
  dataInfo: DataInfo
}

export type CreateWeatherRecordBody = Omit<WeatherRecord, 'id'>
