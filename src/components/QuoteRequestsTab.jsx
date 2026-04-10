import React, { useState, useEffect } from 'react'
import { FiPhone, FiMail, FiMapPin, FiUsers, FiClock, FiRefreshCw, FiMessageCircle, FiDollarSign, FiX, FiTruck } from 'react-icons/fi'
import { format } from 'date-fns'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  new: 'bg-orange-100 text-orange-700 border-orange-200',
  contacted: 'bg-blue-100 text-blue-700 border-blue-200',
  booked: 'bg-green-100 text-green-700 border-green-200',
}

const VEHICLE_LABELS = {
  sedan: 'Sedan',
  suv: 'SUV',
  sprinter_van: 'Sprinter Van',
  mini_bus: 'Mini Bus',
  coach: 'Coach',
}

function SendBidModal({ lead, onClose, onBidSent }) {
  const [price, setPrice] = useState('')
  const [vehicleType, setVehicleType] = useState(lead.vehicle_type || 'sedan')
  const [etaMinutes, setEtaMinutes] = useState(30)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast.error('Please enter a valid price')
      return
    }
    setSubmitting(true)
    try {
      await api.patch(`/quote-requests/${lead.id}`, {
        bid_price: Number(price),
        vehicle_type: vehicleType,
        eta_minutes: Number(etaMinutes),
        notes,
        status: 'contacted',
      })
      toast.success('Bid sent successfully!')
      onBidSent(lead.id)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send bid')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Send a Bid</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              For {lead.name} — {lead.pickup} → {lead.dropoff}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Price ($) *
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="number"
                min="1"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 120"
                required
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Vehicle Type
            </label>
            <div className="relative">
              <FiTruck className="absolute left-3 top-3 text-gray-400" size={16} />
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition appearance-none bg-white"
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="sprinter_van">Sprinter Van</option>
                <option value="mini_bus">Mini Bus</option>
                <option value="coach">Coach Bus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Estimated Pickup Time (minutes)
            </label>
            <div className="relative">
              <FiClock className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="number"
                min="5"
                max="240"
                value={etaMinutes}
                onChange={(e) => setEtaMinutes(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Ready in ~{etaMinutes} min</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Complimentary water and Wi-Fi included..."
              rows="2"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-[#1a365d] text-white font-bold rounded-xl hover:bg-[#0f1f3d] transition text-sm disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function QuoteRequestsTab() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [bidModalLead, setBidModalLead] = useState(null)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await api.get('/quote-requests')
      const sorted = (res.data.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setLeads(sorted)
    } catch (err) {
      toast.error('Failed to load quote requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await api.patch(`/quote-requests/${id}/status`, { status })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
      toast.success(`Status updated to "${status}"`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleBidSent = (id) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'contacted' } : l))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <FiRefreshCw size={24} className="animate-spin mr-2" />
        Loading quote requests...
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <FiMessageCircle size={40} className="mx-auto mb-4 opacity-40" />
        <p className="font-medium">No quote requests yet</p>
        <p className="text-sm mt-1">They'll appear here when customers submit the public quote form.</p>
        <button onClick={fetchLeads} className="mt-4 text-blue-600 hover:underline text-sm flex items-center gap-1 mx-auto">
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>
    )
  }

  const newCount = leads.filter(l => l.status === 'new').length

  return (
    <div>
      {bidModalLead && (
        <SendBidModal
          lead={bidModalLead}
          onClose={() => setBidModalLead(null)}
          onBidSent={handleBidSent}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Quote Requests</h2>
          {newCount > 0 && (
            <p className="text-sm text-orange-600 font-medium mt-1">
              {newCount} new {newCount === 1 ? 'lead' : 'leads'} need attention
            </p>
          )}
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="space-y-4">
        {leads.map(lead => (
          <div
            key={lead.id}
            className={`bg-white rounded-xl border-2 p-5 transition-shadow hover:shadow-md ${
              lead.status === 'new' ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="font-bold text-gray-900 text-lg">{lead.name}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border capitalize ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                    {lead.status}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <FiClock size={11} />
                    {format(new Date(lead.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-600 mb-3">
                  <div className="flex items-start gap-2">
                    <FiMapPin size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">From:</span> {lead.pickup}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiMapPin size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">To:</span> {lead.dropoff}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUsers size={14} className="text-gray-400 flex-shrink-0" />
                    <span><span className="font-medium text-gray-700">Passengers:</span> {lead.passengers}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock size={14} className="text-gray-400 flex-shrink-0" />
                    <span>
                      <span className="font-medium text-gray-700">Date:</span>{' '}
                      {lead.ride_date ? format(new Date(lead.ride_date), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                    >
                      <FiPhone size={13} /> {lead.phone}
                    </a>
                  )}
                  {lead.phone && (
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-green-600 font-semibold hover:underline"
                    >
                      <FiMessageCircle size={13} /> WhatsApp
                    </a>
                  )}
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-1.5 text-blue-600 font-semibold hover:underline"
                    >
                      <FiMail size={13} /> {lead.email}
                    </a>
                  )}
                  <span className="text-gray-500">
                    {VEHICLE_LABELS[lead.vehicle_type] || lead.vehicle_type}
                  </span>
                  {lead.bid_price && (
                    <span className="text-green-700 font-bold flex items-center gap-1">
                      <FiDollarSign size={13} /> Bid: ${lead.bid_price}
                    </span>
                  )}
                </div>

                {lead.notes && (
                  <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 italic">
                    "{lead.notes}"
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => setBidModalLead(lead)}
                  className="px-4 py-2 bg-yellow-400 text-[#0f1f3d] text-sm font-bold rounded-lg hover:bg-yellow-300 transition flex items-center gap-1.5"
                >
                  <FiDollarSign size={13} /> Send Bid
                </button>

                {lead.status === 'new' && (
                  <button
                    onClick={() => updateStatus(lead.id, 'contacted')}
                    disabled={updatingId === lead.id}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Mark Contacted
                  </button>
                )}
                {lead.status === 'contacted' && (
                  <button
                    onClick={() => updateStatus(lead.id, 'booked')}
                    disabled={updatingId === lead.id}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Mark Booked
                  </button>
                )}
                {lead.status === 'booked' && (
                  <span className="px-4 py-2 text-green-700 font-semibold text-sm text-center">✓ Booked</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
