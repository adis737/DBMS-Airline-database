import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { generateTicketPDF } from '../ticket'
import { addActivity } from '../activity'
import FlightMap from '../components/FlightMap'

export default function Flights() {
	const [params, setParams] = useState({ date: '', origin: '', destination: '', page: 1, limit: 10 })
	const [flights, setFlights] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [airports, setAirports] = useState([])
	const [total, setTotal] = useState(0)
	const [viewMode, setViewMode] = useState('list') // 'list' or 'map'

	// Featured flights from database
	const [featured, setFeatured] = useState([])

	useEffect(()=>{
		// Load featured flights from database
		(async()=>{
			try {
				const today = new Date().toISOString().slice(0,10)
				const { data } = await api.get('/api/flights', { params: { date: today, limit: 2 } })
				if (data.data && data.data.length > 0) {
					const featured = data.data.slice(0, 2).map(f => {
						const cheapestPrice = f.seatClasses && f.seatClasses.length > 0 
							? Math.min(...f.seatClasses.map(s => s.price)) 
							: null
						return {
							id: f._id,
							airline: f.airline,
							flightNumber: f.flightNumber,
							origin: f.origin,
							destination: f.destination,
							date: new Date(f.departureTime).toISOString().slice(0,10),
							price: cheapestPrice || 0
						}
					})
					setFeatured(featured)
				}
			} catch (e) {
				console.error('Failed to load featured flights:', e)
			}
		})()
	}, [])

useEffect(()=>{ (async()=>{
    try { const { data } = await api.get('/api/airports'); setAirports(data) }
    catch { setAirports([]) }
})() }, [])

	const suggestions = useMemo(()=>airports.map(a=>a.code), [airports])

	async function search() {
		setLoading(true); setError('')
		try {
			const { data } = await api.get('/api/flights', { params })
			setFlights(data.data || [])
			setTotal(data.total || 0)
			if (data.data && data.data.length === 0 && !params.date && !params.origin && !params.destination) {
				setError('No flights available. Try running npm run seed to populate the database.')
			}
		} catch (e) {
			console.error('Flight search error:', e)
			if (e.code === 'ECONNREFUSED' || e.message.includes('Network Error')) {
				setError('Cannot connect to server. Make sure the backend is running on port 3000.')
			} else {
				setError(e.response?.data?.error || e.message || 'Failed to load flights')
			}
			setFlights([])
			setTotal(0)
		}
		finally { setLoading(false) }
	}

	useEffect(()=>{ search() }, [params.page, params.limit])

	function setField(name, value) { setParams(p=>({ ...p, [name]: value, page: 1 })) }

	function applyFeatured(f) {
		setParams(p=>({ ...p, origin: f.origin, destination: f.destination, date: f.date, page: 1 }))
		// trigger fresh search with these params
		setTimeout(()=>{ search() }, 0)
	}

	async function book(flight) {
		const token = localStorage.getItem('token')
		if (!token) return alert('Please login to book')
		const seatClass = flight.seatClasses?.[0]?.class || 'ECONOMY'
		const amount = flight.seatClasses?.[0]?.price || 100
		try {
			const passengerId = localStorage.getItem('passengerId')
			if (!passengerId) return alert('Create a Passenger first (Profile > Passenger)')
			if (flight.isDemo) {
				// Store a local demo booking so users can complete the flow
				const existing = JSON.parse(localStorage.getItem('demoBookings') || '[]')
				const bookingId = `DEMO-BKG-${Date.now()}`
				const demoBooking = {
					bookingId,
					flight: flight._id,
					passenger: passengerId,
					airline: flight.airline,
					flightNumber: flight.flightNumber,
					origin: flight.origin,
					destination: flight.destination,
					seatClass,
					amount,
					travelDate: flight.departureTime,
					createdAt: new Date().toISOString()
				}
				localStorage.setItem('demoBookings', JSON.stringify([demoBooking, ...existing]))
				addActivity('booking_created', demoBooking)
				generateTicketPDF(demoBooking, flight)
				alert('Booked (demo): ' + bookingId)
				return
			}
			const payload = { flight: flight._id, passenger: passengerId, seatClass, payment: { amount, status: 'PAID', method: 'CARD' }, travelDate: flight.departureTime }
			const res = await api.post('/api/bookings', payload)
			const saved = {
				bookingId: res.data.bookingId,
				flight: flight._id,
				passenger: passengerId,
				airline: flight.airline,
				flightNumber: flight.flightNumber,
				origin: flight.origin,
				destination: flight.destination,
				seatClass,
				amount,
				travelDate: flight.departureTime,
				createdAt: new Date().toISOString()
			}
			const local = JSON.parse(localStorage.getItem('savedBookings') || '[]')
			localStorage.setItem('savedBookings', JSON.stringify([saved, ...local]))
			addActivity('booking_created', saved)
			generateTicketPDF(saved, flight)
			alert('Booked: ' + res.data.bookingId)
		} catch (e) {
			alert(e.response?.data?.error || e.message)
		}
	}

	const totalPages = Math.max(1, Math.ceil(total / params.limit))

	return (
		<div style={{ maxWidth: 1400, margin: '20px auto', padding:'0 12px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
			<h2>Find Flights</h2>
				<div style={{ display: 'flex', gap: '8px' }}>
					<button 
						onClick={() => setViewMode('list')}
						style={{ 
							padding: '8px 16px', 
							background: viewMode === 'list' ? '#007bff' : '#f0f0f0',
							color: viewMode === 'list' ? 'white' : 'black',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						List View
					</button>
					<button 
						onClick={() => setViewMode('map')}
						style={{ 
							padding: '8px 16px', 
							background: viewMode === 'map' ? '#007bff' : '#f0f0f0',
							color: viewMode === 'map' ? 'white' : 'black',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Live Map
					</button>
				</div>
			</div>
			<div className="glass" style={{ padding:12, borderRadius:8, margin:'8px 0' }}>
				<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, flexWrap:'wrap', gap:8 }}>
					<strong>Featured flights today</strong>
					<span style={{ fontSize:'0.9rem', opacity:0.8 }}>Today: {new Date().toLocaleDateString()}</span>
				</div>
				<div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
					{featured.map(f => (
						<div key={f.id} className="glass featured-card" style={{ minWidth:240, flex: '1 1 280px', maxWidth:'100%' }}>
							<div style={{ fontWeight:600 }}>{f.airline} · {f.flightNumber}</div>
							<div style={{ margin:'4px 0' }}>{f.origin} → {f.destination}</div>
							<div style={{ margin:'4px 0' }}>Date: {f.date}</div>
							<div style={{ margin:'4px 0' }}>From ${f.price}</div>
							<button onClick={()=>applyFeatured(f)}>Check availability</button>
						</div>
					))}
				</div>
			</div>
			<div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
				<input placeholder="Date (YYYY-MM-DD)" value={params.date} onChange={e=>setField('date', e.target.value)} />
				<input list="airport-codes" placeholder="Origin (e.g., JFK)" value={params.origin} onChange={e=>setField('origin', e.target.value.toUpperCase())} />
				<input list="airport-codes" placeholder="Destination (e.g., LAX)" value={params.destination} onChange={e=>setField('destination', e.target.value.toUpperCase())} />
				<datalist id="airport-codes">
					{suggestions.map(code => (<option key={code} value={code}>{code}</option>))}
				</datalist>
				<button onClick={search} disabled={loading}>{loading?'Loading...':'Search'}</button>
				<select value={params.limit} onChange={e=>setParams(p=>({ ...p, limit: Number(e.target.value), page: 1 }))}>
					<option value={10}>10</option>
					<option value={20}>20</option>
					<option value={50}>50</option>
				</select>
			</div>
			{error && <p style={{ color:'red' }}>{error}</p>}
			
			{viewMode === 'map' ? (
				<div>
					<h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Live Flight Tracker</h3>
					<p style={{ marginBottom: '10px', color: '#666' }}>
						Real-time flight positions from AviationStack API. Map updates every 30 seconds.
					</p>
					<FlightMap />
				</div>
			) : (
				<>
			{!loading && flights.length === 0 && <p style={{ marginTop:12 }}>No flights found. Try clearing filters.</p>}
			<table style={{ width:'100%', marginTop:12, borderCollapse:'collapse' }}>
				<thead><tr><th align="left">Flight</th><th align="left">Airline</th><th align="left">Route</th><th align="left">Departure</th><th align="left">Arrival</th><th align="left">Price</th><th align="left">Seats</th><th></th></tr></thead>
				<tbody>
					{flights.map(f=> {
						const departTime = new Date(f.departureTime)
						const arriveTime = new Date(f.arrivalTime)
						const cheapestPrice = f.seatClasses && f.seatClasses.length > 0 
							? Math.min(...f.seatClasses.map(s => s.price)) 
							: null
						return (
						<tr key={f._id} style={{ borderTop:'1px solid rgba(0,0,0,0.1)' }}>
							<td>{f.flightNumber}</td>
							<td>{f.airline}</td>
							<td>{f.origin} → {f.destination}</td>
								<td>{departTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
								<td>{arriveTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
								<td>{cheapestPrice ? `$${cheapestPrice}+` : 'N/A'}</td>
							<td>{(f.seatClasses||[]).map(s=>`${s.class}:${s.availableSeats}`).join(' ')}</td>
							<td><button onClick={()=>book(f)}>Book</button></td>
						</tr>
						)
					})}
				</tbody>
			</table>
			<div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
				<button disabled={params.page<=1} onClick={()=>setParams(p=>({ ...p, page: p.page-1 }))}>Prev</button>
				<span>Page {params.page} / {totalPages}</span>
				<button disabled={params.page>=totalPages} onClick={()=>setParams(p=>({ ...p, page: p.page+1 }))}>Next</button>
			</div>
				</>
			)}
		</div>
	)
}
