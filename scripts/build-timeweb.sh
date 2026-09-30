#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"
ARCHIVE_PATH="$FRONTEND_DIR/timeweb-frontend.zip"
STAGING_DIR="$(mktemp -d "${TMPDIR:-/tmp}/timeweb-build.XXXXXX")"

cleanup() {
  case "$STAGING_DIR" in
    "${TMPDIR:-/tmp}"/timeweb-build.*) rm -rf "$STAGING_DIR" ;;
  esac
}
trap cleanup EXIT

composer_in() {
  local directory="$1"
  shift
  if command -v composer >/dev/null 2>&1; then
    (cd "$directory" && composer "$@")
  elif command -v docker >/dev/null 2>&1; then
    docker run --rm \
      --user "$(id -u):$(id -g)" \
      -e COMPOSER_HOME=/tmp/composer \
      -v "$directory:/app" \
      -w /app \
      composer:2 "$@"
  else
    echo "Composer 2 or Docker is required." >&2
    exit 1
  fi
}

php_in_backend() {
  if command -v php >/dev/null 2>&1; then
    (cd "$BACKEND_DIR" && php "$@")
  else
    docker run --rm \
      --user "$(id -u):$(id -g)" \
      -v "$BACKEND_DIR:/app" \
      -w /app \
      php:8.2-cli php "$@"
  fi
}

echo "Running frontend tests and production build..."
(cd "$FRONTEND_DIR" && npm test && npm run build)

echo "Installing backend development dependencies..."
composer_in "$BACKEND_DIR" install --prefer-dist --no-interaction

echo "Running PHP lint, PHPUnit and PHP 8.2 platform checks..."
while IFS= read -r -d '' php_file; do
  relative_path="${php_file#"$BACKEND_DIR"/}"
  php_in_backend -l "$relative_path" >/dev/null
done < <(find "$BACKEND_DIR/api" "$BACKEND_DIR/src" "$BACKEND_DIR/tests" -type f -name '*.php' -print0)
php_in_backend vendor/bin/phpunit
composer_in "$BACKEND_DIR" check-platform-reqs

echo "Preparing production package..."
cp -R "$FRONTEND_DIR/dist/." "$STAGING_DIR/"
mkdir -p "$STAGING_DIR/api"
cp "$BACKEND_DIR/api/contact.php" "$BACKEND_DIR/api/.htaccess" "$STAGING_DIR/api/"
cp -R "$BACKEND_DIR/src" "$STAGING_DIR/api/src"
cp "$BACKEND_DIR/composer.json" "$BACKEND_DIR/composer.lock" "$STAGING_DIR/api/"
composer_in "$STAGING_DIR/api" install --no-dev --prefer-dist --optimize-autoloader --no-interaction
rm "$STAGING_DIR/api/composer.json" "$STAGING_DIR/api/composer.lock"

if find "$STAGING_DIR" -name 'contact-config.php' -o -path '*/tests/*' | grep -q .; then
  echo "Unsafe files found in the package." >&2
  exit 1
fi

(cd "$STAGING_DIR" && zip -q -r -FS "$ARCHIVE_PATH" .)
unzip -tq "$ARCHIVE_PATH"

echo "Timeweb archive created: $ARCHIVE_PATH"
