// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB2mCRR5qM97qny6GLTfcPAsr_lQYTGXJM",
  authDomain: "inventory-management-aa2cd.firebaseapp.com",
  projectId: "inventory-management-aa2cd",
  storageBucket: "inventory-management-aa2cd.appspot.com",
  messagingSenderId: "332468251632",
  appId: "1:332468251632:web:3f4a6a4e1356dd2be7cb35",
  measurementId: "G-JVSYFV8YNL"
};

const app = initializeApp(firebaseConfig);

let firestore = null;
let storage = null;
if (typeof window !== 'undefined') {
  firestore = getFirestore(app);
  storage = getStorage(app);
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

export { firestore, storage };
