# Build Stage: Compile Frontend Assets
# Use PHP 8.4 CLI as base to match dependency requirements
FROM serversideup/php:8.4-cli AS node_build

WORKDIR /app

# Switch to root to install Node.js
USER root

# Install Node.js 20 and unzip
RUN apt-get update && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs unzip

COPY package*.json ./
COPY vite.config.ts ./
COPY composer.json composer.lock ./

# Install Composer dependencies
# We use the composer installed in the image
RUN composer install --no-dev --no-scripts --no-progress --prefer-dist

RUN npm ci
COPY resources ./resources
COPY public ./public
COPY . . 
RUN npm run build

# Production Stage: PHP & Nginx
FROM serversideup/php:8.4-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Switch to root to install dependencies and modify permissions
USER root

# Copy project files
COPY . .

# Copy built assets from node_build stage
COPY --from=node_build /app/public/build ./public/build

# Install Composer dependencies (no-dev for production)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Fix permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Ensure upload directory exists and is writable
RUN mkdir -p /var/www/html/public/images/items && \
    chown -R www-data:www-data /var/www/html/public/images/items

# Copy deployment script to auto-run on startup
COPY deployment.sh /etc/entrypoint.d/99-deploy.sh
RUN chmod +x /etc/entrypoint.d/99-deploy.sh

# Switch back to non-root user
USER www-data

# Expose port
EXPOSE 8080
