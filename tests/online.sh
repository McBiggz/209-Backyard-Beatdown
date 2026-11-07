#!/bin/bash
# runs a local PeerJS server + web server, then the two-browser online test
cd "$(dirname "$0")/.."
node tests/peer_server.cjs >/tmp/peer.log 2>&1 & PP=$!
sleep 2; tests/serve_and.sh python3 tests/online.py "$@"; R=$?; kill $PP; exit $R
