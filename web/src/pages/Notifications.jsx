import { useEffect, useState } from 'react'
import api from '../api'

export default function Notifications() {
	const [notifications, setNotifications] = useState([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(false)
	const [filter, setFilter] = useState('all') // all, unread, read

	useEffect(() => {
		loadNotifications()
		const interval = setInterval(loadNotifications, 30000)
		return () => clearInterval(interval)
	}, [filter])

	async function loadNotifications() {
		setLoading(true)
		try {
			const passengerId = localStorage.getItem('passengerId')
			const params = {}
			if (passengerId) params.passengerId = passengerId
			if (filter === 'unread') params.read = 'false'
			if (filter === 'read') params.read = 'true'

			const { data } = await api.get('/api/notifications', { params })
			setNotifications(data.data || [])
			setUnreadCount(data.unreadCount || 0)
		} catch (e) {
			console.error('Failed to load notifications:', e)
		} finally {
			setLoading(false)
		}
	}

	async function markAsRead(id) {
		try {
			await api.put(`/api/notifications/${id}/read`)
			await loadNotifications()
		} catch (e) {
			console.error('Failed to mark as read:', e)
		}
	}

	async function markAllAsRead() {
		try {
			await api.put('/api/notifications/read-all', { markAll: true })
			await loadNotifications()
		} catch (e) {
			console.error('Failed to mark all as read:', e)
		}
	}

	const typeIcons = {
		BOOKING_CONFIRMED: '✓',
		FLIGHT_REMINDER: '⏰',
		CHECK_IN_AVAILABLE: '🎫',
		FLIGHT_DELAYED: '⚠️',
		FLIGHT_CANCELLED: '❌',
		GATE_CHANGE: '🚪',
		BOARDING: '✈️',
		BAGGAGE_UPDATE: '🧳',
		PROMOTION: '🎁',
	}

	return (
		<div style={{ maxWidth: 800, margin: '20px auto', padding: '0 12px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
				<h2>Notifications {unreadCount > 0 && <span style={{ 
					background: '#f44336', 
					color: 'white', 
					borderRadius: '12px', 
					padding: '2px 8px', 
					fontSize: '14px' 
				}}>{unreadCount}</span>}</h2>
				<div style={{ display: 'flex', gap: '8px' }}>
					<button onClick={() => setFilter('all')} style={{ 
						background: filter === 'all' ? '#007bff' : 'var(--glass-bg)',
						color: filter === 'all' ? '#fff' : 'var(--text)',
						border: '1px solid var(--glass-border)'
					}}>All</button>
					<button onClick={() => setFilter('unread')} style={{ 
						background: filter === 'unread' ? '#007bff' : 'var(--glass-bg)',
						color: filter === 'unread' ? '#fff' : 'var(--text)',
						border: '1px solid var(--glass-border)'
					}}>Unread</button>
					<button onClick={markAllAsRead}>Mark All Read</button>
				</div>
			</div>

			{loading && <p>Loading...</p>}

			{!loading && notifications.length === 0 && (
				<p>No notifications</p>
			)}

			{!loading && notifications.length > 0 && (
				<div style={{ display: 'grid', gap: '12px' }}>
					{notifications.map(notif => (
						<div 
							key={notif._id} 
							onClick={() => !notif.read && markAsRead(notif._id)}
							style={{ 
								border: '1px solid #ddd', 
								borderRadius: '8px', 
								padding: '16px',
								background: notif.read ? '#fff' : '#e3f2fd',
								cursor: notif.read ? 'default' : 'pointer',
								borderLeft: `4px solid ${notif.read ? '#ccc' : '#2196F3'}`
							}}
						>
							<div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
								<span style={{ fontSize: '24px' }}>{typeIcons[notif.type] || '📢'}</span>
								<div style={{ flex: 1 }}>
									<h4 style={{ margin: 0 }}>{notif.title}</h4>
									<p style={{ margin: '8px 0', color: '#666' }}>{notif.message}</p>
									<div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#999' }}>
										<span>{new Date(notif.createdAt).toLocaleString()}</span>
										<span>{notif.type.replace(/_/g, ' ')}</span>
									</div>
								</div>
								{!notif.read && (
									<span style={{ 
										width: '10px', 
										height: '10px', 
										borderRadius: '50%', 
										background: '#f44336' 
									}} />
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

