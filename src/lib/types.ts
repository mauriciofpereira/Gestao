

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'employee';
    password?: string;
    jobType: 'byTime' | 'byProduction';
    hourlyRates: { rate: number; effectiveDate: string }[];
    startDate: string;
    phone: string;
    houseId: number | null;
}

export interface House {
    id: number;
    name: string;
    address: string;
    rent: number;
}

export interface WorkLog {
  id: number;
  userId: string;
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  status: 'Aprovado' | 'Pendente' | 'Rejeitado';
  details: {
    start: string; // for byTime
    end: string; // for byTime
    vertrekker: number; // for byProduction
    blijver: number; // for byProduction
    extraBed: number; // for byProduction
    extraUur: number; // for byProduction
  };
}

export interface Worksite {
  id: number;
  name: string;
  address: string;
  type: 'Hotel' | 'Obra' | 'Outro';
  isActive: boolean;
}

export type Planning = {
  [date: string]: { // format YYYY-MM-DD
    [userId: string]: string; // worksite name or 'Folga'
  };
};

export interface Vehicle {
    id: number;
    name: string;
    plate: string;
    insurance: string; // YYYY-MM-DD
    inspection: string; // YYYY-MM-DD
    status: "Disponível" | "Em uso" | "Manutenção";
    image: string;
    hint: string;
}

export interface Revenue {
    id: string;
    description: string;
    client: string;
    date: string; // YYYY-MM-DD
    amount: number;
    status: 'Pendente' | 'Recebido';
}

export interface MiscExpense {
    id: string;
    description: string;
    category: string;
    date: string; // YYYY-MM-DD
    amount: number;
    status: 'Pendente' | 'Pago';
}

export interface Announcement {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    content: string;
    categories: string[];
    priority: 'high' | 'medium' | 'low';
}

export interface Permission {
    feature: string;
    description: string;
    employee: boolean;
    admin: boolean;
}

export interface LeaveRequest {
    id: number;
    employeeId: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    daysRequested: number;
    status: 'Pendente' | 'Aprovado' | 'Rejeitado';
    reason: string;
    createdAt: string; // YYYY-MM-DD
}
