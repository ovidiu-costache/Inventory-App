using Application.DTOs;
using Infrastructure.Services;

namespace API.Endpoints
{
    public static class StockMovementWriteEndpoints
    {
        public static RouteGroupBuilder MapStockMovementWriteEndpoints(this RouteGroupBuilder group)
        {
            // POST /api/stock-movements
            group.MapPost("/", async (CreateStockMovementDto dto, DbServices db) =>
            {
                var result = await db.CreateStockMovementAsync(dto);

                // Return 201 Created
                return Results.Created($"/api/stock-movements/{result.Id}", result);
            });

            return group;
        }
    }
}
