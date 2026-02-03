# 🎨 AI Color Consultation Tool

An AI-powered color consultation tool that helps users choose Sherwin Williams paint colors for their rooms. Users upload a photo of their room, select the areas they want to paint, answer style preference questions, and receive personalized color recommendations with realistic previews.

## Features

- **Photo Upload**: Drag & drop or click to upload room photos
- **Wall Selection**: Interactive mask editor to select areas to paint
  - Manual brush/eraser tools
  - Auto-detect walls feature
- **AI-Powered Recommendations**: Uses Claude AI to suggest 3 Sherwin Williams paint colors based on:
  - Room type and lighting conditions
  - Style preferences (Modern, Traditional, Minimalist, etc.)
  - Existing furniture and decor colors
  - Mood preferences
- **Live Color Preview**: See how each recommended color looks on your walls with realistic lighting preservation

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (single file, no build required)
- **Backend**: Vercel Serverless Functions
- **AI**: Anthropic Claude API
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone or Download

```bash
git clone <your-repo-url>
cd color-consultant-app
```

### 2. Get Your Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (you'll need it in the next step)

### 3. Deploy to Vercel

#### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Deploy
vercel

# Follow the prompts, then add your environment variable
vercel env add ANTHROPIC_API_KEY
# Paste your API key when prompted
# Select all environments (Production, Preview, Development)

# Redeploy to apply the environment variable
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your repository (or drag & drop the project folder)
4. Before deploying, go to "Environment Variables"
5. Add a new variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key
   - Select all environments
6. Click "Deploy"

### 4. Test Your Deployment

1. Visit your deployed URL (e.g., `https://your-project.vercel.app`)
2. Upload a room photo
3. Select the walls you want to paint
4. Answer the questionnaire
5. View your personalized color recommendations!

## Local Development

```bash
# Install Vercel CLI
npm install -g vercel

# Create a .env file with your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run locally
vercel dev
```

Visit `http://localhost:3000` in your browser.

## Project Structure

```
color-consultant-app/
├── index.html          # Main application (all frontend code)
├── api/
│   └── generate-colors.js   # Serverless function for AI recommendations
├── package.json
├── vercel.json         # Vercel configuration
├── .env.example        # Example environment variables
├── .gitignore
└── README.md
```

## How It Works

1. **Photo Upload**: User uploads a room photo which is resized and converted to base64
2. **Mask Selection**: User paints over the areas they want to change color using canvas tools
3. **Questionnaire**: User answers 10 questions about their style preferences
4. **AI Analysis**: The answers are sent to Claude AI which recommends 3 Sherwin Williams colors
5. **Preview Generation**: Client-side canvas processing applies each color to the masked areas while preserving shadows and lighting
6. **Results**: User can click between colors to see live previews

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
- Make sure you added the environment variable in Vercel
- Ensure you selected "Production" when adding the key
- Try redeploying after adding the key

### "Failed to parse color recommendations"
- This is usually a temporary API issue - try again
- Check that your API key is valid and has available credits

### Colors don't show on preview
- Make sure you selected some wall area in the mask editor
- Try using the "Auto-Detect Walls" feature

## Cost Estimates

- **Anthropic API**: ~$0.003 per consultation (using Claude Sonnet)
- **Vercel**: Free tier should handle thousands of consultations/month
- **Total**: Nearly free for moderate usage

## Future Enhancements

- [ ] Save/export color palettes
- [ ] More sophisticated wall detection using AI segmentation
- [ ] Color palette generator for whole-home consistency
- [ ] Integration with Sherwin Williams store locator
- [ ] AR preview using device camera

## License

MIT License - feel free to use and modify for your projects!
