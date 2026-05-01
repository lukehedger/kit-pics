#!/usr/bin/env bash
# Upload all kit images from kits-source/ to the R2 bucket bound to KITS.
#
# Requires: wrangler authenticated (`wrangler login`) and the bucket
# `kit-pics-images` to exist (`wrangler r2 bucket create kit-pics-images`).
#
# Run from repo root: ./scripts/upload-r2.sh

set -euo pipefail

BUCKET="${R2_BUCKET:-kit-pics-images}"
SRC_DIR="${1:-kits-source}"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "source dir not found: $SRC_DIR" >&2
  exit 1
fi

count=0
for f in "$SRC_DIR"/*.png; do
  [[ -e "$f" ]] || continue
  key="$(basename "$f")"
  wrangler r2 object put "$BUCKET/$key" \
    --file "$f" \
    --content-type "image/png" \
    --remote
  count=$((count + 1))
done

echo "Uploaded $count objects to r2://$BUCKET"
