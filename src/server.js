const express = require('express');
const path = require('path');
const { SherlockScraper } = require('../dist/sherlock-scraper');
const FigmaClient = require('../dist/figma-client').default;

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cache control headers to prevent caching issues in Replit
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const scraper = new SherlockScraper();
let figmaClient = null;

// Initialize Figma client if token is available
try {
  if (process.env.FIGMA_TOKEN) {
    figmaClient = new FigmaClient();
    console.log('✅ Figma client initialized successfully');
  } else {
    console.log('⚠️  FIGMA_TOKEN not found - Figma features disabled');
  }
} catch (error) {
  console.log('❌ Figma client initialization failed:', error.message);
}

// API endpoint to scrape single profile
app.post('/api/scrape-profile', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    console.log(`🔍 API request to scrape: ${username}`);
    
    const profileUrl = `https://audits.sherlock.xyz/watson/${username}`;
    const profile = await scraper.scrapeProfile(profileUrl, {
      enableLogging: true,
      includeMetadata: false,
      convertToBase64: false
    });

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to scrape multiple profiles
app.post('/api/scrape-multiple', async (req, res) => {
  try {
    const { usernames } = req.body;
    
    if (!usernames || !Array.isArray(usernames)) {
      return res.status(400).json({ error: 'Usernames array is required' });
    }

    console.log(`🔍 API request to scrape multiple: ${usernames.join(', ')}`);
    
    const urls = usernames.map(username => `https://audits.sherlock.xyz/watson/${username}`);
    const results = await scraper.scrapeMultiple(urls, {
      enableLogging: true,
      convertToBase64: false
    }, 2);

    // Convert image results to profile format
    const profiles = await Promise.all(urls.map(async (url, index) => {
      const username = usernames[index];
      const profile = await scraper.scrapeProfile(url, {
        enableLogging: false,
        convertToBase64: false
      });
      return profile;
    }));

    res.json({
      success: true,
      profiles
    });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Figma API endpoints
app.post('/api/figma/test-connection', async (req, res) => {
  try {
    if (!figmaClient) {
      return res.status(400).json({ 
        success: false, 
        error: 'Figma client not initialized. Check FIGMA_TOKEN.' 
      });
    }

    const { fileKey } = req.body;
    if (!fileKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Template file key is required' 
      });
    }

    console.log(`🔍 Testing Figma connection with file: ${fileKey}`);
    
    const file = await figmaClient.getFigmaFile(fileKey);
    
    res.json({
      success: true,
      file: {
        name: file.name,
        version: file.version,
        lastModified: file.lastModified
      }
    });

  } catch (error) {
    console.error('Figma connection test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/figma/analyze-structure', async (req, res) => {
  try {
    if (!figmaClient) {
      return res.status(400).json({ 
        success: false, 
        error: 'Figma client not initialized' 
      });
    }

    const { fileKey } = req.body;
    if (!fileKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Template file key is required' 
      });
    }

    console.log(`🔍 Analyzing Figma file structure: ${fileKey}`);
    
    const file = await figmaClient.getFigmaFile(fileKey);
    
    // Find text layers
    const textLayers = figmaClient.findLayers(file.document, '').filter(node => node.type === 'TEXT');
    
    // Find potential image containers
    const imageLayers = figmaClient.findLayers(file.document, '').filter(node => 
      node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'FRAME'
    );
    
    res.json({
      success: true,
      analysis: {
        fileName: file.name,
        textLayers: textLayers.map(layer => ({
          id: layer.id,
          name: layer.name,
          characters: layer.characters || ''
        })),
        imageLayers: imageLayers.slice(0, 20).map(layer => ({
          id: layer.id,
          name: layer.name,
          type: layer.type
        }))
      }
    });

  } catch (error) {
    console.error('Figma structure analysis failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/figma/create-slide', async (req, res) => {
  try {
    if (!figmaClient) {
      return res.status(400).json({ 
        success: false, 
        error: 'Figma client not initialized' 
      });
    }

    const { templateFileKey, slideName } = req.body;
    if (!templateFileKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Template file key is required' 
      });
    }

    console.log(`🔍 Creating new slide from template: ${templateFileKey}`);
    
    const newFileKey = await figmaClient.duplicateFigmaFile(
      templateFileKey, 
      slideName || `Slide - ${new Date().toISOString().split('T')[0]}`
    );
    
    res.json({
      success: true,
      newFileKey,
      message: `Slide created successfully: ${newFileKey}`
    });

  } catch (error) {
    console.error('Slide creation failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sherlock Scraper UI running at http://localhost:${PORT}`);
  console.log(`🌐 Access it in your browser to test the scraper!`);
});