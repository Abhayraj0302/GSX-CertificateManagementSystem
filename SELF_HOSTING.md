# 🚀 Self-Hosting Guide for Certify

This comprehensive guide covers how to deploy and self-host the **Certify** (GSX-CertificateManagementSystem) platform in production using Docker and Docker Compose.

---

## 🏗️ Architecture Overview

The self-hosted architecture consists of:
- **`app` (`certify:latest`)**: Multi-stage Next.js 16 standalone production build running on Node.js 22 LTS as an unprivileged system user (`nextjs:nodejs`).
- **`mongodb` (`mongo:7`)**: Dedicated MongoDB database container with healthchecks and persistent storage in the `certify_mongodb_data` Docker volume.
- **Reverse Proxy (Optional / Recommended for HTTPS)**:
  - **Caddy**: Zero-configuration automated Let's Encrypt SSL/TLS certificates.
  - **Nginx**: Production Nginx reverse proxy with 50MB payload limits and custom SSL certificates.

---

## 📋 Prerequisites

Before starting, ensure your host server has:
- **Docker Engine** (v24.0 or newer)
- **Docker Compose** (v2.20 or newer, plugin `docker compose`)
- A public domain name pointed to your server IP (e.g., `certificates.yourdomain.com`)
- A **Google Cloud Platform** account (for OAuth 2.0 sign-in)
- A **Cloudinary** account (free tier works, used for certificate template backgrounds and logos)
- A transactional email provider (Mailtrap or Resend)

---

## ⚡ 3-Minute Quickstart

### 1. Prepare Environment File
Copy the example configuration file:
```bash
cp .env.example .env
```

### 2. Generate NextAuth Secret
Generate a cryptographic 32-byte secret:
```bash
openssl rand -base64 32
```
Paste this into `.env` as `NEXTAUTH_SECRET`.

### 3. Configure Minimal Variables in `.env`
Open `.env` and fill in the required fields:
```env
NEXTAUTH_URL=http://localhost:3000   # or https://yourdomain.com
NEXTAUTH_SECRET=your_generated_secret
ADMIN_EMAIL=your-google-email@gmail.com
ADMIN_NAME=Your Name

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Start the Application
Launch both the application and database in detached mode:
```bash
docker compose up -d
```

Certify will automatically:
1. Start MongoDB and wait for its healthcheck to pass.
2. Verify and initialize the admin account specified in `ADMIN_EMAIL`.
3. Start the Next.js server on port `3000`.

Access the application at [http://localhost:3000](http://localhost:3000).

---

## 🔐 External Service Setup

### 1. Google OAuth 2.0 (Required for Authentication)
Certify uses Google OAuth for secure single sign-on:
1. Open the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a new project (e.g., `Certify Self-Host`).
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - User Type: **External**
   - App Name: `Certify`
   - User support email & Developer contact: your email.
   - Scopes: add `openid`, `.../auth/userinfo.email`, and `.../auth/userinfo.profile`.
4. Navigate to **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Application type: **Web application**
   - Name: `Certify Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for local development)
     - `https://certificates.yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for local development)
     - `https://certificates.yourdomain.com/api/auth/callback/google` (for production)
5. Copy the **Client ID** and **Client Secret** into your `.env` file.

