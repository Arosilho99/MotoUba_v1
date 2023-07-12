// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth,getReactNativePersistence } from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import 'firebase/database';



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBO1WnaGPD7nvb0bW1vFVuTYY5SjjqFF8w",
  authDomain: "motouba-c0009.firebaseapp.com",
  projectId: "motouba-c0009",
  storageBucket: "motouba-c0009.appspot.com",
  messagingSenderId: "161942031118",
  appId: "1:161942031118:web:0331483df8a96df20e655f",
  measurementId: "G-9JLNZ9W880"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app,{
  persistence: getReactNativePersistence(AsyncStorage)
})


export {auth};

