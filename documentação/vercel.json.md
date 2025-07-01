# Documentação do arquivo `vercel.json`

## Propósito
Arquivo de configuração para deploy do projeto na Vercel, garantindo que o build estático do Vite funcione corretamente como SPA (Single Page Application).

## Campos principais
- `version`: Versão do schema de configuração da Vercel (2).
- `builds`: Define que o build será feito a partir do `package.json` usando `@vercel/static-build` e que a saída será a pasta `dist` (padrão do Vite).
- `routes`: Redireciona todas as rotas para `index.html`, permitindo navegação SPA sem erro 404 em refresh ou rotas internas.

## Observações
- Não é necessário alterar o código do app para deploy na Vercel.
- Basta conectar o repositório na Vercel e o deploy funcionará automaticamente. 