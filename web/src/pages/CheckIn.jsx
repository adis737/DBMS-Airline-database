import { useEffect, useState } from 'react'
import api from '../api'

export default function CheckIn() {
	const [bookings, setBookings] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [checkIns, setCheckIns] = useState([])

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

			setBookings((bookingsRes.data.data || bookingsRes.data || []).filter(b => b.status === 'CONFIRMED'))
			setCheckIns(checkInsRes.data || [])
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
		<div style={{ maxWidth: 1000, margin: '20px auto', padding: '0 12px' }}>
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
						
						return (
							<div key={booking._id} style={{ 
								border: '1px solid #ddd', 
								borderRadius: '8px', 
								padding: '16px',
								background: checkIn ? '#e8f5e9' : '#fff'
							}}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
									<div>
										<h3>{booking.flight?.flightNumber || 'N/A'} - {booking.flight?.airline || 'N/A'}</h3>
										<p><strong>Route:</strong> {booking.flight?.origin || booking.origin} → {booking.flight?.destination || booking.destination}</p>
										<p><strong>Date:</strong> {flightDate.toLocaleString()}</p>
										<p><strong>Seat Class:</strong> {booking.seatClass}</p>
										{checkIn && (
											<div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '4px' }}>
												<p><strong>✓ Checked In</strong></p>
												<p>Seat: {checkIn.seatNumber || 'TBD'}</p>
												<p>Gate: {checkIn.gate || 'TBD'}</p>
												<p>Boarding Group: {checkIn.boardingGroup}</p>
												<p style={{ fontSize: '12px', color: '#666' }}>
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

