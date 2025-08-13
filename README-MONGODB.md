# MongoDB User Data Sync

This document describes the MongoDB integration for syncing user data when users visit resume-related pages.

## Overview

When a logged-in user navigates to any of the following pages, their user data (name, email, bio, description, image URL) is automatically synced to MongoDB Atlas:

- `/resume-builder`
- `/resume-templates` 
- `/cv-customization`

## MongoDB Configuration

### Connection Details
- **Database**: `ForCVs`
- **Collection**: `userdata`
- **Connection String**: `mongodb+srv://htetpainglinn2822004:htetpainglinn@pollingapp.y6mvtbb.mongodb.net/?retryWrites=true&w=majority&appName=pollingApp`

### Data Structure
Each user document in the `userdata` collection contains:
```json
{
  "name": "User's full name",
  "email": "user@example.com",
  "bio": "User's bio text",
  "description": "User's description",
  "imageUrl": "https://cloudinary.com/...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "lastVisitedPage": "resume-templates",
  "lastSync": "2024-01-01T00:00:00.000Z"
}
```

## Implementation Details

### Files Created/Modified

1. **`lib/mongodb.js`** - MongoDB connection and sync utilities
2. **`lib/useUserSync.js`** - Custom React hook for user data synchronization
3. **`app/api/sync-user-data/route.js`** - API route for handling sync requests
4. **`app/resume-templates/page.js`** - Added sync functionality
5. **`app/resume-builder/page.js`** - Added sync functionality
6. **`app/cv-customization/page.js`** - New page with sync functionality

### How It Works

1. **Authentication Check**: The system checks if a JWT token exists in localStorage
2. **User Data Fetch**: If authenticated, it fetches user profile data from the Spring Boot backend
3. **MongoDB Sync**: The user data is then synced to MongoDB Atlas via an API route
4. **Status Display**: Sync status is displayed to the user (loading/error states)

### Dependencies

- `mongodb` - MongoDB Node.js driver
- Existing authentication system (JWT tokens)
- Spring Boot backend API

## Usage

The sync happens automatically when users visit the specified pages. No manual intervention is required.

### Sync Status Indicators

- **Loading**: Blue notification showing "Syncing user data..."
- **Error**: Red notification showing the specific error message
- **Success**: No visible notification (silent success)

## Security Considerations

- User data is only synced for authenticated users
- JWT tokens are validated before any sync operations
- MongoDB connection uses the provided credentials
- API routes include proper error handling

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check MongoDB Atlas connection string and credentials
2. **Authentication Error**: Ensure user is logged in with valid JWT
3. **Backend API Error**: Verify Spring Boot backend is running on localhost:8080

### Debug Information

Check browser console for detailed error messages and sync status logs.

## Future Enhancements

- Add retry mechanism for failed syncs
- Implement batch sync for multiple users
- Add sync history tracking
- Implement real-time sync notifications 