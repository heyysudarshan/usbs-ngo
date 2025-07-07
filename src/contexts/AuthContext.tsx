import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "./FirebaseContext";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  currentUserMobile: string | null;
  setCurrentUserMobile: (mobile: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserMobile, setCurrentUserMobile] = useState<string | null>(
    localStorage.getItem("currentUserMobile")
  );
  const { auth, db } = useFirebase();

  useEffect(() => {
    // Ensure Firebase uses local persistence
    setPersistence(auth, browserLocalPersistence).catch((err) =>
      console.error("Persistence error:", err)
    );

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.uid));
          const isAdminUser = adminDoc.exists();
          setIsAdmin(isAdminUser);
          localStorage.setItem("isAdmin", String(isAdminUser));
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          localStorage.setItem("isAdmin", "false");
        }
      } else {
        setIsAdmin(false);
        localStorage.setItem("isAdmin", "false");
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [auth, db]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    setCurrentUserMobile(null);
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("currentUserMobile");
  };

  const setUserMobile = (mobile: string | null) => {
    setCurrentUserMobile(mobile);
    if (mobile) {
      localStorage.setItem("currentUserMobile", mobile);
    } else {
      localStorage.removeItem("currentUserMobile");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        login,
        logout,
        currentUserMobile,
        setCurrentUserMobile: setUserMobile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
