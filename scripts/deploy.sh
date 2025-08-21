#!/bin/bash
# Deployment script for Tuya Device Controller

set -e

# Configuration
APP_NAME="tuya-controller"
REGISTRY="ghcr.io"
IMAGE_TAG="${1:-latest}"
COMPOSE_FILE="${2:-docker-compose.yml}"

echo "🚀 Deploying Tuya Device Controller"
echo "   Image tag: $IMAGE_TAG"
echo "   Compose file: $COMPOSE_FILE"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose exists
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install Docker Compose."
    exit 1
fi

# Pull latest image if using registry
if [[ $IMAGE_TAG != "latest" ]] || [[ ! $(docker images -q $REGISTRY/$APP_NAME:$IMAGE_TAG 2> /dev/null) ]]; then
    echo "📦 Pulling Docker image..."
    docker pull $REGISTRY/$APP_NAME:$IMAGE_TAG || {
        echo "⚠️  Failed to pull image. Building locally..."
        docker build -t $REGISTRY/$APP_NAME:$IMAGE_TAG .
    }
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down --remove-orphans

# Start new containers
echo "▶️  Starting containers..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for health check
echo "🔍 Waiting for application to be healthy..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Application failed to start within expected time"
        docker-compose -f $COMPOSE_FILE logs
        exit 1
    fi
    
    echo "   Attempt $attempt/$max_attempts - waiting..."
    sleep 2
    ((attempt++))
done

# Show status
echo "📊 Container status:"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "🎉 Deployment complete!"
echo "   Application URL: http://localhost"
echo "   Health check: http://localhost/health"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   Stop app: docker-compose -f $COMPOSE_FILE down"
echo "   Restart: docker-compose -f $COMPOSE_FILE restart"