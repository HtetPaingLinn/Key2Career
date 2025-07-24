import { NextResponse } from 'next/server';
import { generateDescription, checkGrammar } from '@/lib/groq';

export async function POST(request) {
  const { type, prompt, context, text } = await request.json();
  try {
    if (type === 'description') {
      const result = await generateDescription(prompt, context);
      return NextResponse.json({ result });
    } else if (type === 'grammar') {
      const result = await checkGrammar(text);
      return NextResponse.json({ result });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 