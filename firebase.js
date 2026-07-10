

const firebaseConfig = {
  apiKey: "AIzaSyA3XNJMXm5vG8InUHKqcR57RzlbD2sAAvM",
  authDomain: "kitchentest-2d072.firebaseapp.com",
  projectId: "kitchentest-2d072",
  storageBucket: "kitchentest-2d072.firebasestorage.app",
  messagingSenderId: "448725819335",
  appId: "1:448725819335:web:028eb7e3923f1b163f03e2",
  measurementId: "G-CZTCSGJZBW"
};

// 初期化（compat版）
firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();

// グローバル公開（iOS12対策）
window.db = db;
