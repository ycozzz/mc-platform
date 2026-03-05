import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  const { question_id, selected } = await req.json();
  const q = db.prepare('SELECT correct_answer, explanation FROM questions WHERE id = ?').get(question_id) as any;
  if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const is_correct = selected === q.correct_answer;
  db.prepare('INSERT INTO answers (question_id, selected, is_correct) VALUES (?, ?, ?)').run(question_id, selected, is_correct ? 1 : 0);

  return NextResponse.json({ is_correct, correct_answer: q.correct_answer, explanation: q.explanation });
}

export async function GET() {
  const history = db.prepare(`
    SELECT a.*, q.question, q.correct_answer, q.explanation,
           q.option_a, q.option_b, q.option_c, q.option_d,
           t.name as topic
    FROM answers a 
    JOIN questions q ON a.question_id = q.id
    JOIN topics t ON q.topic_id = t.id
    ORDER BY a.answered_at DESC
  `).all();
  return NextResponse.json(history);
}
