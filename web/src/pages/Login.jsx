import { useState } from 'react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [mode, setMode] = useState('login')
	const [email, setEmail] = useState('')
	const [error, setError] = useState('')
	const navigate = useNavigate()

	async function submit(e) {
		e.preventDefault()
		setError('')
		try {
			let data;
			if (mode === 'register') {
				data = await api.post('/api/auth/register', { username, email, password })
				if (data.data?.passengerId) {
					localStorage.setItem('passengerId', data.data.passengerId)
				}
			}
			data = await api.post('/api/auth/login', { username, password })
			localStorage.setItem('token', data.data.token)
			if (data.data.passengerId) {
				localStorage.setItem('passengerId', data.data.passengerId)
			}
			navigate('/flights')
		} catch (err) {
			const apiErr = err.response?.data
			if (apiErr?.details && Array.isArray(apiErr.details)) {
				setError(apiErr.details.join(', '))
			} else {
				setError(apiErr?.error || err.message)
			}
		}
	}

	return (
		<div style={{ display:'grid', placeItems:'center', minHeight:'60vh' }}>
			<div className="glass" style={{ width: 420, borderRadius:8, padding:20 }}>
				<h2 className="gradient-text" style={{ marginTop:0 }}>{mode === 'login' ? 'Login' : 'Create account'}</h2>
				<form onSubmit={submit} style={{ display:'grid', gap:10 }}>
					<label>
						<div>Username</div>
						<input value={username} onChange={(e)=>setUsername(e.target.value)} required minLength={3} />
					</label>
					{mode==='register' && (
						<label>
							<div>Email</div>
							<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
						</label>
					)}
					<label>
						<div>Password</div>
						<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={8} />
					</label>
					<button type="submit">{mode==='login' ? 'Login' : 'Register & Login'}</button>
				</form>
				<div style={{ display:'flex', justifyContent:'space-between', marginTop:10 }}>
					<button onClick={()=>setMode(mode==='login'?'register':'login')}>
						Switch to {mode==='login'?'Register':'Login'}
					</button>
					<Link to="/get-started">Back</Link>
				</div>
				{error && <p style={{ color:'salmon', marginTop:10 }}>{error}</p>}
				<p style={{ color:'#cbd5e1', fontSize:12 }}>Password must be at least 8 characters.</p>
			</div>
		</div>
	)
}
