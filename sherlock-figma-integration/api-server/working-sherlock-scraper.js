const cheerio = require('cheerio');

class WorkingSherlockScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async scrapeProfile(sherlockUrl) {
    try {
      console.log(`🔍 REAL SCRAPER: Fetching ${sherlockUrl}`);
      
      const response = await fetch(sherlockUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 30000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract name from URL
      const urlMatch = sherlockUrl.match(/\/watson\/([^\/]+)\/?$/);
      const username = urlMatch ? decodeURIComponent(urlMatch[1]) : 'Unknown';
      
      // Find profile image - try multiple selectors
      let profileImageUrl = '';
      const imageSelectors = [
        'img[alt*="profile" i]',
        'img[src*="profile" i]', 
        'img[src*="avatar" i]',
        'img[src*="_next/image"]'
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

      // Extract achievements using the working logic from your GitHub repo
      const achievements = this.extractAchievementsFromHtml(html, { enableLogging: true });

      const profile = {
        name: username,
        profileImageUrl: profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=256&background=667eea&color=ffffff`,
        achievements: achievements
      };

      console.log(`✅ REAL SCRAPER: Extracted profile for ${username}:`, {
        earnings: achievements.earnings,
        highs: achievements.highsFound,
        mediums: achievements.mediumsFound,
        soloHighs: achievements.soloHighs,
        soloMediums: achievements.soloMediums,
        hasImage: !!profileImageUrl
      });

      return profile;

    } catch (error) {
      console.error(`❌ REAL SCRAPER ERROR for ${sherlockUrl}:`, error.message);
      
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

  extractAchievementsFromHtml(html, opts) {
    const achievements = {
      rankings: '',
      earnings: '',
      highsFound: 0,
      mediumsFound: 0,
      soloHighs: 0,
      soloMediums: 0,
      vulnerabilitiesSummary: ''
    };

    try {
      const $ = cheerio.load(html);

      // Extract earnings - look for $ amount followed by K (from your working GitHub code)
      $('*').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const earningsMatch = text.match(/\$[\d,]+\.?\d*[K|k]/);
        if (earningsMatch && !achievements.earnings) {
          achievements.earnings = earningsMatch[0];
        }
      });

      // Extract contest placement badges - from your working GitHub code
      const placementBadges = [];
      $('*').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        
        // Look for patterns like "1x", "2x" followed by placement text
        if (text.match(/^\d+x$/)) {
          const $parent = $el.parent();
          const parentText = $parent.text().toLowerCase();
          
          if (parentText.includes('1st') || parentText.includes('first')) {
            placementBadges.push(`${text} first place`);
          }
          else if (parentText.includes('2nd') || parentText.includes('second')) {
            placementBadges.push(`${text} second place`);
          }
          else if (parentText.includes('3rd') || parentText.includes('third')) {
            placementBadges.push(`${text} third place`);
          }
        }
      });

      if (placementBadges.length > 0) {
        achievements.rankings = placementBadges.join(', ');
      }

      // Extract vulnerability stats - using your working GitHub approach
      // Find High label section with border-error-500 class
      const $highLabelSection = $('*').filter(function() {
        const classes = $(this).attr('class') || '';
        return classes.includes('border-error-500');
      }).first();

      if (opts.enableLogging) {
        console.log(`🎯 Found High label section, searching for sibling statistics...`);
      }

      if ($highLabelSection.length > 0) {
        const $parentContainer = $highLabelSection.parent();
        
        if (opts.enableLogging) {
          console.log(`🔍 Searching High parent container for statistics:`);
        }

        // Find all numbers in the parent container
        $parentContainer.find('*').each((i, element) => {
          const $el = $(element);
          const text = $el.text().trim();
          
          if (/^\d+$/.test(text)) {
            const number = parseInt(text);
            const context = $el.closest('div').text();
            
            const $container = $el.closest('div');
            const containerClass = $container.attr('class') || '';
            
            if (containerClass.includes('flex-col') && containerClass.includes('items-center')) {
              if (opts.enableLogging) {
                console.log(` Found number ${number} in stats container, context: "${context.substring(0,50)}..."`);
              }

              // Only assign if we haven't found numbers yet (High section comes first)
              if (context.includes(`${number}Total`) && achievements.highsFound === 0) {
                achievements.highsFound = number;
                if (opts.enableLogging) console.log(` ✅ Assigned ${number} to highsFound`);
              }
              else if (context.includes(`${number}Solo`) && achievements.soloHighs === 0) {
                achievements.soloHighs = number;
                if (opts.enableLogging) console.log(` ✅ Assigned ${number} to soloHighs`);
              }
            }
          }
        });
      }

      // Find Medium label section with border-warning-500 class
      const $mediumLabelSection = $('*').filter(function() {
        const classes = $(this).attr('class') || '';
        return classes.includes('border-warning-500');
      }).first();

      if ($mediumLabelSection.length > 0) {
        const $parentContainer = $mediumLabelSection.parent();

        $parentContainer.find('*').each((i, element) => {
          const $el = $(element);
          const text = $el.text().trim();
          
          if (/^\d+$/.test(text)) {
            const number = parseInt(text);
            const context = $el.closest('div').text();
            
            const $container = $el.closest('div');
            const containerClass = $container.attr('class') || '';
            
            if (containerClass.includes('flex-col') && containerClass.includes('items-center')) {
              if (context.includes(`${number}Total`) && achievements.mediumsFound === 0) {
                achievements.mediumsFound = number;
                if (opts.enableLogging) console.log(` ✅ Assigned ${number} to mediumsFound`);
              }
              else if (context.includes(`${number}Solo`) && achievements.soloMediums === 0) {
                achievements.soloMediums = number;
                if (opts.enableLogging) console.log(` ✅ Assigned ${number} to soloMediums`);
              }
            }
          }
        });
      }

      // Format vulnerabilities summary (from your GitHub code)
      if (achievements.highsFound > 0 || achievements.mediumsFound > 0 || 
          achievements.soloHighs > 0 || achievements.soloMediums > 0) {
        const parts = [];
        
        if (achievements.highsFound > 0) {
          parts.push(`${achievements.highsFound} highs found`);
        }
        if (achievements.soloHighs > 0) {
          parts.push(`${achievements.soloHighs} solo highs found`);
        }
        if (achievements.mediumsFound > 0) {
          parts.push(`${achievements.mediumsFound} mediums found`);
        }
        if (achievements.soloMediums > 0) {
          parts.push(`${achievements.soloMediums} solo mediums found`);
        }
        
        achievements.vulnerabilitiesSummary = parts.join(', ');
      }

      return achievements;

    } catch (error) {
      console.error('Error extracting achievements:', error);
      return achievements;
    }
  }
}

module.exports = { WorkingSherlockScraper };