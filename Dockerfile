FROM node:22-alpine

RUN corepack enable
RUN apk add --no-cache git

USER node
WORKDIR /home/node/kanji-flashcards
RUN mkdir -p node_modules .next

CMD ["sleep", "infinity"]
