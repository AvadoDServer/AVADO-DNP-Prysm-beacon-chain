#!/bin/bash

set -u
set -o errexit
set -o pipefail
set -o nounset

COMMAND="/bin/beaconchain \
  --mainnet \
  --datadir=/data \
  --rpc-host=0.0.0.0 \
  --grpc-gateway-host=0.0.0.0 \
  --monitoring-host=0.0.0.0 \
  --grpc-gateway-port=3500 \
  --accept-terms-of-use \
  $EXTRA_OPTS"

supervisord -c /etc/supervisord.conf &

echo "Starting ${COMMAND}"

${COMMAND}