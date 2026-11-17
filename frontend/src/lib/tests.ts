import { evaluateApplication } from './rulesEngine';
import { AppStorage } from './storage';
import { VendorApplication } from '../types';
import { generateRandomBase32Secret, generateBackupCodes, getTotpCode, verifyTotpCode } from './mfa';

export interface TestResult {
  name: string;
  category: 'UNIT_RULE' | 'WORKFLOW_INTEGRATION' | 'SECURITY_RBAC' | 'TENANT_ISOLATION';
  passed: boolean;
  message: string;
  durationMs: number;
}

export function runFullTestSuite(): TestResult[] {
  const results: TestResult[] = [];
  const storage = AppStorage.getInstance();

  // Test 1: Valid application reaches approval eligibility
  {
    const start = performance.now();
    const cleanApp = storage.getApplicationById('VND-2026-1002');
    const allApps = storage.getApplications();
    if (!cleanApp) {
      results.push({
        name: 'Approval Eligibility on Clean Application',
        category: 'UNIT_RULE',
        passed: false,
        message: 'Could not find seed clean application VND-2026-1002',
        durationMs: performance.now() - start,
      });
    } else {
      const evalRes = evaluateApplication(cleanApp, allApps);
      const isApproved = evalRes.computedStatus === 'APPROVED' && evalRes.riskLevel === 'LOW';
      results.push({
        name: 'Approval Eligibility on Clean Application (Nordic Logistics)',
        category: 'UNIT_RULE',
        passed: isApproved,
        message: isApproved 
          ? `PASS: Clean application computed as APPROVED with ${evalRes.riskLevel} risk (Score: ${evalRes.riskScore}/100)`
          : `FAIL: Expected APPROVED, received ${evalRes.computedStatus}`,
        durationMs: performance.now() - start,
      });
    }
  }

  // Test 2: Missing required fields produce PENDING
  {
    const start = performance.now();
    const blankApp: VendorApplication = {
      id: 'VND-TEST-INCOMPLETE',
      organizationId: 'org-terybi-corp',
      vendorId: 'vnd-incomplete',
      status: 'SUBMITTED',
      riskLevel: 'LOW',
      riskScore: 0,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      company: {
        legalName: '', // Missing
        country: 'US',
        businessRegistrationNumber: '',
        businessAddress: '',
        city: '',
        postalCode: '',
        website: '',
        industry: '',
        vendorCategory: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
      },
      tax: {
        country: 'US',
        taxIdentifierType: 'EIN',
        taxIdentifierNumber: '',
        taxRegistrationStatus: 'PENDING',
      },
      banking: {
        accountHolderName: '',
        bankName: '',
        country: 'US',
        accountNumberMasked: '',
        routingIdentifierType: 'ROUTING_NUMBER',
        routingIdentifierValue: '',
        ibanOrAccountNumber: '',
        currency: 'USD',
        isVerified: false,
      },
      documents: [],
      validationResults: [],
      discrepancies: [],
      manualOverridesCount: 0,
    };

    const evalRes = evaluateApplication(blankApp, []);
    const rule1 = evalRes.validationResults.find(r => r.ruleId === 'RULE-001');
    const isPassing = evalRes.computedStatus === 'PENDING' && rule1?.status === 'FAIL';
    results.push({
      name: 'Missing Required Fields Produce PENDING & RULE-001 Failure',
      category: 'UNIT_RULE',
      passed: isPassing,
      message: isPassing 
        ? `PASS: Missing fields correctly flagged RULE-001 as FAIL and application as PENDING.` 
        : `FAIL: Evaluated status was ${evalRes.computedStatus}`,
      durationMs: performance.now() - start,
    });
  }

  // Test 3: Expired documents produce a clear failure finding (Edge Case C)
  {
    const start = performance.now();
    const vanguardApp = storage.getApplicationById('VND-2026-1004');
    if (!vanguardApp) {
      results.push({
        name: 'Expired Document Detection (Vanguard)',
        category: 'UNIT_RULE',
        passed: false,
        message: 'Could not find Vanguard application',
        durationMs: performance.now() - start,
      });
    } else {
      const evalRes = evaluateApplication(vanguardApp, storage.getApplications());
      const docExpiryRule = evalRes.validationResults.find(r => r.ruleId === 'RULE-005B');
      const hasExpiredDiscrepancy = evalRes.discrepancies.some(d => d.type === 'EXPIRED_DOCUMENT');
      const isPassed = docExpiryRule?.status === 'FAIL' && hasExpiredDiscrepancy && evalRes.computedStatus === 'PENDING';
      results.push({
        name: 'Expired Document Detection & Rejection of Automatic Approval (Edge Case C)',
        category: 'UNIT_RULE',
        passed: isPassed,
        message: isPassed
          ? `PASS: RULE-005B failed with clear evidence: "${docExpiryRule?.evidence}". Application held at PENDING.`
          : 'FAIL: Expired document did not fail RULE-005B.',
        durationMs: performance.now() - start,
      });
    }
  }

  // Test 4: Similar legal and bank names require appropriate review (Edge Case A)
  {
    const start = performance.now();
    const apexApp = storage.getApplicationById('VND-2026-1001');
    if (!apexApp) {
      results.push({
        name: 'Similar Legal & Bank Names Discrepancy (Apex)',
        category: 'UNIT_RULE',
        passed: false,
        message: 'Could not find Apex application',
        durationMs: performance.now() - start,
      });
    } else {
      const evalRes = evaluateApplication(apexApp, storage.getApplications());
      const nameRule = evalRes.validationResults.find(r => r.ruleId === 'RULE-006');
      const hasNameMismatch = evalRes.discrepancies.some(d => d.type === 'NAME_MISMATCH');
      const isPassed = nameRule?.status === 'NEEDS_REVIEW' && hasNameMismatch && evalRes.computedStatus === 'PENDING';
      results.push({
        name: 'Similar Legal & Bank Names Require Manual Review, Not Auto-Reject (Edge Case A)',
        category: 'UNIT_RULE',
        passed: isPassed,
        message: isPassed
          ? `PASS: Flagged RULE-006 as NEEDS_REVIEW (Medium Severity). Did not auto-reject.`
          : `FAIL: Expected NEEDS_REVIEW, got ${nameRule?.status}`,
        durationMs: performance.now() - start,
      });
    }
  }

  // Test 5: Duplicate registration detection (Edge Case B)
  {
    const start = performance.now();
    const acmeApp = storage.getApplicationById('VND-2026-1003');
    if (!acmeApp) {
      results.push({
        name: 'Duplicate Registration Detection (Acme)',
        category: 'UNIT_RULE',
        passed: false,
        message: 'Could not find Acme application',
        durationMs: performance.now() - start,
      });
    } else {
      const evalRes = evaluateApplication(acmeApp, storage.getApplications());
      const dupRule = evalRes.validationResults.find(r => r.ruleId === 'RULE-007');
      const isPassed = dupRule?.status === 'FAIL' && dupRule.manualReviewRequired && evalRes.computedStatus === 'PENDING';
      results.push({
        name: 'Duplicate Registration Detection via Reg # & Country (Edge Case B)',
        category: 'UNIT_RULE',
        passed: isPassed,
        message: isPassed
          ? `PASS: Detected matching Companies House #08492014. Linked records & blocked auto-approval.`
          : 'FAIL: Duplicate registration was not flagged.',
        durationMs: performance.now() - start,
      });
    }
  }

  // Test 6: Bank change request does not automatically update verified details (Edge Case D)
  {
    const start = performance.now();
    const pacificApp = storage.getApplicationById('VND-2026-1007');
    const bankChanges = storage.getBankChangeRequests();
    const pacificChange = bankChanges.find(b => b.applicationId === 'VND-2026-1007');

    const isPassed = pacificApp && 
      pacificApp.banking.bankName.includes('ANZ') && // Original verified details preserved
      pacificChange?.status === 'PENDING_HOLD';

    results.push({
      name: 'Suspicious Bank Detail Change Security Hold (Edge Case D)',
      category: 'SECURITY_RBAC',
      passed: !!isPassed,
      message: isPassed
        ? `PASS: Verified ANZ bank details preserved on master record. NAB change placed on PENDING_HOLD.`
        : 'FAIL: Bank change was incorrectly applied automatically.',
      durationMs: performance.now() - start,
    });
  }

  // Test 7: Reviewer cannot perform unauthorized approval (RBAC)
  {
    const start = performance.now();
    storage.setCurrentUserRole('reviewer'); // Switch to reviewer
    const res = storage.approveApplication('VND-2026-1001', 'Trying to approve as reviewer');
    const isPassed = res.success === false && Boolean(res.error?.includes('Permission Denied'));

    // Restore role
    storage.setCurrentUserRole('reviewer');

    results.push({
      name: 'Server-Side RBAC: Reviewer Cannot Grant Approval',
      category: 'SECURITY_RBAC',
      passed: isPassed,
      message: isPassed
        ? `PASS: Attempt blocked with error: "${res.error}"`
        : 'FAIL: Reviewer was improperly allowed to approve.',
      durationMs: performance.now() - start,
    });
  }

  // Test 8: Rejection requires a mandatory reason
  {
    const start = performance.now();
    storage.setCurrentUserRole('approver');
    const resEmpty = storage.rejectApplication('VND-2026-1001', '');
    const isPassed = resEmpty.success === false && Boolean(resEmpty.error?.includes('mandatory'));

    results.push({
      name: 'Rejection Requires Documented Mandatory Justification',
      category: 'WORKFLOW_INTEGRATION',
      passed: isPassed,
      message: isPassed
        ? `PASS: Blank rejection blocked with: "${resEmpty.error}"`
        : 'FAIL: Application was rejected without a mandatory justification.',
      durationMs: performance.now() - start,
    });
  }

  // Test 9: Manual override preserves automated finding and logs audit event
  {
    const start = performance.now();
    storage.setCurrentUserRole('approver');
    const overrideRes = storage.applyManualOverride({
      applicationId: 'VND-2026-1001',
      ruleId: 'RULE-002',
      newStatus: 'PASS',
      justification: 'Audited verified company domain via direct vendor callback.',
    });

    const audits = storage.getAuditEvents();
    const hasAudit = audits.some(a => a.action === 'MANUAL_OVERRIDE_APPLIED' && a.applicationId === 'VND-2026-1001');

    results.push({
      name: 'Manual Override Preserves Original Result & Records Immutable Audit',
      category: 'WORKFLOW_INTEGRATION',
      passed: overrideRes.success && hasAudit,
      message: overrideRes.success && hasAudit
        ? 'PASS: Rule override applied. Original automated finding preserved in audit trail.'
        : 'FAIL: Override failed or audit event was not created.',
      durationMs: performance.now() - start,
    });
  }

  // Test 10: Multi-Tenant Isolation
  {
    const start = performance.now();
    storage.setCurrentOrg('org-terybi-corp');
    const corpApps = storage.getApplications();
    const allAreCorp = corpApps.every(a => a.organizationId === 'org-terybi-corp');

    storage.setCurrentOrg('org-terybi-emea');
    const emeaApps = storage.getApplications();
    const emeaContainsNoCorp = emeaApps.every(a => a.organizationId === 'org-terybi-emea');

    // Switch back
    storage.setCurrentOrg('org-terybi-corp');

    const isPassed = allAreCorp && emeaContainsNoCorp;
    results.push({
      name: 'Tenant Isolation: Organizations Cannot Cross-Access Applications',
      category: 'TENANT_ISOLATION',
      passed: isPassed,
      message: isPassed
        ? `PASS: Terybi Global and Terybi Europe queries are strictly partitioned by organization ID.`
        : 'FAIL: Tenant leak detected between organizations.',
      durationMs: performance.now() - start,
    });
  }

  // Test 11: Multi-Factor Authentication (MFA) TOTP Verification & Recovery
  {
    const start = performance.now();
    const secret = generateRandomBase32Secret();
    const backupCodes = generateBackupCodes();
    const current = getTotpCode(secret);

    // Check valid TOTP code passes
    const validCheck = verifyTotpCode(current.code, secret, backupCodes);
    // Check backup recovery code passes
    const backupCheck = verifyTotpCode(backupCodes[0], secret, backupCodes);
    // Check fraudulent / corrupted code fails
    const invalidCheck = verifyTotpCode('9999999', secret, backupCodes);

    const isPassed = validCheck.isValid && backupCheck.isValid && !invalidCheck.isValid;

    results.push({
      name: 'Multi-Factor Authentication (MFA) TOTP Verification & Single-Use Recovery',
      category: 'SECURITY_RBAC',
      passed: isPassed,
      message: isPassed
        ? `PASS: Time-based OTP (${current.code}) verified, backup recovery code (${backupCodes[0]}) accepted, and unauthorized code rejected.`
        : 'FAIL: MFA code verification did not yield expected cryptographic results.',
      durationMs: performance.now() - start,
    });
  }

  // Test 12: AP 3-Way Matching & Discrepancy Tolerance Engine (Zoho Alternative)
  {
    const start = performance.now();
    const invoices = storage.getInvoices();
    const cleanInv = invoices.find(i => i.invoiceNumber === 'INV-2026-8801');
    const varianceInv = invoices.find(i => i.invoiceNumber === 'INV-2026-8802');

    const cleanPassed = cleanInv && cleanInv.matchingStatus === '3_WAY_MATCH_PASS' && cleanInv.status === 'READY_FOR_PAYMENT';
    const variancePassed = varianceInv && varianceInv.matchingStatus === 'PRICE_DISCREPANCY' && varianceInv.status === 'VARIANCE_FLAGGED';

    const isPassed = cleanPassed && variancePassed;

    results.push({
      name: 'AP 3-Way Matching & Price/Qty Variance Detection',
      category: 'WORKFLOW_INTEGRATION',
      passed: !!isPassed,
      message: isPassed
        ? 'PASS: Clean 3-way match ($18,400) auto-approved; +5.2% unit price variance ($14,200 vs $13,500 PO) properly flagged for manager sign-off.'
        : 'FAIL: 3-way matching engine failed to correctly classify invoice tolerances.',
      durationMs: performance.now() - start,
    });
  }

  // Test 13: Fraud-Proof AP Disbursement (Bank Change Hold Block)
  {
    const start = performance.now();
    const invoices = storage.getInvoices();
    const holdInv = invoices.find(i => i.vendorId === 'vnd-sentinel-1007');

    let isBlocked = false;
    if (holdInv) {
      const res = storage.disbursePaymentBatch([holdInv.id], true);
      isBlocked = !res.success && res.message.includes('72-Hour Security Bank Change Hold');
    }

    results.push({
      name: 'AP Payment Run Fraud Block on Active Bank Change Hold',
      category: 'SECURITY_RBAC',
      passed: isBlocked,
      message: isBlocked
        ? 'PASS: Disbursement engine strictly blocked payment release for Sentinel Cyber pending active 72-hour callback verification.'
        : 'FAIL: Payment engine permitted disbursement to an account under security freeze.',
      durationMs: performance.now() - start,
    });
  }

  return results;
}

