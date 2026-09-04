namespace Application.DTOs;

public record AiReviewRequestDto(
    int ProductId,
    decimal Quantity,
    string Reason
);
