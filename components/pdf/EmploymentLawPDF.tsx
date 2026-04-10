'use client';

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import {
  BRAND,
  countries,
  commonRights,
  disputeResolution,
  employerBestPractices,
  candidateTips,
  disclaimer,
  type CountrySection,
} from '@/lib/pdf/employmentLawContent';

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: BRAND.white,
    paddingBottom: 60,
  },

  // ── Cover page
  cover: {
    flex: 1,
    backgroundColor: BRAND.blue,
    padding: 0,
    position: 'relative',
  },
  coverTop: {
    backgroundColor: BRAND.blue,
    padding: 48,
    paddingBottom: 32,
    flex: 1,
  },
  coverBottom: {
    backgroundColor: BRAND.darkBlue,
    padding: 48,
    paddingTop: 24,
    paddingBottom: 32,
  },
  coverLogoPill: {
    backgroundColor: BRAND.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 40,
  },
  coverLogo: {
    width: 120,
    height: 36,
    objectFit: 'contain',
  },
  coverBadge: {
    backgroundColor: BRAND.teal,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  coverBadgeText: {
    color: BRAND.dark,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  coverTitle: {
    color: BRAND.white,
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.2,
    marginBottom: 16,
  },
  coverSubtitle: {
    color: '#A5C8FF',
    fontSize: 14,
    lineHeight: 1.6,
    marginBottom: 32,
  },
  coverDivider: {
    height: 2,
    backgroundColor: BRAND.teal,
    width: 60,
    marginBottom: 32,
  },
  coverMeta: {
    color: '#A5C8FF',
    fontSize: 10,
    marginBottom: 4,
  },
  coverMetaValue: {
    color: BRAND.white,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  coverCountriesLabel: {
    color: '#A5C8FF',
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  coverCountriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  coverCountryPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  coverCountryPillText: {
    color: BRAND.white,
    fontSize: 9,
  },

  // ── Header (non-cover pages)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BRAND.blue,
    paddingHorizontal: 36,
    paddingVertical: 14,
    marginBottom: 0,
  },
  headerLogoPill: {
    backgroundColor: BRAND.white,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  headerLogo: {
    width: 80,
    height: 22,
    objectFit: 'contain',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: BRAND.white,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  headerBadge: {
    backgroundColor: BRAND.teal,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 3,
  },
  headerBadgeText: {
    color: BRAND.dark,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BRAND.lightGray,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingHorizontal: 36,
    paddingVertical: 10,
  },
  footerLeft: {
    color: BRAND.gray,
    fontSize: 8,
  },
  footerRight: {
    color: BRAND.gray,
    fontSize: 8,
  },

  // ── Body
  body: {
    paddingHorizontal: 36,
    paddingTop: 24,
  },

  // ── Section heading
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.blue,
    marginBottom: 4,
    marginTop: 16,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: BRAND.teal,
    width: 40,
    marginBottom: 12,
  },
  sectionIntro: {
    fontSize: 10,
    color: BRAND.gray,
    lineHeight: 1.6,
    marginBottom: 14,
  },

  // ── Country card
  countryCard: {
    backgroundColor: BRAND.lightGray,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: BRAND.blue,
  },
  countryName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.dark,
    marginBottom: 10,
  },
  subsectionLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.blue,
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 10,
  },
  bullet: {
    fontSize: 9,
    color: BRAND.gray,
    lineHeight: 1.5,
    marginBottom: 2,
    paddingLeft: 10,
  },
  bulletDot: {
    fontSize: 9,
    color: BRAND.teal,
    fontFamily: 'Helvetica-Bold',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  minWageBox: {
    backgroundColor: BRAND.lightTeal,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  minWageLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#059669',
    marginRight: 6,
  },
  minWageValue: {
    fontSize: 9,
    color: BRAND.dark,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Rights / info cards
  infoCard: {
    backgroundColor: BRAND.white,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
    flexDirection: 'row',
  },
  infoCardAccent: {
    width: 3,
    backgroundColor: BRAND.teal,
    borderRadius: 2,
    marginRight: 10,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.dark,
    marginBottom: 2,
  },
  infoCardDetail: {
    fontSize: 9,
    color: BRAND.gray,
    lineHeight: 1.5,
  },

  // ── Tip / best-practice list
  tipRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  tipNumber: {
    width: 18,
    height: 18,
    backgroundColor: BRAND.blue,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  tipNumberText: {
    color: BRAND.white,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  tipText: {
    flex: 1,
    fontSize: 9,
    color: BRAND.gray,
    lineHeight: 1.5,
  },

  // ── Disclaimer box
  disclaimerBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginTop: 16,
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 8.5,
    color: '#78350F',
    lineHeight: 1.6,
  },

  // ── TOC
  tocRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  tocLabel: {
    fontSize: 10,
    color: BRAND.dark,
  },
  tocDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomStyle: 'dotted',
    borderBottomColor: BRAND.border,
    marginHorizontal: 8,
    marginBottom: 2,
  },
  tocPage: {
    fontSize: 9,
    color: BRAND.gray,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function BulletItem({ text }: { text: string }) {
  return (
    <View style={s.bulletRow}>
      <Text style={[s.bulletDot, { marginRight: 6, marginTop: 0.5 }]}>•</Text>
      <Text style={s.bullet}>{text}</Text>
    </View>
  );
}

function PageHeader({ audience }: { audience: 'Candidates' | 'Employers' }) {
  return (
    <View style={s.header} fixed>
      <View style={s.headerLogoPill}>
        <Image style={s.headerLogo} src="/logo.png" />
      </View>
      <View style={s.headerRight}>
        <Text style={s.headerTitle}>African Employment Law Guide 2024</Text>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeText}>For {audience}</Text>
        </View>
      </View>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerLeft}>© 2024 Jorbex Africa · jorbex.com</Text>
      <Text style={s.footerRight} render={({ pageNumber, totalPages }) =>
        `Page ${pageNumber} of ${totalPages}`
      } />
    </View>
  );
}

function CoverPage({ audience }: { audience: 'Candidates' | 'Employers' }) {
  const year = new Date().getFullYear();
  return (
    <Page size="A4" style={s.page}>
      <View style={s.cover}>
        <View style={s.coverTop}>
          <View style={s.coverLogoPill}>
            <Image style={s.coverLogo} src="/logo.png" />
          </View>

          <View style={s.coverBadge}>
            <Text style={s.coverBadgeText}>
              FOR {audience.toUpperCase()} · {year} EDITION
            </Text>
          </View>

          <Text style={s.coverTitle}>
            African Employment{'\n'}Law Guide
          </Text>
          <Text style={s.coverSubtitle}>
            A comprehensive overview of employment legislation,{'\n'}
            rights, and obligations across 6 African countries.
          </Text>

          <View style={s.coverDivider} />

          <Text style={s.coverMeta}>Covering</Text>
          <View style={s.coverCountriesRow}>
            {countries.map(c => (
              <View key={c.country} style={s.coverCountryPill}>
                <Text style={s.coverCountryPillText}>{c.country}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.coverBottom}>
          <Text style={s.coverMeta}>Published by</Text>
          <Text style={s.coverMetaValue}>Jorbex Africa · jorbex.com</Text>
          <Text style={[s.coverMeta, { marginTop: 8 }]}>
            For general informational purposes only. Not legal advice.
          </Text>
        </View>
      </View>
    </Page>
  );
}

function CountryPage({
  country,
  audience,
  showEmployerContent,
}: {
  country: CountrySection;
  audience: 'Candidates' | 'Employers';
  showEmployerContent: boolean;
}) {
  return (
    <Page size="A4" style={s.page} wrap>
      <PageHeader audience={audience} />
      <View style={s.body}>
        <Text style={s.sectionTitle}>{country.country}</Text>
        <View style={s.sectionDivider} />

        <View style={s.countryCard}>
          <Text style={s.countryName}>Key Legislation</Text>
          {country.legislation.map((l, i) => <BulletItem key={i} text={l} />)}
        </View>

        <View style={s.countryCard}>
          <Text style={s.countryName}>Working Hours</Text>
          {country.workingHours.map((l, i) => <BulletItem key={i} text={l} />)}
        </View>

        <View style={s.countryCard}>
          <Text style={s.countryName}>Leave Entitlements</Text>
          {country.leaveEntitlements.map((l, i) => <BulletItem key={i} text={l} />)}
        </View>

        <View style={s.minWageBox}>
          <Text style={s.minWageLabel}>MINIMUM WAGE</Text>
          <Text style={s.minWageValue}>{country.minimumWage}</Text>
        </View>

        {showEmployerContent ? (
          <View style={[s.countryCard, { borderLeftColor: BRAND.teal, marginTop: 12 }]}>
            <Text style={s.countryName}>Employer Obligations</Text>
            {country.employerDuties.map((d, i) => <BulletItem key={i} text={d} />)}
          </View>
        ) : (
          <View style={[s.countryCard, { borderLeftColor: BRAND.teal, marginTop: 12 }]}>
            <Text style={s.countryName}>Employee Rights</Text>
            {country.employeeRights.map((r, i) => <BulletItem key={i} text={r} />)}
          </View>
        )}
      </View>
      <PageFooter />
    </Page>
  );
}

// ─── Candidate Document ───────────────────────────────────────────────────────

export function CandidatePDF() {
  return (
    <Document
      title="African Employment Law Guide — For Candidates"
      author="Jorbex Africa"
      subject="Employment Law Guide for Candidates"
      keywords="employment law, Africa, candidates, workers, rights"
      creator="Jorbex Africa (jorbex.com)"
    >
      <CoverPage audience="Candidates" />

      {/* Country pages */}
      {countries.map(country => (
        <CountryPage
          key={country.country}
          country={country}
          audience="Candidates"
          showEmployerContent={false}
        />
      ))}

      {/* Common rights page */}
      <Page size="A4" style={s.page}>
        <PageHeader audience="Candidates" />
        <View style={s.body}>
          <Text style={s.sectionTitle}>Common Rights Across Africa</Text>
          <View style={s.sectionDivider} />
          <Text style={s.sectionIntro}>
            Despite differing legal frameworks, workers across African nations share these
            fundamental protections under both domestic law and ILO conventions.
          </Text>
          {commonRights.map((r, i) => (
            <View key={i} style={s.infoCard}>
              <View style={s.infoCardAccent} />
              <View style={s.infoCardContent}>
                <Text style={s.infoCardTitle}>{r.title}</Text>
                <Text style={s.infoCardDetail}>{r.detail}</Text>
              </View>
            </View>
          ))}

          <Text style={[s.sectionTitle, { marginTop: 20 }]}>Tips for Candidates</Text>
          <View style={s.sectionDivider} />
          {candidateTips.map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <View style={s.tipNumber}>
                <Text style={s.tipNumberText}>{i + 1}</Text>
              </View>
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}

          <Text style={[s.sectionTitle, { marginTop: 20 }]}>Dispute Resolution</Text>
          <View style={s.sectionDivider} />
          {disputeResolution.map((d, i) => <BulletItem key={i} text={d} />)}

          <View style={s.disclaimerBox}>
            <Text style={s.disclaimerTitle}>Important Disclaimer</Text>
            <Text style={s.disclaimerText}>{disclaimer}</Text>
          </View>
        </View>
        <PageFooter />
      </Page>
    </Document>
  );
}

// ─── Employer Document ────────────────────────────────────────────────────────

export function EmployerPDF() {
  return (
    <Document
      title="African Employment Law Guide — For Employers"
      author="Jorbex Africa"
      subject="Employment Law Guide for Employers"
      keywords="employment law, Africa, employers, compliance, obligations"
      creator="Jorbex Africa (jorbex.com)"
    >
      <CoverPage audience="Employers" />

      {/* Country pages */}
      {countries.map(country => (
        <CountryPage
          key={country.country}
          country={country}
          audience="Employers"
          showEmployerContent={true}
        />
      ))}

      {/* Common obligations + best practices page */}
      <Page size="A4" style={s.page}>
        <PageHeader audience="Employers" />
        <View style={s.body}>
          <Text style={s.sectionTitle}>Common Employer Obligations</Text>
          <View style={s.sectionDivider} />
          <Text style={s.sectionIntro}>
            Regardless of jurisdiction, employers operating in Africa share these core
            legal and ethical responsibilities toward their workforce.
          </Text>
          {commonRights.map((r, i) => (
            <View key={i} style={s.infoCard}>
              <View style={s.infoCardAccent} />
              <View style={s.infoCardContent}>
                <Text style={s.infoCardTitle}>{r.title}</Text>
                <Text style={s.infoCardDetail}>{r.detail}</Text>
              </View>
            </View>
          ))}

          <Text style={[s.sectionTitle, { marginTop: 20 }]}>Best Practices for Employers</Text>
          <View style={s.sectionDivider} />
          {employerBestPractices.map((bp, i) => (
            <View key={i} style={s.tipRow}>
              <View style={s.tipNumber}>
                <Text style={s.tipNumberText}>{i + 1}</Text>
              </View>
              <Text style={s.tipText}>{bp}</Text>
            </View>
          ))}

          <Text style={[s.sectionTitle, { marginTop: 20 }]}>Dispute Resolution</Text>
          <View style={s.sectionDivider} />
          {disputeResolution.map((d, i) => <BulletItem key={i} text={d} />)}

          <View style={s.disclaimerBox}>
            <Text style={s.disclaimerTitle}>Important Disclaimer</Text>
            <Text style={s.disclaimerText}>{disclaimer}</Text>
          </View>
        </View>
        <PageFooter />
      </Page>
    </Document>
  );
}
