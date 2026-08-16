import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js';

// ============================================================
// GANTI BAGIAN INI DENGAN KONFIGURASI FIREBASE ANDA
// Firebase Console > Project settings > Your apps > Web app
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDV-psGAZvXGX-tFjpWF8V5Tqc7_fDqdGw",
  authDomain: "kasir-pro-673f6.firebaseapp.com",
  projectId: "kasir-pro-673f6",
  storageBucket: "kasir-pro-673f6.firebasestorage.app",
  messagingSenderId: "17655519926",
  appId: "1:17655519926:web:64fd375c04917708322417",
  measurementId: "G-BYXL8Z10FH"
};

export const isFirebaseConfigured = !Object.values(firebaseConfig).some(v => String(v).startsWith('ISI_'));
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
