const MODEL = 'gemini-1.5-flash-latest';

function messagesToContents(messages) {
	return messages.map(m => ({
		role: m.role === 'user' ? 'user' : 'model',
		parts: [{ text: m.content }]
	}));
}

export async function askGemini(apiKey, messages) {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`
	const body = {
		contents: messagesToContents(messages),
		generationConfig: { temperature: 0.6, topK: 40, topP: 0.9, maxOutputTokens: 512 },
	};
	const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
	if (!res.ok) throw new Error(`Gemini error: ${res.status}`)
	const data = await res.json();
	const text = data?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('\n') || '';
	return text;
}


