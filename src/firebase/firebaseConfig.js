import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC9B-D2YC4pJkfEWtohlAU0ojsmQAvnFAo",
    authDomain: "lies-502a0.firebaseapp.com",
    databaseURL: "https://lies-502a0-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "lies-502a0",
    storageBucket: "lies-502a0.firebasestorage.app",
    messagingSenderId: "572668099775",
    appId: "1:572668099775:web:7d8f0f5402eb9bba3ada0a",
    measurementId: "G-RB5GMC0XQC"
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const auth = getAuth(app);

export { database, ref, set, get, auth };
