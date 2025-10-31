import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import GetStarted from './pages/GetStarted'
import Login from './pages/Login'
import Flights from './pages/Flights'
import Bookings from './pages/Bookings'
import Passenger from './pages/Passenger'
import Profile from './pages/Profile'
import History from './pages/History'
import Assistant from './pages/Assistant'
import Admin from './pages/Admin'
import './App.css'

function RequireAuth({ children }) {
	const token = localStorage.getItem('token')
	if (!token) return <Navigate to="/login" replace />
	return children
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}> 
					<Route path="/get-started" element={<GetStarted />} />
					<Route path="/login" element={<Login />} />
					<Route path="/flights" element={<Flights />} />
					<Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
					<Route path="/history" element={<History />} />
					<Route path="/assistant" element={<Assistant />} />
					<Route path="/admin" element={<Admin />} />
					<Route path="/passenger" element={<Passenger />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/" element={<Navigate to="/get-started" replace />} />
					<Route path="*" element={<Navigate to="/get-started" replace />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}
