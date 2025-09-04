const express = require('express');
const path = require('path');
const { SherlockScraper } = require('../dist/sherlock-scraper');

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

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sherlock Scraper UI running at http://localhost:${PORT}`);
  console.log(`🌐 Access it in your browser to test the scraper!`);
});