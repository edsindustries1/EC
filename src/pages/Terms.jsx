import React from 'react'
import { Legal } from './Privacy'

const SECTIONS = [
  { title: 'Agreement to terms',     body: 'By accessing and using Everywhere Transfers, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree, please do not use this service.' },
  { title: 'Use of the service',     body: 'Permission is granted to use Everywhere Transfers to book transportation services for personal or business use. You are responsible for maintaining the confidentiality of your account credentials.' },
  { title: 'Cancellations & refunds', body: 'Free cancellation is available up to 4 hours before your scheduled pickup. Within 4 hours of pickup, a cancellation fee may apply. Refunds are processed to the original payment method within 5–10 business days.' },
  { title: 'Pricing & payment',      body: 'Quoted prices are the price you pay — there is no surge pricing or hidden fees. Gratuity is included. Payment is collected at the time of the trip unless otherwise arranged.' },
  { title: 'Disclaimer',             body: 'The service is provided on an "as is" basis. Everywhere Transfers makes no warranties, expressed or implied, regarding fitness for a particular purpose beyond standard duty of care obligations.' },
  { title: 'Limitations',            body: 'In no event shall Everywhere Transfers or its suppliers be liable for any damages arising out of the use or inability to use the service, beyond what is required by applicable law.' },
  { title: 'Contact',                body: 'Questions? Email legal@everywheretransfers.com or call (718) 658-6000.' },
]

export default function Terms() {
  return <Legal title="Terms of Service" lead="Please read these terms carefully before using Everywhere Transfers." sections={SECTIONS}/>
}
