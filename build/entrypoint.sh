#!/bin/bash

set -u
set -o errexit
set -o pipefail
set -o nounset

COMMAND="app/beacon-chain/image.binary.runfiles/prysm/beacon-chain/linux_amd64_stripped/image.binary --datadir=/data --enable-byte-mempool --enable-state-ref-copy --grpc-gateway-port 4001 --log-file=/data/beacon-chain.log ${EXTRA_OPTS}"
#COMMAND="app/beacon-chain/image.binary.runfiles/prysm/beacon-chain/linux_amd64_stripped/image.binary -h"

supervisord -c /etc/supervisord.conf &

#envoy -c /etc/envoy/envoy.yaml &

echo "Starting ${COMMAND}"

${COMMAND}