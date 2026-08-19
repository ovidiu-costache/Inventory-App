using Infrastructure.Services;

namespace API.Endpoints
{
    public static class CategoryEndpoints
    {
        public static RouteGroupBuilder MapCategoryEndpoints(this RouteGroupBuilder group)
        {
            // GET /api/categories
            group.MapGet("/", async (DbServices db) =>
            {
                var categories = await db.GetCategoriesAsync();
                return Results.Ok(categories);
            });

            // POST /api/categories
            group.MapPost("/", async (Application.DTOs.CreateCategoryDto dto, DbServices db) =>
            {
                var result = await db.CreateCategoryAsync(dto);
                return Results.Created($"/api/categories/{result.Id}", result);
            });

            return group;
        }
    }
}
