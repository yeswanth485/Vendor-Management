import { Router, Request, Response } from 'express';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { messageService } from '../services/messageService';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'VendorIQ Enterprise API Engine',
    version: '2.6.4'
  });
});

// Real-Time Notification Stream (SSE)
apiRouter.get('/notifications/stream', (_req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write(': connected\n\n');
  notificationService.addClient(res);
});

// Notifications
apiRouter.get('/notifications', (_req: Request, res: Response) => {
  res.json(notificationService.getNotifications());
});

apiRouter.put('/notifications/:id/read', (req: Request, res: Response) => {
  const success = notificationService.markAsRead(req.params.id);
  res.json({ success });
});

// Messages
apiRouter.get('/messages', (_req: Request, res: Response) => {
  res.json(messageService.getMessages());
});

apiRouter.post('/messages', (req: Request, res: Response) => {
  const newMsg = messageService.sendMessage(req.body);
  res.status(201).json(newMsg);
});

apiRouter.put('/messages/:id/read', (req: Request, res: Response) => {
  const success = messageService.markAsRead(req.params.id);
  res.json({ success });
});

// Applications
apiRouter.get('/applications', (_req: Request, res: Response) => {
  res.json(storageService.getApplications());
});

apiRouter.get('/applications/:id', (req: Request, res: Response) => {
  const app = storageService.getApplicationById(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  res.json(app);
});

apiRouter.post('/applications', (req: Request, res: Response) => {
  try {
    const created = storageService.submitApplication(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/applications/:id/approve', (req: Request, res: Response) => {
  const result = storageService.approveApplication(req.params.id, req.body.reason || '');
  if (!result.success) return res.status(403).json(result);
  res.json(result);
});

apiRouter.put('/applications/:id/reject', (req: Request, res: Response) => {
  const result = storageService.rejectApplication(req.params.id, req.body.reason || '');
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

apiRouter.put('/applications/:id/claim', (req: Request, res: Response) => {
  storageService.claimApplication(req.params.id);
  res.json({ success: true });
});

apiRouter.put('/applications/:id/release', (req: Request, res: Response) => {
  storageService.releaseApplication(req.params.id);
  res.json({ success: true });
});

apiRouter.put('/applications/:id/revalidate', (req: Request, res: Response) => {
  const updated = storageService.revalidateApplication(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Application not found' });
  res.json(updated);
});

apiRouter.put('/applications/:id/override', (req: Request, res: Response) => {
  const result = storageService.applyManualOverride({
    applicationId: req.params.id,
    ruleId: req.body.ruleId,
    newStatus: req.body.newStatus,
    justification: req.body.justification,
  });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

apiRouter.put('/applications/:id/resolve-discrepancy', (req: Request, res: Response) => {
  const result = storageService.resolveDiscrepancy({
    applicationId: req.params.id,
    discrepancyType: req.body.discrepancyType,
    resolutionNotes: req.body.resolutionNotes,
  });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

apiRouter.post('/applications/:id/request-info', (req: Request, res: Response) => {
  const result = storageService.requestMoreInformation({
    applicationId: req.params.id,
    recipientEmail: req.body.recipientEmail,
    subject: req.body.subject,
    body: req.body.body,
    missingItems: req.body.missingItems || [],
  });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

apiRouter.post('/applications/:id/replace-document', (req: Request, res: Response) => {
  const result = storageService.replaceDocument({
    applicationId: req.params.id,
    documentCategory: req.body.documentCategory,
    fileName: req.body.fileName,
    fileSize: req.body.fileSize || 1024,
    fileType: req.body.fileType || 'application/pdf',
    expiryDate: req.body.expiryDate,
  });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

// Vendors
apiRouter.get('/vendors', (_req: Request, res: Response) => {
  res.json(storageService.getVendors());
});

// Invoices & AP
apiRouter.get('/invoices', (_req: Request, res: Response) => {
  res.json(storageService.getInvoices());
});

apiRouter.post('/invoices', (req: Request, res: Response) => {
  const inv = storageService.createInvoice(req.body);
  res.status(201).json(inv);
});

apiRouter.put('/invoices/:id/approve', (req: Request, res: Response) => {
  const result = storageService.approveInvoiceForPayment(req.params.id, req.body.notes);
  res.json(result);
});

apiRouter.put('/invoices/:id/resolve-variance', (req: Request, res: Response) => {
  const result = storageService.resolveInvoiceVariance(
    req.params.id,
    req.body.resolution,
    req.body.notes || ''
  );
  res.json(result);
});

apiRouter.post('/invoices/disburse', (req: Request, res: Response) => {
  const result = storageService.disbursePaymentBatch(
    req.body.invoiceIds || [],
    req.body.stepUpVerified || false
  );
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

// Contracts
apiRouter.get('/contracts', (_req: Request, res: Response) => {
  res.json(storageService.getContracts());
});

apiRouter.post('/contracts', (req: Request, res: Response) => {
  const ctr = storageService.createContract(req.body);
  res.status(201).json(ctr);
});

apiRouter.put('/contracts/:id/renew', (req: Request, res: Response) => {
  const result = storageService.renewContract(req.params.id, req.body.additionalMonths);
  res.json(result);
});

// SLAs
apiRouter.get('/sla-breaches', (_req: Request, res: Response) => {
  res.json(storageService.getSlaBreaches());
});

apiRouter.put('/sla-breaches/:id/claim-credit', (req: Request, res: Response) => {
  const result = storageService.claimServiceCredit(req.params.id);
  res.json(result);
});

// CIM Plans
apiRouter.get('/cim-plans', (_req: Request, res: Response) => {
  res.json(storageService.getCimPlans());
});

apiRouter.post('/cim-plans', (req: Request, res: Response) => {
  const plan = storageService.createCimPlan(req.body);
  res.status(201).json(plan);
});

apiRouter.put('/cim-plans/:id/resolve', (req: Request, res: Response) => {
  const result = storageService.resolveCimPlan(req.params.id, req.body.resolutionSummary || '');
  res.json(result);
});

// Bank Changes
apiRouter.get('/bank-changes', (_req: Request, res: Response) => {
  res.json(storageService.getBankChangeRequests());
});

apiRouter.put('/bank-changes/:id/verify', (req: Request, res: Response) => {
  const result = storageService.verifyBankChangeRequest({
    requestId: req.params.id,
    action: req.body.action,
    notes: req.body.notes || '',
  });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

// Follow-ups & Audit Events
apiRouter.get('/follow-ups', (_req: Request, res: Response) => {
  res.json(storageService.getFollowUps());
});

apiRouter.get('/audit-events', (_req: Request, res: Response) => {
  res.json(storageService.getAuditEvents());
});

// Context & Settings
apiRouter.get('/context/org', (_req: Request, res: Response) => {
  res.json(storageService.getCurrentOrg());
});

apiRouter.put('/context/org', (req: Request, res: Response) => {
  storageService.setCurrentOrg(req.body.orgId);
  res.json(storageService.getCurrentOrg());
});

apiRouter.get('/context/user', (_req: Request, res: Response) => {
  res.json(storageService.getCurrentUser());
});

apiRouter.put('/context/user/role', (req: Request, res: Response) => {
  storageService.setCurrentUserRole(req.body.role);
  res.json(storageService.getCurrentUser());
});

apiRouter.get('/config/countries', (_req: Request, res: Response) => {
  res.json(storageService.getCountryConfigs());
});

// Scorecards
apiRouter.get('/scorecards', (_req: Request, res: Response) => {
  res.json(storageService.getScorecards());
});

apiRouter.get('/scorecards/:vendorId', (req: Request, res: Response) => {
  const card = storageService.getVendorScorecard(req.params.vendorId);
  if (!card) return res.status(404).json({ error: 'Scorecard not found' });
  res.json(card);
});
