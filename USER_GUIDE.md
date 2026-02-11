# 📖 PropheticPD User Guide

Complete guide for admins and students.

---

## 🔐 Admin Panel Guide

### Accessing Admin Panel

**URL:** `https://yourdomain.com/Admin/`

**Login:**
- Email: ahmed@email.com
- Password: (leave empty initially)

**Auto-redirect:** Admins automatically go to Admin panel upon login.

---

### Admin Dashboard Features

#### 📊 Statistics (10 Cards):
1. **Total Students** - Count of enrolled students
2. **Admins/Instructors** - Count of admin users
3. **Videos Uploaded** - Total video content
4. **Quiz Questions** - Total quiz items
5. **Challenges** - Weekly challenges count
6. **Life Skills** - 8 core skills
7. **Total Attendance** - Video watches
8. **Quiz Submissions** - Student quiz attempts
9. **Challenge Submissions** - Completed challenges
10. **Reflections** - Student reflections

#### 📈 Weekly Participation Chart:
- Visual bar chart showing participation per week
- Shows students participated vs total students
- Hover to see details

#### 🏆 Top Students Leaderboard:
- Top 10 students by points
- Gold/Silver/Bronze medals for top 3
- Shows points and challenges completed
- Updates in real-time

#### 📊 Recent Activity Feed:
- Latest 15 activities
- Shows video watches and challenge submissions
- Real-time timestamps
- Student names and activities

---

### CRUD Panel - Manage Tables

**Access:** Click "📋 Manage Tables" in header

**Available Tables:**
1. Users
2. Videos
3. Quiz
4. Quiz_Details (Quiz Options)
5. Challenges
6. LifeSkills
7. AttendanceRecords
8. ChallengeScores
9. QuizScore
10. Reflections
11. ReflectionScore

---

### Managing Users

#### Add New User:
1. Click "Users" in table list
2. Click "➕ Add New"
3. Fill in:
   - Name
   - Email
   - Role (Student/Instructor/Admin)
   - EnrollmentDate (YYYY-MM-DD)
   - client_id (usually 0)
   - password (optional)
4. Click "💾 Create"

#### Edit User:
1. Find user in list
2. Click "✏️ Edit"
3. Update fields (ID shown but disabled)
4. Click "💾 Update"

#### Delete User:
1. Find user in list
2. Click "🗑️ Delete"
3. Confirm deletion
4. User removed permanently

**Note:** Be careful deleting users with scores - this may affect statistics.

---

### Managing Videos

#### Add New Video:
1. Go to Videos table
2. Click "➕ Add New"
3. Fill in:
   - **video_title**: "Week 1: Time Management"
   - **video_link**: YouTube video ID only (e.g., "RWjJqgiMjXs")
   - **description**: Optional description
   - **week_number**: 1-10
   - **sceduling_datetime**: "2025-12-20 09:00:00"
   - **end_time**: "2025-12-20 18:00:00"
   - **client_id**: 0
4. Click "💾 Create"

**Video Link Format:**
- ❌ Wrong: https://youtube.com/watch?v=RWjJqgiMjXs
- ✅ Correct: RWjJqgiMjXs

---

### Managing Quizzes

#### Add Quiz Question:
1. Go to Quiz table
2. Click "➕ Add New"
3. Fill in:
   - **week_number**: 1-10
   - **question**: "What is time management?"
   - **option_a**: "Prioritizing tasks"
   - **option_b**: "Working more"
   - **option_c**: "Avoiding breaks"
   - **option_d**: "Multitasking"
   - **is_correct**: Select A, B, C, or D
   - **client_id**: 0
4. Click "💾 Create"

**Tips:**
- Make questions clear and specific
- Ensure one correct answer
- All options should be plausible
- Test quiz after creating

---

### Managing Challenges

#### Add New Challenge:
1. Go to Challenges table
2. Click "➕ Add New"
3. Fill in:
   - **Title**: "The Barakah Priority Log"
   - **Description**: Detailed instructions
   - **WeekNumber**: 1-10
   - **MaxPoints**: 25.00
   - **LifeSkillID**: 1-8
   - **client_id**: 0
4. Click "💾 Create"

**Life Skills (1-8):**
1. Time Management
2. Critical Thinking
3. Change Management
4. Emotional Intelligence
5. Prophetic Communication
6. Positivity
7. Taking Personal Responsibility
8. Growth Mindset

