using Application.DTOs;
using Infrastructure.Services;

namespace IssueTracker.Endpoints;

public static class ItemReadEndpoints
{
    public static RouteGroupBuilder MapItemReadEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", async (DbServices dbs) =>
        {
            List<TicketDto> tickets = await dbs.GetAllAsync();
            return Results.Ok(tickets);
        });
 
        return group;
    }
}