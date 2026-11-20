
# Lab 5 - Dockerfile for Fragments Microservice

# Use the same Node.js version as our local environment
FROM node:24.21.0

# Image metadata
LABEL description="Fragments Node.js Microservice"

# Set environment variables
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY ./src ./src

# Document the application port
EXPOSE 8080

# Start the Fragments server
CMD ["npm", "start"]
