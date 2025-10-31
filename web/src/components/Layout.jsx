import { Link, Outlet, useNavigate } from 'react-router-dom'

export default function Layout() {
	const navigate = useNavigate()
	const token = localStorage.getItem('token')
	function logout() {
		localStorage.removeItem('token')
		navigate('/get-started')
	}
	return (
		<div>
			<header className="glass" style={{ display:'flex', gap:16, alignItems:'center', padding:'16px 20px', position:'sticky', top:0, zIndex:10 }}>
				<Link to="/get-started" style={{ fontWeight: 800, fontSize: '1.25rem' }} className="gradient-text">Aether Aviation</Link>
				<nav style={{ display:'flex', gap:16, fontSize:'1.05rem' }}>
					<Link to="/flights">Flights</Link>
					<Link to="/bookings">My Bookings</Link>
					<Link to="/history">History</Link>
					<Link to="/assistant">Assistant</Link>
					<Link to="/passenger">Passenger</Link>
					<Link to="/profile">Profile</Link>
				</nav>
				<div style={{ marginLeft:'auto' }}>
					{token ? (
						<button onClick={logout}>Logout</button>
					) : (
						<Link to="/login">Login</Link>
					)}
				</div>
			</header>
			<main style={{ maxWidth: 1280, margin: '0 auto' }}>
				<Outlet />
			</main>
		</div>
	)
}
