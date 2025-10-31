import { useEffect, useRef, useState } from 'react'
import { askGemini } from '../gemini'

const DEFAULT_PROMPT = 'You are an airline booking helper. Answer concisely about flights, airports, dates, and booking steps for this app. If a user asks for actions, describe how to do them within the app.'
const DEFAULT_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCtQMo1AryV3zS-1HqeUsU8Qz0ig9S8PSk'

export default function Assistant() {
	const [apiKey] = useState(()=> localStorage.getItem('geminiKey') || DEFAULT_KEY)
	const [input, setInput] = useState('Best time to fly from JFK to LAX next week?')
	const [messages, setMessages] = useState([{ role:'system', content: DEFAULT_PROMPT }])
	const [loading, setLoading] = useState(false)
	const [tts, setTts] = useState(true)
	const [isSpeaking, setIsSpeaking] = useState(false)
	const endRef = useRef(null)

	useEffect(()=>{ endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

	function saveKey(v) { localStorage.setItem('geminiKey', v) }

	async function send() {
		const q = input.trim(); if (!q) return
		setInput(''); const next = [...messages, { role:'user', content: q }]
		setMessages(next); setLoading(true)
		try {
			const reply = await askGemini(apiKey, next.filter(m=>m.role!=='system'))
			const cleanedReply = cleanText(reply)
			setMessages(m => [...m, { role:'assistant', content: cleanedReply }])
			if (tts) { speak(cleanedReply) }
		} catch (e) {
			setMessages(m => [...m, { role:'assistant', content: 'Error contacting Gemini: '+ e.message }])
		} finally { setLoading(false) }
	}

	function cleanText(text) {
		// Remove markdown asterisks and other markdown formatting
		return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '').replace(/`/g, '').trim()
	}

	function speak(text) {
		try {
			window.speechSynthesis.cancel()
			const cleaned = cleanText(text)
			const u = new SpeechSynthesisUtterance(cleaned)
			u.rate = 1
			u.onstart = () => setIsSpeaking(true)
			u.onend = () => setIsSpeaking(false)
			u.onerror = () => setIsSpeaking(false)
			window.speechSynthesis.speak(u)
		} catch {}
	}

	function stopSpeech() {
		try {
			window.speechSynthesis.cancel()
			setIsSpeaking(false)
		} catch {}
	}

	function startVoice() {
		const SR = window.SpeechRecognition || window.webkitSpeechRecognition
		if (!SR) return alert('SpeechRecognition not supported in this browser')
		const r = new SR(); r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 1
		r.onresult = (ev)=>{ const txt = ev.results[0][0].transcript; setInput(txt) }
		r.start()
	}

	return (
		<div style={{ maxWidth: 900, margin: '20px auto', padding:'0 12px' }}>
			<h2>Assistant</h2>
			<div className="glass" style={{ padding:12, marginTop:8 }}>
				<div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
					<label style={{ display:'flex', alignItems:'center', gap:6 }}><input type="checkbox" checked={tts} onChange={e=>setTts(e.target.checked)} /> Voice reply</label>
					<span style={{ opacity:.7, fontSize:12 }}>Using configured API key</span>
				</div>
				<div style={{ maxHeight: 420, overflow:'auto', marginTop:10, padding:8, border:'1px solid rgba(255,255,255,0.12)', borderRadius:8 }}>
					{messages.filter(m=>m.role!=='system').map((m, idx)=> (
						<div key={idx} style={{ margin:'6px 0', textAlign: m.role==='user'?'right':'left' }}>
							<div style={{ display:'inline-block', padding:'8px 10px', borderRadius:10, background: m.role==='user'?'rgba(59,130,246,0.2)':'rgba(240,244,248,0.9)' }}>
								<div style={{ opacity:.8, fontSize:12 }}>{m.role==='user'?'You':'Assistant'}</div>
								<div>{m.content}</div>
							</div>
						</div>
					))}
					<div ref={endRef} />
				</div>
				<div style={{ display:'flex', gap:8, marginTop:10 }}>
					<input style={{ flex:1 }} value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about flights, routes, booking..." onKeyDown={e=>{ if(e.key==='Enter') send() }} />
					{isSpeaking && <button onClick={stopSpeech} style={{ fontSize:'0.9rem', padding:'0.4em 0.8em' }}>Stop</button>}
					<button onClick={startVoice}>🎤</button>
					<button onClick={send} disabled={loading}>{loading?'Thinking...':'Send'}</button>
				</div>
				<p style={{ opacity:.7, fontSize:12, marginTop:6 }}>Tip: Ask things like "Cheapest time to fly JFK→LAX" or "How to book a business seat?"</p>
			</div>
		</div>
	)
}


