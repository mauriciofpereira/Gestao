import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User, Unsubscribe, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { addDocument } from "./firestore";

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function onUserChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export async function registerUser(email: string, password: string, userData: any) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await addDocument("users", { id: cred.user.uid, email, ...userData });
  return cred.user;
} 