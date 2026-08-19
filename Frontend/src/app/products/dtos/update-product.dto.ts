export interface UpdateProductDto {
    code?: string;
    name?: string;
    description?: string;
    categoryId?: number;
    unitOfMeasure?: string;
    price?: number;
    reorderThreshold?: number;
    isActive?: boolean;
}
