/**
 * LeafGuard AI - Firebase Configuration
 * Initializes Firebase Auth and Firestore for user-specific history storage
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, deleteDoc, writeBatch, onSnapshot } from "firebase/firestore";

// Firebase configuration - uses environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate required config
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0 && import.meta.env.PROD) {
  console.warn(`[Firebase] Missing required config keys: ${missingKeys.join(', ')}. Firebase features will be disabled.`);
}

// Initialize Firebase
let app, auth, db;

if (missingKeys.length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('[Firebase] Initialized successfully');
  } catch (e) {
    console.error('[Firebase] Initialization failed:', e);
  }
} else {
  console.warn('[Firebase] Not initialized - missing config. History will use local storage only.');
}

// Auth helpers
export const firebaseAuth = auth;
export const firebaseDb = db;

export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
export const updateUserProfile = (profile) => updateProfile(auth.currentUser, profile);

// Firestore helpers for scan history
export const SCANS_COLLECTION = 'scans';

/**
 * Save a scan report to Firestore
 * @param {string} userId - Authenticated user's UID
 * @param {Object} scanData - Scan report data (no images)
 * @returns {Promise<string>} Document ID
 */
export const saveScanReport = async (userId, scanData) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const scanRef = doc(collection(db, SCANS_COLLECTION));
  const scanDoc = {
    ...scanData,
    userId,
    createdAt: new Date().toISOString(),
    // Explicitly exclude image data - only store metadata
    originalImageUrl: null,
    gradcamImageUrl: null,
  };
  
  await setDoc(scanRef, scanDoc);
  return scanRef.id;
};

/**
 * Get all scan reports for a user
 * @param {string} userId - Authenticated user's UID
 * @returns {Promise<Array>} Array of scan reports
 */
export const getUserScans = async (userId) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const q = query(
    collection(db, SCANS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Delete a single scan report from Firestore
 * @param {string} userId - Authenticated user's UID
 * @param {string} scanId - Document ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteScanReport = async (userId, scanId) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const scanRef = doc(db, SCANS_COLLECTION, scanId);
  const scanSnap = await getDoc(scanRef);
  
  if (!scanSnap.exists()) {
    throw new Error('Scan not found');
  }
  
  const scanData = scanSnap.data();
  if (scanData.userId !== userId) {
    throw new Error('Unauthorized: Cannot delete another user\'s scan');
  }
  
  await deleteDoc(scanRef);
  return true;
};

/**
 * Clear all scan reports for a user
 * @param {string} userId - Authenticated user's UID
 * @returns {Promise<number>} Number of deleted reports
 */
export const clearUserScans = async (userId) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const q = query(
    collection(db, SCANS_COLLECTION),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return 0;
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  return snapshot.size;
};

/**
 * Real-time listener for user's scans
 * @param {string} userId - Authenticated user's UID
 * @param {Function} callback - Called with array of scans on each change
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserScans = (userId, callback) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const q = query(
    collection(db, SCANS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const scans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(scans);
  });
};

export const isFirebaseEnabled = () => !!db && !!auth;