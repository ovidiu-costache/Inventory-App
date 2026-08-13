using Domain.Entities;

namespace Application.DTOs;

public sealed record CreateStockMovementDto(
    int ProductId,
    MovementTypeEnum MovementTypeId,
    decimal Quantity,
    string? Reason,
    string? ReferenceCode,
    int CreatedByUserId);