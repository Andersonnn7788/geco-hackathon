#!/bin/bash
# EC2 Setup Script for Infinity8 Coworking Platform
# Run this on a fresh Ubuntu 22.04/24.04 EC2 instance

set -e

echo "=== Infinity8 EC2 Setup Script ==="

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose (standalone)
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
echo "Creating application directory..."
sudo mkdir -p /opt/infinity8
sudo chown $USER:$USER /opt/infinity8

# Install git
sudo apt-get install -y git

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Log out and back in (or run 'newgrp docker') for docker group to take effect"
echo "2. Clone your repository: git clone <your-repo> /opt/infinity8"
echo "3. Copy and configure environment: cp .env.production.template .env.production"
echo "4. Edit .env.production with your credentials"
echo "5. Run: cd /opt/infinity8 && ./deploy/deploy.sh"
echo ""

