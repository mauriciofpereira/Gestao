import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  FileText,
  LogOut,
  ArrowRight,
  UserPlus,
  Hotel,
  BarChart2,
  CheckCircle,
  Trash2,
  Bell,
  AlertTriangle,
  Send,
  CalendarDays,
  Home,
  Car,
  Edit,
  TrendingUp,
  PlusCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { useFirestoreCollection } from "./hooks/useFirestoreCollection";
import { login, logout, registerUser } from "./services/auth";
import { addDocument, updateDocument, deleteDocument } from "./services/firestore";

// --- Tipos auxiliares ---
interface User {
  id: string;
  email: string;
  name?: string;
  password?: string;
  hourlyRates?: { rate: number; effectiveDate: string }[];
  [key: string]: any;
}

interface Worksite {
  id: string;
  name: string;
  address: string;
  [key: string]: any;
}

interface House {
  id: string;
  name: string;
  address: string;
  rent: number;
  [key: string]: any;
}

interface Car {
  id: string;
  model: string;
  plate: string;
  insuranceDate: string;
  inspectionDate: string;
  [key: string]: any;
}

interface WorkLog {
  id: string;
  userId: string;
  date: string;
  hours: number;
  [key: string]: any;
}

interface VacationRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: string;
  [key: string]: any;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  [key: string]: any;
}

// --- Funções utilitárias ---
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

function formatMinutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}

function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// --- Função para obter a taxa de pagamento correta para uma data específica ---
// Percorre o histórico de taxas de um utilizador e retorna a mais recente aplicável à data fornecida.
const getRateForDate = (user: User, date: string | Date): number => {
  if (!user || !user.hourlyRates || user.hourlyRates.length === 0) return 0;
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) return 0;
  // Garante que as taxas estão ordenadas da mais recente para a mais antiga
  const sortedRates = [...user.hourlyRates].sort(
    (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  );
  // Encontra a primeira taxa cuja data de efetivação é anterior ou igual à data alvo
  const applicableRate = sortedRates.find(
    (r) => new Date(r.effectiveDate) <= targetDate
  );
  // Retorna a taxa encontrada ou a mais antiga como fallback
  return applicableRate
    ? applicableRate.rate
    : sortedRates[sortedRates.length - 1]?.rate || 0;
};

// --- Componente Principal ---
export default function App() {
  const user = useAuth() as User | null;
  const users = useFirestoreCollection("users") as User[];
  const worksites = useFirestoreCollection("worksites") as Worksite[];
  const houses = useFirestoreCollection("houses") as House[];
  const cars = useFirestoreCollection("cars") as Car[];
  const workLogs = useFirestoreCollection("workLogs") as WorkLog[];
  const vacationRequests = useFirestoreCollection("vacationRequests") as VacationRequest[];
  const messages = useFirestoreCollection("messages") as Message[];
  const [page, setPage] = useState<string>("login");
  const [error, setError] = useState<string>("");

  // Exibir aviso amigável se não houver usuário logado
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#10182B] text-gray-200">
        <h1 className="text-3xl font-bold mb-4">Faça login para acessar o sistema</h1>
        {/* Exemplo de formulário de login */}
        <form
          className="flex flex-col gap-2 w-80"
          onSubmit={async (e) => {
            e.preventDefault();
            const email = (e.target as any).email.value;
            const password = (e.target as any).password.value;
            try {
              await login(email, password);
              setError("");
            } catch (err: any) {
              setError("Usuário ou senha inválidos");
            }
          }}
        >
          <input name="email" type="email" placeholder="E-mail" className="p-2 rounded" required />
          <input name="password" type="password" placeholder="Senha" className="p-2 rounded" required />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded">Entrar</button>
          {error && <div className="text-red-400">{error}</div>}
        </form>
      </div>
    );
  }

  // Exemplo: renderizar dashboard se usuário autenticado
  return (
    <div>
      <header className="flex justify-between items-center p-4 bg-[#10182B] text-white">
        <span>Bem-vindo, {user.email}</span>
        <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">Sair</button>
      </header>
      {/* Renderize dashboards, páginas e dados do Firestore conforme necessário */}
      <main className="p-4">
        {/* Exemplo: lista de usuários */}
        <h2 className="text-xl font-bold mb-2">Usuários</h2>
        <ul>
          {users.map((u: any) => (
            <li key={u.id}>{u.email || u.nome}</li>
          ))}
        </ul>
        {/* Adicione aqui os componentes de dashboard, obras, casas, etc, usando os hooks de dados do Firestore */}
      </main>
    </div>
  );
}

// --- Componentes Genéricos ---
function PageWrapper({ title, children, setPage, onPrint }: { title: string; children: React.ReactNode; setPage: (page: string) => void; onPrint?: () => void }) {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setPage("dashboard")}
          className="flex items-center gap-2 text-[#43e0a2] hover:text-green-400 font-bold"
        >
          <ArrowRight className="transform rotate-180" size={18} /> Voltar ao
          Dashboard
        </button>
        {onPrint && (
          <button
            onClick={onPrint}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg flex items-center gap-2"
          >
            <Printer size={18} /> Gerar Relatório
          </button>
        )}
      </div>
      {title && <h1 className="text-3xl font-bold text-white mb-6">{title}</h1>}
      {children}
    </div>
  );
}

function Modal({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      {" "}
      <div className="bg-[#1a233b] border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        {" "}
        <div className="flex justify-between items-center mb-4">
          {" "}
          <h2 className="text-2xl font-bold text-white">{title}</h2>{" "}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl"
          >
            &times;
          </button>{" "}
        </div>{" "}
        {children}{" "}
      </div>{" "}
    </div>
  );
}

