import * as cheerio from 'cheerio';
import { ScrapingResult, ScrapingOptions, ProfileData } from './types';
import { SherlockConfig, defaultConfig, isValidSherlockUrl } from './config';
import { ImageUtils } from './image-utils';

/**
 * Main class for scraping Sherlock protocol auditor profiles
 */
export class SherlockScraper {
  private config: SherlockConfig;
  private options: ScrapingOptions;

  constructor(config?: Partial<SherlockConfig>, options?: ScrapingOptions) {
    this.config = { ...defaultConfig, ...config };
    this.options = { ...this.config.defaultOptions, ...options };
  }

  /**
   * Scrapes profile image from a Sherlock profile URL
   * @param sherlockUrl - The Sherlock profile URL to scrape
   * @param options - Optional scraping options to override defaults
   * @returns Promise resolving to scraping result
   */
  async scrapeProfileImage(
    sherlockUrl: string, 
    options?: ScrapingOptions
  ): Promise<ScrapingResult> {
    const opts = { ...this.options, ...options };
    
    if (!isValidSherlockUrl(sherlockUrl)) {
      return {
        success: false,
        error: 'Invalid Sherlock URL format',
      };
    }

    try {
      if (opts.enableLogging) {
        console.log(`🔍 SCRAPING: Fetching profile page from ${sherlockUrl}`);
      }

      // Fetch the profile page HTML
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout || 10000);
      
      const response = await fetch(sherlockUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': opts.userAgent || this.config.defaultOptions.userAgent,
        },
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch profile page: HTTP ${response.status}`,
        };
      }

      const html = await response.text();
      
      if (opts.enableLogging) {
        console.log(`✅ Profile page fetched, parsing for image...`);
      }

      // Parse HTML and extract image URL
      const imageResult = await this.extractImageFromHtml(html, opts);
      
      if (!imageResult.success || !imageResult.profileImageUrl) {
        return {
          success: false,
          error: imageResult.error || 'No profile image found',
          metadata: opts.includeMetadata ? {
            originalUrl: sherlockUrl,
          } : undefined,
        };
      }

      const result: ScrapingResult = {
        success: true,
        profileImageUrl: imageResult.profileImageUrl,
      };

      // Convert to base64 if requested
      if (opts.convertToBase64) {
        const conversionResult = await ImageUtils.convertToBase64(
          imageResult.profileImageUrl, 
          opts.timeout || 10000
        );
        
        if (conversionResult.success) {
          result.profileImageBase64 = conversionResult.dataUrl;
          
          if (opts.enableLogging) {
            console.log(`🎉 SUCCESS: Profile image converted to base64`);
          }
        } else {
          if (opts.enableLogging) {
            console.log(`❌ Failed to convert image to base64: ${conversionResult.error}`);
          }
        }
      }

      // Add metadata if requested
      if (opts.includeMetadata) {
        result.metadata = {
          originalUrl: sherlockUrl,
          finalImageUrl: imageResult.profileImageUrl,
          selector: imageResult.selector,
          ...(result.profileImageBase64 && {
            contentType: 'base64 data URL',
            imageSize: ImageUtils.estimateDataUrlSize(result.profileImageBase64),
          }),
        };
      }

      return result;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: opts.includeMetadata ? {
          originalUrl: sherlockUrl,
        } : undefined,
      };
    }
  }

  /**
   * Extracts image URL from HTML content
   * @private
   */
  private async extractImageFromHtml(
    html: string, 
    opts: ScrapingOptions
  ): Promise<{ success: boolean; profileImageUrl?: string; selector?: string; error?: string }> {
    try {
      const $ = cheerio.load(html);
      
      // Try different selectors to find the profile image
      for (const selector of this.config.selectors.imageSelectors) {
        const imgElement = $(selector).first();
        
        if (imgElement.length > 0) {
          let src = imgElement.attr('src');
          
          if (src) {
            const processedUrl = ImageUtils.processImageUrl(src, this.config.selectors.baseUrl);
            
            if (processedUrl && ImageUtils.isImageUrl(processedUrl)) {
              if (opts.enableLogging) {
                console.log(`✅ FOUND IMAGE with selector "${selector}": ${processedUrl}`);
              }
              
              return {
                success: true,
                profileImageUrl: processedUrl,
                selector,
              };
            }
          }
        }
      }

      return {
        success: false,
        error: 'No profile image found with any selector',
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HTML parsing error',
      };
    }
  }

  /**
   * Scrapes complete profile data from a Sherlock profile URL
   * @param sherlockUrl - The Sherlock profile URL to scrape
   * @param options - Optional scraping options
   * @returns Promise resolving to profile data
   */
  async scrapeProfile(sherlockUrl: string, options?: ScrapingOptions): Promise<ProfileData> {
    const opts = { ...this.options, ...options };
    const imageResult = await this.scrapeProfileImage(sherlockUrl, options);
    
    const profile: ProfileData = {
      achievements: {
        rankings: '',
        earnings: '',
        highsFound: 0,
        mediumsFound: 0,
        soloHighs: 0,
        soloMediums: 0
      }
    };
    
    if (imageResult.success) {
      profile.profileImageUrl = imageResult.profileImageUrl;
      profile.profileImageBase64 = imageResult.profileImageBase64;
    }
    
    // Extract name from URL if available
    const urlMatch = sherlockUrl.match(/\/watson\/([^\/]+)\/?$/);
    if (urlMatch) {
      profile.name = decodeURIComponent(urlMatch[1]);
    }
    
    // Extract additional profile data
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout || 10000);
      
      const response = await fetch(sherlockUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': opts.userAgent || this.config.defaultOptions.userAgent,
        },
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();
        const achievementsData = this.extractAchievementsFromHtml(html, opts);
        profile.achievements = achievementsData;
      }
    } catch (error) {
      if (opts.enableLogging) {
        console.log(`Warning: Could not extract achievements data: ${error}`);
      }
    }
    
    if (options?.includeMetadata) {
      profile.metadata = imageResult.metadata;
    }
    
    return profile;
  }

  /**
   * Extracts achievements data from HTML content
   * @private
   */
  private extractAchievementsFromHtml(html: string, opts: ScrapingOptions): {
    rankings: string;
    earnings: string;
    highsFound: number;
    mediumsFound: number;
    soloHighs: number;
    soloMediums: number;
  } {
    const achievements = {
      rankings: '',
      earnings: '',
      highsFound: 0,
      mediumsFound: 0,
      soloHighs: 0,
      soloMediums: 0
    };

    try {
      const $ = cheerio.load(html);
      
      // Extract earnings - look for $ amount followed by K
      $('*').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        
        // Match pattern like "$34.13K"
        const earningsMatch = text.match(/\$[\d,]+\.?\d*[K|k]/);
        if (earningsMatch && !achievements.earnings) {
          achievements.earnings = earningsMatch[0];
        }
      });

      // Extract contest placement badges (1x, 2x, etc.)
      const placementBadges: string[] = [];
      $('*').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        
        // Look for patterns like "1x", "2x" followed by "1st Places", "2nd Places", etc.
        if (text.match(/^\d+x$/)) {
          const $parent = $el.parent();
          const parentText = $parent.text().toLowerCase();
          
          if (parentText.includes('1st') || parentText.includes('first')) {
            placementBadges.push(`${text} first place`);
          } else if (parentText.includes('2nd') || parentText.includes('second')) {
            placementBadges.push(`${text} second place`);
          } else if (parentText.includes('3rd') || parentText.includes('third')) {
            placementBadges.push(`${text} third place`);
          }
        }
      });
      
      if (placementBadges.length > 0) {
        achievements.rankings = placementBadges.join(', ');
      }

      // NEW APPROACH: Find label sections, then search sibling containers for statistics
      
      // Find High label section
      const $highLabelSection = $('*').filter(function() {
        const classes = $(this).attr('class') || '';
        return classes.includes('border-error-500');
      }).first();
      
      if (opts.enableLogging) {
        console.log(`\n🎯 Found High label section, searching for sibling statistics...`);
      }
      
      if ($highLabelSection.length > 0) {
        // Search in the same parent container for statistics
        const $parentContainer = $highLabelSection.parent();
        
        if (opts.enableLogging) {
          console.log(`\n🔍 Searching High parent container for statistics:`);
        }
        
        // Find all numbers in the parent container
        $parentContainer.find('*').each((i, element) => {
          const $el = $(element);
          const text = $el.text().trim();
          
          if (/^\d+$/.test(text)) {
            const number = parseInt(text);
            const context = $el.closest('div').text();
            
            // Check if this number is in a statistics container near the High section
            const $container = $el.closest('div');
            const containerClass = $container.attr('class') || '';
            
            if (containerClass.includes('flex-col') && containerClass.includes('items-center')) {
              if (opts.enableLogging) {
                console.log(`  Found number ${number} in stats container, context: "${context.substring(0, 50)}..."`);
              }
              
              // Only assign if we haven't found numbers yet (High section comes first)
              if (context.includes(`${number}Total`) && achievements.highsFound === 0) {
                achievements.highsFound = number;
                if (opts.enableLogging) console.log(`    ✅ Assigned ${number} to highsFound`);
              } else if (context.includes(`${number}Solo`) && achievements.soloHighs === 0) {
                achievements.soloHighs = number;
                if (opts.enableLogging) console.log(`    ✅ Assigned ${number} to soloHighs`);
              }
            }
          }
        });
      }
      
      // Find Medium label section
      const $mediumLabelSection = $('*').filter(function() {
        const classes = $(this).attr('class') || '';
        return classes.includes('border-warning-500');
      }).first();
      
      if (opts.enableLogging) {
        console.log(`\n🎯 Found Medium label section, searching for sibling statistics...`);
      }
      
      if ($mediumLabelSection.length > 0) {
        // Search in the same parent container for statistics
        const $parentContainer = $mediumLabelSection.parent();
        
        if (opts.enableLogging) {
          console.log(`\n🔍 Searching Medium parent container for statistics:`);
        }
        
        // Find all numbers in the parent container  
        $parentContainer.find('*').each((i, element) => {
          const $el = $(element);
          const text = $el.text().trim();
          
          if (/^\d+$/.test(text)) {
            const number = parseInt(text);
            const context = $el.closest('div').text();
            
            // Check if this number is in a statistics container near the Medium section
            const $container = $el.closest('div');
            const containerClass = $container.attr('class') || '';
            
            if (containerClass.includes('flex-col') && containerClass.includes('items-center')) {
              if (opts.enableLogging) {
                console.log(`  Found number ${number} in stats container, context: "${context.substring(0, 50)}..."`);
              }
              
              // Only assign Medium numbers after High numbers are assigned
              if (context.includes(`${number}Total`) && achievements.mediumsFound === 0 && number !== achievements.highsFound) {
                achievements.mediumsFound = number;
                if (opts.enableLogging) console.log(`    ✅ Assigned ${number} to mediumsFound`);
              } else if (context.includes(`${number}Solo`) && achievements.soloMediums === 0 && number !== achievements.soloHighs) {
                achievements.soloMediums = number;
                if (opts.enableLogging) console.log(`    ✅ Assigned ${number} to soloMediums`);
              }
            }
          }
        });
      }

      if (opts.enableLogging) {
        console.log(`📊 Extracted achievements:`, achievements);
        
        // Debug: Print all numbers found on the page with detailed section analysis
        console.log('\n🔍 DEBUG: All numbers found on page with section analysis:');
        $('*').each((index, element) => {
          const $el = $(element);
          const text = $el.text().trim();
          if (/^\d+$/.test(text)) {
            const number = parseInt(text);
            const context = $el.closest('div').text();
            
            // Find the actual section by traversing up the DOM tree (enhanced debugging)
            let $foundDebugSection: any = null;
            let debugSectionType = '';
            let debugSectionClass = '';
            
            // Enhanced debugging - log the full parent chain for the first number
            if (number === 1) {
              console.log(`\n🔍 DETAILED DOM TRAVERSAL FOR NUMBER ${number}:`);
              $el.parents().each((index, parent) => {
                const $parent = $(parent);
                const parentClass = $parent.attr('class') || '';
                const parentTag = parent.tagName?.toLowerCase() || 'unknown';
                console.log(`  Parent ${index}: <${parentTag}> class="${parentClass}"`);
                
                if (parentClass.includes('border-error-500')) {
                  console.log(`    ✅ FOUND HIGH SECTION at parent ${index}!`);
                } else if (parentClass.includes('border-warning-500')) {
                  console.log(`    ✅ FOUND MEDIUM SECTION at parent ${index}!`);
                }
              });
            }
            
            $el.parents().each((index, parent) => {
              const $parent = $(parent);
              const parentClass = $parent.attr('class') || '';
              
              if (parentClass.includes('border-error-500') && !$foundDebugSection) {
                $foundDebugSection = $parent;
                debugSectionType = 'high';
                debugSectionClass = parentClass;
                return false;
              } else if (parentClass.includes('border-warning-500') && !$foundDebugSection) {
                $foundDebugSection = $parent;
                debugSectionType = 'medium'; 
                debugSectionClass = parentClass;
                return false;
              }
            });
            
            console.log(`\nNumber ${number}:`);
            console.log(`  Context: "${context.substring(0, 100)}..."`);
            console.log(`  Found section type: "${debugSectionType}"`);
            console.log(`  Section classes: "${debugSectionClass}"`);
            console.log(`  Has border-error-500: ${debugSectionClass.includes('border-error-500')}`);
            console.log(`  Has border-warning-500: ${debugSectionClass.includes('border-warning-500')}`);
            
            if (context.includes(`${number}Total`)) {
              console.log(`  → This is a TOTAL count`);
            } else if (context.includes(`${number}Solo`)) {
              console.log(`  → This is a SOLO count`);
            }
          }
        });
        
        // Debug: Find and log all High and Medium sections
        console.log('\n🎯 DEBUG: High sections found:');
        $('*').each((index, element) => {
          const $el = $(element);
          const elementClass = $el.attr('class') || '';
          if (elementClass.includes('border-error-500')) {
            console.log(`High section found with classes: "${elementClass}"`);
            console.log(`High section content: "${$el.text().substring(0, 200)}..."`);
          }
        });
        
        console.log('\n🎯 DEBUG: Medium sections found:');
        $('*').each((index, element) => {
          const $el = $(element);
          const elementClass = $el.attr('class') || '';
          if (elementClass.includes('border-warning-500')) {
            console.log(`Medium section found with classes: "${elementClass}"`);
            console.log(`Medium section content: "${$el.text().substring(0, 200)}..."`);
          }
        });
      }

    } catch (error) {
      if (opts.enableLogging) {
        console.log(`Error extracting achievements: ${error}`);
      }
    }

    return achievements;
  }

  /**
   * Batch scraping for multiple Sherlock URLs
   * @param urls - Array of Sherlock URLs to scrape
   * @param options - Optional scraping options
   * @param concurrency - Number of concurrent requests (default: 3)
   * @returns Promise resolving to array of scraping results
   */
  async scrapeMultiple(
    urls: string[], 
    options?: ScrapingOptions, 
    concurrency: number = 3
  ): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];
    
    // Process URLs in batches to avoid overwhelming the server
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchPromises = batch.map(url => this.scrapeProfileImage(url, options));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add a small delay between batches to be respectful
      if (i + concurrency < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Updates the scraper configuration
   * @param config - Partial configuration to merge with existing config
   */
  updateConfig(config: Partial<SherlockConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Updates the default scraping options
   * @param options - Partial options to merge with existing options
   */
  updateOptions(options: Partial<ScrapingOptions>): void {
    this.options = { ...this.options, ...options };
  }
}