FROM alpine as base
RUN apk add --update --no-cache nodejs npm

WORKDIR /home

ADD package.json .
ADD package-lock.json .
RUN npm ci --no-optional

ADD . .
RUN npm run build

########################################################################################################################

FROM alpine as development
RUN apk add --update --no-cache nodejs npm

WORKDIR /home

COPY --from=base /home .

ENTRYPOINT ["npm", "run"]
CMD ["shell"]

########################################################################################################################

FROM alpine as prepare-production
RUN apk add --update --no-cache nodejs npm

WORKDIR /home
COPY --from=base /home .
RUN npm prune --production

########################################################################################################################

FROM alpine as production
RUN apk add --update --no-cache nodejs npm
WORKDIR /home

COPY --from=prepare-production /home .

ENTRYPOINT ["npm", "run"]
CMD ["start"]
