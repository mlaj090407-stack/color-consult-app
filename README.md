# 🎨 AI Color Consultation Tool

An AI-powered paint color consultation tool that provides **realistic wall previews** using advanced AI inpainting technology.

## Features

- **📸 Photo Upload** - Upload any room photo
- **✨ AI Wall Detection** - Automatically detects walls and surfaces using Segment Anything Model (SAM)
- **🎯 Click to Select** - Simply click on walls to select/deselect what you want painted
- **💬 Smart Questionnaire** - 10 questions about your style, lighting, and preferences
- **🎨 Expert Recommendations** - Get 3 personalized Sherwin Williams color recommendations from Claude AI
- **🖼️ Realistic AI Previews** - See how colors actually look with AI-powered inpainting (not just overlays!)

## How It Works

1. Upload your room photo
2. AI automatically detects all walls and surfaces
3. Click to select which areas you want to paint
4. Answer quick questions about your style
5. Get 3 color recommendations
6. Click any color to see a **realistic AI-generated preview** of your room with that paint color

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **AI Color Recommendations**: Anthropic Claude API
- **Wall Detection**: Replicate SAM (Segment Anything Model)
- **Realistic Previews**: Replicate SDXL Inpainting
- **Hosting**: Vercel

## Setup

### 1. Get API Keys

You need two API keys:

**Anthropic API Key** (for color recommendations)
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create an API key

**Replicate API Key** (for wall detection + AI previews)
- Go to [replicate.com](https://replicate.com)
- Create an API token

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables
vercel env add ANTHROPIC_API_KEY
vercel env add REPLICATE_API_KEY

# Deploy to production
vercel --prod
```

Or deploy via Vercel Dashboard:
1. Import your repo at vercel.com
2. Add Environment Variables:
   - `ANTHROPIC_API_KEY` = your Anthropic key
   - `REPLICATE_API_KEY` = your Replicate key
3. Deploy

## Cost Estimates

Per consultation:
- **Anthropic Claude**: ~$0.003
- **SAM Segmentation**: ~$0.01
- **SDXL Inpainting** (per color preview): ~$0.02-0.04

**Total per full consultation with 3 previews**: ~$0.08-0.15

## Local Development

```bash
# Create .env file
echo "ANTHROPIC_API_KEY=your_key_here" > .env
echo "REPLICATE_API_KEY=your_key_here" >> .env

# Run locally
vercel dev
```

## Project Structure

```
├── index.html              # Main app (all frontend code)
├── api/
│   ├── generate-colors.js  # Claude AI color recommendations
│   ├── segment-image.js    # SAM wall detection
│   └── inpaint-walls.js    # SDXL realistic preview generation
├── package.json
├── vercel.json
└── README.md
```

## Why This Approach?

Unlike simple color overlays that just tint pixels, this tool uses **AI inpainting** which:
- Understands the context of the room
- Preserves realistic lighting and shadows
- Renders paint texture appropriately
- Keeps furniture and decor looking natural

The result is previews that look like actual professional photos, not filtered images.
