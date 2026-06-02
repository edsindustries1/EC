import React from 'react'
import RoutePageTemplate from './RoutePageTemplate'

export default function ManhattanToHamptons() {
  return (
    <RoutePageTemplate
      slug="manhattan-to-hamptons"
      h1="Manhattan to Hamptons Car Service"
      metaTitle="Manhattan to Hamptons Car Service | Everywhere Transfers NYC"
      metaDescription="Luxury Manhattan to Hamptons car service. Travel in style to the Hamptons with fixed pricing, experienced chauffeurs, and door-to-door service. Book your quote now."
      priceRange="$250–$450"
      travelTime="2–3.5 hrs"
      vehicleRecommendation="SUV / Sprinter Van"
      description="Arrive in the Hamptons in style. Our luxury car service connects Manhattan to Southampton, East Hampton, Bridgehampton, Sag Harbor, and the North Fork — without the traffic stress."
      fleetImage="/images/fleet-suv.png"
      prefillPickup="Manhattan, New York, NY"
      prefillDropoff="The Hamptons, NY"
      faqs={[
        {
          q: 'How much does a Manhattan to Hamptons car service cost?',
          a: 'Rates from Manhattan to the Hamptons start at $250 for a sedan to Southampton and $350+ for an SUV. Prices vary by destination (East Hampton, Montauk, etc.) and vehicle type. Get an exact quote above.',
        },
        {
          q: 'How long is the drive from Manhattan to the Hamptons?',
          a: 'The drive typically takes 2–3.5 hours depending on traffic and your destination. Summer weekends (especially Friday afternoons) can add significant time. We recommend booking early morning or late evening departures.',
        },
        {
          q: 'Do you offer Hamptons car service on weekends and holidays?',
          a: 'Yes, including Memorial Day, Fourth of July, and Labor Day weekend — the busiest Hamptons travel days. Book well in advance to secure your vehicle for peak weekends.',
        },
      ]}
    />
  )
}
