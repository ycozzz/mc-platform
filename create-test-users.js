const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('./mc.db');

console.log('👥 Creating Test Users\n');

const testUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    displayName: 'John Doe',
    role: 'user'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    displayName: 'Jane Smith',
    role: 'moderator'
  },
  {
    username: 'bob_wilson',
    email: 'bob@example.com',
    password: 'password123',
    displayName: 'Bob Wilson',
    role: 'user'
  }
];

const stmt = db.prepare(`
  INSERT INTO users (username, email, password_hash, display_name, role)
  VALUES (?, ?, ?, ?, ?)
`);

testUsers.forEach(user => {
  try {
    const passwordHash = crypto.createHash('sha256').update(user.password).digest('hex');
    stmt.run(user.username, user.email, passwordHash, user.displayName, user.role);
    console.log(`✅ Created: ${user.username} (${user.role})`);
  } catch (e) {
    console.log(`⚠️  User ${user.username} already exists`);
  }
});

// Create some test answers for users
console.log('\n📝 Creating test answer data...');

const questions = db.prepare('SELECT id FROM questions LIMIT 10').all();
if (questions.length > 0) {
  const users = db.prepare("SELECT id FROM users WHERE role != 'admin'").all();
  const answerStmt = db.prepare(`
    INSERT INTO answers (question_id, selected, is_correct)
    VALUES (?, ?, ?)
  `);
  
  let answerCount = 0;
  users.forEach(user => {
    // Each user answers 5 random questions
    for (let i = 0; i < 5 && i < questions.length; i++) {
      const isCorrect = Math.random() > 0.5 ? 1 : 0;
      const selected = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
      try {
        answerStmt.run(questions[i].id, selected, isCorrect);
        answerCount++;
      } catch (e) {}
    }
  });
  console.log(`✅ Created ${answerCount} test answers`);
}

console.log('\n📊 Current Users:');
const allUsers = db.prepare('SELECT username, email, role, created_at FROM users ORDER BY created_at').all();
allUsers.forEach(u => {
  console.log(`   - ${u.username.padEnd(15)} | ${u.email.padEnd(25)} | ${u.role.padEnd(10)}`);
});

console.log('\n✅ Test users created successfully!\n');

db.close();
