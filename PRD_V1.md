# ServeIQ — Product Requirements Document (PRD)
## Version 1.0 — MVP

> **Status:** Pre-Development  
> **Scope:** Version 1 Only  
> **Last Updated:** June 2026

---

## 1. Executive Summary

ServeIQ V1 is the Minimum Viable Product of the Hospitality Operations Platform. It focuses on three things:

1. Enabling waiters to take and track orders digitally
2. Automatically calculating bills and generating receipts
3. Giving business owners real-time visibility into sales

Everything else is out of scope for V1.

---

## 2. Goals

| Goal | Metric |
|---|---|
| Eliminate manual calculation errors | 0 billing errors per shift |
| Reduce order time per item | Under 10 seconds per item added |
| Give owners real-time sales visibility | Dashboard reflects changes within 3 seconds |
| Make adoption easy for waiters | Usable after 15-minute training |

---

## 3. User Stories

### Business Owner / Admin

- **US-01:** As a business owner, I can register my business on ServeIQ and set up my branch, tables, and menu so I can start using the platform.
- **US-02:** As a business owner, I can create waiter accounts and assign them to my branch.
- **US-03:** As a business owner, I can see all open tabs and total sales for today at any time.
- **US-04:** As a business owner, I can see a sales summary per waiter at the end of the day.

### Waiter

- **US-05:** As a waiter, I can log in on my phone and see all tables at my branch.
- **US-06:** As a waiter, I can open a tab for a table when customers arrive.
- **US-07:** As a waiter, I can search and tap to add items to a tab.
- **US-08:** As a waiter, I can add a new round of orders to an existing open tab.
- **US-09:** As a waiter, I can view the current running total for any of my open tabs at any time.
- **US-10:** As a waiter, I can generate a bill for a table and show it to the customer.
- **US-11:** As a waiter, I can record how the customer paid and close the tab.
- **US-12:** As a waiter, I can see a receipt after payment that can be printed or shown on screen.
- **US-13:** As a waiter, I can transfer a tab to a different table if the customer moves.
- **US-14:** As a waiter, the app works even when internet is temporarily unavailable.

---

## 4. Feature Specifications

### F-01: Business Registration

**Input:** Business name, owner name, email, password, phone, address  
**Output:** Registered business, default branch created, owner account created  
**Rules:**
- Email must be unique across platform
- Branch created automatically as "Main Branch" (editable later)
- Free trial period: 30 days

---

### F-02: Menu Management

**Actor:** Business Owner / Admin  
**Input:** Category name, item name, price, unit  
**Output:** Menu items visible to waiters when ordering  
**Rules:**
- Items belong to categories
- Items can be deactivated without deletion
- Price changes take effect immediately for new orders only
- Historical orders always show the price at time of order

---

### F-03: Table Management

**Actor:** Business Owner / Admin  
**Input:** Table name, capacity  
**Output:** Tables visible in waiter app  
**Rules:**
- Tables have statuses: Available, Occupied, Reserved
- Status changes automatically when tab is opened/closed

---

### F-04: Waiter Account Management

**Actor:** Business Owner / Admin  
**Input:** Waiter name, phone/email, PIN or password  
**Output:** Waiter can log in and access branch  
**Rules:**
- Waiter belongs to one branch
- Waiter can be deactivated (not deleted)

---

### F-05: Open Tab

**Actor:** Waiter  
**Input:** Table selection, optional customer name, optional people count  
**Output:** New tab created with unique tab number (e.g., TAB-2026-00015), table marked as Occupied  
**Rules:**
- Only one open tab per table at a time
- Tab number auto-generated (sequential per branch per year)
- Waiter is linked to the tab (accountability)

---

### F-06: Add Order Items

**Actor:** Waiter  
**Input:** Menu item selection, quantity  
**Output:** Items added to current round, running total updated  
**Methods:**
- Search by name
- Browse by category
- Tap + / - for quantity  

**Rules:**
- Adds create a new round if more than 10 minutes since last item
- Each item line stores name and price as snapshot
- Running total updates immediately

---

### F-07: Add New Round

**Actor:** Waiter  
**Input:** Tab ID (already open)  
**Output:** New round created on existing tab  
**Rules:**
- Rounds help group orders by time
- A round is created automatically on first order
- Waiter can explicitly start a new round

