FROM node:22-slim

# Run as the built-in `node` user (uid 1000). The codegen plugin WRITES generated sources
# back into /app/src, which compose bind-mounts from the host - as root those files come
# out root-owned and the host's own `yarn dev` can no longer rewrite them (EACCES).
# node:22-slim's `node` user is uid/gid 1000, which matches a typical Linux host user.
WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

EXPOSE 5173

CMD ["yarn", "dev", "--mode", "docker", "--host", "0.0.0.0", "--port", "5173"]
