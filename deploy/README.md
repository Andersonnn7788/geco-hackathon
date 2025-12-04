# Infinity8 AWS Deployment Guide

This guide explains how to deploy the Infinity8 Coworking Space Platform to AWS EC2.

## Prerequisites

1. AWS Account with access to:
   - EC2
   - Amazon Bedrock (Amazon Nova Pro enabled in us-east-1)
   
2. AWS credentials with Bedrock access

## Step 1: Launch EC2 Instance

1. Go to AWS Console > EC2 > Launch Instance
2. Choose:
   - **AMI**: Ubuntu Server 22.04 LTS or 24.04 LTS
   - **Instance Type**: t3.medium (minimum) or t3.large (recommended)
   - **Storage**: 20GB gp3
   
3. Configure Security Group:
   - SSH (22): Your IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0

4. Create/select a key pair for SSH access

## Step 2: Connect and Setup

SSH into your instance:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Run the setup script:

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/deploy/ec2-setup.sh | bash

# Log out and back in for docker group to take effect
exit
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## Step 3: Clone and Configure

```bash
# Clone your repository
cd /opt/infinity8
git clone https://github.com/YOUR_REPO/geco-hackathon.git .

# Create production environment file
nano .env.production
```

Add these contents to `.env.production`:

```env
# Database
POSTGRES_USER=infinity8
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE
POSTGRES_DB=infinity8_db

# JWT Secret (generate with: openssl rand -hex 32)
SECRET_KEY=YOUR_RANDOM_SECRET_HERE

# AWS Bedrock Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0

# Frontend API URL (your EC2 public IP or domain)
NEXT_PUBLIC_API_BASE_URL=http://YOUR_EC2_PUBLIC_IP
```

## Step 4: Deploy

```bash
# Make scripts executable
chmod +x deploy/*.sh

# Deploy!
./deploy/deploy.sh
```

## Step 5: Verify

1. Open your browser to `http://YOUR_EC2_PUBLIC_IP`
2. You should see the Infinity8 homepage
3. Try the AI chat assistant
4. Test login with:
   - Admin: `admin@infinity8.my` / `admin123`
   - User: `user@demo.com` / `user123`

## Useful Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
./deploy/stop.sh

# Re-deploy after code changes
./deploy/deploy.sh
```

## Troubleshooting

### AI Chat Not Working

1. Check Bedrock access:
```bash
docker-compose -f docker-compose.prod.yml logs backend | grep -i bedrock
```

2. Verify AWS credentials are correct in `.env.production`

3. Ensure Amazon Nova Pro is enabled in your AWS account:
   - Go to AWS Console > Bedrock > Model Access
   - Request access to Amazon Nova models

### Database Issues

```bash
# Access database
docker-compose -f docker-compose.prod.yml exec db psql -U infinity8 -d infinity8_db

# Reset database (WARNING: deletes all data)
docker-compose -f docker-compose.prod.yml down -v
./deploy/deploy.sh
```

### Frontend Not Loading

1. Check if backend is healthy:
```bash
curl http://localhost:8000/health
```

2. Check frontend logs:
```bash
docker-compose -f docker-compose.prod.yml logs frontend
```

## Security Notes

For production:
1. Use a domain with SSL certificate (Let's Encrypt)
2. Change default passwords
3. Restrict EC2 security group SSH access
4. Consider using AWS Secrets Manager for credentials
5. Enable CloudWatch for monitoring

