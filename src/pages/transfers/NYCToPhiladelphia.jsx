import React from 'react'
import RoutePageTemplate from './RoutePageTemplate'

export default function NYCToPhiladelphia() {
  return (
    <RoutePageTemplate
      slug="nyc-to-philadelphia"
      h1="NYC to Philadelphia Car Service"
      metaTitle="NYC to Philadelphia Car Service | Everywhere Transfers NYC"
      metaDescription="Reliable NYC to Philadelphia car service. Fixed pricing, professional chauffeurs, door-to-door service. Beat the Amtrak with style. Get a free quote today."
      priceRange="$180–$280"
      travelTime="1.5–2.5 hrs"
      vehicleRecommendation="Sedan / SUV"
      description="Door-to-door car service from New York City to Philadelphia. Skip the Amtrak crowds and travel in comfort with a professional chauffeur — ideal for business trips and leisure travel."
      fleetImage="/images/fleet-sedan.png"
      prefillPickup="Manhattan, New York, NY"
      prefillDropoff="Philadelphia, PA"
      faqs={[
        {
          q: 'How much does a car service from NYC to Philadelphia cost?',
          a: 'Our NYC to Philadelphia car service starts at $180 for a sedan and $230 for an SUV. All tolls (NJ Turnpike, Delaware Memorial Bridge) are included in the quoted price.',
        },
        {
          q: 'How long does the drive from NYC to Philadelphia take?',
          a: 'The drive from Midtown Manhattan to Center City Philadelphia typically takes 1.5–2.5 hours depending on traffic. The NJ Turnpike can be busy during peak hours.',
        },
        {
          q: 'Do you offer one-way and round-trip NYC to Philadelphia service?',
          a: 'Yes, we offer both one-way and round-trip car service. Round-trip bookings receive a small discount. Your driver can wait in Philadelphia for your return if needed.',
        },
      ]}
    />
  )
}
