import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FinanceService } from '../dashboard/services/finance.service';
import { Transaction, Category, Account, DateRange } from '../../shared/interfaces/finance.interface';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories: Category[] = [];
  accounts: Account[] = [];
  transactionForm: FormGroup;
  showAddForm = false;
  editingTransaction: Transaction | null = null;

  filters = {
    type: 'all',
    categoryId: '',
    accountId: '',
    startDate: this.getDefaultStartDate(),
    endDate: this.getDefaultEndDate()
  };

  constructor(
    private financeService: FinanceService,
    private fb: FormBuilder
  ) {
    this.transactionForm = this.createTransactionForm();
  }

  ngOnInit() {
    this.loadData();
  }

  private createTransactionForm(): FormGroup {
    return this.fb.group({
      type: ['expense', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      categoryId: ['', Validators.required],
      accountId: ['', Validators.required]
    });
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadData() {
    this.financeService.getCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.financeService.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
    });

    this.loadTransactions();
  }

  loadTransactions() {
    const dateRange: DateRange = {
      start: new Date(this.filters.startDate),
      end: new Date(this.filters.endDate)
    };

    this.financeService.getTransactions(dateRange).subscribe(transactions => {
      this.transactions = transactions;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredTransactions = this.transactions.filter(transaction => {
      const matchesType = this.filters.type === 'all' || transaction.type === this.filters.type;
      const matchesCategory = !this.filters.categoryId || transaction.categoryId === +this.filters.categoryId;
      const matchesAccount = !this.filters.accountId || transaction.accountId === +this.filters.accountId;

      return matchesType && matchesCategory && matchesAccount;
    });
  }

  getTotalByType(type: 'income' | 'expense'): number {
    return this.filteredTransactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getBalance(): number {
    return this.getTotalByType('income') - this.getTotalByType('expense');
  }

  getCategoryName(id: number): string {
    const category = this.categories.find(c => c.id === id);
    return category ? category.name : 'Desconocida';
  }

  getCategoryColor(id: number): string {
    const category = this.categories.find(c => c.id === id);
    return category?.color || '#999999';
  }

  getAccountName(id: number): string {
    const account = this.accounts.find(a => a.id === id);
    return account ? account.name : 'Desconocida';
  }

  getFilteredCategories(): Category[] {
    const type = this.transactionForm.get('type')?.value;
    return this.categories.filter(c => c.type === type);
  }

  editTransaction(transaction: Transaction) {
    this.editingTransaction = transaction;
    this.transactionForm.patchValue({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount,
      date: new Date(transaction.date).toISOString().split('T')[0],
      categoryId: transaction.categoryId,
      accountId: transaction.accountId
    });
    this.showAddForm = true;
  }

  deleteTransaction(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.')) {
      this.financeService.deleteTransaction(id).subscribe(() => {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.applyFilters();
      });
    }
  }

  saveTransaction() {
    if (this.transactionForm.valid) {
      const transactionData = {
        ...this.transactionForm.value,
        date: new Date(this.transactionForm.value.date)
      };

      if (this.editingTransaction) {
        this.financeService.updateTransaction(this.editingTransaction.id, transactionData).subscribe(updatedTransaction => {
          const index = this.transactions.findIndex(t => t.id === this.editingTransaction!.id);
          if (index !== -1) {
            this.transactions[index] = updatedTransaction;
          }
          this.applyFilters();
          this.cancelEdit();
        });
      } else {
        this.financeService.addTransaction(transactionData).subscribe(newTransaction => {
          this.transactions.push(newTransaction);
          this.applyFilters();
          this.cancelEdit();
        });
      }
    }
  }

  cancelEdit() {
    this.showAddForm = false;
    this.editingTransaction = null;
    this.transactionForm.reset({
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  }
}
