# 🧪 MC Platform - Complete Testing Guide

## 📋 Test Accounts

| Username    | Password     | Email              | Role      | Purpose                    |
|-------------|--------------|--------------------|-----------|-----------------------------|
| admin       | admin123     | admin@mcplatform.com | admin     | Full system access          |
| john_doe    | password123  | john@example.com   | user      | Regular user testing        |
| jane_smith  | password123  | jane@example.com   | moderator | Moderator role testing      |
| bob_wilson  | password123  | bob@example.com    | user      | Additional user for testing |

## 🌐 URLs

- **Home:** http://192.168.131.21:3000
- **Login:** http://192.168.131.21:3000/auth
- **Admin Dashboard:** http://192.168.131.21:3000/admin
- **Quiz:** http://192.168.131.21:3000/quiz/[id]

---

## 🧪 Test Cases

### Test Case 1: User Registration & Login

**Objective:** Verify new user can register and login

**Steps:**
1. Navigate to http://192.168.131.21:3000/auth
2. Click "Sign Up" tab
3. Fill in:
   - Username: test_user_001
   - Email: test001@example.com
   - Display Name: Test User 001
   - Password: test123456
4. Click "Create Account"
5. Switch to "Sign In" tab
6. Login with:
   - Username: test_user_001
   - Password: test123456
7. Click "Sign In"

**Expected Result:**
- ✅ Registration successful
- ✅ Redirected to login
- ✅ Login successful
- ✅ Redirected to home page
- ✅ User data stored in localStorage

**Validation:**
```javascript
// Open browser console and check:
JSON.parse(localStorage.getItem('user'))
// Should show: { id, username, email, displayName, role: 'user' }
```

---

### Test Case 2: Admin Login & Dashboard Access

**Objective:** Verify admin can access admin dashboard

**Steps:**
1. Navigate to http://192.168.131.21:3000/auth
2. Login with:
   - Username: admin
   - Password: admin123
3. Navigate to http://192.168.131.21:3000/admin

**Expected Result:**
- ✅ Login successful
- ✅ Admin dashboard loads
- ✅ Shows 4 stat cards (Users, Topics, Questions, Answers)
- ✅ Shows tabs: Overview, Users, Topics
- ✅ Can see all users in Users tab

**Validation:**
- Check stats show correct numbers
- Verify user list displays all 4 users
- Verify admin user has "Admin" badge

---

### Test Case 3: User Role Management

**Objective:** Admin can change user roles

**Steps:**
1. Login as admin
2. Navigate to http://192.168.131.21:3000/admin
3. Click "Users" tab
4. Find "john_doe" user
5. Change role dropdown from "User" to "Moderator"
6. Refresh page

**Expected Result:**
- ✅ Role dropdown changes immediately
- ✅ After refresh, role persists as "Moderator"
- ✅ Database updated

**Validation:**
```bash
# SSH to server and check:
cd /home/user01/mc-platform
node -e "const db = require('better-sqlite3')('mc.db'); console.log(db.prepare('SELECT username, role FROM users WHERE username = ?').get('john_doe'))"
# Should show: { username: 'john_doe', role: 'moderator' }
```

---

### Test Case 4: User Deletion

**Objective:** Admin can delete users

**Steps:**
1. Login as admin
2. Navigate to http://192.168.131.21:3000/admin
3. Click "Users" tab
4. Find "bob_wilson" user
5. Click "Delete" button
6. Confirm deletion in popup
7. Refresh page

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ User removed from list
- ✅ User count decreases by 1
- ✅ User deleted from database

**Validation:**
```bash
# Check user count:
node -e "const db = require('better-sqlite3')('mc.db'); console.log('Total users:', db.prepare('SELECT COUNT(*) as c FROM users').get().c)"
```

---

### Test Case 5: Topic Management

**Objective:** Admin can view and delete topics

**Steps:**
1. Login as admin
2. Navigate to http://192.168.131.21:3000/admin
3. Click "Topics" tab
4. Verify "CyberArk PAM-DEF" topic is listed
5. Note the question count
6. Click "Delete" button
7. Confirm deletion

**Expected Result:**
- ✅ Topic list displays correctly
- ✅ Shows question count (192 questions)
- ✅ Delete confirmation appears
- ✅ Topic and all questions deleted (cascade)
- ✅ Stats update

**⚠️ Warning:** This will delete all questions! Only test if you have backup.

---

### Test Case 6: Regular User Quiz Access

**Objective:** Regular user can take quiz

