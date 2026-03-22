import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' },
        accessCode: { label: 'Access Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.userType) {
          console.error('Missing credentials');
          return null;
        }

        try {
          const normalizedEmail = credentials.email.toLowerCase().trim();

          // ── Portal user login (University / Corporate) ──────────────────
          if (credentials.userType === 'portal_user') {
            const portalUser = await prisma.programmeUser.findUnique({
              where: { email: normalizedEmail },
              select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
                isActive: true,
                portal: {
                  select: {
                    id: true,
                    type: true,
                    slug: true,
                    institutionName: true,
                    status: true,
                  },
                },
              },
            });

            if (!portalUser) {
              console.error(`Portal user not found: ${normalizedEmail}`);
              return null;
            }

            if (!portalUser.isActive) {
              console.error(`Portal user inactive: ${normalizedEmail}`);
              throw new Error('UserInactive');
            }

            if (portalUser.portal.status !== 'ACTIVE') {
              console.error(`Portal not active for: ${normalizedEmail}, status: ${portalUser.portal.status}`);
              throw new Error('PortalPending');
            }

            const isPasswordValid = await compare(credentials.password, portalUser.password);
            if (!isPasswordValid) {
              console.error('Invalid password for portal user:', normalizedEmail);
              return null;
            }

            return {
              id: portalUser.id,
              email: portalUser.email,
              name: portalUser.name,
              userType: 'portal_user',
              portalId: portalUser.portal.id,
              portalType: portalUser.portal.type,
              portalSlug: portalUser.portal.slug,
              portalName: portalUser.portal.institutionName,
            };
          }

          // ── Government access code login ────────────────────────────────
          if (credentials.userType === 'portal_gov') {
            // email field carries portal slug; password field carries access code
            const accessCode = await prisma.programmeAccessCode.findFirst({
              where: {
                code: credentials.password,
                portal: { slug: credentials.email },
                isActive: true,
                AND: [
                  {
                    OR: [
                      { expiresAt: null },
                      { expiresAt: { gt: new Date() } },
                    ],
                  },
                ],
              },
              include: { portal: true },
            });

            if (!accessCode) {
              console.error(`Invalid or expired access code for slug: ${credentials.email}`);
              return null;
            }

            // Update usage stats
            await prisma.programmeAccessCode.update({
              where: { id: accessCode.id },
              data: {
                lastUsedAt: new Date(),
                usedCount: { increment: 1 },
              },
            });

            return {
              id: accessCode.id,
              email: accessCode.code,
              name: accessCode.portal.institutionName,
              userType: 'portal_gov',
              portalId: accessCode.portal.id,
              portalType: 'GOVERNMENT',
              portalSlug: accessCode.portal.slug,
              portalName: accessCode.portal.institutionName,
            };
          }

          // ── Standard user logins ────────────────────────────────────────
          let user: { id: string; email: string; name: string; password: string } | null = null;

          if (credentials.userType === 'candidate') {
            user = await prisma.candidate.findUnique({
              where: { email: normalizedEmail },
              select: { id: true, email: true, name: true, password: true },
            });
          } else if (credentials.userType === 'admin') {
            user = await prisma.admin.findUnique({
              where: { email: normalizedEmail },
              select: { id: true, email: true, name: true, password: true },
            });
          } else {
            user = await prisma.employer.findUnique({
              where: { email: normalizedEmail },
              select: { id: true, email: true, name: true, password: true },
            });
          }

          if (!user) {
            console.error(`User not found: ${normalizedEmail}`);
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.error('Invalid password for user:', normalizedEmail);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: credentials.userType,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType;
        token.id = user.id;
        if (user.portalId)   token.portalId   = user.portalId;
        if (user.portalType) token.portalType = user.portalType;
        if (user.portalSlug) token.portalSlug = user.portalSlug;
        if (user.portalName) token.portalName = user.portalName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.userType  = token.userType  as string;
        session.user.id        = token.id        as string;
        if (token.portalId)   session.user.portalId   = token.portalId   as string;
        if (token.portalType) session.user.portalType = token.portalType as string;
        if (token.portalSlug) session.user.portalSlug = token.portalSlug as string;
        if (token.portalName) session.user.portalName = token.portalName as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
