import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FinanceService } from '../dashboard/services/finance.service';
import { Category } from '../../shared/interfaces/finance.interface';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  categoryForm: FormGroup;
  showAddForm = false;
  editingCategory: Category | null = null;
  selectedType = 'all';

  constructor(
    private financeService: FinanceService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.createCategoryForm();
  }

  ngOnInit() {
    this.loadCategories();
  }

  private createCategoryForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['expense', Validators.required],
      color: ['#3498db', Validators.required],
      icon: ['']
    });
  }

  loadCategories() {
    this.financeService.getCategories().subscribe(categories => {
      this.categories = categories;
      this.filterCategories();
    });
  }

  filterCategories() {
    this.filteredCategories = this.selectedType === 'all'
      ? this.categories
      : this.categories.filter(c => c.type === this.selectedType);
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    });
    this.showAddForm = true;
  }

  deleteCategory(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.')) {
      this.financeService.deleteCategory(id).subscribe(() => {
        this.categories = this.categories.filter(c => c.id !== id);
        this.filterCategories();
      });
    }
  }

  saveCategory() {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;

      if (this.editingCategory) {
        this.financeService.updateCategory(this.editingCategory.id, categoryData).subscribe(updatedCategory => {
          const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
          if (index !== -1) {
            this.categories[index] = updatedCategory;
          }
          this.filterCategories();
          this.cancelEdit();
        });
      } else {
        this.financeService.addCategory(categoryData).subscribe(newCategory => {
          this.categories.push(newCategory);
          this.filterCategories();
          this.cancelEdit();
        });
      }
    }
  }

  cancelEdit() {
    this.showAddForm = false;
    this.editingCategory = null;
    this.categoryForm.reset({
      type: 'expense',
      color: '#3498db'
    });
  }
}
