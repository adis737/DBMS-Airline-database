import { useEffect, useState } from 'react'
import api from '../api'

export default function Baggage() {
	const [baggages, setBaggages] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [showForm, setShowForm] = useState(false)
	const [bookings, setBookings] = useState([])
	const [loadingBookings, setLoadingBookings] = useState(false)
	const [formData, setFormData] = useState({ bookingId: '', type: 'CHECKED', weight: '', pieces: 1, description: '' })

	useEffect(() => {
		loadBaggages()
		loadBookings()
	}, [])

	async function loadBookings() {
		setLoadingBookings(true)
		try {
			const { data } = await api.get('/api/bookings')
			// Filter only confirmed bookings
			let confirmed = (data || []).filter(b => b.status === 'CONFIRMED' && (b._id || b.id))
			
			// Fetch flight details for bookings
			const bookingsWithFlights = await Promise.all(confirmed.map(async (booking) => {
				if (booking.flight && typeof booking.flight === 'string') {
					try {
						const flightRes = await api.get(`/api/flights/${booking.flight}`)
						return { ...booking, flight: flightRes.data }
					} catch {
						return booking
					}
				}
				return booking
			}))
			
			setBookings(bookingsWithFlights)
		} catch (e) {
			console.error('Failed to load bookings:', e)
			setBookings([])
		} finally {
			setLoadingBookings(false)
		}
	}

	async function loadBaggages() {
		setLoading(true)
		try {
			// If logged in, backend will automatically filter by user's bookings
			// Otherwise try to use passengerId from localStorage
			const passengerId = localStorage.getItem('passengerId')
			const params = passengerId ? { passengerId } : {}
			const { data } = await api.get('/api/baggage', { params })
			setBaggages(data || [])
			if (data && data.length === 0) {
				console.log('No baggages found. Make sure you have confirmed bookings.')
			}
		} catch (e) {
			console.error('Error loading baggages:', e)
			setError(e.response?.data?.error || e.message)
		} finally {
			setLoading(false)
		}
	}

	async function handleSubmit(e) {
		e.preventDefault()
		try {
			setError('')
			const response = await api.post('/api/baggage', formData)
			console.log('Baggage created:', response.data)
			alert(`Baggage registered successfully! Tracking Number: ${response.data?.trackingNumber || 'N/A'}`)
			setShowForm(false)
			setFormData({ bookingId: '', type: 'CHECKED', weight: '', pieces: 1, description: '' })
			// Reload baggages after a short delay to ensure it's saved
			setTimeout(() => {
				loadBaggages()
			}, 500)
		} catch (e) {
			console.error('Error creating baggage:', e)
			alert(e.response?.data?.error || e.message || 'Failed to register baggage')
		}
	}

	const statusColors = {
		CHECKED: '#2196F3',
		LOADED: '#4CAF50',
		IN_TRANSIT: '#FF9800',
		ARRIVED: '#4CAF50',
		DELAYED: '#FF5722',
		LOST: '#F44336',
	}

	return (
		<div style={{ maxWidth: 1000, margin: '20px auto', padding: '0 12px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
				<h2>Baggage Tracking</h2>
				<button onClick={() => setShowForm(!showForm)}>
					{showForm ? 'Cancel' : '+ Register Baggage'}
				</button>
			</div>

			{showForm && (
				<form onSubmit={handleSubmit} className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
					<h3>Register New Baggage</h3>
					<div style={{ display: 'grid', gap: '12px' }}>
						<label>
							Booking
							{loadingBookings ? (
								<div>Loading bookings...</div>
							) : bookings.length === 0 ? (
								<div style={{ padding: '12px', background: '#fff3cd', borderRadius: '4px', fontSize: '14px' }}>
									⚠️ No confirmed bookings found. You need to have a confirmed booking to register baggage.
								</div>
							) : (
								<select 
									value={formData.bookingId} 
									onChange={e => setFormData({...formData, bookingId: e.target.value})} 
									required
								>
									<option value="">Select a booking</option>
									{bookings.map(booking => {
										const bookingId = booking._id || booking.id
										const displayId = booking.bookingId || bookingId?.toString().substring(0, 8) || 'N/A'
										const flight = booking.flight || {}
										const flightNum = typeof flight === 'object' ? (flight.flightNumber || 'N/A') : 'N/A'
										const route = typeof flight === 'object' && flight.origin && flight.destination 
											? `${flight.origin} → ${flight.destination}` 
											: ''
										const date = booking.travelDate 
											? new Date(booking.travelDate).toLocaleDateString() 
											: (flight.departureTime ? new Date(flight.departureTime).toLocaleDateString() : 'N/A')
										return (
											<option key={bookingId} value={bookingId}>
												{displayId} - {flightNum} {route ? `(${route})` : ''} - {date} - {booking.seatClass}
											</option>
										)
									})}
								</select>
							)}
						</label>
						<label>
							Type 
							<select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
								<option value="CARRY_ON">Carry-On</option>
								<option value="CHECKED">Checked</option>
							</select>
						</label>
						<label>
							Weight (kg) <input 
								type="number" 
								value={formData.weight} 
								onChange={e => setFormData({...formData, weight: e.target.value})} 
								required 
								min="0"
							/>
						</label>
						<label>
							Pieces <input 
								type="number" 
								value={formData.pieces} 
								onChange={e => setFormData({...formData, pieces: e.target.value})} 
								min="1"
							/>
						</label>
						<label>
							Description <textarea 
								value={formData.description} 
								onChange={e => setFormData({...formData, description: e.target.value})}
							/>
						</label>
						<button type="submit">Register</button>
					</div>
				</form>
			)}

			{error && <p style={{ color: 'red' }}>{error}</p>}

			{loading && <p>Loading...</p>}

			{!loading && baggages.length === 0 && (
				<p>No baggage registered. Register your baggage above.</p>
			)}

			{!loading && baggages.length > 0 && (
				<div style={{ display: 'grid', gap: '16px' }}>
					{baggages.map(bag => (
						<div key={bag._id} className="glass" style={{ 
							padding: '18px',
							borderRadius: '16px',
							borderLeft: `4px solid ${statusColors[bag.status] || '#999'}`
						}}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
								<div>
									<h3>Tracking: {bag.trackingNumber}</h3>
									<p><strong>Status:</strong> <span style={{ 
										padding: '4px 8px', 
										background: statusColors[bag.status] || '#999',
										color: 'white',
										borderRadius: '9999px',
										fontSize: '12px'
									}}>{bag.status}</span></p>
									<p><strong>Type:</strong> {bag.type}</p>
									<p><strong>Weight:</strong> {bag.weight} kg ({bag.pieces} piece{bag.pieces > 1 ? 's' : ''})</p>
									{bag.fee > 0 && <p><strong>Fee:</strong> ${bag.fee}</p>}
									{bag.description && <p><strong>Description:</strong> {bag.description}</p>}
									<p><strong>Flight:</strong> {bag.flight?.flightNumber || bag.flight}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

