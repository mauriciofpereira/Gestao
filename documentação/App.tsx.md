# Documentação do arquivo `App.tsx`

## Funções Utilitárias

### getRateForDate
Obtém a taxa de pagamento correta para um usuário em uma data específica, considerando o histórico de taxas.

- **Parâmetros:**
  - `user` (objeto): Usuário contendo o array `hourlyRates`.
  - `date` (string ou Date): Data de referência.
- **Retorno:**
  - (number) Taxa aplicável para a data informada.
- **Exemplo:**
```js
const taxa = getRateForDate(usuario, '2024-06-15');
```
- **Descrição:**
Percorre o histórico de taxas do usuário e retorna a mais recente que seja anterior ou igual à data fornecida. Se não houver taxa válida, retorna 0.

---

### formatMinutesToHours
Formata um valor em minutos para o formato "Xh Ym".

- **Parâmetros:**
  - `minutes` (number): Quantidade de minutos.
- **Retorno:**
  - (string) Exemplo: "2h 30m".
- **Exemplo:**
```js
formatMinutesToHours(150); // "2h 30m"
```

---

### getTomorrowDateString
Retorna a data de amanhã no formato ISO (YYYY-MM-DD).

- **Parâmetros:** Nenhum.
- **Retorno:**
  - (string) Data de amanhã.
- **Exemplo:**
```js
const amanha = getTomorrowDateString();
```

---

### formatDate
Formata uma string de data para o padrão brasileiro (DD/MM/AAAA).

- **Parâmetros:**
  - `dateString` (string): Data no formato ISO.
- **Retorno:**
  - (string) Data formatada ou "N/D" se inválida.
- **Exemplo:**
```js
formatDate('2024-06-15'); // "15/06/2024"
```

---

## Hook: useMockData
Simula um backend, centralizando todos os dados da aplicação em estados React. Ideal para testes e prototipagem.

- **Retorna:**
  - Objeto contendo estados e setters para:
    - `users`, `worksites`, `houses`, `cars`, `workLogs`, `incomes`, `miscExpenses`, `houseExpenses`, `payrollData`, `notifications`, `vacationRequests`, `planning`, `messages`.
- **Exemplo de uso:**
```js
const data = useMockData();
console.log(data.users);
```
- **Descrição:**
Cada campo simula uma tabela ou entidade do sistema, permitindo leitura e atualização local dos dados. Útil para desenvolvimento sem backend real.

---

## Componentes Principais

### App
Componente principal da aplicação. Gerencia autenticação, navegação entre páginas e integra todos os dados via o hook `useMockData`.

- **Props:** Nenhuma (é o root).
- **Responsabilidade:**
  - Controla o estado do usuário logado.
  - Renderiza dashboards e páginas conforme o tipo de usuário e página selecionada.
- **Exemplo de uso:**
```jsx
<App />
```

---

### AdminDashboard
Dashboard do administrador, com atalhos para todas as áreas de gestão.
- **Props:**
  - `user`: objeto do usuário logado.
  - `setPage`: função para trocar de página.
  - `onLogout`: função para logout.
  - `data`: dados globais da aplicação.
- **Responsabilidade:**
  - Exibe cards de navegação para funcionários, obras, casas, frota, escala, comunicação, finanças, relatórios e notificações.

---

### EmployeeDashboard
Dashboard do funcionário, com registro de horas, planejamento e navegação.
- **Props:**
  - `user`, `setPage`, `onLogout`, `data` (semelhante ao AdminDashboard).
- **Responsabilidade:**
  - Permite registro de horas ou produção.
  - Permite informar local de trabalho do dia seguinte.
  - Acesso rápido a comunicação e relatórios pessoais.

---

### PageWrapper
Componente de layout para páginas internas.
- **Props:**
  - `title`: título da página.
  - `children`: conteúdo da página.
  - `setPage`: função para navegação.
  - `onPrint` (opcional): função para imprimir relatório.
- **Responsabilidade:**
  - Fornece cabeçalho, botão de voltar e layout padronizado.

---

### Modal
Componente de modal genérico.
- **Props:**
  - `show`: booleano para exibir ou ocultar.
  - `onClose`: função para fechar.
  - `title`: título do modal.
  - `children`: conteúdo do modal.
