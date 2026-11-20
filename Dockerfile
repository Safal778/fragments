
# Lab 6 - Optimized Fragments Microservice Dockerfile

# Use a smaller Node.js base image
FROM node:24-alpine

LABEL description="Fragments Node.js Microservice"

ENV NODE_ENV=production
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Set working directory
WORKDIR /app

# Copy dependency manifests first for Docker layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY --chown=node:node ./src ./src

# Run as a non-root user
USER node

# Document the application port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
