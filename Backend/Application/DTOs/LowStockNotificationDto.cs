namespace Application.DTOs;

public sealed record LowStockNotificationDto(
    int Id,
    string ProductCode,
    string ProductName,
    decimal CurrentStock,
    decimal ReorderThreshold,
    DateTime TriggeredAt,
    bool IsResolved,
    DateTime? ResolvedAt);