import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const topics = db.prepare(`
    SELECT t.*, 
           COUNT(DISTINCT q.id) as question_count,
           COUNT(DISTINCT a.id) as answer_count,
           SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
    FROM topics t
    LEFT JOIN questions q ON t.id = q.topic_id
    LEFT JOIN answers a ON q.id = a.question_id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `).all();
  return NextResponse.json(topics);
}

export async function POST(req: Request) {
  const { name, description } = await req.json();
  const stmt = db.prepare('INSERT INTO topics (name, description) VALUES (?, ?)');
  const result = stmt.run(name, description || '');
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
