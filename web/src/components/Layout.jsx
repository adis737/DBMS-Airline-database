import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logoImage from '../assets/—Pngtree—large passenger airplane flying through_20686786.png'

export default function Layout() {
	const navigate = useNavigate()
	const location = useLocation()
	const [menuOpen, setMenuOpen] = useState(false)
	const token = localStorage.getItem('token')
	const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme)
		localStorage.setItem('theme', theme)
	}, [theme])
	function logout() {
		localStorage.removeItem('token')
		navigate('/get-started')
		setMenuOpen(false)
	}
	return (
		<div>
			<header className="glass" style={{ display:'flex', gap:16, alignItems:'center', padding:'16px 20px', position:'fixed', top:'var(--header-gap, 12px)', left:'var(--header-gap, 12px)', right:'var(--header-gap, 12px)', zIndex:20, flexWrap:'wrap' }}>
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
					{token && <Link to="/checkin" onClick={()=>setMenuOpen(false)}>Check-In</Link>}
					{token && <Link to="/baggage" onClick={()=>setMenuOpen(false)}>Baggage</Link>}
					{token && <Link to="/notifications" onClick={()=>setMenuOpen(false)}>Notifications</Link>}
					{token && <Link to="/reviews" onClick={()=>setMenuOpen(false)}>Reviews</Link>}
					{token && <Link to="/history" onClick={()=>setMenuOpen(false)}>History</Link>}
					{token && <Link to="/assistant" onClick={()=>setMenuOpen(false)}>Assistant</Link>}
					{token && <Link to="/passenger" onClick={()=>setMenuOpen(false)}>Passenger</Link>}
					{token && <Link to="/profile" onClick={()=>setMenuOpen(false)}>Profile</Link>}
					<Link to="/admin" onClick={()=>setMenuOpen(false)}>Admin</Link>
				</nav>
				<div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
					<button onClick={()=>setTheme(t=> t==='dark' ? 'light' : 'dark')} title="Toggle theme" aria-label="Toggle theme">
						{theme==='dark' ? '🌙' : '🌞'}
					</button>
					{token ? (
						<button onClick={logout}>Logout</button>
					) : (
						<Link to="/login">Login</Link>
					)}
				</div>
			</header>
			<div style={{ height:'calc(var(--header-h, 72px) + var(--header-gap, 20px))' }} />
			<main style={{ maxWidth: 1280, margin: '0 auto', padding:'0 12px' }}>
				<div className="page-enter" key={location.pathname}>
					<Outlet />
				</div>
			</main>
		</div>
	)
}
