# Documentação do arquivo `package.json`

## Propósito
Arquivo de configuração do gerenciador de pacotes (npm/pnpm/yarn) para o projeto. Define scripts, dependências e metadados do projeto.

## Campos principais
- `name`, `version`, `private`, `type`: Metadados do projeto.
- `scripts`: Comandos úteis para desenvolvimento e build.
  - `dev`: Inicia o servidor de desenvolvimento Vite.
  - `build`: Compila o TypeScript e gera o build de produção.
  - `lint`: Executa o ESLint para análise de código.
  - `preview`: Visualiza o build de produção localmente.
- `dependencies`: Bibliotecas usadas em produção (React, lucide-react, etc).
- `devDependencies`: Ferramentas de desenvolvimento (TypeScript, ESLint, Tailwind, Vite, etc).

## Observações
- O arquivo é essencial para instalar dependências e rodar scripts do projeto.
- Para deploy na Vercel, normalmente não é necessário alterar este arquivo, mas scripts customizados podem ser úteis. 