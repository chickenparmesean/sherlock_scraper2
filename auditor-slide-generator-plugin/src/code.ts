// Auditor Slide Generator - Main Plugin Code
// Handles all Figma operations and external API integrations

interface AuditorData {
  name: string;
  profileImageUrl?: string;
  achievements?: {
    rankings?: string;
    earnings?: string;
    highsFound?: number;
    mediumsFound?: number;
    soloHighs?: number;
    soloMediums?: number;
  };
}

interface ManualInputs {
  subheading?: string;
  description?: string;
  achievement4?: string;
  goodfit1?: string;
  goodfit2?: string;
  goodfit3?: string;
}

interface LogoItem {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface SlideGenerationRequest {
  auditorUrl: string;
  protocolName: string;
  manualInputs: ManualInputs;
  selectedLogos: LogoItem[];
  logoLayout: '3' | '4' | '6';
}

// Plugin State Management
let pluginCurrentTemplate: FrameNode | null = null;
let pluginLogoDatabase: LogoItem[] = [];
let pluginIsGenerating = false;

// Plugin initialization
console.log('🎨 Auditor Slide Generator plugin loaded');

figma.showUI(__html__, { 
  width: 420, 
  height: 700,
  themeColors: true 
});

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  console.log('📩 Plugin received message:', msg.type);
  
