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
} from '../../src/data/seedData';

export function loadSeedDatabase() {
  const applications = getEvaluatedSeedApplications();
  const vendors = getSeedVendors(applications);
  
  return {
    organizations: SEED_ORGANIZATIONS,
    users: SEED_USERS,
    applications,
    vendors,
    bankChangeRequests: SEED_BANK_CHANGE_REQUESTS,
    followUps: SEED_FOLLOW_UPS,
    auditEvents: SEED_AUDIT_EVENTS,
    invoices: SEED_INVOICES,
    scorecards: SEED_SCORECARDS,
    contracts: SEED_CONTRACTS,
    slaBreaches: SEED_SLA_BREACHES,
    cimPlans: SEED_CIM_PLANS,
  };
}
