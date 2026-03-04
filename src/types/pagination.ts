export interface PaginationMeta {
  total: number
  limit: number
  offset: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResult<T> {
  meta: PaginationMeta
  data: T[]
}
