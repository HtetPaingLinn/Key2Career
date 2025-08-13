"use server";

import { auth, db } from "@/firebase/admin";
import { parseJWT } from "@/lib/jwtUtils";

/**
 * Check or create user in Firebase based on JWT token
 * @param {string} jwtToken - JWT token containing user email
 * @returns {Promise<{success: boolean, user?: any, message?: string}>}
 */
export async function checkOrCreateFirebaseUser(jwtToken) {
  try {
    if (!jwtToken) {
      return {
        success: false,
        message: "No authentication token provided"
      };
    }

    // Parse JWT to get user email
    const tokenData = parseJWT(jwtToken);
    if (!tokenData || !tokenData.email) {
      return {
        success: false,
        message: "Invalid authentication token"
      };
    }

    const userEmail = tokenData.email;

    // Check if user exists in Firebase users collection
    const usersCollection = db.collection("users");
    const querySnapshot = await usersCollection.where("email", "==", userEmail).limit(1).get();

    let userData;

    if (querySnapshot.empty) {
      // User doesn't exist, create new user record
      const newUserData = {
        email: userEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const userDocRef = usersCollection.doc();
      await userDocRef.set(newUserData);

      userData = {
        id: userDocRef.id,
        ...newUserData
      };

      console.log("Created new Firebase user:", userData);
    } else {
      // User exists, get existing data
      const userDoc = querySnapshot.docs[0];
      userData = {
        id: userDoc.id,
        ...userDoc.data(),
        updatedAt: new Date().toISOString()
      };

      // Update the user's last access time
      await userDoc.ref.update({
        updatedAt: new Date().toISOString()
      });

      console.log("Found existing Firebase user:", userData);
    }

    return {
      success: true,
      user: userData
    };

  } catch (error) {
    console.error("Error in checkOrCreateFirebaseUser:", error);
    return {
      success: false,
      message: "Failed to authenticate user"
    };
  }
}

/**
 * Get current user from JWT token
 * @param {string} jwtToken - JWT token containing user email
 * @returns {Promise<any|null>}
 */
export async function getCurrentUserFromJWT(jwtToken) {
  try {
    const result = await checkOrCreateFirebaseUser(jwtToken);
    if (result.success && result.user) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error in getCurrentUserFromJWT:", error);
    return null;
  }
}

/**
 * Check if user is authenticated based on JWT token
 * @param {string} jwtToken - JWT token containing user email
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated(jwtToken) {
  const user = await getCurrentUserFromJWT(jwtToken);
  return !!user;
}
