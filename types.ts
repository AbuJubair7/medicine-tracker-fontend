
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Medicine {
  id: number;
  name: string;
  dose: string | number;
  quantity: string | number;
  takeMorning: boolean;
  takeAfternoon: boolean;
  takeEvening: boolean;
}

export interface Stock {
  id: number;
  name: string;
  medicines: Medicine[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}
