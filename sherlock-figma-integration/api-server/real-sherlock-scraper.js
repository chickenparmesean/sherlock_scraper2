const cheerio = require('cheerio');
const axios = require('axios');

class RealSherlockScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async scrapeProfile(sherlockUrl) {
    try {
      console.log(`🔍 REAL SCRAPER: Fetching ${sherlockUrl}`);
      
      // Fetch the profile page
      const response = await axios.get(sherlockUrl, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 30000
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = response.data;
      const $ = cheerio.load(html);
      
      // Extract auditor name from URL
      const username = sherlockUrl.split('/watson/')[1] || 'Unknown';
      
      // Find profile image - try multiple selectors
      let profileImageUrl = '';
      const imageSelectors = [
        'img[alt*="profile" i]',
        'img[src*="profile" i]',
        'img[src*="avatar" i]',
        'img[src*="_next/image"]',
        '.avatar img',
        '.profile img'
      ];
      
      for (const selector of imageSelectors) {
        const imgElement = $(selector).first();
        if (imgElement.length > 0) {
          let src = imgElement.attr('src');
          if (src) {
            if (src.startsWith('/')) {
              src = 'https://audits.sherlock.xyz' + src;
            }
            profileImageUrl = src;
            console.log(`✅ Found profile image: ${src}`);
            break;
          }
        }
      }

      // Extract earnings data
      let earnings = '$0';
      const earningsText = $('body').text();
      const earningsMatch = earningsText.match(/\$[\d,.]+(K?)\s*(earned|total)/i);
      if (earningsMatch) {
        earnings = earningsMatch[0].replace(/\s*(earned|total)/i, '');
      }

      // Extract vulnerability stats
      let highsFound = 0;
      let mediumsFound = 0;
      let soloHighs = 0;
      let soloMediums = 0;

      // Look for High/Medium patterns
      const statsText = $('body').text();
      const highMatch = statsText.match(/(\d+)\s*high/i);
      const mediumMatch = statsText.match(/(\d+)\s*medium/i);
      const soloHighMatch = statsText.match(/(\d+)\s*solo\s*high/i);
      const soloMediumMatch = statsText.match(/(\d+)\s*solo\s*medium/i);

      if (highMatch) highsFound = parseInt(highMatch[1]);
      if (mediumMatch) mediumsFound = parseInt(mediumMatch[1]);
      if (soloHighMatch) soloHighs = parseInt(soloHighMatch[1]);
      if (soloMediumMatch) soloMediums = parseInt(soloMediumMatch[1]);

      // Extract rankings
      let rankings = 'Security researcher with proven expertise';
      const rankingPatterns = [
        /(\d+)(?:st|nd|rd|th)\s+place/gi,
        /(\d+)x\s+first/gi,
        /(\d+)x\s+second/gi,
        /(\d+)x\s+third/gi
      ];
      
      const foundRankings = [];
      rankingPatterns.forEach(pattern => {
        const matches = statsText.match(pattern);
        if (matches) {
          foundRankings.push(...matches);
        }
      });
      
      if (foundRankings.length > 0) {
        rankings = foundRankings.join(', ');
      }

      const profile = {
        name: username,
        profileImageUrl: profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=256&background=667eea&color=ffffff`,
        achievements: {
          rankings: rankings,
          earnings: earnings,
          highsFound: highsFound,
          mediumsFound: mediumsFound,
          soloHighs: soloHighs,
          soloMediums: soloMediums
        }
      };

      console.log(`✅ REAL SCRAPER: Extracted profile for ${username}:`, {
        earnings,
        highs: highsFound,
        mediums: mediumsFound,
        soloHighs,
        soloMediums,
        hasImage: !!profileImageUrl
      });

      return profile;

    } catch (error) {
      console.error(`❌ REAL SCRAPER ERROR for ${sherlockUrl}:`, error.message);
      
      // Return fallback data if scraping fails
      const username = sherlockUrl.split('/watson/')[1] || 'Unknown';
      return {
        name: username,
        profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=256&background=667eea&color=ffffff`,
        achievements: {
          rankings: 'Security auditor (data extraction in progress)',
          earnings: 'Data loading...',
          highsFound: 0,
          mediumsFound: 0,
          soloHighs: 0,
          soloMediums: 0
        }
      };
    }
  }
}

module.exports = { RealSherlockScraper };