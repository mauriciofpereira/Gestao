
"use client"

import type { House, User, WorkLog, Worksite, Planning, Vehicle, Revenue, MiscExpense, Announcement, LeaveRequest, Permission } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

// --- Helper function ---
export const getRateForDate = (user: User, date: Date): number => {
  if (!user || !user.hourlyRates || user.hourlyRates.length === 0) return 0;
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) return 0;

  const sortedRates = [...user.hourlyRates].sort(
    (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  );
  const applicableRate = sortedRates.find(
    (r) => new Date(r.effectiveDate) <= targetDate
  );
  return applicableRate
    ? applicableRate.rate
    : sortedRates[sortedRates.length - 1]?.rate || 0;
};

export const formatMinutesToHours = (minutes: number) => {
  if (minutes === null || isNaN(minutes) || minutes < 0) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};


// --- Mock Data ---
const initialUsers: User[] = [
  { id: 'admin@erpparalelo.com', name: 'Admin', role: 'admin', password: 'admin123', jobType: 'byTime', hourlyRates: [], startDate: '2023-01-01', phone: '', houseId: null, email: 'admin@erpparalelo.com' },
  { id: 'ana.silva@paralelo.com', name: 'Ana Silva', role: 'employee', password: 'ana123', jobType: 'byTime', hourlyRates: [{rate: 12.50, effectiveDate: '2023-01-01'}], startDate: '2023-01-15', phone: '123456789', houseId: 1, email: 'ana.silva@paralelo.com' },
  { id: 'joao.costa@paralelo.com', name: 'João Costa', role: 'employee', password: 'joao123', jobType: 'byProduction', hourlyRates: [{rate: 15.00, effectiveDate: '2023-01-01'}], startDate: '2023-03-01', phone: '987654321', houseId: 2, email: 'joao.costa@paralelo.com' },
];

const initialHouses: House[] = [
 { id: 1, name: 'Casa Deerlijk', address: 'Rua das Flores, 1, Deerlijk', rent: 950 },
 { id: 2, name: 'Casa Gent', address: 'Praça Central, 2, Gent', rent: 1100 },
];

// Use a fixed date to ensure consistency between server and client rendering
const today = new Date('2024-07-15T12:00:00Z');
const year = today.getFullYear();
const month = today.getMonth();

const initialWorkLogs: WorkLog[] = [
  // Ana Silva (byTime) - 3 days of work this month
  { id: 1, userId: 'ana.silva@paralelo.com', date: new Date(year, month, 2).toISOString().split('T')[0], totalMinutes: 450, status: 'Aprovado', details: { start: '09:00', end: '17:00', vertrekker: 0, blijver: 0, extraBed: 0, extraUur: 0 } }, 
  { id: 2, userId: 'ana.silva@paralelo.com', date: new Date(year, month, 3).toISOString().split('T')[0], totalMinutes: 480, status: 'Aprovado', details: { start: '08:30', end: '17:00', vertrekker: 0, blijver: 0, extraBed: 0, extraUur: 0 } }, 
  { id: 3, userId: 'ana.silva@paralelo.com', date: new Date(year, month, 4).toISOString().split('T')[0], totalMinutes: 465, status: 'Pendente', details: { start: '09:00', end: '17:15', vertrekker: 0, blijver: 0, extraBed: 0, extraUur: 0 } }, 

  // João Costa (byProduction) - 3 days of work this month
  // totalMinutes = (vertrekker * 30) + (blijver * 20) + (extraBed * 5) + extraUur
  { id: 4, userId: 'joao.costa@paralelo.com', date: new Date(year, month, 2).toISOString().split('T')[0], totalMinutes: 400, status: 'Aprovado', details: { start: '', end: '', vertrekker: 10, blijver: 5, extraBed: 0, extraUur: 0 } }, 
  { id: 5, userId: 'joao.costa@paralelo.com', date: new Date(year, month, 3).toISOString().split('T')[0], totalMinutes: 400, status: 'Pendente', details: { start: '', end: '', vertrekker: 8, blijver: 8, extraBed: 0, extraUur: 0 } },
  { id: 6, userId: 'joao.costa@paralelo.com', date: new Date(year, month, 4).toISOString().split('T')[0], totalMinutes: 410, status: 'Rejeitado', details: { start: '', end: '', vertrekker: 12, blijver: 2, extraBed: 2, extraUur: 0 } },
  { id: 7, userId: 'ana.silva@paralelo.com', date: new Date(year, month, 5).toISOString().split('T')[0], totalMinutes: 480, status: 'Pendente', details: { start: '09:00', end: '17:30', vertrekker: 0, blijver: 0, extraBed: 0, extraUur: 0 } },
];

