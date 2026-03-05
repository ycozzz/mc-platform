import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const topicId = params.id;
  const questions = db.prepare('SELECT * FROM questions WHERE topic_id = ? ORDER BY id').all(topicId);
  return NextResponse.json(questions);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const topicId = params.id;
  const { question, option_a, option_b, option_c, option_d, correct_answer, explanation } = await req.json();

  const stmt = db.prepare(
    `INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const result = stmt.run(topicId, question, option_a, option_b, option_c, option_d, correct_answer, explanation || '');
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
