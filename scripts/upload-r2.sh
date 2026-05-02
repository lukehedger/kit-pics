#!/usr/bin/env bash
# Upload all kit images from kits-source/ to the R2 bucket bound to KITS.
#
# Requires: wrangler authenticated (`wrangler login`) and the bucket
# `kit-pics-images` to exist (`wrangler r2 bucket create kit-pics-images`).
#
# Run from repo root: ./scripts/upload-r2.sh
# Idempotent: wrangler r2 object put overwrites, so re-running is safe.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$SCRIPT_DIR/../node_modules/.bin:$PATH"

BUCKET="${R2_BUCKET:-kit-pics-images}"
SRC_DIR="${1:-kits-source}"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "source dir not found: $SRC_DIR" >&2
  exit 1
fi

shopt -s nullglob
files=("$SRC_DIR"/*.png)
total=${#files[@]}
if (( total == 0 )); then
  echo "no .png files found in $SRC_DIR" >&2
  exit 1
fi

echo "Uploading $total objects to r2://$BUCKET"

ok=0
fail=0
failed_keys=()
i=0
for f in "${files[@]}"; do
  i=$((i + 1))
  key="$(basename "$f")"
  if wrangler r2 object put "$BUCKET/$key" \
      --file "$f" \
      --content-type "image/png" \
      --remote \
      --force \
      </dev/null >/dev/null; then
    ok=$((ok + 1))
  else
    fail=$((fail + 1))
    failed_keys+=("$key")
    echo "  fail ($i/$total): $key" >&2
  fi
  if (( i % 50 == 0 )); then
    echo "  progress $i/$total (ok=$ok fail=$fail)"
  fi
done

echo
echo "Done: $ok / $total uploaded to r2://$BUCKET (failed: $fail)"
if (( fail > 0 )); then
  printf '  failed key: %s\n' "${failed_keys[@]}" >&2
  exit 1
fi
