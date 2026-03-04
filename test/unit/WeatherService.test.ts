import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WeatherService } from '../../src/services/WeatherService.js'
import { WeatherRecord } from '../../src/entities/WeatherRecord.js'

const mockRecord = (overrides?: Partial<WeatherRecord>): WeatherRecord =>
  ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    sensorName: 'sensor-1',
    sensorDate: new Date('2024-01-15T12:00:00.000Z'),
    dataInfo: { Temperature: 22.5, TemperatureMax: 25, TemperatureMin: 20, Humidity: 60, Rainfall: 0 },
    createdAt: new Date('2024-01-15T12:00:00.000Z'),
    ...overrides,
  }) as WeatherRecord

const mockEm = {
  create: vi.fn(),
  persist: vi.fn().mockReturnThis(),
  flush: vi.fn(),
  findAndCount: vi.fn(),
  findOne: vi.fn(),
}

describe('WeatherService', () => {
  let service: WeatherService

  beforeEach(() => {
    vi.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = new WeatherService(mockEm as any)
  })

  // ── create ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('persists a new record and returns a serialised response', async () => {
      const body = {
        sensorName: 'sensor-1',
        sensorDate: '2024-01-15T12:00:00.000Z',
        dataInfo: { Temperature: 22.5, TemperatureMax: 25, TemperatureMin: 20, Humidity: 60, Rainfall: 0 },
      }
      const record = mockRecord()
      mockEm.create.mockReturnValue(record)

      const result = await service.create(body)

      expect(mockEm.create).toHaveBeenCalledWith(WeatherRecord, {
        sensorName: body.sensorName,
        sensorDate: new Date(body.sensorDate),
        dataInfo: body.dataInfo,
      })
      expect(mockEm.persist).toHaveBeenCalledWith(record)
      expect(mockEm.flush).toHaveBeenCalled()
      expect(result.sensorName).toBe('sensor-1')
      expect(result.sensorDate).toBe(new Date(body.sensorDate).toISOString())
      expect(typeof result.createdAt).toBe('string')
    })
  })

  // ── list ──────────────────────────────────────────────────────────────────

  describe('list()', () => {
    it('returns data with correct meta for a single page', async () => {
      mockEm.findAndCount.mockResolvedValue([[mockRecord()], 1])

      const result = await service.list({ limit: 20, offset: 0 })

      expect(result.meta).toMatchObject({
        total: 1,
        limit: 20,
        offset: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      })
      expect(result.data).toHaveLength(1)
    })

    it('sets hasNextPage when more records exist beyond the current page', async () => {
      mockEm.findAndCount.mockResolvedValue([[], 50])

      const result = await service.list({ limit: 20, offset: 0 })

      expect(result.meta.hasNextPage).toBe(true)
      expect(result.meta.totalPages).toBe(3)
    })

    it('sets hasPrevPage when offset is greater than zero', async () => {
      mockEm.findAndCount.mockResolvedValue([[], 50])

      const result = await service.list({ limit: 20, offset: 20 })

      expect(result.meta.hasPrevPage).toBe(true)
      expect(result.meta.currentPage).toBe(2)
    })
  })

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('returns null when the record does not exist', async () => {
      mockEm.findOne.mockResolvedValue(null)

      expect(await service.findById('nonexistent-id')).toBeNull()
    })

    it('returns the serialised record when found', async () => {
      const record = mockRecord({ id: 'some-id' })
      mockEm.findOne.mockResolvedValue(record)

      const result = await service.findById('some-id')

      expect(result).not.toBeNull()
      expect(result?.id).toBe('some-id')
      expect(result?.sensorName).toBe('sensor-1')
    })
  })
})
