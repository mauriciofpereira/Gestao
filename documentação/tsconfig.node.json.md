# Documentação do arquivo `tsconfig.node.json`

## Propósito
Arquivo de configuração do TypeScript específico para scripts e ferramentas Node.js no projeto.

## Principais opções
- `composite`: Permite projetos TypeScript compostos.
- `skipLibCheck`: Ignora checagem de tipos de bibliotecas.
- `module`, `moduleResolution`: Configurações para módulos ESNext.
- `allowSyntheticDefaultImports`: Permite importações default sintéticas.
- `include`: Inclui o arquivo de configuração do Vite.

## Observações
- Normalmente não é necessário alterar este arquivo, exceto se adicionar scripts Node personalizados. 