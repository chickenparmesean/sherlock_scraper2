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
- `FigmaClient` class providing comprehensive Figma API integration
- Template-based slide duplication (creates new copies, never modifies originals) 
- Text layer updates and image replacement capabilities
- File structure analysis for identifying updateable elements

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

**Source Organization**: All source code is organized in the `src/` directory:
- `src/sherlock-scraper.ts`: Advanced Puppeteer-based scraper with TypeScript
- `src/figma-client.ts`: Comprehensive Figma API client for slide generation
- `src/figma-test.ts`: Figma integration testing and demonstration utilities
- `src/image-utils.ts`: Image processing and conversion utilities
- `src/config.ts`: Configuration management and constants
- `src/types.ts`: TypeScript interface definitions
- `src/server.js`: Express web server with API endpoints for both scraping and Figma
- `src/public/index.html`: Web UI for testing scraper and Figma integration

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

**September 04, 2025**: Successfully implemented Phase 1 of comprehensive Figma slide generation system:

**Phase 1 - Figma Integration Completed:**
- ✅ Figma API client with FIGMA_TOKEN authentication
- ✅ File duplication functionality (duplicateFigmaFile) - creates new copies for each slide
- ✅ Core functions: getFigmaFile(), findLayer(), updateText(), replaceImage()
- ✅ Batch text updates with updateMultipleTexts()
- ✅ File structure analysis for identifying text and image layers
- ✅ Comprehensive web UI for testing Figma connectivity
- ✅ API endpoints: /api/figma/test-connection, /api/figma/analyze-structure, /api/figma/create-slide

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

**Current Capabilities:**
- Full auditor profile data extraction from Sherlock Protocol
- Figma template duplication and slide creation
- Text layer identification and batch updates
- Image container detection for future image replacement
- Web interface for testing both scraping and Figma functionality

**Planned Development Phases:**
- Phase 2: Database setup for protocol logo management
- Phase 3: Advanced image processing and layout handling
- Phase 4: Complete integration with UI for auditor selection and slide export

The foundation is production-ready for basic slide generation workflows with manual layer ID identification.