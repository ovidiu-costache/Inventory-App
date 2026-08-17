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
        ;THROW 50001, 'Product not found.', 1;
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
GO

CREATE OR ALTER PROCEDURE sp_GetMovementsPage
    @LastId INT = NULL,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@PageSize + 1)
        s.Id,
        p.Code as ProductCode,
        p.Name as ProductName,
        m.Name as MovementType,
        s.Quantity,
        s.ResultingStock,
        s.Reason,
        s.ReferenceCode,
        s.CreatedAt,
        u.Username AS CreatedBy
    FROM StockMovement s
        JOIN Product p ON p.Id = s.ProductId
        JOIN MovementType m ON m.Id = s.MovementTypeId
        JOIN AppUser u ON u.Id = s.CreatedByUserId
    WHERE p.IsActive = 1
      AND (@LastId IS NULL OR s.Id > @LastId)
    ORDER BY s.Id;
END;
GO

CREATE OR ALTER PROCEDURE sp_GetMovementsForProduct
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @ProductId IS NULL OR NOT EXISTS (SELECT 1 FROM Product WHERE Id = @ProductId)
    BEGIN
        ;THROW 50001, 'Product not found.', 1;
    END

    SELECT
        s.Id,
        p.Code as ProductCode,
        p.Name as ProductName,
        m.Name as MovementType,
        s.Quantity,
        s.ResultingStock,
        s.Reason,
        s.ReferenceCode,
        s.CreatedAt,
        u.Username AS CreatedBy
    FROM StockMovement s
        JOIN Product p ON p.Id = s.ProductId
        JOIN MovementType m ON m.Id = s.MovementTypeId
        JOIN AppUser u ON u.Id = s.CreatedByUserId
    WHERE s.ProductId = @ProductId
    ORDER BY s.CreatedAt DESC;
END;
GO

CREATE OR ALTER PROCEDURE sp_GetNotifications
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        n.Id,
        p.Code AS ProductCode,
        p.Name AS ProductName,
        p.CurrentStock,
        p.ReorderThreshold,
        n.TriggeredAt
    FROM LowStockNotification n
        JOIN Product p ON p.Id = n.ProductId
    WHERE n.IsResolved = 0
    ORDER BY n.TriggeredAt DESC;
END;
GO

CREATE OR ALTER PROCEDURE sp_GetNotificationsForProduct
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @ProductId IS NULL OR NOT EXISTS (SELECT 1 FROM Product WHERE Id = @ProductId)
    BEGIN
        ;THROW 50001, 'Product not found.', 1;
    END

    SELECT
        n.Id,
        p.Code AS ProductCode,
        p.Name AS ProductName,
        p.CurrentStock,
        p.ReorderThreshold,
        n.TriggeredAt
    FROM LowStockNotification n
        JOIN Product p ON p.Id = n.ProductId
    WHERE n.ProductId = @ProductId
        AND n.IsResolved = 0
    ORDER BY n.TriggeredAt DESC;
END;