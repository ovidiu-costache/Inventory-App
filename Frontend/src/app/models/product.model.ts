export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  category: string;
  unitOfMeasure: string;
  price: number;
  currentStock: number;
  reorderThreshold: number;
  isActive: boolean;
}