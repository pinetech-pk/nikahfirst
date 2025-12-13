import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // IMPORTANT: Return the role here
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // ← Make sure this is included
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Update lastLoginAt timestamp on successful login
      if (user?.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle relative URLs (like /dashboard)
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Handle absolute URLs that start with the base URL
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default to base URL for safety
      return baseUrl;
    },
    async session({ token, session }) {
      // CRITICAL: Pass role from token to session
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.role = token.role as any; // ← This line is CRITICAL
      }
      return session;
    },
    async jwt({ token, user }) {
      // CRITICAL: Store role in JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role; // ← This line is CRITICAL
      }
      return token;
    },
  },
};
