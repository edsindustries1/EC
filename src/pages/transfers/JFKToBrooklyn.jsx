import React from 'react'
import RoutePageTemplate from './RoutePageTemplate'

export default function JFKToBrooklyn() {
  return (
    <RoutePageTemplate
      slug="jfk-to-brooklyn"
      h1="JFK Airport to Brooklyn Car Service"
      metaTitle="JFK Airport to Brooklyn Car Service | Everywhere Transfers NYC"
      metaDescription="Book JFK Airport to Brooklyn car service. Fixed prices, professional drivers, all Brooklyn neighborhoods covered. Get a free quote — no registration needed."
      priceRange="$55–$85"
      travelTime="30–60 min"
      vehicleRecommendation="Sedan / SUV"
      description="Direct car service from JFK Airport to all Brooklyn neighborhoods — Park Slope, Williamsburg, DUMBO, Brooklyn Heights, and more. Quick, comfortable, and affordable."
      fleetImage="/images/fleet-sedan.png"
      prefillPickup="John F. Kennedy International Airport (JFK), Jamaica, NY"
      prefillDropoff="Brooklyn, New York, NY"
      faqs={[
        {
          q: 'How much does a car from JFK to Brooklyn cost?',
          a: 'Rides from JFK to Brooklyn start at $55 for a sedan. The exact price depends on your Brooklyn destination. All quotes are fixed — no surge pricing.',
        },
        {
          q: 'Which Brooklyn neighborhoods do you serve from JFK?',
          a: 'We serve all Brooklyn neighborhoods including Park Slope, Williamsburg, DUMBO, Brooklyn Heights, Flatbush, Canarsie, Bay Ridge, and everywhere in between.',
        },
        {
          q: 'Is a car service faster than the AirTrain + subway from JFK to Brooklyn?',
          a: 'Door-to-door, a car service is significantly faster and more convenient, especially with luggage. The AirTrain + subway can take 60–90 minutes. Our direct car service takes 30–60 minutes.',
        },
      ]}
    />
  )
}
