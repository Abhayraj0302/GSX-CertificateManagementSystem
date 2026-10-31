import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import connectDB from './mongodb'
import { isAdminEmail } from './admin'
import { User } from '@/models'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
  throw new Error('Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured')
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') {
        return true
      }

      const email = user.email?.trim().toLowerCase()
      if (!email || !profile || !('email_verified' in profile) || profile.email_verified !== true) {
        return false
      }

      await connectDB()
      await User.findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            email,
            name: user.name?.trim() || email.split('@')[0],
          },
          $set: {
            emailVerifiedAt: new Date(),
            role: isAdminEmail(email) ? 'admin' : 'user',
          },
        },
        { upsert: true, new: true }
      )

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google' && user.email) {
          await connectDB()
          const email = user.email.trim().toLowerCase()
          const databaseUser = await User.findOne({
            email,
          }).select('_id')

          if (!databaseUser) {
            throw new Error('Could not load the signed-in account')
          }

          token.id = databaseUser._id.toString()
          token.role = isAdminEmail(email) ? 'admin' : 'user'
        } else {
          token.id = user.id
          token.role = user.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = isAdminEmail(session.user.email) ? 'admin' : 'user'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
}
