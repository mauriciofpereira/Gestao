# Documentação do arquivo `main.tsx`

## Propósito
Arquivo de entrada da aplicação React. Responsável por inicializar o React, renderizar o componente principal `App` e aplicar o modo estrito do React.

## Funcionamento
- Importa o React, ReactDOM, o componente `App` e o arquivo de estilos `index.css`.
- Utiliza `ReactDOM.createRoot` para criar a raiz da aplicação e renderiza o componente `<App />` dentro de `<React.StrictMode>`, que ajuda a identificar problemas de ciclo de vida, efeitos e práticas inseguras.

## Exemplo de uso
Este arquivo não é importado por outros arquivos, pois é o ponto de entrada da aplicação. O Vite/Webpack o utiliza automaticamente para iniciar o app.

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

## Observações
- O elemento com id `root` deve existir no `index.html`.
- O uso de `React.StrictMode` é recomendado em desenvolvimento para garantir boas práticas. 