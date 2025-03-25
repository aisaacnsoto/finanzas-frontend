import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { FinanceService } from '../dashboard/services/finance.service';
import { Transaction, Category, Account, DateRange } from '../../shared/interfaces/finance.interface';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  // Referencias a los canvas de los gráficos
  cashFlowChart!: Chart;
  expensesChart!: Chart;
  trendChart!: Chart;

  // Datos de filtros
  selectedRange = 'month';
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  endDate = new Date().toISOString().split('T')[0];

  // Datos de resumen
  totalIncome = 0;
  totalExpenses = 0;
  totalSavings = 0;
  incomeTrend = 5.2;
  expenseTrend = -2.8;
  savingsTrend = 12.5;
  expenseRatio = 75;

  // Datos de análisis
  categoryAnalysis: any[] = [];
  topExpenses: Transaction[] = [];
  Math = Math; // Para usar Math en el template

  constructor(private financeService: FinanceService) {}

  ngOnInit() {
    this.loadReports();
  }

  ngAfterViewInit() {
    this.initializeCharts();
  }

  updateDateRange() {
    const today = new Date();
    switch (this.selectedRange) {
      case 'month':
        this.startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'quarter':
        this.startDate = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1).toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'year':
        this.startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
    }
    if (this.selectedRange !== 'custom') {
      this.loadReports();
    }
  }

  loadReports() {
    const dateRange: DateRange = {
      start: new Date(this.startDate),
      end: new Date(this.endDate)
    };

    // Cargar transacciones
    this.financeService.getTransactions(dateRange).subscribe(transactions => {
      this.processTransactions(transactions);
      this.updateCharts();
    });

    // Cargar análisis por categoría
    this.financeService.getCategories().subscribe(categories => {
      this.processCategoryAnalysis(categories);
    });
  }

  private processTransactions(transactions: Transaction[]) {
    this.totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalSavings = this.totalIncome - this.totalExpenses;
    this.expenseRatio = Math.round((this.totalExpenses / this.totalIncome) * 100);

    // Top gastos
    this.topExpenses = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  private processCategoryAnalysis(categories: Category[]) {
    this.categoryAnalysis = categories.map(category => ({
      name: category.name,
      color: category.color,
      amount: Math.random() * 1000, // Simulado
      percentage: Math.round(Math.random() * 100), // Simulado
      budgetPercentage: Math.round(Math.random() * 120), // Simulado
      trend: Math.round((Math.random() * 40) - 20) // Simulado
    }));
  }

  private initializeCharts() {
    // Flujo de Efectivo
    this.cashFlowChart = new Chart('cashFlowChart', {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Ingresos',
            data: [1200, 1900, 1500, 1800, 2200, 1800],
            borderColor: '#27ae60',
            tension: 0.4
          },
          {
            label: 'Gastos',
            data: [900, 1200, 1100, 1400, 1600, 1300],
            borderColor: '#e74c3c',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // Gastos por Categoría
    this.expensesChart = new Chart('expensesChart', {
      type: 'doughnut',
      data: {
        labels: ['Comida', 'Transporte', 'Servicios', 'Entretenimiento', 'Otros'],
        datasets: [{
          data: [300, 150, 200, 100, 250],
          backgroundColor: ['#27ae60', '#2980b9', '#f1c40f', '#e67e22', '#95a5a6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // Tendencias
    this.trendChart = new Chart('trendChart', {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Ahorro Mensual',
          data: [300, 700, 400, 400, 600, 500],
          backgroundColor: '#3498db'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private updateCharts() {
    // Actualizar datos de los gráficos
    this.cashFlowChart?.update();
    this.expensesChart?.update();
    this.trendChart?.update();
  }

  getCategoryName(id: number): string {
    const category = this.categoryAnalysis.find(c => c.id === id);
    return category ? category.name : 'Sin categoría';
  }

  exportReport() {
    // Simulamos la exportación
    alert('Reporte exportado exitosamente');
  }
}
