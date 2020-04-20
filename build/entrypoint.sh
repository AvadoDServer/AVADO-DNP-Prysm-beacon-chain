#!/bin/bash

set -u
set -o errexit
set -o pipefail
set -o nounset

COMMAND="app/beacon-chain/image.binary.runfiles/prysm/beacon-chain/linux_amd64_stripped/image.binary --datadir=/data --log-file=/data/beacon-chain.log ${EXTRA_OPTS}"

echo "Starting ${COMMAND}"

${COMMAND}