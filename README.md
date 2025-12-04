# Jorbex - African Employment Platform 🌍

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)

A modern, mobile-first job matching and recruitment platform designed to empower African talent and employers. Jorbex connects verified candidates with quality job opportunities across the African continent.

## 🎯 Mission

Empowering African talent and employers through innovative recruitment solutions that bridge the gap between job seekers and companies across the continent.

## ✨ Key Features

### 👤 For Candidates

- **🎓 Skill Verification System**
  - Pass a 10-question logical aptitude test to join the platform
  - Get verified talent badge upon successful completion
  - Showcase aptitude scores to potential employers

- **📋 Comprehensive Profile Management**
  - Create detailed professional profiles
  - Add work history with descriptions
  - List up to 5 top skills
  - Include professional references
  - Write personal statements
  - Track profile completeness and strength

- **🌐 Multi-Language Support**
  - English, French, Arabic, and Portuguese
  - Localized content for diverse African markets
  - Seamless language switching

- **📊 Career Resources**
  - Resume writing tips and templates
  - Interview preparation guides
  - Skills development resources
  - Career planning tools

### 🏢 For Employers

- **💼 Job Management**
  - Post unlimited job listings
  - Manage applications efficiently
  - Track candidate progress
  - Automated application workflows

- **🔍 Advanced Candidate Search**
  - Filter by expertise, skills, and location
  - View aptitude scores and verified status
  - Access comprehensive candidate profiles
  - Save and shortlist candidates

- **📝 Custom Assessment Builder**
  - Create custom aptitude tests
  - Dynamic test generation based on candidate skills
  - Automated scoring and pass/fail results
  - Detailed score breakdowns

- **💳 Flexible Pricing Plans**
  - **Basic**: ₦3,000/month - Essential features
  - **Professional**: ₦7,500/month - Advanced tools
  - **Enterprise**: ₦15,000/month - Full platform access
  - 30-day free trial for new employers

### 🌍 Multi-Currency Support

Support for major African currencies:
- 🇳🇬 Nigerian Naira (NGN)
- 💵 US Dollar (USD)
- 🇬🇭 Ghanaian Cedi (GHS)
- 🇰🇪 Kenyan Shilling (KES)
- 🇿🇦 South African Rand (ZAR)
- 🇸🇳 West African CFA Franc (XOF)
- 🇨🇲 Central African CFA Franc (XAF)
- 🇪🇬 Egyptian Pound (EGP)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4
- **State Management**: React Context + SWR
- **Forms**: Custom form components

### Backend
- **API**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js (Credentials Provider)
- **Payment Processing**: Paystack Integration

### Mobile
- **Framework**: Capacitor.js
- **Platforms**: iOS & Android
- **Approach**: PWA wrapped as native app

### Development Tools
- **Linting**: ESLint
- **Code Formatting**: Prettier (via IDE)
- **Version Control**: Git & GitHub

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- Paystack account for payments

### 1. Clone the Repository
```bash
git clone https://github.com/gbabudoh/Jorbex.git
cd Jorbex
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Optional
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Building for Mobile

### Android Build
```bash
npm run build
npm run cap:android
```

### iOS Build (macOS only)
```bash
npm run build
npm run cap:ios
```

### Sync Capacitor
```bash
npx cap sync
```

## 🗂️ Project Structure

```
/Jorbex
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page
│   ├── (candidate)/              # Candidate routes
│   │   ├── dashboard/            # Candidate dashboard
│   │   ├── profile/              # Profile management
│   │   └── onboarding/           # Onboarding test
│   ├── (employer)/               # Employer routes
│   │   ├── dashboard/            # Employer dashboard
│   │   ├── jobs/                 # Job management
│   │   ├── candidates/           # Candidate search
│   │   └── subscription/         # Subscription management
│   ├── api/                      # API routes
│   │   └── v1/                   # API version 1
│   │       ├── auth/             # Auth endpoints
│   │       ├── candidates/       # Candidate endpoints
│   │       ├── employers/        # Employer endpoints
│   │       └── jobs/             # Job endpoints
│   ├── employment-law/           # Employment law resources
│   ├── resources/                # Career resources
│   ├── privacy/                  # Privacy policy
│   ├── terms/                    # Terms of service
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── shared/                   # Shared components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   └── providers/                # Context providers
│       └── SessionProvider.tsx
├── lib/                          # Utility functions
│   ├── auth.ts                   # Auth utilities
│   ├── dbConnect.ts              # Database connection
│   ├── currency.ts               # Currency utilities
│   ├── paystack.ts               # Paystack integration
│   ├── utils.ts                  # General utilities
│   └── LanguageContext.tsx       # i18n context
├── models/                       # MongoDB Mongoose models
│   ├── User.ts
│   ├── Job.ts
│   ├── Application.ts
│   └── ...
├── public/                       # Static assets
│   ├── locales/                  # Translation files
│   │   ├── en/                   # English
│   │   ├── fr/                   # French
│   │   ├── ar/                   # Arabic
│   │   └── pt/                   # Portuguese
│   └── images/
├── types/                        # TypeScript type definitions
├── capacitor.config.ts           # Capacitor configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## 🔐 Authentication Flow

