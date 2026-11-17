# VendorIQ Database Architecture

## Overview
VendorIQ implements a hybrid enterprise data storage model designed for high security, multi-tenancy, and audit compliance:

1. **Cloud Firestore (Persistent Identity & Security)**:
   - Stores user profiles, enterprise credentials, and RFC 6238 TOTP Multi-Factor Authentication (MFA) secrets.
   - Enforces granular security rules (`firestore.rules`) with immutable append-only constraints on compliance audit trails.

2. **In-Memory & Cache-Backed State (Backend Engine & Reactive Client)**:
   - Evaluates the 12-rule deterministic validation engine in memory with microsecond latency.
   - Replicated across the REST API and synchronized with client-side reactive storage.

3. **Enterprise Collections**:
   - `users`: User identity, RBAC roles (`reviewer`, `approver`, `administrator`, `auditor`, `vendor`), MFA enrollment status.
   - `applications`: Vendor onboarding filings with status, risk scores, extracted document OCR data, and validation results.
   - `audit_logs`: Append-only immutable ledger recording actor, previous value, new value, reason, and cryptographic evidence.
   - `notifications`: Real-time alerts for procurement officers (security holds, document expirations, variance flags).
   - `messages`: Bidirectional vendor & reviewer communications.

## Security Rules (`firestore.rules`)
- Read/Write restricted to authenticated users matching `@terybi.com` corporate email.
- `audit_logs` collection explicitly forbids updates and deletions (`allow update, delete: if false;`).
