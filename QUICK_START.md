# 🚀 MC Platform - Quick Start Guide

## ✅ System Status

**Server:** http://192.168.131.21:3000  
**Status:** ✅ Running  
**Database:** ✅ Initialized  
**Test Users:** ✅ Created  

---

## 👥 Test Accounts (Ready to Use)

| #  | Username    | Password    | Role      | Use Case                |
|----|-------------|-------------|-----------|-------------------------|
| 1  | admin       | admin123    | admin     | 🔐 Full admin access    |
| 2  | john_doe    | password123 | user      | 👤 Regular user         |
| 3  | jane_smith  | password123 | moderator | 👮 Moderator role       |
| 4  | bob_wilson  | password123 | user      | 👤 Additional test user |

---

## 🎯 Quick Test Flow (5 Minutes)

### Step 1: Test Admin Login (1 min)
```
1. Open: http://192.168.131.21:3000/auth
2. Login: admin / admin123
3. Should redirect to home page
4. Navigate to: http://192.168.131.21:3000/admin
5. ✅ Verify: Dashboard shows 4 users, 1 topic, 192 questions
```

### Step 2: Test User Management (2 min)
```
1. In Admin Dashboard, click "Users" tab
2. Find "john_doe"
3. Change role from "User" to "Moderator"
4. ✅ Verify: Dropdown changes immediately
5. Find "bob_wilson"
6. Click "Delete" → Confirm
7. ✅ Verify: User removed from list
```

### Step 3: Test Regular User (2 min)
```
1. Open new incognito window
2. Go to: http://192.168.131.21:3000/auth
3. Login: jane_smith / password123
4. Click on "CyberArk PAM-DEF" topic
5. Click first question
6. Select answer → Submit
7. ✅ Verify: Shows correct/incorrect result
8. Try to access: http://192.168.131.21:3000/admin
9. ✅ Verify: Redirected (no access)
```

---

## 📊 Current System State

```
Users:     4 (1 admin, 2 users, 1 moderator)
Topics:    1 (CyberArk PAM-DEF)
Questions: 192
Answers:   24 (test data)
Accuracy:  20.8%
```

---

## 🔍 Quick Verification Commands

Run on server to check system:

```bash
# Check all users
cd /home/user01/mc-platform
node -e "const db = require('better-sqlite3')('mc.db'); console.table(db.prepare('SELECT username, email, role FROM users').all())"

# Run full system test
node test-system.js
```

---

## 🎨 Features to Test

### ✅ Authentication
- [x] User registration
- [x] User login
- [x] Session persistence
- [x] Logout

### ✅ Admin Dashboard
- [x] View statistics
- [x] User management
- [x] Role assignment
- [x] User deletion
- [x] Topic management

### ✅ Quiz System
- [x] View topics
- [x] Take quiz
- [x] Submit answers
- [x] View results
- [x] Google AI explanation

### ✅ Permissions
- [x] Admin-only access
- [x] Role-based restrictions
- [x] Session validation

---

## 🐛 Troubleshooting

**Problem:** Cannot login  
**Solution:** Check username/password, verify user exists in database

**Problem:** Admin dashboard not loading  
**Solution:** Verify logged in as admin role

**Problem:** Stats showing 0  
**Solution:** Run `node test-system.js` to verify data exists

---

## 📝 Full Testing Guide

For complete test cases and detailed instructions:
```bash
cat /home/user01/mc-platform/TESTING_GUIDE.md
```

---

## 🎉 Ready to Test!

All systems operational. Start with Step 1 above! 🚀
