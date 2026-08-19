USE InventoryAppDb;
GO

DROP PROCEDURE IF EXISTS sp_GetProductsPage;
GO
CREATE PROCEDURE sp_GetProductsPage
    @Page INT = 1,
    @PageSize INT = 20,
    @Active BIT = 1,
    @CategoryId INT = NULL,
    @StockState NVARCHAR(20) = NULL,
    @MinPrice DECIMAL(18, 2) = NULL,
    @MaxPrice DECIMAL(18, 2) = NULL,
    @Search NVARCHAR(200) = NULL,
    @SortBy NVARCHAR(50) = NULL,   -- NAME / STOCK / PRICE / CATEGORY
    @SortDir NVARCHAR(4) = 'ASC'     -- ASC / DESC
AS
BEGIN
    SET NOCOUNT ON;

    IF @Page < 1 SET @Page = 1;
    IF @PageSize < 1 SET @PageSize = 20;

    SET @SortBy = TRIM(ISNULL(@SortBy, 'NAME'));
    SET @SortDir = TRIM(ISNULL(@SortDir, 'ASC'));
    SET @Search = NULLIF(TRIM(@Search), '');

    IF @SortBy NOT IN ('NAME', 'STOCK', 'PRICE', 'CATEGORY') SET @SortBy = 'NAME';
    IF @SortDir NOT IN ('ASC', 'DESC') SET @SortDir = 'ASC';

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
    WHERE p.IsActive = @Active
        AND (@CategoryId IS NULL OR p.CategoryId = @CategoryId)
        AND (@MinPrice IS NULL OR p.Price >= @MinPrice)
        AND (@MaxPrice IS NULL OR p.Price <= @MaxPrice)
        AND (
            @Search IS NULL 
            OR p.Name LIKE '%' + @Search + '%' 
            OR p.Code LIKE '%' + @Search + '%'
        )
        AND (
            @StockState IS NULL
            OR (@StockState = 'IN_STOCK' AND p.CurrentStock > p.ReorderThreshold)
            OR (@StockState = 'LOW_STOCK' AND p.CurrentStock > 0 AND p.CurrentStock <= p.ReorderThreshold)
            OR (@StockState = 'OUT_OF_STOCK' AND p.CurrentStock = 0)
        )
    ORDER BY
        CASE WHEN @SortBy = 'NAME' AND @SortDir = 'ASC' THEN p.Name END ASC,
        CASE WHEN @SortBy = 'NAME' AND @SortDir = 'DESC' THEN p.Name END DESC,
        CASE WHEN @SortBy = 'STOCK' AND @SortDir = 'ASC' THEN p.CurrentStock END ASC,
        CASE WHEN @SortBy = 'STOCK' AND @SortDir = 'DESC' THEN p.CurrentStock END DESC,
        CASE WHEN @SortBy = 'PRICE' AND @SortDir = 'ASC' THEN p.Price END ASC,
        CASE WHEN @SortBy = 'PRICE' AND @SortDir = 'DESC' THEN p.Price END DESC,
        CASE WHEN @SortBy = 'CATEGORY' AND @SortDir = 'ASC' THEN c.Name END ASC,
        CASE WHEN @SortBy = 'CATEGORY' AND @SortDir = 'DESC' THEN c.Name END DESC,
        p.Id ASC
    OFFSET (@Page - 1) * @PageSize ROWS
        FETCH NEXT (@PageSize + 1) ROWS ONLY;
END;
GO

DROP PROCEDURE IF EXISTS sp_GetProduct;
GO
CREATE PROCEDURE sp_GetProduct
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

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
    WHERE p.Id = @Id;
END;
GO

DROP PROCEDURE IF EXISTS sp_GetMovementsPage;
GO
CREATE PROCEDURE sp_GetMovementsPage
    @Page INT = 1,
    @PageSize INT = 20,
    @ProductId INT = NULL,
    @MovementType NVARCHAR(50) = NULL,
    @FromDate DATETIME2 = NULL,
    @ToDate DATETIME2 = NULL,
    @CreatedByUserId INT = NULL,
    @SortBy NVARCHAR(50) = 'CREATED_AT', -- CREATED_AT / PRODUCT_NAME / QUANTITY
    @SortDir NVARCHAR(4) = 'DESC'        -- ASC / DESC
AS
BEGIN
    SET NOCOUNT ON;

    IF @Page < 1 SET @Page = 1;
    IF @PageSize < 1 SET @PageSize = 20;

    SET @SortBy = TRIM(ISNULL(@SortBy, 'CREATED_AT'));
    SET @SortDir = TRIM(ISNULL(@SortDir, 'DESC'));
    SET @MovementType = NULLIF(TRIM(@MovementType), '');

    IF @SortBy NOT IN ('CREATED_AT', 'PRODUCT_NAME', 'QUANTITY') SET @SortBy = 'CREATED_AT';
    IF @SortDir NOT IN ('ASC', 'DESC') SET @SortDir = 'DESC';

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
    WHERE p.IsActive = 1
        AND (@ProductId IS NULL OR s.ProductId = @ProductId)
        AND (@MovementType IS NULL OR UPPER(m.Name) = UPPER(@MovementType))
        AND (@FromDate IS NULL OR s.CreatedAt >= @FromDate)
        AND (@ToDate IS NULL OR s.CreatedAt <= @ToDate)
        AND (@CreatedByUserId IS NULL OR s.CreatedByUserId = @CreatedByUserId)
    ORDER BY
        CASE WHEN @SortBy = 'CREATED_AT' AND @SortDir = 'ASC' THEN s.CreatedAt END ASC,
        CASE WHEN @SortBy = 'CREATED_AT' AND @SortDir = 'DESC' THEN s.CreatedAt END DESC,
        CASE WHEN @SortBy = 'PRODUCT_NAME' AND @SortDir = 'ASC' THEN p.Name END ASC,
        CASE WHEN @SortBy = 'PRODUCT_NAME' AND @SortDir = 'DESC' THEN p.Name END DESC,
        CASE WHEN @SortBy = 'QUANTITY' AND @SortDir = 'ASC' THEN s.Quantity END ASC,
        CASE WHEN @SortBy = 'QUANTITY' AND @SortDir = 'DESC' THEN s.Quantity END DESC,
        s.Id ASC
    OFFSET (@Page - 1) * @PageSize ROWS
        FETCH NEXT (@PageSize + 1) ROWS ONLY;
END;
GO

DROP PROCEDURE IF EXISTS sp_GetMovementsForProduct;
GO
CREATE PROCEDURE sp_GetMovementsForProduct
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

DROP PROCEDURE IF EXISTS sp_GetNotifications;
GO
CREATE PROCEDURE sp_GetNotifications
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

DROP PROCEDURE IF EXISTS sp_GetNotificationsForProduct;
GO
CREATE PROCEDURE sp_GetNotificationsForProduct
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
