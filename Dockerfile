FROM php:8.3-fpm

# System dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev \
    libzip-dev libicu-dev nginx supervisor \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Nginx config
COPY nginx/default.conf /etc/nginx/sites-available/default

# Supervisor config
COPY supervisor.conf /etc/supervisor/conf.d/app.conf

# Copy project
COPY . .

# Install deps & build
RUN composer install --no-dev --optimize-autoloader --no-interaction
RUN npm ci && npm run build

# PHP upload limits
RUN echo "upload_max_filesize = 100M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 120M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

# Permissions
RUN chown -R www-data:www-data /var/www/html/public \
    && chown -R www-data:www-data /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/app.conf"]
