# Enhanced Sherlock Protocol Scraper for Figma Slide Generator

## Overview

This is a comprehensive Node.js application that combines web scraping and Figma API integration for automated slide generation. The system extracts detailed auditor data from the Sherlock DeFi security audit platform (audits.sherlock.xyz) and provides Figma API integration to create professional slides automatically. It captures rankings, earnings, vulnerability discovery statistics, and profile images for seamless slide generation workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Architecture

The application follows a modular, dual-approach architecture for robust data extraction:

**Dual Scraping Strategy**: 
- `SherlockScraper` (Puppeteer-based): Browser automation for JavaScript-heavy pages with dynamic content loading
- `SherlockScraperSimple` (HTTP-based): Lightweight Axios + Cheerio approach for static content extraction

**Enhanced Data Extraction**: The scrapers now capture comprehensive auditor profiles including:
- Auditor names and profile images
- Contest rankings and placements (e.g., "1st place, 5x 2nd, 4x 3rd in contests")
- Total earnings from audits (e.g., "$520K+ earned in audits")
- Number of highs and mediums found
- Number of solo highs and solo mediums found

**Figma Integration Architecture**: 
- **Dual Approach**: REST API client for testing + Plugin API for full slide generation
- `FigmaClient` class for template analysis and connection testing (REST API)
- **Figma Plugin** (`figma-plugin/`) for complete slide generation with write permissions
- Template frame duplication within same file (Plugin API only)
- Smart text layer mapping using naming conventions
- Profile image replacement with automatic fetching
- Template structure analysis for setup and debugging

**Fallback Architecture**: The system gracefully degrades from Puppeteer to simple HTTP requests when browser automation is unavailable.

**Structured Output Format**: Data is standardized into the following JSON structure:
```javascript
{
  name: "auditorName",
  profileImage: "imageUrl", 
  achievements: {
    rankings: "contest placement text",
    earnings: "earnings amount",
    highsFound: number,
    mediumsFound: number,
    soloHighs: number,
    soloMediums: number
  }
}
```

### File Structure

**Source Organization**: 
- **Main Application** (`src/`): Express server providing Sherlock scraper API
  - `src/sherlock-scraper.ts`: Advanced Puppeteer-based scraper with TypeScript
  - `src/figma-client.ts`: Figma REST API client for testing and analysis
  - `src/server.js`: Express web server with scraper API endpoints
  - `src/public/index.html`: Web UI for testing scraper functionality
  - `src/types.ts`: TypeScript interface definitions

- **Figma Plugin** (`figma-plugin/`): Complete plugin for slide generation
  - `figma-plugin/manifest.json`: Plugin configuration with network access
  - `figma-plugin/code.js`: Main plugin logic with slide generation
  - `figma-plugin/ui.html`: Plugin UI panel with form inputs
  - `figma-plugin/README.md`: Installation and usage instructions

**Error Handling**: Comprehensive error handling with graceful fallbacks and sample data generation for testing purposes.

## External Dependencies

**HTTP Client**: Axios (^1.11.0) for HTTP requests with proper headers and user agent strings
**HTML Parsing**: Cheerio (^1.1.2) for server-side jQuery-like HTML manipulation
**Browser Automation**: Puppeteer (^24.18.0) for handling dynamic content and JavaScript-rendered pages
**Web Framework**: Express (^5.1.0) with comprehensive API endpoints for scraping and Figma integration
**Figma Integration**: Native Figma API client with form-data support for image uploads
**TypeScript Support**: Full TypeScript implementation with proper type definitions
**Target Platforms**: 
- Sherlock Protocol (audits.sherlock.xyz) for auditor data
- Figma API (api.figma.com) for automated slide generation

## Recent Changes

**September 04, 2025**: Successfully implemented complete Figma plugin approach after discovering REST API limitations:

**Figma Plugin Implementation Completed:**
- ✅ Complete Figma plugin with full write permissions (bypasses REST API limitations)
- ✅ Plugin structure: `manifest.json`, `code.js`, `ui.html` with proper network access configuration
- ✅ Template frame duplication with timestamp-protocol-auditor naming convention
- ✅ Smart text layer mapping using naming conventions (auditor-name, achievement-1, etc.)
- ✅ Profile image replacement with Sherlock CDN integration
- ✅ Template structure analysis for debugging and setup
- ✅ Comprehensive plugin UI with auditor URL input and manual content fields
- ✅ Full integration with Sherlock scraper API for automated data fetching
- ✅ Error handling, progress tracking, and user feedback systems

**Key Discovery**: Figma REST API is read-only and cannot duplicate files or create pages. Plugin API provides full write access needed for slide generation.

