#!/bin/bash

SETTINGSFILE=$1

if [ ! -f "${SETTINGSFILE}" ]; then
  echo "Starting with default settings"
  cp /opt/prysm/defaultsettings.json ${SETTINGSFILE}
fi

NETWORK=$(cat ${SETTINGSFILE} | jq -r '."network"')
GRAFFITI=$(cat ${SETTINGSFILE} | jq -r '."validators_graffiti"')
EE_ENDPOINT=$(cat ${SETTINGSFILE} | jq -r '."ee_endpoint"')
VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT=$(cat ${SETTINGSFILE} | jq -r '."validators_proposer_default_fee_recipient" // empty')
MEV_BOOST_ENABLED=$(cat ${SETTINGSFILE} | jq -r '."mev_boost" // empty')

# Get JWT Token
JWT_SECRET="/data/jwttoken"
getJwtTokenPath () {
  echo $(cat ${SETTINGSFILE} | jq -r 'if has("jwttokenpath") then ."jwttokenpath" else "https://ethchain-geth.my.ava.do/jwttoken" end')
}
until $(curl --silent --fail $(getJwtTokenPath) --output "${JWT_SECRET}"); do
  echo "Waiting for the JWT Token"
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
  --execution-endpoint=${EE_ENDPOINT} \
  --grpc-gateway-corsdomain="*" \
  ${VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT:+--suggested-fee-recipient=${VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT}} \
  ${MEV_BOOST_ENABLED:+--http-mev-relay=http://mevboost.my.ava.do:18550} \
  ${EXTRA_OPTS}
