# Documentação do arquivo `services/auth.ts`

## Propósito
Centralizar funções de autenticação usando o Firebase Auth.

## Funções
- `login(email, password)`: Realiza login com email e senha.
- `logout()`: Faz logout do usuário autenticado.
- `onUserChange(callback)`: Listener para mudanças de autenticação (útil para hooks React).

## Exemplo de uso
```ts
import { login, logout, onUserChange } from "./services/auth";
login("email@dominio.com", "senha");
logout();
onUserChange(user => console.log(user));
```

## Observações
- O Auth do Firebase é seguro e recomendado para apps modernos.
- Pode ser expandido para cadastro, reset de senha, etc. 