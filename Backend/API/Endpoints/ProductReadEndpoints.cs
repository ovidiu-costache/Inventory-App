using Application.DTOs;
using Infrastructure.Services;

namespace API.Endpoints
{
    public static class ProductReadEndpoints
    {
        public static RouteGroupBuilder MapProductReadEndpoints(this RouteGroupBuilder group)
        {
            // GET /api/products
            group.MapGet("/", async (DbServices db, int page = 1, int pageSize = 20,
                int? categoryId = null, string? stockState = null, // IN_STOCK | LOW_STOCK | OUT_OF_STOCK
                decimal? minPrice = null, decimal? maxPrice = null, string? search = null,
                string? sortBy = null,  // NAME | STOCK | PRICE
                string sortDir = "ASC"   // ASC | DESC
            ) => {
                if (page < 1) page = 1;
                
                var (items, hasMore) = await db.GetProductsPageAsync(
                    page, pageSize, categoryId, stockState, minPrice, maxPrice, search, sortBy, sortDir);

                return Results.Ok(new GetItemsPageDto<ProductDto>(
                    Items: items,
                    Page: page,
                    PageSize: pageSize,
                    HasMore: hasMore
                ));
            });

            // GET /api/products/{id}
            group.MapGet("/{id:int}", async (DbServices db, int id) => {
                var product = await db.GetProductAsync(id);
                if (product == null) {
                    return Results.NotFound();
                }
                return Results.Ok(product);
            });

            return group;
        }
    }
}