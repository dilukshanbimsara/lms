# Deployment Guide — TutioLMS

> **Target:** AWS EC2 · Ubuntu 22.04 LTS · Mumbai Region (`ap-south-1`)
> **Stack:** Next.js (frontend) · NestJS (backend) · PostgreSQL · Nginx · PM2

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [AWS EC2 Instance Setup](#2-aws-ec2-instance-setup)
3. [Environment Setup](#3-environment-setup)
   - [Node.js v18](#31-nodejs-v18)
   - [PostgreSQL](#32-postgresql)
   - [Nginx](#33-nginx)
   - [PM2](#34-pm2)
4. [Project Setup](#4-project-setup)
5. [Database Configuration](#5-database-configuration)
6. [Environment Variables](#6-environment-variables)
7. [Prisma Migration](#7-prisma-migration)
8. [Building the Application](#8-building-the-application)
9. [PM2 Process Management](#9-pm2-process-management)
10. [Nginx Reverse Proxy](#10-nginx-reverse-proxy)
11. [Troubleshooting](#11-troubleshooting)
12. [Release Process — යාවත්කාලීන කිරීමේ ක්‍රියාවලිය](#12-release-process--යාවත්කාලීන-කිරීමේ-ක්‍රියාවලිය)

---

## 1. Prerequisites

Before starting, ensure you have:

- An AWS account with an EC2 instance running **Ubuntu 22.04 LTS**
- A registered domain name (optional but recommended)
- SSH access to your EC2 instance
- Your project repository URL

---

## 2. AWS EC2 Instance Setup

### 2.1 Recommended Instance Type

| Resource | Minimum        | Recommended     |
|----------|----------------|-----------------|
| Type     | `t3.small`     | `t3.medium`     |
| vCPUs    | 2              | 2               |
| RAM      | 2 GB           | 4 GB            |
| Storage  | 20 GB SSD      | 30 GB SSD       |

### 2.2 Security Group Rules

Configure the following **Inbound Rules** in your EC2 Security Group:

| Port | Protocol | Source        | Purpose                          |
|------|----------|---------------|----------------------------------|
| 22   | TCP      | Your IP only  | SSH access                       |
| 80   | TCP      | 0.0.0.0/0    | HTTP (Nginx public traffic)      |
| 443  | TCP      | 0.0.0.0/0    | HTTPS (if SSL is configured)     |
| 5555 | TCP      | Your IP only  | Prisma Studio (admin use only)   |

> **Security note:** Never expose port 5555 to `0.0.0.0/0`. Restrict it to your own IP address only.

### 2.3 Connect to Your Instance

```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Once connected, update the system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 3. Environment Setup

### 3.1 Node.js v18

Install Node.js v18 via the NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify the installation:

```bash
node -v   # Expected: v18.x.x
npm -v    # Expected: 9.x.x or higher
```

### 3.2 PostgreSQL

Install and start PostgreSQL:

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Verify the service is running:

```bash
sudo systemctl status postgresql
```

### 3.3 Nginx

Install and enable Nginx:

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.4 PM2

Install PM2 globally:

```bash
sudo npm install -g pm2
```

---

## 4. Project Setup

### 4.1 Install Git and Clone the Repository

```bash
sudo apt install -y git
cd /home/ubuntu
git clone https://github.com/<your-username>/lms.git
cd lms
```

### 4.2 Install Dependencies

Install dependencies for the **frontend** (Next.js) from the project root:

```bash
npm install
```

Install dependencies for the **backend** (NestJS):

```bash
cd backend-reference
npm install
cd ..
```

---

## 5. Database Configuration

### 5.1 Create the Database and User

Switch to the PostgreSQL superuser and open the interactive terminal:

```bash
sudo -i -u postgres
psql
```

Run the following SQL commands to create the database and a dedicated user:

```sql
CREATE DATABASE tutioriolms;
CREATE USER lmsuser WITH PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE tutioriolms TO lmsuser;
```

### 5.2 Fix — `permission denied for schema public`

On PostgreSQL 15+, the default `public` schema privileges were tightened. If Prisma migrations fail with a `permission denied for schema public` error, run the following inside the `tutioriolms` database:

```bash
# While still in psql, connect to the new database
\c tutioriolms
```

```sql
GRANT ALL ON SCHEMA public TO lmsuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lmsuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lmsuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lmsuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lmsuser;
```

Exit the PostgreSQL shell:

```sql
\q
```

Then exit the postgres user session:

```bash
exit
```

### 5.3 Verify the Connection

Test that the new user can connect:

```bash
psql -U lmsuser -h localhost -d tutioriolms -W
```

---

## 6. Environment Variables

### 6.1 Frontend — Next.js (`.env` in project root)

Create the environment file:

```bash
cd /home/ubuntu/lms
nano .env
```

Add the following variables:

```env
# Database (used by Prisma in Next.js server components)
DATABASE_URL="postgresql://lmsuser:your_strong_password_here@localhost:5432/tutioriolms"

# Backend API URL (used by the frontend to call the NestJS API)
NEXT_PUBLIC_API_URL="http://<EC2_PUBLIC_IP_OR_DOMAIN>"
```

### 6.2 Backend — NestJS (`.env` in `backend-reference/`)

```bash
cd /home/ubuntu/lms/backend-reference
nano .env
```

```env
# Database
DATABASE_URL="postgresql://lmsuser:your_strong_password_here@localhost:5432/tutioriolms"

# JWT
JWT_SECRET="your_very_long_and_random_jwt_secret_here"
JWT_EXPIRES_IN="7d"

# Server port
PORT=4000
```

> **Important:** Both `.env` files must use the **same `DATABASE_URL`** to ensure the admin panel and public pages share a single database.

---

## 7. Prisma Migration

All Prisma commands are run from the project root where `prisma/schema.prisma` lives.

```bash
cd /home/ubuntu/lms
```

### 7.1 Generate the Prisma Client

```bash
npx prisma generate
```

### 7.2 Run Database Migrations

```bash
npx prisma migrate deploy
```

> `migrate deploy` applies all pending migrations without prompting — safe for production environments.

### 7.3 Verify the Migration (Optional)

```bash
npx prisma db pull   # Confirms schema is in sync with the database
```

### 7.4 Seed Initial Data (If Applicable)

```bash
npx prisma db seed
```

---

## 8. Building the Application

### 8.1 Build the Next.js Frontend

```bash
cd /home/ubuntu/lms
npm run build
```

A successful build produces a `.next/` directory in the project root.

### 8.2 Build the NestJS Backend

```bash
cd /home/ubuntu/lms/backend-reference
npm run build
```

A successful build produces a `dist/` directory inside `backend-reference/`.

---

## 9. PM2 Process Management

Use PM2 to run both applications as persistent background processes that survive server reboots.

### 9.1 Start the Backend (NestJS — Port 4000)

```bash
cd /home/ubuntu/lms/backend-reference
pm2 start dist/main.js --name "tutiolms-backend"
```

### 9.2 Start the Frontend (Next.js — Port 3000)

```bash
cd /home/ubuntu/lms
pm2 start npm --name "tutiolms-frontend" -- start
```

### 9.3 Save the PM2 Process List and Enable Autostart

```bash
pm2 save
pm2 startup
```

PM2 will print a command to run — copy and execute it. It looks like:

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 9.4 Useful PM2 Commands

```bash
pm2 list                          # View all running processes
pm2 logs tutiolms-backend         # Tail backend logs
pm2 logs tutiolms-frontend        # Tail frontend logs
pm2 restart tutiolms-backend      # Restart the backend
pm2 restart tutiolms-frontend     # Restart the frontend
pm2 stop all                      # Stop all processes
pm2 monit                         # Live process monitor
```

---

## 10. Nginx Reverse Proxy

Nginx listens on port 80 and routes traffic to the correct application:

| Path prefix | Proxied to                    |
|-------------|-------------------------------|
| `/api/*`    | NestJS backend — port `4000`  |
| `/*`        | Next.js frontend — port `3000`|

### 10.1 Create the Nginx Site Configuration

```bash
sudo nano /etc/nginx/sites-available/tutiolms
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name <EC2_PUBLIC_IP_OR_DOMAIN>;

    # ── Backend API (NestJS) ──────────────────────────────────────
    location /api/ {
        proxy_pass         http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # ── Frontend (Next.js) ────────────────────────────────────────
    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 10.2 Enable the Site and Reload Nginx

```bash
# Enable the site by creating a symlink
sudo ln -s /etc/nginx/sites-available/tutiolms /etc/nginx/sites-enabled/

# Remove the default site to avoid conflicts
sudo rm /etc/nginx/sites-enabled/default

# Test the configuration syntax
sudo nginx -t

# Reload Nginx to apply changes
sudo systemctl reload nginx
```

### 10.3 Verify

Open a browser and navigate to `http://<EC2_PUBLIC_IP>`. The TutioLMS home page should load.

---

## 11. Troubleshooting

### 11.1 Port Not Accessible from Browser

**Symptom:** The site does not load at `http://<EC2_PUBLIC_IP>`.

**Checklist:**
1. Confirm the EC2 Security Group has port **80** open to `0.0.0.0/0`.
2. Confirm Nginx is running: `sudo systemctl status nginx`
3. Confirm PM2 processes are up: `pm2 list`
4. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

---

### 11.2 `permission denied for schema public` (Prisma)

**Symptom:** `npx prisma migrate deploy` fails with a schema permission error.

**Fix:** Run the grant commands from [Section 5.2](#52-fix--permission-denied-for-schema-public) inside the `tutioriolms` database as the `postgres` superuser.

---

### 11.3 Backend Crashes on Startup

**Symptom:** `pm2 logs tutiolms-backend` shows connection errors or missing env vars.

**Checklist:**
1. Ensure `/home/ubuntu/lms/backend-reference/.env` exists and is correct.
2. Verify PostgreSQL is running: `sudo systemctl status postgresql`
3. Test the DB connection: `psql -U lmsuser -h localhost -d tutioriolms -W`
4. Confirm `npm run build` completed without errors in `backend-reference/`.

---

### 11.4 Next.js Build Fails

**Symptom:** `npm run build` exits with a compilation error.

**Checklist:**
1. Ensure `/home/ubuntu/lms/.env` has a valid `DATABASE_URL`.
2. Run `npx prisma generate` before building — the build requires the Prisma client.
3. Check Node.js version: `node -v` — must be **v18**.

---

### 11.5 Prisma Studio Access (Port 5555)

To inspect the database visually:

```bash
cd /home/ubuntu/lms
npx prisma studio
```

Prisma Studio runs on `http://<EC2_PUBLIC_IP>:5555`.

> **Security:** Ensure port **5555** in the EC2 Security Group is restricted to **your IP address only**. Never leave it open to the public.

---

### 11.6 Useful System Commands

```bash
# Check what process is using a port
sudo lsof -i :3000
sudo lsof -i :4000

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View system resource usage
htop

# Restart all services after a reboot
pm2 resurrect
sudo systemctl restart nginx
```

---

## Deployment Checklist

Before going live, verify each item:

- [ ] EC2 Security Group ports 22, 80 configured correctly; 5555 restricted to your IP
- [ ] Node.js v18 installed
- [ ] PostgreSQL running with `tutioriolms` database and `lmsuser` created
- [ ] Schema public permissions granted to `lmsuser`
- [ ] Both `.env` files created with matching `DATABASE_URL`
- [ ] `npx prisma generate` completed successfully
- [ ] `npx prisma migrate deploy` completed successfully
- [ ] `npm run build` succeeded for both frontend and backend
- [ ] Both PM2 processes are running (`pm2 list`)
- [ ] PM2 startup hook saved (`pm2 save && pm2 startup`)
- [ ] Nginx config passes syntax test (`sudo nginx -t`)
- [ ] Site loads at `http://<EC2_PUBLIC_IP>`

---

---

## 12. Release Process — යාවත්කාලීන කිරීමේ ක්‍රියාවලිය

> නව features, bug fixes හෝ වෙනත් code changes production server එකට deploy කිරීමේදී මෙම ක්‍රියාවලිය අනුගමනය කරන්න.

---

### පියවර 1 — ලෝකල් මැෂිමේ සිට GitHub වෙත Push කිරීම

> ඔබේ local machine එකේ සිදු කළ සියලු code වෙනස්කම් GitHub repository එකට push කරන්න.

```bash
# වෙනස් වූ files stage කරන්න
git add .

# Commit message සමඟ commit කරන්න
git commit -m "your descriptive commit message"

# GitHub main branch එකට push කරන්න
git push origin main
```

> **සටහන:** Pull request workflow භාවිත කරන්නේ නම්, feature branch push කර GitHub හරහා merge කරන්න. Deploy කරන්නේ `main` branch merge වූ පසු පමණි.

---

### පියවර 2 — EC2 Server එකට SSH මගින් ඇතුළු වීම

> ඔබේ local machine එකෙන් EC2 instance එකට SSH connection එකක් ආරම්භ කරන්න.

```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

### පියවර 3 — නවතම Code Pull කිරීම

> GitHub repository එකෙන් නවතම code EC2 server එකට download කරන්න.

```bash
cd /home/ubuntu/lms
git pull origin main
```

---

### පියවර 4 — Dependencies යාවත්කාලීන කිරීම

> නව packages හෝ version changes තිබේ නම් ඒවා install කරන්න. නව dependencies නොමැති නම් මෙම පියවර skip කළ හැක, නමුත් ඇතුළත් කිරීම ආරක්ෂිතයි.

**Frontend dependencies (project root):**

```bash
cd /home/ubuntu/lms
npm install
```

**Backend dependencies:**

```bash
cd /home/ubuntu/lms/backend-reference
npm install
```

---

### පියවර 5 — Prisma Client සහ Migrations යාවත්කාලීන කිරීම

> Database schema changes (`prisma/schema.prisma`) deploy කිරීමට සහ Prisma client නැවත generate කිරීමට මෙම commands run කරන්න. Schema වෙනස් නොවූ releases සඳහාද මෙම commands run කිරීම ආරක්ෂිතයි.

```bash
cd /home/ubuntu/lms

# Prisma client නැවත generate කරන්න
npx prisma generate

# Pending migrations database එකට apply කරන්න
npx prisma migrate deploy
```

---

### පියවර 6 — Project නැවත Build කිරීම

> Code changes production-ready bundle එකක් ලෙස compile කිරීමට frontend සහ backend දෙකම build කළ යුතුය.

**Backend build (NestJS):**

```bash
cd /home/ubuntu/lms/backend-reference
npm run build
```

**Frontend build (Next.js):**

```bash
cd /home/ubuntu/lms
npm run build
```

> Build process සාර්ථකව නිම නොවූ විට PM2 restart **නොකරන්න**. Build error log හොඳින් කියවා error නිරාකරණය කරන්න.

---

### පියවර 7 — PM2 මගින් Applications නැවත ආරම්භ කිරීම

> නව build artifacts සක්‍රිය කිරීමට frontend සහ backend processes නැවත restart කරන්න.

```bash
# Backend restart කරන්න
pm2 restart tutiolms-backend

# Frontend restart කරන්න
pm2 restart tutiolms-frontend

# Processes running status confirm කරන්න
pm2 list
```

---

### පියවර 8 — Deploy සාර්ථකව සිදු වූවාදැයි Verify කිරීම

> Browser හරහා application check කරන්න. Logs හරහා errors නොමැති බව confirm කරන්න.

```bash
# Real-time logs පරීක්ෂා කරන්න
pm2 logs tutiolms-backend --lines 50
pm2 logs tutiolms-frontend --lines 50

# Browser හරහා site open කරන්න
# http://<EC2_PUBLIC_IP>
```

---

### Release Checklist

> EC2 server එකේ සෑම release එකක් සඳහාම මෙම checklist follow කරන්න:

- [ ] `git pull origin main` — නවතම code pull කරන ලදි
- [ ] `npm install` — dependencies යාවත්කාලීන කරන ලදි (frontend + backend)
- [ ] `npx prisma generate` — Prisma client generate කරන ලදි
- [ ] `npx prisma migrate deploy` — Migrations apply කරන ලදි
- [ ] `npm run build` — Backend build සාර්ථකයි
- [ ] `npm run build` — Frontend build සාර්ථකයි
- [ ] `pm2 restart` — Processes නැවත ආරම්භ කරන ලදි
- [ ] Browser හරහා site verify කරන ලදි

---

### ස්වයංක්‍රීය Release Script — `release.sh`

> EC2 server side steps සියල්ල single command එකකින් ක්‍රියාත්මක කිරීම සඳහා `release.sh` script භාවිත කරන්න.

**Script setup (EC2 server සිදු කරන්න — එකවරක් පමණි):**

```bash
# Project root එකේ release.sh create කරන්න
nano /home/ubuntu/lms/release.sh
```

Script file path `release.sh` — project root (/home/ubuntu/lms/) හි ඇත.

**Script execute කිරීමේ permission දෙන්න:**

```bash
chmod +x /home/ubuntu/lms/release.sh
```

**Release deploy කිරීමට:**

```bash
cd /home/ubuntu/lms
./release.sh
```

> Script ක්‍රියාත්මක වන විට සෑම step එකක් සාර්ථකව නිම නොවූ විට ස්වයංක්‍රීයව නතර වේ (`set -e`). Build fail වූ විට PM2 restart **නොවේ** — application live state එකෙහිම පවතී.

---

*Generated for TutioLMS — AWS EC2 Ubuntu 22.04 · ap-south-1 (Mumbai)*