  try {
    switch (msg.type) {
      case 'generate-slide':
        await handleSlideGeneration(msg.data);
        break;
      
      case 'analyze-template':
        await handleTemplateAnalysis();
        break;
        
      case 'test-scraper':
        await handleScraperTest(msg.data.auditorUrl);
        break;
        
      case 'load-logo-database':
        await handleLoadLogoDatabase();
        break;
        
      case 'save-logo':
        await handleSaveLogo(msg.data);
        break;
        
      case 'delete-logo':
        await handleDeleteLogo(msg.data.logoId);
        break;
        
      case 'set-template':
        await handleSetTemplate();
        break;
        
      default:
        console.log('❓ Unknown message type:', msg.type);
    }
  } catch (error) {
    console.error('❌ Plugin error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

// Main slide generation function
async function handleSlideGeneration(data: SlideGenerationRequest) {
  if (pluginIsGenerating) {
    figma.ui.postMessage({ type: 'error', message: 'Generation already in progress' });
    return;
  }
  
  pluginIsGenerating = true;
  figma.ui.postMessage({ type: 'status', message: 'Starting slide generation...' });
  
  try {
    // Step 1: Validate template
    if (!pluginCurrentTemplate) {
      pluginCurrentTemplate = findTemplateFrame();
      if (!pluginCurrentTemplate) {
        throw new Error('No template frame found. Please select a frame to use as template.');
      }
    }
    
    figma.ui.postMessage({ type: 'status', message: 'Template validated. Fetching auditor data...' });
    
    // Step 2: Fetch auditor data
    const auditorData = await fetchAuditorData(data.auditorUrl);
    
    figma.ui.postMessage({ type: 'status', message: `Auditor data loaded: ${auditorData.name}. Creating slide...` });
    
    // Step 3: Duplicate template frame
    const newSlide = await duplicateTemplateFrame(pluginCurrentTemplate, data.protocolName, auditorData.name);
    
    // Step 4: Update text content
    figma.ui.postMessage({ type: 'status', message: 'Updating text content...' });
    await updateSlideContent(newSlide, auditorData, data.manualInputs, data.protocolName);
    
    // Step 5: Handle logo placement
    if (data.selectedLogos.length > 0) {
      figma.ui.postMessage({ type: 'status', message: 'Placing logos...' });
      await placeSlideLogo(newSlide, data.selectedLogos, data.logoLayout);
    }
    
    // Step 6: Replace profile image
    if (auditorData.profileImageUrl) {
      figma.ui.postMessage({ type: 'status', message: 'Replacing profile image...' });
      await replaceProfileImage(newSlide, auditorData.profileImageUrl);
    }
    
    // Step 7: Focus on the new slide
    figma.viewport.scrollAndZoomIntoView([newSlide]);
    figma.currentPage.selection = [newSlide];
    
    figma.ui.postMessage({
      type: 'success',
      message: `✅ Slide generated successfully for ${auditorData.name}!`,
      data: {
        slideName: newSlide.name,
        auditorData,
        logoCount: data.selectedLogos.length
      }
    });
    
  } catch (error) {
    console.error('❌ Slide generation failed:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Slide generation failed'
    });
  } finally {
    pluginIsGenerating = false;
  }
}

// Find template frame (selected frame or first frame)
function findTemplateFrame(): FrameNode | null {
  // Check if user has selected a frame
  if (figma.currentPage.selection.length === 1) {
    const selected = figma.currentPage.selection[0];
    if (selected.type === 'FRAME') {
      return selected as FrameNode;
    }
  }
  
  // Find first frame on page
  const frames = figma.currentPage.children.filter(child => child.type === 'FRAME') as FrameNode[];
  return frames.length > 0 ? frames[0] : null;
}

// Duplicate template frame with proper naming
async function duplicateTemplateFrame(template: FrameNode, protocolName: string, auditorName: string): Promise<FrameNode> {
  const newFrame = template.clone();
  
  // Generate timestamp and name
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 16); // 2025-09-04T14-30
  newFrame.name = `${timestamp} ${protocolName} ${auditorName}`;
  
  // Position new frame next to template
  newFrame.x = template.x + template.width + 100;
  newFrame.y = template.y;
  
  figma.currentPage.appendChild(newFrame);
  
  return newFrame;
}

// Update slide content with auditor data and manual inputs
async function updateSlideContent(
  slide: FrameNode, 
  auditorData: AuditorData, 
  manualInputs: ManualInputs, 
  protocolName: string
) {
  console.log('📝 Updating slide content...');
  
  // Build vulnerabilities summary
  const vulnParts = [];
  if (auditorData.achievements?.highsFound) vulnParts.push(`${auditorData.achievements.highsFound} highs found`);
  if (auditorData.achievements?.soloHighs) vulnParts.push(`${auditorData.achievements.soloHighs} solo highs found`);
  if (auditorData.achievements?.mediumsFound) vulnParts.push(`${auditorData.achievements.mediumsFound} mediums found`);
  if (auditorData.achievements?.soloMediums) vulnParts.push(`${auditorData.achievements.soloMediums} solo mediums found`);
  const vulnerabilitiesSummary = vulnParts.join(', ');
  
  // Text mappings with fallbacks
  const textMappings = [
    { targetName: 'auditor-name', content: auditorData.name },
    { targetName: 'subheading', content: manualInputs.subheading || '' },
    { targetName: 'description', content: manualInputs.description || '' },
    { targetName: 'achievement-1', content: auditorData.achievements?.rankings || '' },
    { targetName: 'achievement-2', content: auditorData.achievements?.earnings || '' },
    { targetName: 'achievement-3', content: vulnerabilitiesSummary },
    { targetName: 'achievement-4', content: manualInputs.achievement4 || '' },
    { targetName: 'goodfit-1', content: manualInputs.goodfit1 || '' },
    { targetName: 'goodfit-2', content: manualInputs.goodfit2 || '' },
    { targetName: 'goodfit-3', content: manualInputs.goodfit3 || '' },
    { targetName: 'title', content: `Why ${auditorData.name} Is a Great Fit for ${protocolName}?` },
    { targetName: 'slide-title', content: `Why ${auditorData.name} Is a Great Fit for ${protocolName}?` }
  ];
  
  // Update text layers
  let updatedCount = 0;
  for (const mapping of textMappings) {
    if (mapping.content) {
      const updated = await updateTextInNode(slide, mapping.targetName, mapping.content);
      if (updated) updatedCount++;
    }
  }
  
  console.log(`📝 Updated ${updatedCount} text layers`);
}

// Recursively find and update text nodes by name pattern
async function updateTextInNode(node: BaseNode, targetName: string, newText: string): Promise<boolean> {
  if (node.type === 'TEXT' && node.name.toLowerCase().includes(targetName.toLowerCase())) {
    try {
      const textNode = node as TextNode;
      await figma.loadFontAsync(textNode.fontName as FontName);
      textNode.characters = newText;
      return true;
    } catch (error) {
      console.error(`❌ Failed to update text "${targetName}":`, error);
    }
  }
  
  // Recursively search children
  if ('children' in node) {
    for (const child of node.children) {
      if (await updateTextInNode(child, targetName, newText)) {
        return true;
      }
    }
  }
  
  return false;
}

// Place logos in the slide based on layout configuration
async function placeSlideLogo(slide: FrameNode, logos: LogoItem[], layout: '3' | '4' | '6') {
  try {
    console.log(`🏢 Placing ${logos.length} logos in ${layout}-logo layout`);
    
    // Find logo containers
    const logoContainers = findLogoContainers(slide, parseInt(layout));
    
    if (logoContainers.length === 0) {
      console.log('⚠️ No logo containers found in template');
      return;
    }
    
    // Place logos in containers
    for (let i = 0; i < Math.min(logos.length, logoContainers.length); i++) {
      const container = logoContainers[i];
      const logo = logos[i];
      
      try {
        const imageData = await fetchImageAsBytes(logo.url);
        const imageHash = figma.createImage(imageData).hash;
        
        if (container.type === 'RECTANGLE' || container.type === 'ELLIPSE') {
          container.fills = [{
            type: 'IMAGE',
            scaleMode: 'FIT',
            imageHash: imageHash
          }];
        }
        
        console.log(`✅ Placed logo: ${logo.name}`);
      } catch (error) {
        console.error(`❌ Failed to place logo ${logo.name}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to place logos:', error);
  }
}

// Find logo containers in the slide
function findLogoContainers(slide: FrameNode, expectedCount: number): BaseNode[] {
  const containers: BaseNode[] = [];
  
  function searchForLogoContainers(node: BaseNode) {
    // Look for nodes with logo-related names
    if (node.name.toLowerCase().includes('logo')) {
      containers.push(node);
    }
    
    if ('children' in node) {
      for (const child of node.children) {
        searchForLogoContainers(child);
      }
    }
  }
  
  searchForLogoContainers(slide);
  
  // Sort by position (left to right, top to bottom)
  containers.sort((a, b) => {
    const aNode = a as SceneNode;
    const bNode = b as SceneNode;
    if (Math.abs(aNode.y - bNode.y) < 10) { // Same row
      return aNode.x - bNode.x;
    }
    return aNode.y - bNode.y;
  });
  
  return containers.slice(0, expectedCount);
}

// Replace profile image
async function replaceProfileImage(slide: FrameNode, imageUrl: string) {
  try {
    console.log('🖼️ Replacing profile image...');
    
    const imageNode = findImageNode(slide, 'profile');
    if (!imageNode) {
      console.log('⚠️ Profile image container not found');
      return;
    }
    
    const imageData = await fetchImageAsBytes(imageUrl);
    const imageHash = figma.createImage(imageData).hash;
    
    if (imageNode.type === 'RECTANGLE' || imageNode.type === 'ELLIPSE') {
      (imageNode as RectangleNode | EllipseNode).fills = [{
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: imageHash
      }];
    }
    
    console.log('✅ Profile image updated');
  } catch (error) {
    console.error('❌ Failed to replace profile image:', error);
  }
}

// Find image node by name pattern
function findImageNode(node: BaseNode, namePattern: string): BaseNode | null {
  if (node.name.toLowerCase().includes(namePattern.toLowerCase())) {
    return node;
  }
  
  if ('children' in node) {
    for (const child of node.children) {
      const found = findImageNode(child, namePattern);
      if (found) return found;
    }
  }
  
  return null;
}

// Fetch image as bytes for Figma
async function fetchImageAsBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Fetch auditor data from Sherlock scraper API
async function fetchAuditorData(auditorUrl: string): Promise<AuditorData> {
  try {
    const username = extractUsernameFromUrl(auditorUrl);
    if (!username) {
      throw new Error('Invalid auditor URL. Please provide a valid Sherlock profile URL.');
    }
    
    const apiHost = await getApiHost();
    const apiUrl = `${apiHost}/api/scrape-profile`;
    
    console.log('🔍 Calling scraper API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        url: auditorUrl
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to scrape auditor data');
    }
    
    return data.profile;
  } catch (error) {
    console.error('❌ Failed to fetch auditor data:', error);
    throw new Error(`Failed to fetch auditor data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract username from Sherlock URL
function extractUsernameFromUrl(url: string): string | null {
  const match = url.match(/sherlock\.xyz\/watson\/([^\/\?]+)/);
  return match ? match[1] : null;
}

// Get API host for scraper service
async function getApiHost(): Promise<string> {
  // Try different endpoints to find the active one
  const endpoints = [
    'http://localhost:5000',
    'https://localhost:5000'
    // Add your Replit URL here when deploying
  ];
  
  for (const endpoint of endpoints) {
    try {
      const testResponse = await fetch(`${endpoint}/api/test`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      if (testResponse.ok) {
        return endpoint;
      }
    } catch (e) {
      // Continue to next endpoint
    }
  }
  
  // Default fallback
  return 'http://localhost:5000';
}

// Handle template analysis
async function handleTemplateAnalysis() {
  const templateFrame = findTemplateFrame();
  if (!templateFrame) {
    figma.ui.postMessage({
      type: 'error',
      message: 'No template frame found. Please select a frame to analyze.'
    });
    return;
  }
  
  pluginCurrentTemplate = templateFrame;
  const analysis = analyzeTemplateStructure(templateFrame);
  
  figma.ui.postMessage({
    type: 'template-analysis',
    data: analysis
  });
}

// Analyze template structure
function analyzeTemplateStructure(frame: FrameNode) {
  const textNodes: Array<{name: string, content: string}> = [];
  const imageNodes: Array<{name: string, type: string}> = [];
  const logoNodes: Array<{name: string, type: string}> = [];
  
  function traverseNode(node: BaseNode) {
    if (node.type === 'TEXT') {
      textNodes.push({
        name: node.name,
        content: (node as TextNode).characters
      });
    } else if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
      if (node.name.toLowerCase().includes('logo')) {
        logoNodes.push({
          name: node.name,
          type: node.type
        });
      } else {
        const fills = (node as GeometryMixin).fills as Paint[];
        if (fills && fills.some(fill => fill.type === 'IMAGE')) {
          imageNodes.push({
            name: node.name,
            type: node.type
          });
        }
      }
    }
    
    if ('children' in node) {
      for (const child of node.children) {
        traverseNode(child);
      }
    }
  }
  
  traverseNode(frame);
  
  return {
    frameName: frame.name,
    textNodes,
    imageNodes,
    logoNodes,
    totalNodes: textNodes.length + imageNodes.length + logoNodes.length
  };
}

// Handle scraper test
async function handleScraperTest(auditorUrl: string) {
  try {
    figma.ui.postMessage({ type: 'status', message: 'Testing scraper connection...' });
    
    const auditorData = await fetchAuditorData(auditorUrl);
    
    figma.ui.postMessage({
      type: 'scraper-test-result',
      data: {
        success: true,
        auditorData
      }
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'scraper-test-result',
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

// Logo database management
async function handleLoadLogoDatabase() {
  try {
    // Load from plugin data storage
    const storedLogos = await figma.clientStorage.getAsync('logoDatabase');
    pluginLogoDatabase = storedLogos || [];
    
    figma.ui.postMessage({
      type: 'logo-database-loaded',
      data: pluginLogoDatabase
    });
  } catch (error) {
    console.error('Failed to load logo database:', error);
    figma.ui.postMessage({
      type: 'logo-database-loaded',
      data: []
    });
  }
}

async function handleSaveLogo(logoData: LogoItem) {
  try {
    // Add to database
    pluginLogoDatabase.push(logoData);
    
    // Save to plugin storage
    await figma.clientStorage.setAsync('logoDatabase', pluginLogoDatabase);
    
    figma.ui.postMessage({
      type: 'logo-saved',
      data: logoData
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Failed to save logo'
    });
  }
}

async function handleDeleteLogo(logoId: string) {
  try {
    pluginLogoDatabase = pluginLogoDatabase.filter(logo => logo.id !== logoId);
    await figma.clientStorage.setAsync('logoDatabase', pluginLogoDatabase);
    
    figma.ui.postMessage({
      type: 'logo-deleted',
      data: { logoId }
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Failed to delete logo'
    });
  }
}

async function handleSetTemplate() {
  const templateFrame = findTemplateFrame();
  if (templateFrame) {
    pluginCurrentTemplate = templateFrame;
    figma.ui.postMessage({
      type: 'template-set',
      data: { templateName: templateFrame.name }
    });
  } else {
    figma.ui.postMessage({
      type: 'error',
      message: 'No frame selected. Please select a frame to use as template.'
    });
  }
}