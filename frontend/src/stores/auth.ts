import { defineStore } from 'pinia';
import { login as loginUsecase, register as registerUsecase } from 'src/usecases/auth';
import type { User } from 'src/domain/user';

interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: null,
  }),
  actions: {
    async login(username: string, password: string) {
      const { token, user } = await loginUsecase({ username, password });
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
    },
    async register(data: { name: string; username: string; email: string; password: string }) {
      await registerUsecase(data);
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});
