import type { User, Transaction, TransactionSummary, Habit, AuthResponse, TransactionType, Frequency } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined') return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/transactions');
  }

  async getTransactionSummary(): Promise<TransactionSummary> {
    return this.request<TransactionSummary>('/transactions/summary');
  }

  async createTransaction(data: {
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
  }): Promise<Transaction> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    return this.request<Habit[]>('/habits');
  }

  async createHabit(data: {
    name: string;
    description?: string;
    frequency: Frequency;
  }): Promise<Habit> {
    return this.request<Habit>('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleHabit(id: string): Promise<Habit> {
    return this.request<Habit>(`/habits/${id}/toggle`, {
      method: 'POST',
    });
  }

  async deleteHabit(id: string): Promise<void> {
    await this.request(`/habits/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
