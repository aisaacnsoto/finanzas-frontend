import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration } from 'chart.js';
import { FinanceService } from './services/finance.service';
import {
  Category,
  Account,
  Transaction,
  Budget,
  DateRange
} from '../../shared/interfaces/finance.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('balanceChart') balanceChartRef!: ElementRef;
  @ViewChild('expensesChart') expensesChartRef!: ElementRef;
  @ViewChild('incomeChart') incomeChartRef!: ElementRef;
  @ViewChild('budgetChart') budgetChartRef!: ElementRef;

  // Charts
  balanceChart?: Chart;
  expensesChart?: Chart;
  incomeChart?: Chart;
  budgetChart?: Chart;

  // Date range
  selectedRange = 'month';
  customStartDate = '';
  customEndDate = '';
  currentDateRange: DateRange = {
    start: new Date(),
    end: new Date()
  };

  // Data
  categories: Category[] = [];
  accounts: Account[] = [];
  hasBudget = false;

  // Forms visibility
  showQuickTransactionForm = false;
  showQuickAccountForm = false;
  showQuickCategoryForm = false;
  showBudgetForm = false;

  // Forms
  transactionForm!: FormGroup;
  accountForm!: FormGroup;
  categoryForm!: FormGroup;
  budgetForm!: FormGroup;

  constructor(
    private financeService: FinanceService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadData();
    this.updateDateRange();
  }

  get expenseCategories() {
    return this.categories.filter(c => c.type === 'expense');
  }

  private initializeForms() {
    this.transactionForm = this.fb.group({
      type: ['expense', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      accountId: ['', Validators.required],
      description: ['', Validators.required],
      date: [new Date(), Validators.required]
    });

    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      type: ['savings', Validators.required]
    });

    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      type: ['expense', Validators.required],
      color: ['#000000', Validators.required]
    });

    this.budgetForm = this.fb.group({
      categoryId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]]
    });
  }

  private loadData() {
    this.financeService.getCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.financeService.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
    });

    const currentDate = new Date();
    this.financeService.getBudgets(currentDate.getMonth() + 1, currentDate.getFullYear())
      .subscribe(budgets => {
        this.hasBudget = budgets.length > 0;
      });
  }

  updateDateRange() {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (this.selectedRange) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(now.getDate() - now.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(start.getMonth() + 1, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          start = new Date(this.customStartDate);
          end = new Date(this.customEndDate);
        }
        break;
    }

    this.currentDateRange = { start, end };
    this.updateCharts();
  }

  private updateCharts() {
    // Balance over time
    this.financeService.getBalanceOverTime(this.currentDateRange).subscribe(data => {
      this.updateChart(this.balanceChart, this.balanceChartRef, {
        type: 'line',
        data: data,
        options: {
          responsive: true
        }
      });
    });

    // Expenses by category
    this.financeService.getExpensesByCategory(this.currentDateRange).subscribe(data => {
      this.updateChart(this.expensesChart, this.expensesChartRef, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true
        }
      });
    });

    // Income by category
    this.financeService.getIncomesByCategory(this.currentDateRange).subscribe(data => {
      this.updateChart(this.incomeChart, this.incomeChartRef, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true
        }
      });
    });

    // Budget vs Actual
    const currentDate = new Date();
    this.financeService.getBudgetVsExpenses(
      currentDate.getMonth() + 1,
      currentDate.getFullYear()
    ).subscribe(data => {
      this.updateChart(this.budgetChart, this.budgetChartRef, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  }

  private updateChart(chart: Chart | undefined, elementRef: ElementRef, config: ChartConfiguration) {
    if (chart) {
      chart.destroy();
    }
    //chart = new Chart(elementRef.nativeElement, config);
  }

  submitTransaction() {
    if (this.transactionForm.valid) {
      this.financeService.addTransaction(this.transactionForm.value)
        .subscribe(() => {
          this.showQuickTransactionForm = false;
          this.transactionForm.reset({
            type: 'expense',
            date: new Date()
          });
          this.updateCharts();
        });
    }
  }

  submitAccount() {
    if (this.accountForm.valid) {
      this.financeService.addAccount(this.accountForm.value)
        .subscribe(account => {
          this.accounts.push(account);
          this.showQuickAccountForm = false;
          this.accountForm.reset({
            type: 'savings'
          });
        });
    }
  }

  submitCategory() {
    if (this.categoryForm.valid) {
      this.financeService.addCategory(this.categoryForm.value)
        .subscribe(category => {
          this.categories.push(category);
          this.showQuickCategoryForm = false;
          this.categoryForm.reset({
            type: 'expense'
          });
        });
    }
  }

  submitBudget() {
    if (this.budgetForm.valid) {
      const currentDate = new Date();
      const budget = {
        ...this.budgetForm.value,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      };

      this.financeService.addBudget(budget)
        .subscribe(() => {
          this.showBudgetForm = false;
          this.budgetForm.reset();
          this.hasBudget = true;
          this.updateCharts();
        });
    }
  }

  logout() {
    // Here you would typically clear any stored tokens/session data
    this.router.navigate(['/auth/login']);
  }
}
