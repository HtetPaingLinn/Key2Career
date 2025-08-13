# Voice Interview Setup Guide

This guide will help you set up the Voice Interview feature that has been integrated into the Key2Career project.

## Overview

The Voice Interview feature allows users to practice interviews with AI-powered voice assistants and receive detailed feedback. It uses Firebase for data storage and Vapi.ai for voice interactions.

## Dependencies Installed

The following dependencies have been added to the project:

```bash
npm install @vapi-ai/web@^2.3.8
npm install @ai-sdk/google@^1.2.22
npm install ai@^4.3.18
npm install firebase@^11.10.0
npm install firebase-admin@^13.4.0
npm install @hookform/resolvers@^4.1.3
npm install react-hook-form@^7.54.2
npm install dayjs@^1.11.13
npm install @types/node@^20
npm install @types/react@^19
npm install @types/react-dom@^19
npm install typescript@^5
```

## Environment Variables Required

Add these environment variables to your `.env.local` file:

### Firebase Configuration (Client)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Admin (Server)
```bash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_service_account_private_key
```

### Vapi.ai Configuration
```bash
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id
```

### Google AI (for feedback generation)
```bash
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

## Firebase Setup

1. **Create a Firebase project** at https://console.firebase.google.com/

2. **Enable Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Choose a location close to your users

3. **Create the following collections**:
   - `users` - Stores user information
   - `interviews` - Stores interview data
   - `feedback` - Stores interview feedback

4. **Set up Firebase Authentication** (if not already done):
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication

5. **Generate service account key**:
   - Go to Project Settings > Service accounts
   - Generate new private key
   - Use the credentials for server-side environment variables

## Vapi.ai Setup

1. **Create a Vapi.ai account** at https://vapi.ai/

2. **Get your API tokens**:
   - Go to your dashboard
   - Copy the Web SDK token for `NEXT_PUBLIC_VAPI_WEB_TOKEN`
   - Create a workflow and copy its ID for `NEXT_PUBLIC_VAPI_WORKFLOW_ID`

3. **Configure voice assistant**:
   - Set up voice models (11labs recommended)
   - Configure transcription (Deepgram recommended)
   - Set up the AI model (OpenAI GPT-4 recommended)

## Google AI Setup

1. **Get Google AI API key**:
   - Go to https://makersuite.google.com/app/apikey
   - Create a new API key
   - Use it for `GOOGLE_AI_API_KEY`

## Asset Files to Copy

Copy these image files from the Interview-with-Voice-Agent project to Key2Career/public/:

```bash
# Copy interview-related images
cp "Interview-with-Voice-Agent/public/ai-avatar.png" "Key2Career/public/"
cp "Interview-with-Voice-Agent/public/BladeRunner_Style_539x539.png" "Key2Career/public/"
cp "Interview-with-Voice-Agent/public/imageR.png" "Key2Career/public/"
cp "Interview-with-Voice-Agent/public/robot.png" "Key2Career/public/"
cp "Interview-with-Voice-Agent/public/user-avatar.png" "Key2Career/public/"

# Copy covers folder
cp -r "Interview-with-Voice-Agent/public/covers" "Key2Career/public/"

# Copy SVG icons
cp "Interview-with-Voice-Agent/public/calendar.svg" "Key2Career/public/"
cp "Interview-with-Voice-Agent/public/star.svg" "Key2Career/public/"
cp "Interview-with-Voice-Agent/public/tech.svg" "Key2Career/public/"
```

## Features Integrated

### 1. Voice Interview Dashboard
- **Route**: `/voice-interview`
- **Features**: 
  - View your past interviews
  - Browse available interviews from other users
  - Create new interviews

### 2. Interview Creation
- **Route**: `/voice-interview/create`
- **Features**:
  - AI-powered question generation
  - Voice interaction with Vapi.ai
  - Customizable interview parameters

### 3. Voice Interview Session
- **Route**: `/voice-interview/[id]`
- **Features**:
  - Real-time voice conversation with AI
  - Live transcription
  - Speaking indicators
  - Call controls (start/end)

### 4. Interview Feedback
- **Route**: `/voice-interview/[id]/feedback`
- **Features**:
  - Detailed performance analysis
  - Category-wise scoring
  - Strengths and improvement areas
  - Overall assessment

### 5. Navigation Integration
- Added "Voice Interview" to main navigation
- Added Voice Interview feature card to homepage

## Authentication Flow

The voice interview system integrates with your existing JWT authentication:

1. User logs in with JWT token
2. System extracts email from JWT
3. Checks/creates user record in Firebase `users` collection
4. All interviews and feedback are associated with the Firebase user ID

## API Endpoints

### 1. Interview Generation
- **Endpoint**: `/api/voice-interview/generate`
- **Method**: POST
- **Purpose**: Creates new interview questions using AI

### 2. Test Feedback
- **Endpoint**: `/api/voice-interview/test-feedback`
- **Method**: POST
- **Purpose**: Tests the feedback generation system

## Database Structure

### Users Collection
```javascript
{
  id: "firebase_generated_id",
  email: "user@example.com",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Interviews Collection
```javascript
{
  id: "firebase_generated_id",
  role: "Software Engineer",
  type: "Technical",
  level: "Senior",
  techstack: ["React", "Node.js", "MongoDB"],
  questions: ["Question 1", "Question 2"],
  userId: "firebase_user_id",
  finalized: true,
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### Feedback Collection
```javascript
{
  id: "firebase_generated_id",
  interviewId: "interview_id",
  userId: "firebase_user_id",
  totalScore: 85,
  categoryScores: [
    {
      name: "Communication Skills",
      score: 90,
      comment: "Excellent verbal communication"
    }
  ],
  strengths: ["Clear communication", "Technical knowledge"],
  areasForImprovement: ["Body language", "Confidence"],
  finalAssessment: "Overall strong performance...",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## Testing

To test the voice interview functionality:

1. **Install dependencies** using the npm install commands above
2. **Set up environment variables** as described
3. **Copy asset files** using the cp commands above
4. **Start the development server**: `npm run dev`
5. **Navigate to** `/voice-interview`
6. **Test the complete flow**:
   - Login with JWT token
   - Create a new interview
   - Take the interview
   - View feedback

## Troubleshooting

### Common Issues

1. **Firebase connection issues**:
   - Verify all Firebase environment variables are correct
   - Check Firebase project permissions
   - Ensure Firestore is enabled

2. **Vapi.ai connection issues**:
   - Verify Vapi.ai tokens are correct
   - Check microphone permissions in browser
   - Ensure HTTPS is used (required for microphone access)

3. **Google AI API issues**:
   - Verify Google AI API key is correct
   - Check API quotas and billing
   - Ensure the API is enabled in Google Cloud Console

4. **JWT integration issues**:
   - Verify JWT token format in localStorage
   - Check JWT token expiration
   - Ensure email field is present in JWT payload

### Debug Mode

The application includes debug information in development mode. Check the browser console for detailed logs about:
- JWT token parsing
- Firebase user creation/retrieval
- Vapi.ai connection status
- API call responses

## Next Steps

1. **Configure your Firebase project** with the required collections
2. **Set up Vapi.ai account** and configure voice assistants
3. **Install dependencies** and copy assets
4. **Test the complete flow** to ensure everything works
5. **Customize the UI/UX** as needed for your brand

The voice interview feature is now fully integrated and ready to use!
