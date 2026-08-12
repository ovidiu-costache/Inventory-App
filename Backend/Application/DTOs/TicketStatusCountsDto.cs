namespace Application.DTOs;

public record TicketStatusCountsDto(
    string Status,
    int TotalTickets);