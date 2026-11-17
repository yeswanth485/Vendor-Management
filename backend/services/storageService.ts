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
import { notificationService } from './notificationService';

export class BackendStorageService {
  private static instance: BackendStorageService;

  private applications: VendorApplication[] = [];
  private vendors: Vendor[] = [];
  private bankChanges: BankChangeRequest[] = [];
  private followUps: FollowUpItem[] = [];
  private auditEvents: AuditEvent[] = [];
  private countryConfigs: Record<string, CountryConfiguration> = { ...DEFAULT_COUNTRY_CONFIGS };
  private currentOrgId: string = 'org-terybi-corp';
  private currentUser: User = { ...SEED_USERS[0] };
  private invoices: VendorInvoice[] = [];
  private scorecards: Record<string, VendorScorecard> = {};
  private contracts: VendorContract[] = [];
  private slaBreaches: SlaBreach[] = [];
  private cimPlans: CorrectiveActionPlan[] = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): BackendStorageService {
    if (!BackendStorageService.instance) {
      BackendStorageService.instance = new BackendStorageService();
    }
    return BackendStorageService.instance;
  }

  private init() {
    this.applications = getEvaluatedSeedApplications();
    this.vendors = getSeedVendors(this.applications);
    this.bankChanges = [...SEED_BANK_CHANGE_REQUESTS];
    this.followUps = [...SEED_FOLLOW_UPS];
    this.auditEvents = [...SEED_AUDIT_EVENTS];
    this.invoices = [...SEED_INVOICES];
    this.scorecards = { ...SEED_SCORECARDS };
    this.contracts = [...SEED_CONTRACTS];
    this.slaBreaches = [...SEED_SLA_BREACHES];
    this.cimPlans = [...SEED_CIM_PLANS];
  }

  // Context
  public getCurrentOrg(): Organization {
    return SEED_ORGANIZATIONS.find(o => o.id === this.currentOrgId) || SEED_ORGANIZATIONS[0];
  }

  public setCurrentOrg(orgId: string): void {
    this.currentOrgId = orgId;
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUserRole(role: UserRole): void {
    const matching = SEED_USERS.find(u => u.role === role);
    if (matching) {
      this.currentUser = { ...matching };
    } else {
      this.currentUser = {
        id: `usr-${role}`,
        name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
        email: `${role}@terybi.com`,
        role,
        organizationId: this.getCurrentOrg().id,
        title: `${role.toUpperCase()} Authority`,
      };
    }
  }

  // Applications
  public getApplications(): VendorApplication[] {
    const org = this.getCurrentOrg();
    return this.applications.filter(a => a.organizationId === org.id);
  }

  public getApplicationById(id: string): VendorApplication | undefined {
    return this.applications.find(a => a.id === id);
  }

  public submitApplication(appData: Omit<VendorApplication, 'id' | 'organizationId' | 'validationResults' | 'discrepancies' | 'manualOverridesCount'>): VendorApplication {
    const org = this.getCurrentOrg();
    const newId = `VND-2026-${1000 + this.applications.length + 1}`;
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

    const evaluated = evaluateApplication(newApp, this.applications, this.countryConfigs);
    newApp.validationResults = evaluated.validationResults;
    newApp.riskLevel = evaluated.riskLevel;
    newApp.riskScore = evaluated.riskScore;
    newApp.status = evaluated.computedStatus === 'APPROVED' ? 'IN_REVIEW' : evaluated.computedStatus;
    newApp.discrepancies = evaluated.discrepancies;

    this.applications.unshift(newApp);

    // Create Vendor record
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
    this.vendors.unshift(newVendor);

    this.logAuditEvent({
      applicationId: newId,
      vendorName: newApp.company.legalName,
      action: 'APPLICATION_SUBMITTED',
      reason: 'New vendor registration submitted through self-service onboarding portal.',
      evidence: `Initial evaluation produced status: ${newApp.status}, Risk: ${newApp.riskLevel} (${newApp.riskScore}/100)`,
    });

    notificationService.broadcast({
      type: 'APPLICATION_UPDATE',
      title: 'New Application Filed',
      message: `${newApp.company.legalName} (${newId}) submitted. Computed Risk: ${newApp.riskLevel}.`,
      priority: newApp.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM',
      actionUrl: '/applications',
    });

    return newApp;
  }

  public approveApplication(id: string, reason: string): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    if (user.role !== 'approver' && user.role !== 'administrator') {
      return { 
        success: false, 
        error: `Permission Denied: User role "${user.role}" is not authorized to grant final procurement approval.` 
      };
    }

    const app = this.applications.find(a => a.id === id);
    if (!app) return { success: false, error: 'Application not found' };

    const prevStatus = app.status;
    app.status = 'APPROVED';
    app.decisionReason = reason;
    app.reviewedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();

    const vIdx = this.vendors.findIndex(v => v.id === app.vendorId);
    if (vIdx !== -1) {
      this.vendors[vIdx].status = 'ACTIVE';
      this.vendors[vIdx].riskLevel = app.riskLevel;
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

    notificationService.broadcast({
      type: 'APPLICATION_UPDATE',
      title: 'Application Approved',
      message: `${app.company.legalName} approved for active procurement by ${user.name}.`,
      priority: 'LOW',
      actionUrl: '/applications',
    });

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
        error: `Permission Denied: User role "${user.role}" cannot reject applications.` 
      };
    }

    const app = this.applications.find(a => a.id === id);
    if (!app) return { success: false, error: 'Application not found' };

    const prevStatus = app.status;
    app.status = 'REJECTED';
    app.decisionReason = mandatoryReason;
    app.reviewedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();

    const vIdx = this.vendors.findIndex(v => v.id === app.vendorId);
    if (vIdx !== -1) {
      this.vendors[vIdx].status = 'BLOCKED';
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

    return { success: true };
  }

  public claimApplication(id: string): void {
    const user = this.getCurrentUser();
    const app = this.applications.find(a => a.id === id);
    if (!app) return;

    app.assignedReviewerId = user.id;
    app.assignedReviewerName = user.name;
    if (app.status === 'SUBMITTED') {
      app.status = 'IN_REVIEW';
    }
    app.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'REVIEWER_CLAIMED',
      previousValue: 'Unassigned',
      newValue: `${user.name} (${user.role})`,
      reason: 'Reviewer claimed task from triage queue.',
    });
  }

  public releaseApplication(id: string): void {
    const app = this.applications.find(a => a.id === id);
    if (!app) return;

    const prevReviewer = app.assignedReviewerName;
    app.assignedReviewerId = undefined;
    app.assignedReviewerName = undefined;
    app.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'REVIEWER_RELEASED',
      previousValue: prevReviewer || 'None',
      newValue: 'Unassigned',
      reason: 'Reviewer released application back to unassigned triage pool.',
    });
  }

  public revalidateApplication(id: string): VendorApplication | null {
    const app = this.applications.find(a => a.id === id);
    if (!app) return null;

    const evaluated = evaluateApplication(app, this.applications, this.countryConfigs);
    const updated: VendorApplication = {
      ...app,
      validationResults: evaluated.validationResults,
      riskLevel: evaluated.riskLevel,
      riskScore: evaluated.riskScore,
      status: app.status === 'APPROVED' ? 'APPROVED' : app.status === 'REJECTED' ? 'REJECTED' : evaluated.computedStatus,
      discrepancies: evaluated.discrepancies,
      updatedAt: new Date().toISOString(),
    };

    const idx = this.applications.findIndex(a => a.id === id);
    this.applications[idx] = updated;

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'VALIDATION_EVALUATED',
      reason: `Re-ran automated decision engine. Computed Risk: ${updated.riskLevel} (${updated.riskScore}/100), Workflow: ${updated.status}.`,
      evidence: `${updated.validationResults.filter(r => r.status === 'PASS').length} of ${updated.validationResults.length} rules passed.`,
    });

    return updated;
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

    const app = this.applications.find(a => a.id === params.applicationId);
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

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'MANUAL_OVERRIDE_APPLIED',
      previousValue: `${params.ruleId}: ${oldStatus}`,
      newValue: `${params.ruleId}: ${params.newStatus}`,
      reason: params.justification,
      evidence: `Override recorded preserving original finding. Authorized by ${user.name}.`,
    });

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
    const app = this.applications.find(a => a.id === params.applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    const disc = app.discrepancies.find(d => d.type === params.discrepancyType);
    if (disc) {
      disc.resolved = true;
      disc.resolvedBy = `${user.name} (${user.role})`;
      disc.resolutionNotes = params.resolutionNotes;
    }

    if (params.discrepancyType === 'NAME_MISMATCH') {
      app.banking.isVerified = true;
      app.banking.verifiedAt = new Date().toISOString();
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
    this.revalidateApplication(app.id);

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'DISCREPANCY_RESOLVED',
      reason: params.resolutionNotes,
      evidence: `Resolved exception: ${params.discrepancyType} by ${user.name}.`,
    });

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
    const app = this.applications.find(a => a.id === params.applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    app.status = 'AWAITING_VENDOR';
    app.updatedAt = new Date().toISOString();

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
    this.followUps.unshift(newFollowUp);

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'INFORMATION_REQUESTED',
      previousValue: 'IN_REVIEW',
      newValue: 'AWAITING_VENDOR',
      reason: `Dispatched automated resolution request for ${params.missingItems.length} items.`,
      evidence: `Delivered to ${params.recipientEmail}. Portal link generated.`,
    });

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
    const app = this.applications.find(a => a.id === params.applicationId);
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

    if (params.documentCategory === 'ISO_COMPLIANCE' || params.documentCategory === 'TAX_REGISTRATION') {
      const expDisc = app.discrepancies.find(d => d.type === 'EXPIRED_DOCUMENT' || d.type === 'MISSING_MANDATORY_DOC');
      if (expDisc) {
        expDisc.resolved = true;
        expDisc.resolvedBy = user.name;
        expDisc.resolutionNotes = `Replaced with valid certificate: ${params.fileName}`;
      }
    }

    app.status = 'IN_REVIEW';
    app.updatedAt = new Date().toISOString();
    this.revalidateApplication(app.id);

    this.logAuditEvent({
      applicationId: app.id,
      vendorName: app.company.legalName,
      action: 'DOCUMENT_REPLACED',
      reason: `Uploaded replacement ${params.documentCategory}: ${params.fileName}.`,
      evidence: `Triggered automatic re-evaluation of RULE-005.`,
    });

    return { success: true };
  }

  // Vendors
  public getVendors(): Vendor[] {
    const org = this.getCurrentOrg();
    return this.vendors.filter(v => v.organizationId === org.id);
  }

  // Bank Change Requests
  public getBankChangeRequests(): BankChangeRequest[] {
    return this.bankChanges;
  }

  public verifyBankChangeRequest(params: {
    requestId: string;
    action: 'APPROVE' | 'REJECT';
    notes: string;
  }): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    if (user.role !== 'approver' && user.role !== 'administrator') {
      return { success: false, error: 'Only an Approver or Administrator can verify bank changes.' };
    }

    const req = this.bankChanges.find(r => r.id === params.requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const app = this.applications.find(a => a.id === req.applicationId);

    if (params.action === 'APPROVE') {
      req.status = 'APPROVED';
      req.reviewedBy = `${user.name} (${user.role})`;
      req.reviewedAt = new Date().toISOString();
      req.verificationNotes = params.notes;

      if (app) {
        app.banking = {
          ...req.proposedDetails,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        };
        const bDisc = app.discrepancies.find(d => d.type === 'SUSPICIOUS_BANK_CHANGE');
        if (bDisc) {
          bDisc.resolved = true;
          bDisc.resolvedBy = user.name;
          bDisc.resolutionNotes = params.notes;
        }
      }

      const vendor = this.vendors.find(v => v.id === req.vendorId);
      if (vendor) {
        vendor.hasActiveBankChangeHold = false;
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

      const vendor = this.vendors.find(v => v.id === req.vendorId);
      if (vendor) {
        vendor.hasActiveBankChangeHold = false;
      }

      this.logAuditEvent({
        applicationId: req.applicationId,
        vendorName: app?.company.legalName || 'Vendor',
        action: 'BANK_CHANGE_REJECTED',
        reason: params.notes,
        evidence: `Security rejection: Proposed payment instruction rejected. Preserving original account.`,
      });
    }

    return { success: true };
  }

  // Follow-ups & Audits
  public getFollowUps(): FollowUpItem[] {
    return this.followUps;
  }

  public getAuditEvents(): AuditEvent[] {
    const org = this.getCurrentOrg();
    return this.auditEvents
      .filter(e => e.organizationId === org.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

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
    this.auditEvents.unshift(newEvent);
  }

  // Invoices & AP
  public getInvoices(): VendorInvoice[] {
    return this.invoices;
  }

  public createInvoice(invoiceData: Partial<VendorInvoice>): VendorInvoice {
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

    this.invoices.unshift(newInvoice);

    this.logAuditEvent({
      applicationId: newInvoice.vendorId,
      vendorName: newInvoice.vendorName,
      action: 'INVOICE_SUBMITTED',
      reason: 'New electronic invoice received via PEPPOL / EDI gateway.',
      evidence: `Invoice #${newInvoice.invoiceNumber} for $${newInvoice.amount.toLocaleString()} against PO #${newInvoice.poNumber}`,
    });

    return newInvoice;
  }

  public approveInvoiceForPayment(invoiceId: string, notes?: string): { success: boolean; message?: string } {
    const idx = this.invoices.findIndex(i => i.id === invoiceId);
    if (idx === -1) return { success: false, message: 'Invoice not found.' };

    this.invoices[idx] = {
      ...this.invoices[idx],
      status: 'READY_FOR_PAYMENT',
      varianceReason: notes ? `Approved with manager note: ${notes}` : this.invoices[idx].varianceReason,
    };

    this.logAuditEvent({
      applicationId: this.invoices[idx].vendorId,
      vendorName: this.invoices[idx].vendorName,
      action: 'INVOICE_3WAY_MATCHED',
      reason: notes || 'Invoice passed 3-way match tolerances and marked ready for payment batch.',
      evidence: `PO #${this.invoices[idx].poNumber} | Invoice #${this.invoices[idx].invoiceNumber}`,
    });

    return { success: true };
  }

  public resolveInvoiceVariance(invoiceId: string, resolution: 'ACCEPT_PRICE_OVERRIDE' | 'REQUEST_CREDIT_MEMO', notes: string): { success: boolean; message?: string } {
    const idx = this.invoices.findIndex(i => i.id === invoiceId);
    if (idx === -1) return { success: false, message: 'Invoice not found.' };

    const inv = this.invoices[idx];
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

    return { success: true };
  }

  public disbursePaymentBatch(invoiceIds: string[], stepUpVerified: boolean): { success: boolean; count: number; totalAmount: number; message: string } {
    const user = this.getCurrentUser();
    if (user.role === 'vendor' || user.role === 'auditor') {
      return { success: false, count: 0, totalAmount: 0, message: 'Only authorized procurement officers may disburse payments.' };
    }

    const selected = this.invoices.filter(i => invoiceIds.includes(i.id));

    // Verify hold constraints
    for (const inv of selected) {
      const activeHold = this.bankChanges.find(b => b.vendorId === inv.vendorId && (b.status === 'PENDING_HOLD' || b.status === 'PHONE_VERIFIED'));
      if (activeHold) {
        return {
          success: false,
          count: 0,
          totalAmount: 0,
          message: `Disbursement blocked: Vendor ${inv.vendorName} is under active 72-Hour Security Hold (Case #${activeHold.id}).`,
        };
      }
    }

    let disbursedTotal = 0;
    const now = new Date().toISOString();

    this.invoices = this.invoices.map(i => {
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

    this.logAuditEvent({
      applicationId: 'BATCH-PAYMENT-RUN',
      vendorName: `${selected.length} Approved Invoices`,
      action: 'PAYMENT_BATCH_DISBURSED',
      reason: `Automated payment run released via NACHA ACH / ISO 20022 wire transfer. MFA step-up: ${stepUpVerified ? 'VALIDATED' : 'BYPASSED'}`,
      evidence: `Disbursed $${disbursedTotal.toLocaleString()} across ${selected.length} vendor invoices. Batch Ref #ACH-${Date.now().toString().slice(-6)}`,
    });

    return {
      success: true,
      count: selected.length,
      totalAmount: disbursedTotal,
      message: `Successfully released batch payment of $${disbursedTotal.toLocaleString()} across ${selected.length} invoices.`,
    };
  }

  // Contracts & SLAs
  public getContracts(): VendorContract[] {
    return this.contracts;
  }

  public createContract(contractData: Partial<VendorContract>): VendorContract {
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

    this.contracts.unshift(newContract);
    return newContract;
  }

  public renewContract(contractId: string, additionalMonths = 12): { success: boolean; message: string } {
    const idx = this.contracts.findIndex(c => c.id === contractId);
    if (idx === -1) return { success: false, message: 'Contract not found' };

    const ctr = this.contracts[idx];
    const currentEnd = new Date(ctr.endDate);
    currentEnd.setMonth(currentEnd.getMonth() + additionalMonths);
    const newEndDate = currentEnd.toISOString().split('T')[0];

    this.contracts[idx] = {
      ...ctr,
      status: 'ACTIVE',
      endDate: newEndDate,
    };

    return { success: true, message: `Contract ${ctr.contractNumber} successfully extended to ${newEndDate}.` };
  }

  // SLA Breaches
  public getSlaBreaches(): SlaBreach[] {
    return this.slaBreaches;
  }

  public claimServiceCredit(breachId: string): { success: boolean; creditAmount: number; creditMemoId: string; message: string } {
    const idx = this.slaBreaches.findIndex(b => b.id === breachId);
    if (idx === -1) {
      return { success: false, creditAmount: 0, creditMemoId: '', message: 'Breach record not found.' };
    }

    const breach = this.slaBreaches[idx];
    if (breach.status === 'CREDIT_CLAIMED') {
      return { success: false, creditAmount: breach.serviceCreditPenalty, creditMemoId: breach.apCreditMemoId || '', message: 'Credit already claimed.' };
    }

    const memoId = `CR-MEMO-${Date.now().toString().slice(-5)}`;
    const now = new Date().toISOString();
    const user = this.getCurrentUser();

    this.slaBreaches[idx] = {
      ...breach,
      status: 'CREDIT_CLAIMED',
      claimedAt: now,
      claimedBy: `${user.name} (${user.role.toUpperCase()})`,
      apCreditMemoId: memoId,
    };

    // Create credit memo invoice
    const creditInvoice: VendorInvoice = {
      id: `inv-credit-${Date.now().toString().slice(-5)}`,
      invoiceNumber: memoId,
      vendorId: breach.vendorId,
      vendorName: breach.vendorName,
      poNumber: breach.contractNumber,
      invoiceDate: now.split('T')[0],
      dueDate: now.split('T')[0],
      amount: -breach.serviceCreditPenalty,
      currency: breach.currency,
      status: 'READY_FOR_PAYMENT',
      matchingStatus: '3_WAY_MATCH_PASS',
      poAmount: -breach.serviceCreditPenalty,
      receivedAmount: -breach.serviceCreditPenalty,
      varianceReason: `SLA Breach Credit Memo (${breach.slaName})`,
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
    this.invoices.unshift(creditInvoice);

    return {
      success: true,
      creditAmount: breach.serviceCreditPenalty,
      creditMemoId: memoId,
      message: `Claimed $${breach.serviceCreditPenalty.toLocaleString()} service credit penalty.`,
    };
  }

  // CIM Plans
  public getCimPlans(): CorrectiveActionPlan[] {
    return this.cimPlans;
  }

  public createCimPlan(planData: Partial<CorrectiveActionPlan>): CorrectiveActionPlan {
    const newId = `CIM-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newPlan: CorrectiveActionPlan = {
      id: newId,
      vendorId: planData.vendorId || 'vnd-nordic-1002',
      vendorName: planData.vendorName || 'Nordic Logistics OY',
      title: planData.title || 'Supplier Corrective Action Request (SCAR)',
      issueDescription: planData.issueDescription || 'Performance gap identified.',
      requiredAction: planData.requiredAction || 'Provide root cause analysis within 14 days.',
      severity: planData.severity || 'MEDIUM',
      status: planData.status || 'OPEN',
      assignedTo: planData.assignedTo || this.getCurrentUser().name,
      vendorContact: planData.vendorContact || 'Vendor Operations Lead',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: planData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };

    this.cimPlans.unshift(newPlan);
    return newPlan;
  }

  public resolveCimPlan(planId: string, resolutionSummary: string): { success: boolean } {
    const idx = this.cimPlans.findIndex(p => p.id === planId);
    if (idx === -1) return { success: false };

    this.cimPlans[idx] = {
      ...this.cimPlans[idx],
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString().split('T')[0],
      resolutionSummary,
    };

    return { success: true };
  }

  // Scorecards & Configs
  public getScorecards(): Record<string, VendorScorecard> {
    return this.scorecards;
  }

  public getVendorScorecard(vendorId: string): VendorScorecard | undefined {
    return this.scorecards[vendorId];
  }

  public getCountryConfigs(): Record<string, CountryConfiguration> {
    return this.countryConfigs;
  }
}

export const storageService = BackendStorageService.getInstance();
