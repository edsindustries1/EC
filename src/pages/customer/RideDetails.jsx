import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function RideDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Forward to the uber-style reservation page if id looks like a reservation reference.
  // Otherwise just send the user to their trips list.
  useEffect(() => {
    if (id && /^EC-/i.test(id)) navigate(`/reservation/${id}`, { replace: true })
    else navigate('/my-rides', { replace: true })
  }, [id, navigate])

  return null
}
