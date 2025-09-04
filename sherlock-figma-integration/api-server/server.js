const express = require('express');
const path = require('path');
// Temporarily disable scraper imports for logo API testing
// const { SherlockScraper } = require('../dist/sherlock-scraper');
// const FigmaClient = require('../dist/figma-client').default;

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS headers for Figma plugin access
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Temporarily disable scraper initialization for logo API testing
// const scraper = new SherlockScraper();
// let figmaClient = null;

console.log('🚀 Server starting in Logo API test mode...');
console.log('⚠️  Sherlock scraper temporarily disabled for logo API development');

// API endpoint to scrape single profile (GET for plugin compatibility)
app.get('/api/scrape-profile', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`🔍 API request to scrape: ${url}`);
    
    // Extract username from URL and provide better mock data
    const username = url.split('/watson/')[1] || url.split('/').pop() || "Unknown";
    
    const mockProfile = {
      name: username,
      profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=256&background=667eea&color=ffffff`,
      achievements: {
        rankings: `Leading auditor with multiple contest wins`,
        earnings: "$250K+ earned in audits",
        highsFound: 15,
        mediumsFound: 12,
        soloHighs: 4,
        soloMediums: 3
      }
    };

    res.json({
      success: true,
      profile: mockProfile
    });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to scrape single profile (POST for backward compatibility)
app.post('/api/scrape-profile', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    console.log(`🔍 API request to scrape: ${username}`);
    
    // Provide better mock data with real username
    const mockProfile = {
      name: username,
      profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=256&background=667eea&color=ffffff`,
      achievements: {
        rankings: `Security expert with proven track record`,
        earnings: "$180K+ earned in audits", 
        highsFound: 14,
        mediumsFound: 9,
        soloHighs: 5,
        soloMediums: 4
      }
    };

    res.json({
      success: true,
      profile: mockProfile
    });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Image proxy endpoint to bypass CORS restrictions
app.get('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`🖼️  Proxying image request: ${url}`);
    
    // Fetch the image from external URL
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch image: ${response.status} ${response.statusText}` 
      });
    }

    // Get image data and content type
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Set appropriate headers
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // 24 hour cache
    res.set('Access-Control-Allow-Origin', '*');
    
    // Send the image
    res.send(Buffer.from(imageBuffer));

  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(500).json({
      error: 'Failed to proxy image'
    });
  }
});

// GitHub Logo API endpoints
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'chickenparmesean';
const REPO_NAME = 'sherlock_scraper2';
const LOGOS_PATH = 'protocol-logo2';

// Get list of logos from GitHub repository
app.get('/api/logos', async (req, res) => {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({
        error: 'GitHub token not configured'
      });
    }

    console.log(`📁 Fetching logos from GitHub repo: ${REPO_OWNER}/${REPO_NAME}/${LOGOS_PATH}`);
    
    // Fetch directory contents from GitHub API
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${LOGOS_PATH}`,
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Sherlock-Figma-Plugin'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const files = await response.json();
    
    // Filter for SVG and PNG files, extract logo names
    const logos = files
      .filter(file => file.type === 'file' && (file.name.endsWith('.svg') || file.name.endsWith('.png')))
      .map(file => ({
        name: file.name.replace(/\.(svg|png)$/i, ''), // Remove extension for display
        fileName: file.name,
        url: file.download_url,
        type: file.name.toLowerCase().endsWith('.svg') ? 'svg' : 'png'
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical order

    console.log(`✅ Found ${logos.length} logos in repository`);
    
    res.json({
      success: true,
      logos,
      count: logos.length
    });

  } catch (error) {
    console.error('Error fetching logos:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload new logo to GitHub repository
app.post('/api/logos/upload', async (req, res) => {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({
        error: 'GitHub token not configured'
      });
    }

    const { fileName, fileContent, message } = req.body;
    
    if (!fileName || !fileContent) {
      return res.status(400).json({
        error: 'File name and content are required'
      });
    }

    // Validate file extension
    if (!fileName.match(/\.(svg|png)$/i)) {
      return res.status(400).json({
        error: 'Only SVG and PNG files are allowed'
      });
    }

    console.log(`📤 Uploading logo to GitHub: ${fileName}`);
    
    // Upload file to GitHub repository
    const uploadResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${LOGOS_PATH}/${fileName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Sherlock-Figma-Plugin',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message || `Add ${fileName} logo via Figma plugin`,
          content: fileContent, // Should be base64 encoded
          branch: 'main'
        })
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(`GitHub upload failed: ${uploadResponse.status} ${errorData.message || uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    
    console.log(`✅ Successfully uploaded logo: ${fileName}`);
    
    res.json({
      success: true,
      fileName,
      downloadUrl: uploadResult.content.download_url,
      message: `Successfully uploaded ${fileName}`
    });

  } catch (error) {
    console.error('Error uploading logo:', error.message);
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

// Complete slide generation endpoint
app.post('/api/generate-slide', async (req, res) => {
  try {
    if (!figmaClient) {
      return res.status(400).json({ 
        success: false, 
        error: 'Figma client not initialized' 
      });
    }

    const { 
      templateFileKey, 
      auditorUsername, 
      protocolName,
      manualInputs 
    } = req.body;
    
    if (!templateFileKey || !auditorUsername || !protocolName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Template file key, auditor username, and protocol name are required' 
      });
    }

    console.log(`🎨 Generating slide for ${auditorUsername} x ${protocolName}`);
    
    // Step 1: Scrape auditor data
    const profileUrl = `https://audits.sherlock.xyz/watson/${auditorUsername}`;
    const auditorData = await scraper.scrapeProfile(profileUrl, {
      enableLogging: true,
      convertToBase64: false
    });
    
    if (!auditorData.name) {
      return res.status(400).json({
        success: false,
        error: 'Failed to scrape auditor data or auditor not found'
      });
    }
    
    // Step 2: Generate slide with combined data
    const slideResult = await figmaClient.generateSlide(
      templateFileKey,
      auditorData,
      manualInputs || {},
      protocolName
    );
    
    if (!slideResult.success) {
      return res.status(500).json({
        success: false,
        error: slideResult.error
      });
    }
    
    res.json({
      success: true,
      fileKey: slideResult.fileKey,
      auditorData,
      figmaUrl: `https://www.figma.com/file/${slideResult.fileKey}`,
      message: `Slide generated successfully for ${auditorUsername} x ${protocolName}`
    });

  } catch (error) {
    console.error('Slide generation failed:', error.message);
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