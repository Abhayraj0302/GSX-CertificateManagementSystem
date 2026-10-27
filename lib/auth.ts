import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import connectDB from './mongodb'
import { User } from '@/models'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const primaryAdminEmail = 'abhayroyal56@gmail.com'

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
      const isPrimaryAdmin = email === primaryAdminEmail
      await User.findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            email,
            name: user.name?.trim() || email.split('@')[0],
            ...(!isPrimaryAdmin ? { role: 'user' } : {}),
          },
          $set: {
            emailVerifiedAt: new Date(),
            ...(isPrimaryAdmin ? { role: 'admin' } : {}),
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
          const databaseUser = await User.findOne({
            email: user.email.trim().toLowerCase(),
          }).select('_id role')

          if (!databaseUser) {
            throw new Error('Could not load the signed-in account')
          }

          token.id = databaseUser._id.toString()
          token.role = databaseUser.role
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
        session.user.role = token.role
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
