export const BRAND = {
  blue: '#0066FF',
  teal: '#00D9A5',
  darkBlue: '#003D99',
  lightBlue: '#E8F0FF',
  lightTeal: '#E0FAF5',
  dark: '#0F172A',
  gray: '#475569',
  lightGray: '#F8FAFC',
  white: '#FFFFFF',
  border: '#E2E8F0',
};

export interface CountrySection {
  country: string;
  flag: string;
  legislation: string[];
  workingHours: string[];
  leaveEntitlements: string[];
  minimumWage: string;
  employeeRights: string[];
  employerDuties: string[];
}

export const countries: CountrySection[] = [
  {
    country: 'Nigeria',
    flag: '🇳🇬',
    legislation: [
      'Labour Act (Cap L1 LFN 2004)',
      'Employees\' Compensation Act 2010',
      'National Minimum Wage Act 2019',
      'Pension Reform Act 2014',
      'National Health Insurance Scheme Act',
    ],
    workingHours: [
      'Maximum 8 hours per day, 40 hours per week',
      'Overtime must be compensated at higher rates',
      'Minimum 1 hour break for 8-hour workday',
      'At least 1 rest day per week',
    ],
    leaveEntitlements: [
      'Annual leave: Minimum 6 working days after 12 months',
      'Sick leave: As per company policy or collective agreement',
      'Maternity leave: 12 weeks (6 before, 6 after delivery)',
      'Public holidays: As declared by government',
    ],
    minimumWage: '₦70,000 per month (as of 2024)',
    employeeRights: [
      'Written employment contract',
      'Timely payment of agreed wages',
      'Safe and healthy work environment',
      'Freedom to join a trade union',
      'Protection from unfair dismissal',
      'Pension and health insurance contributions',
    ],
    employerDuties: [
      'Register with relevant labour authorities',
      'Provide written contracts and payslips',
      'Remit PAYE taxes and pension contributions',
      'Comply with health and safety regulations',
      'Follow due process for disciplinary actions',
      'Maintain proper employment records',
    ],
  },
  {
    country: 'South Africa',
    flag: '🇿🇦',
    legislation: [
      'Labour Relations Act 66 of 1995',
      'Basic Conditions of Employment Act 75 of 1997',
      'Employment Equity Act 55 of 1998',
      'Skills Development Act 97 of 1998',
    ],
    workingHours: [
      'Maximum 45 hours per week for most employees',
      'Overtime limited to 10 hours per week',
      'Daily meal interval of 60 minutes',
      'At least 12 hours rest between working days',
    ],
    leaveEntitlements: [
      'Annual leave: 21 consecutive days per year',
      'Sick leave: 30 days over a 3-year cycle',
      'Maternity leave: 4 months (unpaid, but UIF claimable)',
      'Family responsibility leave: 3 days per year',
    ],
    minimumWage: 'R27.58 per hour (as of 2024)',
    employeeRights: [
      'Protection against unfair dismissal (CCMA)',
      'Right to challenge unfair labour practices',
      'Employment equity and anti-discrimination protection',
      'Access to collective bargaining',
      'Whistle-blower protection',
      'Right to a fair hearing before dismissal',
    ],
    employerDuties: [
      'Register with SARS, UIF and Compensation Fund',
      'Implement Employment Equity plan',
      'Submit annual EEA2 and EEA4 reports',
      'Provide payslips showing all deductions',
      'Maintain workplace safety standards (OHS Act)',
      'Follow fair disciplinary procedures',
    ],
  },
  {
    country: 'Kenya',
    flag: '🇰🇪',
    legislation: [
      'Employment Act 2007',
      'Labour Relations Act 2007',
      'Work Injury Benefits Act 2007',
      'Occupational Safety and Health Act 2007',
    ],
    workingHours: [
      'Maximum 52 hours per week',
      'Maximum 6 consecutive days without rest',
      'Overtime paid at 1.5× normal rate',
      'Night work attracts additional allowances',
    ],
    leaveEntitlements: [
      'Annual leave: 21 working days after 12 months',
      'Sick leave: 7 days fully paid, 7 days half pay per year',
      'Maternity leave: 3 months fully paid',
      'Paternity leave: 2 weeks',
    ],
    minimumWage: 'KES 15,201/month (Nairobi, as of 2024)',
    employeeRights: [
      'Written contract within 2 months of employment',
      'Equal pay for equal work',
      'Protection from sexual harassment',
      'Right to form and join a trade union',
      'Redundancy notice and pay entitlements',
      'Access to the Employment and Labour Relations Court',
    ],
    employerDuties: [
      'Register with KRA (PIN) and NSSF/NHIF',
      'Issue written contracts within 2 months',
      'Maintain a register of employees',
      'Pay wages on agreed dates',
      'Provide a safe working environment',
      'Comply with redundancy notification procedures',
    ],
  },
  {
    country: 'Ghana',
    flag: '🇬🇭',
    legislation: [
      'Labour Act 2003 (Act 651)',
      'Workmen\'s Compensation Law 1987 (PNDCL 187)',
      'National Pensions Act 2008 (Act 766)',
      'Persons with Disability Act 2006',
    ],
    workingHours: [
      'Maximum 8 hours per day, 40 hours per week',
      'Overtime paid at 1.5× normal rate',
      'Night shift attracts additional allowances',
      'At least one full rest day per week',
    ],
    leaveEntitlements: [
      'Annual leave: 15 working days after 12 months',
      'Sick leave: As per collective agreement',
      'Maternity leave: 14 weeks (paid)',
      'Paternity leave: 1 week',
    ],
    minimumWage: 'GH₵18.15 per day (as of 2024)',
    employeeRights: [
      'Written contract or letter of appointment',
      'Timely payment at agreed intervals',
      'Safe and healthy workplace',
      'Right to belong to a trade union',
      'Protection from unlawful dismissal',
      'Access to the National Labour Commission',
    ],
    employerDuties: [
      'Register with SSNIT and GRA',
      'Issue letters of appointment/contracts',
      'Deduct and remit SSNIT contributions (13%)',
      'Provide safe tools and working environment',
      'Give reasons and notice for dismissal',
      'Maintain payroll and employment records',
    ],
  },
  {
    country: 'Ethiopia',
    flag: '🇪🇹',
    legislation: [
      'Labour Proclamation No. 1156/2019',
      'Public Servants Proclamation No. 1064/2017',
      'Employees Social Security Law',
    ],
    workingHours: [
      'Maximum 8 hours per day, 48 hours per week',
      'Overtime limited to 2 hours per day',
      'Overtime paid at 1.25× to 2× normal rate',
      'At least one rest day per week',
    ],
    leaveEntitlements: [
      'Annual leave: 16 working days (increasing with tenure)',
      'Sick leave: Up to 6 months (phased payment)',
      'Maternity leave: 90 days (30 before, 60 after birth)',
      'Paternity leave: 3 days',
    ],
    minimumWage: 'No statutory national minimum wage; sector-specific',
    employeeRights: [
      'Written employment contract',
      'Equal treatment regardless of gender or nationality',
      'Protection from arbitrary dismissal',
      'Right to organise and collective bargaining',
      'Social security (pension) coverage',
      'Safe working conditions',
    ],
    employerDuties: [
      'Register with Ethiopian Revenues and Customs Authority',
      'Contribute to employee pension fund',
      'Provide written contracts',
      'Ensure safe working conditions',
      'Follow proper termination procedures',
      'Report workplace accidents',
    ],
  },
  {
    country: 'Tanzania',
    flag: '🇹🇿',
    legislation: [
      'Employment and Labour Relations Act 2004',
      'Labour Institutions Act 2004',
      'Occupational Health and Safety Authority Act 2003',
    ],
    workingHours: [
      'Maximum 45 hours per week',
      'Maximum 9 hours per day (normal hours)',
      'Overtime paid at 1.5× normal rate (2× on holidays)',
      'Mandatory rest intervals during shifts',
    ],
    leaveEntitlements: [
      'Annual leave: 28 consecutive days after 12 months',
      'Sick leave: 126 days over a 3-year cycle (phased)',
      'Maternity leave: 84 days',
      'Paternity leave: 3 days',
    ],
    minimumWage: 'TZS 400,000/month (most sectors, as of 2023)',
    employeeRights: [
      'Written particulars of employment',
      'Non-discriminatory treatment',
      'Freedom of association',
      'Protection from unfair termination',
      'Access to the Commission for Mediation and Arbitration',
      'Social security coverage (NSSF/PPF)',
    ],
    employerDuties: [
      'Register with NSSF and TRA',
      'Provide written particulars within 6 weeks',
      'Deduct and remit NSSF contributions',
      'Comply with OHS regulations',
      'Follow fair disciplinary and termination processes',
      'Pay severance/terminal benefits where applicable',
    ],
  },
];

