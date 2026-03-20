export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type GoalStatus = 'ON_TRACK' | 'AT_RISK' | 'COMPLETED' | 'BEHIND';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  transactionType: TransactionType;
  date: string;
  categoryId?: string;
  category?: TransactionCategory;
}

export interface TransactionSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: Frequency;
  totalCompletions: number;
  isCheckedToday: boolean;
  icon?: string;
  streak: number;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  category: string;
  status: GoalStatus;
  habitId?: string;
}

export interface AuthApiResponse {
  accessToken: string;
  expiresIn: string;
  data: User;
}