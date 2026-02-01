#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --accept-data-loss --url "$DATABASE_URL"

echo "Starting application..."
exec node dist/index.js
