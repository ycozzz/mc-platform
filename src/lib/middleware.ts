import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './session';

export function requireAuth(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;
  
  if (!sessionId) {
    return { authorized: false, user: null };
  }
  
  const session = getSession(sessionId);
  
  if (!session) {
    return { authorized: false, user: null };
  }
  
  return { 
    authorized: true, 
    user: {
      id: session.user_id,
      username: session.username,
      email: session.email,
      displayName: session.display_name,
      role: session.role,
      avatarUrl: session.avatar_url,
    }
  };
}

export function requireAdmin(req: NextRequest) {
  const auth = requireAuth(req);
  
  if (!auth.authorized || auth.user?.role !== 'admin') {
    return { authorized: false, user: null };
  }
  
  return auth;
}
