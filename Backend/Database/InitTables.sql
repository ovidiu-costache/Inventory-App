IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'InventoryAppDb')
BEGIN
    CREATE DATABASE InventoryAppDb;
END
GO

USE InventoryAppDb;
GO

-- Lookup Tables

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Category')
BEGIN
    CREATE TABLE Category (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL
    );
    
    INSERT INTO Category (Name) 
    VALUES ('Componente PC'), ('Periferice'), ('Retelistica');
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MovementType')
BEGIN
    CREATE TABLE MovementType (
        Id TINYINT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(20) NOT NULL
    );
    
    INSERT INTO MovementType (Name) 
    VALUES ('INTRARE'), ('IESIRE'), ('AJUSTARE'), ('TRANSFER');
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppUser')
BEGIN
    CREATE TABLE AppUser (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        FullName NVARCHAR(100) NOT NULL,
        Password NVARCHAR(255) NOT NULL
    );
    
    INSERT INTO AppUser (Username, FullName, Password) 
    VALUES 
        ('admin', 'Admin InvetoryApp', 'admin123'), 
        ('operator_depozit_pc', 'Stanescu Dan', '123456'), 
        ('operator_depozit_periferice', 'Lucescu Mihai', '123456');
END
GO

-- Main Tables

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Product')
BEGIN
    CREATE TABLE Product (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        CategoryId INT NOT NULL,
        UnitOfMeasure NVARCHAR(20) NOT NULL,
        Price DECIMAL(18,2) NOT NULL,
        CurrentStock DECIMAL(18,2) NOT NULL DEFAULT 0,
        ReorderThreshold DECIMAL(18,2) NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        
        FOREIGN KEY (CategoryId) REFERENCES Category(Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'StockMovement')
BEGIN
    CREATE TABLE StockMovement (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ProductId INT NOT NULL,
        MovementTypeId TINYINT NOT NULL,
        Quantity DECIMAL(18,2) NOT NULL CHECK (Quantity > 0),
        ResultingStock DECIMAL(18,2) NOT NULL,
        Reason NVARCHAR(200),
        ReferenceCode NVARCHAR(100),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CreatedByUserId INT NOT NULL,
        
        FOREIGN KEY (ProductId) REFERENCES Product(Id),
        FOREIGN KEY (MovementTypeId) REFERENCES MovementType(Id),
        FOREIGN KEY (CreatedByUserId) REFERENCES AppUser(Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LowStockNotification')
BEGIN
    CREATE TABLE LowStockNotification (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ProductId INT NOT NULL,
        TriggeredAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        IsResolved BIT NOT NULL DEFAULT 0,
        ResolvedAt DATETIME2 NULL,
        
        FOREIGN KEY (ProductId) REFERENCES Product(Id)
    );
END
GO

-- Mock Data

IF NOT EXISTS (SELECT TOP 1 1 FROM Product)
BEGIN
    INSERT INTO Product (Code, Name, Description, CategoryId, UnitOfMeasure, Price, CurrentStock, ReorderThreshold, IsActive)
    VALUES 
    ('CPU-AMD-5600X', 'AMD Ryzen 5 5600X', 'Procesor 6 nuclee, 12 thread-uri', 1, 'buc', 850.00, 50, 10, 1),
    ('RAM-COR-16', 'Corsair Vengeance LPX 16GB', 'Memorie 2x8GB DDR4 3200MHz', 1, 'buc', 220.00, 100, 20, 1),
    ('PER-LOG-G102', 'Logitech G102', 'Mouse gaming, 8000 DPI, negru', 2, 'buc', 115.50, 15, 5, 1),
    ('NET-TPL-C6', 'TP-Link Archer C6', 'Router Gigabit Wi-Fi AC1200', 3, 'buc', 180.00, 30, 10, 1);
END
GO

IF NOT EXISTS (SELECT TOP 1 1 FROM StockMovement)
BEGIN
    INSERT INTO StockMovement (ProductId, MovementTypeId, Quantity, ResultingStock, Reason, ReferenceCode, CreatedAt, CreatedByUserId)
    VALUES 
    (1, 1, 50, 50, 'Initial warehouse population', 'FACT-001', DATEADD(day, -5, GETDATE()), 1),
    (2, 1, 100, 100, 'Initial warehouse population', 'FACT-001', DATEADD(day, -5, GETDATE()), 1),
    (3, 1, 20, 20, 'Initial warehouse population', 'FACT-002', DATEADD(day, -4, GETDATE()), 1),
    (4, 1, 30, 30, 'Initial warehouse population', 'FACT-003', DATEADD(day, -3, GETDATE()), 1),

    (3, 2, 5, 15, 'Online order sale', 'CMD-1029', DATEADD(day, -1, GETDATE()), 2);
END
GO