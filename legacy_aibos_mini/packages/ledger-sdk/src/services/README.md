# Treasury & Intercompany Module (Enterprise Grade)

This package provides a fully isolated, enterprise-grade solution for treasury and intercompany fund management, including:
- REST API backend (Express, TypeScript)
- React frontend dashboard (TypeScript)
- Shared types/interfaces

## Features
- Create, list, and view intercompany transfers
- View and reconcile intercompany balances
- Audit logging and validation
- Modular, extensible, and secure

## Structure
- `/api` — Express REST API (TypeScript)
- `/ui` — React dashboard (TypeScript)
- `/types` — Shared TypeScript types/interfaces

## Quick Start
1. Install dependencies in `/api` and `/ui`
2. Start backend: `cd api && npm run dev`
3. Start frontend: `cd ui && npm start`

## Example API Usage
- `POST /api/transfers` — Create a transfer
- `GET /api/transfers` — List transfers
- `GET /api/balances` — List balances

## Example UI
![UI Screenshot](./ui-screenshot.png)

---
For integration or extension, see code comments and API docs in `/api`.