### 2. Cloudinary Setup (Required for Certificate Backgrounds)
1. Register at [cloudinary.com](https://cloudinary.com).
2. Go to your **Dashboard**.
3. Copy **Cloud Name**, **API Key**, and **API Secret** into `.env`.

### 3. Email Delivery (Mailtrap or Resend)
- **Mailtrap**: Provide `MAILTRAP_TOKEN` in `.env`.
- **Resend**: Provide `RESEND_API_KEY` in `.env`.
- Set `EMAIL_FROM_ADDRESS` to a verified sender domain (e.g., `certificates@yourdomain.com`).

---

## 🔒 Production Deployment with HTTPS & Reverse Proxy

### Option A: Automatic SSL with Caddy (Recommended)
Caddy automatically obtains and renews Let's Encrypt SSL/TLS certificates with zero manual intervention.

1. In `.env`, set:
   ```env
   DOMAIN=certificates.yourdomain.com
   NEXTAUTH_URL=https://certificates.yourdomain.com
   ```
2. Start the stack with the Caddy overlay:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.caddy.yml up -d
   ```
Ports `80` and `443` will be bound automatically, with HTTP traffic redirected to HTTPS.

---

### Option B: Nginx with Custom SSL Certificates

1. Place your SSL certificate and private key in:
   - `deploy/nginx/certs/fullchain.pem`
   - `deploy/nginx/certs/privkey.pem`
2. Update `deploy/nginx/nginx.conf` with your SSL block or use the default HTTP reverse proxy.
3. Start the stack with the Nginx overlay:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.nginx.yml up -d
   ```

---

### Option C: External Reverse Proxy (Cloudflare / Nginx Proxy Manager / Traefik)
If you already run a reverse proxy on your server:
1. Keep the standard `docker-compose.yml` (`docker compose up -d`).
2. Point your existing reverse proxy upstream to `http://127.0.0.1:3000`.
3. Ensure your reverse proxy forwards headers:
   ```nginx
   proxy_set_header Host $host;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   client_max_body_size 50M;
   ```

---

## 🛠️ Administrative Operations

### Adding & Seeding Admin Users
Admin accounts are granted based on verified Google email addresses.

To add new admin accounts:
1. Update `ADMIN_EMAIL` in `.env` with comma-separated emails:
   ```env
   ADMIN_EMAIL=primary@example.com,organizer2@example.com
   ```
2. Run the admin seed script:
   ```bash
   docker compose exec app tsx scripts/seed-admin.ts
   ```

### Viewing Application Logs
```bash
# View combined logs
docker compose logs -f

# View application logs only
docker compose logs -f app

# View MongoDB logs only
docker compose logs -f mongodb
```

### Database Backups & Restore

#### 1. Creating a Database Backup
```bash
docker compose exec mongodb mongodump --db certify --out /data/db/backup_$(date +%F)
```
The backup will be stored inside the persistent volume at `/data/db/backup_*`.

To copy the backup to the host machine:
```bash
docker compose cp mongodb:/data/db/backup_$(date +%F) ./mongodb_backups/
```

#### 2. Restoring from a Backup
```bash
docker compose cp ./mongodb_backups/backup_2026-10-31 mongodb:/tmp/backup
docker compose exec mongodb mongorestore --db certify /tmp/backup/certify
```

---

## 🔄 Updates and Upgrades

To update Certify to the latest version:

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild the application container
docker compose build app

# 3. Restart services with minimal downtime
docker compose up -d --force-recreate app
```

---

## ❓ Frequently Asked Questions (FAQ) & Troubleshooting

### 1. `OAuthSignin` / `redirect_uri_mismatch` Error
- **Cause**: Google Cloud Console authorized redirect URIs do not match `NEXTAUTH_URL`.
- **Fix**: Verify that `NEXTAUTH_URL` exactly matches the origin in your browser (including `https://` and no trailing slash) and that `https://yourdomain.com/api/auth/callback/google` is added to Google Console.

### 2. Can I run MongoDB on a separate host / MongoDB Atlas?
- **Yes**: In `.env`, set:
  ```env
  MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/certify?retryWrites=true&w=majority
  ```
  Then stop the local MongoDB service if desired:
  ```bash
  docker compose stop mongodb
  ```

### 3. File Uploads (Certificates / CSVs) Fail
- Ensure your reverse proxy allows larger payloads (`client_max_body_size 50M;` in Nginx or `request_body { max_size 50MB }` in Caddy).

### 4. Restarting the Stack
```bash
# Stop all services
docker compose down

# Start all services
docker compose up -d
```
