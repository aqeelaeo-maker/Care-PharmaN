import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2rzMLmb6lTloquL-EjPZEl85LH9SEy6U",
  authDomain: "carepharma-1d8a4.firebaseapp.com",
  projectId: "carepharma-1d8a4",
  storageBucket: "carepharma-1d8a4.firebasestorage.app",
  messagingSenderId: "455969887084",
  appId: "1:455969887084:web:2d5efaf9db00df5d4b9949",
  measurementId: "G-Q4LMLLQ6WX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
