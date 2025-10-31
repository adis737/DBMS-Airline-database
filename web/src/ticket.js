import jsPDF from 'jspdf'

export function generateTicketPDF(booking, flight) {
	const doc = new jsPDF()
	const pad = 14
	const line = (y, text) => { doc.text(String(text), pad, y) }

	const title = 'Flight Ticket'
	doc.setFontSize(20)
	doc.text(title, pad, 20)
	doc.setFontSize(12)

	const y0 = 34
	line(y0 + 0, `Booking ID: ${booking.bookingId || booking._id || 'N/A'}`)
	line(y0 + 8, `Passenger ID: ${booking.passenger || 'N/A'}`)
	line(y0 + 16, `Airline: ${flight?.airline || booking.airline || ''}`)
	line(y0 + 24, `Flight: ${flight?.flightNumber || booking.flightNumber || booking.flight}`)
	line(y0 + 32, `Route: ${(flight?.origin || booking.origin) || '—'} → ${(flight?.destination || booking.destination) || '—'}`)
	line(y0 + 40, `Seat: ${booking.seatClass}${booking.seatNumber ? ' ' + booking.seatNumber : ''}`)
	line(y0 + 48, `Travel Date: ${new Date(booking.travelDate || flight?.departureTime || Date.now()).toLocaleString()}`)
	line(y0 + 56, `Amount Paid: $${booking.amount || booking.payment?.amount || 0}`)

	doc.setDrawColor(200)
	doc.roundedRect(pad - 6, 10, 180, 120, 3, 3)

	const fileName = `ticket_${(booking.bookingId || booking._id || 'demo').replace(/[^a-zA-Z0-9_-]/g,'')}.pdf`
	doc.save(fileName)
}


