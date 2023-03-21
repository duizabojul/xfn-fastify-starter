FROM alpine
RUN apk add --update --no-cache curl


ENTRYPOINT [ "curl" ]
CMD [ "-X", "POST", "-H", "Content-Type: application/yaml", "--data-binary", "@-", "http://xfn-api.crossplane-system.svc.cluster.local:3000/1/xfn" ]
