export type UserRole = 'vendor' | 'reviewer' | 'approver' | 'administrator' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatarUrl?: string;
  title?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
}

export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'PENDING' | 'AWAITING_VENDOR' | 'APPROVED' | 'REJECTED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RuleStatus = 'PASS' | 'WARNING' | 'FAIL' | 'NEEDS_REVIEW';

export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  category: 'COMPLETENESS' | 'IDENTITY' | 'TAX' | 'BANKING' | 'COMPLIANCE' | 'DUPLICATE' | 'RISK_TRIGGER';
  status: RuleStatus;
  severity: RiskLevel;
  evidence: string;
  explanation: string;
  recommendedAction: string;
  manualReviewRequired: boolean;
  fieldAffected?: string;
  evaluatedAt: string;
  override?: {
    approvedBy: string;
    approvedAt: string;
    justification: string;
    originalStatus: RuleStatus;
  };
}

export interface VendorDocument {
  id: string;
  category: 'CERTIFICATE_OF_INCORPORATION' | 'TAX_REGISTRATION' | 'BANK_VERIFICATION_LETTER' | 'ISO_COMPLIANCE' | 'INSURANCE' | 'OTHER';
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  expiryDate?: string; // YYYY-MM-DD
  verified: boolean;
  verificationSource?: 'MANUAL_REVIEW' | 'OCR_ASSISTED' | 'UNVERIFIED';
  extractedData?: {
    legalName?: string;
    registrationNumber?: string;
    taxIdentifier?: string;
    accountHolderName?: string;
    accountNumberMasked?: string;
    expiryDate?: string;
    issueDate?: string;
  };
  fileUrl?: string;
}

