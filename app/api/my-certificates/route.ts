import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import connectDB from '@/lib/mongodb'
import { Certificate, Event, Participant, User } from '@/models'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await connectDB()

    if (!isAdminEmail(email)) {
      const user = await User.findOne({ email }).select('emailVerifiedAt')
      if (!user?.emailVerifiedAt) {
        return NextResponse.json({ error: 'Verify your email before viewing certificates' }, { status: 403 })
      }
    }

    const participants = await Participant.find({
      email,
      certificateIssued: true,
      certificateId: { $exists: true, $ne: null },
    }).select('_id')

    if (participants.length === 0) {
      return NextResponse.json({ certificates: [] })
    }

    const certificates = await Certificate.find({
      participantId: { $in: participants.map((participant) => participant._id) },
    })
      .select('certificateId issuedAt certificateType position eventId')
      .sort({ issuedAt: -1 })
      .lean()

    const events = await Event.find({
      _id: { $in: certificates.map((certificate) => certificate.eventId) },
    })
      .select('name date')
      .lean()
    const eventsById = new Map(events.map((event) => [String(event._id), event]))

    return NextResponse.json({
      certificates: certificates.map((certificate) => {
        const event = eventsById.get(String(certificate.eventId))
        return {
          certificateId: certificate.certificateId,
          issuedAt: certificate.issuedAt,
          certificateType: certificate.certificateType,
          position: certificate.position,
          event: event ? { name: event.name, date: event.date } : null,
        }
      }),
    })
  } catch (error) {
    console.error('Get user certificates error:', error)
    return NextResponse.json(
      { error: 'Failed to load your certificates' },
      { status: 500 }
    )
  }
}
