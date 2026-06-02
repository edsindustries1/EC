import React from 'react'
import RoutePageTemplate from './RoutePageTemplate'

export default function JFKToManhattan() {
  return (
    <RoutePageTemplate
      slug="jfk-to-manhattan"
      h1="JFK Airport to Manhattan Car Service"
      metaTitle="JFK Airport to Manhattan Car Service | Everywhere Transfers NYC"
      metaDescription="Book reliable JFK Airport to Manhattan car service. Fixed prices, professional drivers, meet & greet. Sedans, SUVs, and vans available 24/7. Get a free quote now."
      priceRange="$75–$120"
      travelTime="45–75 min"
      vehicleRecommendation="Sedan / SUV"
      description="Professional, punctual car service from JFK Airport to any Manhattan destination. We track your flight, meet you in arrivals, and get you to your destination stress-free."
      fleetImage="/images/fleet-sedan.png"
      prefillPickup="John F. Kennedy International Airport (JFK), Jamaica, NY"
      prefillDropoff="Manhattan, New York, NY"
      faqs={[
        {
          q: 'How much does a car from JFK to Manhattan cost?',
          a: 'Our fixed rates for JFK to Manhattan start at $75 for a sedan and $95 for an SUV, depending on your destination in Manhattan. There are no surge charges or hidden fees.',
        },
        {
          q: 'How long does it take to get from JFK to Manhattan?',
          a: 'The trip typically takes 45–75 minutes depending on traffic. Rush hour (7–9 AM and 4–7 PM) can add 20–30 minutes. We monitor conditions and adjust pickup timing accordingly.',
        },
        {
          q: 'Will my driver wait if my flight is delayed?',
          a: 'Yes. We track your flight in real-time and your driver will be there when you land, no matter the delay. There are no extra charges for flight delays.',
        },
      ]}
    />
  )
}
