#!/bin/bash

if [ -d "/home/frappe/frappe-bench/sites" ]; then
    echo "Bench already exists, skipping init"
    cd /home/frappe/frappe-bench
    bench start
    exit 0
fi

echo "Creating new bench..."

bench init --skip-redis-config-generation frappe-bench

cd frappe-bench

# Use containers instead of localhost
bench set-mariadb-host mariadb
bench set-redis-cache-host redis://redis:6379
bench set-redis-queue-host redis://redis:6379
bench set-redis-socketio-host redis://redis:6379

# Remove redis, watch from Procfile
sed -i '/redis/d' ./Procfile
sed -i '/watch/d' ./Procfile

cd apps

# Create proper Frappe app directory structure:
#   apps/axon/          ← app container (pyproject.toml here)
#   apps/axon/axon/     ← Python package (hooks.py, api/, etc.)
mkdir -p ./axon/axon
cp /workspace/pyproject.toml ./axon/pyproject.toml
cp /workspace/README.md ./axon/README.md
cp -r /workspace/axon/. ./axon/axon/

# Install the package (flit_core finds axon/ subdir as the package)
../env/bin/pip install -e ./axon

cd ..
printf '\naxon\n' >> sites/apps.txt

# Create a proper sites/[site_name].txt file to include axon
echo 'frappe
axon' > sites/axon.localhost.txt

# Build axon frontend - vite outputs directly to /workspace/axon/public/axon
# which is already included in the axon package we copied above
cd /workspace/frontend
if [ -f "package.json" ]; then
    yarn install
    yarn build
    # Sync the built frontend into the bench app (vite writes to /workspace/axon/public/axon)
    mkdir -p /home/frappe/frappe-bench/apps/axon/axon/public/axon
    cp -r /workspace/axon/public/axon/. /home/frappe/frappe-bench/apps/axon/axon/public/axon/
    mkdir -p /home/frappe/frappe-bench/apps/axon/axon/www
    cp /workspace/axon/www/axon.html /home/frappe/frappe-bench/apps/axon/axon/www/axon.html 2>/dev/null || true
fi

cd /home/frappe/frappe-bench

bench new-site axon.localhost \
    --force \
    --mariadb-root-password 123 \
    --admin-password admin \
    --no-mariadb-socket

bench --site axon.localhost install-app axon
bench build --app axon
bench --site axon.localhost set-config developer_mode 1
bench --site axon.localhost clear-cache
bench use axon.localhost

bench start