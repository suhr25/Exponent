// ─── User Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: number;
  preferences: UserPreferences;
}

export interface UserPreferences {
  darkMode: boolean;
  priceAlerts: boolean;
  emailNotifications: boolean;
  defaultExchange: 'NSE' | 'BSE';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
