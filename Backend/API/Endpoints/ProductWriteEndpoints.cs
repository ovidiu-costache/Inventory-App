using Application.DTOs;
using Infrastructure.Services;

namespace API.Endpoints
{
    public static class ProductWriteEndpoints
    {
        public static RouteGroupBuilder MapProductWriteEndpoints(this RouteGroupBuilder group)
        {
            // Create a new product
            group.MapPost("/", async (CreateProductDto dto, DbServices db, EmbeddingService embeddingService) =>
            {
                var result = await db.CreateProductAsync(dto);

                // Generate embedding (fault-tolerant: product is created even if this fails)
                try
                {
                    var text = EmbeddingService.BuildProductText(
                        dto.Code, dto.Name, dto.Description, result.Category);
                    var embedding = await embeddingService.GetEmbeddingAsync(text);
                    if (embedding != null)
                    {
                        await db.UpdateProductEmbeddingAsync(result.Id, embedding);
                    }
                }
                catch
                {
                    // Embedding generation failed — product is still created successfully
                }

                // Return 201 Created with the route to the new resource
                return Results.Created($"/api/products/{result.Id}", result);
            });

            // Update an existing product
            group.MapPatch("/{id:int}", async (int id, UpdateProductDto dto, DbServices db, EmbeddingService embeddingService) =>
            {
                var result = await db.UpdateProductAsync(id, dto);

                // Regenerate embedding if name, description, or category changed
                try
                {
                    var text = EmbeddingService.BuildProductText(
                        result.Code, result.Name, result.Description, result.Category);
                    var embedding = await embeddingService.GetEmbeddingAsync(text);
                    if (embedding != null)
                    {
                        await db.UpdateProductEmbeddingAsync(result.Id, embedding);
                    }
                }
                catch
                {
                    // Embedding regeneration failed — product is still updated successfully
                }

                // Return 200 OK with the updated resource
                return Results.Ok(result);
            });

            // Soft delete a product
            group.MapDelete("/{id:int}", async (int id, DbServices db) =>
            {
                await db.DeleteProductAsync(id);

                // Return 204 No Content for a successful delete operation
                return Results.NoContent();
            });

            // Restore a soft-deleted product
            group.MapPatch("/{id:int}/restore", async (int id, DbServices db) =>
            {
                await db.RestoreProductAsync(id);

                // Return 204 No Content for a successful restore operation
                return Results.NoContent();
            });

            return group;
        }
    }
}
