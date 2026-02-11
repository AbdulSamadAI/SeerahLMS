# 📚 PropheticPD - 10-Week Personal Development Program

Complete Learning Management System with Admin Panel

## ✨ Features

### Student Dashboard
- 📊 Progress tracking with donut charts
- 📹 Video player in modal (no page reload)
- 📝 Animated quizzes with instant feedback
- 🎯 Challenge submissions
- 💭 Weekly reflections
- 📈 Personal progress page
- 🔍 Course explorer

### Admin Panel
- 📊 Comprehensive dashboard with 10+ statistics
- 🏆 Top students leaderboard
- 📈 Weekly participation charts
- 📋 Complete CRUD for 11 database tables
- 👥 User management
- 📹 Video content management
- 📝 Quiz creation with options
- 🎯 Challenge management

### Security
- 🔐 Role-based access control
- 🛡️ SQL injection prevention
- 🔒 XSS protection
- 📁 .htaccess security
- 🚫 PHP execution blocked in uploads

### Performance
- ⚡ Modal-based interactions (10x faster)
- 💨 GZIP compression
- 📦 Browser caching
- 🎯 Optimized database queries

## 📦 What's Included

```
PropheticPD/
├── 📄 index.php              # Login (all roles)
├── 📄 config.php             # Database config
├── 📄 logout.php             # Logout handler
│
├── 👨‍🎓 Student Dashboard
│   ├── dashboard.php          # Main dashboard
│   ├── my-progress.php       # Progress tracking
│   ├── explore-course.php    # Course explorer
│   └── profile.php           # User profile
│
├── 🔄 AJAX Handlers
│   ├── ajax-video.php
│   ├── ajax-quiz.php
│   ├── ajax-challenge.php
│   ├── ajax-reflection.php
│   └── ajax-submit-*.php
│
├── 🔐 Admin Panel
│   └── Admin/
│       ├── index.php
│       ├── admin-dashboard.php
│       └── admin-crud.php
│
├── 🛠️ Configuration
│   ├── .htaccess
│   ├── update-database.sql
│   └── INSTALLATION.md
│
└── 📚 Documentation
    ├── README.md
    └── USER_GUIDE.md
```

## 🚀 Quick Start

### 1. Upload Files
Upload all files to your web server

### 2. Configure Database
Edit `config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_user');
define('DB_PASS', 'your_password');
define('DB_NAME', 'your_database');
```

### 3. Run Database Migration
In phpMyAdmin, run: `update-database.sql`

### 4. Login
- **Admin:** ahmed@email.com
- **Student:** faisal@email.com / student123

## 📖 Full Documentation

See `INSTALLATION.md` for detailed setup instructions.
See `USER_GUIDE.md` for usage instructions.

## 🔧 Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache with mod_rewrite
- 512MB memory limit (recommended)

## 🎯 Key Features

- ✅ Complete admin panel
- ✅ Student progress tracking
- ✅ Modal-based interactions
- ✅ Animated quiz feedback
- ✅ Role-based access
- ✅ Secure file uploads
- ✅ Responsive design
- ✅ Production-ready

## 📞 Support

For issues or questions, check the documentation files included.

## 📜 License

Educational use only.

---

**PropheticPD** - Transforming lives through prophetic principles 🌟