**Plugin Features:**
- Automatic auditor data fetching from Sherlock URLs
- Template frame duplication within same file
- Vulnerability summary generation (combines highs/mediums found with solo counts)
- Manual content integration for custom descriptions and protocol-specific content
- Professional slide naming: `[timestamp] [protocol] [auditor]` format

**Enhanced Scraper Implementation (Previously Completed):**

**Core Functionality Achieved:**
- ✅ Accurate contest rankings extraction (e.g., "3x first place, 3x second place, 4x third place")
- ✅ Precise earnings data capture (e.g., "$160.38K")
- ✅ Complete vulnerability statistics extraction:
  - High Total vulnerabilities found
  - Medium Total vulnerabilities found
  - Solo High discoveries
  - Solo Medium discoveries
- ✅ Profile image extraction from Sherlock CDN and Twitter images

**Technical Implementation:**
- **Advanced DOM Navigation**: Implemented sibling container search approach to handle complex HTML structure where statistics containers are siblings of label sections rather than descendants
- **Section-First Extraction**: Finds High/Medium label sections with border classes, then searches parent containers for related statistics
- **Robust Data Parsing**: Uses pattern matching for "XTotal" and "XSolo" contexts with proper section attribution
- **Comprehensive Testing**: Verified across multiple auditor profiles (newspacexyz, 0xdeadbeef, berndartmueller, x77)

**Data Structure Output:**
```javascript
{
  name: "auditorName",
  profileImage: "imageUrl", 
  achievements: {
    rankings: "contest placement text",
    earnings: "earnings amount",
    highsFound: number,
    mediumsFound: number,
    soloHighs: number,
    soloMediums: number
  }
}
```

The system now provides a complete Phase 1 implementation for automated Figma slide generation:

**Production-Ready Implementation:**

**Sherlock Scraper API** (REST endpoints):
- `/api/scrape-profile`: Fetch complete auditor data from Sherlock URLs
- Vulnerability summary generation combining total + solo counts
- Profile image extraction from Sherlock CDN
- Full achievement data: rankings, earnings, statistics

**Figma Plugin** (Complete slide generation):
- Template frame analysis and structure detection
- Automated slide duplication with proper naming
- Text layer updates using naming conventions
- Profile image replacement with fetched images
- Manual content integration for custom descriptions
- Error handling and progress tracking

**Usage Workflow:**
1. Install Figma plugin from `figma-plugin/` directory
2. Create slide template with properly named text layers
3. Use plugin to fetch auditor data and generate professional slides
4. Plugin combines Sherlock data with manual protocol-specific content

**Future Enhancements:**
- Logo database integration for protocol branding
- Batch slide generation for multiple auditors
- Advanced template customization and styling
- Export automation to various formats

The system provides a complete end-to-end solution for professional auditor slide generation.

## Complete Figma Plugin Implementation (Latest)

**September 04, 2025**: Successfully built complete Figma plugin for automated auditor slide generation with local development deployment:

**Plugin Architecture (`auditor-slide-generator-plugin/`):**
- ✅ Full TypeScript implementation with proper Figma plugin typings
- ✅ Webpack build system with development and production modes
- ✅ Comprehensive manifest.json with network access for external APIs
- ✅ Local development server with hot reload capabilities
- ✅ Complete npm script setup for building and development

**Core Plugin Features:**
- ✅ Template frame duplication with timestamp-protocol-auditor naming
- ✅ Smart text layer mapping using naming conventions (auditor-name, achievement-1, etc.)
- ✅ Automated auditor data fetching from Sherlock scraper API
- ✅ Logo database system with upload, search, and management capabilities
- ✅ Multiple logo layout configurations (3, 4, or 6 logos)
- ✅ Profile image replacement with automatic fetching
- ✅ Template structure analysis for debugging and setup
- ✅ Complete error handling and progress tracking systems

**Plugin UI Panel:**
- ✅ Comprehensive form interface with collapsible sections
- ✅ Auditor selection with Sherlock URL input and testing
- ✅ Logo management with drag-and-drop upload and database
- ✅ Manual content input fields for protocol-specific customization
- ✅ Real-time progress indicators and status updates
- ✅ Template analysis and setup tools

**Development Environment:**
- ✅ Complete package.json with all required dependencies
- ✅ Webpack configuration for TypeScript compilation
- ✅ Local development server setup
- ✅ Build scripts for development and production
- ✅ Comprehensive README with installation and usage instructions

**External Integrations:**
- ✅ Full connection to Sherlock scraper API for auditor data
- ✅ Logo database system using Figma's clientStorage
- ✅ Image processing for profile pictures and company logos
- ✅ Network access configuration for external API calls

The plugin provides full write permissions for Figma file manipulation, solving the REST API limitations and enabling complete automation of slide generation directly within Figma.