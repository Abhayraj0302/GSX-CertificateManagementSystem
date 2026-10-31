#!/bin/sh
set -e

# If ADMIN_EMAIL is set and AUTO_SEED_ADMIN is not disabled, run seed:admin
if [ -n "$ADMIN_EMAIL" ] && [ "$AUTO_SEED_ADMIN" != "false" ]; then
  echo "=> [Certify] ADMIN_EMAIL is configured ($ADMIN_EMAIL). Initializing admin account..."
  MAX_RETRIES=15
  COUNT=0
  until tsx scripts/seed-admin.ts || [ $COUNT -ge $MAX_RETRIES ]; do
    echo "=> [Certify] Waiting for database to be ready (attempt $((COUNT + 1))/$MAX_RETRIES)..."
    sleep 2
    COUNT=$((COUNT + 1))
  done
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "=> [Certify] Warning: Could not initialize admin account within timeout. Starting server anyway..."
  fi
else
  echo "=> [Certify] ADMIN_EMAIL not set or AUTO_SEED_ADMIN=false. Skipping automated admin seeding."
fi

# Hand over to the main command (CMD)
exec "$@"
