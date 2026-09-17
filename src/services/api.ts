import { API_CONFIG } from '../utils';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
  };
}

export class ApiService {
  private static baseUrl = API_CONFIG.BASE_URL;
  private static token: string | null = null;

  public static setToken(token: string | null) {
    ApiService.token = token;
  }

  public static getToken(): string | null {
    return ApiService.token;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${ApiService.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const authToken = options.token || ApiService.token;
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const responseText = await response.text();
      let data: ApiResponse<T>;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {
          success: false,
          message: 'Invalid response format from server',
        } as ApiResponse<T>;
      }

      if (!response.ok || data.success === false) {
        const errorMessage =
          data.message || data.error?.message || `Server returned error status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return (data.data !== undefined ? data.data : data) as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to TaskFlow server. Please check network connection.');
        }
        throw error;
      }
      throw new Error('An unexpected network error occurred.');
    }
  }

  public static async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return ApiService.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public static async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return ApiService.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return ApiService.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return ApiService.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return ApiService.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
