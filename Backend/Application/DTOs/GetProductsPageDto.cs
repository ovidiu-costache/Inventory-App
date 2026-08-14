namespace Application.DTOs;

public record GetProductsPageDto<T>(
    IReadOnlyList<T> Items,
    int? LastId,
    bool HasMore
);
