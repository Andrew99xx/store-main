import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const WareHouseAuthContext = createContext();

export const useWareHouseAuth = () => useContext(WareHouseAuthContext);

export const WareHouseAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    signOut(auth);
  };

  return (
    <WareHouseAuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </WareHouseAuthContext.Provider>
  );
};
