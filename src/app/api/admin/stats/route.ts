import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = {
    totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get() as any,
    totalTopics: db.prepare('SELECT COUNT(*) as count FROM topics').get() as any,
    totalQuestions: db.prepare('SELECT COUNT(*) as count FROM questions').get() as any,
    totalAnswers: db.prepare('SELECT COUNT(*) as count FROM answers').get() as any,
  };

  return NextResponse.json({
    totalUsers: stats.totalUsers.count,
    totalTopics: stats.totalTopics.count,
    totalQuestions: stats.totalQuestions.count,
    totalAnswers: stats.totalAnswers.count,
  });
}
