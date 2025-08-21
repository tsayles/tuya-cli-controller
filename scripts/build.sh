#!/bin/bash
# Build script for Tuya Device Controller

set -e

APP_NAME="tuya-controller"
VERSION="${1:-latest}"
PLATFORM="${2:-linux/amd64,linux/arm64}"

echo "🏗️  Building Tuya Device Controller"
echo "   Version: $VERSION"
echo "   Platform: $PLATFORM"

# Check if Docker buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo "❌ Docker buildx not available. Please enable buildx."
    exit 1
fi

# Create buildx builder if it doesn't exist
if ! docker buildx inspect multiarch > /dev/null 2>&1; then
    echo "🔧 Creating multiarch builder..."
    docker buildx create --name multiarch --use
fi

# Build the image
echo "📦 Building Docker image..."
docker buildx build \
    --platform $PLATFORM \
    --tag $APP_NAME:$VERSION \
    --tag $APP_NAME:latest \
    --load \
    .

echo "✅ Build complete!"
echo "   Image: $APP_NAME:$VERSION"
echo ""
echo "🚀 Next steps:"
echo "   Run locally: docker run -p 80:80 $APP_NAME:$VERSION"
echo "   Deploy: ./scripts/deploy.sh $VERSION"