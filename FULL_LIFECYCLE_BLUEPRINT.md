# ServeIQ — Full Lifecycle Development Blueprint
## "Build with the End in View"

This blueprint consolidates the entire ServeIQ lifecycle, from the MVP (Version 1) through to the AI-powered Enterprise scale (Version 4). It is the canonical source of truth for architectural evolution and feature delivery.

---

## 1. Core Philosophy: The "End in View" Protocol

Every line of code and architectural decision in V1 must account for the platform's V4 state.

- **Multitenancy by Default**: Every table has `business_id` and `branch_id`. A single-branch bar in V1 can become a 50-branch franchise in V4 without schema migrations.
- **Financial Immutability**: All transactions are snapshotted. Price changes in the menu never corrupt historical reports.
- **Audit-First**: Financial movements are never "deleted"; they are voided with a reason and a permanent audit trail.
- **Offline Resilience**: The system assumes the internet will fail. The core ordering logic resides on the device, with the cloud acting as the authoritative record and analytics engine.

---

## 2. Full Lifecycle Roadmap

### Stage 1: Foundation (V1 — The MVP)
**Theme**: *"Every Naira Accounted For"*
- **Core Features**: Table grid, digital tabs, round-based ordering, automated billing, thermal receipts, live sales dashboard.
- **Success Outcome**: Waiters stop using paper; owners see revenue in real-time.

### Stage 2: Operations Depth (V2)
**Theme**: *"Complete Control & Efficiency"*
- **Core Features**: Dedicated Cashier Module, Shift Management, Split Bills, Basic Inventory (Stock In/Out), Multi-payment reconciliation.
- **Success Outcome**: Management can detect revenue leakage and manage inventory levels vs. sales.

### Stage 3: Business Intelligence (V3)
**Theme**: *"Data-Driven Decisions"*
- **Core Features**: Advanced Analytics (Peak hours, best-sellers), Financial P&L summaries, Loyalty Programs, Payment Gateway Integration (Paystack/Flutterwave).
- **Success Outcome**: The platform becomes a growth engine, helping owners optimize menus and reward loyal customers.

### Stage 4: AI & Scale (V4)
**Theme**: *"The Intelligent Operating System"*
- **Core Features**: Voice Order Capture (Speech-to-Structured Order), AI Fraud Detection, Sales Forecasting, Full Multi-Branch/Franchise Management.
- **Success Outcome**: AI predicts inventory needs and identifies anomalies before they become losses.

---

## 3. The Feature Matrix (V1–V4)

| Domain | V1 (Foundation) | V2 (Operations) | V3 (Intelligence) | V4 (AI & Scale) |
|---|---|---|---|---|
| **Ordering** | Multi-round capture | Table Transfers | Customer tagging | Voice Order Capture |
| **Billing** | Screen + PDF Bill | Split Bills | Automated verify | Fraud Detection |
| **Payments** | Manual recording | Reconciliation | Paystack/Flutterwave | AI anomaly flagging |
| **Management** | Live Sales | Shift Reports | P&L Summaries | Sales Forecasting |
| **Inventory**| N/A | Stock tracking | Variance Reports | Smart Reordering |
| **Customers** | N/A | Names on tabs | Loyalty Points | Visit Predictions |

---

## 4. Technical Architecture Lifecycle

### 4.1 Database Design (Scalable)
- **Primary Schema**: UUID v4, UTC timestamps, `deleted_at` for all records.
- **Money**: `DECIMAL(12,2)` or integer kobo — absolute precision.
- **Audit Engine**: A central `audit_logs` table tracking every `action`, `user_id`, and `payload`.

### 4.2 API Strategy
- **Restful Evolution**: Versioned endpoints (`/v1`, `/v2`).
- **Real-time**: WebSocket (Socket.IO) for instant state updates to Manager dashboards.
- **Security**: JWT with 15m access / 7d refresh tokens; strict `BranchScopeGuard`.

### 4.3 Frontend Evolution
- **Admin**: Angular (Standalone) dashboard evolving into a multi-branch BI tool.
- **Waiter**: Ionic + Capacitor for mobile deployment + SQLite for offline sync.

---

## 5. Critical Processes

### 5.1 Offline Sync Protocol
1. **Mutation**: Waiter adds item → Saved to local SQLite + Added to Sync Queue.
2. **Detection**: Background service checks connectivity.
3. **Transmission**: Queue items sent sequentially.
4. **Resilience**: Server-side "Last Write Wins" with timestamp resolution.

### 5.2 Shift Reconciliation (V2+)
- **Opening**: Record starting cash.
- **Operation**: Log all Cash, Transfer, and POS payments.
- **Closing**: Compare system "Expected" vs. cashier "Reported" cash. Flag variance > 1%.

### 5.3 Audit & Reconciliation
- Immutable logs ensure that any "Voided" item can be traced to a user.
- Daily automated reconciliation report generated at 12:00 AM.

---

## 6. Development Stages

1. **Phase 1 (Month 1–2)**: Core API, Multi-tenancy, Auth, and the basic Waiter Order Flow.
2. **Phase 2 (Month 3)**: Admin Dashboard completion, Billing Engine, and Receipt generation.
3. **Phase 3 (Month 4–5)**: Offline Sync engine refinement and V2 Cashier/Shift modules.
4. **Phase 4 (Month 6+)**: Integration of V3 (Payments/Loyalty) and R&D for V4 (AI).

---

## 7. Non-Negotiables for Development
- **No Hard Deletes**.
- **No Float for Money**.
- **Always scope to branch_id**.
- **Snapshot price at order time**.

---
*Blueprint Version 1.0 — Generated June 10, 2026*
