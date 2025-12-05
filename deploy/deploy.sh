#!/bin/bash
# Deployment script for Infinity8 Coworking Platform
# Run from the project root directory

set -e

echo "=== Infinity8 Deployment Script ==="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "Error: .env.production file not found!"
    echo "Please copy .env.production.template to .env.production and configure it."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Create nginx ssl directory if it doesn't exist
mkdir -p nginx/ssl

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo "Pulling latest changes..."
    git pull origin main || true
fi

# Build and start containers
echo "Building and starting containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Run database migrations / seed data
echo "Running database seed (if needed)..."
docker-compose -f docker-compose.prod.yml exec -T backend python -m app.seed || true

# Show status
echo ""
echo "=== Deployment Complete ==="
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "Services should be available at:"
echo "  - Frontend: http://YOUR_EC2_IP"
echo "  - Backend API: http://YOUR_EC2_IP/docs"
echo ""
echo "Default admin login:"
echo "  - Email: admin@infinity8.my"
echo "  - Password: admin123"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"


