// Test script to verify Gemini API functionality
require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

console.log('=== Gemini API Test ===\n');

// Check API key
if (!process.env.GEMINI_API_KEY) {
  console.log('❌ GEMINI_API_KEY not found');
  process.exit(1);
}

console.log('✅ API key found, length:', process.env.GEMINI_API_KEY.length);

async function testGeminiAPI() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('✅ GoogleGenAI instance created');
    
    // Test with a simple prompt
    const testPrompt = "Generate a simple interview question about JavaScript. Return only the question, no JSON.";
    
    console.log('\n🔄 Testing API call...');
    console.log('Prompt:', testPrompt);
    
      const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    contents: testPrompt,
  });
    
    console.log('✅ API call successful!');
    console.log('Response:', response.text);
    
  } catch (error) {
    console.log('❌ API call failed:');
    console.log('Error:', error.message);
    console.log('Full error:', error);
    
    // Try alternative models
    console.log('\n🔄 Trying alternative models...');
    
    const alternativeModels = [
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "gemini-pro"
    ];
    
    for (const model of alternativeModels) {
      try {
        console.log(`\nTrying model: ${model}`);
        const response = await ai.models.generateContent({
          model: model,
          contents: testPrompt,
        });
        console.log(`✅ Model ${model} works!`);
        console.log('Response:', response.text);
        break;
      } catch (modelError) {
        console.log(`❌ Model ${model} failed:`, modelError.message);
      }
    }
  }
}

// Run the test
testGeminiAPI().catch(console.error);
