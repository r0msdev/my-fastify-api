export interface PaginationBase {
  total: number
  limit: number
  offset: number
}

export interface PaginationMeta extends PaginationBase {
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResult<T> {
  meta: PaginationMeta
  data: T[]
}
