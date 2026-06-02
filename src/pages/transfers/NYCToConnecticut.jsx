import React from 'react'
import RoutePageTemplate from './RoutePageTemplate'

export default function NYCToConnecticut() {
  return (
    <RoutePageTemplate
      slug="nyc-to-connecticut"
      h1="NYC to Connecticut Car Service"
      metaTitle="NYC to Connecticut Car Service | Everywhere Transfers NYC"
      metaDescription="Premium NYC to Connecticut car service. Greenwich, Stamford, New Haven, Hartford, and more. Fixed pricing, professional chauffeurs. Book your free quote now."
      priceRange="$120–$280"
      travelTime="1–2.5 hrs"
      vehicleRecommendation="Sedan / SUV"
      description="Comfortable car service from New York City to Connecticut destinations — Greenwich, Stamford, Westport, New Haven, Hartford, and beyond. Perfect for commuters and executives."
      fleetImage="/images/fleet-suv.png"
      prefillPickup="Manhattan, New York, NY"
      prefillDropoff="Connecticut, USA"
      faqs={[
        {
          q: 'How much is a car service from NYC to Connecticut?',
          a: 'Rates depend on your destination: Greenwich starts at $120, Stamford from $130, Westport from $150, New Haven from $180, and Hartford from $220. Get an exact quote for your destination above.',
        },
        {
          q: 'Which Connecticut cities do you service from NYC?',
          a: 'We serve all Connecticut cities and towns including Greenwich, Stamford, Norwalk, Westport, Bridgeport, New Haven, Hartford, Fairfield, Darien, and more.',
        },
        {
          q: 'Is car service better than Metro-North from NYC to Connecticut?',
          a: 'For business travelers and those with luggage, a private car service is often preferable. You get door-to-door service, avoid station connections, and have flexibility with your schedule.',
        },
      ]}
    />
  )
}
