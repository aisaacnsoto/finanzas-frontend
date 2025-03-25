import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FinanceService } from '../dashboard/services/finance.service';
import { Account } from '../../shared/interfaces/finance.interface';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  accountForm: FormGroup;
  showAddForm = false;
  editingAccount: Account | null = null;
  selectedType = 'all';

  constructor(
    private financeService: FinanceService,
    private fb: FormBuilder
  ) {
    this.accountForm = this.createAccountForm();
  }

  ngOnInit() {
    this.loadAccounts();
  }

  private createAccountForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['savings', Validators.required],
      balance: [0, [Validators.required]],
      color: ['#3498db']
    });
  }

  loadAccounts() {
    this.financeService.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
      this.filterAccounts();
    });
  }

  filterAccounts() {
    this.filteredAccounts = this.selectedType === 'all'
      ? this.accounts
      : this.accounts.filter(a => a.type === this.selectedType);
  }

  getTotalBalance(): number {
    return this.accounts.reduce((total, account) => total + account.balance, 0);
  }

  getBalanceByType(type: string): number {
    return this.accounts
      .filter(account => account.type === type)
      .reduce((total, account) => total + account.balance, 0);
  }

  getAccountTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      savings: 'Ahorros',
      checking: 'Corriente',
      credit: 'Crédito',
      cash: 'Efectivo'
    };
    return types[type] || type;
  }

  editAccount(account: Account) {
    this.editingAccount = account;
    this.accountForm.patchValue({
      name: account.name,
      type: account.type,
      balance: account.balance,
      color: account.color
    });
    this.showAddForm = true;
  }

  deleteAccount(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.')) {
      this.financeService.deleteAccount(id).subscribe(() => {
        this.accounts = this.accounts.filter(a => a.id !== id);
        this.filterAccounts();
      });
    }
  }

  saveAccount() {
    if (this.accountForm.valid) {
      const accountData = this.accountForm.value;

      if (this.editingAccount) {
        this.financeService.updateAccount(this.editingAccount.id, accountData).subscribe(updatedAccount => {
          const index = this.accounts.findIndex(a => a.id === this.editingAccount!.id);
          if (index !== -1) {
            this.accounts[index] = updatedAccount;
          }
          this.filterAccounts();
          this.cancelEdit();
        });
      } else {
        this.financeService.addAccount(accountData).subscribe(newAccount => {
          this.accounts.push(newAccount);
          this.filterAccounts();
          this.cancelEdit();
        });
      }
    }
  }

  cancelEdit() {
    this.showAddForm = false;
    this.editingAccount = null;
    this.accountForm.reset({
      type: 'savings',
      balance: 0,
      color: '#3498db'
    });
  }
}
