import { useEffect, useState } from 'react'
import api from '../api'
import { getActivityLog } from '../activity'
import {
	BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const ADMIN_PASSWORD = 'adminpass'

export default function Admin() {
	const [authenticated, setAuthenticated] = useState(() => localStorage.getItem('adminAuth') === 'true')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	
	// Flight management
	const [flights, setFlights] = useState([])
	const [loading, setLoading] = useState(false)
	const [editingFlight, setEditingFlight] = useState(null)
	const [showForm, setShowForm] = useState(false)
	
	// Analytics
	const [analytics, setAnalytics] = useState({ revenue: {}, mostBooked: [], routes: [], flyers: [] })
	const [analyticsLoading, setAnalyticsLoading] = useState(false)
	
	// Calculate expenses from history
	function calculateHistoryExpenses() {
		const history = getActivityLog()
		const bookingActivities = history.filter(h => h.type === 'booking_created')
		const totalExpense = bookingActivities.reduce((sum, act) => {
			const amount = act.details?.amount || 0
			return sum + (typeof amount === 'number' ? amount : 0)
		}, 0)
		return { totalExpense, bookingCount: bookingActivities.length }
	}

	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

	function handleLogin(e) {
		e.preventDefault()
		if (password === ADMIN_PASSWORD) {
			localStorage.setItem('adminAuth', 'true')
			setAuthenticated(true)
			setPassword('')
			setError('')
		} else {
			setError('Incorrect password')
		}
	}

	function logout() {
		localStorage.removeItem('adminAuth')
		setAuthenticated(false)
	}

	async function loadFlights() {
		setLoading(true)
		try {
			const { data } = await api.get('/api/flights?limit=100')
			setFlights(data.data || [])
		} catch (e) {
			setError('Failed to load flights: ' + (e.response?.data?.error || e.message))
		} finally {
			setLoading(false)
		}
	}

	async function loadAnalytics() {
		setAnalyticsLoading(true)
		try {
			const [rev, booked, routes, flyers] = await Promise.all([
				api.get('/api/analytics/revenue'),
				api.get('/api/analytics/most-booked-flights'),
				api.get('/api/analytics/flights-per-route'),
				api.get('/api/analytics/frequent-flyers')
			])
			const analyticsData = {
				revenue: rev.data || {},
				mostBooked: Array.isArray(booked.data) ? booked.data : [],
				routes: Array.isArray(routes.data) ? routes.data : [],
				flyers: Array.isArray(flyers.data) ? flyers.data : []
			}
			console.log('Analytics loaded:', analyticsData)
			setAnalytics(analyticsData)
		} catch (e) {
			console.error('Analytics error:', e)
			// Set empty defaults on error
			setAnalytics({
				revenue: {},
				mostBooked: [],
				routes: [],
				flyers: []
			})
		} finally {
			setAnalyticsLoading(false)
		}
	}

	// Refresh analytics periodically
	useEffect(() => {
		if (authenticated) {
			loadAnalytics()
			const interval = setInterval(loadAnalytics, 30000) // Refresh every 30s
			return () => clearInterval(interval)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authenticated])

	async function checkAdminAccess() {
		const token = localStorage.getItem('token')
		if (!token) {
			const login = confirm('You need to login first to create/edit flights. Would you like to login as admin now?\n\nUsername: admin\nPassword: admin123')
			if (login) {
				try {
					const { useNavigate } = await import('react-router-dom')
					window.location.href = '/login?redirect=/admin'
				} catch {
					window.location.href = '/login'
				}
			}
			return false
		}
		// Try to decode token to check roles (basic check)
		try {
			const payload = JSON.parse(atob(token.split('.')[1]))
			const roles = payload.roles || []
			if (!roles.includes('ADMIN') && !roles.includes('STAFF')) {
				alert('You need ADMIN or STAFF role. Please login with an admin account.\n\nUsername: admin\nPassword: admin123')
				return false
			}
		} catch {
			// Token might be invalid, try anyway
		}
		return true
	}

	async function saveFlight(flightData) {
		if (!await checkAdminAccess()) return
		
		try {
			if (editingFlight) {
				await api.put(`/api/flights/${editingFlight._id}`, flightData)
			} else {
				await api.post('/api/flights', flightData)
			}
			setShowForm(false)
			setEditingFlight(null)
			await loadFlights()
			await loadAnalytics() // Refresh analytics after flight change
		} catch (e) {
			const errorMsg = e.response?.data?.error || e.message
			if (e.response?.status === 401) {
				alert('Session expired. Please login again.\n\nUsername: admin\nPassword: admin123')
				localStorage.removeItem('token')
				window.location.href = '/login'
			} else if (e.response?.status === 403 || errorMsg.includes('role') || errorMsg.includes('Forbidden')) {
				alert('Permission denied: You need ADMIN or STAFF role. Please login with:\n\nUsername: admin\nPassword: admin123')
			} else if (e.response?.status === 429) {
				alert('Rate limit exceeded. Please wait a moment and try again.')
			} else {
				alert('Error saving flight: ' + errorMsg)
			}
		}
	}

	async function deleteFlight(id) {
		if (!await checkAdminAccess()) return
		if (!confirm('Delete this flight?')) return
		try {
			await api.delete(`/api/flights/${id}`)
			await loadFlights()
			await loadAnalytics()
		} catch (e) {
			const errorMsg = e.response?.data?.error || e.message
			if (e.response?.status === 401) {
				alert('Session expired. Please login again.\n\nUsername: admin\nPassword: admin123')
				localStorage.removeItem('token')
				window.location.href = '/login'
			} else if (e.response?.status === 403 || errorMsg.includes('role') || errorMsg.includes('Forbidden')) {
				alert('Permission denied: You need ADMIN role to delete flights.\n\nPlease login with:\nUsername: admin\nPassword: admin123')
			} else {
				alert('Error deleting flight: ' + errorMsg)
			}
		}
	}

	function checkHasAdminAccess() {
		const token = localStorage.getItem('token')
		if (!token) return false
		try {
			const payload = JSON.parse(atob(token.split('.')[1]))
			const roles = payload.roles || []
			return roles.includes('ADMIN') || roles.includes('STAFF')
		} catch {
			return false
		}
	}

	function startEdit(flight) {
		if (!checkHasAdminAccess()) {
			alert('You need ADMIN or STAFF role to edit flights. Please login with:\n\nUsername: admin\nPassword: admin123')
			return
		}
		setEditingFlight(flight)
		setShowForm(true)
	}

	function startNew() {
		if (!checkHasAdminAccess()) {
			alert('You need ADMIN or STAFF role to create flights. Please login with:\n\nUsername: admin\nPassword: admin123')
			return
		}
		setEditingFlight(null)
		setShowForm(true)
	}

	useEffect(() => {
		if (authenticated) {
			loadFlights()
			loadAnalytics()
		}
	}, [authenticated])

	if (!authenticated) {
		return (
			<div style={{ maxWidth: 400, margin: '50px auto', padding: '20px' }} className="glass">
				<h2>Admin Access</h2>
				<form onSubmit={handleLogin} style={{ display: 'grid', gap: 10 }}>
					<input
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						placeholder="Enter admin password"
						required
						autoFocus
					/>
					<button type="submit">Login</button>
				</form>
				{error && <p style={{ color: 'salmon', marginTop: 10 }}>{error}</p>}
				{error && error.includes('Failed to load') && (
					<p style={{ fontSize: '0.9rem', marginTop: 8, opacity: 0.8 }}>
						Note: Flight operations require being logged in with ADMIN or STAFF role. The password above is for UI access only.
					</p>
				)}
			</div>
		)
	}

	// Check user roles from JWT token
	const token = localStorage.getItem('token')
	let userRoles = []
	let username = ''
	try {
		if (token) {
			const payload = JSON.parse(atob(token.split('.')[1]))
			userRoles = payload.roles || []
			username = payload.username || ''
		}
	} catch {}

	const hasAdminAccess = userRoles.includes('ADMIN') || userRoles.includes('STAFF')

	return (
		<div style={{ maxWidth: 1400, margin: '20px auto', padding: '0 12px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: '12px' }}>
				<div>
					<h2>Admin Dashboard</h2>
					{token ? (
						<div style={{ fontSize: '14px', color: hasAdminAccess ? '#10b981' : '#ff9800' }}>
							Logged in as: <strong>{username}</strong> 
							{hasAdminAccess ? (
								<span> ✓ (Roles: {userRoles.join(', ')})</span>
							) : (
								<span> ⚠️ (Roles: {userRoles.length > 0 ? userRoles.join(', ') : 'USER'} - No ADMIN/STAFF access)</span>
							)}
						</div>
					) : (
						<p style={{ fontSize: '14px', color: '#ff9800', marginTop: '4px' }}>
							⚠️ Not logged in. <a href="/login" style={{ color: '#007bff' }}>Login here</a> with admin credentials to manage flights.
						</p>
					)}
					{!hasAdminAccess && (
						<div style={{ 
							background: '#fff3cd', 
							border: '1px solid #ffc107', 
							borderRadius: '4px', 
							padding: '12px', 
							marginTop: '8px',
							fontSize: '14px'
						}}>
							<strong>⚠️ Limited Access:</strong> To create/edit/delete flights, you need to login with ADMIN or STAFF role.<br/>
							<strong>Username:</strong> admin<br/>
							<strong>Password:</strong> admin123<br/>
							<button 
								onClick={async () => {
									try {
										const { data } = await api.post('/api/auth/login', { username: 'admin', password: 'admin123' })
										localStorage.setItem('token', data.token)
										alert('Logged in successfully! Reloading page...')
										window.location.reload()
									} catch (e) {
										alert('Auto-login failed. Please go to /login page and login manually.\n\nError: ' + (e.response?.data?.error || e.message))
									}
								}}
								style={{
									marginTop: '8px',
									padding: '6px 12px',
									background: '#007bff',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer'
								}}
							>
								🔑 Quick Login as Admin
							</button>
							{' '}
							<a href="/login" style={{ color: '#007bff', fontWeight: 'bold', marginLeft: '8px' }}>or go to login page</a>
						</div>
					)}
				</div>
				<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
					{!hasAdminAccess && (
						<a 
							href="/login" 
							style={{ 
								padding: '8px 16px', 
								background: '#007bff', 
								color: 'white', 
								textDecoration: 'none', 
								borderRadius: '4px',
								fontSize: '14px'
							}}
						>
							Login as Admin
						</a>
					)}
					<button onClick={logout}>Logout Admin Panel</button>
				</div>
			</div>

			{/* Analytics Section */}
			<div className="glass" style={{ padding: 16, marginBottom: 20 }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
					<h3>Analytics & Charts</h3>
					<button onClick={loadAnalytics} disabled={analyticsLoading} style={{ fontSize: '0.9rem' }}>
						{analyticsLoading ? 'Refreshing...' : 'Refresh'}
					</button>
				</div>
				{analyticsLoading ? <p>Loading analytics...</p> : (
					<div className="admin-analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
						<div className="glass" style={{ minHeight: 300, padding: 16 }}>
							<h4>Net Revenue</h4>
							{(() => {
								const histExp = calculateHistoryExpenses()
								const dbRevenue = analytics.revenue.totalRevenue || 0
								const net = dbRevenue + histExp.totalExpense
								return (
									<>
										<p style={{ fontSize: '2rem', fontWeight: 'bold', color: net >= 0 ? '#10b981' : '#ef4444', margin: '8px 0 4px' }}>
											${net.toLocaleString()}
										</p>
										<p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
											Total bookings: {(analytics.revenue.count || 0) + histExp.bookingCount}
										</p>
									</>
								)
							})()}
						</div>
						<div className="glass" style={{ minHeight: 300, padding: 16 }}>
							<h4>Most Booked Flights</h4>
							{analytics.mostBooked && analytics.mostBooked.length > 0 ? (
								<div style={{ width: '100%', height: 250 }}>
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={analytics.mostBooked.slice(0, 5).map(b => ({
											name: b.flight?.flightNumber || b._id?.toString() || 'N/A',
											bookings: b.bookings || 0
										}))}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" />
											<YAxis />
											<Tooltip />
											<Bar dataKey="bookings" fill="#8884d8" />
										</BarChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div style={{ textAlign: 'center', padding: 80, opacity: 0.7 }}>
									<p>No booking data available</p>
									<p style={{ fontSize: '0.9rem', marginTop: 8 }}>Bookings will appear here once flights are booked</p>
								</div>
							)}
						</div>
						<div className="glass" style={{ minHeight: 300, padding: 16 }}>
							<h4>Flights Per Route</h4>
							{analytics.routes && analytics.routes.length > 0 ? (
								<div style={{ width: '100%', height: 250 }}>
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={analytics.routes.slice(0, 6).map(r => ({
													name: `${r.origin}→${r.destination}`,
													value: r.flights || 0
												}))}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
											>
												{analytics.routes.slice(0, 6).map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip />
										</PieChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div style={{ textAlign: 'center', padding: 80, opacity: 0.7 }}>
									<p>No route data available</p>
									<p style={{ fontSize: '0.9rem', marginTop: 8 }}>Routes will appear here once flights are created</p>
								</div>
							)}
						</div>
						<div className="glass" style={{ minHeight: 300, padding: 16 }}>
							<h4>Top Frequent Flyers</h4>
							{analytics.flyers && analytics.flyers.length > 0 ? (
								<div style={{ width: '100%', height: 250 }}>
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={analytics.flyers.slice(0, 5).map(f => ({
											name: `${f.passenger?.firstName || ''} ${f.passenger?.lastName || ''}`.trim() || 'Unknown',
											bookings: f.bookings || 0
										}))}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
											<YAxis />
											<Tooltip />
											<Bar dataKey="bookings" fill="#00C49F" />
										</BarChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div style={{ textAlign: 'center', padding: 80, opacity: 0.7 }}>
									<p>No flyer data available</p>
									<p style={{ fontSize: '0.9rem', marginTop: 8 }}>Frequent flyers will appear here once passengers make bookings</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Flight Management */}
			<div className="glass" style={{ padding: 16 }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
					<div>
						<h3>Flight Management</h3>
						{!localStorage.getItem('token') && (
							<p style={{ fontSize: '0.85rem', color: 'salmon', margin: '4px 0 0 0' }}>
								⚠️ You must be logged in with ADMIN or STAFF role to create/edit flights
							</p>
						)}
					</div>
					<button 
						onClick={startNew}
						disabled={!hasAdminAccess}
						style={!hasAdminAccess ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
						title={!hasAdminAccess ? 'Login with ADMIN role to create flights' : ''}
					>
						+ Add Flight
					</button>
				</div>

				{showForm && (
					<FlightForm
						flight={editingFlight}
						onSave={saveFlight}
						onCancel={() => { setShowForm(false); setEditingFlight(null); }}
					/>
				)}

				{loading ? <p>Loading...</p> : (
					<table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
						<thead>
							<tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
								<th align="left">Flight</th>
								<th align="left">Route</th>
								<th align="left">Departure</th>
								<th align="left">Seat Classes & Prices</th>
								<th align="left">Actions</th>
							</tr>
						</thead>
						<tbody>
							{flights.map(f => (
								<tr key={f._id} style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
									<td>{f.flightNumber}<br /><small>{f.airline}</small></td>
									<td>{f.origin} → {f.destination}</td>
									<td>{new Date(f.departureTime).toLocaleString()}</td>
									<td>
										{f.seatClasses?.map(sc => (
											<div key={sc.class} style={{ fontSize: '0.9rem' }}>
												{sc.class}: ${sc.price} ({sc.availableSeats}/{sc.totalSeats})
											</div>
										))}
									</td>
									<td>
										<button 
											onClick={() => startEdit(f)} 
											disabled={!hasAdminAccess}
											style={{ 
												marginRight: 8, 
												fontSize: '0.9rem',
												opacity: !hasAdminAccess ? 0.6 : 1,
												cursor: !hasAdminAccess ? 'not-allowed' : 'pointer'
											}}
											title={!hasAdminAccess ? 'Login with ADMIN role to edit' : ''}
										>
											Edit
										</button>
										<button 
											onClick={() => deleteFlight(f._id)} 
											disabled={!hasAdminAccess}
											style={{ 
												fontSize: '0.9rem',
												opacity: !hasAdminAccess ? 0.6 : 1,
												cursor: !hasAdminAccess ? 'not-allowed' : 'pointer'
											}}
											title={!hasAdminAccess ? 'Login with ADMIN role to delete' : ''}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	)
}

function FlightForm({ flight, onSave, onCancel }) {
	const [formData, setFormData] = useState({
		flightNumber: flight?.flightNumber || '',
		airline: flight?.airline || '',
		origin: flight?.origin || '',
		destination: flight?.destination || '',
		departureTime: flight?.departureTime ? new Date(flight.departureTime).toISOString().slice(0, 16) : '',
		arrivalTime: flight?.arrivalTime ? new Date(flight.arrivalTime).toISOString().slice(0, 16) : '',
		status: flight?.status || 'SCHEDULED',
		seatClasses: flight?.seatClasses || [{ class: 'ECONOMY', totalSeats: 100, availableSeats: 100, price: 100 }]
	})

	function updateSeatClass(idx, field, value) {
		const updated = [...formData.seatClasses]
		updated[idx] = { ...updated[idx], [field]: field === 'price' ? Number(value) : Number(value) || 0 }
		setFormData({ ...formData, seatClasses: updated })
	}

	function addSeatClass() {
		setFormData({
			...formData,
			seatClasses: [...formData.seatClasses, { class: 'ECONOMY', totalSeats: 50, availableSeats: 50, price: 150 }]
		})
	}

	function removeSeatClass(idx) {
		setFormData({
			...formData,
			seatClasses: formData.seatClasses.filter((_, i) => i !== idx)
		})
	}

	function handleSubmit(e) {
		e.preventDefault()
		const submitData = {
			...formData,
			departureTime: new Date(formData.departureTime),
			arrivalTime: new Date(formData.arrivalTime),
			seatClasses: formData.seatClasses.map(sc => ({
				...sc,
				availableSeats: Math.min(sc.availableSeats, sc.totalSeats)
			}))
		}
		onSave(submitData)
	}

	return (
		<form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.5)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
				<label>
					<div>Flight Number</div>
					<input value={formData.flightNumber} onChange={e => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })} required />
				</label>
				<label>
					<div>Airline</div>
					<input value={formData.airline} onChange={e => setFormData({ ...formData, airline: e.target.value })} required />
				</label>
				<label>
					<div>Origin</div>
					<input value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value.toUpperCase() })} required maxLength={3} />
				</label>
				<label>
					<div>Destination</div>
					<input value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value.toUpperCase() })} required maxLength={3} />
				</label>
				<label>
					<div>Departure</div>
					<input type="datetime-local" value={formData.departureTime} onChange={e => setFormData({ ...formData, departureTime: e.target.value })} required />
				</label>
				<label>
					<div>Arrival</div>
					<input type="datetime-local" value={formData.arrivalTime} onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })} required />
				</label>
				<label>
					<div>Status</div>
					<select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
						<option value="SCHEDULED">SCHEDULED</option>
						<option value="DELAYED">DELAYED</option>
						<option value="CANCELLED">CANCELLED</option>
						<option value="COMPLETED">COMPLETED</option>
					</select>
				</label>
			</div>

			<div style={{ marginTop: 16 }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h4>Seat Classes & Prices</h4>
					<button type="button" onClick={addSeatClass}>+ Add Class</button>
				</div>
				{formData.seatClasses.map((sc, idx) => (
					<div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, marginTop: 8, alignItems: 'end' }}>
						<select value={sc.class} onChange={e => updateSeatClass(idx, 'class', e.target.value)}>
							<option value="ECONOMY">ECONOMY</option>
							<option value="BUSINESS">BUSINESS</option>
							<option value="FIRST">FIRST</option>
						</select>
						<input type="number" placeholder="Total Seats" value={sc.totalSeats} onChange={e => updateSeatClass(idx, 'totalSeats', e.target.value)} min="0" required />
						<input type="number" placeholder="Available Seats" value={sc.availableSeats} onChange={e => updateSeatClass(idx, 'availableSeats', e.target.value)} min="0" required />
						<input type="number" placeholder="Price" value={sc.price} onChange={e => updateSeatClass(idx, 'price', e.target.value)} min="0" step="0.01" required />
						<button type="button" onClick={() => removeSeatClass(idx)}>Remove</button>
					</div>
				))}
			</div>

			<div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
				<button type="submit">{flight ? 'Update' : 'Create'} Flight</button>
				<button type="button" onClick={onCancel}>Cancel</button>
			</div>
		</form>
	)
}

