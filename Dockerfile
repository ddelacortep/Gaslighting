# Usamos una imagen ligera de PHP 8.3/8.4 (Laravel 12 requiere PHP 8.2+)
FROM php:8.3-fpm-alpine

# Instalar dependencias del sistema y extensiones de PHP para PostgreSQL
RUN apk add --no-cache \
    postgresql-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl

RUN docker-php-ext-install pdo pdo_pgsql bcmath gd zip

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Directorio de trabajo
WORKDIR /var/www

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias de PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permisos para Laravel
RUN chown -R www-data:www-data /var/www/storage /var/www/cache

EXPOSE 9000

CMD ["php-fpm"]