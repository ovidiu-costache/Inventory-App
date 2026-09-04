namespace Application.DTOs;

public record AiReviewResponseDto(
    string Verdict,
    string Explanation
);
