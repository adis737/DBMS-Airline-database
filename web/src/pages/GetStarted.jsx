import { Link } from 'react-router-dom'

export default function GetStarted() {
	return (
		<div style={{ display:'grid', placeItems:'center', minHeight:'80vh', padding:'32px' }}>
			<section className="glass" style={{ maxWidth: 1100, width: '100%', padding:'44px 36px' }}>
				<h1 className="gradient-text" style={{ fontSize: '4.25rem', lineHeight: 1.03 }}>Manage and Book Flights with Ease</h1>
				<p style={{ marginTop: 14, fontSize:'1.15rem', opacity: 0.85 }}>
					Search routes, reserve seats, track payments and manage your bookings — all in one place.
				</p>
				<div style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:26 }}>
					<Link to="/login"><button style={{ fontSize:'1.1rem', padding:'0.9em 1.3em' }}>Login / Create Account</button></Link>
					<Link to="/flights"><button style={{ fontSize:'1.1rem', padding:'0.9em 1.3em' }}>Explore Flights</button></Link>
				</div>
			</section>
		</div>
	)
}
