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
import { 
  SEED_ORGANIZATIONS, 
  SEED_USERS, 
  getEvaluatedSeedApplications, 
  getSeedVendors, 
  SEED_BANK_CHANGE_REQUESTS, 
  SEED_FOLLOW_UPS, 
  SEED_AUDIT_EVENTS,
  SEED_INVOICES,
  SEED_SCORECARDS,
  SEED_CONTRACTS,
  SEED_SLA_BREACHES,
  SEED_CIM_PLANS
} from '../data/seedData';
import { evaluateApplication, DEFAULT_COUNTRY_CONFIGS } from './rulesEngine';

const STORAGE_KEYS = {
  APPLICATIONS: 'vendoriq_apps_v2',
  VENDORS: 'vendoriq_vendors_v2',
  BANK_CHANGES: 'vendoriq_bank_changes_v2',
  FOLLOW_UPS: 'vendoriq_followups_v2',
  AUDIT_EVENTS: 'vendoriq_audit_v2',
  COUNTRY_CONFIGS: 'vendoriq_configs_v2',
  CURRENT_ORG: 'vendoriq_current_org_v2',
  CURRENT_USER: 'vendoriq_current_user_v2',
  INVOICES: 'vendoriq_invoices_v2',
  SCORECARDS: 'vendoriq_scorecards_v2',
  CONTRACTS: 'vendoriq_contracts_v2',
  SLA_BREACHES: 'vendoriq_sla_breaches_v2',
  CIM_PLANS: 'vendoriq_cim_plans_v2',
};

// Safe localStorage access
function getStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading key ${key} from storage:`, e);
    return fallback;
  }
}

function setStoredJson<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing key ${key} to storage:`, e);
  }
}

