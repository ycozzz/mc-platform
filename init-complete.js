const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('./mc.db');

console.log('🚀 Complete System Initialization\n');

db.pragma('journal_mode = WAL');

// Step 1: Core tables
console.log('1️⃣ Creating core tables...');
db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL CHECK(correct_answer IN ('A','B','C','D')),
    explanation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected TEXT NOT NULL CHECK(selected IN ('A','B','C','D')),
    is_correct BOOLEAN NOT NULL,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
  CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
`);
console.log('   ✅ Core tables created');

// Step 2: Auth tables
console.log('\n2️⃣ Creating auth tables...');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'moderator')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
`);
console.log('   ✅ Auth tables created');

// Step 3: Create admin user
console.log('\n3️⃣ Creating admin user...');
const adminPassword = crypto.createHash('sha256').update('admin123').digest('hex');
try {
  db.prepare(`
    INSERT INTO users (username, email, password_hash, display_name, role)
    VALUES ('admin', 'admin@mcplatform.com', ?, 'Administrator', 'admin')
  `).run(adminPassword);
  console.log('   ✅ Admin user created');
} catch (e) {
  console.log('   ℹ️  Admin user already exists');
}

// Step 4: Verify
console.log('\n4️⃣ Verifying setup...');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('   Tables:', tables.map(t => t.name).join(', '));

const adminUser = db.prepare("SELECT username, email, role FROM users WHERE role='admin'").get();
if (adminUser) {
  console.log(`   ✅ Admin: ${adminUser.username} (${adminUser.email})`);
}

console.log('\n✅ System initialization complete!\n');
console.log('🔐 Admin Credentials:');
console.log('   Username: admin');
console.log('   Password: admin123');
console.log('\n🌐 URLs:');
console.log('   Login: http://192.168.131.21:3000/auth');
console.log('   Admin: http://192.168.131.21:3000/admin');
console.log('   Home:  http://192.168.131.21:3000');

db.close();
