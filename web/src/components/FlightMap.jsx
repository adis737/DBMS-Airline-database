import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
	iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
	iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom icon for live flights
const flightIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
})

export default function FlightMap() {
	const [flights, setFlights] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedFlight, setSelectedFlight] = useState(null)

	useEffect(() => {
		loadFlights()
		const interval = setInterval(loadFlights, 30000) // Refresh every 30 seconds
		return () => clearInterval(interval)
	}, [])

	async function loadFlights() {
		try {
			setLoading(true)
			setError('')
			const { data } = await api.get('/api/flights/realtime', { 
				params: { limit: 100 } 
			})
			
			// Show flights with live coordinates or at least route information
			const validFlights = (data.data || []).filter(f => 
				(f.liveLatitude && f.liveLongitude) || 
				(f.originLatitude && f.originLongitude && f.destinationLatitude && f.destinationLongitude)
			)
			setFlights(validFlights)
		} catch (e) {
			console.error('Failed to load flights:', e)
			setError(e.response?.data?.error || e.message || 'Failed to load flights')
		} finally {
			setLoading(false)
		}
	}

	// Calculate center of map based on flights
	const getMapCenter = () => {
		if (flights.length === 0) return [39.8283, -98.5795] // Center of USA
		
		const validFlights = flights.filter(f => f.liveLatitude && f.liveLongitude)
		if (validFlights.length === 0) return [39.8283, -98.5795]
		
		const avgLat = validFlights.reduce((sum, f) => sum + f.liveLatitude, 0) / validFlights.length
		const avgLng = validFlights.reduce((sum, f) => sum + f.liveLongitude, 0) / validFlights.length
		return [avgLat, avgLng]
	}

	const flight = selectedFlight

	return (
		<div style={{ width: '100%', height: '600px', position: 'relative', marginTop: '20px' }}>
			{loading && (
				<div style={{
					position: 'absolute',
					top: 10,
					left: 10,
					zIndex: 1000,
					background: 'white',
					padding: '8px 16px',
					borderRadius: 4,
					boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
				}}>
					Loading flights...
				</div>
			)}
			{error && (
				<div style={{
					position: 'absolute',
					top: 10,
					left: 10,
					zIndex: 1000,
					background: '#fee',
					padding: '8px 16px',
					borderRadius: 4,
					boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
					color: '#c00'
				}}>
					{error}
				</div>
			)}
			<div style={{
				position: 'absolute',
				top: 10,
				right: 10,
				zIndex: 1000,
				background: 'white',
				padding: '8px 16px',
				borderRadius: 4,
				boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
			}}>
				<strong>{flights.length}</strong> flights shown<br/>
				<small>{flights.filter(f => f.liveLatitude).length} with live data</small>
			</div>
			
			<MapContainer
				center={getMapCenter()}
				zoom={4}
				style={{ height: '100%', width: '100%', zIndex: 1 }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				
				{flights.map(f => {
					// Use live coordinates if available, otherwise show at origin
					const hasLive = f.liveLatitude && f.liveLongitude
					const position = hasLive 
						? [f.liveLatitude, f.liveLongitude]
						: (f.originLatitude && f.originLongitude ? [f.originLatitude, f.originLongitude] : null)
					
					if (!position) return null
					
					return (
						<Marker
							key={f.id}
							position={position}
							icon={flightIcon}
							eventHandlers={{
								click: () => setSelectedFlight(f)
							}}
						>
							<Popup>
								<div>
									<strong>{f.airline} {f.flightNumber}</strong><br/>
									{f.origin} → {f.destination}<br/>
									Status: {f.status}<br/>
									{hasLive ? (
										<>
											{f.liveAltitude && `Altitude: ${Math.round(f.liveAltitude)} ft`}<br/>
											{f.liveSpeed && `Speed: ${Math.round(f.liveSpeed * 1.15078)} mph`}<br/>
											{f.liveDirection && `Heading: ${Math.round(f.liveDirection)}°`}
										</>
									) : (
										<span style={{ fontStyle: 'italic', color: '#666' }}>No live data</span>
									)}
								</div>
							</Popup>
						</Marker>
					)
				})}
				
				{flight && flight.originLatitude && flight.originLongitude && 
				 flight.destinationLatitude && flight.destinationLongitude && (
					<Polyline
						positions={[
							[flight.originLatitude, flight.originLongitude],
							...(flight.liveLatitude && flight.liveLongitude 
								? [[flight.liveLatitude, flight.liveLongitude]] 
								: []),
							[flight.destinationLatitude, flight.destinationLongitude]
						]}
						color="blue"
						weight={2}
						dashArray="5, 5"
					/>
				)}
				
				{/* Show all flight routes as light lines */}
				{flights.map(f => {
					if (!f.originLatitude || !f.originLongitude || 
						!f.destinationLatitude || !f.destinationLongitude) return null
					
					return (
						<Polyline
							key={`route-${f.id}`}
							positions={[
								[f.originLatitude, f.originLongitude],
								...(f.liveLatitude && f.liveLongitude 
									? [[f.liveLatitude, f.liveLongitude]] 
									: []),
								[f.destinationLatitude, f.destinationLongitude]
							]}
							color={f.liveLatitude ? "green" : "gray"}
							weight={f === selectedFlight ? 3 : 1}
							opacity={0.5}
							dashArray={f.liveLatitude ? "3, 3" : "10, 5"}
						/>
					)
				})}
			</MapContainer>
		</div>
	)
}

