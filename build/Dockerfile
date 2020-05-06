FROM gcr.io/prysmaticlabs/prysm/beacon-chain:latest as binary

# FROM alpine

# WORKDIR /
# COPY --from=binary / .

# ADD entrypoint.sh /entrypoint.sh
# RUN chmod 755 /entrypoint.sh


# ENTRYPOINT /entrypoint.sh


#FROM envoyproxy/envoy-alpine:v1.14.1 as envoy



# FROM alpine
# RUN apk add --no-cache bash

FROM alpine

# RUN addgroup -g 1000 -S www-data \
#  && adduser -u 1000 -D -S -G www-data www-data

#RUN adduser nginx --disabled-password --home /

RUN apk add --no-cache supervisor nginx bash

# RUN apt update && \ 
#     apt install -y ca-certificates nginx bash supervisor && \
#     rm -rf /var/lib/apt/lists/*


COPY --from=binary / .

# Add config files
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

ADD ./entrypoint.sh /entrypoint
#ADD ./envoy.yaml /etc/envoy/envoy.yaml

RUN chmod a+x /entrypoint

ENTRYPOINT /entrypoint
#/entrypoint
