namespace Application.DTOs;

public sealed record CreateProductDto(
    string Code,
    string Name,
    string? Description,
    int CategoryId,
    string UnitOfMeasure,
    decimal Price,
    decimal ReorderThreshold);
