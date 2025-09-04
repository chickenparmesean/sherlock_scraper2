# Sherlock Auditor Slide Generator - Figma Plugin

A powerful Figma plugin that automatically generates professional auditor slides by combining Sherlock Protocol data with custom content.

## 🎯 Features

- **Automated Data Fetching**: Connects to Sherlock Protocol to fetch auditor achievements, earnings, and vulnerability stats
- **Smart Slide Duplication**: Creates timestamped slides with proper naming: `[timestamp] [protocol] [auditor]`
- **Text Layer Mapping**: Automatically updates text layers based on predefined mappings
- **Profile Image Replacement**: Replaces placeholder images with actual Sherlock profile pictures
- **Template Analysis**: Analyzes your slide template structure for easy setup
- **Custom Content Integration**: Combines scraped data with manual input fields

## 📋 Installation

### Method 1: Import to Figma (Recommended)

1. **Download Plugin Files**:
   - Download `manifest.json`, `code.js`, and `ui.html` from the `figma-plugin/` directory

2. **Import to Figma**:
   - Open Figma Desktop App
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` file
   - The plugin will be imported and ready to use

### Method 2: Development Setup

1. **Clone Repository**:
   ```bash
   git clone [your-repo-url]
   cd [repo-name]/figma-plugin/
   ```

2. **Import to Figma**:
   - Open Figma Desktop App
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` file from the cloned directory

## 🚀 Usage

### Step 1: Prepare Your Template

1. **Create or Open Your Slide Template** in Figma
2. **Name Your Text Layers** using these conventions:
   ```
   auditor-name        → Auditor's name (auto-filled)
   auditor-subheading  → Custom subheading (manual input)
   auditor-description → Custom bio description (manual input)
   achievement-1       → Contest rankings (auto-filled)
   achievement-2       → Total earnings (auto-filled)
   achievement-3       → Vulnerability summary (auto-filled)
   achievement-4       → Additional achievement (manual input)
   goodfit-1          → Why great fit - point 1 (manual input)
   goodfit-2          → Why great fit - point 2 (manual input)
   goodfit-3          → Why great fit - point 3 (manual input)
   slide-title        → Main slide title (auto-generated)
   ```

3. **Name Your Image Containers**:
   ```
   profile-image      → Will be replaced with Sherlock profile picture
   ```

### Step 2: Launch Plugin

1. **Select Your Template Frame** (or the plugin will use the first frame on the page)
2. **Run Plugin**: `Plugins` → `Sherlock Auditor Slide Generator`
3. **Analyze Template**: Click "Analyze Selected Frame" to verify your template structure

### Step 3: Generate Slide

1. **Enter Auditor URL**: Paste the full Sherlock profile URL
   ```
   Example: https://audits.sherlock.xyz/watson/berndartmueller
   ```

2. **Enter Protocol Name**: The protocol you're creating the slide for
   ```
   Example: Aave, Compound, Uniswap
   ```

3. **Fill Custom Content**:
   - **Auditor Subheading**: Brief tagline
   - **Auditor Description**: Detailed bio and expertise
   - **Additional Achievement**: Fourth achievement line
   - **Why Great Fit (3 points)**: Protocol-specific reasons

4. **Click "Generate Slide"**: The plugin will:
   - Fetch auditor data from Sherlock
   - Duplicate your template frame
   - Update all text layers
   - Replace profile image
   - Focus on the new slide

## 🔧 Configuration

### API Endpoint Setup

The plugin needs to connect to your Sherlock scraper API. Update the `getApiHost()` function in `code.js`:

```javascript
async function getApiHost() {
  // Update this with your actual deployment URL
  return 'https://your-repl-name--your-username.repl.co';
}
```

### Network Access

The plugin is configured to access these domains (see `manifest.json`):
- `audits.sherlock.xyz` - Sherlock Protocol
- `sherlock-files.ams3.digitaloceanspaces.com` - Profile images
- `localhost:5000` - Local development
- `*.repl.co` - Replit deployments

## 📊 Data Flow

```
Sherlock Profile URL → Plugin → Scraper API → {
  name: "auditorName",
  achievements: {
    rankings: "4x first place, 3x second place",
    earnings: "$520K+",
    highsFound: 90,
    soloHighs: 1,
    mediumsFound: 161,
    soloMediums: 14
  },
  profileImageUrl: "https://..."
} + Manual Inputs → Generated Slide
```

## 🎨 Example Workflow

1. **Template Setup**: Create slide template with properly named layers
2. **Plugin Launch**: Select template frame and run plugin
3. **Input Data**: 
   ```
   Auditor URL: https://audits.sherlock.xyz/watson/berndartmueller
   Protocol: Aave
   Subheading: Leading DeFi Security Expert
   Description: Expert in lending protocols...
   ```
4. **Generation**: Plugin creates `2025-09-04T14-30 Aave berndartmueller`
5. **Result**: Professional slide with combined auto + manual content

## ⚠️ Requirements

- **Figma Desktop App** (required for plugin development)
- **Active Sherlock Scraper API** (for data fetching)
- **Properly Named Template Layers** (for automatic mapping)
- **Network Access** (for API calls and image fetching)

## 🐛 Troubleshooting

### Common Issues

1. **"Template frame not found"**
   - Solution: Select a frame before running the plugin

2. **"Failed to fetch auditor data"**
   - Check your API endpoint URL in `getApiHost()`
   - Verify the scraper API is running
   - Ensure network domains are whitelisted

3. **"Text layers not updating"**
   - Verify text layer names match the expected conventions
   - Check console for font loading errors

4. **"Profile image not replacing"**
   - Ensure you have an image container named "profile-image"
   - Check if the image URL is accessible

### Debug Mode

Enable detailed logging by opening the Figma Console:
- **Mac**: `Cmd + Option + I`
- **Windows**: `Ctrl + Shift + I`

## 🚀 Advanced Features

### Custom Text Mappings

Modify the `textMappings` array in `updateSlideContent()` to customize field mappings:

```javascript
const textMappings = [
  { targetName: 'custom-field', content: 'Custom content' },
  // Add your custom mappings here
];
```

### Template Variations

Create multiple templates and switch between them by:
1. Selecting different template frames
2. Running the "Analyze Selected Frame" function
3. Generating slides with different layouts

## 📈 Future Enhancements

- **Logo Database Integration**: Upload and manage protocol logos
- **Batch Generation**: Create multiple slides at once
- **Advanced Styling**: Custom fonts, colors, and layouts
- **Export Automation**: Direct export to various formats

---

**Need Help?** Check the console logs for detailed error messages and debugging information.