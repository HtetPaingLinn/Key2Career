// Groq API utility for text generation and grammar checking
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-70b-8192';

async function callGroq(messages) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 512,
      temperature: 0.7
    })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Groq API error:', res.status, errorText);
    throw new Error(`Groq API error: ${res.status} - ${errorText}`);
  }
  
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function generateDescription(userPrompt, context) {
  const systemPrompt = `You are a helpful assistant for CV writing. Only generate a description for the following field. Do not mention other projects, jobs, or unrelated information. Only return the description text itself, with no introductory phrases, no quotes, and no extra commentary. Context: ${context}`;
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];
  return callGroq(messages);
}

export async function checkGrammar(text) {
  const grammarPrompt = `Correct the grammar and spelling of the following text, but do not change its meaning or add unrelated content. Only return the corrected text itself, with no introductory phrases, no quotes, and no extra commentary.`;
  const messages = [
    { role: 'system', content: grammarPrompt },
    { role: 'user', content: text }
  ];
  return callGroq(messages);
} 