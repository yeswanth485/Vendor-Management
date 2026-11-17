import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppStorage } from './lib/storage';
import { AppShell } from './components/layout/AppShell';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { VendorList } from './components/vendors/VendorList';
import { ApplicationList } from './components/applications/ApplicationList';
import { ApplicationDetailView } from './components/applications/ApplicationDetailView';
import { VendorApplicationWizard } from './components/applications/VendorApplicationWizard';
import { ReviewQueue } from './components/review/ReviewQueue';
import { RiskAndExceptions } from './components/risk/RiskAndExceptions';
import { FollowUpManager } from './components/followups/FollowUpManager';
import { AuditLogView } from './components/audit/AuditLogView';
import { RulesAndSettings } from './components/settings/RulesAndSettings';
import { ApAutomationHub } from './components/ap/ApAutomationHub';
import { VendorManagementWorkspace } from './components/workspace/VendorManagementWorkspace';
import { UserMfaProfile } from './lib/firebase';

interface MainAppProps {
  userProfile: UserMfaProfile;
  onUpdateUserProfile: (updated: UserMfaProfile) => void;
  onOpenMfaEnrollment: () => void;
  onOpenAuthModal: () => void;
  onOpenTestSuite: () => void;
}

export function MainApp({
  userProfile,
  onUpdateUserProfile,
  onOpenMfaEnrollment,
  onOpenAuthModal,
  onOpenTestSuite,
}: MainAppProps) {
  const storage = AppStorage.getInstance();
  const [, setTick] = useState(0);

  // Subscribe to storage mutations for reactive state
  useEffect(() => {
    return storage.subscribe(() => {
      setTick(prev => prev + 1);
    });
  }, [storage]);

  const [currentTab, setCurrentTab] = useState<string>('workspace');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const applications = storage.getApplications();
  const vendors = storage.getVendors();
  const auditEvents = storage.getAuditEvents();
  const followUps = storage.getFollowUps();

  const handleSelectApplication = (id: string) => {
    setSelectedApplicationId(id);
    setCurrentTab('applications');
    setIsWizardOpen(false);
  };

  const handleBackToApplications = () => {
    setSelectedApplicationId(null);
  };

  const handleOpenNewApplication = () => {
    setIsWizardOpen(true);
    setSelectedApplicationId(null);
    setCurrentTab('applications');
  };

  const handleWizardSuccess = (newAppId: string) => {
    setIsWizardOpen(false);
    setSelectedApplicationId(newAppId);
    setCurrentTab('applications');
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setIsWizardOpen(false);
    if (tab !== 'applications') {
      setSelectedApplicationId(null);
    }
  };

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={handleTabChange}
      onOpenNewApplication={handleOpenNewApplication}
      onOpenTestSuite={onOpenTestSuite}
      userProfile={userProfile}
      onOpenMfaEnrollment={onOpenMfaEnrollment}
      onOpenAuthModal={onOpenAuthModal}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {/* ServiceNow-style Vendor Management Workspace */}
          {currentTab === 'workspace' && (
            <VendorManagementWorkspace
              userProfile={userProfile}
              onNavigateToAp={() => handleTabChange('invoices_ap')}
              onNavigateToVendorDetail={(_vendorId: string) => handleTabChange('vendors')}
            />
          )}

          {/* Overview Dashboard */}
          {currentTab === 'overview' && (
            <OverviewDashboard
              applications={applications}
              vendors={vendors}
              auditEvents={auditEvents}
              followUps={followUps}
              onSelectApplication={handleSelectApplication}
              onNavigateToTab={handleTabChange}
            />
          )}

          {/* Vendors Master */}
          {currentTab === 'vendors' && (
            <VendorList
              vendors={vendors}
              onSelectApplication={handleSelectApplication}
              onNavigateToRiskExceptions={() => handleTabChange('risk_exceptions')}
              onNavigateToAp={() => handleTabChange('invoices_ap')}
            />
          )}

          {/* AP Automation & 3-Way Matching Hub */}
          {currentTab === 'invoices_ap' && (
            <ApAutomationHub
              userProfile={userProfile}
              onNavigateToRiskExceptions={() => handleTabChange('risk_exceptions')}
              onNavigateToVendor={(vendorId) => handleTabChange('vendors')}
            />
          )}

          {/* Applications / Detail / Wizard */}
          {currentTab === 'applications' && (
            <>
              {isWizardOpen ? (
                <VendorApplicationWizard
                  onSuccess={handleWizardSuccess}
                  onCancel={() => setIsWizardOpen(false)}
                />
              ) : selectedApplicationId ? (
                <ApplicationDetailView
                  applicationId={selectedApplicationId}
                  onBack={handleBackToApplications}
                  onNavigateToApplication={handleSelectApplication}
                  userProfile={userProfile}
                />
              ) : (
                <ApplicationList
                  applications={applications}
                  onSelectApplication={handleSelectApplication}
                  onNewApplication={handleOpenNewApplication}
                />
              )}
            </>
          )}

          {/* Review Queue */}
          {currentTab === 'review_queue' && (
            <ReviewQueue
              applications={applications}
              onSelectApplication={handleSelectApplication}
            />
          )}

          {/* Risk & Exceptions Center */}
          {currentTab === 'risk_exceptions' && (
            <RiskAndExceptions
              applications={applications}
              onSelectApplication={handleSelectApplication}
              userProfile={userProfile}
            />
          )}

          {/* Follow-ups & Resend Communications */}
          {currentTab === 'follow_ups' && (
            <FollowUpManager
              followUps={followUps}
              applications={applications}
              onSelectApplication={handleSelectApplication}
            />
          )}

          {/* Audit Log */}
          {currentTab === 'audit_log' && (
            <AuditLogView
              auditEvents={auditEvents}
              onSelectApplication={handleSelectApplication}
            />
          )}

          {/* Rules & Settings */}
          {currentTab === 'settings' && (
            <RulesAndSettings
              onOpenTestSuite={onOpenTestSuite}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}