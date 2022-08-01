#!/bin/bash

SETTINGSFILE=$1

if [ ! -f "${SETTINGSFILE}" ]; then
  echo "Starting with default settings"
  cp /opt/prysm/defaultsettings.json ${SETTINGSFILE}
fi

NETWORK=$(cat ${SETTINGSFILE} | jq -r '."network"')
GRAFFITI=$(cat ${SETTINGSFILE} | jq -r '."validators_graffiti"')
EE_ENDPOINT=$(cat ${SETTINGSFILE} | jq -r '."ee_endpoint"')
ETH1_ENDPOINTS=$(cat ${SETTINGSFILE} | jq -r '."eth1_endpoints"|join(",")')
VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT=$(cat ${SETTINGSFILE} | jq -r '."validators_proposer_default_fee_recipient" // empty')


# Get JWT Token
JWT_SECRET="/data/jwttoken"
JWT_TOKEN_PATH=$(cat ${SETTINGSFILE} | jq -r '."jwttokenpath"')
until $(curl --silent --fail ${JWT_TOKEN_PATH} --output "${JWT_SECRET}"); do
  echo "Waiting for Geth package to generate the JWT Token"
  sleep 5
done

# Start Prysm Beacon Chain
exec /bin/beaconchain \
  --jwt-secret="${JWT_SECRET}" \
  --mainnet \
  --datadir=/data \
  --rpc-host=0.0.0.0 \
  --grpc-gateway-host=0.0.0.0 \
  --monitoring-host=0.0.0.0 \
  --grpc-gateway-port=3500 \
  --accept-terms-of-use \
  --http-web3provider=${ETH1_ENDPOINTS} \
  --execution-endpoint=${EE_ENDPOINT} \
  --grpc-gateway-corsdomain="*" \
  ${VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT:+--suggested-fee-recipient=${VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT}} \
  ${EXTRA_OPTS}