### Candidate Registration
1. User signs up with email and password
2. Selects expertise area
3. Takes 10-question aptitude test
4. Must score 70% or higher to pass
5. Account activated upon passing

### Employer Registration
1. User signs up with company details
2. Account immediately activated
3. 30-day free trial begins
4. Subscription required after trial

### Session Management
- JWT-based authentication via NextAuth.js
- Secure HTTP-only cookies
- Role-based access control (candidate/employer)

## 💳 Payment Integration

### Paystack Setup
- Monthly subscriptions for employers
- Webhook handling for payment verification
- Automatic subscription renewal
- Payment history tracking

### Subscription Tiers
| Plan | Price (NGN) | Features |
|------|-------------|----------|
| Basic | ₦3,000/mo | Essential job posting & candidate search |
| Professional | ₦7,500/mo | Advanced tools + custom assessments |
| Enterprise | ₦15,000/mo | Full platform access + priority support |

## 🌐 Internationalization (i18n)

### Supported Languages
- 🇬🇧 English (en)
- 🇫🇷 French (fr)
- 🇸🇦 Arabic (ar)
- 🇧🇷 Portuguese (pt)

### Translation Files
Located in `public/locales/{language}/common.json`

### Usage
```typescript
import { useLanguage } from '@/lib/LanguageContext';

const { t, language, setLanguage } = useLanguage();

// Use translations
<h1>{t('homepage.title')}</h1>
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy automatically

### MongoDB Atlas Setup
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist Vercel IP addresses
3. Get connection string
4. Add to `MONGODB_URI` environment variable

### Environment Variables in Production
Ensure all environment variables from `.env.local` are added to your hosting platform.

## 📊 Database Schema

### User Model
- Email, password (hashed)
- Role (candidate/employer)
- Profile information
- Onboarding test results
- Subscription status

### Job Model
- Title, description, requirements
- Employer reference
- Location, salary range
- Application deadline
- Status (active/closed)

### Application Model
- Candidate reference
- Job reference
- Status (pending/reviewed/accepted/rejected)
- Application date
- Cover letter

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📝 API Documentation

### Base URL
```
Development: http://localhost:3000/api/v1
Production: https://jorbex.com/api/v1
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user

#### Candidates
- `GET /api/v1/candidates/profile` - Get candidate profile
- `PUT /api/v1/candidates/profile` - Update profile
- `POST /api/v1/candidates/onboarding` - Submit test

#### Employers
- `GET /api/v1/employers/candidates` - Search candidates
- `POST /api/v1/employers/jobs` - Create job posting
- `GET /api/v1/employers/applications` - View applications

#### Jobs
- `GET /api/v1/jobs` - List all jobs
- `GET /api/v1/jobs/:id` - Get job details
- `POST /api/v1/jobs/:id/apply` - Apply to job

## 🤝 Contributing

This is a private project. For contribution guidelines, please contact the maintainers.

## 📄 License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

## 👥 Team

- **Developer**: [Your Name]
- **GitHub**: [@gbabudoh](https://github.com/gbabudoh)

## 📞 Support

For support, email support@jorbex.com or open an issue on GitHub.

## 🔗 Links

- **Website**: [https://jorbex.com](https://jorbex.com)
- **GitHub**: [https://github.com/gbabudoh/Jorbex](https://github.com/gbabudoh/Jorbex)
- **Documentation**: [See ABOUT_JORBEX.md](./ABOUT_JORBEX.md)

---

**Made with ❤️ for Africa**
