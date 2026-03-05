# Changelog

All notable changes to MC Practice Platform will be documented in this file.

## [1.0.0] - 2026-03-05

### 🎉 Initial Release

#### ✨ Features Added

**Authentication System**
- iOS 18 style login/register page with glassmorphism design
- Session-based authentication (7-day expiry)
- Password hashing (SHA-256)
- Cookie-based session management
- Auto-redirect for authenticated users

**Role-Based Access Control**
- 3 roles: admin, moderator, user
- Role-based middleware protection
- Permission enforcement on routes
- Admin-only dashboard access

**Admin Dashboard** ()
- Overview tab with system statistics
- User management:
  - View all users with details
  - Change user roles (user/moderator/admin)
  - Delete users (with confirmation)
  - Avatar display with initials
- Topic management:
  - View all topics with question counts
  - Delete topics (cascade delete questions)
- Real-time statistics:
  - Total users count
  - Total topics count
  - Total questions count
  - Total answers count

**Quiz System**
- Topic listing with progress tracking
- Question display with 4 options (A/B/C/D)
- Answer submission and validation
- Correct/incorrect feedback
- Explanation display
- Google AI search integration (iframe)
- Progress bar showing current question
- Next question navigation
- Answer history tracking

**Database Schema**
- user01 table: authentication + roles
-  table: session management
-  table: question banks
-  table: quiz questions
-  table: user responses

**UI/UX**
- iOS 18 inspired design language
- Glassmorphism effects
- Gradient backgrounds
- Smooth animations
- Responsive layout
- Dark theme for auth pages
- Light theme for main app

**PDF Import**
- Upload PDF question banks
- Auto-parse questions with pdftotext
- Extract options (A/B/C/D)
- Extract correct answers
- Extract explanations
- Batch import to database

#### 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite (better-sqlite3)
- **Auth:** Custom session-based
- **PDF Processing:** pdftotext

#### 🗄️ Database

**Tables Created:**
- users (id, username, email, password_hash, display_name, avatar_url, role, created_at, last_login)
- sessions (id, user_id, expires_at, created_at)
- topics (id, name, description, created_at)
- questions (id, topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, created_at)
- answers (id, question_id, selected, is_correct, answered_at)

**Indexes:**
- idx_users_username
- idx_users_email
- idx_sessions_user
- idx_sessions_expires
- idx_questions_topic
- idx_answers_question

#### 👥 Test Data

**Users Created:**
- admin / admin123 (admin role)
- john_doe / password123 (user role)
- jane_smith / password123 (moderator role)
- bob_wilson / password123 (user role)

**Content:**
- 1 topic: CyberArk PAM-DEF
- 192 questions imported
- 24 test answers

#### 📝 Documentation

-  - Complete testing guide with 10 test cases
-  - 5-minute quick start guide
-  - Project overview (to be added)

#### 🔧 Scripts

-  - Initialize all database tables
-  - Create test users with sample data
-  - Verify system integrity
-  - Import questions from PDF

#### 🎨 Design Highlights

- Glassmorphism cards with backdrop blur
- Animated gradient backgrounds
- Smooth transitions and hover effects
- iOS-style rounded corners (2.5rem)
- Color scheme: Blue → Purple → Pink gradients
- Floating elements with animation
- Responsive grid layouts

#### 🔐 Security

- Password hashing before storage
- HTTP-only session cookies
- CSRF protection via SameSite cookies
- Role-based route protection
- SQL injection prevention (prepared statements)
- Session expiry (7 days)

#### 📊 Current Stats

- Users: 4
- Topics: 1
- Questions: 192
- Answers: 24
- Overall Accuracy: 20.8%

---

## Future Enhancements (Planned)

- [ ] Email verification
- [ ] Password reset functionality
- [ ] User profile editing
- [ ] Avatar upload
- [ ] Question search and filtering
- [ ] Export quiz results
- [ ] Leaderboard
- [ ] Study mode (review incorrect answers)
- [ ] Timed quizzes
- [ ] Question difficulty levels
- [ ] Tags and categories
- [ ] API documentation
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Analytics dashboard

---

## Version History

- **v1.0.0** (2026-03-05) - Initial release with full admin system
