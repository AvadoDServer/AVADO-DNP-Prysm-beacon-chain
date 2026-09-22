#!/bin/bash

SETTINGSFILE=$1

if [ ! -f "${SETTINGSFILE}" ]; then
  echo "Starting with default settings"
  cp /opt/prysm/defaultsettings.json ${SETTINGSFILE}
  FRESH_SETTINGS=true
fi

NETWORK=$(cat ${SETTINGSFILE} | jq -r '."network"')

# Execution engine auto-detection. The default settings name Geth, so a box running
# another execution client needed a manual pick in the wizard. On a fresh install use
# the engine that actually answers; on an existing install only switch when the
# configured engine's package is gone (its hostname stops resolving) and exactly one
# other known engine answers, so an installed engine that is slow to start is kept.
# The candidates match the execution engines the wizard offers for each network.
case ${NETWORK} in
"mainnet")
  EE_CANDIDATES="ethchain-geth.public.dappnode.eth|http://ethchain-geth.my.ava.do:8551 reth-mainnet.avado.dnp.dappnode.eth|http://reth-mainnet.my.ava.do:8551 avado-dnp-nethermind.public.dappnode.eth|http://avado-dnp-nethermind.my.ava.do:8551"
  ;;
"prater")
  EE_CANDIDATES="goerli-geth.avado.dnp.dappnode.eth|http://goerli-geth.my.ava.do:8551 nethermind-goerli.avado.dnp.dappnode.eth|http://nethermind-goerli.my.ava.do:8551"
  ;;
"gnosis")
  EE_CANDIDATES="nethermind-gnosis.avado.dnp.dappnode.eth|http://nethermind-gnosis.my.ava.do:8551"
  ;;
*)
  EE_CANDIDATES=""
  ;;
esac

ee_answers() {
  # the engine API answers 401 without a JWT; any HTTP response means it is up
  curl --silent --output /dev/null --max-time 3 "$1"
}

set_execution_engine() {
  jq --arg pkg "$1" --arg ee "$2" '.execution_engine = $pkg | .ee_endpoint = $ee' "${SETTINGSFILE}" >"${SETTINGSFILE}.tmp" && mv "${SETTINGSFILE}.tmp" "${SETTINGSFILE}"
  echo "Execution engine: using $1 ($2)"
}

detect_execution_engine() {
  local current_pkg current_ee current_host entry pkg ee answering count i
  [ -z "${EE_CANDIDATES}" ] && return
  current_pkg=$(jq -r '."execution_engine" // empty' "${SETTINGSFILE}")
  current_ee=$(jq -r '."ee_endpoint" // empty' "${SETTINGSFILE}")

  if [ "${FRESH_SETTINGS}" = true ]; then
    for i in $(seq 1 12); do
      answering=""
      for entry in ${EE_CANDIDATES}; do
        pkg=${entry%%|*}
        ee=${entry#*|}
        if ee_answers "${ee}"; then
          [ "${pkg}" = "${current_pkg}" ] && { set_execution_engine "${pkg}" "${ee}"; return; }
          [ -z "${answering}" ] && answering="${entry}"
        fi
      done
      if [ -n "${answering}" ]; then
        set_execution_engine "${answering%%|*}" "${answering#*|}"
        return
      fi
      echo "Execution engine: waiting for an execution client to answer"
      sleep 5
    done
    echo "Execution engine: no execution client answered, keeping ${current_pkg}. Install one and pick it in the settings."
    return
  fi

  current_host=$(echo "${current_ee}" | sed -E 's#^[a-z]+://([^:/]+).*#\1#')
  for i in $(seq 1 18); do
    getent hosts "${current_host}" >/dev/null && return
    sleep 5
  done
  answering=""
  count=0
  for entry in ${EE_CANDIDATES}; do
    [ "${entry%%|*}" = "${current_pkg}" ] && continue
    if ee_answers "${entry#*|}"; then
      answering="${entry}"
      count=$((count + 1))
    fi
  done
  if [ "${count}" -eq 1 ]; then
    echo "Execution engine: ${current_pkg} is not installed"
    set_execution_engine "${answering%%|*}" "${answering#*|}"
  else
    echo "Execution engine: ${current_pkg} (${current_host}) is not reachable. Check that it is installed and running."
  fi
}

detect_execution_engine

GRAFFITI=$(cat ${SETTINGSFILE} | jq -r '."validators_graffiti"')
EE_ENDPOINT=$(cat ${SETTINGSFILE} | jq -r '."ee_endpoint"')
VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT=$(cat ${SETTINGSFILE} | jq -r '."validators_proposer_default_fee_recipient" // empty')
MEV_BOOST_ENABLED=$(cat ${SETTINGSFILE} | jq -r '."mev_boost" // empty')
CHECKPOINT_SYNC_URL=$(cat ${SETTINGSFILE} | jq -r '."initial_state" // empty')

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
  P2P_QUIC_PORT=13007
  ;;
*)
  P2P_TCP_PORT=13000
  P2P_UDP_PORT=12000
  P2P_QUIC_PORT=13000
  ;;
esac

# Start Prysm Beacon Chain
exec /bin/beaconchain \
  --jwt-secret="${JWT_SECRET}" \
  --${NETWORK} \
  --datadir=/data \
  --rpc-host=0.0.0.0 \
  --http-host=0.0.0.0 \
  --monitoring-host=0.0.0.0 \
  --http-port=3500 \
  --accept-terms-of-use \
  --p2p-tcp-port=${P2P_TCP_PORT} \
  --p2p-udp-port=${P2P_UDP_PORT} \
  --p2p-quic-port=${P2P_QUIC_PORT} \
  --execution-endpoint=${EE_ENDPOINT} \
  --http-cors-domain="*" \
  ${CHECKPOINT_SYNC_URL:+--checkpoint-sync-url=${CHECKPOINT_SYNC_URL}} \
  ${CHECKPOINT_SYNC_URL:+--genesis-beacon-api-url=${CHECKPOINT_SYNC_URL}} \
  ${VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT:+--suggested-fee-recipient=${VALIDATORS_PROPOSER_DEFAULT_FEE_RECIPIENT}} \
  ${MEV_BOOST_ENABLED:+--http-mev-relay=http://mevboost.my.ava.do:18550} \
  ${EXTRA_OPTS}
