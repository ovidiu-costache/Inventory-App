namespace Application.DTOs;

public record TicketMixedStatsDto(
    string Status,
    string Priority,
    int TotalTickets);