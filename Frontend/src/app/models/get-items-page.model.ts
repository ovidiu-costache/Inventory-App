export interface GetItemsPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}