const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
for(let i = 0; i < 7; i++){
    const date = addDays(startOfThisWeek, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!initialWorkLogs.some(log => log.date === dateStr && log.userId === 'ana.silva@paralelo.com')) {
         initialWorkLogs.push({ id: 10+i, userId: 'ana.silva@paralelo.com', date: dateStr, totalMinutes: (i < 5) ? 420 + (i*10) : 0, status: 'Aprovado', details: { start: '09:00', end: '17:00', vertrekker: 0, blijver: 0, extraBed: 0, extraUur: 0 } });
    }
     if (!initialWorkLogs.some(log => log.date === dateStr && log.userId === 'joao.costa@paralelo.com')) {
         initialWorkLogs.push({ id: 20+i, userId: 'joao.costa@paralelo.com', date: dateStr, totalMinutes: (i < 5) ? 430 + (i*5) : 0, status: 'Aprovado', details: { start: '', end: '', vertrekker: 10, blijver: 5, extraBed: 0, extraUur: 0 } });
    }
}


const initialWorksites: Worksite[] = [
  { id: 1, name: 'Hotel Helios', address: 'Rua Principal, 123, Gent', type: 'Hotel', isActive: true },
  { id: 2, name: 'Obra de Brugges', address: 'Avenida das Construções, 456, Brugges', type: 'Obra', isActive: true },
  { id: 3, name: 'Escritório Central', address: 'Avenida da Liberdade, 10, Bruxelas', type: 'Outro', isActive: false },
];

const todayStr = format(today, 'yyyy-MM-dd');
const initialPlanning: Planning = {
  [todayStr]: {
    'ana.silva@paralelo.com': 'Hotel Helios',
    'joao.costa@paralelo.com': 'Folga',
  }
};

const initialVehicles: Vehicle[] = [
  {
    id: 1,
    name: "Fiat Toro",
    plate: "BRA2E19",
    insurance: "2025-08-15",
    inspection: "2025-10-20",
    status: "Disponível",
    image: "https://placehold.co/600x400.png",
    hint: "white pickup truck"
  },
  {
    id: 2,
    name: "Renault Master",
    plate: "XYZ-5678",
    insurance: "2025-06-30",
    inspection: "2025-07-15",
    status: "Em uso",
    image: "https://placehold.co/600x400.png",
    hint: "white van"
  },
  {
    id: 3,
    name: "VW Gol",
    plate: "QWE-9876",
    insurance: "2024-12-01",
    inspection: "2025-02-28",
    status: "Manutenção",
    image: "https://placehold.co/600x400.png",
    hint: "silver compact car"
  },
]

const initialRevenue: Revenue[] = [
    { id: "REV001", description: "Projeto Website Corporativo", client: "Empresa X", date: format(new Date(year, month, 20), 'yyyy-MM-dd'), amount: 15000.00, status: 'Recebido' },
    { id: "REV002", description: "Consultoria SEO", client: "Startup Y", date: format(new Date(year, month, 18), 'yyyy-MM-dd'), amount: 8500.00, status: 'Recebido' },
    { id: "REV003", description: "Manutenção de Sistema", client: "Cliente Z", date: format(new Date(year, month, 15), 'yyyy-MM-dd'), amount: 2000.00, status: 'Pendente' },
]

const initialMiscExpenses: MiscExpense[] = [
  { id: "EXP001", description: "Licença Software de Design", category: "Software", date: format(new Date(year, month, 15), 'yyyy-MM-dd'), amount: 1200.00, status: 'Pago' },
  { id: "EXP002", description: "Material de Escritório", category: "Suprimentos", date: format(new Date(year, month, 12), 'yyyy-MM-dd'), amount: 350.70, status: 'Pago' },
  { id: "EXP003", description: "Serviços de Cloud (AWS)", category: "Infraestrutura", date: format(new Date(year, month, 10), 'yyyy-MM-dd'), amount: 2850.00, status: 'Pendente' },
  { id: "EXP004", description: "Campanha de Marketing Digital", category: "Marketing", date: format(new Date(year, month, 5), 'yyyy-MM-dd'), amount: 5000.00, status: 'Pendente' },
]

