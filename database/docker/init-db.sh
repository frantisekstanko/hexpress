#!/bin/bash

set -euo pipefail

mariadb -uroot -p"${MARIADB_ROOT_PASSWORD}" <<-EOSQL
    GRANT CREATE ON *.* TO '${MARIADB_USER}'@'%';
    GRANT ALL PRIVILEGES ON *.* TO '${MARIADB_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL
