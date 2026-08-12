IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'InventoryAppDb')
BEGIN
    CREATE DATABASE InventoryAppDb;
END
GO

USE InventoryAppDb;
GO

-- Lookup tables

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
        Username NVARCHAR(50) NOT NULL,
        FullName NVARCHAR(100) NOT NULL
    );
    
    INSERT INTO AppUser (Username, FullName) 
    VALUES ('admin', 'Administrator'), ('operator_depozit1', 'Operator 1'), ('operator_depozit2', 'Operator 2');
END
GO

-- Main tables

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

-- Mock data

-- TBD