// --- Componentes de Autenticação e Navegação ---
function LoginPage({ onLogin, error }: { onLogin: (email: string, password: string) => void; error: string }) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin(email, password);
  };
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in mt-16">
      <img
        src="https://i.imgur.com/n9wS9Yq.jpg"
        alt="Logo Paralelo Esclarecido"
        className="w-64 h-auto mb-4 object-contain"
      />
      <p className="text-[#43e0a2] mb-8 font-tech text-xl">
        SISTEMA DE GESTÃO DE HORAS
      </p>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1a233b]/80 p-8 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700"
      >
        <div className="mb-6">
          <label
            className="block text-gray-400 text-sm font-bold mb-2 font-tech"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-[#10182B] text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-[#43e0a2]"
            required
            placeholder="seu.email@paralelo.com"
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-400 text-sm font-bold mb-2 font-tech"
            htmlFor="password"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-[#10182B] text-gray-200 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[#43e0a2]"
            required
            placeholder="••••••••••••"
          />
        </div>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full bg-[#43e0a2] hover:bg-green-400 text-[#10182B] font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 font-tech text-lg"
          >
            ENTRAR
          </button>
        </div>
      </form>
    </div>
  );
}

// -- DASHBOARDS --
function AdminDashboard({ user, setPage, onLogout, data }: { user: User; setPage: (page: string) => void; onLogout: () => void; data: { notifications: any[]; vacationRequests: VacationRequest[]; cars: Car[]; setNotifications: React.Dispatch<React.SetStateAction<any[]>> } }) {
  const { notifications, vacationRequests, cars, setNotifications } = data;
  const pendingVacations = vacationRequests.filter(
    (r: VacationRequest) => r.status === "Pendente"
  ).length;

  // Efeito para verificar documentos de carros a expirar e criar notificações
  useEffect(() => {
    const today = new Date();
    const upcomingExpiry = cars.filter((car: Car) => {
      const insDate = new Date(car.insuranceDate);
      const inspDate = new Date(car.inspectionDate);
      const insDiff = (insDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      const inspDiff = (inspDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return (insDiff > 0 && insDiff <= 30) || (inspDiff > 0 && inspDiff <= 30);
    });

    if (
      upcomingExpiry.length > 0 &&
      notifications.filter((n) => n.type === "car_expiry").length === 0
    ) {
      const newNotif = {
        id: Date.now(),
        type: "car_expiry",
        message: `Existem ${upcomingExpiry.length} veículo(s) com documentos a expirar em breve.`,
        date: new Date().toISOString(),
      };
      setNotifications((prev) => [
        newNotif,
        ...prev.filter((n) => n.type !== "car_expiry"),
      ]);
    }
  }, [cars, notifications, setNotifications]);

  return (
    <div className="animate-fade-in">
      {" "}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-white">
          Dashboard do Administrador
        </h1>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-600/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <LogOut size={18} /> Sair
        </button>
      </header>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {" "}
        <DashboardCard
          icon={<Users />}
          title="Gerir Funcionários"
          description="Adicione ou edite dados dos funcionários."
          onClick={() => setPage("employees")}
        />{" "}
        <DashboardCard
          icon={<Hotel />}
          title="Gerir Hotéis e Obras"
          description="Registe os locais de trabalho."
          onClick={() => setPage("worksites")}
        />{" "}
        <DashboardCard
          icon={<Home />}
          title="Gerir Casas"
          description="Registe as moradas da equipa."
          onClick={() => setPage("houses")}
        />{" "}
        <DashboardCard
          icon={<Car />}
          title="Gerir Frota"
          description="Controle os veículos e seus documentos."
          onClick={() => setPage("cars")}
        />{" "}
        <DashboardCard
          icon={<CalendarDays />}
          title="Escala de Trabalho"
          description="Visualize a escala diária."
          onClick={() => setPage("planning")}
        />{" "}
        <DashboardCard
          icon={<Send />}
          title="Comunicação"
          description="Mensagens e pedidos de férias."
          onClick={() => setPage("communication")}
          notificationCount={pendingVacations}
        />{" "}
        <DashboardCard
          icon={<TrendingUp />}
          title="Controlo Financeiro"
          description="Folhas de pagamento, despesas e saldo."
          onClick={() => setPage("finance")}
        />{" "}
        <DashboardCard
          icon={<BarChart2 />}
          title="Relatórios"
          description="Analise as horas e pagamentos."
          onClick={() => setPage("reports")}
        />{" "}
        <DashboardCard
          icon={<Bell />}
          title="Notificações"
          description="Alertas e alterações recentes."
          onClick={() => setPage("notifications")}
          notificationCount={notifications.length}
        />{" "}
      </div>{" "}
    </div>
  );
}

function EmployeeDashboard({ user, setPage, onLogout, data }: { user: User; setPage: (page: string) => void; onLogout: () => void; data: any }) {
  const workLogs = useFirestoreCollection("workLogs") as WorkLog[];
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const tomorrowStr = getTomorrowDateString();
  const [pendingPlan, setPendingPlan] = useState<string>("");
  const [planSaved, setPlanSaved] = useState(false);

  useEffect(() => {
    // Não há mais planning local, pode ser adaptado para Firestore futuramente
    setPendingPlan("");
  }, [tomorrowStr, user.id]);

  const handleConfirmPlan = () => {
    // TODO: Integrar planning com Firestore
    setPlanSaved(true);
    setTimeout(() => setPlanSaved(false), 2000);
  };

  const handleSave = async (logData: Partial<WorkLog>) => {
    const existingLog = workLogs.find(
      (l: WorkLog) => l.date === selectedDate && l.userId === user.id
    );
    if (existingLog) {
      await updateDocument("workLogs", existingLog.id, {
        ...existingLog,
        ...logData,
      });
    } else {
      await addDocument("workLogs", {
        userId: user.id,
        date: selectedDate,
        type: user.jobType,
        ...logData,
      });
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const isEditable = () => {
    const today = new Date();
    const selected = new Date(selectedDate);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return selected >= lastMonth;
  };

  return (
    <div className="animate-fade-in">
      {" "}
      <header className="flex flex-wrap justify-between items-center mb-10 gap-4">
        {" "}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Painel do Funcionário
          </h1>
          <p className="text-gray-400">Olá, {user.name}.</p>
        </div>{" "}
        <div className="flex items-center gap-4 flex-wrap">
          {" "}
          <button
            onClick={() => setPage("communication")}
            className="flex items-center gap-2 bg-[#1a233b] hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors border border-gray-600"
          >
            <Send size={18} /> Comunicação e Férias
          </button>{" "}
          <button
            onClick={() => setPage("reports")}
            className="flex items-center gap-2 bg-[#1a233b] hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors border border-gray-600"
          >
            <FileText size={18} /> Meus Relatórios
          </button>{" "}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <LogOut size={18} /> Sair
          </button>{" "}
        </div>{" "}
      </header>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {" "}
        <div className="lg:col-span-2 bg-[#1a233b]/80 p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 relative">
          {" "}
          <h2 className="text-2xl font-bold text-white mb-4">
            Registro de Horas
          </h2>{" "}
          {showSuccess && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white p-3 rounded-lg animate-fade-in-out">
              <CheckCircle size={20} />
              <span>Salvo com sucesso!</span>
            </div>
          )}{" "}
          <div className="mb-6">
            <label
              htmlFor="work-date"
              className="block text-gray-400 text-sm font-bold mb-2"
            >
              Selecione o dia:
            </label>
            <input
              type="date"
              id="work-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-auto py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2]"
            />
          </div>{" "}
          {!isEditable() && (
            <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-4 rounded-lg text-center mb-4">
              <p className="font-bold">
                Não é possível editar meses mais antigos.
              </p>
              <p className="text-sm">
                Para alterações, por favor, contacte o administrador.
              </p>
            </div>
          )}{" "}
          {user.jobType === "byTime" ? (
            <TimeRegistrationForm
              onSave={handleSave}
              user={user}
              selectedDate={selectedDate}
              workLogs={data.workLogs}
              disabled={!isEditable()}
            />
          ) : (
            <ProductionRegistrationForm
              onSave={handleSave}
              user={user}
              selectedDate={selectedDate}
              workLogs={data.workLogs}
              disabled={!isEditable()}
            />
          )}{" "}
        </div>{" "}
        <div className="bg-[#1a233b]/80 p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700">
          {" "}
          <h2 className="text-2xl font-bold text-white mb-4">
            Planeamento
          </h2>{" "}
          <div className="space-y-4">
            {" "}
            <label
              htmlFor="planning-tomorrow"
              className="block text-gray-400 text-sm font-bold"
            >
              Onde irá trabalhar amanhã ({formatDate(tomorrowStr)})?
            </label>{" "}
            <div className="flex items-center gap-2">
              {" "}
              <select
                id="planning-tomorrow"
                value={pendingPlan}
                onChange={(e) => setPendingPlan(e.target.value)}
                className="w-full py-3 px-4 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2]"
              >
                {" "}
                <option value="">Selecione...</option>{" "}
                {data.worksites.map((h: Worksite) => (
                  <option key={h.id} value={h.name}>
                    {h.name}
                  </option>
                ))}{" "}
                <option value="Folga">Estou de Folga</option>{" "}
              </select>{" "}
              <button
                onClick={handleConfirmPlan}
                disabled={!pendingPlan}
                className="bg-[#43e0a2] text-[#10182B] font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition-colors flex-shrink-0 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {" "}
                OK{" "}
              </button>{" "}
            </div>{" "}
            {planSaved && (
              <p className="text-green-400 text-sm text-center animate-fade-in-out mt-2">
                Planeamento confirmado!
              </p>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  description,
  onClick,
  notificationCount = 0,
}: {
  icon: React.ReactElement;
  title: string;
  description: string;
  onClick: () => void;
  notificationCount?: number;
}) {
  return (
    <div
      onClick={onClick}
      className="relative bg-[#1a233b]/80 p-6 rounded-2xl border border-gray-700 hover:border-[#43e0a2] cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group"
    >
      {notificationCount > 0 && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {notificationCount}
        </div>
      )}
      <div className="text-[#43e0a2] mb-4">
        {React.isValidElement(icon) &&
          React.cloneElement(icon as React.ReactElement<any>, {
            size: 32,
            className: "transition-transform duration-300 group-hover:scale-110",
          })}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

// --- Telas de Registro (Funcionário) ---
function TimeRegistrationForm({
  onSave,
  user,
  selectedDate,
  workLogs,
  disabled,
}: {
  onSave: (data: any) => void;
  user: User;
  selectedDate: string;
  workLogs: WorkLog[];
  disabled: boolean;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [totalMinutes, setTotalMinutes] = useState(0);
  useEffect(() => {
    const log = workLogs.find(
      (l: WorkLog) => l.date === selectedDate && l.userId === user.id
    );
    setStart(log?.details?.start || "");
    setEnd(log?.details?.end || "");
  }, [selectedDate, user, workLogs]);
  useEffect(() => {
    if (start && end) {
      const total =
        (new Date(`1970-01-01T${end}`).getTime() - new Date(`1970-01-01T${start}`).getTime()) /
          60000 -
        30;
      setTotalMinutes(total > 0 ? total : 0);
    } else {
      setTotalMinutes(0);
    }
  }, [start, end]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ totalMinutes, details: { start, end } });
  };
  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={disabled} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="start-time"
            >
              Horário de Início
            </label>
            <input
              id="start-time"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full py-3 px-4 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2] disabled:opacity-50"
              required
            />
          </div>
          <div>
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="end-time"
            >
              Horário de Saída
            </label>
            <input
              id="end-time"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full py-3 px-4 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2] disabled:opacity-50"
              required
            />
          </div>
        </div>
        <div className="mt-8 text-center bg-[#10182B] p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400">
            Total de Horas Calculado (30min de pausa deduzidos):
          </p>
          <p className="text-3xl font-bold text-[#43e0a2] font-tech">
            {formatMinutesToHours(totalMinutes)}
          </p>
        </div>
        <button
          type="submit"
          className="w-full bg-[#43e0a2] hover:bg-green-400 text-[#10182B] font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 font-tech text-lg disabled:bg-gray-500 disabled:cursor-not-allowed mt-6"
        >
          Salvar Dia
        </button>
      </fieldset>
    </form>
  );
}
function ProductionRegistrationForm({
  onSave,
  user,
  selectedDate,
  workLogs,
  disabled,
}: {
  onSave: (data: any) => void;
  user: User;
  selectedDate: string;
  workLogs: WorkLog[];
  disabled: boolean;
}) {
  const [values, setValues] = useState({
    vertrekker: 0,
    blijver: 0,
    extraBed: 0,
    extraUur: 0,
  });
  const [totalMinutes, setTotalMinutes] = useState(0);
  useEffect(() => {
    const log = workLogs.find(
      (l: WorkLog) => l.date === selectedDate && l.userId === user.id
    );
    setValues(
      log?.details || { vertrekker: 0, blijver: 0, extraBed: 0, extraUur: 0 }
    );
  }, [selectedDate, user, workLogs]);
  useEffect(() => {
    const { vertrekker = 0, blijver = 0, extraBed = 0, extraUur = 0 } = values;
    setTotalMinutes(vertrekker * 30 + blijver * 20 + extraBed * 5 + extraUur);
  }, [values]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ totalMinutes, details: values });
  };
  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={disabled} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="vertrekker"
            >
              Vertrekker (30 min)
            </label>
            <input
              id="vertrekker"
              name="vertrekker"
              type="number"
              min="0"
              value={values.vertrekker || 0}
              onChange={handleChange}
              className="w-full py-3 px-4 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2] disabled:opacity-50"
            />
          </div>
          <div>
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="blijver"
            >
              Blijver (20 min)
            </label>
            <input
              id="blijver"
              name="blijver"
              type="number"
              min="0"
              value={values.blijver || 0}
              onChange={handleChange}
              className="w-full py-3 px-4 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2] disabled:opacity-50"
            />
          </div>
          <div>
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="extraBed"
            >
              Extra Bed (5 min)
            </label>
            <input
              id="extraBed"
              name="extraBed"
              type="number"
              min="0"
              value={values.extraBed || 0}
              onChange={handleChange}
              className="w-full py-3 px-4 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2] disabled:opacity-50"
            />
          </div>
          <div>
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="extraUur"
            >
              Extra Uur (minutos)
            </label>
            <input
              id="extraUur"
              name="extraUur"
              type="number"
              min="0"
              value={values.extraUur || 0}
              onChange={handleChange}
              className="w-full py-3 px-4 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2] disabled:opacity-50"
            />
          </div>
        </div>
        <div className="mt-8 text-center bg-[#10182B] p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400">Total de Horas Calculado:</p>
          <p className="text-3xl font-bold text-[#43e0a2] font-tech">
            {formatMinutesToHours(totalMinutes)}
          </p>
        </div>
        <button
          type="submit"
          className="w-full bg-[#43e0a2] hover:bg-green-400 text-[#10182B] font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 font-tech text-lg disabled:bg-gray-500 disabled:cursor-not-allowed mt-6"
        >
          Salvar Dia
        </button>
      </fieldset>
    </form>
  );
}

