using Application.DTOs;
using Infrastructure.Services;

namespace API.Endpoints
{
    public static class StockMovementReadEndpoints
    {
        public static RouteGroupBuilder MapStockMovementReadEndpoints(this RouteGroupBuilder group)
        {
            // GET /api/stock-movements
            group.MapGet("/", async (DbServices db, int? lastId, int pageSize = 20) => {
                var (items, hasMore) = await db.GetMovementsPageAsync(lastId, pageSize);
                return Results.Ok(new GetItemsPageDto<StockMovementDto>(
                    Items: items,
                    LastId: items.Count > 0 ? items[^1].Id : null,
                    HasMore: hasMore
                ));
            });

            // GET /api/stock-movements/{productId}
            group.MapGet("/{productId:int}", async (DbServices db, int productId) => {
                var items = await db.GetMovementsForProductAsync(productId);
                return Results.Ok(items);
            });

            return group;
        }
    }
}
