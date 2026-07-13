FROM node:22-slim

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 5173

CMD ["yarn", "dev", "--mode", "docker", "--host", "0.0.0.0", "--port", "5173"]
