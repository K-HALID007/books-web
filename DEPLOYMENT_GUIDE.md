# 🚀 Secure Deployment Guide for BookVault

## 📋 Pre-Deployment Checklist

### 1. Security Configuration
- [ ] Generate and set a strong JWT secret (32+ characters)
- [ ] Update MongoDB credentials
- [ ] Set NODE_ENV=production
- [ ] Configure FRONTEND_URL with your actual domain
- [ ] Review all environment variables

### 2. Dependencies
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Update all dependencies to latest secure versions
- [ ] Remove development dependencies from production

### 3. Testing
- [ ] Test all API endpoints
- [ ] Verify file upload functionality
- [ ] Test authentication flows
- [ ] Check rate limiting
- [ ] Validate error handling

## 🔧 Environment Setup

### 1. Generate Secure Secrets

```bash
# Generate JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret (if using sessions)
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Production Environment Variables

Create a `.env.production` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database (CHANGE THESE!)
MONGO_URI=mongodb+srv://your_username:your_secure_password@your_cluster.mongodb.net/your_database?retryWrites=true&w=majority

# Security (CHANGE THESE!)
JWT_SECRET=your_generated_32_character_secret_here
BCRYPT_SALT_ROUNDS=12

# CORS Configuration
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com

# File Upload Limits
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🌐 Deployment Options

### Option 1: Heroku Deployment

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login and Create App**
```bash
heroku login
heroku create your-app-name
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_generated_secret
heroku config:set MONGO_URI=your_mongodb_connection_string
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
```

4. **Deploy**
```bash
git add .
git commit -m "Production deployment"
git push heroku main
```

### Option 2: DigitalOcean App Platform

1. **Create App**
   - Connect your GitHub repository
   - Select Node.js environment
   - Set build command: `npm install`
   - Set run command: `npm start`

2. **Environment Variables**
   - Add all production environment variables
   - Enable "Encrypt" for sensitive values

3. **Domain Configuration**
   - Add your custom domain
   - Enable HTTPS/SSL

### Option 3: AWS EC2 Deployment

1. **Launch EC2 Instance**
```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo/backend

# Install dependencies
npm install --production

# Create production environment file
nano .env.production

# Start with PM2
pm2 start server.js --name "bookvault-api" --env production
pm2 startup
pm2 save
```

3. **Configure Nginx (Reverse Proxy)**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 4: Vercel Deployment

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. **Deploy**
```bash
vercel --prod
```

## 🔒 SSL/HTTPS Configuration

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring Setup

### 1. Application Monitoring

```bash
# Install monitoring packages
npm install --save express-status-monitor

# Add to server.js
import statusMonitor from 'express-status-monitor';
app.use(statusMonitor());
```

### 2. Error Tracking (Sentry)

```bash
npm install --save @sentry/node

# Add to server.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### 3. Log Management

```bash
# Install Winston for logging
npm install --save winston

# Configure logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔧 Performance Optimization

### 1. Enable Compression
Already implemented in security middleware.

### 2. Database Indexing
```javascript
// Add indexes to frequently queried fields
db.users.createIndex({ email: 1 });
db.books.createIndex({ title: "text", author: "text" });
db.pdfbooks.createIndex({ title: "text", author: "text" });
```

### 3. Caching
```bash
# Install Redis for caching
npm install --save redis

# Implement caching middleware
import redis from 'redis';
const client = redis.createClient(process.env.REDIS_URL);
```

## 🚨 Security Hardening

### 1. Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 5000  # Don't expose Node.js port directly
```

### 2. Fail2Ban (Brute Force Protection)
```bash
sudo apt install fail2ban

# Configure for Nginx
sudo nano /etc/fail2ban/jail.local
```

### 3. Regular Updates
```bash
# System updates
sudo apt update && sudo apt upgrade

# Node.js security updates
npm audit fix
```

## 📱 Frontend Deployment

### Next.js Production Build

```bash
cd frontend/books-web-main

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### Environment Variables for Frontend
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## 🔍 Post-Deployment Testing

### 1. Security Tests
```bash
# Test rate limiting
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'

# Test file upload security
curl -X POST https://yourdomain.com/api/pdf-books/upload \
  -F "pdf=@test.txt" \
  -H "Authorization: Bearer invalid-token"
```

### 2. Performance Tests
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API performance
ab -n 100 -c 10 https://yourdomain.com/api/books
```

### 3. SSL Test
Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

## 📞 Support & Maintenance

### 1. Backup Strategy
- Database: Daily automated backups
- Files: Regular file system backups
- Code: Version control with Git

### 2. Monitoring Alerts
- Server downtime
- High error rates
- Unusual traffic patterns
- Failed login attempts

### 3. Update Schedule
- Security patches: Immediate
- Dependencies: Monthly
- Feature updates: Quarterly

---

## 🎉 Deployment Complete!

Your BookVault application is now securely deployed and ready for production use. Remember to:

1. Monitor logs regularly
2. Keep dependencies updated
3. Review security settings periodically
4. Backup data regularly
5. Test disaster recovery procedures

For support, refer to the SECURITY_CHECKLIST.md and monitor your application logs.