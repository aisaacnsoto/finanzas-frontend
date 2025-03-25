export interface User {
  id?: number;
  firstname: string;
  lastname: string;
  phone_number: string;
  email: string;
  password: string;
}

export interface RegistrationResponse {
  success: boolean;
  user: User;
}
