CREATE OR ALTER PROCEDURE sp_GetProductsPage
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
GO

CREATE OR ALTER PROCEDURE sp_GetProduct
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Id IS NULL OR NOT EXISTS (SELECT 1 FROM Product WHERE Id = @Id AND IsActive = 1)
    BEGIN
        THROW 50001, 'Product not found.', 1;
    END

    SELECT
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
    WHERE p.Id = @Id AND p.IsActive = 1;
END;