---

## 👨‍🎓 Student Dashboard Guide

### Accessing Student Dashboard

**URL:** `https://yourdomain.com/`

**Login:**
- Email: your-student@email.com
- Password: (if set)

---

### Dashboard Features

#### 📊 Progress Overview:
- **Donut Chart**: Overall completion percentage
- **This Week Progress**: Current week activities
- **Overall Progress**: Total completion
- **Points Earned**: Total points accumulated

#### 📹 Watch Video:
1. Click "📹 Watch Video" card
2. Modal opens instantly
3. Watch YouTube video
4. Click "Mark as Watched"
5. Success animation
6. Auto-closes after 2 seconds

#### 📝 Take Quiz:
1. Click "📝 Take Quiz" card
2. Modal shows one question at a time
3. Select an answer
4. **If wrong**: Red shake animation + correct answer shown (2s delay)
5. **If correct**: Green highlight + next question (0.5s delay)
6. Progress bar shows position
7. Results shown at end with emoji
8. Auto-closes after 3 seconds

#### 🎯 Submit Challenge:
1. Click "🎯 Submit Challenge" card
2. Modal shows challenge description
3. Type your response
4. Click "Submit Challenge"
5. Success message
6. Auto-closes after 2 seconds

#### 💭 Write Reflection:
1. Click "💭 Write Reflection" card
2. Modal shows 3 prompts:
   - What did you learn?
   - What challenges did you face?
   - How will you apply this?
3. Fill in all fields
4. Click "Submit Reflection"
5. Success message
6. Auto-closes after 2 seconds

---

### My Progress Page

**Access:** Click "📈 My Progress" in navigation

**Shows:**
- Week-by-week breakdown
- Activities completed vs total
- Points earned per week
- Overall statistics
- Completion percentages

---

### Explore Course Page

**Access:** Click "🔍 Explore Course" in navigation

**Features:**
- Overview of all 10 weeks
- Life skills covered
- Challenges listed
- Course structure
- Learning objectives

---

### Profile Page

**Access:** Click profile icon → "👤 Profile"

**Features:**
- Personal information
- Enrollment date
- Total points
- Completion status
- Change password option

---

## 🎯 Best Practices

### For Admins:

1. **Content Organization:**
   - Add videos before quiz questions
   - Create challenges matching weekly themes
   - Keep client_id = 0 for main content

2. **User Management:**
   - Set strong passwords for admins
   - Use descriptive names for students
   - Regularly backup user data

3. **Monitoring:**
   - Check weekly participation chart
   - Review top students leaderboard
   - Monitor recent activity feed
   - Follow up with inactive students

4. **Data Integrity:**
   - Backup database weekly
   - Test CRUD changes on demo account first
   - Don't delete users with scores unless necessary

---

### For Students:

1. **Engagement:**
   - Watch videos completely
   - Take quizzes seriously
   - Submit thoughtful challenge responses
   - Write detailed reflections

2. **Progress:**
   - Complete activities each week
   - Track your points
   - Review My Progress regularly
   - Aim for 100% completion

3. **Time Management:**
   - Schedule regular study time
   - Don't rush through content
   - Take notes during videos
   - Reflect on learnings

---

## 🚨 Troubleshooting

### "Can't login as admin"
**Solution:** Run this SQL:
```sql
UPDATE Users SET Role = 'Admin' WHERE Email = 'your@email.com';
```

### "Modal won't close"
**Solution:** Click outside modal or use X button

### "Quiz not loading"
**Solution:** Check if quiz questions exist for current week

### "Video not playing"
**Solution:** 
- Check internet connection
- Verify YouTube video ID is correct
- Try different browser

### "Can't submit challenge"
**Solution:**
- Check if challenge exists for current week
- Verify text is not empty
- Try refreshing page

---

## 💡 Pro Tips

### Admins:
- Use "Quick Actions" cards for fast access
- Sort leaderboard by clicking headers
- Export data before major changes
- Test with student account first

### Students:
- Complete activities in order
- Use reflection time wisely
- Track your progress weekly
- Compete friendly on leaderboard

---

## 📞 Support

For issues:
1. Check USER_GUIDE.md (this file)
2. Check INSTALLATION.md
3. Check PHP error logs
4. Contact administrator

---

## 🎉 Enjoy PropheticPD!

Transform your life through prophetic principles! 🌟
