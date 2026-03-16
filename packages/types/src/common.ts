export type PaginationParams = {
  offset: number;
  limit: number;
};

export type PaginatedResults<T> = {
  data: T[],
  total: number;
  limit: number;
  offset: number;
  isFirst: boolean;
  isLast: boolean;
};
