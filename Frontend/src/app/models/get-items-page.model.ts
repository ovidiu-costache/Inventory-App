export interface GetItemsPage<T> {
  items: T[];
  lastId: number | null;
  hasMore: boolean;
}