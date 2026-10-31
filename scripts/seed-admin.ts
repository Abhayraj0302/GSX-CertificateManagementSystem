import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../lib/mongodb'
import { getAdminEmails } from '../lib/admin'
import { User } from '../models'

async function seedAdmin() {
  const name = process.env.ADMIN_NAME?.trim()
  const emails = getAdminEmails()

  if (emails.length === 0) {
    throw new Error('Set ADMIN_EMAIL to one or more comma-separated email addresses before seeding admins')
  }

  await connectDB()

  for (const email of emails) {
    const update =
      emails.length === 1 && name
        ? {
            $set: { role: 'admin' as const, name },
            $setOnInsert: { email },
          }
        : {
            $set: { role: 'admin' as const },
            $setOnInsert: { email, name: email.split('@')[0] },
          }

    await User.findOneAndUpdate({ email }, update, { upsert: true, new: true })
    console.log(`Admin account ready for ${email}`)
  }
}

seedAdmin()
  .catch((error: unknown) => {
    console.error('Admin seed failed:', error instanceof Error ? error.message : 'Unknown error')
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
