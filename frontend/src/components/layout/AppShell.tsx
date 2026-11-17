import React, { useState } from 'react';
import { AppStorage } from '../../lib/storage';
import { UserRole } from '../../types';
import { SEED_ORGANIZATIONS } from '../../data/seedData';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Inbox, 
  ShieldAlert, 
  Mail, 
  History, 
  Settings, 
  Search, 
  Bell, 
  ChevronDown, 
  User, 
  PanelLeftClose, 
  PanelLeft, 
  Plus, 
  Play, 
  Receipt, 
  Layers,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserMfaProfile } from '../../lib/firebase';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';
import { MessagesDrawer } from '../common/MessagesDrawer';
import { ToastContainer } from '../common/ToastContainer';

interface AppShellProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewApplication: () => void;
  onOpenTestSuite: () => void;
  userProfile: UserMfaProfile;
  onOpenMfaEnrollment: () => void;
  onOpenAuthModal: () => void;
  children: React.ReactNode;
}

export function AppShell({
  currentTab,
  onTabChange,
  onOpenNewApplication,
  onOpenTestSuite,
  userProfile,
  onOpenMfaEnrollment,
  onOpenAuthModal,
  children,
}: AppShellProps) {
  const storage = AppStorage.getInstance();
  const currentOrg = storage.getCurrentOrg();
  const currentUser = storage.getCurrentUser();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time hooks
  const { notifications, unreadCount: notifUnreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { unreadCount: msgUnreadCount } = useMessages();

  const applications = storage.getApplications();
  const pendingCount = applications.filter(a => a.status === 'IN_REVIEW' || a.status === 'SUBMITTED').length;
  const highRiskCount = applications.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length;
  const invoices = storage.getInvoices();
  const varianceCount = invoices.filter(i => i.status === 'VARIANCE_FLAGGED').length;
  const breaches = storage.getSlaBreaches();
  const openBreachesCount = breaches.filter(b => b.status === 'OPEN').length;

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: string | number;
    badgeVariant?: 'neutral' | 'alert' | 'warning' | 'primary';
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'workspace', label: 'Vendor Workspace', icon: Layers, badge: openBreachesCount > 0 ? openBreachesCount : undefined, badgeVariant: 'alert' },
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'vendors', label: 'Vendors (360)', icon: Building2 },
        { id: 'invoices_ap', label: 'Invoices & AP', icon: Receipt, badge: varianceCount > 0 ? varianceCount : undefined, badgeVariant: 'warning' },
      ]
    },
    {
      title: 'ONBOARDING & TRIAGE',
      items: [
        { id: 'applications', label: 'Applications', icon: FileText },
        { id: 'review_queue', label: 'Review Queue', icon: Inbox, badge: pendingCount > 0 ? pendingCount : undefined, badgeVariant: 'warning' },
        { id: 'risk_exceptions', label: 'Risk & Exceptions', icon: ShieldAlert, badge: highRiskCount > 0 ? highRiskCount : undefined, badgeVariant: 'alert' },
        { id: 'follow_ups', label: 'Follow-ups', icon: Mail },
      ]
    },
    {
      title: 'GOVERNANCE',
      items: [
        { id: 'audit_log', label: 'Audit Log', icon: History },
        { id: 'settings', label: 'Rules & Settings', icon: Settings },
      ]
    }
  ];

  const handleRoleChange = (role: UserRole) => {
    storage.setCurrentUserRole(role);
    setIsRoleDropdownOpen(false);
  };

  const handleOrgChange = (orgId: string) => {
    storage.setCurrentOrg(orgId);
    setIsOrgDropdownOpen(false);
  };

  // Global search matches
  const searchResults = searchQuery.trim()
    ? applications.filter(a =>
        a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.company.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.company.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Banner: Minimal Corporate Status Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-slate-300 text-xs px-5 py-1.5 flex items-center justify-between border-b border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-400/20" />
          <span className="font-semibold text-white tracking-tight flex items-center gap-1.5">
            Enterprise Terybi Sandbox
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-normal">
              Active Sync
            </span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            12-Rule Deterministic Engine, Live SSE Notifications & Immutable Audit Trail.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTestSuite}
            className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 font-medium transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" /> 
            <span className="font-medium">Run Test Suite</span>
          </button>
          <span className="text-slate-700">·</span>
          <span className="font-mono text-slate-400 text-[11px] bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50">
            v2.6.4
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-16' : 'w-60'
          } bg-white border-r border-slate-200/90 transition-all duration-200 flex flex-col shrink-0 z-20 select-none shadow-xs`}
        >
          {/* Brand Header */}
          <div className="h-14 border-b border-slate-200/80 px-4 flex items-center justify-between bg-white">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-xs shadow-indigo-500/20">
                  V
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-sm text-slate-900 tracking-tight">
                      Vendor<span className="text-indigo-600">IQ</span>
                    </span>
                    <span className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider">
                      PRO
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Terybi Procurement</span>
                </div>
              </div>
            ) : (
              <div className="w-7 h-7 mx-auto rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shadow-indigo-500/20">
                V
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Org Switcher */}
          {!sidebarCollapsed && (
            <div className="p-2.5 border-b border-slate-200/80 relative">
              <button
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className="w-full px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-left text-xs border border-slate-200/90 flex items-center justify-between transition-colors bg-white shadow-2xs hover:border-indigo-200"
              >
                <div className="truncate">
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Organization Tenant
                  </span>
                  <span className="font-semibold text-slate-800 truncate block text-xs">
                    {currentOrg.name}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <AnimatePresence>
                {isOrgDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-14 left-2.5 right-2.5 bg-white border border-slate-200 rounded-md shadow-lg z-30 p-1 space-y-0.5 text-xs"
                  >
                    {SEED_ORGANIZATIONS.map(org => (
                      <button
                        key={org.id}
                        onClick={() => handleOrgChange(org.id)}
                        className={`w-full px-2.5 py-1.5 rounded text-left flex items-center justify-between text-xs transition-colors ${
                          currentOrg.id === org.id ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>{org.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{org.country}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Action Button: New Application */}
          <div className="p-2.5">
            <button
              onClick={onOpenNewApplication}
              className={`w-full py-2 px-3 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs shadow-indigo-600/20 transition-all hover:shadow-sm active:scale-98 ${
                sidebarCollapsed ? 'p-2' : ''
              }`}
              title="Submit New Vendor Application"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              {!sidebarCollapsed && <span>New Application</span>}
            </button>
          </div>

          {/* Nav Sections */}
          <nav className="flex-1 px-2 py-2 space-y-4 overflow-y-auto">
            {navSections.map((section, sIdx) => (
              <div key={section.title || sIdx} className="space-y-0.5">
                {!sidebarCollapsed && section.title && (
                  <div className="px-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-indigo-50/80 text-indigo-950 font-semibold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title={item.label}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r"
                        />
                      )}
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'
                        }`} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            item.badgeVariant === 'alert'
                              ? 'text-rose-700 bg-rose-50 border border-rose-200/80'
                              : item.badgeVariant === 'warning'
                              ? 'text-amber-800 bg-amber-50 border border-amber-200/80'
                              : 'text-indigo-700 bg-indigo-50 border border-indigo-200/80'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Role Switcher & User Profile (Footer) */}
          <div className="p-3 border-t border-slate-200/90 relative bg-slate-50/40">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-white hover:shadow-2xs transition-all text-left"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                  {currentUser.name.charAt(0)}
                </div>
                {!sidebarCollapsed && (
                  <div className="truncate text-xs">
                    <p className="font-semibold text-slate-900 truncate leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-indigo-600 font-mono uppercase font-bold leading-tight">
                      {currentUser.role}
                    </p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            <AnimatePresence>
              {isRoleDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-16 left-3 right-3 bg-white border border-slate-200 rounded-md shadow-xl z-30 p-1.5 space-y-1 text-xs"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                    Simulate RBAC Role:
                  </span>
                  {[
                    { role: 'reviewer', label: 'Reviewer (Triage & Inspect)' },
                    { role: 'approver', label: 'Approver (Approve / Reject)' },
                    { role: 'administrator', label: 'Administrator (Full Access)' },
                    { role: 'auditor', label: 'Auditor (Read-Only Trail)' },
                    { role: 'vendor', label: 'Vendor Applicant (Portal Only)' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleChange(r.role as UserRole)}
                      className={`w-full p-2 rounded text-left text-xs transition-colors ${
                        currentUser.role === r.role ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header Bar */}
          <header className="h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-2xs">
            {/* Left: Synchronized Page Context & Breadcrumb */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-800 tracking-tight">
                  {navSections.flatMap(s => s.items).find(i => i.id === currentTab)?.label || 'Workspace'}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                  {currentOrg.slug}
                </span>
              </div>

              {/* Global Search Bar */}
              <div className="relative w-80 hidden md:block">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search vendor, application, tax ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setGlobalSearchOpen(true)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200/90 rounded-md text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none bg-slate-50/70 transition-all hover:bg-white"
                />

                <AnimatePresence>
                  {globalSearchOpen && searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg p-2 z-30 max-h-64 overflow-y-auto space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pb-1 border-b">
                        <span>Search Results</span>
                        <button onClick={() => setGlobalSearchOpen(false)} className="hover:text-slate-800">Close</button>
                      </div>
                      {searchResults.length === 0 ? (
                        <p className="p-3 text-xs text-slate-400 text-center">No matching records found.</p>
                      ) : (
                        searchResults.map(app => (
                          <div
                            key={app.id}
                            onClick={() => {
                              onTabChange('applications');
                              setGlobalSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="p-2 hover:bg-indigo-50/50 rounded cursor-pointer text-xs transition-colors"
                          >
                            <div className="font-semibold text-slate-900">{app.company.legalName}</div>
                            <div className="text-[11px] font-mono text-slate-500">{app.id} • {app.status} • {app.company.country}</div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Tools: Messages, Notifications, Account & Test Suite */}
            <div className="flex items-center gap-2">
              {/* Messages Center Button */}
              <button
                onClick={() => setIsMessagesOpen(true)}
                className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors relative"
                title="Procurement Messages"
              >
                <MessageSquare className="w-4 h-4" />
                {msgUnreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-1 ring-2 ring-white">
                    {msgUnreadCount}
                  </span>
                )}
              </button>

              {/* Real-Time Notifications Button & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors relative"
                  title="Notifications & Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {notifUnreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-1 ring-2 ring-white animate-pulse">
                      {notifUnreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      className="absolute right-0 top-10 w-88 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-30 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">Notifications</span>
                          {notifUnreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                              {notifUnreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          {notifUnreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-indigo-600 hover:text-indigo-800 font-semibold"
                            >
                              Mark all read
                            </button>
                          )}
                          <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                        </div>
                      </div>

                      <div className="space-y-1.5 max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-xs">
                            No notifications.
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const isCritical = notif.priority === 'CRITICAL';
                            const isHigh = notif.priority === 'HIGH';

                            return (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  markAsRead(notif.id);
                                  if (notif.actionUrl) {
                                    if (notif.actionUrl.includes('applications')) onTabChange('applications');
                                    else if (notif.actionUrl.includes('risk')) onTabChange('risk_exceptions');
                                    else if (notif.actionUrl.includes('invoices')) onTabChange('invoices_ap');
                                    setIsNotificationsOpen(false);
                                  }
                                }}
                                className={`p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                                  !notif.read
                                    ? isCritical 
                                      ? 'bg-rose-50/40 border-rose-200' 
                                      : isHigh
                                      ? 'bg-amber-50/40 border-amber-200'
                                      : 'bg-indigo-50/40 border-indigo-200'
                                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`font-semibold text-xs ${isCritical ? 'text-rose-900' : 'text-slate-900'}`}>
                                    {notif.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                  {notif.message}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Account & Security Button */}
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs hover:border-indigo-200"
                title="Account Settings & MFA"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate max-w-[120px]">{userProfile.email.split('@')[0]}</span>
                {userProfile.mfaEnabled && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" title="MFA Protected" />
                )}
              </button>

              {/* In-App Test Suite Button */}
              <button
                onClick={onOpenTestSuite}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs hover:border-emerald-300"
                title="Run in-app Vitest assertions"
              >
                <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                <span>Tests</span>
              </button>
            </div>
          </header>

          {/* Main Content Viewport */}
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Floating Real-Time Toast System */}
      <ToastContainer />

      {/* Interactive Communication Center Drawer */}
      <MessagesDrawer
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
      />
    </div>
  );
}
