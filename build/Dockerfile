ARG PRYSM_VERSION
FROM node:16.15.0 as builder

# build wizard
WORKDIR /usr/src/app/wizard
COPY wizard .
RUN yarn
RUN rm -Rf build && yarn run build

FROM --platform=linux/amd64 gcr.io/prysmaticlabs/prysm/beacon-chain:${PRYSM_VERSION} as prysm

FROM --platform=linux/amd64 debian:buster-slim

RUN apt update && \
    apt install -y \
    bash \
    ca-certificates \
    jq \
    nginx \
    supervisor \
    vim-tiny \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd nginx

COPY --from=prysm /app/cmd/beacon-chain/beacon-chain /bin/beaconchain

VOLUME /data

# copy wizard
COPY --from=builder /usr/src/app/wizard/build /usr/local/wizard


COPY startPrysmBeaconchain.sh /opt/prysm/
COPY wizard/src/components/defaultsettings.json /opt/prysm
RUN chmod a+x /opt/prysm/startPrysmBeaconchain.sh
COPY supervisord.conf /etc/supervisord.conf
COPY nginx.conf /etc/nginx/

USER root
WORKDIR /
ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisord.conf"]

