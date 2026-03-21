# Jorbex Monetisation Guide

> Complete reference for the billing system, pricing, payment flows, and revenue operations.

---

## Table of Contents

1. [Business Model Overview](#1-business-model-overview)
2. [Who Pays](#2-who-pays)
3. [Plan & Pricing](#3-plan--pricing)
4. [Currency & Payment Routing](#4-currency--payment-routing)
5. [Subscription Lifecycle](#5-subscription-lifecycle)
6. [Payment Flows — Stripe](#6-payment-flows--stripe)
7. [Payment Flows — Paystack](#7-payment-flows--paystack)
8. [Cancellation & Refunds](#8-cancellation--refunds)
9. [Access Control](#9-access-control)
10. [Admin & Reporting](#10-admin--reporting)
11. [Environment Variables](#11-environment-variables)
12. [Key Files Reference](#12-key-files-reference)
13. [Production Checklist](#13-production-checklist)

---

## 1. Business Model Overview

Jorbex operates a **freemium B2B SaaS** model:

- **Candidates** use the platform entirely for free — forever, no card required.
- **Employers** start on a free trial, then pay a flat monthly or yearly subscription for full access.
- There is **one plan tier** (Premium). No per-seat pricing, no usage limits, no feature gating between tiers.
- Billing is **recurring** — employers are auto-charged at the end of each period until they cancel.

---

## 2. Who Pays

| User type | Cost | Card required |
|-----------|------|---------------|
| Candidate | Free | No |
| Employer (Trial) | Free | No |
| Employer (Premium) | See pricing table | Yes |

Candidates never pay. The product is free for job seekers — this drives supply and makes the employer product valuable.

---

## 3. Plan & Pricing

One plan: **Jorbex Premium**. Two billing periods: **Monthly** and **Yearly** (yearly saves ~17%).

### African currencies — processed by Paystack

| Country | Currency | Monthly | Yearly | Monthly equiv. |
|---------|----------|---------|--------|----------------|
| Nigeria | NGN ₦ | ₦3,000 | ₦30,000 | ₦2,500 |
| Kenya | KES KSh | KSh 350 | KSh 3,500 | KSh 292 |
| Ghana | GHS ₵ | ₵35 | ₵350 | ₵29 |
| South Africa | ZAR R | R50 | R500 | R42 |
| Egypt | EGP E£ | E£90 | E£900 | E£75 |
| Tanzania | TZS TSh | TSh 7,500 | TSh 75,000 | TSh 6,250 |
| Uganda | UGX USh | USh 11,000 | USh 110,000 | USh 9,167 |
| West Africa (WAEMU) | XOF CFA | CFA 1,800 | CFA 18,000 | CFA 1,500 |
| Morocco | MAD DH | DH 30 | DH 300 | DH 25 |
| Rwanda | RWF FRw | FRw 35,000 | FRw 350,000 | FRw 29,167 |

> XOF (CFA Franc) covers Senegal, Côte d'Ivoire, Benin, Burkina Faso, Mali, Niger, and Togo.

### International currencies — processed by Stripe

| Region | Currency | Monthly | Yearly | Monthly equiv. |
|--------|----------|---------|--------|----------------|
| United States | USD $ | $25 | $250 | $20.83 |
| Europe | EUR € | €23 | €230 | €19.17 |
| United Kingdom | GBP £ | £20 | £200 | £16.67 |
| Canada | CAD CA$ | CA$33 | CA$330 | CA$27.50 |
| Australia | AUD A$ | A$38 | A$380 | A$31.67 |
| Singapore | SGD S$ | S$33 | S$330 | S$27.50 |
| UAE | AED د.إ | د.إ92 | د.إ920 | د.إ76.67 |

All prices are approximately equivalent to **USD $25/month** at the time of launch.

### Features included

- Unlimited candidate searches with advanced filters & skills matching
- Custom aptitude assessments with proctoring (face detection)
- Interview scheduling & in-app video calls
- Employment records & payroll calculator tools
- Priority support
- Cancel anytime

---

## 4. Currency & Payment Routing

The payment provider is determined automatically by the currency the employer selects.

```
Employer selects currency
         │
         ▼
isAfricanCurrency(code)?
    ├── YES → Paystack  (NGN, KES, GHS, ZAR, EGP, TZS, UGX, XOF, MAD, RWF)
    └── NO  → Stripe    (USD, EUR, GBP, CAD, AUD, SGD, AED)
```

**Auto-detection:** On the subscription page, the employer's country is detected via `ipapi.co/json` and the default currency is pre-selected accordingly. The employer can override this manually.

**Country → Currency mapping** (from `lib/currency.ts`):

| ISO codes | Currency |
|-----------|----------|
| NG | NGN |
| KE | KES |
| GH | GHS |
| ZA | ZAR |
| EG | EGP |
| TZ | TZS |
| UG | UGX |
| RW | RWF |
| MA | MAD |
| SN, CI, BJ, BF, ML, NE, TG | XOF |
| US, NZ, CH | USD |
| GB | GBP |
| CA | CAD |
| AU | AUD |
| SG | SGD |
| AE | AED |
| IE, DE, FR, IT, ES, NL, BE, PT, AT | EUR |

---

## 5. Subscription Lifecycle

```
Register as employer
        │
        ▼
   ┌─ TRIAL ─────────────────────────────────────────────────┐
   │  Free access. No card required.                          │
   │  Ends when employer subscribes or is manually expired.   │
   └──────────────────────────────────────────────────────────┘
        │
        │ Employer pays
        ▼
   ┌─ ACTIVE ────────────────────────────────────────────────┐
   │  Full access. Auto-renews each billing period.          │
   │  subscriptionEndDate updated on each renewal webhook.   │
   └──────────────────────────────────────────────────────────┘
        │                              │
        │ Employer cancels             │ Payment fails OR
        ▼                              │ period ends without renewal
   ┌─ CANCELLED ─────────┐             ▼
   │  Access continues   │        ┌─ EXPIRED ─────────────────┐
   │  until period end.  │        │  No access. Must re-sub.  │
   │  No more renewals.  │        └───────────────────────────┘
   └─────────────────────┘
        │
        │ subscriptionEndDate passes
        ▼
   ┌─ EXPIRED ─────────────────┐
   │  No access. Must re-sub.  │
   └───────────────────────────┘
```

**Auto-expiry:** `checkSubscription()` in `lib/subscription.ts` is called on every protected employer request. If `subscriptionStatus === 'ACTIVE'` but `subscriptionEndDate < now`, it automatically flips the status to `EXPIRED` in the database and denies access.

---

## 6. Payment Flows — Stripe

Used for: USD, EUR, GBP, CAD, AUD, SGD, AED

### Subscribe (initial checkout)

```
Employer clicks Subscribe
        │
        ▼
POST /api/v1/billing/subscribe
  { currency: "USD", billingPeriod: "monthly" }
        │
        ▼
createCheckoutSession() in lib/stripe.ts
  mode: "subscription"
  recurring: { interval: "month" }
  subscription_data.metadata: { employerId, billingPeriod, currencyCode }
        │
        ▼
Returns { authorization_url, session_id }
        │
        ▼
Browser redirects to Stripe Checkout page
        │
        ▼
Employer pays
        │
        ├── SUCCESS → Stripe sends checkout.session.completed webhook
        │              → /api/v1/billing/stripe
        │              → DB: subscriptionStatus=ACTIVE, stripeSubscriptionId stored
        │              → Redirect to /employer/subscription?success=stripe
        │
        └── CANCEL  → Redirect to /employer/subscription?cancelled=true
```

### Webhook events handled (`/api/v1/billing/stripe`)

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Set ACTIVE, store `stripeSubscriptionId` + `stripeCustomerId`, compute end date from billing period |
| `invoice.payment_succeeded` | Renewal — retrieve subscription metadata, recompute end date, update DB to ACTIVE |
| `customer.subscription.deleted` | Subscription ended (cancelled at period end, or payment failure) — set EXPIRED |

> `invoice.payment_succeeded` with `billing_reason === 'subscription_create'` is skipped (handled by `checkout.session.completed`).

### Cancel

```
Employer clicks Cancel Plan
        │
        ▼
DELETE /api/v1/billing/subscription
        │
        ▼
stripe.subscriptions.update(stripeSubId, { cancel_at_period_end: true })
  → No immediate cutoff. Stripe will fire customer.subscription.deleted
    at the end of the billing period.
        │
        ▼
DB: subscriptionStatus = CANCELLED
  Access continues until subscriptionEndDate.
```

---

## 7. Payment Flows — Paystack

Used for: NGN, KES, GHS, ZAR, EGP, TZS, UGX, XOF, MAD, RWF

### Plans

Paystack recurring billing requires a **Plan** object. Plans are resolved as follows:

1. Check environment variable `PAYSTACK_PLAN_{CURRENCY}_{PERIOD}` (e.g. `PAYSTACK_PLAN_NGN_MONTHLY`)
2. If not set: call `POST /plan` on Paystack API to create the plan dynamically and log the plan code to the server console
3. The logged plan code should be added to `.env` so future requests use the cached plan

**Recommended:** Create plans in the Paystack dashboard before launch and set the env vars. This avoids API calls on the subscribe route.

### Subscribe (initial checkout)

```
Employer clicks Subscribe
        │
        ▼
POST /api/v1/billing/subscribe
  { currency: "NGN", billingPeriod: "monthly" }
        │
        ▼
getOrCreatePaystackPlan("NGN", "monthly", amount)
  → Returns plan code (e.g. PLN_xxxxxxxx)
        │
        ▼
initializePayment({ email, amount, reference, plan: planCode, metadata })
  → Returns authorization_url
        │
        ▼
Browser redirects to Paystack checkout page
        │
        ▼
Employer pays
        │
        ├── SUCCESS → Paystack fires subscription.create + charge.success webhooks
        │              → /api/v1/billing/webhook
        │              → DB: ACTIVE, paystackSubscriptionCode + paystackEmailToken stored
        │              → Redirect to /employer/subscription?success=paystack
        │
        └── CANCEL  → Redirect back (no action)
```

### Webhook events handled (`/api/v1/billing/webhook`)

| Event | Action |
|-------|--------|
| `subscription.create` | Set ACTIVE, store `paystackSubscriptionCode`, store `paystackEmailToken` (needed for cancellation) |
| `charge.success` | Fallback activation if `subscription.create` is delayed; skips if already ACTIVE |
| `invoice.update` (paid=true) | Renewal — update `subscriptionEndDate` from `next_payment_date` |
| `subscription.disable` | Subscription cancelled or disabled — set EXPIRED |
| `subscription.not_renew` | Subscription set to not renew — set EXPIRED |

All webhooks are verified via **HMAC-SHA512** using `PAYSTACK_SECRET_KEY`.

### Cancel

```
Employer clicks Cancel Plan
        │
        ▼
DELETE /api/v1/billing/subscription
        │
        ▼
disableSubscription(paystackSubscriptionCode, paystackEmailToken)
  → POST /subscription/disable on Paystack API
  → Stops future renewals immediately
        │
        ▼
DB: subscriptionStatus = CANCELLED
  Access continues until subscriptionEndDate.
```

> The `paystackEmailToken` is stored in the `Employer` table when `subscription.create` fires. It is required by the Paystack API to disable a subscription.

---

## 8. Cancellation & Refunds

### Cancellation policy (as shown on the pricing page)
- Cancel anytime from `/employer/subscription`
- Full access is retained until the end of the current billing period
- No partial refunds for unused days within a period
- A 7-day money-back guarantee applies on the first payment

### How it works technically
- **Stripe:** `cancel_at_period_end: true` — Stripe stops auto-renewing. The `customer.subscription.deleted` webhook fires at period end and sets the DB to EXPIRED.
- **Paystack:** `disableSubscription()` calls Paystack's disable API immediately. The `subscription.disable` webhook confirms and the DB is updated.

---

## 9. Access Control

Every protected employer API route calls `requireSubscription(employerId)` from `lib/subscription.ts`.

```typescript
// Returns null if access is granted
// Returns { error, subscriptionRequired: true, status } if blocked
await requireSubscription(employerId);
```

Access is granted if `subscriptionStatus` is either:
- `TRIAL` — free trial period
- `ACTIVE` — paid and not expired

Access is **denied** for: `EXPIRED`, `CANCELLED` (past end date), `NOT_FOUND`.

The frontend receives `{ subscriptionRequired: true }` in the API response and redirects to the subscription/pricing page.

---

## 10. Admin & Reporting

### Admin subscription view
`GET /api/admin/subscriptions` — paginated list of all employer subscriptions.

Query params:
- `page` (default: 1)
- `limit` (default: 20)
- `status` — filter by `TRIAL`, `ACTIVE`, `CANCELLED`, `EXPIRED`

Returns: `{ employers[], total, page, limit }` with fields:
- `id`, `name`, `companyName`, `email`
- `subscriptionStatus`, `subscriptionStartDate`, `subscriptionEndDate`
- `paystackCustomerCode`, `paystackSubscriptionCode`
- `createdAt`

### Database fields on the `Employer` model

| Field | Description |
|-------|-------------|
| `subscriptionStatus` | `TRIAL` \| `ACTIVE` \| `CANCELLED` \| `EXPIRED` |
| `subscriptionStartDate` | Date of first payment |
| `subscriptionEndDate` | Date access expires |
| `billingPeriod` | `"monthly"` \| `"yearly"` |
| `paymentProvider` | `"stripe"` \| `"paystack"` |
| `stripeCustomerId` | Stored after first Stripe checkout |
| `stripeSubscriptionId` | Used for cancel and renewal tracking |
| `paystackCustomerCode` | Paystack customer identifier |
| `paystackSubscriptionCode` | Used for cancel and renewal tracking |
| `paystackEmailToken` | Required to call Paystack disable subscription API |

---

## 11. Environment Variables

### Required for billing to function

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...    # From Stripe Dashboard → Webhooks

# App URL (used in redirect URLs)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Paystack plan codes (set after first run or from Paystack dashboard)

```env
PAYSTACK_PLAN_NGN_MONTHLY=PLN_...
PAYSTACK_PLAN_NGN_YEARLY=PLN_...
PAYSTACK_PLAN_KES_MONTHLY=PLN_...
PAYSTACK_PLAN_KES_YEARLY=PLN_...
PAYSTACK_PLAN_GHS_MONTHLY=PLN_...
PAYSTACK_PLAN_GHS_YEARLY=PLN_...
PAYSTACK_PLAN_ZAR_MONTHLY=PLN_...
PAYSTACK_PLAN_ZAR_YEARLY=PLN_...
PAYSTACK_PLAN_EGP_MONTHLY=PLN_...
PAYSTACK_PLAN_EGP_YEARLY=PLN_...
PAYSTACK_PLAN_TZS_MONTHLY=PLN_...
PAYSTACK_PLAN_TZS_YEARLY=PLN_...
PAYSTACK_PLAN_UGX_MONTHLY=PLN_...
PAYSTACK_PLAN_UGX_YEARLY=PLN_...
PAYSTACK_PLAN_XOF_MONTHLY=PLN_...
PAYSTACK_PLAN_XOF_YEARLY=PLN_...
PAYSTACK_PLAN_MAD_MONTHLY=PLN_...
PAYSTACK_PLAN_MAD_YEARLY=PLN_...
PAYSTACK_PLAN_RWF_MONTHLY=PLN_...
PAYSTACK_PLAN_RWF_YEARLY=PLN_...
```

> If a plan env var is not set, the system creates the plan automatically on the first subscribe request and logs `[Paystack] Created plan. Add to env: PAYSTACK_PLAN_NGN_MONTHLY=PLN_xxx` to the server console.

---

## 12. Key Files Reference

| File | Purpose |
|------|---------|
| `lib/currency.ts` | All pricing data, currency configs, country→currency mapping, `isAfricanCurrency()`, `detectUserCountry()` |
| `lib/stripe.ts` | Stripe client, price lookup, `createCheckoutSession()` |
| `lib/paystack.ts` | Paystack helpers: `initializePayment`, `createPlan`, `getOrCreatePaystackPlan`, `disableSubscription` |
| `lib/subscription.ts` | `checkSubscription()`, `requireSubscription()` — DB-level access gating |
| `app/api/v1/billing/subscribe/route.ts` | POST — initiates payment via Paystack or Stripe |
| `app/api/v1/billing/subscription/route.ts` | GET — fetch subscription state; DELETE — cancel |
| `app/api/v1/billing/stripe/route.ts` | Stripe webhook handler |
| `app/api/v1/billing/webhook/route.ts` | Paystack webhook handler + redirect GET |
| `app/employer/subscription/page.tsx` | Pricing page + active subscription management UI |
| `app/api/admin/subscriptions/route.ts` | Admin: paginated employer subscription list |

---

## 13. Production Checklist

Before going live with billing:

### Stripe
- [ ] Create a Stripe account and activate live mode
- [ ] Add webhook endpoint in Stripe Dashboard: `https://yourdomain.com/api/v1/billing/stripe`
- [ ] Select webhook events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
- [ ] Copy the webhook signing secret → set `STRIPE_WEBHOOK_SECRET` in env
- [ ] Set `STRIPE_SECRET_KEY` to live key (not `sk_test_...`)

### Paystack
- [ ] Create a Paystack account and complete business verification
- [ ] Add webhook URL in Paystack Dashboard → Settings → API Keys & Webhooks: `https://yourdomain.com/api/v1/billing/webhook`
- [ ] Set `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` to live keys
- [ ] Subscribe once per currency to auto-create plans, then copy the logged plan codes into env vars (or create plans manually in the Paystack dashboard and copy codes)

### General
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain — required for payment redirect URLs
- [ ] Verify the `/employer/subscription` page loads correctly and auto-detects currency
- [ ] Test a full payment cycle end-to-end in Stripe test mode before switching to live keys
- [ ] Test cancellation and confirm access remains until period end
