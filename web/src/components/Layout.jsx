import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Layout() {
	const navigate = useNavigate()
	const [menuOpen, setMenuOpen] = useState(false)
	const token = localStorage.getItem('token')
	function logout() {
		localStorage.removeItem('token')
		navigate('/get-started')
		setMenuOpen(false)
	}
	return (
		<div>
			<header className="glass" style={{ display:'flex', gap:16, alignItems:'center', padding:'16px 20px', position:'sticky', top:0, zIndex:10, flexWrap:'wrap' }}>
				<Link to="/get-started" style={{ fontWeight: 800, fontSize: '1.25rem' }} className="gradient-text">Aether Aviation</Link>
				{token && (
					<button className="hamburger" aria-label="Toggle navigation" onClick={()=>setMenuOpen(o=>!o)} style={{ border:'1px solid rgba(0,0,0,0.15)' }}>
						☰
					</button>
				)}
				{token && (
					<nav className={`nav${menuOpen ? ' open' : ''}`} style={{ display:'flex', gap:16, fontSize:'1.05rem', flexWrap:'wrap' }}>
						<Link to="/flights" onClick={()=>setMenuOpen(false)}>Flights</Link>
						<Link to="/bookings" onClick={()=>setMenuOpen(false)}>My Bookings</Link>
						<Link to="/history" onClick={()=>setMenuOpen(false)}>History</Link>
						<Link to="/assistant" onClick={()=>setMenuOpen(false)}>Assistant</Link>
						<Link to="/passenger" onClick={()=>setMenuOpen(false)}>Passenger</Link>
						<Link to="/profile" onClick={()=>setMenuOpen(false)}>Profile</Link>
					</nav>
				)}
				<div style={{ marginLeft:'auto' }}>
					{token ? (
						<button onClick={logout}>Logout</button>
					) : (
						<Link to="/login">Login</Link>
					)}
				</div>
			</header>
			<main style={{ maxWidth: 1280, margin: '0 auto', padding:'0 12px' }}>
				<Outlet />
			</main>
		</div>
	)
}
