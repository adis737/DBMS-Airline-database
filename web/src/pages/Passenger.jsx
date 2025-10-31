import { useEffect, useState } from 'react'
import api from '../api'
import { addActivity } from '../activity'

export default function Passenger() {
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')
	const [passportNumber, setPassportNumber] = useState('')
	const [message, setMessage] = useState('')
	const [passengers, setPassengers] = useState([])
	const [loading, setLoading] = useState(false)

	async function submit(e) {
		e.preventDefault()
		setMessage('')
		try {
			const { data } = await api.post('/api/passengers', { firstName, lastName, email, passportNumber })
			localStorage.setItem('passengerId', data._id)
			setMessage('Passenger created and saved!')
			addActivity('passenger_created', { _id: data._id, firstName, lastName, email, passportNumber })
			await fetchPassengers()
		} catch (e) {
			setMessage(e.response?.data?.error || e.message)
		}
	}

	async function fetchPassengers() {
		setLoading(true)
		try {
			const { data } = await api.get('/api/passengers')
			setPassengers(data.data || data)
		} catch (e) {
			// ignore silently here; message area is for create flow
		} finally { setLoading(false) }
	}

	useEffect(()=>{ fetchPassengers() }, [])

	return (
		<div style={{ maxWidth: 900, margin: '24px auto', padding:'16px' }} className="glass">
			<h2 className="gradient-text" style={{ marginTop:0 }}>Passenger</h2>
			<form onSubmit={submit} style={{ display:'grid', gap:10 }}>
				<label><div>First name</div><input value={firstName} onChange={e=>setFirstName(e.target.value)} required /></label>
				<label><div>Last name</div><input value={lastName} onChange={e=>setLastName(e.target.value)} required /></label>
				<label><div>Email</div><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
				<label><div>Passport number</div><input value={passportNumber} onChange={e=>setPassportNumber(e.target.value)} /></label>
				<button type="submit">Save Passenger</button>
			</form>
			{message && <p style={{ marginTop:10 }}>{message}</p>}
			<p style={{ marginTop:6, fontSize:12, opacity:.8 }}>Stored passengerId: {localStorage.getItem('passengerId') || '—'}</p>

			<div style={{ marginTop:16 }}>
				<div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
					<strong>Passengers</strong>
					<button onClick={fetchPassengers} disabled={loading}>{loading?'Refreshing...':'Refresh'}</button>
				</div>
				<table style={{ width:'100%', marginTop:8, borderCollapse:'collapse' }}>
					<thead><tr><th align="left">Name</th><th align="left">Email</th><th align="left">Passport</th><th align="left">ID</th></tr></thead>
					<tbody>
						{(passengers||[]).map(p=> (
							<tr key={p._id} style={{ borderTop:'1px solid #eee' }}>
								<td>{p.firstName} {p.lastName}</td>
								<td>{p.email}</td>
								<td>{p.passportNumber || '—'}</td>
								<td style={{ opacity:.8, fontSize:12 }}>{p._id}</td>
							</tr>
						))}
						{(passengers||[]).length===0 && (
							<tr><td colSpan="4" style={{ padding:10, opacity:.8 }}>No passengers yet.</td></tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

