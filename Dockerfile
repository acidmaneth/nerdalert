FROM node:22-alpine

WORKDIR /app

RUN apk update && apk add python3 make gcc g++ libc-dev

COPY . .

# Build the frontend client
WORKDIR /app/client
RUN npm install --legacy-peer-deps
RUN npm run build

# Go back to root directory
WORKDIR /app/server
RUN npm install --legacy-peer-deps

EXPOSE 8080
ENV NODE_ENV=production

# Start the server
CMD ["npm", "run", "dev"]
