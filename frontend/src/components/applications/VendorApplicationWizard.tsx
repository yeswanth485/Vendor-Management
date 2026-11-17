import React, { useState } from 'react';
import { AppStorage } from '../../lib/storage';
import { VendorApplication, VendorDocument } from '../../types';
import { 
  Building2, 
  FileSpreadsheet, 
  CreditCard, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  ShieldCheck, 
  Save 
} from 'lucide-react';
import { DEFAULT_COUNTRY_CONFIGS } from '../../lib/rulesEngine';

interface VendorApplicationWizardProps {
  onSuccess: (newAppId: string) => void;
  onCancel: () => void;
}

export function VendorApplicationWizard({ onSuccess, onCancel }: VendorApplicationWizardProps) {
  const storage = AppStorage.getInstance();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [company, setCompany] = useState({
    legalName: '',
    tradingName: '',
    country: 'US',
    businessRegistrationNumber: '',
    businessAddress: '',
    city: '',
    postalCode: '',
    website: '',
    industry: 'Technology',
    vendorCategory: 'Software / SaaS',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [tax, setTax] = useState({
    country: 'US',
    taxIdentifierType: 'Employer Identification Number (EIN)',
    taxIdentifierNumber: '',
    taxRegistrationStatus: 'ACTIVE' as const,
    expiryDate: '',
  });

  const [banking, setBanking] = useState<{
    accountHolderName: string;
    bankName: string;
    country: string;
    accountNumberRaw: string;
    routingIdentifierType: 'ROUTING_NUMBER' | 'SWIFT_BIC' | 'IFSC' | 'SORT_CODE' | 'BSB' | 'BLZ';
    routingIdentifierValue: string;
    currency: string;
  }>({
    accountHolderName: '',
    bankName: '',
    country: 'US',
    accountNumberRaw: '',
    routingIdentifierType: 'ROUTING_NUMBER',
    routingIdentifierValue: '',
    currency: 'USD',
  });

  const [documents, setDocuments] = useState<VendorDocument[]>([
    {
      id: 'doc-wizard-1',
      category: 'CERTIFICATE_OF_INCORPORATION',
      fileName: 'Articles_of_Incorporation.pdf',
      fileSize: 1420000,
      fileType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'vendor-portal@applicant.com',
      verified: true,
      verificationSource: 'OCR_ASSISTED',
    },
    {
      id: 'doc-wizard-2',
      category: 'TAX_REGISTRATION',
      fileName: 'Form_W9_Tax_Registration.pdf',
      fileSize: 850000,
      fileType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'vendor-portal@applicant.com',
      verified: true,
      verificationSource: 'OCR_ASSISTED',
    },
    {
      id: 'doc-wizard-3',
      category: 'BANK_VERIFICATION_LETTER',
      fileName: 'Official_Bank_Letter_Verification.pdf',
      fileSize: 950000,
      fileType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'vendor-portal@applicant.com',
      verified: false,
      verificationSource: 'UNVERIFIED',
    }
  ]);

  const [errors, setErrors] = useState<string[]>([]);
  const countryConfig = DEFAULT_COUNTRY_CONFIGS[company.country] || DEFAULT_COUNTRY_CONFIGS['US'];

  // Handle Country Change
  const handleCountryChange = (cCode: string) => {
    const cfg = DEFAULT_COUNTRY_CONFIGS[cCode] || DEFAULT_COUNTRY_CONFIGS['US'];
    setCompany(prev => ({ ...prev, country: cCode }));
    setTax(prev => ({ 
      ...prev, 
      country: cCode, 
      taxIdentifierType: cfg.taxIdentifierName,
      taxIdentifierNumber: '' 
    }));
    setBanking(prev => ({
      ...prev,
      country: cCode,
      routingIdentifierType: cCode === 'US' ? 'ROUTING_NUMBER' : cCode === 'IN' ? 'IFSC' : cCode === 'GB' ? 'SORT_CODE' : cCode === 'AU' ? 'BSB' : 'SWIFT_BIC',
      routingIdentifierValue: '',
    }));
  };

  const validateCurrentStep = (): boolean => {
    const errs: string[] = [];
    if (currentStep === 1) {
      if (!company.legalName.trim()) errs.push('Legal company name is required.');
      if (!company.businessRegistrationNumber.trim()) errs.push('Business registration number is required.');
      if (!company.businessAddress.trim()) errs.push('Business address is required.');
      if (!company.contactName.trim()) errs.push('Contact person name is required.');
      if (!company.contactEmail.trim() || !company.contactEmail.includes('@')) errs.push('Valid corporate business email is required.');
      if (!company.contactPhone.trim()) errs.push('Contact telephone is required.');
    } else if (currentStep === 2) {
      if (!tax.taxIdentifierNumber.trim()) errs.push('Tax identification number is required.');
    } else if (currentStep === 3) {
      if (!banking.accountHolderName.trim()) errs.push('Bank account holder name is required.');
      if (!banking.bankName.trim()) errs.push('Bank name is required.');
      if (!banking.accountNumberRaw.trim()) errs.push('Account number / IBAN is required.');
      if (!banking.routingIdentifierValue.trim()) errs.push(`${countryConfig.bankingIdentifierName} is required.`);
    } else if (currentStep === 4) {
      if (documents.length < 2) errs.push('At least two statutory documents are required.');
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(5, prev + 1) as any);
    }
  };

  const prevStep = () => {
    setErrors([]);
    setCurrentStep(prev => Math.max(1, prev - 1) as any);
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) return;

    // Mask the account number: e.g. "••••••••4829"
    const rawAcc = banking.accountNumberRaw.trim();
    const last4 = rawAcc.slice(-4) || '1234';
    const masked = `••••••••${last4}`;

    const newApp = storage.submitNewApplication({
      vendorId: '',
      status: 'SUBMITTED',
      riskLevel: 'LOW',
      riskScore: 10,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      company,
      tax: {
        ...tax,
        expiryDate: tax.expiryDate || undefined,
      },
      banking: {
        accountHolderName: banking.accountHolderName,
        bankName: banking.bankName,
        country: banking.country,
        accountNumberMasked: masked,
        routingIdentifierType: banking.routingIdentifierType,
        routingIdentifierValue: banking.routingIdentifierValue,
        ibanOrAccountNumber: rawAcc,
        currency: banking.currency,
        isVerified: false,
      },
      documents,
    });

    onSuccess(newApp.id);
  };

  // Pre-fill button for fast demo testing
  const handlePreFill = (type: 'clean' | 'mismatch' | 'duplicate') => {
    if (type === 'clean') {
      setCompany({
        legalName: 'Apex Cloud Solutions Inc',
        tradingName: 'Apex Cloud',
        country: 'US',
        businessRegistrationNumber: 'DEL-882910',
        businessAddress: '100 Silicon Way, Suite 400',
        city: 'San Francisco',
        postalCode: '94107',
        website: 'https://apexcloud.example.com',
        industry: 'Cloud Infrastructure',
        vendorCategory: 'Software / SaaS',
        contactName: 'Elena Rostova',
        contactEmail: 'elena@apexcloud.example.com',
        contactPhone: '+1 415 555 0192',
      });
      setTax({
        country: 'US',
        taxIdentifierType: 'Employer Identification Number (EIN)',
        taxIdentifierNumber: '82-9481920',
        taxRegistrationStatus: 'ACTIVE',
        expiryDate: '',
      });
      setBanking({
        accountHolderName: 'Apex Cloud Solutions Inc',
        bankName: 'Silicon Valley Bank (First Citizens)',
        country: 'US',
        accountNumberRaw: '9028471928',
        routingIdentifierType: 'ROUTING_NUMBER',
        routingIdentifierValue: '121140399',
        currency: 'USD',
      });
    } else if (type === 'mismatch') {
      setCompany({
        legalName: 'Horizon Heavy Logistics Corporation',
        tradingName: 'Horizon Transport',
        country: 'US',
        businessRegistrationNumber: 'TEX-948192',
        businessAddress: '400 Port Terminal Rd',
        city: 'Houston',
        postalCode: '77002',
        website: 'https://horizontransport.example.com',
        industry: 'Commercial Freight',
        vendorCategory: 'Logistics',
        contactName: 'Carlos Rivera',
        contactEmail: 'carlos@horizontransport.com',
        contactPhone: '+1 713 555 8892',
      });
      setTax({
        country: 'US',
        taxIdentifierType: 'Employer Identification Number (EIN)',
        taxIdentifierNumber: '74-8829104',
        taxRegistrationStatus: 'ACTIVE',
        expiryDate: '',
      });
      setBanking({
        accountHolderName: 'Horizon Transport Fleet LLC', // Notice mismatch!
        bankName: 'Wells Fargo Bank, N.A.',
        country: 'US',
        accountNumberRaw: '4928104829',
        routingIdentifierType: 'ROUTING_NUMBER',
        routingIdentifierValue: '111000025',
        currency: 'USD',
      });
    } else if (type === 'duplicate') {
      setCompany({
        legalName: 'Acme Highrise Constructors Ltd',
        tradingName: 'Acme Highrise',
        country: 'GB',
        businessRegistrationNumber: '08492014', // Collision!
        businessAddress: '15 Canary Wharf',
        city: 'London',
        postalCode: 'E14 5AB',
        website: 'https://acmehighrise.co.uk',
        industry: 'Commercial Construction',
        vendorCategory: 'Construction',
        contactName: 'Thomas Thorne',
        contactEmail: 'thomas@acmehighrise.co.uk',
        contactPhone: '+44 20 8940 1122',
      });
      setTax({
        country: 'GB',
        taxIdentifierType: 'Value Added Tax (VAT)',
        taxIdentifierNumber: 'GB982740192',
        taxRegistrationStatus: 'ACTIVE',
        expiryDate: '',
      });
      setBanking({
        accountHolderName: 'Acme Highrise Constructors Ltd',
        bankName: 'HSBC UK Bank plc',
        country: 'GB',
        accountNumberRaw: 'GB12HBUK40000099882211',
        routingIdentifierType: 'SORT_CODE',
        routingIdentifierValue: '400000',
        currency: 'GBP',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-mono">
            Vendor Self-Service Portal
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Submit New Vendor Onboarding Application
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete the 5 statutory verification steps to register with Terybi Global Enterprise Procurement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Demo Fill:</span>
          <button
            type="button"
            onClick={() => handlePreFill('clean')}
            className="px-2.5 py-1 text-xs border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded font-medium"
          >
            Clean Pass
          </button>
          <button
            type="button"
            onClick={() => handlePreFill('mismatch')}
            className="px-2.5 py-1 text-xs border border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded font-medium"
          >
            Name Mismatch
          </button>
          <button
            type="button"
            onClick={() => handlePreFill('duplicate')}
            className="px-2.5 py-1 text-xs border border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100 rounded font-medium"
          >
            Duplicate Reg #
          </button>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="grid grid-cols-5 gap-2 text-xs font-medium">
        {[
          { num: 1, label: 'Company Info', icon: Building2 },
          { num: 2, label: 'Tax ID & Status', icon: FileSpreadsheet },
          { num: 3, label: 'Banking & Payout', icon: CreditCard },
          { num: 4, label: 'Documents', icon: FileCheck2 },
          { num: 5, label: 'Review & Submit', icon: CheckCircle2 },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isPassed = currentStep > s.num;
          return (
            <div
              key={s.num}
              onClick={() => {
                if (isPassed) setCurrentStep(s.num as any);
              }}
              className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all ${
                isActive
                  ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-xs'
                  : isPassed
                  ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800 cursor-pointer'
                  : 'border-slate-200 bg-white text-slate-400'
              }`}
            >
              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                isActive ? 'bg-blue-600 text-white' : isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {isPassed ? '✓' : s.num}
              </div>
              <div className="truncate">
                <span className="block text-[11px] uppercase tracking-wider font-semibold opacity-75">Step {s.num}</span>
                <span className="block truncate font-semibold">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation Errors Box */}
      {errors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Please address the following requirements before proceeding:
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
        {/* Step 1: Company Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 1: Corporate Legal Identity & Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Legal Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={company.legalName}
                  onChange={(e) => setCompany({ ...company, legalName: e.target.value })}
                  placeholder="e.g. Apex Industrial Supplies Private Limited"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Trading Name / DBA (Optional)
                </label>
                <input
                  type="text"
                  value={company.tradingName}
                  onChange={(e) => setCompany({ ...company, tradingName: e.target.value })}
                  placeholder="e.g. Apex Industrial"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Country of Incorporation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={company.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                >
                  <option value="US">United States (US)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="DE">Germany (DE)</option>
                  <option value="IN">India (IN)</option>
                  <option value="AU">Australia (AU)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="FI">Finland (FI)</option>
                  <option value="JP">Japan (JP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Business Registration Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={company.businessRegistrationNumber}
                  onChange={(e) => setCompany({ ...company, businessRegistrationNumber: e.target.value })}
                  placeholder={`Pattern: ${countryConfig.businessRegExample}`}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Registered Business Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={company.businessAddress}
                  onChange={(e) => setCompany({ ...company, businessAddress: e.target.value })}
                  placeholder="Street address, building, suite"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={company.city}
                  onChange={(e) => setCompany({ ...company, city: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={company.postalCode}
                  onChange={(e) => setCompany({ ...company, postalCode: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vendor Category</label>
                <select
                  value={company.vendorCategory}
                  onChange={(e) => setCompany({ ...company, vendorCategory: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded"
                >
                  <option value="Software / SaaS">Software / SaaS</option>
                  <option value="Industrial Equipment">Industrial Equipment</option>
                  <option value="Logistics">Logistics & Freight</option>
                  <option value="Construction">Construction & Civil Works</option>
                  <option value="Consulting">Consulting & Professional Services</option>
                  <option value="Chemicals">Chemicals & Specialized Materials</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Website</label>
                <input
                  type="text"
                  value={company.website}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  placeholder="https://company.example.com"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={company.contactName}
                  onChange={(e) => setCompany({ ...company, contactName: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Business Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={company.contactEmail}
                  onChange={(e) => setCompany({ ...company, contactEmail: e.target.value })}
                  placeholder="e.g. s.jenkins@company.com"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={company.contactPhone}
                  onChange={(e) => setCompany({ ...company, contactPhone: e.target.value })}
                  placeholder="e.g. +1 415 555 0192"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Tax Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 2: National Tax Identification & Classification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tax Jurisdiction</label>
                <input
                  type="text"
                  disabled
                  value={countryConfig.countryName}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tax Identification Type
                </label>
                <input
                  type="text"
                  disabled
                  value={countryConfig.taxIdentifierName}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tax Identification Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={tax.taxIdentifierNumber}
                  onChange={(e) => setTax({ ...tax, taxIdentifierNumber: e.target.value })}
                  placeholder={`Pattern example: ${countryConfig.taxExample}`}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Regex check: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">{countryConfig.taxRegex}</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tax Registration Status</label>
                <select
                  value={tax.taxRegistrationStatus}
                  onChange={(e) => setTax({ ...tax, taxRegistrationStatus: e.target.value as any })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded"
                >
                  <option value="ACTIVE">ACTIVE — Certified with Tax Authority</option>
                  <option value="PENDING">PENDING — Renewal / Registration Filed</option>
                  <option value="EXEMPT">EXEMPT — Treaty / Statutory Exemption</option>
                </select>
              </div>

              {countryConfig.requireTaxExpiry && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tax Registration Expiry Date (if applicable)
                  </label>
                  <input
                    type="date"
                    value={tax.expiryDate}
                    onChange={(e) => setTax({ ...tax, expiryDate: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Banking Information */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 3: Disbursement Banking & Remittance Coordinates
            </h3>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Security & Name Consistency Enforcement:</strong>
                <span>
                  The bank account holder name must match the corporate legal entity. Any discrepancy triggers Rule RULE-006 and mandatory secondary review. Account numbers are strictly masked on dashboards.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bank Account Beneficiary Holder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={banking.accountHolderName}
                  onChange={(e) => setBanking({ ...banking, accountHolderName: e.target.value })}
                  placeholder="Exact account name on bank records"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Financial Institution Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={banking.bankName}
                  onChange={(e) => setBanking({ ...banking, bankName: e.target.value })}
                  placeholder="e.g. JPMorgan Chase Bank / HDFC / Barclays"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Account Number / Full IBAN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={banking.accountNumberRaw}
                  onChange={(e) => setBanking({ ...banking, accountNumberRaw: e.target.value })}
                  placeholder="Enter full number (will be masked in audit views)"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {countryConfig.bankingIdentifierName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={banking.routingIdentifierValue}
                  onChange={(e) => setBanking({ ...banking, routingIdentifierValue: e.target.value })}
                  placeholder={`Pattern regex: ${countryConfig.bankingIdentifierRegex}`}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Disbursement Currency</label>
                <select
                  value={banking.currency}
                  onChange={(e) => setBanking({ ...banking, currency: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Compliance Documents */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 4: Statutory Documents & Certification Proof
            </h3>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
              Uploaded files are validated against allowed formats (.pdf, .png, .jpg) and scanned with server-side OCR extraction.
            </div>

            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div key={doc.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{doc.category.replace(/_/g, ' ')}</p>
                      <p className="font-mono text-[11px] text-slate-500">{doc.fileName} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                    Attached & OCR Ready
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 5: Final Review & Deterministic Policy Check
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">Corporate Identity</h4>
                <p><span className="text-slate-500 font-medium">Legal Name:</span> <strong>{company.legalName || 'N/A'}</strong></p>
                <p><span className="text-slate-500 font-medium">Country:</span> {company.country}</p>
                <p><span className="text-slate-500 font-medium">Reg #:</span> <code className="font-mono">{company.businessRegistrationNumber || 'N/A'}</code></p>
                <p><span className="text-slate-500 font-medium">Email:</span> {company.contactEmail}</p>
                <p><span className="text-slate-500 font-medium">Category:</span> {company.vendorCategory}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">Tax & Banking</h4>
                <p><span className="text-slate-500 font-medium">Tax Identifier:</span> <code className="font-mono">{tax.taxIdentifierNumber || 'N/A'}</code> ({tax.taxIdentifierType})</p>
                <p><span className="text-slate-500 font-medium">Beneficiary:</span> <strong>{banking.accountHolderName || 'N/A'}</strong></p>
                <p><span className="text-slate-500 font-medium">Bank Name:</span> {banking.bankName}</p>
                <p><span className="text-slate-500 font-medium">Routing Code:</span> <code className="font-mono">{banking.routingIdentifierValue}</code></p>
                <p><span className="text-slate-500 font-medium">Documents:</span> {documents.length} statutory files attached</p>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded text-xs text-emerald-900 space-y-1">
              <p className="font-bold">Automated Evaluation Protocol Ready:</p>
              <p>
                Upon clicking "Submit Application", the 12-rule deterministic rules engine will immediately evaluate this filing, calculate the risk score, check for duplicate registrations, and route to the reviewer triage queue.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Application for Verification
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
