# ============================================================
# Stage 1: Composer dependencies
# ============================================================
FROM composer:2.8 AS composer-deps

WORKDIR /app

# Copy only the files Composer needs first — maximises layer cache hits.
# The vendor directory is NOT in the repo, so this layer only rebuilds
# when composer.json or composer.lock changes.
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader

# Now copy the rest of the application so post-install scripts can run
COPY . .

RUN composer run-script post-autoload-dump

# ============================================================
# Stage 2: Node / Vite asset build
# ============================================================
FROM node:22-alpine AS node-build

WORKDIR /app

# Copy package manifests first for layer cache
COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

# Copy source files needed for the Vite build
COPY resources/ resources/
COPY public/      public/
COPY vite.config.ts tsconfig.json ./
# Wayfinder generates route helpers into resources/js — we need the
# generated file if it was already committed; otherwise artisan wayfinder:generate
# would need to run here. For CI we assume it's committed.
COPY routes/ routes/

# Production Vite build — outputs to public/build/
RUN npm run build

# ============================================================
# Stage 3: Final PHP-FPM production image
# ============================================================
FROM php:8.3-fpm-alpine AS production

# Install required PHP extensions and system dependencies
RUN apk add --no-cache \
        libpng-dev \
        libjpeg-turbo-dev \
        libwebp-dev \
        freetype-dev \
        oniguruma-dev \
        libzip-dev \
        icu-dev \
        $PHPIZE_DEPS \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        pdo_sqlite \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl \
        opcache \
    # Install Redis extension via PECL
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS \
    && rm -rf /tmp/pear

# PHP-FPM and OPcache tuning for production
COPY docker/php/php-production.ini /usr/local/etc/php/conf.d/99-production.ini
COPY docker/php/www.conf           /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www/html

# Create the www-data user directories Laravel needs
RUN mkdir -p storage/framework/{cache,sessions,views} \
             storage/logs \
             bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy application code — the unprivileged www-data user will own it
COPY --chown=www-data:www-data --from=composer-deps /app/vendor ./vendor
COPY --chown=www-data:www-data --from=composer-deps /app         .

# Overwrite public/build with the compiled Vite assets from the node stage
COPY --chown=www-data:www-data --from=node-build /app/public/build ./public/build

# Remove dev/local-only files that don't belong in the image
RUN rm -rf \
    .env \
    .env.example \
    tests/ \
    .github/ \
    docker-compose* \
    compose.yaml \
    node_modules \
    .windsurf

# SECURITY: never bake a real APP_KEY into the image.
# Pass all secrets via environment variables at runtime (docker run -e / compose env_file).
ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    OPCACHE_ENABLE=1

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
