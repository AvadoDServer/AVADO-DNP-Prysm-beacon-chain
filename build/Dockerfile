ARG PRYSM_VERSION
FROM node:16.15.0 as builder

# build wizard
WORKDIR /usr/src/app/wizard
COPY wizard .
RUN yarn
RUN rm -Rf build && yarn run build


# build monitor
WORKDIR /usr/src/monitor
COPY monitor .
RUN yarn
RUN rm -Rf build && yarn run build

FROM --platform=linux/amd64 gcr.io/prysmaticlabs/prysm/beacon-chain:${PRYSM_VERSION} as prysm

FROM --platform=linux/amd64 debian:bullseye-slim

RUN apt update && \
    apt install -y \
    bash \
    ca-certificates \
    jq \
    nginx \
    nodejs \
    supervisor \
    vim-tiny \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd nginx

# Instal node v18.15.0
RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && . /root/.nvm/nvm.sh \
    && nvm install v18.15.0 \
    && nvm use v18.15.0
    
COPY --from=prysm /app/cmd/beacon-chain/beacon-chain /bin/beaconchain

VOLUME /data

# copy wizard
COPY --from=builder /usr/src/app/wizard/build /usr/local/wizard
COPY --from=builder /usr/src/monitor /usr/local/monitor

COPY startPrysmBeaconchain.sh /opt/prysm/
COPY monitor/settings/defaultsettings.json /opt/prysm
RUN chmod a+x /opt/prysm/startPrysmBeaconchain.sh
COPY supervisord.conf /etc/supervisord.conf
COPY nginx.conf /etc/nginx/

USER root
WORKDIR /
ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisord.conf"]

