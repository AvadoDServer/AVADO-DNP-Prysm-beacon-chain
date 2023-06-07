#!/bin/bash

NETWORK=$1

case ${NETWORK} in
"prater" | "mainnet") ;;
*)
  echo "Invalid network"
  exit
  ;;
esac

for file in \
  build/docker-compose.yml \
  build/avatar.png \
  dappnode_package.json \
  build/monitor/settings/defaultsettings.json; do
  BASENAME=${file%.*}
  EXT=${file##*.}
  # echo $BASENAME
  # echo $EXT
  rm -f $file
  ln ${BASENAME}-${NETWORK}.${EXT} $file
done
