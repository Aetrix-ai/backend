#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."
until nc -z "$DB_HOST" "${DB_PORT:-5432}"; do
  echo "  PostgreSQL not ready yet, retrying in 2s..."
  sleep 2
done
echo "✅ PostgreSQL is ready."

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting server..."
exec "$@"

# Made with Bob
