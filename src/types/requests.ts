export interface AuthRequest {
  email: string;
  name: string;
}

export interface EditAccountRequest {
  name: string;
  role?: string;
}
