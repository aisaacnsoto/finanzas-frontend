import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FinanceService } from '../dashboard/services/finance.service';
import { Budget, Category } from '../../shared/interfaces/finance.interface';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css']
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  categories: Category[] = [];
  budgetForm: FormGroup;
  showAddForm = false;
  editingBudget: Budget | null = null;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  availableYears: number[] = [];

  constructor(
    private financeService: FinanceService,
    private fb: FormBuilder
  ) {
    this.budgetForm = this.createBudgetForm();
    this.initializeYears();
  }

  ngOnInit() {
    this.loadCategories();
    this.loadBudgets();
  }

  private createBudgetForm(): FormGroup {
    return this.fb.group({
      categoryId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      month: [this.selectedMonth],
      year: [this.selectedYear]
    });
  }

  private initializeYears() {
    const currentYear = new Date().getFullYear();
    this.availableYears = [currentYear - 1, currentYear, currentYear + 1];
  }

  loadCategories() {
    this.financeService.getCategories().subscribe(categories => {
      this.categories = categories.filter(cat => cat.type === 'expense');
    });
  }

  loadBudgets() {
    this.financeService.getBudgets(this.selectedMonth, this.selectedYear).subscribe(budgets => {
      this.budgets = budgets;
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Categoría Desconocida';
  }

  editBudget(budget: Budget) {
    this.editingBudget = budget;
    this.budgetForm.patchValue({
      categoryId: budget.categoryId,
      amount: budget.amount,
      month: budget.month,
      year: budget.year
    });
    this.showAddForm = true;
  }

  deleteBudget(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) {
      this.financeService.deleteBudget(id).subscribe(() => {
        this.budgets = this.budgets.filter(b => b.id !== id);
      });
    }
  }

  saveBudget() {
    if (this.budgetForm.valid) {
      const budgetData = {
        ...this.budgetForm.value,
        month: this.selectedMonth,
        year: this.selectedYear
      };

      if (this.editingBudget) {
        this.financeService.updateBudget(this.editingBudget.id, budgetData).subscribe(updatedBudget => {
          const index = this.budgets.findIndex(b => b.id === this.editingBudget!.id);
          if (index !== -1) {
            this.budgets[index] = updatedBudget;
          }
          this.cancelEdit();
        });
      } else {
        this.financeService.addBudget(budgetData).subscribe(newBudget => {
          this.budgets.push(newBudget);
          this.cancelEdit();
        });
      }
    }
  }

  cancelEdit() {
    this.showAddForm = false;
    this.editingBudget = null;
    this.budgetForm.reset({
      month: this.selectedMonth,
      year: this.selectedYear
    });
  }
}
