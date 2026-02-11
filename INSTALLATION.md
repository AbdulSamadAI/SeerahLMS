# 🚀 PropheticPD Installation Guide

Complete step-by-step installation instructions.

## 📋 Prerequisites

Before installation, ensure you have:
- ✅ Web hosting with PHP 7.4+ and MySQL 5.7+
- ✅ FTP/cPanel access to your server
- ✅ phpMyAdmin or MySQL access
- ✅ Text editor (for config.php)

---

## 📦 Step 1: Upload Files

### Using FTP:
1. Extract the zip file locally
2. Connect to your server via FTP
3. Upload all files to `public_html` or web root
4. Maintain the directory structure

### Using cPanel:
1. Go to File Manager
2. Navigate to `public_html`
3. Upload the zip file
4. Extract it
5. Move files to root if needed

---

## ⚙️ Step 2: Configure Database

### Create Database:
1. Go to phpMyAdmin
2. Create new database: `propheticpd` (or your choice)
3. Note down database name

### Update config.php:
1. Open `config.php` in text editor
2. Update these lines:
```php
define('DB_HOST', 'localhost');          // Usually localhost
define('DB_USER', 'your_database_user'); // Your DB username
define('DB_PASS', 'your_database_pass'); // Your DB password  
define('DB_NAME', 'propheticpd');        // Your DB name
define('SITE_URL', 'yourdomain.com');    // Your domain
```
3. Save and re-upload

---

## 🗄️ Step 3: Import Database

### Get Database File:
Your database file should already exist on your server.
If not, you need to import your existing database first.

### Run Migration:
1. Open phpMyAdmin
2. Select your database
3. Go to SQL tab
4. Open `update-database.sql` file
5. Copy all contents
6. Paste in SQL textarea
7. Click "Go" button
8. Wait for success message

---

## 🔒 Step 4: Set Permissions

### File Permissions:
```bash
# Directories
chmod 755 Admin/
chmod 755 uploads/

# PHP Files
chmod 644 *.php
chmod 644 Admin/*.php

# .htaccess Files
chmod 644 .htaccess
chmod 644 Admin/.htaccess
chmod 644 uploads/.htaccess

# Config File (more restrictive)
chmod 600 config.php
```

### Via cPanel:
1. Go to File Manager
2. Right-click folder/file
3. Select "Change Permissions"
4. Set as above

---

## ✅ Step 5: Verify Installation

### Test Website:
1. Visit: `https://yourdomain.com`
2. Should show login page
3. No errors should appear

### Test Admin Access:
1. Login with: `ahmed@email.com` (no password)
2. Should redirect to `/Admin/`
3. Should see admin dashboard

### Test Student Access:
1. Login with: `faisal@email.com` / `student123`
2. Should go to student dashboard
3. Test modals (video, quiz, challenge)

---

## 🐛 Troubleshooting

### "500 Internal Server Error"
**Cause:** .htaccess syntax error
**Fix:** 
1. Rename .htaccess to .htaccess-backup
2. Check if site loads
3. Contact hosting about mod_rewrite

### "Database Connection Error"
**Cause:** Wrong credentials in config.php
**Fix:**
1. Double-check DB_USER, DB_PASS, DB_NAME
2. Verify database exists
3. Check user has privileges

### "Admin redirects to dashboard"
**Cause:** Role not set to 'Admin'
**Fix:**
```sql
UPDATE Users SET Role = 'Admin' WHERE Email = 'ahmed@email.com';
```

### "Page not found - Admin"
**Cause:** Admin folder not uploaded
**Fix:**
1. Verify Admin/ folder exists
2. Check files inside Admin/
3. Re-upload if missing

### "Can't upload files"
**Cause:** Permissions or .htaccess
**Fix:**
1. Check uploads/ folder is writable (755)
2. Verify uploads/.htaccess exists
3. Check PHP upload limits

---

## 🔧 Post-Installation Configuration

### Change Admin Password:
1. Go to Admin panel
2. Click "Manage Users"
3. Edit ahmed@email.com
4. Set new password
5. Logout and login again

### Add More Admins:
1. Go to Admin → Manage Users
2. Click "Add New"
3. Fill in details
4. Set Role = "Admin" or "Instructor"
5. Save

### Configure Email (Optional):
If you have SMTP, edit config.php:
```php
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_USER', 'your@email.com');
define('SMTP_PASS', 'your_password');
```

### Enable HTTPS (Recommended):
In .htaccess, uncomment:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🎯 Final Checklist

Before going live:

- [ ] Database imported successfully
- [ ] config.php configured correctly
- [ ] File permissions set properly
- [ ] Admin login works
- [ ] Student login works
- [ ] Videos load in modal
- [ ] Quizzes work with animations
- [ ] Challenges can be submitted
- [ ] Admin CRUD functions work
- [ ] File uploads work
- [ ] .htaccess protections active
- [ ] No PHP errors showing
- [ ] Tested on mobile devices

---

## 📞 Need Help?

### Check These First:
1. PHP error logs
2. Apache error logs
3. Browser console (F12)
4. phpMyAdmin for database issues

### Common Log Locations:
- cPanel: `public_html/error_log`
- Apache: `/var/log/apache2/error.log`
- PHP: Check error_log.txt

---

## 🎉 Success!

If all checks pass, your PropheticPD installation is complete!

**Next Steps:**
1. Login as admin
2. Add content (videos, quizzes, challenges)
3. Create student accounts
4. Share login details with students
5. Monitor progress via admin dashboard

---

## 📚 Additional Resources

- **USER_GUIDE.md** - How to use the system
- **Admin Panel** - Comprehensive management
- **Student Dashboard** - User experience

**Enjoy your PropheticPD platform!** 🚀
