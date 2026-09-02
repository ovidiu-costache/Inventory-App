using Application.DTOs;
using Infrastructure.Services;

namespace API.Endpoints
{
    public static class ProductReadEndpoints
    {
        public static RouteGroupBuilder MapProductReadEndpoints(this RouteGroupBuilder group)
        {
            // GET /api/products
            group.MapGet("/", async (DbServices db, int page = 1, int pageSize = 20, bool active = true,
                int? categoryId = null, string? stockState = null, // IN_STOCK | OUT_OF_STOCK | LOW_STOCK
                decimal? minPrice = null, decimal? maxPrice = null, string? search = null,
                string? sortBy = null,  // NAME | STOCK | PRICE
                string sortDir = "ASC"   // ASC | DESC
            ) => {
                if (page < 1) page = 1;
                
                var (items, hasMore) = await db.GetProductsPageAsync(
                    page, pageSize, active, categoryId, stockState, minPrice, maxPrice, search, sortBy, sortDir);

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

            // GET /api/products/semantic-search?query=...&topK=5
            group.MapGet("/semantic-search", async (
                DbServices db, EmbeddingService embeddingService,
                string query, int topK = 5) =>
            {
                if (string.IsNullOrWhiteSpace(query))
                    return Results.BadRequest("Query is required.");

                var queryEmbedding = await embeddingService.GetEmbeddingAsync(query);
                if (queryEmbedding == null)
                    return Results.Problem("AI search is temporarily unavailable. Please try again later.");

                var results = await db.SemanticSearchAsync(queryEmbedding, topK);

                return Results.Ok(results);
            });

            // POST /api/products/reindex-embeddings
            group.MapPost("/reindex-embeddings", async (DbServices db, EmbeddingService embeddingService) =>
            {
                var productIds = await db.GetActiveProductIdsWithoutEmbeddingAsync();
                int successCount = 0;
                int failCount = 0;

                foreach (var productId in productIds) {
                    try {
                        var product = await db.GetProductByIdForEmbeddingAsync(productId);
                        if (product == null) continue;

                        var text = EmbeddingService.BuildProductText(
                            product.Code, product.Name, product.Description, product.Category);
                        var embedding = await embeddingService.GetEmbeddingAsync(text);

                        if (embedding != null) {
                            await db.UpdateProductEmbeddingAsync(productId, embedding);
                            successCount++;
                        } else {
                            failCount++;
                        }

                        // Small delay to respect rate limits
                        await Task.Delay(100);
                    }
                    catch {
                        failCount++;
                    }
                }

                return Results.Ok(new { Indexed = successCount, Failed = failCount, Total = productIds.Count });
            });

            return group;
        }
    }
}