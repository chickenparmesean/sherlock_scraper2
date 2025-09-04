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

      // Extract earnings data using proper selector patterns
      let earnings = '';
      
      // Look for earnings in the achievements section
      $('div').each((i, elem) => {
        const text = $(elem).text().trim();
        const earningsMatch = text.match(/\$[\d,.]+(\.?\d+)?K?/);
        if (earningsMatch && (text.includes('earned') || text.toLowerCase().includes('total'))) {
          earnings = earningsMatch[0];
        }
      });

      // Extract vulnerability statistics - use proper DOM parsing
      let highsFound = 0;
      let mediumsFound = 0;
      let soloHighs = 0;
      let soloMediums = 0;

      // Find statistics sections by looking for containers with vulnerability data
      $('div, span').each((i, elem) => {
        const text = $(elem).text().trim();
        const $elem = $(elem);
        
        // Check for High statistics
        if (text.toLowerCase().includes('high') && /\d+/.test(text)) {
          const nextContainer = $elem.parent().parent().find('div, span');
          
          nextContainer.each((j, statElem) => {
            const statText = $(statElem).text().trim();
            
            // Look for "X Total" pattern for highs found
            if (statText.includes('Total') && /^\d+$/.test(statText)) {
              const siblingText = $(statElem).prev().text() + $(statElem).next().text();
              if (siblingText.toLowerCase().includes('high')) {
                highsFound = parseInt(statText);
              }
            }
            
            // Look for "X Solo" pattern for solo highs
            if (statText.includes('Solo') && /^\d+$/.test(statText)) {
              const siblingText = $(statElem).prev().text() + $(statElem).next().text();
              if (siblingText.toLowerCase().includes('high')) {
                soloHighs = parseInt(statText);
              }
            }
          });
        }
        
        // Check for Medium statistics
        if (text.toLowerCase().includes('medium') && /\d+/.test(text)) {
          const nextContainer = $elem.parent().parent().find('div, span');
          
          nextContainer.each((j, statElem) => {
            const statText = $(statElem).text().trim();
            
            // Look for "X Total" pattern for mediums found  
            if (statText.includes('Total') && /^\d+$/.test(statText)) {
              const siblingText = $(statElem).prev().text() + $(statElem).next().text();
              if (siblingText.toLowerCase().includes('medium')) {
                mediumsFound = parseInt(statText);
              }
            }
            
            // Look for "X Solo" pattern for solo mediums
            if (statText.includes('Solo') && /^\d+$/.test(statText)) {
              const siblingText = $(statElem).prev().text() + $(statElem).next().text();
              if (siblingText.toLowerCase().includes('medium')) {
                soloMediums = parseInt(statText);
              }
            }
          });
        }
      });

      // Extract contest rankings using proper pattern matching
      let rankings = '';
      const rankingCounts = { first: 0, second: 0, third: 0 };
      
      $('div, span').each((i, elem) => {
        const text = $(elem).text().trim();
        
        // Look for contest ranking patterns like "1st place" or "2x first place"
        const firstMatch = text.match(/(\d+)x?\s*(1st|first)\s+place/i);
        const secondMatch = text.match(/(\d+)x?\s*(2nd|second)\s+place/i);  
        const thirdMatch = text.match(/(\d+)x?\s*(3rd|third)\s+place/i);
        
        if (firstMatch) rankingCounts.first += parseInt(firstMatch[1]) || 1;
        if (secondMatch) rankingCounts.second += parseInt(secondMatch[1]) || 1;
        if (thirdMatch) rankingCounts.third += parseInt(thirdMatch[1]) || 1;
      });
      
      // Format rankings properly
      const rankingParts = [];
      if (rankingCounts.first > 0) {
        rankingParts.push(`${rankingCounts.first}x first place`);
      }
      if (rankingCounts.second > 0) {
        rankingParts.push(`${rankingCounts.second}x second place`);
      }
      if (rankingCounts.third > 0) {
        rankingParts.push(`${rankingCounts.third}x third place`);
      }
      
      rankings = rankingParts.length > 0 ? rankingParts.join(', ') : 'Security researcher';

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