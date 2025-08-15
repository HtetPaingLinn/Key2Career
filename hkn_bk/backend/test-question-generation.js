const { questionAnswerPrompt, areQuestionsSimilar, filterSimilarQuestions } = require('./utils/prompts');

// Test the enhanced question generation prompt
function testQuestionGeneration() {
  console.log('=== Testing Enhanced Question Generation ===\n');
  
  const role = 'Software Engineer';
  const experience = '3';
  const topicsToFocus = 'JavaScript, React, Node.js, Database Design';
  const numberOfQuestions = 5;
  const existingQuestions = [
    'What is JavaScript?',
    'Explain React components',
    'How does Node.js work?',
    'What are databases?'
  ];
  
  const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions, existingQuestions);
  
  console.log('Generated Prompt:');
  console.log(prompt);
  console.log('\n=== Prompt Length ===');
  console.log(`Characters: ${prompt.length}`);
  console.log(`Lines: ${prompt.split('\n').length}`);
}

// Test similarity detection
function testSimilarityDetection() {
  console.log('\n=== Testing Similarity Detection ===\n');
  
  const questions = [
    'What is JavaScript?',
    'Explain JavaScript programming language',
    'How does React work?',
    'What are React components?',
    'Explain Node.js architecture',
    'How does Node.js handle requests?',
    'What is a database?',
    'Explain database management systems'
  ];
  
  console.log('Original Questions:');
  questions.forEach((q, i) => console.log(`${i + 1}. ${q}`));
  
  const filtered = filterSimilarQuestions(questions, 0.6);
  
  console.log('\nAfter Similarity Filtering:');
  filtered.forEach((q, i) => console.log(`${i + 1}. ${q}`));
  
  console.log(`\nFiltered from ${questions.length} to ${filtered.length} questions`);
}

// Test individual similarity checks
function testIndividualSimilarity() {
  console.log('\n=== Testing Individual Similarity Checks ===\n');
  
  const testPairs = [
    ['What is JavaScript?', 'Explain JavaScript programming language'],
    ['How does React work?', 'What are React components?'],
    ['What is a database?', 'Explain database management systems'],
    ['What is JavaScript?', 'How does Node.js work?'],
    ['Explain React components', 'What is a database?']
  ];
  
  testPairs.forEach(([q1, q2], i) => {
    const isSimilar = areQuestionsSimilar(q1, q2, 0.6);
    console.log(`Pair ${i + 1}: ${isSimilar ? 'SIMILAR' : 'DIFFERENT'}`);
    console.log(`  Q1: ${q1}`);
    console.log(`  Q2: ${q2}\n`);
  });
}

// Run all tests
function runAllTests() {
  testQuestionGeneration();
  testSimilarityDetection();
  testIndividualSimilarity();
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testQuestionGeneration,
  testSimilarityDetection,
  testIndividualSimilarity,
  runAllTests
};