export interface BankAccountDetails {
  accountHolderName: string;
  bankName: string;
  country: string;
  accountNumberMasked: string; // e.g. "••••••••4892"
  accountNumberHash?: string;
  routingIdentifierType: 'ROUTING_NUMBER' | 'SWIFT_BIC' | 'IFSC' | 'SORT_CODE' | 'BSB' | 'BLZ';
  routingIdentifierValue: string;
  ibanOrAccountNumber: string; // masked
  currency: string;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface BankChangeRequest {
  id: string;
  vendorId: string;
  applicationId: string;
  requestedAt: string;
  requestedBy: string;
  currentDetails: BankAccountDetails;
  proposedDetails: BankAccountDetails;
  status: 'PENDING_HOLD' | 'PHONE_VERIFIED' | 'APPROVED' | 'REJECTED';
  holdExpiresAt: string;
  verificationMethod?: 'TELEPHONE_CALLBACK' | 'DIRECT_VENDOR_MEET' | 'EXISTING_MFA';
  verificationNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface VendorApplication {
  id: string; // e.g. VND-2026-1001
  organizationId: string;
  vendorId: string;
  status: ApplicationStatus;
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  submittedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  
  // Step 1: Company Information
  company: {
    legalName: string;
    tradingName?: string;
    country: string; // ISO 2-letter
    businessRegistrationNumber: string;
    businessAddress: string;
    city: string;
    postalCode: string;
    website: string;
    industry: string;
    vendorCategory: string; // e.g. 'Raw Materials', 'Software / SaaS', 'Consulting', 'Logistics', 'Construction'
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  };

  // Step 2: Tax Information
  tax: {
    country: string;
    taxIdentifierType: string; // e.g. 'US EIN', 'UK VAT', 'DE USt-IdNr', 'IN GSTIN'
    taxIdentifierNumber: string;
    taxRegistrationStatus: 'ACTIVE' | 'PENDING' | 'EXEMPT';
    expiryDate?: string;
  };

  // Step 3: Banking Information
  banking: BankAccountDetails;

  // Step 4: Documents
  documents: VendorDocument[];

  // Validation Rules Evaluation
  validationResults: ValidationResult[];

  // Edge cases & Discrepancies
  discrepancies: {
    type: 'NAME_MISMATCH' | 'DUPLICATE_REGISTRATION' | 'EXPIRED_DOCUMENT' | 'SUSPICIOUS_BANK_CHANGE' | 'HIGH_RISK_WATCHLIST' | 'MISSING_MANDATORY_DOC';
    severity: RiskLevel;
    title: string;
    description: string;
    sourceFieldA: string;
    valueA: string;
    sourceFieldB: string;
    valueB: string;
    resolved: boolean;
    resolvedBy?: string;
    resolutionNotes?: string;
    relatedApplicationId?: string;
  }[];

  // Review Decisions
  decisionReason?: string;
  internalNotes?: string;
  manualOverridesCount: number;
}

export interface Vendor {
  id: string;
  organizationId: string;
  name: string;
  country: string;
  category: string;
  status: 'ACTIVE' | 'PENDING_ONBOARDING' | 'BLOCKED' | 'OFFBOARDED';
  riskLevel: RiskLevel;
  activeApplicationId: string;
  createdAt: string;
  totalSpendYTD?: number;
  paymentTerms: string;
  hasActiveBankChangeHold: boolean;
}

export interface FollowUpItem {
  id: string;
  applicationId: string;
  vendorName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  missingItems: string[];
  status: 'DRAFT' | 'SENT' | 'RESOLVED';
  sentAt?: string;
  sentBy?: string;
  responseReceivedAt?: string;
  securePortalUrl: string;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  poNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'READY_FOR_PAYMENT' | 'VARIANCE_FLAGGED' | 'PAID' | 'SCHEDULED' | 'REJECTED';
  matchingStatus: '3_WAY_MATCH_PASS' | 'PRICE_DISCREPANCY' | 'QUANTITY_DISCREPANCY' | 'RECEIPT_PENDING';
  poAmount: number;
  receivedAmount: number;
  varianceReason?: string;
  earlyDiscountTerms?: string;
  lineItems: Array<{ item: string; qty: number; unitPrice: number; total: number }>;
  paymentMethod: 'ACH' | 'WIRE' | 'SEPA' | 'VIRTUAL_CARD';
  paidAt?: string;
  paidBy?: string;
}

export interface VendorScorecard {
  vendorId: string;
  rating: number; // 1.0 to 5.0
  compositeScore: number; // 0 to 100 weighted index
  tier: 'STRATEGIC' | 'PREFERRED' | 'STANDARD' | 'PROBATION';
  onTimeDeliveryRate: number; // e.g. 98.5%
  invoiceAccuracyRate: number; // e.g. 99.2%
  slaAchievementRate: number; // e.g. 99.4%
  qualityScore: number; // 0 to 100
  slaScore: number; // 0 to 100
  complianceScore: number; // 0 to 100
  apAccuracyScore: number; // 0 to 100
  contractRenewalDate: string;
  activePurchaseOrders: number;
  totalInvoicedYTD: number;
  paymentTerms: string;
  activeBreachesCount: number;
  claimableServiceCredits: number;
}

export interface AuditEvent {
  id: string;
  organizationId: string;
  applicationId: string;
  vendorName: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  action: 
    | 'APPLICATION_SUBMITTED'
    | 'APPLICATION_DRAFT_SAVED'
    | 'VALIDATION_EVALUATED'
    | 'REVIEWER_CLAIMED'
    | 'REVIEWER_ASSIGNED'
    | 'REVIEWER_RELEASED'
    | 'INFORMATION_REQUESTED'
    | 'DOCUMENT_UPLOADED'
    | 'DOCUMENT_REPLACED'
    | 'DISCREPANCY_RESOLVED'
    | 'MANUAL_OVERRIDE_APPLIED'
    | 'APPLICATION_APPROVED'
    | 'APPLICATION_REJECTED'
    | 'APPLICATION_ESCALATED'
    | 'BANK_CHANGE_REQUESTED'
    | 'BANK_CHANGE_VERIFIED'
    | 'BANK_CHANGE_REJECTED'
    | 'CONFIG_UPDATED'
    | 'INVOICE_SUBMITTED'
    | 'INVOICE_3WAY_MATCHED'
    | 'INVOICE_VARIANCE_RESOLVED'
    | 'PAYMENT_BATCH_DISBURSED'
    | 'SLA_BREACH_LOGGED'
    | 'SERVICE_CREDIT_CLAIMED'
    | 'CIM_PLAN_CREATED'
    | 'CIM_PLAN_RESOLVED'
    | 'CONTRACT_RENEWAL_INITIATED';
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  evidence?: string;
  ipAddress?: string;
}

export interface CountryConfiguration {
  countryCode: string;
  countryName: string;
  taxIdentifierName: string;
  taxRegex: string;
  taxExample: string;
  businessRegRegex: string;
  businessRegExample: string;
  bankingIdentifierName: string;
  bankingIdentifierRegex: string;
  requiredDocuments: ('CERTIFICATE_OF_INCORPORATION' | 'TAX_REGISTRATION' | 'BANK_VERIFICATION_LETTER' | 'ISO_COMPLIANCE' | 'INSURANCE')[];
  requireTaxExpiry: boolean;
}

// --- ServiceNow-inspired Vendor Management Workspace Types ---

export interface ContractSlaTarget {
  id: string;
  name: string;
  target: number;
  unit: '%' | 'hours' | 'days';
  direction: 'MAXIMIZE' | 'MINIMIZE'; // e.g. Maximize Uptime %, Minimize incident resolution hours
  currentMetric: number;
  status: 'MET' | 'AT_RISK' | 'BREACHED';
  penaltyClause: string;
  penaltyPerUnit: number; // e.g. $500 per hr of breach
}

export interface VendorContract {
  id: string;
  contractNumber: string; // e.g. CTR-2026-4401
  vendorId: string;
  vendorName: string;
  title: string;
  status: 'ACTIVE' | 'PENDING_RENEWAL' | 'EXPIRED' | 'DRAFT';
  startDate: string;
  endDate: string;
  totalValue: number;
  spentYTD: number;
  currency: string;
  autoRenew: boolean;
  renewalNoticePeriodDays: number;
  slas: ContractSlaTarget[];
}

export interface SlaBreach {
  id: string;
  vendorId: string;
  vendorName: string;
  contractNumber: string;
  slaName: string;
  breachDate: string;
  targetThreshold: string;
  actualMetric: string;
  businessImpact: string;
  serviceCreditPenalty: number;
  currency: string;
  status: 'OPEN' | 'CREDIT_CLAIMED' | 'DISPUTED' | 'WAIVED';
  claimedAt?: string;
  claimedBy?: string;
  apCreditMemoId?: string;
}

export interface CorrectiveActionPlan {
  id: string; // e.g. CIM-2026-041
  vendorId: string;
  vendorName: string;
  title: string;
  issueDescription: string;
  requiredAction: string;
  severity: RiskLevel;
  status: 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'RESOLVED';
  assignedTo: string;
  vendorContact: string;
  createdAt: string;
  dueDate: string;
  resolvedAt?: string;
  resolutionSummary?: string;
}

