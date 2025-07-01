import { useEffect, useState } from "react";
import { onUserChange } from "../services/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onUserChange(setUser);
    return () => unsub();
  }, []);
  return user;
} 