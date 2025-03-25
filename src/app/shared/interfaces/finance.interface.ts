export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface Account {
  id: number;
  name: string;
  balance: number;
  type: 'savings' | 'checking' | 'credit' | 'cash';
  color?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: Date;
  categoryId: number;
  accountId: number;
}

export interface Budget {
  id: number;
  categoryId: number;
  amount: number;
  month: number;
  year: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}
