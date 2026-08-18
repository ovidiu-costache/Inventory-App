export interface LowStockNotification {
  id: number;
  productCode: string;
  productName: string;
  currentStock: number;
  reorderThreshold: number;
  triggeredAt: string;
}
