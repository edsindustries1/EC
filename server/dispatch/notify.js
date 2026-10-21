// Customer notifications when a booking's status changes because of dispatch.
// Email today; push notifications plug in here once FCM/APNs are configured.

import { sendTripUpdateEmail } from '../emailService.js'

const EMAIL_ON = new Set(['assigned', 'arrived', 'completed', 'cancelled', 'no_show'])

export async function notifyTripUpdate(booking, leg, previousStatus) {
  if (!booking || !EMAIL_ON.has(booking.status) || booking.status === previousStatus) return
  await sendTripUpdateEmail({
    to: booking.email,
    status: booking.status,
    name: booking.name,
    reference: booking.reference,
    pickup: leg?.pickup?.address || booking.pickup,
    dropoff: leg?.dropoff?.address || booking.dropoff,
    leg,
  })
}
