export interface StockMovement {
  id: number;
  productCode: string;
  productName: string;
  movementType: string;
  quantity: number;
  resultingStock: number;
  reason?: string;
  referenceCode?: string;
  createdAt: string;
  createdBy: string;
}