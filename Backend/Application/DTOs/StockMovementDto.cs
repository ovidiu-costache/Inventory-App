namespace Application.DTOs;

public sealed record StockMovementDto(
    int Id,
    string ProductCode,
    string ProductName,
    string MovementType,
    decimal Quantity,
    decimal ResultingStock,
    string? Reason,
    string? ReferenceCode,
    DateTime CreatedAt,
    string CreatedByUser);