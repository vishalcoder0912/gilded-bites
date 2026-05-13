# Quick Start Guide - No Docker Required

## 🚀 Fast Setup (5 minutes)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed locally

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup PostgreSQL Database
```bash
# Create database
createdb noir_sane

# Or if you need to start PostgreSQL first:
# macOS: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql
```

### Step 3: Setup Database & Start App
```bash
# One command to setup everything
npm run setup:db

# Start the application
npm run dev
```

That's it! 🎉

## 📱 Access Points
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:4000  
- **API Documentation**: http://localhost:4000/docs

## 🔑 Default Login
- **Admin**: admin@noirsane.com / Admin@12345
- **User**: Register any email/password
- **Delivery**: delivery@noirsane.com / Admin@12345

## 🛠️ Troubleshooting

### Database Connection Issues
If you get "Route not found" errors, the database isn't connected:

1. **Check PostgreSQL is running**:
   ```bash
   pg_isready
   ```

2. **Create database if missing**:
   ```bash
   createdb noir_sane
   ```

3. **Update .env file** with your PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/noir_sane?schema=public"
   ```

4. **Re-run setup**:
   ```bash
   npm run setup:db
   ```

### Port Already in Use
If port 4000 or 8080 is busy, the app will automatically use alternative ports.

### Frontend Shows "Route not found"
This means the backend can't connect to the database. Follow the database troubleshooting steps above.

## 📚 Need More Details?
See the full README.md for comprehensive documentation.
