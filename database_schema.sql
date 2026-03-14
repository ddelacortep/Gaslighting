-- Esquema PostgreSQL para la aplicación Gaslighting
-- Basado en las funcionalidades actuales de backend (Laravel 12) y frontend.
-- Incluye tablas de negocio + tablas framework usadas por Laravel.

BEGIN;

-- ==========================================
-- 1) TABLAS DE NEGOCIO
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    platform varchar(50),
    app_version varchar(50),
    language_code varchar(10),
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS users_last_active_at_index
    ON users (last_active_at);

CREATE TABLE IF NOT EXISTS gas_stations (
    external_provider_id varchar(100) PRIMARY KEY,
    original_name varchar(200) NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    address varchar(500),
    brand varchar(100),
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT gas_stations_latitude_range CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT gas_stations_longitude_range CHECK (longitude BETWEEN -180 AND 180)
);

CREATE TABLE IF NOT EXISTS favorite_gas_stations (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    gas_station_id varchar(100) NOT NULL,
    custom_name varchar(100),
    notes varchar(500),
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT favorite_gas_stations_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT favorite_gas_stations_station_fk
        FOREIGN KEY (gas_station_id)
        REFERENCES gas_stations(external_provider_id)
        ON DELETE CASCADE,
    CONSTRAINT favorite_gas_stations_user_station_unique
        UNIQUE (user_id, gas_station_id)
);

CREATE INDEX IF NOT EXISTS favorite_gas_stations_user_created_at_index
    ON favorite_gas_stations (user_id, created_at DESC);

-- ==========================================
-- 2) TABLAS DE FRAMEWORK (LARAVEL)
-- ==========================================

CREATE TABLE IF NOT EXISTS sessions (
    id varchar(255) PRIMARY KEY,
    user_id uuid,
    ip_address varchar(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_index
    ON sessions (user_id);

CREATE INDEX IF NOT EXISTS sessions_last_activity_index
    ON sessions (last_activity);

CREATE TABLE IF NOT EXISTS cache (
    key varchar(255) PRIMARY KEY,
    value text NOT NULL,
    expiration integer NOT NULL
);

CREATE INDEX IF NOT EXISTS cache_expiration_index
    ON cache (expiration);

CREATE TABLE IF NOT EXISTS cache_locks (
    key varchar(255) PRIMARY KEY,
    owner varchar(255) NOT NULL,
    expiration integer NOT NULL
);

CREATE INDEX IF NOT EXISTS cache_locks_expiration_index
    ON cache_locks (expiration);

CREATE TABLE IF NOT EXISTS jobs (
    id bigserial PRIMARY KEY,
    queue varchar(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL,
    CONSTRAINT jobs_attempts_non_negative CHECK (attempts >= 0),
    CONSTRAINT jobs_reserved_at_non_negative CHECK (reserved_at IS NULL OR reserved_at >= 0),
    CONSTRAINT jobs_available_at_non_negative CHECK (available_at >= 0),
    CONSTRAINT jobs_created_at_non_negative CHECK (created_at >= 0)
);

CREATE INDEX IF NOT EXISTS jobs_queue_reserved_at_available_at_index
    ON jobs (queue, reserved_at, available_at);

CREATE TABLE IF NOT EXISTS job_batches (
    id varchar(255) PRIMARY KEY,
    name varchar(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer,
    CONSTRAINT job_batches_total_jobs_non_negative CHECK (total_jobs >= 0),
    CONSTRAINT job_batches_pending_jobs_non_negative CHECK (pending_jobs >= 0),
    CONSTRAINT job_batches_failed_jobs_non_negative CHECK (failed_jobs >= 0)
);

CREATE TABLE IF NOT EXISTS failed_jobs (
    id bigserial PRIMARY KEY,
    uuid varchar(255) NOT NULL UNIQUE,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
