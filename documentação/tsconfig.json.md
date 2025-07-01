# Documentação do arquivo `tsconfig.json`

## Propósito
Arquivo de configuração principal do TypeScript para o projeto.

## Principais opções
- `compilerOptions`: Define como o TypeScript deve compilar o código.
  - `target`, `lib`, `module`: Especificam a versão do JS e bibliotecas usadas.
  - `jsx`: Define o modo JSX para React.
  - `strict`, `noUnusedLocals`, etc: Regras de checagem estrita.
  - `moduleResolution`, `resolveJsonModule`, etc: Opções para importação de módulos.
- `include`: Quais arquivos/pastas são incluídos na compilação.
- `references`: Referência para o tsconfig do Node.

## Observações
- O arquivo pode ser customizado conforme a necessidade do projeto.
- Para deploy na Vercel, normalmente não é necessário alterar este arquivo. 