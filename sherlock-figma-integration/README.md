# Sherlock Figma Integration

Automated Figma plugin for generating security auditor slides with Sherlock Protocol data integration.

## Features

✅ **Complete Figma Plugin** - Generate slides directly in Figma  
✅ **Profile Image Integration** - Automatic profile picture fetching via CORS proxy  
✅ **Sherlock Data Scraping** - Rankings, earnings, vulnerability statistics  
✅ **Text Field Population** - All slide text layers updated automatically  
✅ **Production Ready** - Full error handling and user feedback

## Structure

```
sherlock-figma-integration/
├── figma-plugin/           # Complete Figma plugin
│   ├── src/
│   │   ├── code.js        # Main plugin logic
│   │   ├── ui.html        # Plugin UI
│   ├── manifest.json      # Plugin configuration
│   └── README.md          # Plugin setup instructions
├── api-server/            # Backend API server
│   ├── server.js          # Express server with CORS proxy
│   ├── sherlock-scraper.ts # Enhanced scraper with image support
│   └── types.ts           # TypeScript definitions
└── README.md              # This file
```

## Quick Start

### 1. Start API Server
```bash
cd sherlock-figma-integration/api-server
npm install
npm start
```

### 2. Install Figma Plugin
1. Open Figma in browser
2. Go to Plugins → Development → Import plugin from manifest...
3. Select `sherlock-figma-integration/figma-plugin/manifest.json`
4. Plugin appears as "Auditor Slide Generator"

### 3. Create Slide Template
Create a Figma frame with properly named text layers:
- `auditor-name` - Auditor's name
- `achievement-1` - Contest rankings
- `achievement-2` - Total earnings  
- `achievement-3` - Vulnerability summary
- `goodfit-1`, `goodfit-2`, `goodfit-3` - Why great fit sections
- `profilepicture` - Rectangle/ellipse for profile image

### 4. Generate Slides
1. Select your template frame
2. Enter Sherlock auditor URL (e.g., `https://audits.sherlock.xyz/watson/0x73696d616f`)
3. Fill in protocol name and custom content
4. Click "Generate Slide"

## Integration with Existing Sherlock Scraper

This integrates seamlessly with your existing `sherlock_scraper2` repository by:

- **Extending scraper functionality** with image extraction
- **Adding Figma plugin interface** for slide generation  
- **Providing API server** with CORS proxy for browser compatibility
- **Maintaining compatibility** with existing scraper architecture

## Dependencies

- Node.js with Express server
- Figma plugin environment
- Access to Sherlock Protocol (audits.sherlock.xyz)

## Status

🎉 **FULLY WORKING** - Production ready for automated auditor slide generation!