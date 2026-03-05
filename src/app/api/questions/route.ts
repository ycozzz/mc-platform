import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const questions = db.prepare('SELECT * FROM questions ORDER BY id DESC').all();
  return NextResponse.json(questions);
}
