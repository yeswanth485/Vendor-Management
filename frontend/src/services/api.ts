import { 
  VendorApplication, 
  Vendor, 
  BankChangeRequest, 
  FollowUpItem, 
  AuditEvent, 
  CountryConfiguration,
  User,
  Organization,
  UserRole,
  RuleStatus,
  VendorInvoice,
  VendorScorecard,
  VendorContract,
  SlaBreach,
  CorrectiveActionPlan
} from '../types';
import { AppStorage } from '../lib/storage';

export const API_BASE = (import.meta as any).env?.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/api' : 'http://localhost:3001/api');

class ApiClient {
  private storage = AppStorage.getInstance();

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API] Fallback to local storage for ${endpoint}:`, err);
      throw err;
    }
  }

  // Applications
  public async getApplications(): Promise<VendorApplication[]> {
    try {
      return await this.request<VendorApplication[]>('/applications');
    } catch {
      return this.storage.getApplications();
    }
  }

  public async getApplication(id: string): Promise<VendorApplication | undefined> {
    try {
      return await this.request<VendorApplication>(`/applications/${id}`);
    } catch {
      return this.storage.getApplicationById(id);
    }
  }

  public async submitApplication(data: any): Promise<VendorApplication> {
    try {
      return await this.request<VendorApplication>('/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return this.storage.submitNewApplication(data);
    }
  }

  public async approveApplication(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.request<{ success: boolean; error?: string }>(`/applications/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
    } catch {
      return this.storage.approveApplication(id, reason);
    }
  }

  public async rejectApplication(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.request<{ success: boolean; error?: string }>(`/applications/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
    } catch {
      return this.storage.rejectApplication(id, reason);
    }
  }

  public async claimApplication(id: string): Promise<void> {
    try {
      await this.request(`/applications/${id}/claim`, { method: 'PUT' });
    } catch {
      this.storage.claimApplication(id);
    }
  }

  public async releaseApplication(id: string): Promise<void> {
    try {
      await this.request(`/applications/${id}/release`, { method: 'PUT' });
    } catch {
      this.storage.releaseApplication(id);
    }
  }

  public async revalidateApplication(id: string): Promise<VendorApplication | null> {
    try {
      return await this.request<VendorApplication>(`/applications/${id}/revalidate`, { method: 'PUT' });
    } catch {
      return this.storage.revalidateApplication(id);
    }
  }

  public async applyOverride(id: string, ruleId: string, newStatus: RuleStatus, justification: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.request<{ success: boolean; error?: string }>(`/applications/${id}/override`, {
        method: 'PUT',
        body: JSON.stringify({ ruleId, newStatus, justification }),
      });
    } catch {
      return this.storage.applyManualOverride({ applicationId: id, ruleId, newStatus, justification });
    }
  }

  public async resolveDiscrepancy(id: string, discrepancyType: string, resolutionNotes: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.request<{ success: boolean; error?: string }>(`/applications/${id}/resolve-discrepancy`, {
        method: 'PUT',
        body: JSON.stringify({ discrepancyType, resolutionNotes }),
      });
    } catch {
      return this.storage.resolveDiscrepancy({ applicationId: id, discrepancyType, resolutionNotes });
    }
  }

  public async requestMoreInfo(id: string, data: { recipientEmail: string; subject: string; body: string; missingItems: string[] }): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.request<{ success: boolean; error?: string }>(`/applications/${id}/request-info`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return this.storage.requestMoreInformation({ applicationId: id, ...data });
    }
  }

  public async replaceDocument(id: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.request<{ success: boolean; error?: string }>(`/applications/${id}/replace-document`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return this.storage.replaceDocument({ applicationId: id, ...data });
    }
  }

  // Vendors
  public async getVendors(): Promise<Vendor[]> {
    try {
      return await this.request<Vendor[]>('/vendors');
    } catch {
      return this.storage.getVendors();
    }
  }

  // Invoices & AP
  public async getInvoices(): Promise<VendorInvoice[]> {
    try {
      return await this.request<VendorInvoice[]>('/invoices');
    } catch {
      return this.storage.getInvoices();
    }
  }

  public async createInvoice(data: Partial<VendorInvoice>): Promise<VendorInvoice> {
    try {
      return await this.request<VendorInvoice>('/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return this.storage.createInvoice(data);
    }
  }

  public async approveInvoice(id: string, notes?: string): Promise<{ success: boolean; message?: string }> {
    try {
      return await this.request<{ success: boolean; message?: string }>(`/invoices/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      });
    } catch {
      return this.storage.approveInvoiceForPayment(id, notes);
    }
  }

  public async resolveInvoiceVariance(id: string, resolution: 'ACCEPT_PRICE_OVERRIDE' | 'REQUEST_CREDIT_MEMO', notes: string): Promise<{ success: boolean; message?: string }> {
    try {
      return await this.request<{ success: boolean; message?: string }>(`/invoices/${id}/resolve-variance`, {
        method: 'PUT',
        body: JSON.stringify({ resolution, notes }),
      });
    } catch {
      return this.storage.resolveInvoiceVariance(id, resolution, notes);
    }
  }

  public async disbursePayments(invoiceIds: string[], stepUpVerified: boolean): Promise<{ success: boolean; count: number; totalAmount: number; message: string }> {
    try {
      return await this.request<{ success: boolean; count: number; totalAmount: number; message: string }>('/invoices/disburse', {
        method: 'POST',
        body: JSON.stringify({ invoiceIds, stepUpVerified }),
      });
    } catch {
      return this.storage.disbursePaymentBatch(invoiceIds, stepUpVerified);
    }
  }

  // Contracts
  public async getContracts(): Promise<VendorContract[]> {
    try {
      return await this.request<VendorContract[]>('/contracts');
    } catch {
      return this.storage.getContracts();
    }
  }

  public async createContract(data: Partial<VendorContract>): Promise<VendorContract> {
    try {
      return await this.request<VendorContract>('/contracts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return this.storage.createContract(data);
    }
  }

  public async renewContract(id: string, additionalMonths = 12): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request<{ success: boolean; message: string }>(`/contracts/${id}/renew`, {
        method: 'PUT',
        body: JSON.stringify({ additionalMonths }),
      });
    } catch {
      return this.storage.renewContract(id, additionalMonths);
    }
  }

  // SLAs
  public async getSlaBreaches(): Promise<SlaBreach[]> {
    try {
      return await this.request<SlaBreach[]>('/sla-breaches');
    } catch {
      return this.storage.getSlaBreaches();
    }
  }

  public async claimServiceCredit(id: string): Promise<{ success: boolean; creditAmount: number; creditMemoId: string; message: string }> {
    try {
      return await this.request<{ success: boolean; creditAmount: number; creditMemoId: string; message: string }>(`/sla-breaches/${id}/claim-credit`, {
        method: 'PUT',
      });
    } catch {
      return this.storage.claimServiceCredit(id);
    }
  }

  // CIM Plans
  public async getCimPlans(): Promise<CorrectiveActionPlan[]> {
    try {
      return await this.request<CorrectiveActionPlan[]>('/cim-plans');
    } catch {
      return this.storage.getCimPlans();
    }
  }

  public async createCimPlan(data: Partial<CorrectiveActionPlan>): Promise<CorrectiveActionPlan> {
    try {
      return await this.request<CorrectiveActionPlan>('/cim-plans', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return this.storage.createCimPlan(data);
    }
  }

  public async resolveCimPlan(id: string, resolutionSummary: string): Promise<{ success: boolean }> {
    try {
      return await this.request<{ success: boolean }>(`/cim-plans/${id}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ resolutionSummary }),
      });
    } catch {
      return this.storage.resolveCimPlan(id, resolutionSummary);
    }
  }

  // Bank Changes
  public async getBankChanges(): Promise<BankChangeRequest[]> {
    try {
      return await this.request<BankChangeRequest[]>('/bank-changes');
    } catch {
      return this.storage.getBankChangeRequests();
    }
  }

  public async verifyBankChange(id: string, action: 'APPROVE' | 'REJECT', notes: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.request<{ success: boolean; error?: string }>(`/bank-changes/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ action, notes }),
      });
    } catch {
      return this.storage.verifyBankChangeRequest({ requestId: id, action, notes });
    }
  }

  // Follow-ups & Audits
  public async getFollowUps(): Promise<FollowUpItem[]> {
    try {
      return await this.request<FollowUpItem[]>('/follow-ups');
    } catch {
      return this.storage.getFollowUps();
    }
  }

  public async getAuditEvents(): Promise<AuditEvent[]> {
    try {
      return await this.request<AuditEvent[]>('/audit-events');
    } catch {
      return this.storage.getAuditEvents();
    }
  }

  // Scorecards
  public async getScorecards(): Promise<Record<string, VendorScorecard>> {
    try {
      return await this.request<Record<string, VendorScorecard>>('/scorecards');
    } catch {
      return this.storage.getScorecards();
    }
  }

  public async getVendorScorecard(vendorId: string): Promise<VendorScorecard | undefined> {
    try {
      return await this.request<VendorScorecard>(`/scorecards/${vendorId}`);
    } catch {
      return this.storage.getVendorScorecard(vendorId);
    }
  }

  // Country Configs
  public async getCountryConfigs(): Promise<Record<string, CountryConfiguration>> {
    try {
      return await this.request<Record<string, CountryConfiguration>>('/config/countries');
    } catch {
      return this.storage.getCountryConfigs();
    }
  }

  // Context
  public async getCurrentOrg(): Promise<Organization> {
    try {
      return await this.request<Organization>('/context/org');
    } catch {
      return this.storage.getCurrentOrg();
    }
  }

  public async setCurrentOrg(orgId: string): Promise<Organization> {
    try {
      return await this.request<Organization>('/context/org', {
        method: 'PUT',
        body: JSON.stringify({ orgId }),
      });
    } catch {
      this.storage.setCurrentOrg(orgId);
      return this.storage.getCurrentOrg();
    }
  }

  public async getCurrentUser(): Promise<User> {
    try {
      return await this.request<User>('/context/user');
    } catch {
      return this.storage.getCurrentUser();
    }
  }

  public async setUserRole(role: UserRole): Promise<User> {
    try {
      return await this.request<User>('/context/user/role', {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    } catch {
      this.storage.setCurrentUserRole(role);
      return this.storage.getCurrentUser();
    }
  }
}

export const api = new ApiClient();
