export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface TransactionSummary {
  balance: number;
  incomes: number;
  expenses: number;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: Frequency;
  totalCompletions: number;
  isCheckedToday: boolean;
  icon?: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  category: string;
  status: 'on-track' | 'at-risk' | 'completed' | 'behind';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
