// Test script to verify API key configuration
require('dotenv').config();

console.log('=== API Key Configuration Test ===\n');

// Check if .env file is loaded
if (process.env.GEMINI_API_KEY) {
  console.log('✅ GEMINI_API_KEY is set');
  console.log('Key length:', process.env.GEMINI_API_KEY.length);
  console.log('Key starts with:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
} else {
  console.log('❌ GEMINI_API_KEY is NOT set');
  console.log('\nTo fix this:');
  console.log('1. Create a .env file in the backend directory');
  console.log('2. Add: GEMINI_API_KEY=your_actual_api_key_here');
  console.log('3. Get your API key from: https://makersuite.google.com/app/apikey');
}

console.log('\n=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('MONGODB_URI exists:', process.env.MONGODB_URI ? 'Yes' : 'No');

console.log('\n=== Next Steps ===');
if (!process.env.GEMINI_API_KEY) {
  console.log('1. Get a Gemini API key from Google AI Studio');
  console.log('2. Create a .env file with your API key');
  console.log('3. Restart your server');
} else {
  console.log('✅ API key is configured. You can now test question generation!');
}
