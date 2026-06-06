import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { compare } from 'bcryptjs';
import { UserRole } from '@/types/auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log("LOGIN ATTEMPT", credentials)

          if (!credentials?.email || !credentials?.password) {
            console.log("MISSING CREDENTIALS")
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          console.log("FOUND USER", user)

          if (!user || !user.password) {
            console.log("NO USER FOUND OR NO PASSWORD")
            return null;
          }

          const isPasswordValid = await compare((credentials.password as string).trim(), user.password);

          console.log("PASSWORD VALID", isPasswordValid)

          if (!isPasswordValid) {
            console.log("INVALID PASSWORD")
            return null;
          }

          const result = {
            id: user.id,
            email: user.email,
            name: (user as any).name || user.email.split('@')[0],
            role: (user as any).role as UserRole,
          };

          console.log("RETURNING USER", result)
          return result;
        } catch (error) {
          console.error("AUTHORIZE ERROR", error)
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
