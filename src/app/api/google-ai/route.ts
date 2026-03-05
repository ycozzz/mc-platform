import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { question, options, correctAnswer } = await req.json();
    
    // Build search query
    const query = `${question} ${options.A} ${options.B} ${options.C} ${options.D} correct answer explanation`;
    
    // Use Google search with AI overview
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&udm=14`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = await response.text();
    
    // Try to extract AI overview content
    // Google AI overview is usually in a specific div
    const aiMatch = html.match(/<div[^>]*data-attrid="AIOverview"[^>]*>([\s\S]*?)<\/div>/i);
    
    if (aiMatch) {
      // Clean HTML tags
      let aiText = aiMatch[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      return NextResponse.json({ 
        success: true, 
        explanation: aiText,
        source: 'Google AI Overview'
      });
    }
    
    // Fallback: return search URL for manual check
    return NextResponse.json({ 
      success: false, 
      searchUrl,
      message: 'No AI overview found. You can search manually.'
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
