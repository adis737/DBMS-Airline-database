import { useEffect, useState } from 'react'
import api from '../api'

export default function Reviews() {
	const [reviews, setReviews] = useState([])
	const [loading, setLoading] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [formData, setFormData] = useState({ bookingId: '', rating: 5, title: '', comments: '' })
	const [myBookings, setMyBookings] = useState([])

	useEffect(() => {
		loadReviews()
		loadMyBookings()
	}, [])

	async function loadReviews() {
		setLoading(true)
		try {
			const { data } = await api.get('/api/reviews')
			setReviews(data.data || [])
		} catch (e) {
			console.error('Failed to load reviews:', e)
		} finally {
			setLoading(false)
		}
	}

	async function loadMyBookings() {
		try {
			const passengerId = localStorage.getItem('passengerId')
			if (!passengerId) return
			
			const { data } = await api.get('/api/bookings', { params: { passengerId } })
			setMyBookings(data.data || data || [])
		} catch (e) {
			console.error('Failed to load bookings:', e)
		}
	}

	async function handleSubmit(e) {
		e.preventDefault()
		try {
			await api.post('/api/reviews', formData)
			alert('Review submitted! Thank you for your feedback.')
			setShowForm(false)
			setFormData({ bookingId: '', rating: 5, title: '', comments: '' })
			await loadReviews()
		} catch (e) {
			alert(e.response?.data?.error || e.message)
		}
	}

	const renderStars = (rating) => {
		return '★'.repeat(rating) + '☆'.repeat(5 - rating)
	}

	return (
		<div style={{ maxWidth: 1000, margin: '20px auto', padding: '0 12px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
				<h2>Flight Reviews</h2>
				<button onClick={() => setShowForm(!showForm)}>
					{showForm ? 'Cancel' : '+ Write Review'}
				</button>
			</div>

			{showForm && (
				<form onSubmit={handleSubmit} style={{ 
					border: '1px solid #ddd', 
					borderRadius: '8px', 
					padding: '20px', 
					marginBottom: '20px',
					background: '#f9f9f9'
				}}>
					<h3>Write a Review</h3>
					<div style={{ display: 'grid', gap: '12px' }}>
						<label>
							Booking <select 
								value={formData.bookingId} 
								onChange={e => setFormData({...formData, bookingId: e.target.value})} 
								required
							>
								<option value="">Select a booking</option>
								{myBookings.map(b => (
									<option key={b._id} value={b._id}>
										{b.flight?.flightNumber || b.bookingId} - {b.flight?.origin} → {b.flight?.destination}
									</option>
								))}
							</select>
						</label>
						<label>
							Rating 
							<select value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})}>
								{[5, 4, 3, 2, 1].map(r => (
									<option key={r} value={r}>{r} {r === 1 ? 'star' : 'stars'}</option>
								))}
							</select>
							<span style={{ marginLeft: '8px', color: '#FFD700' }}>{renderStars(formData.rating)}</span>
						</label>
						<label>
							Title <input 
								value={formData.title} 
								onChange={e => setFormData({...formData, title: e.target.value})} 
							/>
						</label>
						<label>
							Comments <textarea 
								value={formData.comments} 
								onChange={e => setFormData({...formData, comments: e.target.value})}
								rows={4}
								required
							/>
						</label>
						<button type="submit">Submit Review</button>
					</div>
				</form>
			)}

			{loading && <p>Loading...</p>}

			{!loading && reviews.length === 0 && (
				<p>No reviews yet. Be the first to review!</p>
			)}

			{!loading && reviews.length > 0 && (
				<div style={{ display: 'grid', gap: '16px' }}>
					{reviews.map(review => (
						<div key={review._id} style={{ 
							border: '1px solid #ddd', 
							borderRadius: '8px', 
							padding: '16px' 
						}}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
								<div>
									<h4>{review.title || 'Review'}</h4>
									<p style={{ color: '#FFD700', fontSize: '20px', margin: '8px 0' }}>
										{renderStars(review.rating)}
									</p>
									<p><strong>Flight:</strong> {review.flight?.flightNumber || review.airline}</p>
									<p><strong>Route:</strong> {review.flight?.origin} → {review.flight?.destination}</p>
									<p>{review.comments}</p>
									<p style={{ fontSize: '12px', color: '#666' }}>
										By {review.passenger?.firstName} {review.passenger?.lastName} • {new Date(review.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

