import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import db from '@/lib/db';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const topicName = formData.get('topicName') as string;
    const description = formData.get('description') as string;

    if (!file || !topicName) {
      return NextResponse.json({ error: 'Missing file or topic name' }, { status: 400 });
    }

    // Save uploaded PDF
    const uploadDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfPath = path.join(uploadDir, `${Date.now()}-${file.name}`);
    await writeFile(pdfPath, buffer);

    // Extract text
    const txtPath = path.join(uploadDir, `${Date.now()}.txt`);
    await execAsync(`pdftotext "${pdfPath}" "${txtPath}"`);

    // Create topic
    const topicStmt = db.prepare('INSERT INTO topics (name, description) VALUES (?, ?)');
    const topicResult = topicStmt.run(topicName, description || '');
    const topicId = topicResult.lastInsertRowid;

    // Parse and import questions
    const fs = require('fs');
    const text = fs.readFileSync(txtPath, 'utf8');
    const parts = text.split(/Question #:(\d+)/);
    
    const stmt = db.prepare(
      `INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    let imported = 0;
    for (let i = 1; i < parts.length; i += 2) {
      const block = parts[i + 1] || '';
      const ansMatch = block.match(/Answer:\s*([A-D])\b/);
      if (!ansMatch) continue;
      
      const correct = ansMatch[1];
      const beforeAnswer = block.substring(0, block.indexOf('Answer:'));
      
      const optA = beforeAnswer.match(/\nA\.\s+([\s\S]*?)(?=\nB\.)/);
      const optB = beforeAnswer.match(/\nB\.\s+([\s\S]*?)(?=\nC\.|\nAnswer:)/);
      const optC = beforeAnswer.match(/\nC\.\s+([\s\S]*?)(?=\nD\.|\nAnswer:)/);
      const optD = beforeAnswer.match(/\nD\.\s+([\s\S]*?)$/);
      
      if (!optA || !optB) continue;
      
      const firstA = beforeAnswer.indexOf('\nA.');
      if (firstA === -1) continue;
      
      const question = beforeAnswer.substring(0, firstA)
        .replace(/CyberArk - PAM-DEF/g, '')
        .replace(/店铺：学习小店66/g, '')
        .replace(/\d+ of \d+/g, '')
        .replace(/\n+/g, ' ').trim();
      
      if (!question) continue;
      
      const clean = (s: any) => s ? s[1].replace(/\n+/g, ' ').trim() : '-';
      
      const afterAnswer = block.substring(block.indexOf('Answer:'));
      const expMatch = afterAnswer.match(/Explanation\s+([\s\S]*?)(?=References:|Question #:|$)/);
      let explanation = expMatch ? expMatch[1].replace(/\n+/g, ' ').trim() : '';
      if (explanation.length > 1500) explanation = explanation.substring(0, 1500) + '...';
      
      try {
        stmt.run(topicId, question, clean(optA), clean(optB), clean(optC), clean(optD), correct, explanation);
        imported++;
      } catch (e) {}
    }

    return NextResponse.json({ topicId, imported });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