const initialAnnouncements: Announcement[] = [
  { id: "1", title: "Festa de Fim de Ano 2024", date: "2024-11-15", content: "Preparem-se! Nossa tradicional festa de fim de ano acontecerá no dia 20 de Dezembro no Espaço Garden. Teremos música ao vivo, buffet completo e muitas surpresas. Por favor, confirme sua presença e de seu acompanhante até o dia 01/12.", categories: ["Eventos", "RH"], priority: "high" },
  { id: "2", title: "Atualização da Política de Home Office", date: "2024-11-10", content: "A partir de Janeiro de 2025, nosso modelo de trabalho será híbrido, com 3 dias no escritório e 2 dias em home office. A nova política detalhada está disponível na intranet. Consulte seu gestor para alinhar os dias da sua equipe.", categories: ["Política Interna"], priority: "medium" },
  { id: "3", title: "Lançamento do Novo Módulo de Frota", date: "2024-11-05", content: "É com grande prazer que anunciamos o lançamento do novo módulo de 'Frota' aqui no ERP Paralelo Esclarecido! Agora você pode agendar o uso dos veículos da empresa diretamente pela plataforma. Explore a nova funcionalidade e nos dê seu feedback.", categories: ["Produto", "Geral"], priority: "medium" },
  { id: "4", title: "Pesquisa de Clima Organizacional", date: "2024-11-01", content: "Sua opinião é muito importante para nós! A pesquisa de clima organizacional já está disponível e pode ser respondida anonimamente até o dia 25/11. Sua participação ajuda a construir uma empresa cada vez melhor.", categories: ["RH"], priority: "low" },
].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const initialLeaveRequests: LeaveRequest[] = [
    { id: 1, employeeId: 'ana.silva@paralelo.com', startDate: '2024-12-20', endDate: '2024-12-27', daysRequested: 6, status: 'Aprovado', reason: 'Férias de Natal', createdAt: '2024-11-10' },
    { id: 2, employeeId: 'joao.costa@paralelo.com', startDate: '2025-01-10', endDate: '2025-01-17', daysRequested: 6, status: 'Pendente', reason: 'Viagem em família.', createdAt: '2024-11-15' },
    { id: 3, employeeId: 'ana.silva@paralelo.com', startDate: '2024-09-02', endDate: '2024-09-06', daysRequested: 5, status: 'Rejeitado', reason: 'Pedido de última hora para um festival.', createdAt: '2024-08-28' },
];

const initialPermissionsData: Permission[] = [
  { feature: 'Visualizar Dashboard', description: 'Acesso à tela principal com métricas resumidas.', employee: true, admin: true },
  { feature: 'Gerenciar Escala de Trabalho', description: 'Criar e modificar a escala de todos os funcionários.', employee: false, admin: true },
  { feature: 'Registrar Horas Próprias', description: 'Lançar as próprias horas ou produção.', employee: true, admin: true },
  { feature: 'Aprovar Horas da Equipe', description: 'Validar os registros de ponto de todos.', employee: false, admin: true },
  { feature: 'Solicitar Férias Próprias', description: 'Fazer pedidos de férias para si mesmo.', employee: true, admin: true },
  { feature: 'Gerenciar Pedidos de Férias', description: 'Aprovar ou rejeitar pedidos de toda a equipe.', employee: false, admin: true },
  { feature: 'Acessar Módulo Financeiro', description: 'Visualizar e gerenciar receitas, despesas e folha de pagamento.', employee: false, admin: true },
  { feature: 'Gerar Relatórios', description: 'Criar e exportar relatórios de horas e custos.', employee: false, admin: true },
  { feature: 'Ver Comunicados', description: 'Ler os comunicados internos da empresa.', employee: true, admin: true },
  { feature: 'Publicar Comunicados', description: 'Criar e enviar novos comunicados para todos.', employee: false, admin: true },
  { feature: 'Gerenciar Equipe (CRUD)', description: 'Adicionar, editar e remover funcionários.', employee: false, admin: true },
  { feature: 'Gerenciar Locais, Casas e Frota', description: 'Administrar os ativos e locais da empresa.', employee: false, admin: true },
  { feature: 'Editar Próprio Perfil', description: 'Alterar informações pessoais como nome e senha.', employee: true, admin: true },
  { feature: 'Gerenciar Permissões de Usuários', description: 'Definir quem é administrador ou funcionário.', employee: false, admin: true },
];


// --- Context Definition ---
interface DataContextProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  houses: House[];
  setHouses: React.Dispatch<React.SetStateAction<House[]>>;
  workLogs: WorkLog[];
  setWorkLogs: React.Dispatch<React.SetStateAction<WorkLog[]>>;
  worksites: Worksite[];
  setWorksites: React.Dispatch<React.SetStateAction<Worksite[]>>;
  planning: Planning;
  setPlanning: React.Dispatch<React.SetStateAction<Planning>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  revenue: Revenue[];
  setRevenue: React.Dispatch<React.SetStateAction<Revenue[]>>;
  miscExpenses: MiscExpense[];
  setMiscExpenses: React.Dispatch<React.SetStateAction<MiscExpense[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  permissions: Permission[];
  setPermissions: React.Dispatch<React.SetStateAction<Permission[]>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

// --- Provider Component ---
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [houses, setHouses] = useState<House[]>(initialHouses);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(initialWorkLogs);
  const [worksites, setWorksites] = useState<Worksite[]>(initialWorksites);
  const [planning, setPlanning] = useState<Planning>(initialPlanning);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [revenue, setRevenue] = useState<Revenue[]>(initialRevenue);
  const [miscExpenses, setMiscExpenses] = useState<MiscExpense[]>(initialMiscExpenses);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissionsData);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUsers.find(u => u.role === 'admin') || null);


  const value = {
    users, setUsers,
    houses, setHouses,
    workLogs, setWorkLogs,
    worksites, setWorksites,
    planning, setPlanning,
    vehicles, setVehicles,
    revenue, setRevenue,
    miscExpenses, setMiscExpenses,
    announcements, setAnnouncements,
    leaveRequests, setLeaveRequests,
    permissions, setPermissions,
    currentUser, setCurrentUser
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// --- Custom Hook ---
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
