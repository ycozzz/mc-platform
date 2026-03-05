const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'mc.db'));
db.pragma('journal_mode = WAL');

const text = fs.readFileSync(process.argv[2], 'utf8');
const topicName = process.argv[3] || 'Imported Questions';
const description = process.argv[4] || '';

// Create topic
const topicStmt = db.prepare('INSERT INTO topics (name, description) VALUES (?, ?)');
const topicResult = topicStmt.run(topicName, description);
const topicId = topicResult.lastInsertRowid;

// Split by "Question #:N"
const parts = text.split(/Question #:(\d+)/);
const stmt = db.prepare(
  `INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);

let ok = 0, skip = 0;
for (let i = 1; i < parts.length; i += 2) {
  const num = parts[i];
  const block = parts[i + 1] || '';

  const ansMatch = block.match(/Answer:\s*([A-D])\b/);
  if (!ansMatch) { skip++; continue; }
  const correct = ansMatch[1];

  const beforeAnswer = block.substring(0, block.indexOf('Answer:'));

  const optA = beforeAnswer.match(/\nA\.\s+([\s\S]*?)(?=\nB\.)/);
  const optB = beforeAnswer.match(/\nB\.\s+([\s\S]*?)(?=\nC\.|\nAnswer:)/);
  const optC = beforeAnswer.match(/\nC\.\s+([\s\S]*?)(?=\nD\.|\nAnswer:)/);
  const optD = beforeAnswer.match(/\nD\.\s+([\s\S]*?)$/);

  if (!optA || !optB) { skip++; continue; }

  const firstA = beforeAnswer.indexOf('\nA.');
  if (firstA === -1) { skip++; continue; }

  const question = beforeAnswer.substring(0, firstA)
    .replace(/CyberArk - PAM-DEF/g, '')
    .replace(/店铺：学习小店66/g, '')
    .replace(/\d+ of \d+/g, '')
    .replace(/\n+/g, ' ').trim();

  if (!question) { skip++; continue; }

  const clean = s => s ? s[1].replace(/\n+/g, ' ').trim() : '-';

  const afterAnswer = block.substring(block.indexOf('Answer:'));
  const expMatch = afterAnswer.match(/Explanation\s+([\s\S]*?)(?=References:|Question #:|$)/);
  let explanation = expMatch ? expMatch[1].replace(/\n+/g, ' ').trim() : '';
  if (explanation.length > 1500) explanation = explanation.substring(0, 1500) + '...';

  try {
    stmt.run(topicId, question, clean(optA), clean(optB), clean(optC), clean(optD), correct, explanation);
    ok++;
  } catch (e) {
    console.error(`Q#${num}: ${e.message}`);
  }
}

console.log(`✅ Imported ${ok} questions into topic "${topicName}" (skipped ${skip})`);
