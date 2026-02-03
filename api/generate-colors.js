// api/generate-colors.js
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'ANTHROPIC_API_KEY not found in environment variables. Please add it in Vercel Settings → Environment Variables and redeploy.',
        debug: {
          hint: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables'
        }
      });
    }

    const { answers } = req.body;

    if (!answers) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    const prompt = `You are an expert interior designer and color consultant specializing in Sherwin Williams paints. Based on the following client information, recommend exactly 3 Sherwin Williams paint colors.

CLIENT INFORMATION:
- Surfaces to paint: ${answers.surfaces_to_paint || 'Not specified'}
- Room type: ${answers.room_type || 'Not specified'}
- Natural lighting: ${answers.lighting || 'Not specified'}
- Light bulb type: ${answers.light_bulbs || 'Not specified'}
- Desired style: ${answers.style || 'Not specified'}
- Desired mood: ${answers.mood || 'Not specified'}
- Existing furniture/decor colors: ${answers.existing_colors || 'Not specified'}
- Colors to avoid: ${answers.avoid_colors || 'None specified'}
- Tone preference: ${answers.preference || 'No preference'}
- Additional notes: ${answers.additional_info || 'None'}

REQUIREMENTS:
1. Provide exactly 3 different Sherwin Williams paint colors
2. Use REAL Sherwin Williams color names with their actual SW codes
3. Provide accurate hex codes that match the real Sherwin Williams colors
4. Each recommendation should work well with the client's existing decor
5. Consider how the color will look under their lighting conditions
6. Provide diverse options (e.g., one safe choice, one bold choice, one middle ground)

IMPORTANT: Respond ONLY with a valid JSON array, no additional text or markdown formatting.

Format your response exactly like this:
[
  {
    "name": "Color Name (SW XXXX)",
    "hex": "#XXXXXX",
    "description": "2-3 sentences explaining why this color works for this space, considering the lighting, style, and existing decor."
  },
  {
    "name": "Color Name (SW XXXX)",
    "hex": "#XXXXXX",
    "description": "2-3 sentences explaining why this color works for this space."
  },
  {
    "name": "Color Name (SW XXXX)",
    "hex": "#XXXXXX",
    "description": "2-3 sentences explaining why this color works for this space."
  }
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
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { raw: errorText };
      }
      
      console.error('Anthropic API error:', errorData);
      
      return res.status(500).json({ 
        error: `Anthropic API error: ${errorData.error?.message || 'Unknown error'}`,
        debug: errorData
      });
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      return res.status(500).json({ 
        error: 'Invalid response from Anthropic API',
        debug: data
      });
    }

    let responseText = data.content[0].text.trim();
    
    // Clean up response - remove markdown code blocks if present
    responseText = responseText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();
    
    // Try to extract JSON array if there's extra text
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }
    
    let colors;
    try {
      colors = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      return res.status(500).json({ 
        error: 'Failed to parse color recommendations',
        debug: { responseText, parseError: parseError.message }
      });
    }
    
    // Validate the response structure
    if (!Array.isArray(colors) || colors.length === 0) {
      return res.status(500).json({ 
        error: 'Invalid color recommendations format',
        debug: { colors }
      });
    }
    
    // Ensure each color has required fields
    colors = colors.map((color, index) => ({
      name: color.name || `Color ${index + 1}`,
      hex: color.hex || '#808080',
      description: color.description || 'A versatile color choice for your space.'
    }));
    
    return res.status(200).json({ colors });

  } catch (error) {
    console.error('Error in generate-colors:', error);
    return res.status(500).json({ 
      error: error.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
