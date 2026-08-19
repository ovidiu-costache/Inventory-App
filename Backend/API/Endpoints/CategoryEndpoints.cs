using Infrastructure.Services;

namespace API.Endpoints
{
    public static class CategoryEndpoints
    {
        public static RouteGroupBuilder MapCategoryEndpoints(this RouteGroupBuilder group)
        {
            group.MapGet("/", async (DbServices db) =>
            {
                var categories = await db.GetCategoriesAsync();
                return Results.Ok(categories);
            });

            return group;
        }
    }
}
