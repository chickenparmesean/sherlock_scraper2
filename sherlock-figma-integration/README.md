# 🔍 Sherlock Auditor Slide Generator

**A comprehensive Figma plugin for security auditors that generates professional audit slides by combining real scraped data from Sherlock Protocol with manual inputs and protocol logos.**

![Plugin Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **🤖 Automated Data Scraping**: Real-time extraction from Sherlock Protocol auditor profiles
- **🎨 Professional Slide Generation**: Automated slide creation directly in Figma
- **📊 Smart Data Processing**: Vulnerability statistics, earnings, contest rankings
- **🖼️ Profile Image Integration**: Automatic profile picture fetching and placement  
- **🏢 Protocol Logo Management**: GitHub-based logo database with 81+ protocol logos
- **📐 Perfect Logo Formatting**: 150px width with locked aspect ratios
- **🎯 Template System**: Works with any Figma slide template using naming conventions

## 🚀 Quick Start

### 1. Install the Figma Plugin

1. **Download Plugin Files**:
   ```bash
   # Clone or download the figma-plugin/ directory
   git clone [repository-url]
   cd sherlock-figma-integration/figma-plugin/
   ```

2. **Install in Figma**:
   - Open Figma in browser
   - Go to `Plugins → Development → Import plugin from manifest...`
   - Select `manifest.json` from the plugin directory
   - Plugin appears as "Auditor Slide Generator"

### 2. Set Up Your Slide Template

Create a Figma frame with these **exact layer names**:

**Required Text Layers:**
- `auditor-name` - Auditor's name
- `achievement-1` - Primary achievement text
- `achievement-2` - Secondary achievement text  
- `achievement-3` - Vulnerability summary
- `goodfit-1`, `goodfit-2`, `goodfit-3` - Manual content fields

**Image Containers:**
- `profilepicture` - Profile image container
- `frame1`, `frame2`, `frame3` - Logo containers (FRAME type)

### 3. Generate Your First Slide

1. **Open the Plugin** in Figma
2. **Enter Sherlock URL**: `https://audits.sherlock.xyz/watson/[username]`
3. **Test Data Fetch** to verify scraper connection
4. **Select Protocol Logos** from the dropdown (3 max)
5. **Add Manual Content** for protocol-specific details
6. **Generate Slide** and watch the magic happen!

## 🔧 System Architecture

### Figma Plugin Architecture
- **iframe UI** (`ui.html`): Handles external API calls and user interface
- **Main Thread** (`code.js`): Performs Figma document manipulation
- **Message Passing**: Secure communication between iframe and main thread

### Sherlock Scraper API
- **Advanced Scraping**: Puppeteer-based extraction for JavaScript-heavy pages  
- **Fallback System**: Graceful degradation to HTTP requests when needed
- **Data Standardization**: Consistent JSON output format
- **CORS Proxy**: Image fetching through secure proxy endpoints

## 🎯 Data Extraction Capabilities

### Auditor Profile Data
```javascript
{
  name: "auditorUsername",
  profileImage: "imageUrl",
  achievements: {
    rankings: "3x first place, 2x second place", 
    earnings: "$520.38K earned in audits",
    highsFound: 45,           // Total high vulnerabilities found
    mediumsFound: 67,         // Total medium vulnerabilities found  
    soloHighs: 12,            // Solo high discoveries
    soloMediums: 23           // Solo medium discoveries
  }
}
```

### Protocol Logo Database
- **81+ Protocol Logos**: Direct GitHub integration
- **SVG Format**: Perfect scaling at any resolution
- **Automatic Formatting**: 150px width with locked aspect ratios
- **Smart Placement**: Centered within template containers

## 🔍 Sherlock Scraper API Usage

### Start the API Server

```bash
# Navigate to API server directory
cd sherlock-figma-integration/api-server/

# Install dependencies (if not already installed)
npm install

# Start the server
node server.js
```

Server runs on `http://localhost:5000` with these endpoints:

### API Endpoints

#### `GET /api/scrape-profile`
Extract complete auditor data from Sherlock Protocol.

**Parameters:**
- `url` - Full Sherlock auditor URL

**Example Request:**
```bash
curl "http://localhost:5000/api/scrape-profile?url=https://audits.sherlock.xyz/watson/0x73696d616f"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "name": "0x73696d616f",
    "profileImage": "https://audits.sherlock.xyz/_next/image?url=...",
    "achievements": {
      "rankings": "1x first place, 2x second place, 4x third place",
      "earnings": "$559.25K",
      "highsFound": 103,
      "mediumsFound": 151, 
      "soloHighs": 14,
      "soloMediums": 38
    }
  }
}
```

#### `GET /api/logos`
Fetch available protocol logos from GitHub database.

**Example Response:**
```json
{
  "success": true,
  "logos": [
    {
      "name": "Aave",
      "url": "https://raw.githubusercontent.com/chickenparmesean/sherlock_scraper2/main/protocol-logo2/Aave.svg"
    },
    {
      "name": "Compound", 
      "url": "https://raw.githubusercontent.com/chickenparmesean/sherlock_scraper2/main/protocol-logo2/Compound.svg"
    }
  ]
}
```

#### `GET /api/proxy-image`
Secure CORS proxy for fetching external images.

**Parameters:**
- `url` - Image URL to fetch

## 🎨 Template Design Guide

### Naming Conventions
Use these **exact names** for automatic population:

| Layer Name | Content | Example |
|------------|---------|---------|
| `auditor-name` | Auditor username | "0x73696d616f" |
| `achievement-1` | Contest rankings | "1x first place, 2x second place" |
| `achievement-2` | Total earnings | "$559.25K earned in audits" |
| `achievement-3` | Vulnerability summary | "103 highs, 151 mediums (14 solo highs, 38 solo mediums)" |
| `goodfit-1` | Manual content field 1 | "Protocol-specific insight" |
| `goodfit-2` | Manual content field 2 | "Technical expertise area" |
| `goodfit-3` | Manual content field 3 | "Audit approach summary" |

### Container Setup
- **Profile Picture**: Any shape named `profilepicture`
- **Protocol Logos**: FRAME containers named `frame1`, `frame2`, `frame3`
- **Logo Sizing**: Automatic 150px width with locked aspect ratios
- **Centering**: Logos automatically centered within containers

## 🔧 Technical Details

### Dependencies
- **Node.js** 16+ with Express server
- **Puppeteer** for advanced web scraping
- **Axios + Cheerio** for HTTP scraping fallback
- **Figma Plugin API** with network access permissions

### Security Features
- **CORS Configuration**: Secure cross-origin requests
- **Content Security Policy**: Restricted domain access in manifest.json
- **Proxy Endpoints**: Safe external image fetching
- **Input Validation**: URL and parameter sanitization

### Performance Optimizations
- **Dual Scraping Strategy**: Puppeteer + HTTP fallback for reliability
- **Image Caching**: Efficient profile picture and logo handling
- **Batch Processing**: Multiple logos fetched simultaneously
- **Error Recovery**: Graceful handling of network failures

## 🎯 Production Deployment

### Replit Deployment
The API server is deployed on Replit and accessible at:
```
https://[replit-url].replit.dev
```

### Team Sharing
- **No Dependencies**: Plugin works independently for all team members
- **GitHub Integration**: Protocol logos fetched directly from repository
- **Figma Native**: Full integration with Figma's plugin ecosystem

## 🐛 Troubleshooting

### Common Issues

**Plugin Not Loading:**
- Verify `manifest.json` is valid
- Check Figma browser console for errors
- Ensure all files are in correct directory structure

**Scraper API Failing:**
- Confirm server is running on port 5000
- Check network connectivity to Sherlock Protocol
- Verify URL format: `https://audits.sherlock.xyz/watson/[username]`

**Logos Not Appearing:**
- Ensure template has FRAME containers named `frame1`, `frame2`, `frame3`
- Check GitHub repository accessibility
- Verify manifest.json includes GitHub domains in allowedDomains

**Profile Images Missing:**
- Confirm `profilepicture` layer exists in template
- Check Sherlock profile has uploaded image
- Verify CORS proxy endpoints are accessible

## 📊 Success Metrics

- **✅ 100% Working**: Profile data extraction from Sherlock Protocol
- **✅ 81+ Logos**: Complete protocol logo database integration
- **✅ Perfect Formatting**: Aspect ratio locked logos at 150px width
- **✅ Team Ready**: No dependencies, works for all team members
- **✅ Production Stable**: Comprehensive error handling and fallbacks

## 🚀 Future Enhancements

- **Batch Processing**: Generate slides for multiple auditors simultaneously
- **Template Gallery**: Pre-made professional slide templates
- **Export Automation**: Direct export to PNG/PDF formats
- **Analytics Dashboard**: Track slide generation and usage metrics
- **Logo Upload**: Interface for adding new protocol logos to database

---

**Built for security auditors, by security auditors.** 🔐

*This tool automates the tedious parts of slide creation so you can focus on what matters: delivering exceptional security insights.*