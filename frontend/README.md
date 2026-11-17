# VendorIQ Frontend

Modern enterprise React 19 application built with Vite, Tailwind CSS v4, and Motion.

## Structure
- `src/components/`: Modular enterprise UI components (Workspace, Review Queue, Risk & Exceptions, Invoices & AP, Applications, Audit, Auth).
- `src/services/`: API client (`api.ts`), SSE notification broadcaster (`notificationService.ts`), and in-app messaging (`messageService.ts`).
- `src/hooks/`: React hooks for real-time notifications, messaging, and asynchronous queries.
- `src/styles/`: Theme tokens, enterprise colors, and micro-animations.
- `src/lib/`: Rules engine, storage, MFA, and motion animations.

## Development
```bash
npm run dev
```
Runs the Vite development server on port 3000.
