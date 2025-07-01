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
