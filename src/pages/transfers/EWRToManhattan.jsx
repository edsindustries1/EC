import React from 'react'
import RoutePageTemplate from './RoutePageTemplate'

export default function EWRToManhattan() {
  return (
    <RoutePageTemplate
      slug="ewr-to-manhattan"
      h1="Newark Airport to Manhattan Car Service"
      metaTitle="Newark Airport to Manhattan Car Service | Everywhere Transfers NYC"
      metaDescription="Premium Newark Airport (EWR) to Manhattan car service. Fixed prices, professional chauffeurs, no tolls surprise. Get your free quote for EWR transfers."
      priceRange="$80–$130"
      travelTime="40–70 min"
      vehicleRecommendation="Sedan / SUV"
      description="Stress-free car service from Newark Liberty International Airport to Manhattan. We handle the NJ Turnpike, tunnels, and traffic — you just relax."
      fleetImage="/images/fleet-suv.png"
      prefillPickup="Newark Liberty International Airport (EWR), Newark, NJ"
      prefillDropoff="Manhattan, New York, NY"
      faqs={[
        {
          q: 'How much does an EWR to Manhattan car service cost?',
          a: 'Our all-inclusive rates from Newark Airport to Manhattan start at $80 for a sedan. Tolls are included in the quoted price — no hidden charges at checkout.',
        },
        {
          q: 'Are tolls included in the Newark to Manhattan price?',
          a: 'Yes, all tolls and fees (including Lincoln Tunnel toll) are included in your quote. The price you see is the final price you pay.',
        },
        {
          q: 'How long is the ride from Newark Airport to Midtown Manhattan?',
          a: 'Expect 40–70 minutes depending on traffic. The Lincoln Tunnel can be congested during rush hours. We plan your pickup time based on your flight arrival to minimize waiting.',
        },
      ]}
    />
  )
}
