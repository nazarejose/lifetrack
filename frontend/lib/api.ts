import type {
  User,
  Transaction,
  TransactionSummary,
  TransactionCategory,
  Habit,
  AuthApiResponse,
  TransactionType,
  Frequency,
  Goal,
  GoalStatus,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (response.status === 401) {
      this.logout();
      if (typeof window !== 'undefined') window.location.href = '/';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<AuthApiResponse> {
    const data = await this.request<AuthApiResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data));
    return data;
  }

  async register(name: string, email: string, password: string): Promise<AuthApiResponse> {
    const data = await this.request<AuthApiResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data));
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

  // ─── User ─────────────────────────────────────────────────────────────────

  async updateProfile(data: { name: string; email: string }): Promise<User> {
    const updated = await this.request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    // Atualiza o localStorage com os novos dados
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  }

  async deleteAccount(): Promise<void> {
    await this.request('/user/account', { method: 'DELETE' });
    this.logout();
  }

  // ─── Transactions ─────────────────────────────────────────────────────────

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
    categoryId?: string;
  }): Promise<Transaction> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        description: data.description,
        amount: data.amount,
        transactionType: data.type,
        date: new Date().toISOString(),
        categoryId: data.categoryId ?? null,
      }),
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.request(`/transactions/${id}`, { method: 'DELETE' });
  }

  // ─── Transaction Categories ───────────────────────────────────────────────

  async getTransactionCategories(): Promise<TransactionCategory[]> {
    return this.request<TransactionCategory[]>('/transaction-categories');
  }

  async createTransactionCategory(data: {
    name: string;
    type: TransactionType;
    color: string;
  }): Promise<TransactionCategory> {
    return this.request<TransactionCategory>('/transaction-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTransactionCategory(id: string): Promise<void> {
    await this.request(`/transaction-categories/${id}`, { method: 'DELETE' });
  }

  // ─── Habits ───────────────────────────────────────────────────────────────

  async getHabits(): Promise<Habit[]> {
    return this.request<Habit[]>('/habits');
  }

  async getHabitHistory(period: 'weekly' | 'monthly'): Promise<{ label: string; value: number }[]> {
    return this.request(`/habits/history?period=${period}`);
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
    return this.request<Habit>(`/habits/${id}/toggle`, { method: 'POST' });
  }

  async deleteHabit(id: string): Promise<void> {
    await this.request(`/habits/${id}`, { method: 'DELETE' });
  }

  // ─── Goals ────────────────────────────────────────────────────────────────

  async getGoals(): Promise<Goal[]> {
    return this.request<Goal[]>('/goals');
  }

  async createGoal(data: {
    name: string;
    description?: string;
    targetValue: number;
    currentValue?: number;
    deadline: string;
    category: string;
    status?: GoalStatus;
    habitId?: string;
  }): Promise<Goal> {
    return this.request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(id: string, data: {
    currentValue?: number;
    status?: GoalStatus;
    name?: string;
    description?: string;
    targetValue?: number;
    deadline?: string;
    category?: string;
    habitId?: string;
  }): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(id: string): Promise<void> {
    await this.request(`/goals/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();