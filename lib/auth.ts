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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.userType) {
          console.error('Missing credentials');
          return null;
        }

        try {
          const normalizedEmail = credentials.email.toLowerCase().trim();

          let user: { id: string; email: string; name: string; password: string } | null = null;

          if (credentials.userType === 'candidate') {
            user = await prisma.candidate.findUnique({
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
          return null;
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.userType = token.userType as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
