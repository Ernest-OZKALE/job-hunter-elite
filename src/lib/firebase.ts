import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDlN1gKKRN1v6Cxro-0c-aiOnTqv6WBaOo",
  authDomain: "job-hunter-elite.firebaseapp.com",
  projectId: "job-hunter-elite",
  storageBucket: "job-hunter-elite.firebasestorage.app",
  messagingSenderId: "503263523556",
  appId: "1:503263523556:web:1536616cce3ceab54cb2f1",
  measurementId: "G-JWLMF9LPT9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = (() => {
  try { return getAnalytics(app); } catch { return null; }
})();

export default app;
