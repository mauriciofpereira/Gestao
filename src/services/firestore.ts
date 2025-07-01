import { db } from "../firebase";
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, DocumentData, Unsubscribe
} from "firebase/firestore";

export function getCollection(colName: string) {
  return getDocs(collection(db, colName));
}

export function getDocument(colName: string, id: string) {
  return getDoc(doc(db, colName, id));
}

export function addDocument(colName: string, data: DocumentData) {
  return addDoc(collection(db, colName), data);
}

export function setDocument(colName: string, id: string, data: DocumentData) {
  return setDoc(doc(db, colName, id), data);
}

export function updateDocument(colName: string, id: string, data: Partial<DocumentData>) {
  return updateDoc(doc(db, colName, id), data);
}

export function deleteDocument(colName: string, id: string) {
  return deleteDoc(doc(db, colName, id));
}

export function getUserWorkLogs(userId: string) {
  const q = query(collection(db, "workLogs"), where("userId", "==", userId));
  return getDocs(q);
}

export function onCollectionChange(colName: string, callback: (docs: any[]) => void): Unsubscribe {
  return onSnapshot(collection(db, colName), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
} 