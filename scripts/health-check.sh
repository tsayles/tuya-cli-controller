#!/bin/bash
# Health check script for Tuya Device Controller

APP_URL="${1:-http://localhost}"
TIMEOUT="${2:-30}"

echo "🔍 Checking application health..."
echo "   URL: $APP_URL"
echo "   Timeout: ${TIMEOUT}s"

# Function to check if URL is responding
check_health() {
    local url=$1
    local max_attempts=$((TIMEOUT / 2))
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -n "   Attempt $attempt/$max_attempts: "
        
        if curl -f -s "$url/health" > /dev/null 2>&1; then
            echo "✅ Healthy"
            return 0
        elif curl -f -s "$url" > /dev/null 2>&1; then
            echo "⚠️  Responding but no health endpoint"
            return 0
        else
            echo "❌ Not responding"
        fi
        
        sleep 2
        ((attempt++))
    done
    
    return 1
}

# Check main application
if check_health "$APP_URL"; then
    echo ""
    echo "🎉 Application is healthy!"
    
    # Additional checks
    echo ""
    echo "📊 Additional checks:"
    
    # Check if it's actually the Tuya controller
    if curl -s "$APP_URL" | grep -q "Tuya Device Controller" > /dev/null 2>&1; then
        echo "   ✅ Correct application detected"
    else
        echo "   ⚠️  Application title not found"
    fi
    
    # Check response time
    response_time=$(curl -o /dev/null -s -w "%{time_total}" "$APP_URL")
    echo "   📈 Response time: ${response_time}s"
    
    exit 0
else
    echo ""
    echo "❌ Application is not healthy"
    echo ""
    echo "🔧 Troubleshooting tips:"
    echo "   - Check if the application is running"
    echo "   - Verify the URL is correct"
    echo "   - Check Docker container status: docker ps"
    echo "   - View logs: docker-compose logs -f"
    
    exit 1
fi