# Documentação da Integração Firebase

## Propósito
Permitir que o app utilize autenticação (login/logout) e banco de dados em nuvem (Firestore) de forma segura e escalável.

## Arquivo principal
- `src/firebase.ts`: Centraliza a configuração e exporta as instâncias de Auth e Firestore.

## Variáveis de ambiente necessárias
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (opcional)

Essas variáveis devem ser preenchidas com os dados do console do Firebase e também cadastradas no painel da Vercel.

## Como funciona
- O app importa `auth` e `db` de `src/firebase.ts` para autenticação e acesso ao banco de dados.
- O Firestore é usado para armazenar e ler dados em tempo real.
- O Auth é usado para login/logout seguro.

## Observações
- Não exponha as credenciais do Firebase em repositórios públicos.
- As regras de segurança do Firestore devem ser configuradas no console do Firebase. 