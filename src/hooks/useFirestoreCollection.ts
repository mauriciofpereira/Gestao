import { useEffect, useState } from "react";
import { onCollectionChange } from "../services/firestore";

export function useFirestoreCollection(colName: string) {
  const [docs, setDocs] = useState<any[]>([]);
  useEffect(() => {
    const unsub = onCollectionChange(colName, setDocs);
    return () => unsub();
  }, [colName]);
  return docs;
} 