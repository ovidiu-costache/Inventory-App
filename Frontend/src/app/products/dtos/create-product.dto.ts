export interface CreateProductDto {
    code: string;
    name: string;
    description?: string;
    categoryId: number;
    unitOfMeasure: string;
    price: number;
    reorderThreshold: number;
}