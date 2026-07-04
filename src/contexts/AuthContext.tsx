import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  role: string | null;
  isAuthorized: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAuthorized: false,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Check if user is super admin
        if (firebaseUser.email === 'aqeelaeo@gmail.com') {
          setRole('Super Admin');
          setIsAuthorized(true);
        } else {
          // Check if email is in authorized list
          try {
            const docRef = doc(db, 'settings', 'authorized_emails');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const emails = docSnap.data().emails || [];
              if (emails.includes(firebaseUser.email)) {
                setRole('Admin'); // or whatever role
                setIsAuthorized(true);
              } else {
                setRole(null);
                setIsAuthorized(false);
              }
            } else {
              setRole(null);
              setIsAuthorized(false);
            }
          } catch (error) {
            console.error("Error checking authorization:", error);
            setIsAuthorized(false);
          }
        }
      } else {
        setUser(null);
        setRole(null);
        setIsAuthorized(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthorized, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
