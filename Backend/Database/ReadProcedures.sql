DROP PROCEDURE IF EXISTS sp_GetProductsPage;
GO

CREATE PROCEDURE sp_GetProductsPage
    @LastId INT = NULL,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@PageSize + 1)
        p.Id,
        p.Code,
        p.Name,
        p.Description,
        c.Name AS Category,
        p.UnitOfMeasure,
        p.Price,
        p.CurrentStock,
        p.ReorderThreshold,
        p.IsActive
    FROM Product p JOIN Category c ON c.Id = p.CategoryId
    WHERE p.IsActive = 1
      AND (@LastId IS NULL OR p.Id > @LastId)
    ORDER BY p.Id;
END;
