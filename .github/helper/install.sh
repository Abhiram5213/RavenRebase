#!/bin/bash
set -e
cd ~ || exit

echo "Setting Up Bench..."

pip install frappe-bench
bench -v init frappe-bench --skip-assets --python "$(which python)"
cd ./frappe-bench || exit

bench -v setup requirements

echo "Setting Up Axon..."
bench get-app axon "${GITHUB_WORKSPACE}"

echo "Setting Up Sites & Database..."

mkdir ~/frappe-bench/sites/axon.localhost
cp "${GITHUB_WORKSPACE}/.github/helper/site_config.json" ~/frappe-bench/sites/axon.localhost/site_config.json


mariadb --host 127.0.0.1 --port 3306 -u root -p123 -e "SET GLOBAL character_set_server = 'utf8mb4'";
mariadb --host 127.0.0.1 --port 3306 -u root -p123 -e "SET GLOBAL collation_server = 'utf8mb4_unicode_ci'";

mariadb --host 127.0.0.1 --port 3306 -u root -p123 -e "CREATE DATABASE test_axon";
mariadb --host 127.0.0.1 --port 3306 -u root -p123 -e "CREATE USER 'test_axon'@'localhost' IDENTIFIED BY 'test_axon'";
mariadb --host 127.0.0.1 --port 3306 -u root -p123 -e "GRANT ALL PRIVILEGES ON \`test_axon\`.* TO 'test_axon'@'localhost'";

mariadb --host 127.0.0.1 --port 3306 -u root -p123 -e "FLUSH PRIVILEGES";

echo "Setting Up Procfile..."

sed -i 's/^watch:/# watch:/g' Procfile
sed -i 's/^schedule:/# schedule:/g' Procfile

echo "Starting Bench..."

bench start &> bench_start.log &

CI=Yes bench build &
build_pid=$!

bench --site axon.localhost reinstall --yes
bench --site axon.localhost install-app axon

wait $build_pid