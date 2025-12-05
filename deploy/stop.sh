#!/bin/bash
# Stop Infinity8 services

echo "Stopping Infinity8 services..."
docker-compose -f docker-compose.prod.yml down

echo "Services stopped."


