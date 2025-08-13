# Apify LinkedIn Data Extraction Setup

## Overview
This guide will help you set up Apify for LinkedIn data extraction in your Key2Career application.

## Prerequisites
1. An Apify account (sign up at https://console.apify.com/)
2. Your Apify API token

## Setup Steps

### 1. Get Your Apify API Token
1. Go to https://console.apify.com/
2. Sign in to your account
3. Go to Account → Integrations
4. Copy your API token

### 2. Configure Environment Variables
Create a `.env.local` file in your Key2Career directory with the following content:

```env
# Apify API Token for LinkedIn data extraction
APIFY_API_TOKEN=your_apify_api_token_here

# GROQ API Key for AI enhancement (optional)
GROQ_API_KEY=your_groq_api_key_here
```

Replace `your_apify_api_token_here` with your actual Apify API token.

### 3. Test the Integration
1. Start your development server: `npm run dev`
2. Go to the CV customization page
3. Click "Import Data" → "LinkedIn"
4. Enter a LinkedIn profile URL
5. The system will extract real data from the LinkedIn profile

## How It Works
- The system uses Apify's LinkedIn Profile Scraper actor (ID: e1xYKjtHLG2Js5YdC)
- It extracts comprehensive profile data including:
  - Personal information (name, headline, location, etc.)
  - Work experience
  - Education
  - Skills
  - Certifications
  - Languages
  - Publications
  - Awards

## Troubleshooting
- **"Apify API token not configured"**: Make sure you've set the `APIFY_API_TOKEN` in your `.env.local` file
- **"No data found"**: Check that the LinkedIn URL is valid and the profile is public
- **Extraction fails**: Verify your Apify account has sufficient credits

## Cost
- Apify charges based on usage (credits consumed per extraction)
- Check your Apify account for current pricing and credit balance

## Security
- Never commit your API token to version control
- The `.env.local` file is already in `.gitignore`
- Keep your API token secure and don't share it publicly 