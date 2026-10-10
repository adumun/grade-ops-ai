#!/usr/bin/env bash

set -uo pipefail

WEB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PREVIEW_PORT:-3001}"
BASE_URL="http://127.0.0.1:${PORT}"
LOG_FILE="$(mktemp)"
WEB_PID=""

cleanup() {
  if [[ -n "$WEB_PID" ]] && kill -0 "$WEB_PID" 2>/dev/null; then
    kill "$WEB_PID" 2>/dev/null || true
    wait "$WEB_PID" 2>/dev/null || true
  fi
  rm -f "$LOG_FILE"
}
trap cleanup EXIT

echo "==> Starting local-preview on ${BASE_URL}/preview"
(
  cd "$WEB_DIR" || exit 1
  env \
    NEXT_PUBLIC_GRADEOPS_PROFILE=local-preview \
    NEXT_PUBLIC_FIREBASE_API_KEY= \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN= \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID= \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET= \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= \
    NEXT_PUBLIC_FIREBASE_APP_ID= \
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID= \
    NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST= \
    npm run dev -- --hostname 127.0.0.1 --port "$PORT"
) >"$LOG_FILE" 2>&1 &
WEB_PID=$!

for _ in $(seq 1 60); do
  if curl -fsS -o /dev/null "$BASE_URL/preview"; then
    break
  fi
  if ! kill -0 "$WEB_PID" 2>/dev/null; then
    echo "FAIL: local-preview exited before readiness." >&2
    cat "$LOG_FILE" >&2
    exit 1
  fi
  sleep 1
done

if ! curl -fsS -o /dev/null "$BASE_URL/preview"; then
  echo "FAIL: local-preview did not become ready at $BASE_URL/preview." >&2
  cat "$LOG_FILE" >&2
  exit 1
fi

echo "==> Running Playwright preview smoke"
cd "$WEB_DIR" || exit 1
PREVIEW_BASE_URL="$BASE_URL" npx playwright test e2e/preview.spec.ts --config=playwright.preview.config.ts
