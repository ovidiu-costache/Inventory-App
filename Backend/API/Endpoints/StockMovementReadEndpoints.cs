using Application.DTOs;
using Infrastructure.Services;

namespace API.Endpoints
{
    public static class StockMovementReadEndpoints
    {
        public static RouteGroupBuilder MapStockMovementReadEndpoints(this RouteGroupBuilder group)
        {
            // GET /api/stock-movements
            group.MapGet("/", async (DbServices db, int page = 1, int pageSize = 20,
                int? productId = null, string? movementType = null, DateTime? fromDate = null,
                DateTime? toDate = null, int? createdByUserId = null, string? createdBy = null,
                string sortBy = "CREATED_AT",  // CREATED_AT | PRODUCT_NAME | QUANTITY
                string sortDir = "DESC"       // ASC | DESC
            ) => {
                if (page < 1) page = 1;

                var (items, hasMore) = await db.GetMovementsPageAsync(
                    page, pageSize, productId, movementType, fromDate, toDate, createdByUserId, createdBy, sortBy, sortDir);

                return Results.Ok(new GetItemsPageDto<StockMovementDto>(
                    Items: items,
                    Page: page,
                    PageSize: pageSize,
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