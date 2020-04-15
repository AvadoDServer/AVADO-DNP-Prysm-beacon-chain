FROM gcr.io/prysmaticlabs/prysm/beacon-chain:latest as binary
ENTRYPOINT ["/app/beacon-chain/image.binary","--datadir=/data --log-file=/data/beacon-chain.log"]

#ARG VERSION
#FROM gcr.io/prysmaticlabs/prysm/beacon-chain:latest

# FROM alpine

# # Install dependencies
# RUN apk --update add bash ca-certificates libc6-compat gcompat libstdc++ libgcc && \
#     rm  -rf /tmp/* /var/cache/apk/*

# COPY --from=binary /app/beacon-chain/image.binary /usr/local/bin/beacon-chain

#ENTRYPOINT [ "beacon-chain", " --datadir=/data --log-file=/data/beacon-chain.log $EXTRA_OPTS" ]