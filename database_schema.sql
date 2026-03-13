-- Script de Creación de Base de Datos para Aplicación de Gasolineras
-- Motor: SQL Server

-- Crear la base de datos (Opcional, descomentar si es necesario)
-- CREATE DATABASE GasStationsAppDB;
-- GO
-- USE GasStationsAppDB;
-- GO

-- ==========================================
-- 1. Tabla de Usuarios (Anónimos)
-- ==========================================
-- Dado que no hay registro, el usuario se identifica mediante un UUID (Id) 
-- que la aplicación genera la primera vez que se abre y guarda de forma local en el dispositivo.
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Platform NVARCHAR(50) NULL,        -- Ej: 'iOS', 'Android' (útil para solucionar bugs genéricos u obtener métricas)
    AppVersion NVARCHAR(50) NULL,      -- Ej: '1.0.0' (para saber qué versiones usan tus usuarios actuales)
    LanguageCode NVARCHAR(10) NULL,    -- Ej: 'es-ES' (por si en el futuro envías push notifications o configuras algo global)
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    LastActiveAt DATETIME2 NOT NULL DEFAULT SYSDATETIME() -- Actualizar este campo cada vez que un usuario abre la app (permite hacer limpieza de usuarios inactivos en el futuro)
);
GO

-- ==========================================
-- 2. Tabla de Gasolineras (Caché local)
-- ==========================================
-- Aunque la app consume los datos de los mapas en tiempo real (ej. desde Google Maps u OpenStreetMap),
-- esta tabla guarda una copia mínima de aquellas que alguien ha guardado como favoritas.
-- ¿Por qué? Para poder mostrar la pestaña de Favoritos enseguida, al abrir la app, sin necesidad
-- de gastar peticiones (dinero) a la API de mapas solo para saber el nombre y la dirección del favorito.
CREATE TABLE GasStations (
    ExternalProviderId NVARCHAR(100) PRIMARY KEY, -- ID proveniente del mapa (ej. Google Place ID u OpenStreetMap Node ID)
    OriginalName NVARCHAR(200) NOT NULL,          -- Nombre real de la gasolinera
    Latitude DECIMAL(10, 8) NOT NULL,             -- Latitud (precisión exacta)
    Longitude DECIMAL(11, 8) NOT NULL,            -- Longitud (precisión exacta)
    Address NVARCHAR(500) NULL,                   -- Dirección formateada
    Brand NVARCHAR(100) NULL,                     -- Marca comercial (Repsol, Cepsa, BP, Shell, etc.)
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME() -- Cuándo se registró o actualizó la info de esta gasolinera por última vez
);
GO

-- ==========================================
-- 3. Tabla de Favoritos
-- ==========================================
-- Relación entre el usuario anónimo y las gasolineras, con la posibilidad de asignarles un nombre personalizado.
CREATE TABLE FavoriteGasStations (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    GasStationId NVARCHAR(100) NOT NULL,          -- Se relaciona con ExternalProviderId
    CustomName NVARCHAR(100) NULL,                -- Aquí va el nombre que el usuario quiera ("Cerca de casa", "La más barata", etc.)
    Notes NVARCHAR(500) NULL,                     -- Opcional: un campo de notas por si en el futuro quiere añadir un comentario rápido
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    -- Llaves foráneas
    CONSTRAINT FK_FavoriteGasStations_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_FavoriteGasStations_GasStations FOREIGN KEY (GasStationId) REFERENCES GasStations(ExternalProviderId) ON DELETE CASCADE,
    
    -- Restricción para asegurar que un usuario no puede guardar la misma gasolinera dos veces en sus favoritos
    CONSTRAINT UQ_FavoriteGasStations_User_GasStation UNIQUE (UserId, GasStationId)
);
GO


-- ==========================================
-- ÍNDICES PARA RENDIMIENTO
-- ==========================================

-- Índice clave para que cuando un usuario abra la pestaña de Favoritos la búsqueda sea instantánea
CREATE NONCLUSTERED INDEX IX_FavoriteGasStations_UserId 
ON FavoriteGasStations(UserId, CreatedAt DESC);
GO

-- Índice útil para las rutinas de limpieza de datos (eliminar usuarios que no abren la app desde hace 2 años)
CREATE NONCLUSTERED INDEX IX_Users_LastActiveAt 
ON Users(LastActiveAt);
GO
