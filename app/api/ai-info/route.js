import { NextResponse } from 'next/server';
import { fetchGeminiInfo } from '../../../backend/geminiService';

export async function POST(req) {
  try {
    const { capsule } = await req.json();
    if (!capsule) {
      return NextResponse.json({ error: 'Capsule is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not set.' }, { status: 500 });
    }

    const result = await fetchGeminiInfo(capsule, apiKey);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}