// api/generate-colors.js
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'ANTHROPIC_API_KEY not found. Add it in Vercel Environment Variables.'
      });
    }

    const { answers } = req.body;
    if (!answers) return res.status(400).json({ error: 'No answers provided' });

    const prompt = `You are an expert interior designer specializing in Sherwin Williams paints. Based on this client info, recommend exactly 3 Sherwin Williams paint colors.

CLIENT INFO:
- Room: ${answers.room_type || 'Not specified'}
- Surfaces: ${answers.surfaces_to_paint || 'Walls'}
- Lighting: ${answers.lighting || 'Moderate'}
- Light bulbs: ${answers.light_bulbs || 'Not specified'}
- Style: ${answers.style || 'Not specified'}
- Mood: ${answers.mood || 'Not specified'}
- Existing colors: ${answers.existing_colors || 'Not specified'}
- Avoid: ${answers.avoid_colors || 'None'}
- Tone preference: ${answers.preference || 'No preference'}
- Notes: ${answers.additional_info || 'None'}

REQUIREMENTS:
1. Use REAL Sherwin Williams colors with actual SW codes
2. Provide accurate hex codes
3. Give diverse options (safe, bold, middle-ground)
4. Consider lighting conditions

Respond with ONLY a JSON array, no other text:
[
  {"name": "Color Name (SW XXXX)", "hex": "#XXXXXX", "description": "Why this works (2-3 sentences)"},
  {"name": "Color Name (SW XXXX)", "hex": "#XXXXXX", "description": "Why this works"},
  {"name": "Color Name (SW XXXX)", "hex": "#XXXXXX", "description": "Why this works"}
]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    let text = data.content[0].text.trim();
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) text = jsonMatch[0];
    
    const colors = JSON.parse(text);
    return res.status(200).json({ colors });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
