# 🎓 MC Practice Platform

A modern, feature-rich multiple-choice practice platform with admin dashboard and role-based access control.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🔐 Authentication & Authorization
- iOS 18 inspired glassmorphism login/register UI
- Session-based authentication (7-day expiry)
- Role-based access control (admin/moderator/user)
- Secure password hashing
- HTTP-only cookies

### 👑 Admin Dashboard
- User management (view, edit roles, delete)
- Topic management (view, delete)
- Real-time statistics
- Beautiful dark theme UI

### 📝 Quiz System
- Interactive quiz interface
- Multiple choice questions (A/B/C/D)
- Instant feedback
- Google AI explanation integration
- Progress tracking
- Answer history

### 📤 PDF Import
- Upload PDF question banks
- Auto-parse questions and answers
- Batch import to database

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd mc-platform

# Install dependencies
npm install

# Initialize database
node init-complete.js

# Create test users
node create-test-users.js

# Start development server
npm run dev
```

Visit http://localhost:3000

### Default Admin Account
- Username: `admin`
- Password: `admin123`

## 📊 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite (better-sqlite3)
- **Authentication:** Custom session-based

## 🗄️ Database Schema

```sql
users (id, username, email, password_hash, display_name, role, ...)
sessions (id, user_id, expires_at, ...)
topics (id, name, description, ...)
questions (id, topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, ...)
answers (id, question_id, selected, is_correct, ...)
```

## 📁 Project Structure

```
mc-platform/
├── src/
│   ├── app/
│   │   ├── admin/          # Admin dashboard
│   │   ├── auth/           # Login/register pages
│   │   ├── quiz/           # Quiz pages
│   │   └── api/            # API routes
│   └── lib/
│       ├── auth.ts         # Authentication logic
│       ├── session.ts      # Session management
│       ├── middleware.ts   # Route protection
│       └── db.ts           # Database connection
├── CHANGELOG.md            # Version history
├── TESTING_GUIDE.md        # Complete testing guide
├── QUICK_START.md          # Quick start guide
└── package.json
```

## 🧪 Testing

```bash
# Run system test
node test-system.js

# Create test users
node create-test-users.js
```

See `TESTING_GUIDE.md` for detailed test cases.

## 👥 Test Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| john_doe | password123 | user |
| jane_smith | password123 | moderator |
| bob_wilson | password123 | user |

## 📖 Documentation

- [CHANGELOG.md](CHANGELOG.md) - Version history and changes
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Complete testing guide
- [QUICK_START.md](QUICK_START.md) - 5-minute quick start

## 🔒 Security

- Password hashing (SHA-256)
- HTTP-only session cookies
- CSRF protection
- SQL injection prevention
- Role-based access control

## 🛣️ Roadmap

- [ ] Email verification
- [ ] Password reset
- [ ] User profiles
- [ ] Leaderboard
- [ ] Study mode
- [ ] Timed quizzes
- [ ] Mobile app

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📧 Contact

For issues and questions, please open a GitHub issue.

---

Made with ❤️ using Next.js and TypeScript
