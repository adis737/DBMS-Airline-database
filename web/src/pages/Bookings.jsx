import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { addActivity } from '../activity'
import { generateTicketPDF } from '../ticket'

export default function Bookings() {
	const [items, setItems] = useState([])
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [flightsMap, setFlightsMap] = useState({})

	async function load() {
		setLoading(true)
    try {
            const { data } = await api.get('/api/bookings')
            const localDemo = JSON.parse(localStorage.getItem('demoBookings') || '[]')
            const localSaved = JSON.parse(localStorage.getItem('savedBookings') || '[]')
            setItems([ ...localSaved, ...localDemo, ...data ])
			// fetch flight details
            const uniqueFlightIds = [...new Set([ ...localSaved, ...localDemo, ...data ].map(b => b.flight))]
			const entries = await Promise.all(uniqueFlightIds.map(async (id) => {
				try { const f = await api.get(`/api/flights/${id}`); return [id, f.data] } catch { return [id, null] }
			}))
			setFlightsMap(Object.fromEntries(entries))
		} catch (e) { setError(e.response?.data?.error || e.message) }
		finally { setLoading(false) }
	}

	useEffect(()=>{ load() }, [])

	async function cancel(id) {
    try { await api.post(`/api/bookings/${id}/cancel`); addActivity('booking_cancelled', { id }); await load() } catch (e) { alert(e.response?.data?.error || e.message) }
	}

	const totalPaid = useMemo(()=> items.reduce((sum,b)=> sum + (b.payment?.status==='PAID' ? (b.payment.amount||0) : 0), 0), [items])

	return (
		<div style={{ maxWidth: 1000, margin: '20px auto', padding:'0 12px' }}>
			<h2>My Bookings</h2>
			{error && <p style={{ color:'red' }}>{error}</p>}
			{loading && <p>Loading...</p>}
			{!loading && items.length === 0 && <p>No bookings yet.</p>}
			{items.length > 0 && (
				<div className="glass" style={{ padding:12 }}>
					<table style={{ width:'100%', borderCollapse:'collapse' }}>
						<thead><tr><th align="left">Booking</th><th align="left">Flight</th><th align="left">Route</th><th align="left">Seat</th><th align="left">Status</th><th align="left">Amount</th><th></th></tr></thead>
						<tbody>
                            {items.map(b => {
                                const f = flightsMap[b.flight]
								return (
									<tr key={b._id} style={{ borderTop:'1px solid #eee' }}>
                                        <td>{b.bookingId}</td>
										<td>{f ? f.flightNumber : b.flight}</td>
										<td>{f ? `${f.origin} → ${f.destination}` : '—'}</td>
										<td>{b.seatClass} {b.seatNumber||''}</td>
                                        <td>{b.status || 'BOOKED'}</td>
                                        <td>{b.amount || b.payment?.amount}</td>
                                        <td style={{ display:'flex', gap:8 }}>
                                            {!b.isDemo && b.status!=='CANCELLED' && b._id && <button onClick={()=>cancel(b._id)}>Cancel</button>}
                                            <button onClick={()=>generateTicketPDF(b, f)}>Download ticket</button>
                                        </td>
									</tr>
								)
							})}
						</tbody>
					</table>
					<div style={{ textAlign:'right', marginTop:8 }}>
						<b>Total paid:</b> {totalPaid}
					</div>
				</div>
			)}
		</div>
	)
}