export class AppStorage {
  private static instance: AppStorage;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): AppStorage {
    if (!AppStorage.instance) {
      AppStorage.instance = new AppStorage();
    }
    return AppStorage.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(cb => cb());
  }

  public ensureInitialized(forceReset = false): void {
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
      const initialApps = getEvaluatedSeedApplications();
      const initialVendors = getSeedVendors(initialApps);

      setStoredJson(STORAGE_KEYS.APPLICATIONS, initialApps);
      setStoredJson(STORAGE_KEYS.VENDORS, initialVendors);
      setStoredJson(STORAGE_KEYS.BANK_CHANGES, SEED_BANK_CHANGE_REQUESTS);
      setStoredJson(STORAGE_KEYS.FOLLOW_UPS, SEED_FOLLOW_UPS);
      setStoredJson(STORAGE_KEYS.AUDIT_EVENTS, SEED_AUDIT_EVENTS);
      setStoredJson(STORAGE_KEYS.COUNTRY_CONFIGS, DEFAULT_COUNTRY_CONFIGS);
      setStoredJson(STORAGE_KEYS.CURRENT_ORG, 'org-terybi-corp');
      setStoredJson(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]); // Sarah Chen (Reviewer)
      setStoredJson(STORAGE_KEYS.INVOICES, SEED_INVOICES);
      setStoredJson(STORAGE_KEYS.SCORECARDS, SEED_SCORECARDS);
      setStoredJson(STORAGE_KEYS.CONTRACTS, SEED_CONTRACTS);
      setStoredJson(STORAGE_KEYS.SLA_BREACHES, SEED_SLA_BREACHES);
      setStoredJson(STORAGE_KEYS.CIM_PLANS, SEED_CIM_PLANS);
      this.notify();
    } else {
      if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
        setStoredJson(STORAGE_KEYS.INVOICES, SEED_INVOICES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.SCORECARDS)) {
        setStoredJson(STORAGE_KEYS.SCORECARDS, SEED_SCORECARDS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.CONTRACTS)) {
        setStoredJson(STORAGE_KEYS.CONTRACTS, SEED_CONTRACTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.SLA_BREACHES)) {
        setStoredJson(STORAGE_KEYS.SLA_BREACHES, SEED_SLA_BREACHES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.CIM_PLANS)) {
        setStoredJson(STORAGE_KEYS.CIM_PLANS, SEED_CIM_PLANS);
      }
      this.notify();
    }
  }

  public resetToDemo(): void {
    this.ensureInitialized(true);
  }

  // --- Current Context ---
  public getCurrentOrg(): Organization {
    const orgId = getStoredJson(STORAGE_KEYS.CURRENT_ORG, 'org-terybi-corp');
    return SEED_ORGANIZATIONS.find(o => o.id === orgId) || SEED_ORGANIZATIONS[0];
  }

  public setCurrentOrg(orgId: string): void {
    setStoredJson(STORAGE_KEYS.CURRENT_ORG, orgId);
    this.notify();
  }

  public getCurrentUser(): User {
    return getStoredJson(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
  }

  public setCurrentUserRole(role: UserRole): void {
    const matching = SEED_USERS.find(u => u.role === role) || {
      id: `usr-${role}`,
      name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
      email: `${role}@terybi.com`,
      role,
      organizationId: this.getCurrentOrg().id,
      title: `${role.toUpperCase()} Authority`,
    };
    setStoredJson(STORAGE_KEYS.CURRENT_USER, matching);
    this.notify();
  }

  // --- Data Access with Tenant Isolation ---
  public getApplications(): VendorApplication[] {
    const org = this.getCurrentOrg();
    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    return all.filter(a => a.organizationId === org.id);
  }

  public getAllApplicationsCrossTenant(): VendorApplication[] {
    return getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
  }

  public getApplicationById(id: string): VendorApplication | undefined {
    return this.getApplications().find(a => a.id === id);
  }

  public getVendors(): Vendor[] {
    const org = this.getCurrentOrg();
    const all = getStoredJson<Vendor[]>(STORAGE_KEYS.VENDORS, []);
    return all.filter(v => v.organizationId === org.id);
  }

  public getBankChangeRequests(): BankChangeRequest[] {
    return getStoredJson<BankChangeRequest[]>(STORAGE_KEYS.BANK_CHANGES, []);
  }

  public getFollowUps(): FollowUpItem[] {
    return getStoredJson<FollowUpItem[]>(STORAGE_KEYS.FOLLOW_UPS, []);
  }

  public getAuditEvents(): AuditEvent[] {
    const org = this.getCurrentOrg();
    const all = getStoredJson<AuditEvent[]>(STORAGE_KEYS.AUDIT_EVENTS, []);
    return all
      .filter(e => e.organizationId === org.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getCountryConfigs(): Record<string, CountryConfiguration> {
    return getStoredJson(STORAGE_KEYS.COUNTRY_CONFIGS, DEFAULT_COUNTRY_CONFIGS);
  }

  // --- Mutations & Audit Logging ---
  public logAuditEvent(params: {
    applicationId: string;
    vendorName: string;
    action: AuditEvent['action'];
    previousValue?: string;
    newValue?: string;
    reason?: string;
    evidence?: string;
  }): void {
    const user = this.getCurrentUser();
    const org = this.getCurrentOrg();
    const newEvent: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      organizationId: org.id,
      applicationId: params.applicationId,
      vendorName: params.vendorName,
      actor: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      action: params.action,
      timestamp: new Date().toISOString(),
      previousValue: params.previousValue,
      newValue: params.newValue,
      reason: params.reason,
      evidence: params.evidence,
    };

    const allEvents = getStoredJson<AuditEvent[]>(STORAGE_KEYS.AUDIT_EVENTS, []);
    allEvents.unshift(newEvent);
    setStoredJson(STORAGE_KEYS.AUDIT_EVENTS, allEvents);
    this.notify();
  }

  public updateApplication(app: VendorApplication): void {
    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const idx = all.findIndex(a => a.id === app.id);
    if (idx !== -1) {
      all[idx] = { ...app, updatedAt: new Date().toISOString() };
      setStoredJson(STORAGE_KEYS.APPLICATIONS, all);
      this.notify();
    }
  }

  public revalidateApplication(id: string): VendorApplication | null {
    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const app = all.find(a => a.id === id);
    if (!app) return null;

    const evaluated = evaluateApplication(app, all, this.getCountryConfigs());
    const updated: VendorApplication = {
      ...app,
      validationResults: evaluated.validationResults,
      riskLevel: evaluated.riskLevel,
      riskScore: evaluated.riskScore,
      status: app.status === 'APPROVED' ? 'APPROVED' : app.status === 'REJECTED' ? 'REJECTED' : evaluated.computedStatus,
      discrepancies: evaluated.discrepancies,
      updatedAt: new Date().toISOString(),
    };

    const idx = all.findIndex(a => a.id === id);
    all[idx] = updated;
    setStoredJson(STORAGE_KEYS.APPLICATIONS, all);

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'VALIDATION_EVALUATED',
      reason: `Re-ran automated decision engine. Computed Risk: ${updated.riskLevel} (${updated.riskScore}/100), Workflow: ${updated.status}.`,
      evidence: `${updated.validationResults.filter(r => r.status === 'PASS').length} of ${updated.validationResults.length} rules passed.`,
    });

    this.notify();
    return updated;
  }

  public claimApplication(id: string): void {
    const user = this.getCurrentUser();
    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const app = all.find(a => a.id === id);
    if (!app) return;

    app.assignedReviewerId = user.id;
    app.assignedReviewerName = user.name;
    if (app.status === 'SUBMITTED') {
      app.status = 'IN_REVIEW';
    }
    app.updatedAt = new Date().toISOString();

    setStoredJson(STORAGE_KEYS.APPLICATIONS, all);
    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'REVIEWER_CLAIMED',
      previousValue: 'Unassigned',
      newValue: `${user.name} (${user.role})`,
      reason: 'Reviewer claimed task from triage queue.',
    });
    this.notify();
  }

  public releaseApplication(id: string): void {
    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const app = all.find(a => a.id === id);
    if (!app) return;

    const prevReviewer = app.assignedReviewerName;
    app.assignedReviewerId = undefined;
    app.assignedReviewerName = undefined;
    app.updatedAt = new Date().toISOString();

    setStoredJson(STORAGE_KEYS.APPLICATIONS, all);
    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'REVIEWER_RELEASED',
      previousValue: prevReviewer || 'None',
      newValue: 'Unassigned',
      reason: 'Reviewer released application back to unassigned triage pool.',
    });
    this.notify();
  }

  public approveApplication(id: string, reason: string): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    // RBAC: Only approver or administrator can approve
    if (user.role !== 'approver' && user.role !== 'administrator') {
      return { 
        success: false, 
        error: `Permission Denied: User role "${user.role}" is not authorized to grant final procurement approval. Requires Approver or Administrator.` 
      };
    }

    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const app = all.find(a => a.id === id);
    if (!app) return { success: false, error: 'Application not found' };

    const prevStatus = app.status;
    app.status = 'APPROVED';
    app.decisionReason = reason;
    app.reviewedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();
    setStoredJson(STORAGE_KEYS.APPLICATIONS, all);

    // Update vendor master
    const vendors = getStoredJson<Vendor[]>(STORAGE_KEYS.VENDORS, []);
    const vIdx = vendors.findIndex(v => v.id === app.vendorId);
    if (vIdx !== -1) {
      vendors[vIdx].status = 'ACTIVE';
      vendors[vIdx].riskLevel = app.riskLevel;
      setStoredJson(STORAGE_KEYS.VENDORS, vendors);
    }

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'APPLICATION_APPROVED',
      previousValue: prevStatus,
      newValue: 'APPROVED',
      reason: reason || 'Formal procurement approval recorded by authorized approver.',
      evidence: `Authorized by ${user.name} (${user.role}). Policy checks confirmed.`,
    });

    this.notify();
    return { success: true };
  }

  public rejectApplication(id: string, mandatoryReason: string): { success: boolean; error?: string } {
    if (!mandatoryReason?.trim()) {
      return { success: false, error: 'Rejection requires a documented, mandatory policy reason.' };
    }

    const user = this.getCurrentUser();
    if (user.role !== 'approver' && user.role !== 'administrator') {
      return { 
        success: false, 
        error: `Permission Denied: User role "${user.role}" cannot reject applications. Requires Approver or Administrator role.` 
      };
    }

    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const app = all.find(a => a.id === id);
    if (!app) return { success: false, error: 'Application not found' };

    const prevStatus = app.status;
    app.status = 'REJECTED';
    app.decisionReason = mandatoryReason;
    app.reviewedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();
    setStoredJson(STORAGE_KEYS.APPLICATIONS, all);

    // Update vendor master to BLOCKED
    const vendors = getStoredJson<Vendor[]>(STORAGE_KEYS.VENDORS, []);
    const vIdx = vendors.findIndex(v => v.id === app.vendorId);
    if (vIdx !== -1) {
      vendors[vIdx].status = 'BLOCKED';
      setStoredJson(STORAGE_KEYS.VENDORS, vendors);
    }

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'APPLICATION_REJECTED',
      previousValue: prevStatus,
      newValue: 'REJECTED',
      reason: mandatoryReason,
      evidence: `Consequential rejection decision executed by ${user.name} (${user.role}).`,
    });

    this.notify();
    return { success: true };
  }

  public applyManualOverride(params: {
    applicationId: string;
    ruleId: string;
    newStatus: RuleStatus;
    justification: string;
  }): { success: boolean; error?: string } {
    if (!params.justification?.trim()) {
      return { success: false, error: 'Manual overrides require a mandatory documented justification.' };
    }

    const user = this.getCurrentUser();
    if (user.role === 'auditor' || user.role === 'vendor') {
      return { success: false, error: 'Unauthorized: Auditors and Vendors cannot apply manual overrides.' };
    }

    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const app = all.find(a => a.id === params.applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    const rule = app.validationResults.find(r => r.ruleId === params.ruleId);
    if (!rule) return { success: false, error: 'Rule not found' };

    const oldStatus = rule.status;
    rule.override = {
      approvedBy: `${user.name} (${user.role})`,
      approvedAt: new Date().toISOString(),
      justification: params.justification,
      originalStatus: oldStatus,
    };
    rule.status = params.newStatus;
    app.manualOverridesCount += 1;
    app.updatedAt = new Date().toISOString();

    setStoredJson(STORAGE_KEYS.APPLICATIONS, all);

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'MANUAL_OVERRIDE_APPLIED',
      previousValue: `${params.ruleId}: ${oldStatus}`,
      newValue: `${params.ruleId}: ${params.newStatus}`,
      reason: params.justification,
      evidence: `Override recorded preserving original automated finding. Authorized by ${user.name}.`,
    });

    this.notify();
    return { success: true };
  }

  public resolveDiscrepancy(params: {
    applicationId: string;
    discrepancyType: string;
    resolutionNotes: string;
  }): { success: boolean; error?: string } {
    if (!params.resolutionNotes?.trim()) {
      return { success: false, error: 'Resolving an exception requires documented notes.' };
    }

    const user = this.getCurrentUser();
    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const app = all.find(a => a.id === params.applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    const disc = app.discrepancies.find(d => d.type === params.discrepancyType);
    if (disc) {
      disc.resolved = true;
      disc.resolvedBy = `${user.name} (${user.role})`;
      disc.resolutionNotes = params.resolutionNotes;
    }

    // If it was a name mismatch, mark bank details as verified
    if (params.discrepancyType === 'NAME_MISMATCH') {
      app.banking.isVerified = true;
      app.banking.verifiedAt = new Date().toISOString();
      // Also update the RULE-006 status to PASS with override
      const rule006 = app.validationResults.find(r => r.ruleId === 'RULE-006');
      if (rule006) {
        rule006.status = 'PASS';
        rule006.override = {
          approvedBy: `${user.name} (${user.role})`,
          approvedAt: new Date().toISOString(),
          justification: params.resolutionNotes,
          originalStatus: 'NEEDS_REVIEW',
        };
      }
    }

    app.updatedAt = new Date().toISOString();
    setStoredJson(STORAGE_KEYS.APPLICATIONS, all);

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'DISCREPANCY_RESOLVED',
      reason: params.resolutionNotes,
      evidence: `Resolved exception: ${params.discrepancyType} by ${user.name}.`,
    });

    this.revalidateApplication(app.id);
    this.notify();
    return { success: true };
  }

  public requestMoreInformation(params: {
    applicationId: string;
    recipientEmail: string;
    subject: string;
    body: string;
    missingItems: string[];
  }): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const app = all.find(a => a.id === params.applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    app.status = 'AWAITING_VENDOR';
    app.updatedAt = new Date().toISOString();
    setStoredJson(STORAGE_KEYS.APPLICATIONS, all);

    const followUps = getStoredJson<FollowUpItem[]>(STORAGE_KEYS.FOLLOW_UPS, []);
    const newFollowUp: FollowUpItem = {
      id: `FLW-${Date.now().toString().slice(-4)}`,
      applicationId: app.id,
      vendorName: app.company.legalName,
      recipientEmail: params.recipientEmail,
      subject: params.subject,
      body: params.body,
      missingItems: params.missingItems,
      status: 'SENT',
      sentAt: new Date().toISOString(),
      sentBy: user.email,
      securePortalUrl: `https://procure.terybi.com/portal/${app.id}/upload`,
    };
    followUps.unshift(newFollowUp);
    setStoredJson(STORAGE_KEYS.FOLLOW_UPS, followUps);

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'INFORMATION_REQUESTED',
      previousValue: 'IN_REVIEW',
      newValue: 'AWAITING_VENDOR',
      reason: `Dispatched automated resolution request for ${params.missingItems.length} items.`,
      evidence: `Simulated Resend API delivery to ${params.recipientEmail}. Portal link generated.`,
    });

    this.notify();
    return { success: true };
  }

  public replaceDocument(params: {
    applicationId: string;
    documentCategory: VendorApplication['documents'][0]['category'];
    fileName: string;
    fileSize: number;
    fileType: string;
    expiryDate?: string;
  }): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const app = all.find(a => a.id === params.applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    const existingIdx = app.documents.findIndex(d => d.category === params.documentCategory);
    const newDoc: VendorApplication['documents'][0] = {
      id: `doc-${Date.now()}`,
      category: params.documentCategory,
      fileName: params.fileName,
      fileSize: params.fileSize,
      fileType: params.fileType,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.email,
      expiryDate: params.expiryDate,
      verified: true,
      verificationSource: 'OCR_ASSISTED',
      extractedData: {
        legalName: app.company.legalName,
        expiryDate: params.expiryDate,
      }
    };

    if (existingIdx !== -1) {
      app.documents[existingIdx] = newDoc;
    } else {
      app.documents.push(newDoc);
    }

    // Resolve any related discrepancy
    if (params.documentCategory === 'ISO_COMPLIANCE' || params.documentCategory === 'TAX_REGISTRATION') {
      const expDisc = app.discrepancies.find(d => d.type === 'EXPIRED_DOCUMENT' || d.type === 'MISSING_MANDATORY_DOC');
      if (expDisc) {
        expDisc.resolved = true;
        expDisc.resolvedBy = user.name;
        expDisc.resolutionNotes = `Replaced with valid certificate: ${params.fileName} (Exp: ${params.expiryDate || 'N/A'})`;
      }
    }

    app.status = 'IN_REVIEW';
    app.updatedAt = new Date().toISOString();
    setStoredJson(STORAGE_KEYS.APPLICATIONS, all);

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'DOCUMENT_REPLACED',
      reason: `Uploaded replacement ${params.documentCategory}: ${params.fileName}. Expiry: ${params.expiryDate || 'N/A'}`,
      evidence: `Triggered automatic re-evaluation of RULE-005.`,
    });

    this.revalidateApplication(app.id);
    this.notify();
    return { success: true };
  }

  public verifyBankChangeRequest(params: {
    requestId: string;
    action: 'APPROVE' | 'REJECT';
    notes: string;
  }): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    if (user.role !== 'approver' && user.role !== 'administrator') {
      return { success: false, error: 'Only an Approver or Administrator can approve/reject bank detail changes.' };
    }

    const requests = getStoredJson<BankChangeRequest[]>(STORAGE_KEYS.BANK_CHANGES, []);
    const req = requests.find(r => r.id === params.requestId);
    if (!req) return { success: false, error: 'Bank change request not found' };

    const allApps = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const app = allApps.find(a => a.id === req.applicationId);

    if (params.action === 'APPROVE') {
      req.status = 'APPROVED';
      req.reviewedBy = `${user.name} (${user.role})`;
      req.reviewedAt = new Date().toISOString();
      req.verificationNotes = params.notes;

      if (app) {
        const oldBankMasked = app.banking.accountNumberMasked;
        // Update banking details
        app.banking = {
          ...req.proposedDetails,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        };
        // Resolve discrepancy
        const bDisc = app.discrepancies.find(d => d.type === 'SUSPICIOUS_BANK_CHANGE');
        if (bDisc) {
          bDisc.resolved = true;
          bDisc.resolvedBy = user.name;
          bDisc.resolutionNotes = params.notes;
        }
        app.updatedAt = new Date().toISOString();
      }

      // Update vendor hold status
      const vendors = getStoredJson<Vendor[]>(STORAGE_KEYS.VENDORS, []);
      const vendor = vendors.find(v => v.id === req.vendorId);
      if (vendor) {
        vendor.hasActiveBankChangeHold = false;
        setStoredJson(STORAGE_KEYS.VENDORS, vendors);
      }

      this.logAuditEvent({
        applicationId: req.applicationId,
        vendorName: app?.company.legalName || 'Vendor',
        action: 'BANK_CHANGE_VERIFIED',
        previousValue: `${req.currentDetails.bankName} (${req.currentDetails.accountNumberMasked})`,
        newValue: `${req.proposedDetails.bankName} (${req.proposedDetails.accountNumberMasked})`,
        reason: params.notes,
        evidence: `Dual-control authorization: Verbal phone callback verified by ${user.name}.`,
      });
    } else {
      req.status = 'REJECTED';
      req.rejectionReason = params.notes;
      req.reviewedBy = `${user.name} (${user.role})`;
      req.reviewedAt = new Date().toISOString();

      const vendors = getStoredJson<Vendor[]>(STORAGE_KEYS.VENDORS, []);
      const vendor = vendors.find(v => v.id === req.vendorId);
      if (vendor) {
        vendor.hasActiveBankChangeHold = false;
        setStoredJson(STORAGE_KEYS.VENDORS, vendors);
      }

      this.logAuditEvent({
        applicationId: req.applicationId,
        vendorName: app?.company.legalName || 'Vendor',
        action: 'BANK_CHANGE_REJECTED',
        reason: params.notes,
        evidence: `Security rejection: Proposed payment instruction update rejected. Preserving original verified account.`,
      });
    }

    setStoredJson(STORAGE_KEYS.BANK_CHANGES, requests);
    setStoredJson(STORAGE_KEYS.APPLICATIONS, allApps);
    this.notify();
    return { success: true };
  }

  public submitNewApplication(appData: Omit<VendorApplication, 'id' | 'organizationId' | 'validationResults' | 'discrepancies' | 'manualOverridesCount'>): VendorApplication {
    const org = this.getCurrentOrg();
    const all = getStoredJson<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    const newId = `VND-2026-${1000 + all.length + 1}`;
    const newVendorId = `vnd-${Date.now().toString().slice(-6)}`;

    const newApp: VendorApplication = {
      ...appData,
      id: newId,
      organizationId: org.id,
      vendorId: newVendorId,
      status: 'SUBMITTED',
      riskLevel: 'LOW',
      riskScore: 10,
      validationResults: [],
      discrepancies: [],
      manualOverridesCount: 0,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const evaluated = evaluateApplication(newApp, all, this.getCountryConfigs());
    newApp.validationResults = evaluated.validationResults;
    newApp.riskLevel = evaluated.riskLevel;
    newApp.riskScore = evaluated.riskScore;
    newApp.status = evaluated.computedStatus === 'APPROVED' ? 'IN_REVIEW' : evaluated.computedStatus;
    newApp.discrepancies = evaluated.discrepancies;

    all.unshift(newApp);
    setStoredJson(STORAGE_KEYS.APPLICATIONS, all);

    // Create vendor master
    const vendors = getStoredJson<Vendor[]>(STORAGE_KEYS.VENDORS, []);
    const newVendor: Vendor = {
      id: newVendorId,
      organizationId: org.id,
      name: newApp.company.legalName,
      country: newApp.company.country,
      category: newApp.company.vendorCategory,
      status: 'PENDING_ONBOARDING',
      riskLevel: newApp.riskLevel,
      activeApplicationId: newId,
      createdAt: newApp.submittedAt,
      paymentTerms: 'Net 30 Days',
      hasActiveBankChangeHold: false,
    };
    vendors.unshift(newVendor);
    setStoredJson(STORAGE_KEYS.VENDORS, vendors);

    this.logAuditEvent({
      applicationId: newId,
      vendorName: newApp.company.legalName,
      action: 'APPLICATION_SUBMITTED',
      reason: 'New vendor registration submitted through self-service onboarding portal.',
      evidence: `Initial evaluation produced status: ${newApp.status}, Risk: ${newApp.riskLevel} (${newApp.riskScore}/100)`,
    });

    this.notify();
    return newApp;
  }

  // --- Accounts Payable (AP) & 3-Way Matching Methods ---

  public getInvoices(): VendorInvoice[] {
    return getStoredJson<VendorInvoice[]>(STORAGE_KEYS.INVOICES, SEED_INVOICES);
  }

  public getScorecards(): Record<string, VendorScorecard> {
    return getStoredJson<Record<string, VendorScorecard>>(STORAGE_KEYS.SCORECARDS, SEED_SCORECARDS);
  }

  public getVendorScorecard(vendorId: string): VendorScorecard | undefined {
    const scorecards = this.getScorecards();
    return scorecards[vendorId];
  }

  public approveInvoiceForPayment(invoiceId: string, notes?: string): { success: boolean; message?: string } {
    const invoices = this.getInvoices();
    const idx = invoices.findIndex(i => i.id === invoiceId);
    if (idx === -1) return { success: false, message: 'Invoice not found.' };

    invoices[idx] = {
      ...invoices[idx],
      status: 'READY_FOR_PAYMENT',
      varianceReason: notes ? `Approved with manager note: ${notes}` : invoices[idx].varianceReason,
    };

    setStoredJson(STORAGE_KEYS.INVOICES, invoices);

    this.logAuditEvent({
      applicationId: invoices[idx].vendorId,
      vendorName: invoices[idx].vendorName,
      action: 'INVOICE_3WAY_MATCHED',
      reason: notes || 'Invoice passed 3-way match tolerances and marked ready for payment batch.',
      evidence: `PO #${invoices[idx].poNumber} | Invoice #${invoices[idx].invoiceNumber} ($${invoices[idx].amount.toLocaleString()})`,
    });

    this.notify();
    return { success: true };
  }

  public resolveInvoiceVariance(
    invoiceId: string, 
    resolution: 'ACCEPT_PRICE_OVERRIDE' | 'REQUEST_CREDIT_MEMO', 
    notes: string
  ): { success: boolean; message?: string } {
    const invoices = this.getInvoices();
    const idx = invoices.findIndex(i => i.id === invoiceId);
    if (idx === -1) return { success: false, message: 'Invoice not found.' };

    const inv = invoices[idx];

    if (resolution === 'ACCEPT_PRICE_OVERRIDE') {
      inv.status = 'READY_FOR_PAYMENT';
      inv.varianceReason = `Manager Variance Override: Accepted by ${this.getCurrentUser().name}. Reason: ${notes}`;
      this.logAuditEvent({
        applicationId: inv.vendorId,
        vendorName: inv.vendorName,
        action: 'INVOICE_VARIANCE_RESOLVED',
        reason: `Manager approved price variance override: ${notes}`,
        evidence: `Original PO: $${inv.poAmount} vs Invoiced: $${inv.amount}`,
      });
    } else {
      inv.status = 'REJECTED';
      inv.varianceReason = `Variance Rejected: Credit memo requested from vendor. Notes: ${notes}`;
      this.logAuditEvent({
        applicationId: inv.vendorId,
        vendorName: inv.vendorName,
        action: 'INVOICE_VARIANCE_RESOLVED',
        reason: `Rejected for credit memo adjustment: ${notes}`,
        evidence: `Variance dispute logged against PO #${inv.poNumber}`,
      });
    }

    setStoredJson(STORAGE_KEYS.INVOICES, invoices);
    this.notify();
    return { success: true };
  }

  public disbursePaymentBatch(
    invoiceIds: string[], 
    stepUpVerified: boolean
  ): { success: boolean; count: number; totalAmount: number; message: string } {
    const user = this.getCurrentUser();
    if (user.role === 'vendor' || user.role === 'auditor') {
      return { success: false, count: 0, totalAmount: 0, message: 'Only procurement managers, reviewers, or administrators may release payment batches.' };
    }

    const invoices = this.getInvoices();
    const selected = invoices.filter(i => invoiceIds.includes(i.id));

    // Check if any invoice vendor is under active bank change hold
    const bankChanges = this.getBankChangeRequests();
    for (const inv of selected) {
      const activeHold = bankChanges.find(b => b.vendorId === inv.vendorId && (b.status === 'PENDING_HOLD' || b.status === 'PHONE_VERIFIED'));
      if (activeHold) {
        return {
          success: false,
          count: 0,
          totalAmount: 0,
          message: `Disbursement blocked: Vendor ${inv.vendorName} is currently under an active 72-Hour Security Bank Change Hold (Case #${activeHold.id}). Payment cannot be released until verification concludes.`,
        };
      }
    }

    let disbursedTotal = 0;
    const now = new Date().toISOString();

    const updatedInvoices = invoices.map(i => {
      if (invoiceIds.includes(i.id)) {
        disbursedTotal += i.amount;
        return {
          ...i,
          status: 'PAID' as const,
          paidAt: now,
          paidBy: `${user.name} (${user.role.toUpperCase()})`,
        };
      }
      return i;
    });

    setStoredJson(STORAGE_KEYS.INVOICES, updatedInvoices);

    this.logAuditEvent({
      applicationId: 'BATCH-PAYMENT-RUN',
      vendorName: `${selected.length} Approved Invoices`,
      action: 'PAYMENT_BATCH_DISBURSED',
      reason: `Automated payment run released via NACHA ACH / ISO 20022 wire transfer. MFA step-up verification: ${stepUpVerified ? 'VALIDATED' : 'BYPASSED'}`,
      evidence: `Disbursed $${disbursedTotal.toLocaleString()} across ${selected.length} vendor invoices. Batch Ref #ACH-${Date.now().toString().slice(-6)}`,
    });

    this.notify();
    return {
      success: true,
      count: selected.length,
      totalAmount: disbursedTotal,
      message: `Successfully released batch payment of $${disbursedTotal.toLocaleString()} across ${selected.length} invoices.`,
    };
  }

  public createInvoice(invoiceData: Partial<VendorInvoice>): VendorInvoice {
    const invoices = this.getInvoices();
    const newId = `inv-${Date.now().toString().slice(-6)}`;
    const newNumber = `INV-2026-${Math.floor(8800 + Math.random() * 1000)}`;

    const newInvoice: VendorInvoice = {
      id: newId,
      invoiceNumber: invoiceData.invoiceNumber || newNumber,
      vendorId: invoiceData.vendorId || 'vnd-nordic-1002',
      vendorName: invoiceData.vendorName || 'Nordic Logistics OY',
      poNumber: invoiceData.poNumber || `PO-2026-${Math.floor(4400 + Math.random() * 1000)}`,
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      amount: invoiceData.amount || 5000,
      currency: invoiceData.currency || 'USD',
      status: invoiceData.status || 'READY_FOR_PAYMENT',
      matchingStatus: invoiceData.matchingStatus || '3_WAY_MATCH_PASS',
      poAmount: invoiceData.poAmount || invoiceData.amount || 5000,
      receivedAmount: invoiceData.receivedAmount || invoiceData.amount || 5000,
      varianceReason: invoiceData.varianceReason,
      earlyDiscountTerms: invoiceData.earlyDiscountTerms,
      lineItems: invoiceData.lineItems || [{ item: 'Standard Enterprise Procurement Delivery', qty: 1, unitPrice: invoiceData.amount || 5000, total: invoiceData.amount || 5000 }],
      paymentMethod: invoiceData.paymentMethod || 'ACH',
    };

    invoices.unshift(newInvoice);
    setStoredJson(STORAGE_KEYS.INVOICES, invoices);

    this.logAuditEvent({
      applicationId: newInvoice.vendorId,
      vendorName: newInvoice.vendorName,
      action: 'INVOICE_SUBMITTED',
      reason: 'New electronic invoice received via PEPPOL / EDI gateway.',
      evidence: `Invoice #${newInvoice.invoiceNumber} for $${newInvoice.amount.toLocaleString()} against PO #${newInvoice.poNumber}`,
    });

    this.notify();
    return newInvoice;
  }

  // --- ServiceNow-style Vendor Management Workspace Methods ---

  public getContracts(): VendorContract[] {
    return getStoredJson<VendorContract[]>(STORAGE_KEYS.CONTRACTS, SEED_CONTRACTS);
  }

  public getContractsByVendor(vendorId: string): VendorContract[] {
    return this.getContracts().filter(c => c.vendorId === vendorId);
  }

  public createContract(contractData: Partial<VendorContract>): VendorContract {
    const contracts = this.getContracts();
    const newId = `ctr-${Date.now().toString().slice(-6)}`;
    const newContractNumber = `CTR-2026-${Math.floor(4400 + Math.random() * 1000)}`;

    const newContract: VendorContract = {
      id: newId,
      contractNumber: contractData.contractNumber || newContractNumber,
      vendorId: contractData.vendorId || 'vnd-nordic-1002',
      vendorName: contractData.vendorName || 'Nordic Logistics OY',
      title: contractData.title || 'Procurement Services Agreement',
      status: contractData.status || 'ACTIVE',
      startDate: contractData.startDate || new Date().toISOString().split('T')[0],
      endDate: contractData.endDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      totalValue: contractData.totalValue || 100000,
      spentYTD: contractData.spentYTD || 0,
      currency: contractData.currency || 'USD',
      autoRenew: contractData.autoRenew ?? true,
      renewalNoticePeriodDays: contractData.renewalNoticePeriodDays || 60,
      slas: contractData.slas || [
        {
          id: `sla-${Date.now()}`,
          name: 'On-Time Fulfillment SLA',
          target: 98.0,
          unit: '%',
          direction: 'MAXIMIZE',
          currentMetric: 99.1,
          status: 'MET',
          penaltyClause: '0.5% credit per percentage point breach',
          penaltyPerUnit: 500,
        }
      ]
    };

    contracts.unshift(newContract);
    setStoredJson(STORAGE_KEYS.CONTRACTS, contracts);

    this.logAuditEvent({
      applicationId: newContract.vendorId,
      vendorName: newContract.vendorName,
      action: 'CONFIG_UPDATED',
      reason: `New Vendor Contract ${newContract.contractNumber} recorded with committed SLAs.`,
      evidence: `Value: $${newContract.totalValue.toLocaleString()} | Valid to ${newContract.endDate}`,
    });

    this.notify();
    return newContract;
  }

  public renewContract(contractId: string, additionalMonths = 12): { success: boolean; message: string } {
    const contracts = this.getContracts();
    const idx = contracts.findIndex(c => c.id === contractId);
    if (idx === -1) return { success: false, message: 'Contract not found' };

    const ctr = contracts[idx];
    const currentEnd = new Date(ctr.endDate);
    currentEnd.setMonth(currentEnd.getMonth() + additionalMonths);
    const newEndDate = currentEnd.toISOString().split('T')[0];

    contracts[idx] = {
      ...ctr,
      status: 'ACTIVE',
      endDate: newEndDate,
    };

    setStoredJson(STORAGE_KEYS.CONTRACTS, contracts);

    this.logAuditEvent({
      applicationId: ctr.vendorId,
      vendorName: ctr.vendorName,
      action: 'CONTRACT_RENEWAL_INITIATED',
      reason: `Vendor contract ${ctr.contractNumber} renewed for ${additionalMonths} months by ${this.getCurrentUser().name}.`,
      evidence: `Previous End: ${ctr.endDate} -> New Term Expiration: ${newEndDate}`,
    });

    this.notify();
    return { success: true, message: `Contract ${ctr.contractNumber} successfully extended to ${newEndDate}.` };
  }

  public getSlaBreaches(): SlaBreach[] {
    return getStoredJson<SlaBreach[]>(STORAGE_KEYS.SLA_BREACHES, SEED_SLA_BREACHES);
  }

  public getBreachesByVendor(vendorId: string): SlaBreach[] {
    return this.getSlaBreaches().filter(b => b.vendorId === vendorId);
  }

  public claimServiceCredit(breachId: string): { success: boolean; creditAmount: number; creditMemoId: string; message: string } {
    const breaches = this.getSlaBreaches();
    const idx = breaches.findIndex(b => b.id === breachId);
    if (idx === -1) {
      return { success: false, creditAmount: 0, creditMemoId: '', message: 'Breach record not found.' };
    }

    const breach = breaches[idx];
    if (breach.status === 'CREDIT_CLAIMED') {
      return { success: false, creditAmount: breach.serviceCreditPenalty, creditMemoId: breach.apCreditMemoId || '', message: 'Credit already claimed.' };
    }

    const memoId = `CR-MEMO-${Date.now().toString().slice(-5)}`;
    const now = new Date().toISOString();
    const user = this.getCurrentUser();

    breaches[idx] = {
      ...breach,
      status: 'CREDIT_CLAIMED',
      claimedAt: now,
      claimedBy: `${user.name} (${user.role.toUpperCase()})`,
      apCreditMemoId: memoId,
    };

    setStoredJson(STORAGE_KEYS.SLA_BREACHES, breaches);

    // Also deduct claimable credits from vendor scorecard in storage
    const scorecards = this.getScorecards();
    if (scorecards[breach.vendorId]) {
      scorecards[breach.vendorId].claimableServiceCredits = Math.max(0, (scorecards[breach.vendorId].claimableServiceCredits || 0) - breach.serviceCreditPenalty);
      setStoredJson(STORAGE_KEYS.SCORECARDS, scorecards);
    }

    // Automatically generate an AP Credit Memo invoice so it directly deducts in AP Automation
    const invoices = this.getInvoices();
    const creditInvoice: VendorInvoice = {
      id: `inv-credit-${Date.now().toString().slice(-5)}`,
      invoiceNumber: memoId,
      vendorId: breach.vendorId,
      vendorName: breach.vendorName,
      poNumber: breach.contractNumber,
      invoiceDate: now.split('T')[0],
      dueDate: now.split('T')[0],
      amount: -breach.serviceCreditPenalty, // negative credit deduction
      currency: breach.currency,
      status: 'READY_FOR_PAYMENT',
      matchingStatus: '3_WAY_MATCH_PASS',
      poAmount: -breach.serviceCreditPenalty,
      receivedAmount: -breach.serviceCreditPenalty,
      varianceReason: `SLA Breach Credit Memo (${breach.slaName}): Deducted from next AP disbursement run.`,
      paymentMethod: 'ACH',
      lineItems: [
        {
          item: `Contractual SLA Penalty Credit: ${breach.slaName} (${breach.actualMetric})`,
          qty: 1,
          unitPrice: -breach.serviceCreditPenalty,
          total: -breach.serviceCreditPenalty,
        }
      ]
    };
    invoices.unshift(creditInvoice);
    setStoredJson(STORAGE_KEYS.INVOICES, invoices);

    this.logAuditEvent({
      applicationId: breach.vendorId,
      vendorName: breach.vendorName,
      action: 'SERVICE_CREDIT_CLAIMED',
      reason: `Procurement manager claimed contractual SLA service credit of $${breach.serviceCreditPenalty.toLocaleString()} against contract ${breach.contractNumber}.`,
      evidence: `Credit Memo #${memoId} created in AP Automation for automated invoice offset.`,
    });

    this.notify();
    return {
      success: true,
      creditAmount: breach.serviceCreditPenalty,
      creditMemoId: memoId,
      message: `Claimed $${breach.serviceCreditPenalty.toLocaleString()} service credit penalty. AP Credit Memo #${memoId} created.`,
    };
  }

  public getCimPlans(): CorrectiveActionPlan[] {
    return getStoredJson<CorrectiveActionPlan[]>(STORAGE_KEYS.CIM_PLANS, SEED_CIM_PLANS);
  }

  public getCimPlansByVendor(vendorId: string): CorrectiveActionPlan[] {
    return this.getCimPlans().filter(p => p.vendorId === vendorId);
  }

  public createCimPlan(planData: Partial<CorrectiveActionPlan>): CorrectiveActionPlan {
    const plans = this.getCimPlans();
    const newId = `CIM-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newPlan: CorrectiveActionPlan = {
      id: newId,
      vendorId: planData.vendorId || 'vnd-nordic-1002',
      vendorName: planData.vendorName || 'Nordic Logistics OY',
      title: planData.title || 'Supplier Corrective Action Request (SCAR)',
      issueDescription: planData.issueDescription || 'Performance gap identified during monthly review.',
      requiredAction: planData.requiredAction || 'Provide root cause analysis and mitigation plan within 14 days.',
      severity: planData.severity || 'MEDIUM',
      status: planData.status || 'OPEN',
      assignedTo: planData.assignedTo || this.getCurrentUser().name,
      vendorContact: planData.vendorContact || 'Vendor Operations Lead',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: planData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };

    plans.unshift(newPlan);
    setStoredJson(STORAGE_KEYS.CIM_PLANS, plans);

    this.logAuditEvent({
      applicationId: newPlan.vendorId,
      vendorName: newPlan.vendorName,
      action: 'CIM_PLAN_CREATED',
      reason: `Opened Continual Improvement Remediation Plan ${newPlan.id}: ${newPlan.title}`,
      evidence: `Target Due Date: ${newPlan.dueDate} | Assigned to: ${newPlan.assignedTo}`,
    });

    this.notify();
    return newPlan;
  }

  public resolveCimPlan(planId: string, resolutionSummary: string): { success: boolean } {
    const plans = this.getCimPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return { success: false };

    const plan = plans[idx];
    const now = new Date().toISOString().split('T')[0];

    plans[idx] = {
      ...plan,
      status: 'RESOLVED',
      resolvedAt: now,
      resolutionSummary,
    };

    setStoredJson(STORAGE_KEYS.CIM_PLANS, plans);

    this.logAuditEvent({
      applicationId: plan.vendorId,
      vendorName: plan.vendorName,
      action: 'CIM_PLAN_RESOLVED',
      reason: `Manager verified and closed CIM plan ${plan.id}.`,
      evidence: `Resolution Summary: ${resolutionSummary}`,
    });

    this.notify();
    return { success: true };
  }
}


