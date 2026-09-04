namespace Application.DTOs;

public sealed record SemanticSearchResultDto(
    int Id,
    string Code,
    string Name,
    double Score);