export const commonRights = [
  { title: 'Non-Discrimination', detail: 'Protection against discrimination based on race, gender, religion, disability, or national origin.' },
  { title: 'Fair Wages', detail: 'Right to receive agreed compensation in full and on time, including overtime entitlements.' },
  { title: 'Safe Working Conditions', detail: 'Employer has a legal duty to provide a safe, healthy workplace free from hazards.' },
  { title: 'Freedom of Association', detail: 'Right to join or form a trade union and engage in collective bargaining.' },
  { title: 'Protection from Unfair Dismissal', detail: 'Due process, proper notice, and fair reasons are required before any termination.' },
  { title: 'Social Security', detail: 'Mandatory pension, health insurance, and compensation fund contributions by employer.' },
];

export const disputeResolution = [
  'Internal grievance procedures (first step)',
  'Mediation and conciliation services',
  'Labour courts or industrial tribunals',
  'Trade union representation and negotiation',
  'Ministry of Labour or labour department intervention',
  'International Labour Organization (ILO) standards as guidance',
];

export const employerBestPractices = [
  'Stay updated on changes in employment legislation in each jurisdiction',
  'Maintain clear, written employment policies and employee handbooks',
  'Provide regular training on workplace rights and anti-harassment',
  'Document all employment decisions, warnings, and disciplinary actions',
  'Seek qualified legal advice for complex or cross-border employment matters',
  'Foster a culture of respect, equity, and inclusion',
  'Implement transparent, objective performance management systems',
  'Conduct regular internal audits of payroll and compliance records',
];

export const candidateTips = [
  'Always request a signed written contract before starting work',
  'Keep copies of your contract, payslips, and all work-related correspondence',
  'Know your country\'s statutory minimum wage and leave entitlements',
  'Report unsafe working conditions to your employer or labour authority',
  'Use your country\'s conciliation/mediation body before going to court',
  'Join a relevant trade union for collective protection and legal support',
  'Understand your notice period obligations before resigning',
  'Seek free legal aid if you cannot afford an employment lawyer',
];

export const disclaimer =
  'This guide is provided for general informational purposes only and does not constitute legal advice. Employment laws change frequently and vary significantly by country, sector, and individual circumstances. Always consult a qualified employment lawyer in the relevant jurisdiction before making any employment-related decisions. Jorbex Africa accepts no liability for actions taken in reliance on the information contained herein.';
