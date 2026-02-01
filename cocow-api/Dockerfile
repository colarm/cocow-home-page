# cocow-api/Dockerfile
FROM node:20-alpine
WORKDIR /app

# copy package files and install dependencies
COPY package*.json ./
RUN npm install

# copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# copy the rest of the application code and build
COPY . .
RUN npx tsc

# copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

# use entrypoint to run migrations before starting
ENTRYPOINT ["docker-entrypoint.sh"]
