import React, { createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8cSh1ix6SjtGmuZ7Cjo4RNzGbSc0j4sQ",
  authDomain: "usbs-ngo.firebaseapp.com",
  projectId: "usbs-ngo",
  storageBucket: "usbs-ngo.firebasestorage.app",
  messagingSenderId: "418381066833",
  appId: "1:418381066833:web:88ee40aca67849939a3e70",
  measurementId: "G-HWR9WBMT2J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

interface FirebaseContextType {
  auth: typeof auth;
  db: typeof db;
}

const FirebaseContext = createContext<FirebaseContextType>({
  auth,
  db,
});

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <FirebaseContext.Provider value={{ auth, db }}>
      {children}
    </FirebaseContext.Provider>
  );
};
