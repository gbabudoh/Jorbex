import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import dbConnect from './dbConnect';
import Candidate from '@/models/Candidate';
import Employer from '@/models/Employer';

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
          await dbConnect();

          // Normalize email to lowercase to match database storage
          const normalizedEmail = credentials.email.toLowerCase().trim();
          
          const UserModel = credentials.userType === 'candidate' ? Candidate : Employer;
          const user = await UserModel.findOne({ email: normalizedEmail }).select('+password');

          if (!user) {
            console.error(`User not found: ${normalizedEmail}`);
            return null;
          }

          if (!user.password) {
            console.error('User password field is missing');
            return null;
          }

          const isPasswordValid = await user.comparePassword(credentials.password);

          if (!isPasswordValid) {
            console.error('Invalid password for user:', normalizedEmail);
            return null;
          }

          return {
            id: user._id.toString(),
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

