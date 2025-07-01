# Documentação do arquivo `vite-env.d.ts`

## Propósito
Arquivo de declaração de tipos do Vite para o TypeScript. Garante que as variáveis e tipos globais do Vite estejam disponíveis no projeto.

## Funcionamento
- A linha `/// <reference types="vite/client" />` importa automaticamente as definições de tipos do Vite para o TypeScript.
- Permite o uso de variáveis globais como `import.meta.env` e outras funcionalidades específicas do Vite sem erros de tipagem.

## Exemplo de uso
Não é necessário importar este arquivo manualmente. O TypeScript reconhece automaticamente as declarações presentes nele.

## Observações
- Normalmente não é necessário modificar este arquivo.
- Caso precise adicionar tipos globais personalizados, pode-se incluir neste arquivo. 