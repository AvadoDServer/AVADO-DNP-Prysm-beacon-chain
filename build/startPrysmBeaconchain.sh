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
until $(curl --silent --fail "http://dappmanager.my.ava.do/jwttoken.txt" --output "${JWT_SECRET}"); do
  echo "Waiting for the JWT Token"
  sleep 5
done

case ${NETWORK} in
  "prater")
    P2P_TCP_PORT=13007
    P2P_UDP_PORT=12007
    CHECKPOINT_SYNC_URL=https://goerli.checkpoint-sync.ethdevops.io
    GENESIS_BEACON_API_URL=https://goerli.checkpoint-sync.ethdevops.io
    ;;
  *)
    P2P_TCP_PORT=13000
    P2P_UDP_PORT=12000
    ;;
esac

# Start Prysm Beacon Chain
exec /bin/beaconchain \
  --jwt-secret="${JWT_SECRET}" \
  --${NETWORK} \
  --datadir=/data \
  --rpc-host=0.0.0.0 \
  --grpc-gateway-host=0.0.0.0 \
  --monitoring-host=0.0.0.0 \
  --grpc-gateway-port=3500 \
  --accept-terms-of-use \
  --p2p-tcp-port=${P2P_TCP_PORT} \
  --p2p-udp-port=${P2P_UDP_PORT} \
  --execution-endpoint=${EE_ENDPOINT} \
  --grpc-gateway-corsdomain="*" \
  ${CHECKPOINT_SYNC_URL:+--checkpoint-sync-url=https://goerli.checkpoint-sync.ethdevops.io=${CHECKPOINT_SYNC_URL}} \
  ${GENESIS_BEACON_API_URL:+--genesis-beacon-api-url=https://goerli.checkpoint-sync.ethdevops.io=${GENESIS_BEACON_API_URL}} \
  ${VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT:+--suggested-fee-recipient=${VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT}} \
  ${MEV_BOOST_ENABLED:+--http-mev-relay=http://mevboost.my.ava.do:18550} \
  ${EXTRA_OPTS}
