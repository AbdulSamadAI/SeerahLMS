# 📚 Seerah LMS - Complete Learning Management System

> A modern, fully-responsive Learning Management System built with React, TypeScript, and Supabase

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://seerah-lms-lcgb.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge)](https://github.com/AbdulSamadAI/SeerahLMS)

## ✨ Key Features

### 🎓 Student Portal
- **Interactive Dashboard**: Real-time progress tracking with beautiful charts and statistics
- **Video Library**: Responsive video player with progress tracking
- **Quiz System**: Timed quizzes with instant feedback and grading
- **Challenge Center**: Submit and track challenge responses
- **Attendance Tracking**: View attendance history with detailed records
- **Leaderboard**: Competitive ranking system with point breakdown
- **Fully Mobile-Responsive**: Optimized for mobile, tablet, and desktop

### 👨‍💼 Admin Portal
- **Comprehensive Dashboard**: 10+ statistics and analytics
- **Content Management**: CRUD operations for videos, quizzes, and challenges
- **Attendance Manager**: Mark and track student attendance
- **User Management**: Manage students and roles
- **Point System**: Automated point calculation and tracking
- **Mobile-Optimized**: Fully responsive admin interface

### 🎨 Design & UX
- **Premium Glassmorphic UI**: Modern, elegant design with smooth animations
- **Fully Responsive**: Seamless experience on all devices (320px - 1920px+)
- **Dark Mode Ready**: Carefully crafted color schemes
- **Micro-animations**: Smooth transitions using Framer Motion
- **Touch-Optimized**: Large tap targets and mobile-first design

### 🔒 Security & Performance
- **Row Level Security (RLS)**: Database-level security with Supabase
- **Role-Based Access Control**: Student and Admin roles
- **Real-time Updates**: Live data synchronization
- **Optimized Queries**: Fast and efficient database operations
- **CDN Deployment**: Lightning-fast global delivery via Vercel

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast builds
- **TanStack Query** for data fetching and caching
- **React Router** for navigation
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Supabase** (PostgreSQL database)
- **Row Level Security (RLS)**
- **Real-time subscriptions**
- **Authentication & Authorization**

### Deployment
- **Vercel** for frontend hosting
- **Automatic CI/CD** from GitHub
- **Environment variables** management

## 📁 Project Structure

```
ppd_c/
├── react-app/                 # Main React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── auth/        # Authentication
│   │   │   ├── dashboard/   # Dashboard widgets
│   │   │   ├── layout/      # Layout components
│   │   │   ├── notifications/ # Notification system
│   │   │   └── ui/          # UI components
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── dashboard/   # Student pages
│   │   │   └── ...
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and config
│   │   └── App.tsx          # Main app component
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── supabase/                 # Supabase configuration
│    └── migrations/          # Database migrations
├── README.md                 # This file
└── .gitignore

```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/AbdulSamadAI/SeerahLMS.git
cd SeerahLMS
```

### 2. Install Dependencies
```bash
cd react-app
npm install
```

### 3. Environment Setup
Create a `.env` file in the `react-app` directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get your Supabase credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 4. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files from `supabase/migrations/` in order
4. Verify tables are created in Table Editor

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Default Login Credentials
**Admin:**
- Email: admin@example.com
- Password: (set during database setup)

**Student:**
- Email: student@example.com
- Password: (set during database setup)

## 📱 Mobile Responsiveness

The entire application is fully optimized for mobile devices:

### Key Mobile Features
- ✅ Single-column layouts on mobile (< 640px)
- ✅ Touch-friendly buttons (minimum 44x44px)
- ✅ Responsive typography (fluid sizing)
- ✅ Bottom navigation bar (mobile only)
- ✅ Collapsible sections and cards
- ✅ Optimized modals and forms
- ✅ Horizontal scroll for tables
- ✅ Compressed stats and charts

### Tested Devices
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S21 (360px)
- iPad Mini (768px)
- iPad Pro (1024px)

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (already done)
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set **Root Directory** to `react-app`
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Add Environment Variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Deploy!**

Your app will be live at: `https://your-project.vercel.app`

**Current Live Demo:** [https://seerah-lms-lcgb.vercel.app](https://seerah-lms-lcgb.vercel.app)

## 📊 Database Schema

### Main Tables
- `users_extended` - User profiles and points
- `videos` - Video content
- `quizzes` & `quiz_questions` - Quiz system
- `manual_quiz_grades` - Quiz submissions
- `challenges` & `student_challenge_responses` - Challenge system
- `attendance_records` - Attendance tracking
- `video_progress` - Video watch progress
- `notifications` - User notifications

### Key Features
- Row Level Security (RLS) enabled on all tables
- Automated point calculation
- Real-time data updates
- Efficient indexing for performance

## 🎯 Features Roadmap

### ✅ Completed
- Full mobile responsiveness
- Student dashboard & progress tracking
- Video library with progress
- Quiz system with grading
- Challenge submissions
- Attendance tracking
- Admin CRUD interfaces
- Point breakdown system
- Leaderboard
- Notifications
- Profile management

### 🔜 Future Enhancements
- [ ] Dark mode toggle
- [ ] Email notifications
- [ ] File upload for challenges
- [ ] Bulk user import
- [ ] Advanced analytics
- [ ] Certificate generation
- [ ] Discussion forums
- [ ] Live sessions integration

## 🤝 Contributing

This is an educational project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

Educational use only. Not for commercial distribution.

## 🙏 Acknowledgments

Built with modern web technologies:
- React Team for React
- Vercel for Vite
- Supabase for the amazing backend
- Tailwind Labs for Tailwind CSS
- Framer for Framer Motion

---

**Seerah LMS** - Empowering education through modern technology 🌟

For questions or support, open an issue on GitHub.
