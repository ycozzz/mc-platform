import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { question, options, correctAnswer, originalExplanation } = await req.json();
    
    // Use your existing AI model to explain in Chinese
    const prompt = `請用中文解釋以下 MC 題目，並說明為什麼答案是 ${correctAnswer}：

題目：${question}

選項：
A. ${options.A}
B. ${options.B}
C. ${options.C}
D. ${options.D}

正確答案：${correctAnswer}

${originalExplanation ? `原有解釋：${originalExplanation}` : ''}

請提供清晰、準確的中文解釋（200字內）：`;

    // Call OpenClaw's AI (using the same model as the assistant)
    const aiResponse = await fetch('http://127.0.0.1:18789/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer d2da51e9dd9fabb28252699851d7f636ac6ede8a0d0cbe1d`
      },
      body: JSON.stringify({
        model: 'custom-aicanapi-com/claude-opus-4-6',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!aiResponse.ok) {
      throw new Error('AI request failed');
    }

    const data = await aiResponse.json();
    const explanation = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ 
      success: true, 
      explanation: explanation.trim(),
      source: 'AI 解釋'
    });
    
  } catch (error: any) {
    console.error('AI explanation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
