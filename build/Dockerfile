FROM gcr.io/prysmaticlabs/prysm/beacon-chain:latest as binary

# FROM alpine

# WORKDIR /
# COPY --from=binary / .

# ADD entrypoint.sh /entrypoint.sh
# RUN chmod 755 /entrypoint.sh


# ENTRYPOINT /entrypoint.sh





FROM alpine
RUN apk add --no-cache bash
COPY --from=binary / .

ADD ./entrypoint.sh /entrypoint
RUN chmod a+x /entrypoint

ENTRYPOINT /entrypoint
#/entrypoint
