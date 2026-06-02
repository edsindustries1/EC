import React from 'react'
import RoutePageTemplate from './RoutePageTemplate'

export default function LGAToManhattan() {
  return (
    <RoutePageTemplate
      slug="lga-to-manhattan"
      h1="LaGuardia Airport to Manhattan Car Service"
      metaTitle="LaGuardia Airport to Manhattan Car Service | Everywhere Transfers NYC"
      metaDescription="Reliable LaGuardia Airport (LGA) to Manhattan car service. Fixed prices, professional drivers, meet & greet included. Book your free quote today."
      priceRange="$55–$90"
      travelTime="25–50 min"
      vehicleRecommendation="Sedan / SUV"
      description="Quick and comfortable car service from LaGuardia Airport to Manhattan. The closest major airport to midtown — let us handle the traffic while you relax."
      fleetImage="/images/fleet-sedan.png"
      prefillPickup="LaGuardia Airport (LGA), Queens, NY"
      prefillDropoff="Manhattan, New York, NY"
      faqs={[
        {
          q: 'How much is a car service from LaGuardia to Manhattan?',
          a: 'Fixed rates from LaGuardia to Manhattan start at $55 for a sedan. SUVs start at $75. All prices are fixed — no surge pricing, no surprises.',
        },
        {
          q: 'Is LaGuardia closer to Manhattan than JFK?',
          a: 'Yes. LaGuardia is the closest major airport to Midtown Manhattan, typically 25–50 minutes by car depending on traffic. It\'s an excellent choice for business travelers.',
        },
        {
          q: 'Do you offer early morning and late night pickups from LGA?',
          a: 'Absolutely. We operate 24/7, 365 days a year. Early flights, red-eyes, holidays — we\'re always available. Book in advance for guaranteed availability.',
        },
      ]}
    />
  )
}
