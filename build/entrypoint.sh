#!/bin/bash

set -u
set -o errexit
set -o pipefail
set -o nounset

COMMAND="app/beacon-chain/image.binary.runfiles/prysm/beacon-chain/linux_amd64_stripped/image.binary --rpc-host=0.0.0.0 --rpc-port=4000 --datadir=/data --accept-terms-of-use --grpc-gateway-port 4001 --log-file=/data/beacon-chain.log ${EXTRA_OPTS}"

supervisord -c /etc/supervisord.conf &

echo "Starting ${COMMAND}"

${COMMAND}