---

### F-08: View Running Bill

**Actor:** Waiter  
**Input:** Tab ID  
**Output:** Itemized list of all rounds + running total  
**Display:**
```
TAB-2026-00015 | Table 5 | Opened: 8:42 PM

Round 1 — 8:42 PM
  Heineken (3)         ₦3,600
  Guinness (2)         ₦2,800
  Pepper Soup (1)      ₦2,500
                      --------
                       ₦8,900

Round 2 — 10:15 PM
  Heineken (2)         ₦2,400
                      --------
                       ₦2,400

TOTAL                 ₦11,300
```

---

### F-09: Transfer Tab

**Actor:** Waiter  
**Input:** Tab ID, target table  
**Output:** Tab moved to new table, original table marked Available  
**Rules:**
- Target table must be Available
- Full order history moves with the tab
- Audit log entry created

---

### F-10: Generate Bill & Close Tab

**Actor:** Waiter  
**Input:** Tab ID, payment method (Cash / Transfer / POS), optional reference number  
**Output:** Tab marked as Paid, receipt generated, table marked Available  
**Rules:**
- Bill cannot be closed without payment method selected
- Transfer and POS require reference number
- Once closed, tab is read-only
- Closure creates final receipt record

---

### F-11: Receipt

**Format:**
```
================================
         SERVEIQ
   [Business Name]
   [Branch Name]
   [Address] | [Phone]
================================
Receipt No: RCT-2026-00041
Tab No:     TAB-2026-00015
Table:      Table 5
Waiter:     Grace O.
Date:       08 Jun 2026  10:55 PM
================================

ITEM             QTY    AMOUNT
Heineken         3      ₦3,600
Guinness         2      ₦2,800
Pepper Soup      1      ₦2,500
Heineken         2      ₦2,400
--------------------------------
TOTAL                  ₦11,300

Payment Method: Cash
================================
     Thank you for visiting!
================================
```

**Delivery:**
- Display on screen (waiter shows customer)
- Download as PDF
- Print via Bluetooth thermal printer (if connected)

---

### F-12: Admin Sales Dashboard

**Actor:** Business Owner / Branch Manager  
**Displays:**
- Total revenue today
- Number of open tabs
- Number of closed tabs today
- Revenue by waiter (today)
- List of all tabs (open and closed) with status
- Each tab: table, waiter, time opened, total, status

**Updates:** Real-time via WebSocket

---

## 5. Out of Scope for V1

The following are explicitly excluded from V1:

- Payment gateway integration (Paystack, Flutterwave, etc.)
- Inventory / stock management
- Customer profiles or loyalty
- Kitchen display system
- QR code scanning for orders
- Voice order input
- Multi-branch management UI
- Cashier role (payments handled by waiter in V1)
- Advanced analytics / reporting beyond daily sales
- Expense tracking
- Employee shift scheduling

---

## 6. Acceptance Criteria

### Critical (Must Pass Before Launch)

- [ ] A waiter can open, add items to, and close a tab without any errors
- [ ] Bill total is always correct (automated test suite)
- [ ] Receipt displays correct items, quantities, prices, and total
- [ ] Admin dashboard shows accurate real-time revenue
- [ ] Tab works offline; syncs when reconnected
- [ ] No cross-business data leakage (security test)
- [ ] Waiter cannot see another waiter's closed tab totals
- [ ] Price changes do not affect historical order items

### Important (Must Pass for Good Launch)

- [ ] Adding an item takes under 10 seconds (3 taps or less)
- [ ] Dashboard loads in under 2 seconds
- [ ] App works on Android 8+ and iOS 14+
- [ ] 50 concurrent waiter sessions handled without degradation

---

## 7. Screen List

### Admin Web App
1. Register Business
2. Login
3. Dashboard (Sales Overview)
4. Tables Management
5. Menu Management (Categories + Items)
6. Waiter Management
7. Tab Detail View (read-only)
8. Settings

### Waiter Mobile App
1. Login
2. Tables Overview (with status colors)
3. Open Tab Modal
4. Tab Detail / Active Order Screen
5. Menu Browse + Item Selection
6. Running Bill View
7. Payment Recording Screen
8. Receipt Screen
9. Tab History (own tabs only)

---

*End of PRD — ServeIQ V1*
