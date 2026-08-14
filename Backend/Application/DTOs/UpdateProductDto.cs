namespace Application.DTOs;

public sealed record UpdateProductDto(
    string? Code = null,
    string? Name = null,
    string? Description = null,
    int? CategoryId = null,
    string? UnitOfMeasure = null,
    decimal? Price = null,
    decimal? ReorderThreshold = null,
    bool? IsActive = null);
