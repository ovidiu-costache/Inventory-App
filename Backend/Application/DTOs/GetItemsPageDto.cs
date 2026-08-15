namespace Application.DTOs;

public record GetItemsPageDto<T>(
    IReadOnlyList<T> Items,
    int? LastId,
    bool HasMore
);
