// backend/geminiService.js

/**
 * Extracts the first `{ ... }` JSON block from a string.
 * Falls back to the original text if no JSON-like block is found.
 */
function extractFirstJSONBlock(text) {
  const match = text.match(/(\{[\s\S]*\})/);
  return match ? match[1] : text;
}

export async function fetchGeminiInfo(capsule, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are an expert technical explainer.

Your task is to provide structured information about the following technology: "${capsule}".

Return only a valid JSON object in this format:

{
  "description": "A concise, beginner-friendly explanation of the technology. Maximum 100 words.",
  "resources": [
    { "title": "Descriptive Title", "url": "https://example.com/resource1" }
  ],
  "learningSteps": [
    "Step 1...",
    "Step 2...",
    "Step 3..."
  ],
  "codeExample": "<p>This is an example snippet</p>",
  "relatedTechnologies": ["Tag1", "Tag2", "Tag3"]
}

Strict instructions:
- Do not include any text outside the JSON object.
- Do not embed JSON inside other fields.
- Return only valid JSON.
- Return 3 to 6 learningSteps.
- Return 1 codeExample as a single string.
- Return 3 to 5 relatedTechnologies as string array.
- Ensure resources array has 3 to 5 items with valid title and URL.
`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API error: ${await response.text()}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON block
    const jsonBlock = extractFirstJSONBlock(rawText);
    let parsed;

    try {
      parsed = JSON.parse(jsonBlock);
    } catch (e) {
      return {
        description: rawText.trim(),
        resources: [],
        learningSteps: [],
        codeExample: '',
        relatedTechnologies: []
      };
    }

    // Validate fields and apply fallbacks
    return {
      description:
        typeof parsed.description === 'string'
          ? parsed.description.trim()
          : rawText.trim(),

      resources: Array.isArray(parsed.resources)
        ? parsed.resources
            .filter(r => r && typeof r.title === 'string' && typeof r.url === 'string')
            .slice(0, 5)
        : [],

      learningSteps: Array.isArray(parsed.learningSteps)
        ? parsed.learningSteps.filter(step => typeof step === 'string').slice(0, 6)
        : [],

      codeExample: typeof parsed.codeExample === 'string' ? parsed.codeExample.trim() : '',

      relatedTechnologies: Array.isArray(parsed.relatedTechnologies)
        ? parsed.relatedTechnologies.filter(tag => typeof tag === 'string').slice(0, 5)
        : []
    };
  } catch (err) {
    console.error('Gemini fetch error:', err);
    throw new Error('Failed to fetch AI info');
  }
}
