namespace Application.DTOs;

public record GetItemsPageDto<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    bool HasMore
);
