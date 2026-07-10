

const firebaseConfig = {
  apiKey: "AIzaSyAmiQJhvFReL4NycpFww6fnot3aqfxdv4E",
  authDomain: "kitchen-test-44498.firebaseapp.com",
  projectId: "kitchen-test-44498",
  storageBucket: "kitchen-test-44498.firebasestorage.app",
  messagingSenderId: "1068491186181",
  appId: "1:1068491186181:web:785ebd7afe98328ad67c6c",
 
};

// 初期化（compat版）
firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();

// グローバル公開（iOS12対策）
window.db = db;
