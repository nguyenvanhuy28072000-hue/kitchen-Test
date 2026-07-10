

const firebaseConfig = {
  apiKey: "AIzaSyBzlvVUxZrMaU8OxYve9GNts1ZdCz35CWk",
  authDomain: "kitchen-app-31fa9.firebaseapp.com",
  projectId: "kitchen-app-31fa9",
  storageBucket: "kitchen-app-31fa9.firebasestorage.app",
  messagingSenderId: "18408555856",
  appId: "1:18408555856:web:92c8e60694715661f5d855",
  measurementId: "G-H3N20HZ09Z"
};

// 初期化（compat版）
firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();

// グローバル公開（iOS12対策）
window.db = db;
