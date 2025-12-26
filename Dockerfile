# Build stage for frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirement first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy built frontend files
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/src /usr/share/nginx/html/src
# Copy backend files
COPY api.py .
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && chown -R 101:101 /app /usr/share/nginx/html

# Environment variables
ENV RUM_CLIENT_TOKEN=""
ENV RUM_APPLICATION_ID=""
ENV RUM_SITE=""
ENV RUM_SERVICE="demo-rum"
ENV RUM_ENV="production"
ENV RUM_VERSION="0.0.10"
ENV RUM_ORGANIZATION_IDENTIFIER="default"
ENV RUM_INSECURE_HTTP="false"
ENV RUM_API_VERSION="v1"

EXPOSE 8000

# Use a shell script to generate config and run uvicorn
ENTRYPOINT ["/docker-entrypoint.sh"]
