#!/bin/sh
set -e

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Cache configuration
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start the server (handled by the base image's entrypoint or command, 
# but we are executing this script, so we likely need to hand off control)
# However, serversideup image usually uses s6-overlay. 
# We can drop this script in /etc/entrypoint.d/ if we want it auto-run,
# OR we can just rely on the standard startup.

# Render might expect a specific CMD.
# For serversideup/php, the default CMD starts s6.
# We can just put our optimization commands here and then exec the CMD.

# Script finished, environment is ready.