**Steps:**
1. Logout (clear localStorage)
2. Login as john_doe / password123
3. Navigate to home page
4. Click on "CyberArk PAM-DEF" topic
5. Click on first question
6. Select an answer (e.g., A)
7. Click "Submit Answer"
8. Click "Show Google AI Explanation"

**Expected Result:**
- ✅ Topic list visible
- ✅ Can access quiz page
- ✅ Can select answer
- ✅ Submit works
- ✅ Shows correct/incorrect result
- ✅ Google iframe loads (or opens new tab if blocked)
- ✅ Can navigate to next question

---

### Test Case 7: Permission Enforcement

**Objective:** Regular users cannot access admin dashboard

**Steps:**
1. Login as john_doe / password123
2. Try to navigate to http://192.168.131.21:3000/admin

**Expected Result:**
- ✅ Redirected to home page
- ✅ OR shows "Unauthorized" message
- ✅ Admin dashboard not accessible

**Validation:**
```javascript
// Check localStorage:
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role); // Should be 'user', not 'admin'
```

---

### Test Case 8: Session Persistence

**Objective:** User stays logged in after page refresh

**Steps:**
1. Login as any user
2. Navigate to home page
3. Refresh browser (F5)
4. Check if still logged in

**Expected Result:**
- ✅ User remains logged in
- ✅ No redirect to login page
- ✅ User data persists in localStorage
- ✅ Session cookie valid

---

### Test Case 9: Logout Functionality

**Objective:** User can logout properly

**Steps:**
1. Login as any user
2. Open browser console
3. Execute: `localStorage.clear()`
4. Refresh page

**Expected Result:**
- ✅ Redirected to login page
- ✅ Cannot access protected pages
- ✅ localStorage cleared

---

### Test Case 10: Multiple Users Concurrent Access

**Objective:** Multiple users can use system simultaneously

**Steps:**
1. Open 3 different browsers (Chrome, Firefox, Edge)
2. Login as different users in each:
   - Browser 1: admin
   - Browser 2: john_doe
   - Browser 3: jane_smith
3. Each user takes a quiz
4. Admin checks stats in real-time

**Expected Result:**
- ✅ All users can login simultaneously
- ✅ No session conflicts
- ✅ Stats update correctly
- ✅ Each user sees their own data

---

## 🔍 Database Verification Commands

Run these on the server to verify data:

```bash
cd /home/user01/mc-platform

# Check all users
node -e "const db = require('better-sqlite3')('mc.db'); console.table(db.prepare('SELECT id, username, email, role FROM users').all())"

# Check sessions
node -e "const db = require('better-sqlite3')('mc.db'); console.table(db.prepare('SELECT id, user_id, expires_at FROM sessions').all())"

# Check stats
node -e "const db = require('better-sqlite3')('mc.db'); const stats = { users: db.prepare('SELECT COUNT(*) as c FROM users').get().c, topics: db.prepare('SELECT COUNT(*) as c FROM topics').get().c, questions: db.prepare('SELECT COUNT(*) as c FROM questions').get().c, answers: db.prepare('SELECT COUNT(*) as c FROM answers').get().c }; console.table(stats)"

# Check answer accuracy
node -e "const db = require('better-sqlite3')('mc.db'); const total = db.prepare('SELECT COUNT(*) as c FROM answers').get().c; const correct = db.prepare('SELECT COUNT(*) as c FROM answers WHERE is_correct = 1').get().c; console.log('Accuracy:', (correct/total*100).toFixed(1) + '%')"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Cannot access admin dashboard
**Solution:** Verify user role is 'admin' in database

### Issue 2: Login fails
**Solution:** Check password is correct, verify user exists in database

### Issue 3: Stats not updating
**Solution:** Refresh page, check database has data

### Issue 4: Google iframe blocked
**Solution:** This is expected due to X-Frame-Options. Use new tab fallback.

---

## ✅ Test Completion Checklist

- [ ] All 4 test users created
- [ ] Admin can login
- [ ] Regular users can login
- [ ] Admin dashboard accessible
- [ ] User role changes work
- [ ] User deletion works
- [ ] Topic management works
- [ ] Quiz functionality works
- [ ] Permission enforcement works
- [ ] Session persistence works
- [ ] Logout works
- [ ] Multiple concurrent users work

---

## 📊 Expected Final State

After all tests:
- **Users:** 3-4 (admin + test users)
- **Topics:** 1 (CyberArk PAM-DEF)
- **Questions:** 192
- **Answers:** 15+ (from test data + manual testing)
- **Sessions:** 1-4 (depending on active logins)

---

## 🚀 Quick Test Script

Run this to verify everything works:

```bash
cd /home/user01/mc-platform
node test-system.js
```

This will show current system state and verify all components are working.