// --- Telas de Gestão (Admin) ---
function WorksitesPage({ setPage }: { setPage: (page: string) => void }) {
  const worksites = useFirestoreCollection("worksites") as Worksite[];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Worksite | null>(null);
  const handleOpenModal = (item: Worksite | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & { name: { value: string }; address: { value: string } };
    const updatedItem = {
      name: target.name.value,
      address: target.address.value,
    };
    if (editingItem) {
      await updateDocument("worksites", editingItem.id, updatedItem);
    } else {
      await addDocument("worksites", updatedItem);
    }
    handleCloseModal();
  };
  const handleDelete = async (id: string) => {
    await deleteDocument("worksites", id);
  };
  return (
    <PageWrapper title="Gerir Hotéis e Obras" setPage={setPage}>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#43e0a2] text-[#10182B] font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-400 transition-colors"
        >
          <PlusCircle size={18} /> Adicionar Local
        </button>
      </div>
      <div className="bg-[#1a233b]/80 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 font-bold">Nome</th>
              <th className="p-4 font-bold hidden sm:table-cell">Endereço</th>
              <th className="p-4 font-bold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {worksites.map((site) => (
              <tr
                key={site.id}
                className="border-b border-gray-700 last:border-b-0"
              >
                <td className="p-4">{site.name}</td>
                <td className="p-4 text-gray-400 hidden sm:table-cell">
                  {site.address}
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => handleOpenModal(site)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Edit size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        show={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Editar Local" : "Adicionar Novo Local"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold text-gray-300 mb-1"
            >
              Nome (ex: Hotel Helios)
            </label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={editingItem?.name || ""}
              required
              className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-bold text-gray-300 mb-1"
            >
              Endereço Completo
            </label>
            <input
              type="text"
              name="address"
              id="address"
              defaultValue={editingItem?.address || ""}
              required
              className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#43e0a2] hover:bg-green-400 text-[#10182B] font-bold py-2 px-4 rounded-lg mt-2"
          >
            {editingItem ? "Atualizar" : "Salvar"}
          </button>
        </form>
      </Modal>
    </PageWrapper>
  );
}
function HousesPage({ setPage }: { setPage: (page: string) => void }) {
  const houses = useFirestoreCollection("houses") as House[];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<House | null>(null);
  const handleOpenModal = (item: House | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & { name: { value: string }; address: { value: string }; rent: { value: string } };
    const updatedItem = {
      name: target.name.value,
      address: target.address.value,
      rent: parseFloat(target.rent.value) || 0,
    };
    if (editingItem) {
      await updateDocument("houses", editingItem.id, updatedItem);
    } else {
      await addDocument("houses", updatedItem);
    }
    handleCloseModal();
  };
  const handleDelete = async (id: string) => {
    await deleteDocument("houses", id);
  };
  return (
    <PageWrapper title="Gerir Casas" setPage={setPage}>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#43e0a2] text-[#10182B] font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-400 transition-colors"
        >
          <PlusCircle size={18} /> Adicionar Casa
        </button>
      </div>
      <div className="bg-[#1a233b]/80 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 font-bold">Nome</th>
              <th className="p-4 font-bold hidden sm:table-cell">Endereço</th>
              <th className="p-4 font-bold">Aluguel</th>
              <th className="p-4 font-bold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((h) => (
              <tr
                key={h.id}
                className="border-b border-gray-700 last:border-b-0"
              >
                <td className="p-4">{h.name}</td>
                <td className="p-4 text-gray-400 hidden sm:table-cell">
                  {h.address}
                </td>
                <td className="p-4 font-tech">€ {h.rent?.toFixed(2)}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => handleOpenModal(h)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Edit size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        show={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Editar Casa" : "Adicionar Nova Casa"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold text-gray-300 mb-1"
            >
              Nome (ex: Casa Deerlijk)
            </label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={editingItem?.name || ""}
              required
              className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-bold text-gray-300 mb-1"
            >
              Endereço Completo
            </label>
            <input
              type="text"
              name="address"
              id="address"
              defaultValue={editingItem?.address || ""}
              required
              className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="rent"
              className="block text-sm font-bold text-gray-300 mb-1"
            >
              Aluguel Fixo (€)
            </label>
            <input
              type="number"
              step="0.01"
              name="rent"
              id="rent"
              defaultValue={editingItem?.rent || ""}
              required
              className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#43e0a2] hover:bg-green-400 text-[#10182B] font-bold py-2 px-4 rounded-lg mt-2"
          >
            {editingItem ? "Atualizar" : "Salvar"}
          </button>
        </form>
      </Modal>
    </PageWrapper>
  );
}
function CarsPage({ setPage }: { setPage: (page: string) => void }) {
  const cars = useFirestoreCollection("cars") as Car[];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const handleOpenModal = (car: Car | null = null) => {
    setEditingCar(car);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCar(null);
  };
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & { model: { value: string }; plate: { value: string }; insuranceDate: { value: string }; inspectionDate: { value: string } };
    const updatedCar = {
      model: target.model.value,
      plate: target.plate.value,
      insuranceDate: target.insuranceDate.value,
      inspectionDate: target.inspectionDate.value,
    };
    if (editingCar) {
      await updateDocument("cars", editingCar.id, updatedCar);
    } else {
      await addDocument("cars", updatedCar);
    }
    handleCloseModal();
  };
  const handleDelete = async (id: string) => {
    await deleteDocument("cars", id);
  };
  const getStatusColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 0) return "bg-red-500";
    if (diff <= 30) return "bg-yellow-400";
    return "bg-green-500";
  };
  return (
    <PageWrapper title="Gerir Frota" setPage={setPage}>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#43e0a2] text-[#10182B] font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-400 transition-colors"
        >
          <PlusCircle size={18} /> Adicionar Carro
        </button>
      </div>
      <div className="bg-[#1a233b]/80 rounded-2xl border border-gray-700 overflow-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 font-bold">Modelo</th>
              <th className="p-4 font-bold">Matrícula</th>
              <th className="p-4 font-bold">Validade Seguro</th>
              <th className="p-4 font-bold">Validade Inspeção</th>
              <th className="p-4 font-bold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr
                key={car.id}
                className="border-b border-gray-700 last:border-b-0"
              >
                <td className="p-4">{car.model}</td>
                <td className="p-4 font-tech">{car.plate}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-md ${getStatusColor(
                      car.insuranceDate
                    )}`}
                  >
                    {formatDate(car.insuranceDate)}
                  </span>
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-md ${getStatusColor(
                      car.inspectionDate
                    )}`}
                  >
                    {formatDate(car.inspectionDate)}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => handleOpenModal(car)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Edit size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(car.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        show={isModalOpen}
        onClose={handleCloseModal}
        title={editingCar ? "Editar Carro" : "Adicionar Novo Carro"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="model"
              className="block text-sm font-bold text-gray-300 mb-1"
            >
              Modelo
            </label>
            <input
              type="text"
              name="model"
              id="model"
              defaultValue={editingCar?.model || ""}
              required
              className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="plate"
              className="block text-sm font-bold text-gray-300 mb-1"
            >
              Matrícula
            </label>
            <input
              type="text"
              name="plate"
              id="plate"
              defaultValue={editingCar?.plate || ""}
              required
              className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="insuranceDate"
              className="block text-sm font-bold text-gray-300 mb-1"
            >
              Validade do Seguro
            </label>
            <input
              type="date"
              name="insuranceDate"
              id="insuranceDate"
              defaultValue={editingCar?.insuranceDate || ""}
              required
              className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="inspectionDate"
              className="block text-sm font-bold text-gray-300 mb-1"
            >
              Validade da Inspeção
            </label>
            <input
              type="date"
              name="inspectionDate"
              id="inspectionDate"
              defaultValue={editingCar?.inspectionDate || ""}
              required
              className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#43e0a2] hover:bg-green-400 text-[#10182B] font-bold py-2 px-4 rounded-lg mt-2"
          >
            {editingCar ? "Atualizar" : "Salvar"}
          </button>
        </form>
      </Modal>
    </PageWrapper>
  );
}
function EmployeesPage({ setPage }: { setPage: (page: string) => void }) {
  const users = useFirestoreCollection("users") as User[];
  const houses = useFirestoreCollection("houses") as House[];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const employeeList = (Object.values(users) as User[]).filter((u: User) => u.role === "employee");
  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const getString = (key: string) => (formData.get(key) ?? "") as string;
    const baseData = {
      name: getString("name"),
      email: getString("email"),
      password: getString("password"),
      jobType: getString("jobType"),
      startDate: getString("startDate"),
      phone: getString("phone"),
      houseId: getString("houseId"),
    };
    if (editingUser) {
      const updatedUser = { ...editingUser, ...baseData };
      if (!baseData.password && (updatedUser as Partial<User>).password !== undefined) {
        delete (updatedUser as Partial<User>).password;
      }
      await updateDocument("users", editingUser.id, updatedUser);
    } else {
      const newRate = {
        rate: parseFloat(getString("hourlyRate")) || 0,
        effectiveDate: baseData.startDate,
      };
      const newUser = {
        role: "employee",
        hourlyRates: [newRate],
        ...baseData,
      };
      await registerUser(baseData.email, baseData.password, newUser);
    }
    handleCloseModal();
  };
  const handleDelete = async (id: string) => {
    await deleteDocument("users", id);
  };
  const handleRateChange = async (userId: string, rate: string, date: string) => {
    if (!rate || !date) return;
    const user = users.find((u: User) => u.id === userId);
    if (!user) return;
    const newRate = { rate: parseFloat(rate), effectiveDate: date };
    const otherRates = (user.hourlyRates || []).filter((r: { effectiveDate: string }) => r.effectiveDate !== date);
    const updatedRates = [...otherRates, newRate].sort(
      (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    );
    const updatedUser = { ...user, hourlyRates: updatedRates };
    await updateDocument("users", userId, updatedUser);
    setEditingUser(updatedUser);
  };
  return (
    <PageWrapper title="Gerir Funcionários" setPage={setPage}>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#43e0a2] text-[#10182B] font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-400 transition-colors"
        >
          <UserPlus size={18} /> Adicionar
        </button>
      </div>
      <div className="bg-[#1a233b]/80 rounded-2xl border border-gray-700 overflow-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 font-bold">Nome</th>
              <th className="p-4 font-bold hidden md:table-cell">Email</th>
              <th className="p-4 font-bold">Valor/Hora</th>
              <th className="p-4 font-bold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {employeeList.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-700 last:border-b-0"
              >
                <td className="p-4">{user.name}</td>
                <td className="p-4 text-gray-400 hidden md:table-cell">
                  {user.email}
                </td>
                <td className="p-4 font-tech text-green-400">
                  € {getRateForDate(user, new Date()).toFixed(2)}
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Edit size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <Modal
          show={isModalOpen}
          onClose={handleCloseModal}
          title={editingUser ? "Editar Funcionário" : "Adicionar Novo Funcionário"}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-gray-300 mb-1"
                >
                  Nome Completo
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingUser?.name || ""}
                  required
                  className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-gray-300 mb-1"
                >
                  Email (Login)
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email || ""}
                  readOnly={!!editingUser}
                  required
                  className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 read-only:bg-gray-800"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-gray-300 mb-1"
                >
                  Senha
                </label>
                <input
                  name="password"
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? "Deixar em branco para manter" : ""}
                  className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
                />
              </div>
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-bold text-gray-300 mb-1"
                >
                  Data Início Contrato
                </label>
                <input
                  name="startDate"
                  type="date"
                  defaultValue={editingUser?.startDate || ""}
                  required
                  className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
                />
              </div>
              {!editingUser && (
                <div>
                  <label
                    htmlFor="hourlyRate"
                    className="block text-sm font-bold text-gray-300 mb-1"
                  >
                    Valor/Hora (€)
                  </label>
                  <input
                    name="hourlyRate"
                    type="number"
                    step="0.01"
                    required
                    className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
                  />
                </div>
              )}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-bold text-gray-300 mb-1"
                >
                  Telefone
                </label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={editingUser?.phone || ""}
                  required
                  className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
                />
              </div>
              <div>
                <label
                  htmlFor="houseId"
                  className="block text-sm font-bold text-gray-300 mb-1"
                >
                  Casa
                </label>
                <select
                  name="houseId"
                  defaultValue={editingUser?.houseId || ""}
                  required
                  className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
                >
                  <option value="">Selecione a casa...</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="jobType"
                  className="block text-sm font-bold text-gray-300 mb-1"
                >
                  Tipo de Contrato
                </label>
                <select
                  name="jobType"
                  defaultValue={editingUser?.jobType || ""}
                  required
                  className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
                >
                  <option value="">Selecione o tipo...</option>
                  <option value="byTime">Por Hora (Entrada/Saída)</option>
                  <option value="byProduction">Por Produção (Quartos)</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#43e0a2] hover:bg-green-400 text-[#10182B] font-bold py-2 px-4 rounded-lg mt-2"
              >
                {editingUser ? "Atualizar Dados" : "Salvar Funcionário"}
              </button>
            </div>
          </form>
          {editingUser && (
            <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-600">
              <h3 className="text-lg font-bold mb-2">
                Histórico de Valor/Hora
              </h3>
              {(editingUser.hourlyRates ?? [])
                .sort((a: any, b: any) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
                .map((hr: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-[#10182B] p-2 rounded-md mb-2"
                  >
                    <span>Desde {formatDate(hr.effectiveDate)}</span>
                    <span className="font-bold font-tech">
                      € {hr.rate.toFixed(2)}
                    </span>
                  </div>
                ))}
              <h4 className="mt-4 mb-2 font-bold">Programar Aumento</h4>
              <div className="flex gap-2">
                <input
                  type="date"
                  id="newRateDate"
                  className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
                />
                <input
                  type="number"
                  step="0.01"
                  id="newRateValue"
                  placeholder="Novo Valor"
                  className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    const rateValue = (document.getElementById("newRateValue") as HTMLInputElement | null)?.value ?? "";
                    const rateDate = (document.getElementById("newRateDate") as HTMLInputElement | null)?.value ?? "";
                    handleRateChange(editingUser.id, rateValue, rateDate);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-2 rounded-lg"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </PageWrapper>
  );
}

// --- Telas de Comunicação ---
const AdminCommunicationPage = (props: any) => (
  <CommunicationPage {...props} isAdmin={true} />
);
const EmployeeCommunicationPage = (props: any) => (
  <CommunicationPage {...props} isAdmin={false} />
);

function CommunicationPage({
  user,
  setPage,
  data,
  isAdmin = false,
}: {
  user: User;
  setPage: (page: string) => void;
  data: any;
  isAdmin?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("vacations");
  const { users } = data;
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const employeeList = Object.values(users) as User[];
  useEffect(() => {
    if (isAdmin && employeeList.length > 0) {
      setSelectedEmployee(employeeList[0].id);
    }
  }, [isAdmin, users]);
  return (
    <PageWrapper setPage={setPage} title="Comunicação">
      {" "}
      <div className="flex border-b border-gray-700 mb-6">
        {" "}
        <button
          onClick={() => setActiveTab("vacations")}
          className={`py-2 px-4 font-bold ${
            activeTab === "vacations"
              ? "text-[#43e0a2] border-b-2 border-[#43e0a2]"
              : "text-gray-400"
          }`}
        >
          Férias
        </button>{" "}
        <button
          onClick={() => setActiveTab("messages")}
          className={`py-2 px-4 font-bold ${
            activeTab === "messages"
              ? "text-[#43e0a2] border-b-2 border-[#43e0a2]"
              : "text-gray-400"
          }`}
        >
          Mensagens
        </button>{" "}
      </div>{" "}
      {activeTab === "vacations" &&
        (isAdmin ? (
          <AdminVacationRequests data={data} />
        ) : (
          <EmployeeVacationRequests user={user} data={data} />
        ))}{" "}
      {activeTab === "messages" && (
        <div
          className={`grid grid-cols-1 ${
            isAdmin ? "md:grid-cols-3" : ""
          } gap-8`}
        >
          {" "}
          {isAdmin && (
            <div className="md:col-span-1 bg-[#1a233b]/80 p-4 rounded-xl border border-gray-700">
              {" "}
              <h3 className="text-xl font-bold mb-4">Funcionários</h3>{" "}
              <ul className="space-y-2">
                {" "}
                {employeeList.map((emp) => (
                  <li
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedEmployee === emp.id
                        ? "bg-[#43e0a2] text-[#10182B]"
                        : "bg-gray-900/50 hover:bg-gray-700"
                    }`}
                  >
                    {emp.name}
                  </li>
                ))}{" "}
              </ul>{" "}
            </div>
          )}{" "}
          <div className={isAdmin ? "md:col-span-2" : ""}>
            {" "}
            {(isAdmin && selectedEmployee) || !isAdmin ? (
              <MessageThread
                user={user}
                recipientId={isAdmin ? (selectedEmployee ?? '') : 'admin@paralelo.com'}
                recipientName={
                  isAdmin && selectedEmployee && typeof selectedEmployee === 'string' && users[selectedEmployee]
                    ? users[selectedEmployee].name
                    : "Admin"
                }
                data={data}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-[#1a233b]/80 p-8 rounded-xl border border-gray-700 text-gray-400">
                <p>Selecione um funcionário para ver as mensagens.</p>
              </div>
            )}{" "}
          </div>{" "}
        </div>
      )}{" "}
    </PageWrapper>
  );
}

function AdminVacationRequests({ data }: { data: any }) {
  const vacationRequests = useFirestoreCollection("vacationRequests");
  const users = useFirestoreCollection("users");
  const handleRequest = async (id: string, status: string) => {
    const req = vacationRequests.find((r) => r.id === id);
    if (req) {
      await updateDocument("vacationRequests", id, { ...req, status });
    }
  };

  const getStatusClass = (status: string) => {
    if (status === "Aprovado") return "text-green-400 bg-green-900/50";
    if (status === "Rejeitado") return "text-red-400 bg-red-900/50";
    return "text-yellow-400 bg-yellow-900/50";
  };

  const pendingRequests = vacationRequests.filter(
    (r) => r.status === "Pendente"
  );
  const processedRequests = vacationRequests.filter(
    (r) => r.status !== "Pendente"
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Pedidos Pendentes</h2>
        {pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#1a233b]/80 p-4 rounded-xl border border-gray-700 flex flex-wrap justify-between items-center gap-4"
              >
                <div>
                  <p className="font-bold">{users[req.userId]?.name}</p>
                  <p className="text-sm text-gray-400">
                    De: {formatDate(req.startDate)} a {formatDate(req.endDate)}
                  </p>
                  <p className="text-sm mt-1">{req.reason}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(req.id, "Aprovado")}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 rounded-lg flex items-center gap-2"
                  >
                    <ThumbsUp size={16} /> Aprovar
                  </button>
                  <button
                    onClick={() => handleRequest(req.id, "Rejeitado")}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-lg flex items-center gap-2"
                  >
                    <ThumbsDown size={16} /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Não há pedidos de férias pendentes.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Histórico de Pedidos</h2>
        <div className="bg-[#1a233b]/80 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-4 font-bold">Funcionário</th>
                <th className="p-4 font-bold hidden sm:table-cell">Período</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {processedRequests.map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-gray-700 last:border-b-0"
                >
                  <td className="p-4">{users[req.userId]?.name}</td>
                  <td className="p-4 hidden sm:table-cell">
                    {formatDate(req.startDate)} - {formatDate(req.endDate)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusClass(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmployeeVacationRequests({ user, data }: { user: User; data: any }) {
  const vacationRequests = useFirestoreCollection("vacationRequests");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newRequest = {
      userId: user.id,
      startDate: (e.target as any).startDate.value,
      endDate: (e.target as any).endDate.value,
      reason: (e.target as any).reason.value,
      status: "Pendente",
    };
    await addDocument("vacationRequests", newRequest);
    setIsModalOpen(false);
  };
  const getStatusClass = (status: string) => {
    if (status === "Aprovado") return "text-green-400";
    if (status === "Rejeitado") return "text-red-400";
    return "text-yellow-400";
  };
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#43e0a2] text-[#10182B] font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-400 transition-colors"
        >
          <PlusCircle size={18} /> Pedir Férias
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-4">Meus Pedidos</h2>
      <div className="bg-[#1a233b]/80 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 font-bold">Período</th>
              <th className="p-4 font-bold hidden sm:table-cell">Motivo</th>
              <th className="p-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {vacationRequests
              .filter((r) => r.userId === user.id)
              .map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-gray-700 last:border-b-0"
                >
                  <td className="p-4">
                    {formatDate(req.startDate)} - {formatDate(req.endDate)}
                  </td>
                  <td className="p-4 text-gray-400 hidden sm:table-cell">
                    {req.reason}
                  </td>
                  <td className="p-4 font-bold">
                    <span className={getStatusClass(req.status)}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Solicitar Férias"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-bold text-gray-300 mb-1"
              >
                Data de Início
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                required
                className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-bold text-gray-300 mb-1"
              >
                Data de Fim
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                required
                className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-bold text-gray-300 mb-1"
            >
              Motivo (opcional)
            </label>
            <textarea
              name="reason"
              id="reason"
              rows={3}
              className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-[#43e0a2] hover:bg-green-400 text-[#10182B] font-bold py-2 px-4 rounded-lg mt-2"
          >
            Enviar Pedido
          </button>
        </form>
      </Modal>
    </div>
  );
}

function MessageThread({ user, recipientId, recipientName, data }: { user: User; recipientId: string; recipientName: string; data: any }) {
  const messages = useFirestoreCollection("messages");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const threadMessages = messages
    .filter(
      (m) =>
        (m.from === user.id && m.to === recipientId) ||
        (m.from === recipientId && m.to === user.id)
    )
    .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSend = async () => {
    if (newMessage.trim() === "") return;
    const msg = {
      from: user.id,
      to: recipientId,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    await addDocument("messages", msg);
    setNewMessage("");
  };

  return (
    <div className="bg-[#1a233b]/80 border border-gray-700 rounded-2xl flex flex-col h-[70vh]">
      <header className="p-4 border-b border-gray-700">
        <h3 className="text-xl font-bold text-white">
          Conversa com {recipientName}
        </h3>
      </header>
      <main className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-4">
        {threadMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.from === user.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                msg.from === user.id
                  ? "bg-green-600 text-white rounded-br-none"
                  : "bg-gray-700 text-gray-200 rounded-bl-none"
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-xs opacity-60 text-right mt-1">
                {new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>
      <footer className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escreva uma mensagem..."
            className="w-full py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2]"
          />
          <button
            onClick={handleSend}
            className="bg-[#43e0a2] text-[#10182B] font-bold p-3 rounded-lg hover:bg-green-400 transition-colors flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}

// --- Outras Telas Admin ---
function WorkSchedulePage({ setPage, data }: { setPage: (page: string) => void; data: any }) {
  const { users, worksites, planning, setPlanning } = data;
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const employeeList = Object.values(users) as User[];
  const handleAdminPlanChange = (employeeId: string, newPlan: string) => {
    setPlanning((prev: any) => ({
      ...prev,
      [selectedDate]: { ...prev[selectedDate], [employeeId]: newPlan },
    }));
  };
  return (
    <PageWrapper title="Escala de Trabalho" setPage={setPage}>
      {" "}
      <div className="flex items-center gap-4 mb-6">
        <label htmlFor="schedule-date" className="text-gray-400">
          Ver escala para o dia:
        </label>
        <input
          type="date"
          id="schedule-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="py-2 px-3 bg-[#10182B] text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2]"
        />
      </div>
      <div className="bg-[#1a233b]/80 rounded-2xl border border-gray-700 overflow-auto">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 font-bold">Funcionário</th>
              <th className="p-4 font-bold">Local / Status</th>
            </tr>
          </thead>
          <tbody>
            {employeeList.map((emp) => {
              const location = planning[selectedDate]?.[emp.id] || "";
              return (
                <tr
                  key={emp.id}
                  className="border-b border-gray-700 last:border-b-0"
                >
                  <td className="p-4">{emp.name}</td>
                  <td className="p-4">
                    <select
                      value={location}
                      onChange={(e) =>
                        handleAdminPlanChange(emp.id, e.target.value)
                      }
                      className="w-full bg-[#10182B] text-white py-2 px-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#43e0a2]"
                    >
                      <option value="">Não definido</option>
                      {worksites.map((h: Worksite) => (
                        <option key={h.id} value={h.name}>
                          {h.name}
                        </option>
                      ))}
                      <option value="Folga">Folga</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>{" "}
    </PageWrapper>
  );
}
function AdminNotificationsPage({ setPage, data }: { setPage: (page: string) => void; data: any }) {
  const { notifications } = data;
  return (
    <PageWrapper title="Notificações e Alertas" setPage={setPage}>
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 p-4 rounded-lg flex items-center gap-4"
            >
              <AlertTriangle />
              <div>
                <p className="font-bold">{n.message}</p>
                <p className="text-xs opacity-80">{formatDate(n.date)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center p-8">
          Não existem notificações novas.
        </p>
      )}
    </PageWrapper>
  );
}

// --- Telas de Relatórios ---
function AdminReportsPage({ setPage, data }: { setPage: (page: string) => void; data: any }) {
  const { users, workLogs } = data;
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const handleSetDateRange = (start: Date, end: Date) => {
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };
  const setThisMonth = () => {
    const now = new Date();
    handleSetDateRange(
      new Date(now.getFullYear(), now.getMonth(), 1),
      new Date(now.getFullYear(), now.getMonth() + 1, 0)
    );
  };
  const setLastMonth = () => {
    const now = new Date();
    handleSetDateRange(
      new Date(now.getFullYear(), now.getMonth() - 1, 1),
      new Date(now.getFullYear(), now.getMonth(), 0)
    );
  };
  const filteredLogs = workLogs.filter((log: any) => log.date >= startDate && log.date <= endDate);

  const userTotals = filteredLogs.reduce((acc: any, log: any) => {
    const userId = log.userId;
    if (!acc[userId]) acc[userId] = { totalMinutes: 0, sundayBonusMinutes: 0 };
    acc[userId].totalMinutes += log.totalMinutes;
    if (new Date(log.date.replace(/-/g, "/")).getDay() === 0) {
      // 0 = Sunday
      acc[userId].sundayBonusMinutes += log.totalMinutes;
    }
    return acc;
  }, {});

  const userTotalsArray = Object.keys(userTotals).map((userId) => {
    const user = users[userId];
    const totals = userTotals[userId];
    const hourlyRate = getRateForDate(user, new Date(endDate));
    const basePayment = (totals.totalMinutes / 60) * hourlyRate;
    const sundayBonus = (totals.sundayBonusMinutes / 60) * hourlyRate; // Bónus de 100% = valor da hora normal
    return {
      name: user.name,
      totalMinutes: totals.totalMinutes,
      basePayment,
      sundayBonus,
      totalPayment: basePayment + sundayBonus,
    };
  });

  return (
    <PageWrapper title="Relatórios de Pagamento" setPage={setPage}>
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1a233b]/80 rounded-xl border border-gray-700">
        <label>De:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="py-2 px-3 bg-[#10182B] rounded-lg border-gray-600"
        />{" "}
        <label>Até:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="py-2 px-3 bg-[#10182B] rounded-lg border-gray-600"
        />{" "}
        <button
          onClick={setThisMonth}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg"
        >
          Mês Atual
        </button>{" "}
        <button
          onClick={setLastMonth}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg"
        >
          Mês Anterior
        </button>
      </div>
      <div className="bg-[#1a233b]/80 rounded-2xl border border-gray-700 overflow-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 font-bold">Funcionário</th>
              <th className="p-4 font-bold">Total Horas</th>
              <th className="p-4 font-bold">Pagamento Base</th>
              <th className="p-4 font-bold">Bónus Domingo</th>
              <th className="p-4 font-bold">Pagamento Total</th>
            </tr>
          </thead>
          <tbody>
            {userTotalsArray.map((user, index) => (
              <tr
                key={index}
                className="border-b border-gray-700 last:border-b-0"
              >
                <td className="p-4">{user.name}</td>
                <td className="p-4 font-tech">
                  {formatMinutesToHours(user.totalMinutes)}
                </td>
                <td className="p-4 font-tech text-gray-300">
                  € {user.basePayment.toFixed(2)}
                </td>
                <td className="p-4 font-tech text-yellow-400">
                  € {user.sundayBonus.toFixed(2)}
                </td>
                <td className="p-4 font-bold text-green-400 font-tech">
                  € {user.totalPayment.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}

function EmployeeReportsPage({ setPage, data, user }: { setPage: (page: string) => void; data: any; user: User }) {
  const { workLogs } = data;
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const userLogs = workLogs.filter((log: any) => {
    const logDate = new Date(log.date.replace(/-/g, "/"));
    return (
      log.userId === user.id &&
      logDate.getFullYear() === year &&
      logDate.getMonth() === month
    );
  });
  const totalMinutes = userLogs.reduce((sum: number, log: any) => sum + log.totalMinutes, 0);
  const hourlyRate = getRateForDate(user, new Date(year, month, 1));
  const estimatedPayment = (totalMinutes / 60) * hourlyRate;

  return (
    <PageWrapper title="Meus Relatórios Mensais" setPage={setPage}>
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1a233b]/80 rounded-xl border border-gray-700">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="py-2 px-3 bg-[#10182B] rounded-lg border-gray-600"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="py-2 px-3 bg-[#10182B] rounded-lg border-gray-600 w-24"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#1a233b]/80 p-6 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-400">Total de Horas no Mês</p>
          <p className="text-4xl font-bold text-[#43e0a2] font-tech">
            {formatMinutesToHours(totalMinutes)}
          </p>
        </div>
        <div className="bg-[#1a233b]/80 p-6 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-400">Pagamento Base Estimado</p>
          <p className="text-4xl font-bold text-green-400 font-tech">
            € {estimatedPayment.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="bg-[#1a233b]/80 rounded-2xl border border-gray-700 overflow-auto">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 font-bold">Data</th>
              <th className="p-4 font-bold">Total Horas</th>
              <th className="p-4 font-bold">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {userLogs
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((log: any) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-700 last:border-b-0"
                >
                  <td className="p-4">{formatDate(log.date)}</td>
                  <td className="p-4 font-tech">
                    {formatMinutesToHours(log.totalMinutes)}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {log.details.start
                      ? `${log.details.start} - ${log.details.end}`
                      : `V:${log.details.vertrekker}, B:${log.details.blijver}, EB:${log.details.extraBed}`}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}

// --- Página Financeira (Admin) ---
function FinancialsPage({ setPage, data }: { setPage: (page: string) => void; data: any }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    users,
    workLogs,
    houses,
    incomes,
    setIncomes,
    miscExpenses,
    setMiscExpenses,
    houseExpenses,
    setHouseExpenses,
    payrollData,
    setPayrollData,
  } = data;

  const currentMonthKey = currentDate.toISOString().slice(0, 7);

  const [newIncome, setNewIncome] = useState({ description: "", amount: "" });
  const [newMiscExpense, setNewMiscExpense] = useState({
    description: "",
    amount: "",
  });
  const [newHouseExpense, setNewHouseExpense] = useState({
    houseId: houses[0]?.id || "",
    description: "",
    amount: "",
  });

  const monthData = payrollData[currentMonthKey] || {
    extras: {},
    discounts: {},
  };
  const monthIncomes = incomes[currentMonthKey] || [];
  const monthMiscExpenses = miscExpenses[currentMonthKey] || [];
  const monthHouseExpenses = houseExpenses[currentMonthKey] || [];

  const employeeList = (Object.values(users) as User[]).filter((u: User) => u.role === "employee");

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const monthWorkLogs = workLogs.filter((log: any) => {
    const logDate = new Date(log.date.replace(/-/g, "/"));
    return logDate >= firstDayOfMonth && logDate <= lastDayOfMonth;
  });

  const calculatedPayroll = (employeeList as User[]).map((emp: User) => {
    const userLogs = monthWorkLogs.filter((log: any) => log.userId === emp.id);
    const totalMinutes = userLogs.reduce((sum: number, log: any) => sum + log.totalMinutes, 0);
    const sundayBonusMinutes = userLogs.reduce(
      (sum: number, log: any) =>
        new Date(log.date.replace(/-/g, "/")).getDay() === 0
          ? sum + log.totalMinutes
          : sum,
      0
    );
    const hourlyRate = getRateForDate(emp, lastDayOfMonth);
    const baseSalary = (totalMinutes / 60) * hourlyRate;
    const sundayBonus = (sundayBonusMinutes / 60) * hourlyRate; // 100% bónus
    const extra = monthData.extras?.[emp.id] || 0;
    const discount = monthData.discounts?.[emp.id] || 0;
    const netSalary = baseSalary + sundayBonus + extra - discount;
    return {
      ...emp,
      baseSalary,
      sundayBonus,
      extra,
      discount,
      netSalary,
      totalHours: totalMinutes,
    };
  });

  const handleAddIncome = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newIncome.amount && newIncome.description) {
      const newEntry = {
        ...newIncome,
        id: Date.now(),
        amount: parseFloat(newIncome.amount),
        date: new Date().toISOString().split("T")[0],
      };
      setIncomes((prev: any) => ({
        ...prev,
        [currentMonthKey]: [...(prev[currentMonthKey] || []), newEntry],
      }));
      setNewIncome({ description: "", amount: "" });
    }
  };
  const handleAddMiscExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMiscExpense.amount && newMiscExpense.description) {
      const newEntry = {
        ...newMiscExpense,
        id: Date.now(),
        amount: parseFloat(newMiscExpense.amount),
        date: new Date().toISOString().split("T")[0],
      };
      setMiscExpenses((prev: any) => ({
        ...prev,
        [currentMonthKey]: [...(prev[currentMonthKey] || []), newEntry],
      }));
      setNewMiscExpense({ description: "", amount: "" });
    }
  };
  const handleAddHouseExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      newHouseExpense.amount &&
      newHouseExpense.description &&
      newHouseExpense.houseId
    ) {
      const newEntry = {
        ...newHouseExpense,
        id: Date.now(),
        amount: parseFloat(newHouseExpense.amount),
        date: new Date().toISOString().split("T")[0],
      };
      setHouseExpenses((prev: any) => ({
        ...prev,
        [currentMonthKey]: [...(prev[currentMonthKey] || []), newEntry],
      }));
      setNewHouseExpense({
        houseId: houses[0]?.id || "",
        description: "",
        amount: "",
      });
    }
  };
  const handlePayrollChange = (type: string, userId: string, value: string) => {
    setPayrollData((prev: any) => ({
      ...prev,
      [currentMonthKey]: {
        ...(prev[currentMonthKey] || { extras: {}, discounts: {} }),
        [type]: {
          ...prev[currentMonthKey]?.[type],
          [userId]: parseFloat(value) || 0,
        },
      },
    }));
  };

  const totalIncome = monthIncomes.reduce((sum: number, item: any) => sum + item.amount, 0);
  const totalNetSalaries = calculatedPayroll.reduce((sum: number, emp: any) => sum + emp.netSalary, 0);
  const totalMiscExpenses = monthMiscExpenses.reduce((sum: number, item: any) => sum + item.amount, 0);
  const fixedRentExpenses = houses.reduce((sum: number, house: House) => sum + (house.rent || 0), 0);
  const variableHouseExpenses = monthHouseExpenses.reduce((sum: number, item: any) => sum + item.amount, 0);
  const totalHouseExpenses = fixedRentExpenses + variableHouseExpenses;
  const finalBalance =
    totalIncome - totalNetSalaries - totalHouseExpenses - totalMiscExpenses;
  const changeMonth = (offset: number) => {
    setCurrentDate(
      (prevDate) =>
        new Date(prevDate.getFullYear(), prevDate.getMonth() + offset, 15)
    );
  };

  const handlePrintReport = () => {
    const reportTitle = `Relatório Financeiro - ${currentDate.toLocaleString(
      "pt-BR",
      { month: "long", year: "numeric" }
    )}`;

    const summaryHtml = `
            <div class="section">
                <h2>Resumo Financeiro</h2>
                <table class="summary-table">
                    <tr><td>Receitas Totais:</td><td class="currency positive">€ ${totalIncome.toFixed(
                      2
                    )}</td></tr>
                    <tr><td>Total Salários Líquidos:</td><td class="currency negative">€ ${totalNetSalaries.toFixed(
                      2
                    )}</td></tr>
                    <tr><td>Total Despesas (Diversas + Casas):</td><td class="currency negative">€ ${(
                      totalMiscExpenses + totalHouseExpenses
                    ).toFixed(2)}</td></tr>
                    <tr class="total"><td>Saldo Final do Mês:</td><td class="currency ${
                      finalBalance >= 0 ? "positive" : "negative"
                    }">€ ${finalBalance.toFixed(2)}</td></tr>
                </table>
            </div>
        `;

    const incomesHtml = `
            <div class="section">
                <h2>Receitas</h2>
                <table>
                    <thead><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr></thead>
                    <tbody>
                        ${monthIncomes.map((item: any) => `<tr><td>${formatDate(item.date)}</td><td>${item.description}</td><td class="currency positive">€ ${item.amount.toFixed(2)}</td></tr>`).join("")}
                    </tbody>
                </table>
            </div>
        `;

    const expensesHtml = `
            <div class="section">
                <h2>Despesas</h2>
                <h3>Diversas</h3>
                <table>
                    <thead><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr></thead>
                    <tbody>
                        ${monthMiscExpenses.map((item: any) => `<tr><td>${formatDate(item.date)}</td><td>${item.description}</td><td class="currency negative">€ ${item.amount.toFixed(2)}</td></tr>`).join("")}
                    </tbody>
                </table>
                <h3 style="margin-top: 20px;">Casas</h3>
                <table>
                    <thead><tr><th>Data</th><th>Casa</th><th>Descrição</th><th>Valor</th></tr></thead>
                    <tbody>
                        ${monthHouseExpenses.map((item: any) => `<tr><td>${formatDate(item.date)}</td><td>${houses.find((h: House) => String(h.id) === String(item.houseId))?.name || ""}</td><td>${item.description}</td><td class="currency negative">€ ${item.amount.toFixed(2)}</td></tr>`).join("")}
                        <tr><td>-</td><td><strong>Aluguel Fixo Total</strong></td><td></td><td class="currency negative"><strong>€ ${fixedRentExpenses.toFixed(
                          2
                        )}</strong></td></tr>
                    </tbody>
                </table>
            </div>
        `;

    const payrollHtml = `
            <div class="section">
                <h2>Folha de Pagamento</h2>
                <table>
                        <thead>
                            <tr><th>Funcionário</th><th>Horas</th><th>Base</th><th>Bónus Dom.</th><th>Extras</th><th>Descontos</th><th>Salário Líquido</th></tr>
                        </thead>
                        <tbody>
                            ${calculatedPayroll
                              .map(
                                (emp) => `
                                <tr>
                                    <td>${emp.name}</td>
                                    <td>${formatMinutesToHours(
                                      emp.totalHours
                                    )}</td>
                                    <td class="currency">€ ${emp.baseSalary.toFixed(
                                      2
                                    )}</td>
                                    <td class="currency">€ ${emp.sundayBonus.toFixed(
                                      2
                                    )}</td>
                                    <td class="currency">€ ${emp.extra.toFixed(
                                      2
                                    )}</td>
                                    <td class="currency negative">€ ${emp.discount.toFixed(
                                      2
                                    )}</td>
                                    <td class="currency total">€ ${emp.netSalary.toFixed(
                                      2
                                    )}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                </table>
            </div>
        `;

    const reportHtml = `
            <html>
                <head>
                    <title>${reportTitle}</title>
                    <style>
                        body { font-family: sans-serif; margin: 20px; }
                        h1, h2, h3 { color: #333; }
                        h1 { text-align: center; margin-bottom: 30px; }
                        .section { margin-bottom: 30px; page-break-inside: avoid; }
                        table { width: 100%; border-collapse: collapse; font-size: 12px; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        thead { background-color: #f2f2f2; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .currency { text-align: right; font-family: monospace; }
                        .positive { color: #28a745; }
                        .negative { color: #dc3545; }
                        .total { font-weight: bold; }
                        .summary-table td:first-child { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    ${summaryHtml}
                    ${payrollHtml}
                    ${incomesHtml}
                    ${expensesHtml}
                </body>
            </html>
        `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <PageWrapper
      title="Controlo Financeiro"
      setPage={setPage}
      onPrint={handlePrintReport}
    >
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-4 bg-[#1a233b]/80 rounded-xl border border-gray-700">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 bg-gray-600 rounded-md hover:bg-gray-500"
        >
          <ChevronLeft />
        </button>
        <h2 className="text-xl font-bold">
          {currentDate.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 bg-gray-600 rounded-md hover:bg-gray-500"
        >
          <ChevronRight />
        </button>
      </div>
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("summary")}
          className={`py-2 px-4 font-bold ${
            activeTab === "summary"
              ? "text-[#43e0a2] border-b-2 border-[#43e0a2]"
              : "text-gray-400"
          }`}
        >
          Resumo
        </button>
        <button
          onClick={() => setActiveTab("payroll")}
          className={`py-2 px-4 font-bold ${
            activeTab === "payroll"
              ? "text-[#43e0a2] border-b-2 border-[#43e0a2]"
              : "text-gray-400"
          }`}
        >
          Pagamentos
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`py-2 px-4 font-bold ${
            activeTab === "expenses"
              ? "text-[#43e0a2] border-b-2 border-[#43e0a2]"
              : "text-gray-400"
          }`}
        >
          Despesas
        </button>
        <button
          onClick={() => setActiveTab("incomes")}
          className={`py-2 px-4 font-bold ${
            activeTab === "incomes"
              ? "text-[#43e0a2] border-b-2 border-[#43e0a2]"
              : "text-gray-400"
          }`}
        >
          Receitas
        </button>
      </div>
      {activeTab === "summary" && (
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialCard
            title="Receitas Totais"
            value={totalIncome}
            color="text-green-400"
          />
          <FinancialCard
            title="Salários Líquidos"
            value={-totalNetSalaries}
            color="text-red-400"
          />
          <FinancialCard
            title="Despesas Totais"
            value={-(totalMiscExpenses + totalHouseExpenses)}
            color="text-red-400"
          />
          <FinancialCard
            title="Saldo Final"
            value={finalBalance}
            color={finalBalance >= 0 ? "text-green-400" : "text-red-400"}
            isLarge={true}
          />
        </div>
      )}
      {activeTab === "payroll" && (
        <div className="animate-fade-in bg-[#1a233b]/80 rounded-2xl border border-gray-700 overflow-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-3 font-bold">Funcionário</th>
                <th className="p-3 font-bold">Base</th>
                <th className="p-3 font-bold">Bónus Dom.</th>
                <th className="p-3 font-bold">Extras</th>
                <th className="p-3 font-bold">Descontos</th>
                <th className="p-3 font-bold">Salário Líquido</th>
              </tr>
            </thead>
            <tbody>
              {calculatedPayroll.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-gray-700 last:border-b-0"
                >
                  <td className="p-3">
                    {emp.name}
                    <br />
                    <span className="text-xs text-gray-400">
                      {formatMinutesToHours(emp.totalHours)}
                    </span>
                  </td>
                  <td className="p-3 font-tech">
                    €{emp.baseSalary.toFixed(2)}
                  </td>
                  <td className="p-3 font-tech">
                    €{emp.sundayBonus.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={emp.extra}
                      onChange={(e) =>
                        handlePayrollChange("extras", emp.id, e.target.value)
                      }
                      className="w-24 bg-[#10182B] rounded-md p-1 border border-gray-600"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={emp.discount}
                      onChange={(e) =>
                        handlePayrollChange("discounts", emp.id, e.target.value)
                      }
                      className="w-24 bg-[#10182B] rounded-md p-1 border border-gray-600"
                    />
                  </td>
                  <td className="p-3 font-bold text-green-400 font-tech">
                    €{emp.netSalary.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === "expenses" && (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpenseCard
            title="Despesas Diversas"
            items={monthMiscExpenses}
            onSave={handleAddMiscExpense}
            formState={newMiscExpense}
            setFormState={setNewMiscExpense}
          />
          <ExpenseCard
            title="Despesas das Casas"
            items={monthHouseExpenses}
            onSave={handleAddHouseExpense}
            formState={newHouseExpense}
            setFormState={setNewHouseExpense}
            houses={houses}
          />
        </div>
      )}
      {activeTab === "incomes" && (
        <div className="animate-fade-in">
          <ExpenseCard
            title="Receitas do Mês"
            items={monthIncomes}
            onSave={handleAddIncome}
            formState={newIncome}
            setFormState={setNewIncome}
            isIncome={true}
          />
        </div>
      )}
    </PageWrapper>
  );
}

function FinancialCard({
  title,
  value,
  color,
  isLarge = false,
}: {
  title: string;
  value: number;
  color: string;
  isLarge?: boolean;
}) {
  return (
    <div
      className={`bg-[#1a233b]/80 p-6 rounded-xl border border-gray-700 ${
        isLarge ? "lg:col-span-1" : ""
      }`}
    >
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      <p
        className={`font-bold font-tech ${
          isLarge ? "text-4xl" : "text-3xl"
        } ${color}`}
      >
        € {value.toFixed(2)}
      </p>
    </div>
  );
}

function ExpenseCard({
  title,
  items,
  onSave,
  formState,
  setFormState,
  houses,
  isIncome = false,
}: {
  title: string;
  items: any[];
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  formState: any;
  setFormState: React.Dispatch<React.SetStateAction<any>>;
  houses?: House[];
  isIncome?: boolean;
}) {
  return (
    <div className="bg-[#1a233b]/80 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <form onSubmit={onSave} className="flex flex-wrap gap-2 mb-4">
        {houses && (
          <select
            value={formState.houseId}
            onChange={(e) =>
              setFormState((p: any) => ({ ...p, houseId: e.target.value }))
            }
            className="py-2 px-2 bg-[#10182B] rounded-md border-gray-600 flex-grow"
          >
            <option value="">Casa...</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          placeholder="Descrição"
          value={formState.description}
          onChange={(e) =>
            setFormState((p: any) => ({ ...p, description: e.target.value }))
          }
          required
          className="py-2 px-2 bg-[#10182B] rounded-md border-gray-600 flex-grow"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Valor"
          value={formState.amount}
          onChange={(e) =>
            setFormState((p: any) => ({ ...p, amount: e.target.value }))
          }
          required
          className="py-2 px-2 bg-[#10182B] rounded-md border-gray-600 w-24"
        />
        <button
          type="submit"
          className="bg-[#43e0a2] text-[#10182B] p-2 rounded-md font-bold hover:bg-green-400"
        >
          +
        </button>
      </form>
      <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 no-scrollbar">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center bg-[#10182B] p-2 rounded-md"
          >
            <span>
              {item.description}{" "}
              {houses &&
                item.houseId &&
                `(${
                  houses.find((h: House) => String(h.id) === String(item.houseId))?.name
                })`}
            </span>
            <span
              className={`font-bold font-tech ${
                isIncome ? "text-green-400" : "text-red-400"
              }`}
            >
              € {item.amount.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
