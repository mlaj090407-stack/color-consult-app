// api/inpaint-walls.js
// Uses Stability AI's SDXL Inpainting for realistic wall repainting

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.REPLICATE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'REPLICATE_API_KEY not found. Add it in Vercel Environment Variables.'
      });
    }

    const { image, mask, colorName, colorHex } = req.body;
    
    if (!image || !mask) {
      return res.status(400).json({ error: 'Image and mask are required' });
    }

    // Use SDXL Inpainting model for high-quality results
    // This model intelligently repaints the masked area while preserving the rest
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // SDXL Inpainting model
        version: '95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3',
        input: {
          image: image,
          mask: mask,
          prompt: `Interior wall painted in ${colorName} (${colorHex}), smooth matte paint finish, professional interior painting, same room architecture and furniture visible, photorealistic, high quality, natural lighting preserved`,
          negative_prompt: 'different room, changed furniture, different architecture, glossy, shiny, wet paint, paint drips, uneven paint, brush strokes visible, low quality, blurry, distorted',
          num_inference_steps: 30,
          guidance_scale: 7.5,
          strength: 0.85,
          scheduler: 'K_EULER',
          num_outputs: 1,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Replicate inpaint error:', errorData);
      
      // Try alternative model
      return await tryAlternativeInpaint(apiKey, image, mask, colorName, colorHex, res);
    }

    const prediction = await response.json();
    
    // Poll for result
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 90; // Allow up to 90 seconds
    
    while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });
      
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status === 'succeeded' && result.output) {
      const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      
      // Fetch the image and convert to base64 for reliable display
      const imageResponse = await fetch(outputUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;
      
      return res.status(200).json({ 
        imageUrl: dataUrl,
        success: true
      });
    } else {
      console.error('Inpainting failed:', result);
      return await tryAlternativeInpaint(apiKey, image, mask, colorName, colorHex, res);
    }

  } catch (error) {
    console.error('Inpaint error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Fallback to a different inpainting model if primary fails
async function tryAlternativeInpaint(apiKey, image, mask, colorName, colorHex, res) {
  try {
    // Try Stable Diffusion Inpainting as fallback
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // SD 1.5 Inpainting (more reliable, faster)
        version: 'c11bac58203367db93a3c552bd49a25a5418458ddffb7e90dae55780765e26d6',
        input: {
          image: image,
          mask: mask,
          prompt: `wall painted ${colorName} ${colorHex}, smooth matte interior paint, same room, photorealistic`,
          negative_prompt: 'different room, glossy, wet, drips, low quality',
          num_inference_steps: 25,
          guidance_scale: 7.5,
        }
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Both inpainting models failed' });
    }

    const prediction = await response.json();
    
    let result = prediction;
    let attempts = 0;
    
    while ((result.status === 'starting' || result.status === 'processing') && attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status === 'succeeded' && result.output) {
      const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      const imageResponse = await fetch(outputUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      
      return res.status(200).json({ 
        imageUrl: `data:image/png;base64,${base64}`,
        success: true
      });
    }
    
    return res.status(500).json({ error: 'Inpainting failed' });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
