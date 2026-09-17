import { UserCredentials, RegisterUserDto, AuthTokenResponse } from '../models';
import { ApiService } from './api';

export class AuthService {
  public static async login(credentials: UserCredentials): Promise<AuthTokenResponse> {
    const res = await ApiService.post<AuthTokenResponse>('/auth/login', credentials);
    if (res && res.token) {
      ApiService.setToken(res.token);
    }
    return res;
  }

  public static async register(userData: RegisterUserDto): Promise<AuthTokenResponse> {
    const res = await ApiService.post<AuthTokenResponse>('/auth/register', userData);
    if (res && res.token) {
      ApiService.setToken(res.token);
    }
    return res;
  }

  public static async logout(): Promise<void> {
    ApiService.setToken(null);
  }
}
