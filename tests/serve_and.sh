#!/bin/bash
# usage: tests/serve_and.sh <command...>   (serves dist/ on :8766 while the command runs)
cd "$(dirname "$0")/.." && (cd dist && python3 -m http.server 8766 >/dev/null 2>&1) & SP=$!
sleep 1; "$@"; R=$?; kill $SP 2>/dev/null; exit $R
