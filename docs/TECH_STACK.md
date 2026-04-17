# Jorbex: Technology Stack & Architectural Overview
## Seed Funding Presentation - Q2 2026

### 1. Executive Summary
Jorbex is built on a modern, distributed architecture designed for **extreme scalability**, **real-time engagement**, and **regulatory compliance** across the African continent. Our stack is strategically chosen to minimize latency in low-bandwidth environments while providing enterprise-grade features for multinational employers, including an **internalized interview engine** and **skill assessment suite**.

---

### 2. Core Foundation
| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (React 19)** | Server-Side Rendering (SSR) for SEO and instant page loads; React 19 for seamless state management. |
| **Language** | **TypeScript** | Strict typing across the full stack to ensure code reliability and minimize production bugs. |
| **Internationalization**| **next-intl / i18next** | Comprehensive support for **English, French, Arabic (RTL), and Portuguese**, covering 95% of Africa's GDP. |
| **Styling** | **Tailwind CSS v4** | Modern, utility-first styling for rapid UI development and high-performance rendering. |
| **Animations** | **Framer Motion** | Premium, fluid interactions that enhance the user experience and perceived value. |

---

### 3. Distributed Data & Persistence
We utilize a robust relational model to handle complex multi-tenant relationships (Employers, Candidates, Institutional Portals).

- **Primary Database**: **PostgreSQL** — Chosen for ACID compliance and complex joining capabilities required for recruitment workflows.
- **ORM**: **Prisma** — Type-safe database access layer that accelerates development and ensures schema integrity.
- **File Storage**: **AWS S3 / MinIO** — Distributed object storage for resumes, payslips, and interview recordings.
- **Caching**: **SWR (Stale-While-Revalidate)** — Optimistic UI updates and efficient client-side data fetching.

---

### 4. Proprietary Systems & Communication Moat
We have internalized critical recruitment workflows to ensure data privacy and a seamless user experience.

- **Internal Video Interview System**: A custom-built, native WebRTC solution (powered by **LiveKit**) that eliminates the need for 3rd-party tools like Zoom. Includes server-side recording and bandwidth optimization for African networks.
- **Assessment & Testing Engine**: A comprehensive tool for creating and managing custom aptitude tests. Features include:
    - Multi-format question banks (MCQ, Logic, Video-response).
    - **Biometric Proctoring** (Face-API.js) to monitor candidate behavior (tab-switching, impersonation).
    - Automated scoring and "Verified Talent" badge generation.
- **Enterprise Messaging**: **Mattermost Integration** — Dedicated collaboration channels for hiring teams and institutional partners.
- **Notification Engine**: **Novu** — A unified API for Multi-channel delivery (In-App, Push, Email, Mattermost, ntfy).

---

### 5. Mobile & Access Strategy
To dominate the African market, Jorbex employs a hybrid strategy that ensures accessibility across all device tiers.

- **Hybrid Native (Capacitor)**: High-performance wrapper for iOS and Android deployment, providing access to native device APIs.
- **Progressive Web App (PWA)**: Offline-first capabilities via service workers, allowing candidates in low-connectivity areas to manage profiles and view jobs.
- **Modern UI Components**: **Konsta UI / MobileUI** — Mobile-native look and feel using standard web technologies.

---

### 6. FinTech & Payroll (EOR) Layer
Jorbex is not just a job board; it is an **Employer of Record (EOR)** platform that handles the full employment lifecycle.

- **Payment Gateways**:
    - **Paystack**: Deep integration for African-wide collections and salary disbursements.
    - **Stripe**: Global payment processing for international employers.
- **Payroll Integration**: **Frappe ERP** — Automated salary slip generation and institutional payroll management.
- **Multi-Currency Support**: Real-time conversion across NGN, GHS, KES, ZAR, USD, and more.

---

### 7. Core Dependencies & Production Libraries
We utilize industry-standard, high-performance packages to drive our core engines.

| Domain | Key Packages |
| :--- | :--- |
| **Media/Video** | `@livekit/components-react`, `livekit-client`, `livekit-server-sdk` |
| **Identity/Auth** | `next-auth`, `bcryptjs` |
| **Data/Cloud** | `@prisma/client`, `@aws-sdk/client-s3`, `mongoose`, `mongodb` |
| **Fintech** | `paystack`, `stripe` |
| **Real-time** | `@novu/api`, `web-push`, `axios` |
| **Verification** | `face-api.js` |
| **Globalization** | `next-intl`, `next-i18next` |
| **Mobile/UI** | `@capacitor/core`, `framer-motion`, `konsta`, `mobileui` |

---

### 8. Security & Compliance
- **Regulatory Governance**: Built-in consent tracking and data governance modeling for **GDPR**, **NDPR**, and **POPIA**.
- **Data Integrity**: Cryptographic hashing for passwords and secure document handling for payslips.

---

### 9. The Roadmap: Scaling to Millions
1. **Edge Deployment**: Moving compute closer to users in major African hubs.
2. **AI Matching**: Transitioning from rule-based to LLM-powered candidate-job alignment.
3. **Institutional Scalability**: Modular "Programme Portals" currently serving Universities and Government initiatives.

---
**Technical Lead, Jorbex**
*Contact: engineering@jorbex.africa*
