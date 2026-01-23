// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBCsZQ_8lgjZ3dL_LwcfqaEQBD2NkaYO5Y",
    authDomain: "aura-89086.firebaseapp.com",
    projectId: "aura-89086",
    storageBucket: "aura-89086.firebasestorage.app",
    messagingSenderId: "891061616279",
    appId: "1:891061616279:web:fede228733cc6dddd573d2",
    measurementId: "G-KMG3SR438Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, analytics, messaging };