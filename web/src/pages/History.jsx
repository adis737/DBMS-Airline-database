import { useEffect, useState } from 'react'
import { getActivityLog, clearActivityLog } from '../activity'

export default function History() {
	const [items, setItems] = useState([])

	useEffect(()=>{ setItems(getActivityLog()) }, [])

	function clearAll() {
		clearActivityLog(); setItems([])
	}

	return (
		<div style={{ maxWidth: 1000, margin: '20px auto', padding:'0 12px' }}>
			<h2>History</h2>
			<div className="glass" style={{ padding:12 }}>
				<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
					<strong>Previous activities</strong>
					<button onClick={clearAll} disabled={items.length===0}>Clear</button>
				</div>
				<table style={{ width:'100%', marginTop:8, borderCollapse:'collapse' }}>
					<thead><tr><th align="left">Time</th><th align="left">Type</th><th align="left">Details</th></tr></thead>
					<tbody>
						{items.map(it => (
							<tr key={it.id} style={{ borderTop:'1px solid #eee' }}>
								<td style={{ whiteSpace:'nowrap' }}>{new Date(it.at).toLocaleString()}</td>
								<td style={{ textTransform:'capitalize' }}>{it.type.replace(/_/g,' ')}</td>
								<td>{renderDetails(it)}</td>
							</tr>
						))}
						{items.length===0 && <tr><td colSpan="3" style={{ padding:10, opacity:.8 }}>No activity yet.</td></tr>}
					</tbody>
				</table>
			</div>
		</div>
	)
}

function renderDetails(it) {
	const d = it.details || {}
	switch (it.type) {
		case 'passenger_created':
			return `${d.firstName||''} ${d.lastName||''} (${d.email||''})`
		case 'booking_created':
			return `${d.airline||''} ${d.flightNumber||d.flight||''} ${d.origin||''} → ${d.destination||''} · ${d.seatClass||''} · $${d.amount||0}`
		case 'booking_cancelled':
			return `${d.bookingId||d.id||''}`
		default:
			return JSON.stringify(d)
	}
}


