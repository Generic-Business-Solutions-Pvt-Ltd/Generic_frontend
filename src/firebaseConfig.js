import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD9My0x-mgjHAkvULxGdgMrR9pjhCzNkiA',
  authDomain: 'samsung-generic.firebaseapp.com',
  projectId: 'samsung-generic',
  storageBucket: 'samsung-generic.firebasestorage.app',
  messagingSenderId: '490356922935',
  appId: '1:490356922935:web:38f47ed3592b63041c3db2',
  measurementId: 'G-6GXPGLVPHG',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
