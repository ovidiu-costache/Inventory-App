namespace Application.DTOs;

public sealed record ProductDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    string Category,
    string UnitOfMeasure,
    decimal Price,
    decimal CurrentStock,
    decimal ReorderThreshold,
    bool IsActive);