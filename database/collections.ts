import { collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from './firebase-config';
import { 
  VendorApplication, 
  AuditEvent, 
  NotificationRecord, 
  MessageRecord 
} from './schema';

// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  APPLICATIONS: 'applications',
  AUDIT_LOGS: 'audit_logs',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
} as const;

// Helper to create typed collection references
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

export const usersCollection = createCollection(COLLECTIONS.USERS);
export const applicationsCollection = createCollection<VendorApplication>(COLLECTIONS.APPLICATIONS);
export const auditLogsCollection = createCollection<AuditEvent>(COLLECTIONS.AUDIT_LOGS);
export const notificationsCollection = createCollection<NotificationRecord>(COLLECTIONS.NOTIFICATIONS);
export const messagesCollection = createCollection<MessageRecord>(COLLECTIONS.MESSAGES);
