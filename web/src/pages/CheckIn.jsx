import { useEffect, useState } from 'react'
import api from '../api'

export default function CheckIn() {
	const [bookings, setBookings] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [checkIns, setCheckIns] = useState([])
	const [flightsMap, setFlightsMap] = useState({})

	useEffect(() => {
		loadData()
	}, [])

	async function loadData() {
		setLoading(true)
		try {
			const passengerId = localStorage.getItem('passengerId')
			if (!passengerId) {
				setError('Please create a passenger profile first')
				return
			}

			const [bookingsRes, checkInsRes] = await Promise.all([
				api.get('/api/bookings'),
				api.get('/api/checkin', { params: { passengerId } })
			])

			const apiBookings = bookingsRes.data?.data || bookingsRes.data || []
			const localDemo = JSON.parse(localStorage.getItem('demoBookings') || '[]')
			const localSaved = JSON.parse(localStorage.getItem('savedBookings') || '[]')
			const all = [...localSaved, ...localDemo, ...apiBookings]
			const confirmed = all.filter(b => b.status === 'CONFIRMED')
			setBookings(confirmed)
			setCheckIns(checkInsRes.data || [])

			// Build flights map for route display
			const uniqueFlightIds = [...new Set(confirmed.map(b => b.flight).filter(id => typeof id === 'string' || typeof id === 'number'))]
			if (uniqueFlightIds.length) {
				const entries = await Promise.all(uniqueFlightIds.map(async (id) => {
					try { const f = await api.get(`/api/flights/${id}`); return [id, f.data] } catch { return [id, null] }
				}))
				setFlightsMap(Object.fromEntries(entries))
			} else {
				setFlightsMap({})
			}
		} catch (e) {
			setError(e.response?.data?.error || e.message)
		} finally {
			setLoading(false)
		}
	}

	async function handleCheckIn(bookingId) {
		try {
			setError('')
			const { data } = await api.post('/api/checkin', { bookingId })
			alert(`Check-in successful! Seat: ${data.seatNumber}, Gate: ${data.gate}, Boarding Group: ${data.boardingGroup}`)
			await loadData()
		} catch (e) {
			alert(e.response?.data?.error || e.message)
		}
	}

	const checkedInMap = new Map(checkIns.map(ci => [ci.booking?._id || ci.booking, ci]))

	return (
		<div style={{ maxWidth: 1200, margin: '20px auto', padding: '0 12px' }}>
			<h2>Online Check-In</h2>
			{error && <p style={{ color: 'red' }}>{error}</p>}
			
			{loading && <p>Loading...</p>}
			
			{!loading && bookings.length === 0 && (
				<p>No confirmed bookings found. Book a flight first!</p>
			)}

			{!loading && bookings.length > 0 && (
				<div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
					{bookings.map(booking => {
						const checkIn = checkedInMap.get(booking._id)
						const flightDate = new Date(booking.travelDate || booking.flight?.departureTime)
						const canCheckIn = flightDate && new Date(flightDate.getTime() - 24 * 60 * 60 * 1000) <= new Date()
						const flightDetails = (typeof booking.flight === 'string' || typeof booking.flight === 'number') ? flightsMap[booking.flight] : booking.flight
						
						return (
							<div key={booking._id} className={`glass checkin-card${checkIn ? ' checked-in' : ''}`} style={{ 
								borderRadius: '12px', 
								padding: '20px'
							}}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
									<div>
										<h3>{flightDetails?.flightNumber || booking.flight || 'N/A'}{flightDetails?.airline ? ` - ${flightDetails.airline}` : ''}</h3>
										<p><strong>Route:</strong> {flightDetails?.origin || booking.origin || '—'} → {flightDetails?.destination || booking.destination || '—'}</p>
										<p><strong>Date:</strong> {flightDate.toLocaleString()}</p>
										<p><strong>Seat Class:</strong> {booking.seatClass}</p>
										{checkIn && (
											<div className="checkin-details" style={{ marginTop: '12px', padding: '12px', borderRadius: '8px' }}>
												<p><strong>✓ Checked In</strong></p>
												<p>Seat: {checkIn.seatNumber || 'TBD'}</p>
												<p>Gate: {checkIn.gate || 'TBD'}</p>
												<p>Boarding Group: {checkIn.boardingGroup}</p>
												<p className="review-meta" style={{ fontSize: '12px' }}>
													Checked in at: {new Date(checkIn.checkInTime).toLocaleString()}
												</p>
											</div>
										)}
									</div>
									<div>
										{!checkIn && (
											<button 
												onClick={() => handleCheckIn(booking._id)}
												disabled={!canCheckIn}
												style={{
													padding: '10px 20px',
													background: canCheckIn ? '#007bff' : '#ccc',
													color: 'white',
													border: 'none',
													borderRadius: '4px',
													cursor: canCheckIn ? 'pointer' : 'not-allowed'
												}}
											>
												{canCheckIn ? 'Check In Now' : 'Check-in opens 24h before flight'}
											</button>
										)}
									</div>
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

