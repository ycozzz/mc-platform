import { NextResponse } from 'next/server';
import { createUser, getUserByUsername, getUserByEmail } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, email, password, displayName } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (getUserByUsername(username)) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    if (getUserByEmail(email)) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const result = createUser(username, email, password, displayName);
    
    return NextResponse.json({ 
      success: true, 
      userId: result.lastInsertRowid 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
