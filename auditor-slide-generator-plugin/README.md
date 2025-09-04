# Auditor Slide Generator - Figma Plugin

A comprehensive Figma plugin that automatically generates professional auditor slides by combining Sherlock Protocol data with custom content and logo management.

## 🎯 Features

- **Automated Auditor Data**: Fetches auditor achievements, earnings, and vulnerability stats from Sherlock Protocol
- **Smart Frame Duplication**: Creates timestamped slides with proper naming: `[timestamp] [protocol] [auditor]`
- **Text Layer Management**: Automatically updates text layers based on predefined naming conventions
- **Logo Database System**: Upload, search, and manage company logos with different layout configurations (3, 4, or 6 logos)
- **Profile Image Replacement**: Automatically replaces placeholder images with actual Sherlock profile pictures
- **Template Analysis**: Analyzes slide template structure for easy setup and debugging
- **Custom Content Integration**: Combines scraped data with manual input fields for protocol-specific content

## 📋 Requirements

- **Figma Desktop App** (plugins don't work in browser version)
- **Node.js** 16+ for local development
- **Active Sherlock Scraper API** (for auditor data fetching)

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```bash
cd auditor-slide-generator-plugin
npm install
```

### Step 2: Build Plugin

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Step 3: Load Plugin in Figma

1. **Open Figma Desktop App**
2. **Go to Plugins** → **Development** → **Import plugin from manifest...**
3. **Select** the `manifest.json` file from this directory
4. **Plugin will appear** in your Plugins menu as "Auditor Slide Generator"

### Step 4: Configure API Endpoint

Update the API endpoint in `src/code.ts` at the `getApiHost()` function:

```typescript
async function getApiHost(): Promise<string> {
  const endpoints = [
    'http://localhost:5000',
    'https://your-repl-name--your-username.repl.co' // Add your actual Replit URL
  ];
  // ... rest of function
}
```

## 🎨 Usage

### 1. Prepare Your Slide Template

Create a slide template in Figma with properly named text layers:

```
auditor-name        → Auto-filled with auditor's name
subheading          → Manual input: brief tagline
description         → Manual input: detailed bio
achievement-1       → Auto-filled: contest rankings
achievement-2       → Auto-filled: total earnings
achievement-3       → Auto-filled: vulnerability summary
achievement-4       → Manual input: additional achievement
goodfit-1          → Manual input: why great fit - point 1
goodfit-2          → Manual input: why great fit - point 2
goodfit-3          → Manual input: why great fit - point 3
title              → Auto-generated: slide title
```

**Image containers:**
```
profile-image      → Replaced with Sherlock profile picture
logo               → Logo containers (name any image container with "logo")
```

### 2. Launch Plugin

1. **Select your template frame** (or plugin will use first frame on page)
2. **Run Plugin**: `Plugins` → `Auditor Slide Generator`
3. **Set Template**: Click "Set Template" to confirm your selected frame
4. **Analyze Template**: Click "Analyze Template" to verify structure

### 3. Configure Content

#### Auditor & Protocol:
- **Auditor Profile URL**: Full Sherlock URL (e.g., `https://audits.sherlock.xyz/watson/berndartmueller`)
- **Protocol Name**: Target protocol (e.g., `Aave`, `Compound`)

#### Logo Selection:
- **Choose Layout**: 3, 4, or 6 logo configuration
- **Upload Logos**: Drag & drop or click to upload PNG/SVG files
- **Search & Select**: Use search to find and select logos from database

#### Custom Content:
- **Auditor Subheading**: Brief professional tagline
- **Auditor Description**: Comprehensive bio and expertise
- **Additional Achievement**: Fourth achievement line
- **Why Great Fit (3 points)**: Protocol-specific reasons

### 4. Generate Slide

Click **"Generate Slide"** and the plugin will:
1. Validate template structure
2. Fetch auditor data from Sherlock
3. Duplicate template frame
4. Update all text layers
5. Place selected logos
6. Replace profile image
7. Focus on the new slide

## 🛠️ Development

### Local Development Server

```bash
# Start development server with hot reload
npm run start

# Watch mode for development
npm run dev

# Clean build directory
npm run clean

# Lint code
npm run lint
```

### Project Structure

```
auditor-slide-generator-plugin/
├── src/
│   ├── code.ts          # Main plugin logic
│   ├── ui.html          # Plugin UI interface
│   └── ui.ts            # UI interaction handlers
├── dist/                # Built plugin files
├── manifest.json        # Plugin configuration
├── package.json         # Dependencies and scripts
├── webpack.config.js    # Build configuration
└── tsconfig.json        # TypeScript configuration
```

### Core Functions

**Main Plugin (`code.ts`):**
- `handleSlideGeneration()` - Main slide creation workflow
- `duplicateTemplateFrame()` - Frame duplication with naming
- `updateSlideContent()` - Text layer updates
- `placeSlideLogo()` - Logo placement logic
- `fetchAuditorData()` - Sherlock API integration

**UI Interface (`ui.ts`):**
- Logo database management
- Template analysis display
- Progress tracking
- Error handling and user feedback

## 🔧 API Integration

### Sherlock Scraper API

The plugin connects to your Sherlock scraper API to fetch:
- Auditor name and profile image
- Contest rankings and placements
- Total earnings from audits
- Vulnerability discovery statistics

**Example API Response:**
```json
{
  "success": true,
  "profile": {
    "name": "berndartmueller",
    "profileImageUrl": "https://sherlock-files.ams3.digitaloceanspaces.com/...",
    "achievements": {
      "rankings": "4x first place, 4x second place, 5x third place",
      "earnings": "$336.50K",
      "highsFound": 90,
      "mediumsFound": 161,
      "soloHighs": 1,
      "soloMediums": 14
    }
  }
}
```

### Logo Database

Logos are stored in Figma's `clientStorage` with the following structure:

```typescript
interface LogoItem {
  id: string;
  name: string;
  url: string;
  category: string;
}
```

## 📊 Data Flow

```
Sherlock Profile URL → Plugin → Scraper API → {
  Auditor Data + Manual Inputs + Selected Logos
} → Template Frame Duplication → Text Updates → Logo Placement → Profile Image Replacement → Generated Slide
```

## ⚠️ Troubleshooting

### Common Issues

1. **"No template frame found"**
   - Select a frame before running the plugin
   - Use "Set Template" button to confirm selection

2. **"Failed to fetch auditor data"**
   - Check API endpoint URL in `getApiHost()` function
   - Verify Sherlock scraper API is running
   - Ensure network domains are whitelisted in manifest.json

3. **"Text layers not updating"**
   - Verify text layer names match expected conventions
   - Check browser console for font loading errors
   - Use "Analyze Template" to verify layer structure

4. **"Logos not placing correctly"**
   - Ensure image containers are named with "logo" in the name
   - Check that logo URLs are accessible
   - Verify layout matches number of selected logos

### Debug Mode

Open Figma Console for detailed logging:
- **Mac**: `Cmd + Option + I`
- **Windows**: `Ctrl + Shift + I`

Look for messages prefixed with:
- `🎨` Plugin status updates
- `📝` Text layer updates
- `🏢` Logo placement operations
- `🖼️` Image replacement activities

## 🎯 Best Practices

### Template Design
1. Use clear, descriptive names for text layers
2. Create consistent logo container sizes
3. Test template with "Analyze Template" function
4. Keep text layer names lowercase with hyphens

### Logo Management
1. Use consistent image sizes (square format recommended)
2. Save logos with descriptive names and categories
3. Test logo visibility at small sizes
4. Organize logos by categories (DeFi, Exchange, etc.)

### Content Guidelines
1. Keep subheadings concise (under 50 characters)
2. Write comprehensive but focused descriptions
3. Ensure "Why Great Fit" points are protocol-specific
4. Proofread content before generation

## 🚀 Advanced Features

### Custom Text Mappings

Modify text mappings in `updateSlideContent()`:

```typescript
const textMappings = [
  { targetName: 'custom-field', content: 'Custom content' },
  // Add your custom mappings here
];
```

### Logo Layout Customization

Extend logo layouts in `placeSlideLogo()` function:

```typescript
// Add support for custom layouts
case '8':
  // Custom 8-logo layout logic
  break;
```

### API Endpoint Configuration

Add multiple API endpoints for fallback:

```typescript
const endpoints = [
  'http://localhost:5000',
  'https://production-api.example.com',
  'https://fallback-api.example.com'
];
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with real Figma templates
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Need Help?** Check the browser console for detailed error messages and debugging information.