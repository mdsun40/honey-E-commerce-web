/* ============================================================
   FIREBASE CONFIG & INITIALIZATION
   Connects this site to the Realtime Database + Auth backend.
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyADgnuNJfv2K6FSeVNq_kTr2fTX9N0ZPxc",
  authDomain: "naturals-organic.firebaseapp.com",
  databaseURL: "https://naturals-organic-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "naturals-organic",
  storageBucket: "naturals-organic.firebasestorage.app",
  messagingSenderId: "853458221573",
  appId: "1:853458221573:web:73656e102177625388fa6c",
  measurementId: "G-SXGBJRJME7"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
let isAdmin = false;
