import { 
  VendorApplication, 
  ValidationResult, 
  CountryConfiguration, 
  RiskLevel, 
  ApplicationStatus,
  RuleStatus
} from '../types';

export const CURRENT_SYSTEM_DATE = '2026-10-27';

export const DEFAULT_COUNTRY_CONFIGS: Record<string, CountryConfiguration> = {
  US: {
    countryCode: 'US',
    countryName: 'United States',
    taxIdentifierName: 'Employer Identification Number (EIN)',
    taxRegex: '^\\d{2}-\\d{7}$',
    taxExample: '12-3456789',
    businessRegRegex: '^[A-Z0-9-]{6,12}$',
    businessRegExample: 'DEL-928401',
    bankingIdentifierName: 'ABA Routing Transit Number',
    bankingIdentifierRegex: '^\\d{9}$',
    requiredDocuments: ['CERTIFICATE_OF_INCORPORATION', 'TAX_REGISTRATION', 'BANK_VERIFICATION_LETTER'],
    requireTaxExpiry: false,
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    taxIdentifierName: 'Value Added Tax (VAT)',
    taxRegex: '^(GB)?\\d{9}$',
    taxExample: 'GB982740192',
    businessRegRegex: '^(\\d{8}|[A-Z]{2}\\d{6})$',
    businessRegExample: '08492014',
    bankingIdentifierName: 'Sort Code (6 digits) or IBAN',
    bankingIdentifierRegex: '^(\\d{6}|GB\\d{2}[A-Z]{4}\\d{14})$',
    requiredDocuments: ['CERTIFICATE_OF_INCORPORATION', 'TAX_REGISTRATION', 'BANK_VERIFICATION_LETTER'],
    requireTaxExpiry: false,
  },
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    taxIdentifierName: 'Goods and Services Tax ID (GSTIN)',
    taxRegex: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$',
    taxExample: '27AABCA1234F1Z8',
    businessRegRegex: '^[UL]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$',
    businessRegExample: 'U72200MH2018PTC318290',
    bankingIdentifierName: 'IFSC Code',
    bankingIdentifierRegex: '^[A-Z]{4}0[A-Z0-9]{6}$',
    requiredDocuments: ['CERTIFICATE_OF_INCORPORATION', 'TAX_REGISTRATION', 'BANK_VERIFICATION_LETTER'],
    requireTaxExpiry: true,
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    taxIdentifierName: 'Umsatzsteuer-Identifikationsnummer (USt-IdNr)',
    taxRegex: '^(DE)?\\d{9}$',
    taxExample: 'DE123456789',
    businessRegRegex: '^(HRB|HRA)\\s?\\d{4,7}$',
    businessRegExample: 'HRB 89234',
    bankingIdentifierName: 'IBAN (DE + 20 digits)',
    bankingIdentifierRegex: '^DE\\d{20}$',
    requiredDocuments: ['CERTIFICATE_OF_INCORPORATION', 'TAX_REGISTRATION', 'BANK_VERIFICATION_LETTER'],
    requireTaxExpiry: true,
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    taxIdentifierName: 'Australian Business Number (ABN)',
    taxRegex: '^\\d{11}$',
    taxExample: '51824753556',
    businessRegRegex: '^\\d{9}$',
    businessRegExample: '004085616',
    bankingIdentifierName: 'BSB Number',
    bankingIdentifierRegex: '^\\d{6}$',
    requiredDocuments: ['CERTIFICATE_OF_INCORPORATION', 'TAX_REGISTRATION', 'BANK_VERIFICATION_LETTER'],
    requireTaxExpiry: false,
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    taxIdentifierName: 'Business Number (CRA BN9 / RT0001)',
    taxRegex: '^\\d{9}(RT\\d{4})?$',
    taxExample: '123456789RT0001',
    businessRegRegex: '^\\d{7,10}$',
    businessRegExample: '7829401',
    bankingIdentifierName: 'Transit & Institution Number',
    bankingIdentifierRegex: '^\\d{8,9}$',
    requiredDocuments: ['CERTIFICATE_OF_INCORPORATION', 'TAX_REGISTRATION', 'BANK_VERIFICATION_LETTER'],
    requireTaxExpiry: false,
  },
  FI: {
    countryCode: 'FI',
    countryName: 'Finland',
    taxIdentifierName: 'ALV-numero (FI VAT)',
    taxRegex: '^(FI)?\\d{8}$',
    taxExample: 'FI12345678',
    businessRegRegex: '^\\d{7}-\\d$',
    businessRegExample: '1234567-8',
    bankingIdentifierName: 'IBAN (FI + 16 digits)',
    bankingIdentifierRegex: '^FI\\d{16}$',
    requiredDocuments: ['CERTIFICATE_OF_INCORPORATION', 'TAX_REGISTRATION', 'BANK_VERIFICATION_LETTER'],
    requireTaxExpiry: false,
  },
  JP: {
    countryCode: 'JP',
    countryName: 'Japan',
    taxIdentifierName: 'Corporate Number (Hōjin Bangō)',
    taxRegex: '^\\d{13}$',
    taxExample: '1234567890123',
    businessRegRegex: '^\\d{12,13}$',
    businessRegExample: '1234567890123',
    bankingIdentifierName: 'Bank & Branch Code',
    bankingIdentifierRegex: '^\\d{7}$',
    requiredDocuments: ['CERTIFICATE_OF_INCORPORATION', 'TAX_REGISTRATION', 'BANK_VERIFICATION_LETTER'],
    requireTaxExpiry: false,
  }
};

