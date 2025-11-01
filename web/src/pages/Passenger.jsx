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
	const [fetchError, setFetchError] = useState('')

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
		setFetchError('')
		try {
			const { data } = await api.get('/api/passengers', { params: { limit: 1000 } })
			// Handle both array response (old format) and wrapped response (new format with pagination)
			const passengersList = Array.isArray(data) ? data : (data.data || [])
			setPassengers(passengersList)
			if (passengersList.length === 0) {
				setFetchError('No passengers found in database.')
			}
		} catch (e) {
			console.error('Failed to fetch passengers:', e)
			setFetchError(e.response?.data?.error || e.message || 'Failed to load passengers from database')
			setPassengers([])
		} finally { 
			setLoading(false) 
		}
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

			<div style={{ marginTop:24 }}>
				<div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
					<strong style={{ fontSize:18 }}>All Passengers from Database ({passengers.length})</strong>
					<button onClick={fetchPassengers} disabled={loading}>
						{loading ? 'Loading...' : '🔄 Refresh'}
					</button>
				</div>
				
				{fetchError && (
					<div style={{ 
						padding: '12px', 
						background: '#fee', 
						border: '1px solid #fcc', 
						borderRadius: '4px',
						marginBottom: '12px',
						color: '#c00'
					}}>
						{fetchError}
					</div>
				)}
				
				{loading && passengers.length === 0 && (
					<div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
						Loading passengers from MongoDB...
					</div>
				)}
				
				{!loading && passengers.length > 0 && (
					<div style={{ overflowX: 'auto' }}>
						<table style={{ width:'100%', marginTop:8, borderCollapse:'collapse', border:'1px solid #ddd' }}>
							<thead>
								<tr style={{ background: '#f5f5f5' }}>
									<th align="left" style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Name</th>
									<th align="left" style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Email</th>
									<th align="left" style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Phone</th>
									<th align="left" style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Passport</th>
									<th align="left" style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Date of Birth</th>
									<th align="left" style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Created</th>
									<th align="left" style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>ID</th>
								</tr>
							</thead>
							<tbody>
								{passengers.map(p=> (
									<tr key={p._id} style={{ borderTop:'1px solid #eee' }}>
										<td style={{ padding: '10px' }}>
											<strong>{p.firstName} {p.lastName}</strong>
											{p.frequentFlyer?.status && p.frequentFlyer.status !== 'NONE' && (
												<span style={{ 
													marginLeft: '8px', 
													padding: '2px 6px', 
													background: '#007bff', 
													color: 'white', 
													borderRadius: '3px',
													fontSize: '10px'
												}}>
													{p.frequentFlyer.status}
												</span>
											)}
										</td>
										<td style={{ padding: '10px' }}>{p.email}</td>
										<td style={{ padding: '10px' }}>{p.phone || '—'}</td>
										<td style={{ padding: '10px' }}>{p.passportNumber || '—'}</td>
										<td style={{ padding: '10px' }}>
											{p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : '—'}
										</td>
										<td style={{ padding: '10px', fontSize: '12px', color: '#666' }}>
											{p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}
										</td>
										<td style={{ padding: '10px', opacity:.8, fontSize:11, fontFamily: 'monospace', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
											{p._id}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				
				{!loading && passengers.length === 0 && !fetchError && (
					<div style={{ padding: '20px', textAlign: 'center', color: '#666', border: '1px dashed #ddd', borderRadius: '4px' }}>
						No passengers found in the database. Create one above to get started!
					</div>
				)}
			</div>
		</div>
	)
}

