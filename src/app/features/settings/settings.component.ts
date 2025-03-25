import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FinanceService } from '../dashboard/services/finance.service';
import { Account } from '../../shared/interfaces/finance.interface';

interface SystemSettings {
  notifications: {
    budgetAlerts: boolean;
    monthlyReport: boolean;
    lowBalanceAlert: boolean;
    upcomingBills: boolean;
    unusualSpending: boolean;
  };
  defaultAccount: number;
  display: {
    darkMode: boolean;
    compactView: boolean;
    showCents: boolean;
    currency: string;
  };
  automation: {
    autoCategorizeBills: boolean;
    autoSaveRules: boolean;
    recurringTransactions: boolean;
  };
  security: {
    requirePinForTransactions: boolean;
    sessionTimeout: number;
    twoFactorAuth: boolean;
  };
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  accounts: Account[] = [];
  isLoading = false;
  notification: { type: 'success' | 'error', message: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService
  ) {
    this.settingsForm = this.createSettingsForm();
  }

  ngOnInit() {
    this.loadAccounts();
    this.loadCurrentSettings();
  }

  private createSettingsForm(): FormGroup {
    return this.fb.group({
      // Notificaciones
      budgetAlerts: [true],
      monthlyReport: [true],
      lowBalanceAlert: [true],
      upcomingBills: [true],
      unusualSpending: [false],

      // Cuenta Predeterminada
      defaultAccount: [''],

      // Visualización
      darkMode: [false],
      compactView: [false],
      showCents: [true],
      currency: ['USD'],

      // Automatización
      autoCategorizeBills: [true],
      autoSaveRules: [false],
      recurringTransactions: [true],

      // Seguridad
      requirePinForTransactions: [false],
      sessionTimeout: ['30'],
      twoFactorAuth: [false]
    });
  }

  private loadAccounts() {
    this.financeService.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
      if (accounts.length > 0 && !this.settingsForm.get('defaultAccount')?.value) {
        this.settingsForm.patchValue({ defaultAccount: accounts[0].id });
      }
    });
  }

  private loadCurrentSettings() {
    // Simulamos cargar configuraciones guardadas
    const savedSettings: SystemSettings = {
      notifications: {
        budgetAlerts: true,
        monthlyReport: true,
        lowBalanceAlert: true,
        upcomingBills: true,
        unusualSpending: false
      },
      defaultAccount: 1,
      display: {
        darkMode: false,
        compactView: false,
        showCents: true,
        currency: 'USD'
      },
      automation: {
        autoCategorizeBills: true,
        autoSaveRules: false,
        recurringTransactions: true
      },
      security: {
        requirePinForTransactions: false,
        sessionTimeout: 30,
        twoFactorAuth: false
      }
    };

    this.settingsForm.patchValue({
      budgetAlerts: savedSettings.notifications.budgetAlerts,
      monthlyReport: savedSettings.notifications.monthlyReport,
      lowBalanceAlert: savedSettings.notifications.lowBalanceAlert,
      upcomingBills: savedSettings.notifications.upcomingBills,
      unusualSpending: savedSettings.notifications.unusualSpending,
      defaultAccount: savedSettings.defaultAccount,
      darkMode: savedSettings.display.darkMode,
      compactView: savedSettings.display.compactView,
      showCents: savedSettings.display.showCents,
      currency: savedSettings.display.currency,
      autoCategorizeBills: savedSettings.automation.autoCategorizeBills,
      autoSaveRules: savedSettings.automation.autoSaveRules,
      recurringTransactions: savedSettings.automation.recurringTransactions,
      requirePinForTransactions: savedSettings.security.requirePinForTransactions,
      sessionTimeout: savedSettings.security.sessionTimeout.toString(),
      twoFactorAuth: savedSettings.security.twoFactorAuth
    });
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      this.isLoading = true;

      // Simulamos guardar en el servidor
      setTimeout(() => {
        this.isLoading = false;
        this.notification = {
          type: 'success',
          message: 'Configuración guardada exitosamente'
        };

        setTimeout(() => {
          this.notification = null;
        }, 3000);
      }, 1500);
    }
  }

  resetToDefaults() {
    if (confirm('¿Estás seguro de que deseas restaurar la configuración predeterminada? Esta acción no se puede deshacer.')) {
      this.loadCurrentSettings();
      this.notification = {
        type: 'success',
        message: 'Configuración restaurada a valores predeterminados'
      };

      setTimeout(() => {
        this.notification = null;
      }, 3000);
    }
  }
}