- **Responsabilidade:**
  - Exibe formulários ou informações sobrepostos à tela principal.

---

### LoginPage
Tela de login.
- **Props:**
  - `onLogin`: função de autenticação.
  - `error`: mensagem de erro.
- **Responsabilidade:**
  - Permite ao usuário inserir email e senha para acessar o sistema.

---

### DashboardCard
Card de navegação para dashboards.
- **Props:**
  - `icon`, `title`, `description`, `onClick`, `notificationCount` (opcional).
- **Responsabilidade:**
  - Exibe um card clicável com ícone, título, descrição e badge de notificações.

---

### TimeRegistrationForm
Formulário para registro de horas (funcionário por hora).
- **Props:**
  - `onSave`, `user`, `selectedDate`, `workLogs`, `disabled`.
- **Responsabilidade:**
  - Permite ao funcionário registrar horário de entrada e saída.
  - Calcula automaticamente o total de horas (deduzindo pausa).

---

### ProductionRegistrationForm
Formulário para registro de produção (funcionário por produção).
- **Props:**
  - `onSave`, `user`, `selectedDate`, `workLogs`, `disabled`.
- **Responsabilidade:**
  - Permite ao funcionário registrar quantidade de quartos/itens produzidos.
  - Calcula total de minutos trabalhados.

---

### WorksitesPage, HousesPage, CarsPage
Telas administrativas para gestão de obras, casas e frota.
- **Props:**
  - `setPage`, `data`.
- **Responsabilidade:**
  - Listar, adicionar e editar registros de cada entidade.
  - Utilizam modais para formulários de cadastro/edição.

---

### EmployeesPage
Gestão de funcionários.
- **Props:**
  - `setPage`, `data`.
- **Responsabilidade:**
  - Listar, adicionar e editar funcionários.
  - Gerenciar histórico de valor/hora e programar aumentos.

---

### CommunicationPage, AdminCommunicationPage, EmployeeCommunicationPage
Central de comunicação e pedidos de férias.
- **Props:**
  - `user`, `setPage`, `data`, `isAdmin` (apenas CommunicationPage).
- **Responsabilidade:**
  - Troca de mensagens entre admin e funcionários.
  - Gerenciamento de pedidos de férias.

---

### AdminVacationRequests, EmployeeVacationRequests
Gestão de pedidos de férias.
- **Props:**
  - `data` (admin) ou `user`, `data` (funcionário).
- **Responsabilidade:**
  - Admin aprova/rejeita pedidos.
  - Funcionário solicita e acompanha status dos pedidos.

---

### MessageThread
Thread de mensagens entre dois usuários.
- **Props:**
  - `user`, `recipientId`, `recipientName`, `data`.
- **Responsabilidade:**
  - Exibe histórico de mensagens e permite envio de novas.

---

### WorkSchedulePage
Gestão da escala de trabalho.
- **Props:**
  - `setPage`, `data`.
- **Responsabilidade:**
  - Admin define local de trabalho de cada funcionário por dia.

---

### AdminNotificationsPage
Central de notificações administrativas.
- **Props:**
  - `setPage`, `data`.
- **Responsabilidade:**
  - Exibe alertas e notificações do sistema.

---

### AdminReportsPage, EmployeeReportsPage
Relatórios de horas e pagamentos.
- **Props:**
  - `setPage`, `data`, `user` (funcionário).
- **Responsabilidade:**
  - Admin visualiza relatórios de todos.
  - Funcionário visualiza seus próprios relatórios.

---

### FinancialsPage
Gestão financeira mensal.
- **Props:**
  - `setPage`, `data`.
- **Responsabilidade:**
  - Exibe resumo financeiro, folha de pagamento, despesas e receitas.
  - Permite adicionar receitas/despesas e imprimir relatório.

---

### FinancialCard
Card de resumo financeiro.
- **Props:**
  - `title`, `value`, `color`, `isLarge` (opcional).
- **Responsabilidade:**
  - Exibe valor financeiro destacado.

---

### ExpenseCard
Card para despesas ou receitas.
- **Props:**
  - `title`, `items`, `onSave`, `formState`, `setFormState`, `houses` (opcional), `isIncome` (opcional).
- **Responsabilidade:**
  - Lista despesas/receitas e permite adicionar novos itens. 