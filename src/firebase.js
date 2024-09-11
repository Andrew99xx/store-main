import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

import { getFirestore,setDoc,FieldValue, increment,collection, addDoc, query, where,getDoc, getDocs, serverTimestamp, doc, updateDoc,deleteDoc,orderBy,limit } from "firebase/firestore";

const firebaseConfig = {
    
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app);

export {auth, db, collection,FieldValue, setDoc,addDoc,increment, query, where,getDoc, getDocs, serverTimestamp,doc, updateDoc,deleteDoc,orderBy,limit };
