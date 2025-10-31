export function addActivity(type, details) {
	const entry = { id: `${type}-${Date.now()}`, type, details, at: new Date().toISOString() }
	const log = JSON.parse(localStorage.getItem('activityLog') || '[]')
	localStorage.setItem('activityLog', JSON.stringify([entry, ...log]))
	return entry
}

export function getActivityLog() {
	return JSON.parse(localStorage.getItem('activityLog') || '[]')
}

export function clearActivityLog() {
	localStorage.removeItem('activityLog')
}


