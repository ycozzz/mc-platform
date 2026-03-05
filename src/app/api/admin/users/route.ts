import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = db.prepare(`
    SELECT id, username, email, display_name, role, created_at, last_login
    FROM users
    ORDER BY created_at DESC
  `).all();

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, role } = await req.json();

  if (!['user', 'moderator', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(userId);

  return NextResponse.json({ success: true });
}
