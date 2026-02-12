# 🚀 Quick Setup Guide for Seerah LMS

This guide will help you set up the Seerah LMS project on your local machine or share it with others.

## 📋 What You're Sharing

This folder contains:
- **react-app/**: Complete React frontend application
- **supabase/**: Database migrations and schema
- **Admin/**: Legacy PHP admin files (optional)
- **README.md**: Comprehensive project documentation
- **.env.example**: Template for environment variables

## 🎯 For Someone Receiving This Folder

### Option 1: Quick Local Development

1. **Install Node.js**
   - Download from [nodejs.org](https://nodejs.org) (v18 or higher)
   - Verify: `node --version` and `npm --version`

2. **Install Dependencies**
   ```bash
   cd react-app
   npm install
   ```

3. **Set Up Environment Variables**
   - Copy `react-app/.env.example` to `react-app/.env`
   - Get Supabase credentials from the original developer or create your own project

4. **Run the App**
   ```bash
   npm run dev
   ```
   - Open http://localhost:5173

### Option 2: Deploy to Production

#### Deploy Frontend (Vercel - Free)

1. **Push to GitHub**
   - Create a new repository on GitHub
   - Push this folder:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin YOUR_GITHUB_URL
     git push -u origin main
     ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - **IMPORTANT**: Set Root Directory to `react-app`
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click Deploy

#### Set Up Backend (Supabase - Free)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Save your project URL and anon key

2. **Run Migrations**
   - Go to SQL Editor in Supabase dashboard
   - Copy and run SQL from `supabase/migrations/` files
   - Verify tables are created

3. **Update Environment Variables**
   - Add Supabase credentials to Vercel (if deployed)
   - Or update `react-app/.env` for local development

## 🔑 Getting Supabase Credentials

If you need to set up your own database:

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

## 📁 Important Files

```
ppd_c/
├── react-app/
│   ├── .env.example         ← Copy this to .env
│   ├── package.json         ← Dependencies
│   └── src/                 ← Source code
├── supabase/
│   └── migrations/          ← Database setup SQL
├── README.md                ← Full documentation
└── SETUP_GUIDE.md          ← This file
```

## ✅ Verification Checklist

After setup, verify:
- [ ] `npm run dev` starts without errors
- [ ] Can open http://localhost:5173
- [ ] Login page appears
- [ ] Can create test user
- [ ] Dashboard loads

## 🐛 Troubleshooting

### "Module not found" errors
```bash
cd react-app
rm -rf node_modules package-lock.json
npm install
```

### Database connection errors
- Verify Supabase URL and key in `.env`
- Check Supabase project is running
- Verify migrations were executed

### Port already in use
```bash
# Kill process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5173 | xargs kill -9
```

## 🌐 Live Demo

Current deployment: [https://seerah-lms-lcgb.vercel.app](https://seerah-lms-lcgb.vercel.app)

## 📞 Support

For issues:
1. Check README.md for detailed documentation
2. Review error messages carefully
3. Verify all dependencies are installed
4. Check environment variables are set correctly

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Ready to start?** Follow the steps above and you'll be up and running in minutes! 🚀
