import { useMemo } from 'react'

export default function Profile() {
	const token = localStorage.getItem('token')
	const passengerId = localStorage.getItem('passengerId')
	const payload = useMemo(()=>{
		try { return token ? JSON.parse(atob(token.split('.')[1])) : null } catch { return null }
	}, [token])
	return (
		<div className="glass" style={{ maxWidth: 600, margin:'24px auto', padding:16 }}>
			<h2 className="gradient-text" style={{ marginTop:0 }}>Profile</h2>
			<p><b>User:</b> {payload?.username || 'Guest'}</p>
			<p><b>Roles:</b> {(payload?.roles||[]).join(', ') || '—'}</p>
			<p><b>PassengerId:</b> {passengerId || '—'}</p>
			<div style={{ display:'flex', gap:8 }}>
				<button onClick={()=>{ localStorage.removeItem('passengerId'); location.reload() }}>Clear PassengerId</button>
				{token && <button onClick={()=>{ localStorage.removeItem('token'); location.reload() }}>Logout</button>}
			</div>
		</div>
	)
}

