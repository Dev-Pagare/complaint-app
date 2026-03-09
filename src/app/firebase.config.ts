import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "APNI_KEY_YAHAN",
  authDomain:        "complaint-app1-xxxx.firebaseapp.com",
  projectId:         "complaint-app1-xxxx",
  storageBucket:     "complaint-app1-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abcd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);