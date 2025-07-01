# Documentação do arquivo `services/firestore.ts`

## Propósito
Centralizar funções de acesso e manipulação de dados no Firestore (Firebase).

## Funções principais
- `getCollection(colName)`: Busca todos os documentos de uma coleção.
- `getDocument(colName, id)`: Busca um documento pelo ID.
- `addDocument(colName, data)`: Adiciona um novo documento.
- `setDocument(colName, id, data)`: Cria ou sobrescreve um documento.
- `updateDocument(colName, id, data)`: Atualiza campos de um documento.
- `deleteDocument(colName, id)`: Remove um documento.
- `onCollectionChange(colName, callback)`: Listener em tempo real para uma coleção.
- `getUserWorkLogs(userId)`: Exemplo de query filtrando por campo.

## Exemplo de uso
```ts
import { getCollection, addDocument } from "./services/firestore";
getCollection("users").then(...);
addDocument("workLogs", { userId: "abc", ... });
```

## Observações
- O Firestore é NoSQL, cada coleção pode ter documentos com campos diferentes.
- Listeners em tempo real são úteis para apps colaborativos. 