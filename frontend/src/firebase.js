import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCm1luQ9QTdZf3T6lVm4uvRnxHOge1AwgI",
    authDomain: "fleurease-e18ea.firebaseapp.com",
    projectId: "fleurease-e18ea",
    storageBucket: "fleurease-e18ea.firebasestorage.app",
    messagingSenderId: "235554798693",
    appId: "1:235554798693:web:625e49247db69e3ae7da8c",
    measurementId: "G-6NYM7NE7PJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Google Sign In function
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Return user data in a clean format
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
        };
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        throw error;
    }
};
