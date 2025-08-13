import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app;
let auth;
let db;

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  if (!getApps().length) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);

  return { auth, db };
}

// Initialize only if not already initialized
if (!auth || !db) {
  const firebase = initFirebaseAdmin();
  auth = firebase.auth;
  db = firebase.db;
}

export { auth, db };