/**
 * Normalizes corporate names by stripping common legal entity suffixes
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\b(private|limited|ltd|pvt|corp|corporation|inc|incorporated|gmbh|oy|pty|llc|plc|sa|sarl|bv|nv)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Levenshtein distance similarity calculation (0.0 to 1.0)
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1.trim().toLowerCase() === str2.trim().toLowerCase()) return 1.0;
  const s1 = normalizeCompanyName(str1);
  const s2 = normalizeCompanyName(str2);
  
  if (s1 === s2) return 0.88;
  if (!s1 || !s2) return 0.0;
  
  // Check token containment
  const tokens1 = new Set(s1.split(' '));
  const tokens2 = new Set(s2.split(' '));
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);
  const jaccard = intersection.size / union.size;
  
  // Matrix distance
  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  const maxLen = Math.max(s1.length, s2.length);
  const levScore = (maxLen - track[s2.length][s1.length]) / maxLen;

  return Math.max(jaccard, levScore);
}

/**
 * Deterministic Explainable Rules Engine
 */
export function evaluateApplication(
  app: VendorApplication,
  allApplicationsInTenant: VendorApplication[] = [],
  configs: Record<string, CountryConfiguration> = DEFAULT_COUNTRY_CONFIGS
): {
  validationResults: ValidationResult[];
  computedStatus: ApplicationStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  discrepancies: VendorApplication['discrepancies'];
} {
  const results: ValidationResult[] = [];
  const discrepancies: VendorApplication['discrepancies'] = [];
  const evalDate = CURRENT_SYSTEM_DATE;
  const config = configs[app.company.country] || configs['US'];

  // Check 1: Required-field completeness
  const missingFields: string[] = [];
  if (!app.company.legalName?.trim()) missingFields.push('Company Legal Name');
  if (!app.company.country) missingFields.push('Country of Registration');
  if (!app.company.businessRegistrationNumber?.trim()) missingFields.push('Business Registration Number');
  if (!app.company.businessAddress?.trim()) missingFields.push('Business Address');
  if (!app.company.contactName?.trim()) missingFields.push('Contact Person Name');
  if (!app.company.contactEmail?.trim()) missingFields.push('Business Email');
  if (!app.tax.taxIdentifierNumber?.trim()) missingFields.push('Tax ID Number');
  if (!app.banking.accountHolderName?.trim()) missingFields.push('Bank Account Holder Name');
  if (!app.banking.bankName?.trim()) missingFields.push('Bank Name');
  if (!app.banking.ibanOrAccountNumber?.trim()) missingFields.push('Bank Account Number / IBAN');

  results.push({
    ruleId: 'RULE-001',
    ruleName: 'Required-Field Completeness',
    category: 'COMPLETENESS',
    status: missingFields.length === 0 ? 'PASS' : 'FAIL',
    severity: missingFields.length === 0 ? 'LOW' : 'HIGH',
    evidence: missingFields.length === 0 
      ? 'All mandatory enterprise profile fields are provided.'
      : `Missing mandatory fields: ${missingFields.join(', ')}`,
    explanation: missingFields.length === 0
      ? 'Vendor registration meets the mandatory baseline submission schema.'
      : 'Procurement policy forbids onboarding submissions with missing primary identity or banking parameters.',
    recommendedAction: missingFields.length === 0
      ? 'Proceed to identity and document validation.'
      : 'Issue a structured follow-up request to the vendor requesting missing fields.',
    manualReviewRequired: missingFields.length > 0,
    fieldAffected: missingFields.join(', '),
    evaluatedAt: evalDate,
  });

  // Check 2: Email & Phone format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(app.company.contactEmail || '');
  const isPhoneValid = (app.company.contactPhone || '').replace(/[^0-9]/g, '').length >= 7;

  results.push({
    ruleId: 'RULE-002',
    ruleName: 'Contact Information Format & Domain Validity',
    category: 'IDENTITY',
    status: (isEmailValid && isPhoneValid) ? 'PASS' : 'WARNING',
    severity: (isEmailValid && isPhoneValid) ? 'LOW' : 'MEDIUM',
    evidence: `Email: "${app.company.contactEmail || 'N/A'}" (Valid: ${isEmailValid}), Phone: "${app.company.contactPhone || 'N/A'}" (Valid: ${isPhoneValid})`,
    explanation: (isEmailValid && isPhoneValid)
      ? 'Contact details conform to corporate communication standards.'
      : 'The provided email or phone does not match standard international format. Generic or mistyped contacts increase communication turnaround.',
    recommendedAction: (isEmailValid && isPhoneValid)
      ? 'No action required.'
      : 'Confirm primary contact email domain with corporate registrar.',
    manualReviewRequired: !isEmailValid,
    fieldAffected: 'company.contactEmail, company.contactPhone',
    evaluatedAt: evalDate,
  });

  // Check 3: Country-specific tax ID format validation
  const taxRegex = new RegExp(config.taxRegex || '.*', 'i');
  const isTaxFormatValid = taxRegex.test(app.tax.taxIdentifierNumber || '');

  results.push({
    ruleId: 'RULE-003',
    ruleName: `Tax ID Format Validation (${config.taxIdentifierName})`,
    category: 'TAX',
    status: isTaxFormatValid ? 'PASS' : 'FAIL',
    severity: isTaxFormatValid ? 'LOW' : 'HIGH',
    evidence: `Submitted Tax Number: "${app.tax.taxIdentifierNumber}". Expected Format Regex: ${config.taxRegex} (Example: ${config.taxExample})`,
    explanation: isTaxFormatValid
      ? `Tax identifier structure matches ${config.countryName} official format conventions.`
      : `The tax identification number does not conform to the national format for ${config.countryName} (${config.taxIdentifierName}). Note: Format validation verifies syntax, not authority registration status.`,
    recommendedAction: isTaxFormatValid
      ? 'Inspect supporting tax certificate to verify active status.'
      : 'Ask vendor for updated tax registration documentation with correct national identifier format.',
    manualReviewRequired: !isTaxFormatValid,
    fieldAffected: 'tax.taxIdentifierNumber',
    evaluatedAt: evalDate,
  });

  // Check 4: Business registration number format
  let isRegValid = true;
  if (config.businessRegRegex) {
    const regRegex = new RegExp(config.businessRegRegex, 'i');
    isRegValid = regRegex.test(app.company.businessRegistrationNumber || '');
  }
  results.push({
    ruleId: 'RULE-004',
    ruleName: 'Business Registration Identifier Structure',
    category: 'IDENTITY',
    status: isRegValid ? 'PASS' : 'WARNING',
    severity: isRegValid ? 'LOW' : 'MEDIUM',
    evidence: `Registration: "${app.company.businessRegistrationNumber}". Expected Pattern: ${config.businessRegExample}`,
    explanation: isRegValid
      ? 'Commercial registration number matches jurisdictional pattern.'
      : `Registration number format deviates from expected ${config.countryName} pattern. Requires verification against Certificate of Incorporation.`,
    recommendedAction: isRegValid ? 'Proceed to corporate entity checks.' : 'Cross-check with Certificate of Incorporation document.',
    manualReviewRequired: !isRegValid,
    fieldAffected: 'company.businessRegistrationNumber',
    evaluatedAt: evalDate,
  });

  // Check 5: Document presence and expiry (Edge Case C)
  const requiredDocs = config.requiredDocuments || ['CERTIFICATE_OF_INCORPORATION', 'TAX_REGISTRATION', 'BANK_VERIFICATION_LETTER'];
  const uploadedCategories = new Set(app.documents.map(d => d.category));
  const missingDocs = requiredDocs.filter(req => !uploadedCategories.has(req));

  const expiredDocs = app.documents.filter(d => {
    if (!d.expiryDate) return false;
    return d.expiryDate < evalDate;
  });

  if (missingDocs.length > 0) {
    results.push({
      ruleId: 'RULE-005A',
      ruleName: 'Mandatory Compliance Documents Uploaded',
      category: 'COMPLIANCE',
      status: 'FAIL',
      severity: 'HIGH',
      evidence: `Missing mandatory document categories: ${missingDocs.join(', ')}`,
      explanation: 'Policy requires verified files for Certificate of Incorporation, Tax Registration, and Bank Proof before activation.',
      recommendedAction: 'Request vendor upload missing statutory documentation.',
      manualReviewRequired: true,
      fieldAffected: 'documents',
      evaluatedAt: evalDate,
    });
    discrepancies.push({
      type: 'MISSING_MANDATORY_DOC',
      severity: 'HIGH',
      title: 'Missing Mandatory Documents',
      description: `Missing required files: ${missingDocs.join(', ')}`,
      sourceFieldA: 'Required Documents Policy',
      valueA: requiredDocs.join(', '),
      sourceFieldB: 'Uploaded Documents',
      valueB: Array.from(uploadedCategories).join(', ') || 'None',
      resolved: false,
    });
  } else {
    results.push({
      ruleId: 'RULE-005A',
      ruleName: 'Mandatory Compliance Documents Uploaded',
      category: 'COMPLIANCE',
      status: 'PASS',
      severity: 'LOW',
      evidence: `All required documents present (${app.documents.length} files attached).`,
      explanation: 'All mandatory compliance and registration documents have been uploaded.',
      recommendedAction: 'Verify document authentications and validity periods.',
      manualReviewRequired: false,
      fieldAffected: 'documents',
      evaluatedAt: evalDate,
    });
  }

  // Document expiry check (Edge Case C)
  if (expiredDocs.length > 0) {
    const expiredSummary = expiredDocs.map(d => `${d.fileName} (expired ${d.expiryDate})`).join('; ');
    results.push({
      ruleId: 'RULE-005B',
      ruleName: 'Compliance Document Validity & Expiration',
      category: 'COMPLIANCE',
      status: 'FAIL',
      severity: 'HIGH',
      evidence: `Expired documents detected: ${expiredSummary}. Current system date: ${evalDate}`,
      explanation: 'One or more mandatory compliance or tax exemption certificates have elapsed their active validity date.',
      recommendedAction: 'Set application status to PENDING. Trigger automated request for renewed certificate of compliance.',
      manualReviewRequired: true,
      fieldAffected: 'documents.expiryDate',
      evaluatedAt: evalDate,
    });
    discrepancies.push({
      type: 'EXPIRED_DOCUMENT',
      severity: 'HIGH',
      title: 'Expired Compliance Document',
      description: `Expired: ${expiredSummary}`,
      sourceFieldA: 'Current Date',
      valueA: evalDate,
      sourceFieldB: 'Document Expiration Dates',
      valueB: expiredDocs.map(d => `${d.fileName}: ${d.expiryDate}`).join(', '),
      resolved: false,
    });
  } else {
    results.push({
      ruleId: 'RULE-005B',
      ruleName: 'Compliance Document Validity & Expiration',
      category: 'COMPLIANCE',
      status: 'PASS',
      severity: 'LOW',
      evidence: 'No submitted documents have past expiration dates.',
      explanation: 'All uploaded certificates and licenses are within their authorized active validity period.',
      recommendedAction: 'Schedule reminder 60 days prior to earliest document renewal date.',
      manualReviewRequired: false,
      fieldAffected: 'documents.expiryDate',
      evaluatedAt: evalDate,
    });
  }

  // Check 6: Legal company name vs Bank account holder name (Edge Case A)
  const legalName = app.company.legalName || '';
  const bankAccountName = app.banking.accountHolderName || '';
  const nameSimilarity = calculateStringSimilarity(legalName, bankAccountName);

  if (nameSimilarity === 1.0) {
    results.push({
      ruleId: 'RULE-006',
      ruleName: 'Legal Entity vs Bank Account Holder Name Match',
      category: 'IDENTITY',
      status: 'PASS',
      severity: 'LOW',
      evidence: `Legal Name: "${legalName}" == Bank Account Name: "${bankAccountName}" (100% token & semantic match)`,
      explanation: 'The beneficiary bank account holder exactly matches the registered legal entity name.',
      recommendedAction: 'Direct disbursement authorization approved.',
      manualReviewRequired: false,
      fieldAffected: 'banking.accountHolderName',
      evaluatedAt: evalDate,
    });
  } else if (nameSimilarity >= 0.7) {
    results.push({
      ruleId: 'RULE-006',
      ruleName: 'Legal Entity vs Bank Account Holder Name Match',
      category: 'IDENTITY',
      status: 'NEEDS_REVIEW',
      severity: 'MEDIUM',
      evidence: `Legal Name: "${legalName}" vs Bank Account Name: "${bankAccountName}" (Similarity: ${(nameSimilarity * 100).toFixed(1)}%)`,
      explanation: 'Similar names with minor corporate suffix omission or trading alias (Edge Case A). Do not automatically reject; requires reviewer confirmation with supporting bank letter or DBA documentation.',
      recommendedAction: 'Review bank statement or verification letter to confirm beneficial ownership before approval.',
      manualReviewRequired: true,
      fieldAffected: 'banking.accountHolderName',
      evaluatedAt: evalDate,
    });
    discrepancies.push({
      type: 'NAME_MISMATCH',
      severity: 'MEDIUM',
      title: 'Company Legal Name vs Bank Account Holder Discrepancy',
      description: `Legal entity is registered as "${legalName}" but payment instructions designate "${bankAccountName}".`,
      sourceFieldA: 'Company Legal Name',
      valueA: legalName,
      sourceFieldB: 'Bank Account Holder Name',
      valueB: bankAccountName,
      resolved: false,
    });
  } else {
    results.push({
      ruleId: 'RULE-006',
      ruleName: 'Legal Entity vs Bank Account Holder Name Match',
      category: 'IDENTITY',
      status: 'FAIL',
      severity: 'HIGH',
      evidence: `Severe Name Divergence: "${legalName}" vs "${bankAccountName}" (Similarity: ${(nameSimilarity * 100).toFixed(1)}%)`,
      explanation: 'Beneficiary account holder name does not align with the registered entity. Significant risk of 3rd-party diversion.',
      recommendedAction: 'Block automatic approval. Require bank confirmation letter directly from institutional financial officer.',
      manualReviewRequired: true,
      fieldAffected: 'banking.accountHolderName',
      evaluatedAt: evalDate,
    });
    discrepancies.push({
      type: 'NAME_MISMATCH',
      severity: 'HIGH',
      title: 'Significant Account Holder Discrepancy',
      description: `Beneficiary name "${bankAccountName}" severely conflicts with registered entity "${legalName}".`,
      sourceFieldA: 'Company Legal Name',
      valueA: legalName,
      sourceFieldB: 'Bank Account Holder Name',
      valueB: bankAccountName,
      resolved: false,
    });
  }

  // Check 7: Duplicate applications based on registration number and country (Edge Case B)
  const duplicateApps = allApplicationsInTenant.filter(other => 
    other.id !== app.id &&
    other.company.country === app.company.country &&
    other.company.businessRegistrationNumber.trim().toLowerCase() === app.company.businessRegistrationNumber.trim().toLowerCase()
  );

  if (duplicateApps.length > 0) {
    const dupDetails = duplicateApps.map(d => `${d.id} ("${d.company.legalName}", contact: ${d.company.contactEmail})`).join(', ');
    results.push({
      ruleId: 'RULE-007',
      ruleName: 'Duplicate Entity Registration Detection',
      category: 'DUPLICATE',
      status: 'FAIL',
      severity: 'HIGH',
      evidence: `Identical Registration # "${app.company.businessRegistrationNumber}" in ${app.company.country} matches existing application: ${dupDetails}`,
      explanation: 'Two applications share the same jurisdiction and corporate registration number under differing contact emails. Prevent automatic approval to protect against duplicate vendor records.',
      recommendedAction: 'Authorized reviewer must review both records and either link, merge, or reject redundant filing.',
      manualReviewRequired: true,
      fieldAffected: 'company.businessRegistrationNumber',
      evaluatedAt: evalDate,
    });
    discrepancies.push({
      type: 'DUPLICATE_REGISTRATION',
      severity: 'HIGH',
      title: 'Potential Duplicate Vendor Registration',
      description: `Registration #${app.company.businessRegistrationNumber} is already registered to ${dupDetails}.`,
      sourceFieldA: `Current Application (${app.id})`,
      valueA: `${app.company.legalName} (${app.company.contactEmail})`,
      sourceFieldB: `Existing Record (${duplicateApps[0].id})`,
      valueB: `${duplicateApps[0].company.legalName} (${duplicateApps[0].company.contactEmail})`,
      resolved: false,
      relatedApplicationId: duplicateApps[0].id,
    });
  } else {
    results.push({
      ruleId: 'RULE-007',
      ruleName: 'Duplicate Entity Registration Detection',
      category: 'DUPLICATE',
      status: 'PASS',
      severity: 'LOW',
      evidence: `Registration number "${app.company.businessRegistrationNumber}" is unique within ${app.company.country} registry.`,
      explanation: 'No duplicate corporate registration number found across the vendor repository.',
      recommendedAction: 'Proceed with standard onboarding workflow.',
      manualReviewRequired: false,
      fieldAffected: 'company.businessRegistrationNumber',
      evaluatedAt: evalDate,
    });
  }

  // Check 8: Duplicate or reused bank account identifiers
  const duplicateBankApps = allApplicationsInTenant.filter(other =>
    other.id !== app.id &&
    other.banking.ibanOrAccountNumber &&
    other.banking.ibanOrAccountNumber.replace(/[\s-]/g, '').toLowerCase() === app.banking.ibanOrAccountNumber.replace(/[\s-]/g, '').toLowerCase()
  );

  if (duplicateBankApps.length > 0) {
    results.push({
      ruleId: 'RULE-008',
      ruleName: 'Bank Account Uniqueness & Segregation',
      category: 'BANKING',
      status: 'FAIL',
      severity: 'HIGH',
      evidence: `Bank account identifier is identical to existing vendor: ${duplicateBankApps[0].id} (${duplicateBankApps[0].company.legalName})`,
      explanation: 'The provided bank account identifier is linked to another registered vendor. Reused accounts present heightened fraud risk.',
      recommendedAction: 'Verify corporate group ownership or require segregated payment account.',
      manualReviewRequired: true,
      fieldAffected: 'banking.ibanOrAccountNumber',
      evaluatedAt: evalDate,
    });
  } else {
    results.push({
      ruleId: 'RULE-008',
      ruleName: 'Bank Account Uniqueness & Segregation',
      category: 'BANKING',
      status: 'PASS',
      severity: 'LOW',
      evidence: 'Bank account number/IBAN is unique within organization vendor master.',
      explanation: 'No other vendor is configured with these disbursement coordinates.',
      recommendedAction: 'No action required.',
      manualReviewRequired: false,
      fieldAffected: 'banking.ibanOrAccountNumber',
      evaluatedAt: evalDate,
    });
  }

  // Check 9: Country and banking identifier consistency
  const bankIdentifierValue = (app.banking.routingIdentifierValue || '').trim();
  const bankIdRegex = new RegExp(config.bankingIdentifierRegex || '.*', 'i');
  const isBankIdValid = bankIdRegex.test(bankIdentifierValue);

  results.push({
    ruleId: 'RULE-009',
    ruleName: `Jurisdictional Banking Identifier Consistency (${config.bankingIdentifierName})`,
    category: 'BANKING',
    status: isBankIdValid ? 'PASS' : 'WARNING',
    severity: isBankIdValid ? 'LOW' : 'MEDIUM',
    evidence: `Provided: "${bankIdentifierValue}" against expected pattern for ${config.countryName} (${config.bankingIdentifierName})`,
    explanation: isBankIdValid
      ? `Routing/clearing code conforms to national clearing system rules for ${config.countryName}.`
      : `The routing/clearing code fails standard check for ${config.bankingIdentifierName}.`,
    recommendedAction: isBankIdValid ? 'Verify bank letter.' : 'Request correct national clearing code from vendor.',
    manualReviewRequired: !isBankIdValid,
    fieldAffected: 'banking.routingIdentifierValue',
    evaluatedAt: evalDate,
  });

  // Check 10: Conflicting information across submitted fields & extracted document data
  let docDataConflict = false;
  let conflictEvidence = '';
  for (const doc of app.documents) {
    if (doc.extractedData) {
      if (doc.extractedData.taxIdentifier && app.tax.taxIdentifierNumber) {
        const cleanExtracted = doc.extractedData.taxIdentifier.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
        const cleanSubmitted = app.tax.taxIdentifierNumber.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
        if (cleanExtracted !== cleanSubmitted) {
          docDataConflict = true;
          conflictEvidence += `Tax ID mismatch on ${doc.fileName} (Extracted: ${doc.extractedData.taxIdentifier} vs Form: ${app.tax.taxIdentifierNumber}). `;
        }
      }
    }
  }

  results.push({
    ruleId: 'RULE-010',
    ruleName: 'Cross-Document & Form Field Consistency',
    category: 'COMPLIANCE',
    status: docDataConflict ? 'WARNING' : 'PASS',
    severity: docDataConflict ? 'MEDIUM' : 'LOW',
    evidence: docDataConflict ? conflictEvidence : 'No structural contradictions between document extractions and submitted application data.',
    explanation: docDataConflict
      ? 'Document extraction revealed divergent tax numbers or entity identifiers compared to the web form. Extracted data is unverified until reviewed.'
      : 'Submitted profile fields are congruent with uploaded supporting certificates.',
    recommendedAction: docDataConflict ? 'Compare uploaded document scan with submitted data in Side-by-Side review.' : 'Proceed to risk scoring.',
    manualReviewRequired: docDataConflict,
    fieldAffected: 'documents.extractedData',
    evaluatedAt: evalDate,
  });

  // Check 11: Missing verification evidence
  const bankProofDoc = app.documents.find(d => d.category === 'BANK_VERIFICATION_LETTER');
  const hasBankProof = !!bankProofDoc;

  results.push({
    ruleId: 'RULE-011',
    ruleName: 'Independent Bank Verification Evidence',
    category: 'BANKING',
    status: hasBankProof ? 'PASS' : 'FAIL',
    severity: hasBankProof ? 'LOW' : 'HIGH',
    evidence: hasBankProof
      ? `Bank proof document present: "${bankProofDoc?.fileName}" (Verification: ${bankProofDoc?.verificationSource || 'UNVERIFIED'})`
      : 'No voided check or bank confirmation letter attached.',
    explanation: hasBankProof
      ? 'Independent bank verification document is present for manual verification.'
      : 'Disbursement instructions cannot be certified without an institutional bank confirmation letter or voided check.',
    recommendedAction: hasBankProof ? 'Confirm bank account details on document scan.' : 'Request bank letter with institutional letterhead.',
    manualReviewRequired: !hasBankProof,
    fieldAffected: 'banking',
    evaluatedAt: evalDate,
  });

  // Check 12: Configurable manual-review triggers & High Risk Watchlist
  const isHighRiskCategory = ['Construction', 'Chemicals', 'Defense', 'High-Risk Materials'].includes(app.company.vendorCategory);
  const isWatchlistFlagged = app.discrepancies.some(d => d.type === 'HIGH_RISK_WATCHLIST');

  if (isWatchlistFlagged) {
    results.push({
      ruleId: 'RULE-012',
      ruleName: 'Enhanced Due Diligence & Watchlist Screening Trigger',
      category: 'RISK_TRIGGER',
      status: 'NEEDS_REVIEW',
      severity: 'CRITICAL',
      evidence: 'Watchlist screening flagged potential entity similarity. Formal compliance officer review required.',
      explanation: 'Internal screening flags potential match with elevated scrutiny lists. Requires secondary compliance sign-off.',
      recommendedAction: 'Escalate to Chief Compliance Officer for formal jurisdiction sign-off.',
      manualReviewRequired: true,
      fieldAffected: 'company.legalName',
      evaluatedAt: evalDate,
    });
  } else if (isHighRiskCategory) {
    results.push({
      ruleId: 'RULE-012',
      ruleName: 'High-Risk Industry Category Due Diligence',
      category: 'RISK_TRIGGER',
      status: 'NEEDS_REVIEW',
      severity: 'MEDIUM',
      evidence: `Vendor Category "${app.company.vendorCategory}" requires secondary procurement lead sign-off per corporate governance rules.`,
      explanation: 'Specialized industries (construction, chemicals, security) require verification of health/safety and specialized liability insurance.',
      recommendedAction: 'Verify mandatory liability insurance coverage before final approval.',
      manualReviewRequired: true,
      fieldAffected: 'company.vendorCategory',
      evaluatedAt: evalDate,
    });
  } else {
    results.push({
      ruleId: 'RULE-012',
      ruleName: 'Policy-Based Manual Review Trigger Matrix',
      category: 'RISK_TRIGGER',
      status: 'PASS',
      severity: 'LOW',
      evidence: `Standard enterprise tier category: "${app.company.vendorCategory || 'General Goods/Services'}". No automatic escalation required.`,
      explanation: 'Application does not trigger enhanced due diligence thresholds.',
      recommendedAction: 'Standard reviewer evaluation applicable.',
      manualReviewRequired: false,
      evaluatedAt: evalDate,
    });
  }

  // Calculate Overall Risk Score (0 - 100) and Level
  let calculatedRiskScore = 10; // Baseline
  results.forEach(r => {
    if (r.status === 'FAIL') {
      calculatedRiskScore += r.severity === 'CRITICAL' ? 35 : r.severity === 'HIGH' ? 25 : 15;
    } else if (r.status === 'NEEDS_REVIEW') {
      calculatedRiskScore += r.severity === 'CRITICAL' ? 35 : r.severity === 'HIGH' ? 20 : 12;
    } else if (r.status === 'WARNING') {
      calculatedRiskScore += 8;
    }
  });

  if (app.discrepancies.some(d => !d.resolved && d.type === 'HIGH_RISK_WATCHLIST')) {
    calculatedRiskScore = Math.max(calculatedRiskScore, 85);
  }

  calculatedRiskScore = Math.min(100, calculatedRiskScore);

  let calculatedRiskLevel: RiskLevel = 'LOW';
  if (calculatedRiskScore >= 75) calculatedRiskLevel = 'CRITICAL';
  else if (calculatedRiskScore >= 50) calculatedRiskLevel = 'HIGH';
  else if (calculatedRiskScore >= 25) calculatedRiskLevel = 'MEDIUM';

  // Determine Computed Workflow Status
  // Remember: Risk and workflow status are separate dimensions!
  // A high-risk case must not automatically become rejected without an appropriate policy decision.
  // Rule outcomes:
  const hasFailures = results.some(r => r.status === 'FAIL');
  const hasNeedsReview = results.some(r => r.status === 'NEEDS_REVIEW');
  const hasUnresolvedDiscrepancies = discrepancies.length > 0;

  let computedStatus: ApplicationStatus = 'APPROVED';
  if (hasFailures || hasNeedsReview || hasUnresolvedDiscrepancies) {
    computedStatus = 'PENDING';
  }

  // Preserve existing approved status if manually overridden
  if (app.status === 'APPROVED' && app.manualOverridesCount > 0) {
    computedStatus = 'APPROVED';
  } else if (app.status === 'REJECTED') {
    computedStatus = 'REJECTED';
  }

  return {
    validationResults: results,
    computedStatus,
    riskLevel: calculatedRiskLevel,
    riskScore: calculatedRiskScore,
    discrepancies: [...discrepancies, ...app.discrepancies.filter(d => !discrepancies.some(nd => nd.type === d.type))],
  };
}
