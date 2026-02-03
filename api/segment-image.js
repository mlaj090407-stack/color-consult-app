// api/segment-image.js
// Uses Replicate's Segment Anything Model (SAM) for automatic wall/surface detection

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
        error: 'REPLICATE_API_KEY not found. Add it in Vercel Environment Variables.',
        fallback: true
      });
    }

    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    // Use SAM (Segment Anything Model) to detect all segments
    // We'll use automatic mask generation mode
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'a00212940bc878d3e057bcd9fd7b1ba80a6b1cfe1d00a6c6ebc3c81b5acac450',
        input: {
          image: image,
          // Automatic mask generation parameters
          points_per_side: 32,
          pred_iou_thresh: 0.88,
          stability_score_thresh: 0.95,
          min_mask_region_area: 1000,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Replicate error:', errorData);
      return res.status(500).json({ error: 'Failed to start segmentation', fallback: true });
    }

    const prediction = await response.json();
    
    // Poll for result
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60;
    
    while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });
      
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status === 'succeeded' && result.output) {
      // SAM returns multiple masks - we'll process them
      const segments = [];
      
      if (Array.isArray(result.output)) {
        for (let i = 0; i < Math.min(result.output.length, 15); i++) {
          segments.push({
            mask: result.output[i],
            label: `Surface ${i + 1}`,
            id: i
          });
        }
      } else if (result.output.masks) {
        for (let i = 0; i < Math.min(result.output.masks.length, 15); i++) {
          segments.push({
            mask: result.output.masks[i],
            label: result.output.labels?.[i] || `Surface ${i + 1}`,
            id: i
          });
        }
      }
      
      return res.status(200).json({ segments });
    } else {
      console.error('Segmentation failed:', result);
      return res.status(500).json({ error: 'Segmentation failed', fallback: true });
    }

  } catch (error) {
    console.error('Segment error:', error);
    return res.status(500).json({ error: error.message, fallback: true });
  }
};
