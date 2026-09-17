export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCredentials {
  email: string;
  password?: string;
}

export interface RegisterUserDto {
  name: string;
  email: string;
  password?: string;
}

export interface AuthTokenResponse {
  token: string;
  user: User;
}
