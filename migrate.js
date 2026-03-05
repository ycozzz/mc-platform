const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mc.db');
const db = new Database(dbPath);

console.log('Starting migration...');

// Check if old schema exists
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
const hasOldSchema = tables.some(t => t.name === 'questions') && 
  !tables.some(t => t.name === 'topics');

if (!hasOldSchema) {
  console.log('✅ Already migrated or fresh install');
  process.exit(0);
}

// Backup old data
console.log('Backing up old questions...');
const oldQuestions = db.prepare('SELECT * FROM questions').all();
const oldAnswers = db.prepare('SELECT * FROM answers').all();

// Drop old tables
db.exec('DROP TABLE IF EXISTS answers');
db.exec('DROP TABLE IF EXISTS questions');

// Create new schema
console.log('Creating new schema...');
db.exec(`
  CREATE TABLE topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE questions (
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

  CREATE TABLE answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected TEXT NOT NULL CHECK(selected IN ('A','B','C','D')),
    is_correct BOOLEAN NOT NULL,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_questions_topic ON questions(topic_id);
  CREATE INDEX idx_answers_question ON answers(question_id);
`);

// Migrate data
console.log('Migrating data...');

// Group old questions by topic
const topicMap = new Map();
for (const q of oldQuestions) {
  const topic = q.topic || 'Imported Questions';
  if (!topicMap.has(topic)) {
    topicMap.set(topic, []);
  }
  topicMap.get(topic).push(q);
}

// Create topics and migrate questions
const topicStmt = db.prepare('INSERT INTO topics (name) VALUES (?)');
const questionStmt = db.prepare(
  `INSERT INTO questions (id, topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

for (const [topicName, questions] of topicMap.entries()) {
  const result = topicStmt.run(topicName);
  const topicId = result.lastInsertRowid;
  
  for (const q of questions) {
    questionStmt.run(
      q.id, topicId, q.question, q.option_a, q.option_b, q.option_c, q.option_d,
      q.correct_answer, q.explanation, q.created_at
    );
  }
}

// Migrate answers
const answerStmt = db.prepare(
  'INSERT INTO answers (id, question_id, selected, is_correct, answered_at) VALUES (?, ?, ?, ?, ?)'
);
for (const a of oldAnswers) {
  answerStmt.run(a.id, a.question_id, a.selected, a.is_correct, a.answered_at);
}

console.log(`✅ Migrated ${oldQuestions.length} questions and ${oldAnswers.length} answers`);
console.log(`✅ Created ${topicMap.size} topics`);
