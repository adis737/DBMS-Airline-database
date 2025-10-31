function messagesToContents(messages) {
	return messages.map(m => ({
		role: m.role === 'user' ? 'user' : 'model',
		parts: [{ text: m.content }]
	}));
}

async function listAvailableModels(apiKey) {
	try {
		const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`;
		const res = await fetch(url);
		if (res.ok) {
			const data = await res.json();
			return data.models || [];
		}
	} catch (e) {
		console.warn('Could not list models:', e);
	}
	return [];
}

export async function askGemini(apiKey, messages) {
	// First try to get available models dynamically
	const availableModels = await listAvailableModels(apiKey);
	const textModels = availableModels
		.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
		.map(m => {
			const name = m.name.replace('models/', '');
			const version = m.name.startsWith('models/') ? 'v1' : 'v1beta';
			return { name, version };
		});
	
	// Fallback to simpler model names if listing fails
	const fallbackModels = [
		{ name: 'gemini-pro', version: 'v1' },
		{ name: 'text-bison-001', version: 'v1' },
		{ name: 'chat-bison-001', version: 'v1' }
	];
	
	const modelsToTry = textModels.length > 0 ? textModels : fallbackModels;
	let lastError = null;
	
	for (const { name, version } of modelsToTry) {
		try {
			const baseUrl = `https://generativelanguage.googleapis.com/${version}/models/${name}:generateContent`;
			const url = `${baseUrl}?key=${encodeURIComponent(apiKey)}`;
			const body = {
				contents: messagesToContents(messages),
				generationConfig: { 
					temperature: 0.6, 
					topK: 40, 
					topP: 0.9, 
					maxOutputTokens: 512 
				},
			};
			
			const res = await fetch(url, { 
				method: 'POST', 
				headers: { 'Content-Type': 'application/json' }, 
				body: JSON.stringify(body) 
			});
			
			if (res.ok) {
				const data = await res.json();
				const text = data?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('\n') || '';
				if (text) return text;
			} else {
				const errorText = await res.text();
				lastError = `Status ${res.status}: ${errorText.substring(0, 200)}`;
				if (res.status === 403) {
					throw new Error('API key error (403): Ensure Generative Language API is enabled in Google Cloud Console.');
				}
				continue;
			}
		} catch (e) {
			if (e.message.includes('403')) throw e;
			lastError = e.message;
			continue;
		}
	}
	
	throw new Error(`All models failed. Check that your API key has the Generative Language API enabled. Last error: ${lastError}`);
}
