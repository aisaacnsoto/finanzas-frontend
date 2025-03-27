import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Category,
  Account,
  Transaction,
  Budget,
  DateRange,
  ChartData
} from '../../../shared/interfaces/finance.interface';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private categories: Category[] = [
    { id: 1, name: 'Alimentación', type: 'expense', color: '#FF6B6B' },
    { id: 2, name: 'Transporte', type: 'expense', color: '#4ECDC4' },
    { id: 3, name: 'Entretenimiento', type: 'expense', color: '#45B7D1' },
    { id: 4, name: 'Salario', type: 'income', color: '#96CEB4' },
    { id: 5, name: 'Freelance', type: 'income', color: '#FFEEAD' }
  ];

  private accounts: Account[] = [
    { id: 1, name: 'Cuenta de Ahorros', type: 'savings', balance: 5000, color: '#6C5B7B' },
    { id: 2, name: 'Efectivo', type: 'cash', balance: 1000, color: '#355C7D' }
  ];

  private transactions: Transaction[] = [
    {
      id: 1,
      amount: 1500,
      type: 'income',
      description: 'Salario quincenal',
      date: new Date(2025, 2, 15),
      categoryId: 4,
      accountId: 1
    },
    {
      id: 2,
      amount: 200,
      type: 'expense',
      description: 'Compras supermercado',
      date: new Date(2025, 2, 16),
      categoryId: 1,
      accountId: 2
    },
    // Add more mock transactions here
  ];

  private budgets: Budget[] = [
    { id: 1, categoryId: 1, amount: 1000, month: 3, year: 2025 },
    { id: 2, categoryId: 2, amount: 500, month: 3, year: 2025 }
  ];

  constructor() {
    // Generate more mock transactions
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);

    for (let i = 0; i < 50; i++) {
      const randomDate = new Date(
        pastDate.getTime() + Math.random() * (currentDate.getTime() - pastDate.getTime())
      );

      const isExpense = Math.random() > 0.3;
      const categoryId = isExpense ?
        Math.floor(Math.random() * 3) + 1 : // Expense categories (1-3)
        Math.floor(Math.random() * 2) + 4;  // Income categories (4-5)

      this.transactions.push({
        id: i + 3,
        amount: Math.floor(Math.random() * 1000) + 50,
        type: isExpense ? 'expense' : 'income',
        description: isExpense ? 'Gasto aleatorio' : 'Ingreso aleatorio',
        date: randomDate,
        categoryId: categoryId,
        accountId: Math.random() > 0.5 ? 1 : 2
      });
    }
  }

  getCategories(): Observable<Category[]> {
    return of(this.categories).pipe(delay(500));
  }

  getAccounts(): Observable<Account[]> {
    return of(this.accounts).pipe(delay(500));
  }

  getBudgets(month: number, year: number): Observable<Budget[]> {
    return of(this.budgets.filter(b => b.month === month && b.year === year))
      .pipe(delay(500));
  }

  getTransactions(dateRange: DateRange): Observable<Transaction[]> {
    return of(this.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
    })).pipe(delay(500));
  }

  addCategory(category: Omit<Category, 'id'>): Observable<Category> {
    const newCategory = {
      ...category,
      id: Math.max(...this.categories.map(c => c.id)) + 1
    };
    this.categories.push(newCategory);
    return of(newCategory).pipe(delay(500));
  }

  addAccount(account: Omit<Account, 'id'>): Observable<Account> {
    const newAccount = {
      ...account,
      id: Math.max(...this.accounts.map(a => a.id)) + 1
    };
    this.accounts.push(newAccount);
    return of(newAccount).pipe(delay(500));
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): Observable<Transaction> {
    const newTransaction = {
      ...transaction,
      id: Math.max(...this.transactions.map(t => t.id), 0) + 1
    };
    this.transactions.push(newTransaction);

    // Actualizar el balance de la cuenta
    const account = this.accounts.find(a => a.id === transaction.accountId);
    if (account) {
      account.balance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
    }

    return of(newTransaction).pipe(delay(500));
  }

  addBudget(budget: Omit<Budget, 'id'>): Observable<Budget> {
    const newBudget = {
      ...budget,
      id: Math.max(...this.budgets.map(b => b.id)) + 1
    };
    this.budgets.push(newBudget);
    return of(newBudget).pipe(delay(500));
  }

  updateBudget(id: number, budget: Omit<Budget, 'id'>): Observable<Budget> {
    const updatedBudget = { ...budget, id };
    const index = this.budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      this.budgets[index] = updatedBudget;
    }
    return of(updatedBudget).pipe(delay(500));
  }

  deleteBudget(id: number): Observable<void> {
    const index = this.budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      this.budgets.splice(index, 1);
    }
    return of(undefined).pipe(delay(500));
  }

  updateCategory(id: number, category: Omit<Category, 'id'>): Observable<Category> {
    const updatedCategory = { ...category, id };
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categories[index] = updatedCategory;
    }
    return of(updatedCategory).pipe(delay(500));
  }

  deleteCategory(id: number): Observable<void> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categories.splice(index, 1);
    }
    return of(undefined).pipe(delay(500));
  }

  updateAccount(id: number, account: Omit<Account, 'id'>): Observable<Account> {
    const updatedAccount = { ...account, id };
    const index = this.accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      this.accounts[index] = updatedAccount;
    }
    return of(updatedAccount).pipe(delay(500));
  }

  deleteAccount(id: number): Observable<void> {
    const index = this.accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      this.accounts.splice(index, 1);
    }
    return of(undefined).pipe(delay(500));
  }

  updateTransaction(id: number, transaction: Omit<Transaction, 'id'>): Observable<Transaction> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      // Revertir la transacción anterior
      const oldTransaction = this.transactions[index];
      const oldAccount = this.accounts.find(a => a.id === oldTransaction.accountId);
      if (oldAccount) {
        oldAccount.balance -= oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount;
      }

      // Aplicar la nueva transacción
      const updatedTransaction = { ...transaction, id };
      this.transactions[index] = updatedTransaction;

      // Actualizar el balance de la nueva cuenta
      const newAccount = this.accounts.find(a => a.id === transaction.accountId);
      if (newAccount) {
        newAccount.balance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
      }

      return of(updatedTransaction).pipe(delay(500));
    }
    return throwError(() => new Error('Transaction not found'));
  }

  deleteTransaction(id: number): Observable<void> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      // Revertir el balance de la cuenta
      const transaction = this.transactions[index];
      const account = this.accounts.find(a => a.id === transaction.accountId);
      if (account) {
        account.balance -= transaction.type === 'income' ? transaction.amount : -transaction.amount;
      }

      this.transactions.splice(index, 1);
    }
    return of(undefined).pipe(delay(500));
  }

  getExpensesByCategory(dateRange: DateRange): Observable<ChartData> {
    const expenses = this.transactions.filter(t =>
      t.type === 'expense' &&
      t.date >= dateRange.start &&
      t.date <= dateRange.end
    );

    const categoryTotals = new Map<number, number>();
    expenses.forEach(e => {
      categoryTotals.set(e.categoryId, (categoryTotals.get(e.categoryId) || 0) + e.amount);
    });

    const sortedCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([categoryId]) => {
        const category = this.categories.find(c => c.id === categoryId);
        return category || { id: categoryId, name: 'Desconocido', type: 'expense', color: '#999999' };
      });

    const data = sortedCategories.map(c => categoryTotals.get(c.id) || 0);

    return of({
      labels: sortedCategories.map(c => c.name),
      datasets: [{
        label: 'Gastos por Categoría',
        data: data,
        backgroundColor: sortedCategories.map(c => c.color || '#999999'),
        borderWidth: 1
      }]
    }).pipe(delay(500));
  }

  getIncomesByCategory(dateRange: DateRange): Observable<ChartData> {
    const incomes = this.transactions.filter(t =>
      t.type === 'income' &&
      t.date >= dateRange.start &&
      t.date <= dateRange.end
    );

    const categoryTotals = new Map<number, number>();
    incomes.forEach(i => {
      categoryTotals.set(i.categoryId, (categoryTotals.get(i.categoryId) || 0) + i.amount);
    });

    const sortedCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([categoryId]) => {
        const category = this.categories.find(c => c.id === categoryId);
        return category || { id: categoryId, name: 'Desconocido', type: 'income', color: '#999999' };
      });

    const data = sortedCategories.map(c => categoryTotals.get(c.id) || 0);

    return of({
      labels: sortedCategories.map(c => c.name),
      datasets: [{
        label: 'Ingresos por Categoría',
        data: data,
        backgroundColor: sortedCategories.map(c => c.color || '#999999'),
        borderWidth: 1
      }]
    }).pipe(delay(500));
  }

  getBudgetVsExpenses(month: number, year: number): Observable<ChartData> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const expenses = this.transactions.filter(t =>
      t.type === 'expense' &&
      t.date >= startDate &&
      t.date <= endDate
    );

    const expensesByCategory = new Map<number, number>();
    expenses.forEach(e => {
      expensesByCategory.set(e.categoryId, (expensesByCategory.get(e.categoryId) || 0) + e.amount);
    });

    const budgetData = this.budgets
      .filter(b => b.month === month && b.year === year)
      .map(b => {
        const category = this.categories.find(c => c.id === b.categoryId);
        return {
          category: category || { id: b.categoryId, name: 'Desconocido', type: 'expense', color: '#999999' },
          budget: b.amount,
          spent: expensesByCategory.get(b.categoryId) || 0
        };
      });

    return of({
      labels: budgetData.map(d => d.category.name),
      datasets: [
        {
          label: 'Presupuesto',
          data: budgetData.map(d => d.budget),
          backgroundColor: ['rgba(54, 162, 235, 0.5)'],
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Gastado',
          data: budgetData.map(d => d.spent),
          backgroundColor: ['rgba(255, 99, 132, 0.5)'],
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    }).pipe(delay(500));
  }

  getBalanceOverTime(dateRange: DateRange): Observable<ChartData> {
    const days: Date[] = [];
    let currentDate = new Date(dateRange.start);

    while (currentDate <= dateRange.end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let balance = 0;
    const balances = days.map(day => {
      const dayTransactions = this.transactions.filter(t =>
        t.date.getFullYear() === day.getFullYear() &&
        t.date.getMonth() === day.getMonth() &&
        t.date.getDate() === day.getDate()
      );

      dayTransactions.forEach(t => {
        balance += t.type === 'income' ? t.amount : -t.amount;
      });

      return balance;
    });

    return of({
      labels: days.map(d => d.toLocaleDateString()),
      datasets: [{
        label: 'Balance',
        data: balances,
        borderColor: '#4CAF50',
        borderWidth: 2
      }]
    }).pipe(delay(500));
  }
}
