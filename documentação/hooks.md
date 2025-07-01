# Documentação dos hooks Firebase

## useAuth
Hook React para obter o usuário autenticado em tempo real.

### Exemplo de uso
```ts
import { useAuth } from "./hooks/useAuth";
const user = useAuth();
```

## useFirestoreCollection
Hook React para obter dados de uma coleção do Firestore em tempo real.

### Exemplo de uso
```ts
import { useFirestoreCollection } from "./hooks/useFirestoreCollection";
const users = useFirestoreCollection("users");
```

## Observações
- Hooks facilitam o uso do Firebase no React, atualizando a UI automaticamente.
- Podem ser expandidos para queries customizadas, loading, erro, etc. 