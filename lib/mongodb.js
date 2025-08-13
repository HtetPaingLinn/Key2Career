import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://htetpainglinn2822004:htetpainglinn@pollingapp.y6mvtbb.mongodb.net/?retryWrites=true&w=majority&appName=pollingApp';
const MONGODB_DB = 'ForCVs';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URI).then((client) => {
      console.log('MongoDB connected successfully');
      return {
        client,
        db: client.db(MONGODB_DB),
      };
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export async function syncUserData(userData) {
  try {
    console.log('Starting MongoDB sync for user:', userData.email);
    
    const connection = await connectToDatabase();
    console.log('MongoDB connection established');
    
    const { db } = connection;
    const collection = db.collection('userdata');
    
    console.log('Checking for existing user...');
    // Check if user already exists
    const existingUser = await collection.findOne({ email: userData.email });
    
    if (existingUser) {
      console.log('Updating existing user data...');
      // Update existing user data
      const updateResult = await collection.updateOne(
        { email: userData.email },
        { 
          $set: {
            name: userData.name,
            email: userData.email,
            bio: userData.bio || '',
            description: userData.description || '',
            imageUrl: userData.imageUrl || '',
            lastUpdated: new Date(),
            lastVisitedPage: userData.currentPage
          }
        }
      );
      console.log('User data updated in MongoDB:', updateResult);
    } else {
      console.log('Inserting new user data...');
      // Insert new user data
      const insertResult = await collection.insertOne({
        name: userData.name,
        email: userData.email,
        bio: userData.bio || '',
        description: userData.description || '',
        imageUrl: userData.imageUrl || '',
        createdAt: new Date(),
        lastUpdated: new Date(),
        lastVisitedPage: userData.currentPage
      });
      console.log('New user data inserted into MongoDB:', insertResult);
    }
    
    console.log('MongoDB sync completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error syncing user data to MongoDB:', error);
    return { success: false, error: error.message };
  }
} 