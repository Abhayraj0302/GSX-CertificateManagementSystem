import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../lib/mongodb'
import { User } from '../models'

async function seedAdmin() {
  const name = process.env.ADMIN_NAME?.trim()
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()

  if (!name || !email) {
    throw new Error('Set ADMIN_NAME and ADMIN_EMAIL before seeding an admin')
  }

  await connectDB()

  const admin = await User.findOne({ email })
  if (admin) {
    admin.name = name
    admin.role = 'admin'
    await admin.save()
  } else {
    await User.create({ name, email, role: 'admin' })
  }

  console.log(`Admin account ready for ${email}`)
}

seedAdmin()
  .catch((error: unknown) => {
    console.error('Admin seed failed:', error instanceof Error ? error.message : 'Unknown error')
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
