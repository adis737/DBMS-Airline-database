import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { generateTicketPDF } from '../ticket'
import { addActivity } from '../activity'

export default function Flights() {
	const [params, setParams] = useState({ date: '', origin: '', destination: '', page: 1, limit: 10 })
	const [flights, setFlights] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [airports, setAirports] = useState([])
	const [total, setTotal] = useState(0)

	// Featured hardcoded flights with dynamic prices for demo
	const [featured, setFeatured] = useState(()=>{
		const today = new Date()
		const fmt = (d)=> d.toISOString().slice(0,10)
		return [
			{ id:'FX100', airline:'Demo Air', flightNumber:'FX100', origin:'JFK', destination:'LAX', date: fmt(today), price: 199 },
			{ id:'FX200', airline:'Sample Wings', flightNumber:'FX200', origin:'SFO', destination:'SEA', date: fmt(today), price: 89 },
		]
	})

	useEffect(()=>{
		const timer = setInterval(()=>{
			setFeatured(list => list.map(f => {
				// random small price drift, clamp to sensible bounds
				const delta = Math.floor((Math.random()*9)-4) // -4..+4
				const next = Math.min(599, Math.max(49, f.price + delta))
				// keep date current each tick
				const today = new Date().toISOString().slice(0,10)
				return { ...f, price: next, date: today }
			}))
		}, 3000)
		return ()=>clearInterval(timer)
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
			let nextFlights = data.data
			let nextTotal = data.total
			if (!nextFlights || nextFlights.length === 0) {
				// create 20 demo flights if API has none
				const baseDate = params.date || new Date().toISOString().slice(0,10)
				const routes = [
					['JFK','LAX'], ['SFO','SEA'], ['ORD','ATL'], ['MIA','BOS'], ['DFW','DEN'],
					['LAX','SEA'], ['SEA','SFO'], ['ATL','MIA'], ['BOS','ORD'], ['DEN','DFW']
				]
				const airlines = ['Demo Air','Sample Wings','OpenSky','Nimbus','Falcon']
				const makeIso = (h, m) => new Date(`${baseDate}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`).toISOString()
				const rand = (min,max)=> Math.floor(Math.random()*(max-min+1))+min
				const demo = Array.from({ length: 20 }).map((_, i) => {
					const [o,d] = routes[i % routes.length]
					const airline = airlines[i % airlines.length]
					const basePrice = 79 + (i*7) + rand(-10, 25)
					return {
						_id: `DEMO-${i+1}`,
						isDemo: true,
						airline,
						flightNumber: `${airline.split(' ')[0].slice(0,2).toUpperCase()}${100 + i}`,
						origin: o,
						destination: d,
						departureTime: makeIso(6 + (i%12), (i*13)%60),
						seatClasses: [
							{ class: 'ECONOMY', availableSeats: 15 - (i%7), price: Math.max(59, Math.round(basePrice)) },
							{ class: 'BUSINESS', availableSeats: 6 - (i%3), price: Math.round(basePrice * 1.65) }
						]
					}
				})
				// filter by current params
				const matches = demo.filter(d => {
					if (params.origin && d.origin !== params.origin) return false
					if (params.destination && d.destination !== params.destination) return false
					if (params.date && new Date(d.departureTime).toISOString().slice(0,10) !== params.date) return false
					return true
				})
				nextFlights = matches
				nextTotal = matches.length
			}
			setFlights(nextFlights); setTotal(nextTotal)
		} catch (e) { setError(e.response?.data?.error || e.message) }
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
			const payload = { flight: flight._id, passenger: passengerId, seatClass, payment: { amount, status: 'PAID' }, travelDate: flight.departureTime }
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
		<div style={{ maxWidth: 1000, margin: '20px auto', padding:'0 12px' }}>
			<h2>Find Flights</h2>
			<div className="glass" style={{ padding:12, borderRadius:8, margin:'8px 0' }}>
				<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, flexWrap:'wrap', gap:8 }}>
					<strong>Featured flights (live price demo)</strong>
					<span style={{ fontSize:'0.9rem', opacity:0.8 }}>Today: {new Date().toLocaleDateString()}</span>
				</div>
				<div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
					{featured.map(f => (
						<div key={f.id} style={{ background:'rgba(255,255,255,0.95)', border:'1px solid rgba(0,0,0,0.1)', borderRadius:8, padding:12, minWidth:240, flex: '1 1 280px', maxWidth:'100%' }}>
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
			{!loading && flights.length === 0 && <p style={{ marginTop:12 }}>No flights found. Try clearing filters.</p>}
			<table style={{ width:'100%', marginTop:12, borderCollapse:'collapse' }}>
				<thead><tr><th align="left">Flight</th><th align="left">Airline</th><th align="left">Route</th><th align="left">Depart</th><th align="left">Seats</th><th></th></tr></thead>
				<tbody>
					{flights.map(f=> (
						<tr key={f._id} style={{ borderTop:'1px solid rgba(0,0,0,0.1)' }}>
							<td>{f.flightNumber}</td>
							<td>{f.airline}</td>
							<td>{f.origin} → {f.destination}</td>
							<td>{new Date(f.departureTime).toLocaleString()}</td>
							<td>{(f.seatClasses||[]).map(s=>`${s.class}:${s.availableSeats}`).join(' ')}</td>
							<td><button onClick={()=>book(f)}>Book</button></td>
						</tr>
					))}
				</tbody>
			</table>
			<div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
				<button disabled={params.page<=1} onClick={()=>setParams(p=>({ ...p, page: p.page-1 }))}>Prev</button>
				<span>Page {params.page} / {totalPages}</span>
				<button disabled={params.page>=totalPages} onClick={()=>setParams(p=>({ ...p, page: p.page+1 }))}>Next</button>
			</div>
		</div>
	)
}
