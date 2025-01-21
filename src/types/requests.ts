export interface AuthRequest {
  email: string;
  name: string;
  role: "user" | "admin";
}

export interface EditAccountRequest {
  name: string;
  role?: string;
}
