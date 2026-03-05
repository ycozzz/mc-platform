const Database = require('better-sqlite3');
const db = new Database('./mc.db');

console.log('🧪 Testing MC Platform System\n');

// Test 1: Check tables
console.log('1️⃣ Checking database tables...');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('   Tables:', tables.map(t => t.name).join(', '));

// Test 2: Check users
console.log('\n2️⃣ Checking users...');
const users = db.prepare('SELECT id, username, email, role FROM users').all();
console.log(`   Total users: ${users.length}`);
users.forEach(u => {
  console.log(`   - ${u.username} (${u.email}) - Role: ${u.role}`);
});

// Test 3: Check admin user
console.log('\n3️⃣ Checking admin user...');
const admin = db.prepare("SELECT * FROM users WHERE role='admin'").get();
if (admin) {
  console.log('   ✅ Admin user exists:', admin.username);
} else {
  console.log('   ❌ No admin user found!');
}

// Test 4: Check topics
console.log('\n4️⃣ Checking topics...');
const topics = db.prepare('SELECT id, name, (SELECT COUNT(*) FROM questions WHERE topic_id = topics.id) as q_count FROM topics').all();
console.log(`   Total topics: ${topics.length}`);
topics.forEach(t => {
  console.log(`   - ${t.name} (${t.q_count} questions)`);
});

// Test 5: Check questions
console.log('\n5️⃣ Checking questions...');
const questions = db.prepare('SELECT COUNT(*) as count FROM questions').get();
console.log(`   Total questions: ${questions.count}`);

// Test 6: Check answers
console.log('\n6️⃣ Checking answers...');
const answers = db.prepare('SELECT COUNT(*) as count FROM answers').get();
const correctAnswers = db.prepare('SELECT COUNT(*) as count FROM answers WHERE is_correct = 1').get();
console.log(`   Total answers: ${answers.count}`);
console.log(`   Correct answers: ${correctAnswers.count}`);
if (answers.count > 0) {
  const accuracy = ((correctAnswers.count / answers.count) * 100).toFixed(1);
  console.log(`   Overall accuracy: ${accuracy}%`);
}

// Test 7: Check sessions
console.log('\n7️⃣ Checking sessions...');
const sessions = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
console.log(`   Active sessions: ${sessions.count}`);

console.log('\n✅ System check complete!\n');

// Summary
console.log('📊 SUMMARY:');
console.log(`   Users: ${users.length} | Topics: ${topics.length} | Questions: ${questions.count} | Answers: ${answers.count}`);
console.log('\n🔐 Admin Login:');
console.log('   Username: admin');
console.log('   Password: admin123');
console.log('   URL: http://192.168.131.21:3000/auth');
console.log('\n⚡ Admin Dashboard:');
console.log('   URL: http://192.168.131.21:3000/admin');

db.close();
