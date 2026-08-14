using Application.DTOs;
using Infrastructure.Services;

namespace API.Endpoints
{
    public static class ProductReadEndpoints
    {
        public static RouteGroupBuilder MapProductReadEndpoints(this RouteGroupBuilder group)
        {
            // TO DO: GET /api/products
            group.MapGet("/", async (DbServices db, int? lastId, int pageSize = 20) => {
                var (items, hasMore) = await db.GetProductsPageAsync(lastId, pageSize);
                return Results.Ok(new GetProductsPageDto<ProductDto>(
                    Items: items,
                    LastId: items.Count > 0 ? items[^1].Id : null,
                    HasMore: hasMore
                ));
            });

            // TO DO: GET /api/products/{id}
            group.MapGet("/{id:int}", async (DbServices db, int id) => {
                var product = await db.GetProductAsync(id);
                if (product == null)
                {
                    return Results.NotFound();
                }
                return Results.Ok(product);
            });

            return group;
        }
    }
}
