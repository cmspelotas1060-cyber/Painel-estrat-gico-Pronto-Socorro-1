import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

/**
 * Test the connection to Firestore to ensure everything is configured correctly.
 */
async function testConnection() {
  try {
    // Attempt to fetch a non-existent document to trigger network check
    await getDocFromServer(doc(db, '_internal_', 'connection_test'));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase is offline. Please check your configuration.");
    } else {
      // Ignore valid errors like permission denied if auth isn't set up yet, 
      // as long as the network call reached the server.
      console.log("Firebase connection test performed.");
    }
  }
}

testConnection();
