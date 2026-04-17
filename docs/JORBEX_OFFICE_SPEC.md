# Technical Specification: Jorbex Office (JO)
## Remote Workforce Management & Visibility Infrastructure

### 1. Vision
Jorbex Office (JO) is the "Day-to-Day" operating layer for companies employing African talent. It solves the **Remote Trust Deficit** by providing real-time visibility and automated accountability without necessitating intrusive surveillance.

---

### 2. Data Architecture (Prisma/PostgreSQL)
JO leverages the existing `EmploymentRecord` as its root and adds high-frequency attendance tracking.

#### New Model: `AttendanceSession`
```prisma
model AttendanceSession {
  id                  String           @id @default(uuid())
  employmentRecordId  String
  employmentRecord    EmploymentRecord @relation(fields: [employmentRecordId], references: [id], onDelete: Cascade)
  
  clockIn             DateTime         @default(now())
  clockOut            DateTime?
  
  // Geolocation (Optional/Enterprise)
  ipAddress           String?
  lat                 Float?
  lng                 Float?
  
  // Activity Metadata
  status              WorkStatus       @default(ACTIVE)
  totalActiveMinutes  Int              @default(0)
  totalIdleMinutes    Int              @default(0)
  
  overtimeMinutes     Int              @default(0)
  
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
}

enum WorkStatus {
  ACTIVE
  IDLE
  ON_BREAK
  OFFLINE
}
```

---

### 3. Real-Time Visibility Architecture
JO utilizes the **LiveKit Metadata API** for sub-second status updates across the team dashboard.

- **The Heartbeat Loop**: The Jorbex Client (Web/Mobile) sends a lightweight "Heartbeat" every 60 seconds.
- **State Logic**: 
    - **Active**: Mouse/Keyboard activity detected within the last 5 minutes.
    - **Idle**: No activity for 5+ minutes (triggers PWA Push Notification: *"Are you still there?"*).
    - **Offline**: No heartbeat for 10 minutes.
- **The "Command Center" View**: Employers see a grid of their team with "Traffic Light" indicators (Green = Active, Yellow = Idle, Gray = Offline).

---

### 4. Overtime & Payroll Automation
JO is natively linked to the **Frappe ERP** integration for a "Zero-Touch" payroll experience.

1. **Daily Calculation**: `AttendanceSession` calculates `totalMinutes` vs. `expectedMinutes` (defined in the contract).
2. **Overtime Logic**: Excess minutes are flagged as `overtimeMinutes` and require "Manager Approval" in the JO dashboard.
3. **The Disbursement Loop**: On the 25th of every month, JO pushes summarized totals to Frappe, which generates the Paystack/Stripe disbursement file.

---

### 5. Mobile & Connectivity Strategy
Designed for the African reality (intermittent power and high data costs).

- **Offline Clock-out**: If internet drops, the PWA stores the `clockOut` timestamp locally (IndexedDB) and syncs it immediately upon reconnection.
- **Low-Data "Lean Heatmaps"**: Employers get a "Time Heatmap" of their team's week, allowing them to spot internet/power trends in specific regions (e.g., *"Team in Nairobi is offline due to regional power outage"*).

---

### 6. Security & Integrity
- **Anti-Spoofing**: Cross-references IP addresses with the Candidate's known location.
- **Verification Loop**: Randomly prompts for a "Selfie-Check" using the **Face-API** proctoring engine during high-value sessions.

---
**Lead Architect, Jorbex**
*Version 1.0 - Draft for Phase 2 Implementation*
