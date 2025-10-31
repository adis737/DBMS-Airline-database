import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import logoImage from '../assets/—Pngtree—large passenger airplane flying through_20686786.png'

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
				<Link to="/get-started" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
					<img src={logoImage} alt="Aether Aviation Logo" style={{ height: 40, width: 'auto' }} />
					<span style={{ fontWeight: 800, fontSize: '1.25rem' }} className="gradient-text">Aether Aviation</span>
				</Link>
				{(token || localStorage.getItem('adminAuth') === 'true') && (
					<button className="hamburger" aria-label="Toggle navigation" onClick={()=>setMenuOpen(o=>!o)} style={{ border:'1px solid rgba(0,0,0,0.15)' }}>
						☰
					</button>
				)}
				<nav className={`nav${menuOpen ? ' open' : ''}`} style={{ display:'flex', gap:16, fontSize:'1.05rem', flexWrap:'wrap' }}>
					<Link to="/flights" onClick={()=>setMenuOpen(false)}>Flights</Link>
					{token && <Link to="/bookings" onClick={()=>setMenuOpen(false)}>My Bookings</Link>}
					{token && <Link to="/history" onClick={()=>setMenuOpen(false)}>History</Link>}
					{token && <Link to="/assistant" onClick={()=>setMenuOpen(false)}>Assistant</Link>}
					{token && <Link to="/passenger" onClick={()=>setMenuOpen(false)}>Passenger</Link>}
					{token && <Link to="/profile" onClick={()=>setMenuOpen(false)}>Profile</Link>}
					<Link to="/admin" onClick={()=>setMenuOpen(false)}>Admin</Link>
				</nav>
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
