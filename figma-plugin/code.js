// Figma Plugin: Sherlock Auditor Slide Generator
// Main plugin logic running in Figma's sandbox

console.log('🔌 Sherlock Auditor Slide Generator plugin loaded');

// Plugin initialization
figma.showUI(__html__, { 
  width: 400, 
  height: 600,
  themeColors: true 
});

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  console.log('🔌 Plugin received message:', msg.type);
  
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
async function handleSlideGeneration(data) {
  figma.ui.postMessage({ type: 'status', message: 'Starting slide generation...' });
  
  try {
    // Step 1: Find template frame
    const templateFrame = findTemplateFrame();
    if (!templateFrame) {
      throw new Error('Template frame not found. Please select a frame to use as template.');
    }
    
    figma.ui.postMessage({ type: 'status', message: 'Template frame found. Fetching auditor data...' });
    
    // Step 2: Fetch auditor data from our Sherlock scraper
    const auditorData = await fetchAuditorData(data.auditorUrl);
    
    figma.ui.postMessage({ type: 'status', message: `Auditor data loaded: ${auditorData.name}. Creating slide...` });
    
    // Step 3: Duplicate template frame
    const newSlide = await duplicateTemplateFrame(templateFrame, data.protocolName, auditorData.name);
    
    // Step 4: Update text content
    await updateSlideContent(newSlide, auditorData, data.manualInputs, data.protocolName);
    
    // Step 5: Replace profile image
    if (auditorData.profileImageUrl) {
      await replaceProfileImage(newSlide, auditorData.profileImageUrl);
    }
    
    // Step 6: Focus on the new slide
    figma.viewport.scrollAndZoomIntoView([newSlide]);
    figma.currentPage.selection = [newSlide];
    
    figma.ui.postMessage({
      type: 'success',
      message: `✅ Slide generated successfully for ${auditorData.name}!`,
      data: {
        slideName: newSlide.name,
        auditorData
      }
    });
    
  } catch (error) {
    console.error('❌ Slide generation failed:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Slide generation failed'
    });
  }
}

// Find template frame (either selected or first frame on page)
function findTemplateFrame() {
  // First check if user has selected a frame
  if (figma.currentPage.selection.length === 1) {
    const selected = figma.currentPage.selection[0];
    if (selected.type === 'FRAME') {
      return selected;
    }
  }
  
  // If no frame selected, find first frame on page
  const frames = figma.currentPage.children.filter(child => child.type === 'FRAME');
  return frames.length > 0 ? frames[0] : null;
}

// Duplicate template frame with proper naming
async function duplicateTemplateFrame(template, protocolName, auditorName) {
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

// Update text content based on our mappings
async function updateSlideContent(slide, auditorData, manualInputs, protocolName) {
  console.log('📝 Updating slide content...');
  
  // Build vulnerabilities summary
  const vulnParts = [];
  if (auditorData.achievements?.highsFound) vulnParts.push(`${auditorData.achievements.highsFound} highs found`);
  if (auditorData.achievements?.soloHighs) vulnParts.push(`${auditorData.achievements.soloHighs} solo highs found`);
  if (auditorData.achievements?.mediumsFound) vulnParts.push(`${auditorData.achievements.mediumsFound} mediums found`);
  if (auditorData.achievements?.soloMediums) vulnParts.push(`${auditorData.achievements.soloMediums} solo mediums found`);
  const vulnerabilitiesSummary = vulnParts.join(', ');
  
  // Text mappings based on our CSV
  const textMappings = [
    { targetName: 'auditor-name', content: auditorData.name },
    { targetName: 'auditor-subheading', content: manualInputs.subheading || '' },
    { targetName: 'auditor-description', content: manualInputs.description || '' },
    { targetName: 'achievement-1', content: auditorData.achievements?.rankings || '' },
    { targetName: 'achievement-2', content: auditorData.achievements?.earnings || '' },
    { targetName: 'achievement-3', content: vulnerabilitiesSummary },
    { targetName: 'achievement-4', content: manualInputs.achievement4 || '' },
    { targetName: 'goodfit-1', content: manualInputs.goodfit1 || '' },
    { targetName: 'goodfit-2', content: manualInputs.goodfit2 || '' },
    { targetName: 'goodfit-3', content: manualInputs.goodfit3 || '' },
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

// Recursively find and update text nodes by name
async function updateTextInNode(node, targetName, newText) {
  if (node.type === 'TEXT' && node.name.toLowerCase().includes(targetName.toLowerCase())) {
    try {
      // Load font before changing text
      await figma.loadFontAsync(node.fontName);
      node.characters = newText;
      return true;
    } catch (error) {
      console.error(`❌ Failed to update text "${targetName}":`, error);
    }
  }
  
  // Recursively search children
  if (node.children) {
    for (const child of node.children) {
      if (await updateTextInNode(child, targetName, newText)) {
        return true;
      }
    }
  }
  
  return false;
}

// Fetch auditor data from our Sherlock scraper API
async function fetchAuditorData(auditorUrl) {
  try {
    // Extract username from URL
    const username = extractUsernameFromUrl(auditorUrl);
    if (!username) {
      throw new Error('Invalid auditor URL. Please provide a valid Sherlock profile URL.');
    }
    
    // Get the Replit host URL for API calls
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
    throw new Error(`Failed to fetch auditor data: ${error.message}`);
  }
}

// Extract username from Sherlock URL
function extractUsernameFromUrl(url) {
  const match = url.match(/sherlock\.xyz\/watson\/([^\/\?]+)/);
  return match ? match[1] : null;
}

// Get API host for our scraper service
async function getApiHost() {
  // For development, try localhost first
  try {
    const testResponse = await fetch('http://localhost:5000/api/test', { method: 'GET' });
    if (testResponse.ok) {
      return 'http://localhost:5000';
    }
  } catch (e) {
    // Localhost not available, will use Replit URL
  }
  
  // For production, you'll need to update this with your actual Replit URL
  // Format: https://your-repl-name--your-username.repl.co
  return 'https://localhost:5000'; // This needs to be updated with actual deployment URL
}

// Replace profile image
async function replaceProfileImage(slide, imageUrl) {
  try {
    console.log('🖼️ Replacing profile image...');
    
    // Find image container (look for node named "profile-image" or similar)
    const imageNode = findImageNode(slide, 'profile');
    if (!imageNode) {
      console.log('⚠️ Profile image container not found');
      return;
    }
    
    // Fetch image data
    const imageData = await fetchImageAsBytes(imageUrl);
    
    // Create image and apply as fill
    const imageHash = figma.createImage(imageData).hash;
    
    if (imageNode.type === 'RECTANGLE' || imageNode.type === 'ELLIPSE') {
      imageNode.fills = [{
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
function findImageNode(node, namePattern) {
  if (node.name.toLowerCase().includes(namePattern.toLowerCase())) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findImageNode(child, namePattern);
      if (found) return found;
    }
  }
  
  return null;
}

// Fetch image as bytes for Figma
async function fetchImageAsBytes(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
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
  
  const analysis = analyzeTemplateStructure(templateFrame);
  
  figma.ui.postMessage({
    type: 'template-analysis',
    data: analysis
  });
}

// Analyze template structure
function analyzeTemplateStructure(frame) {
  const textNodes = [];
  const imageNodes = [];
  
  function traverseNode(node) {
    if (node.type === 'TEXT') {
      textNodes.push({
        name: node.name,
        content: node.characters
      });
    } else if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
      // Check if it might be an image container
      const fills = node.fills;
      if (fills && fills.some(fill => fill.type === 'IMAGE')) {
        imageNodes.push({
          name: node.name,
          type: node.type
        });
      }
    }
    
    if (node.children) {
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
    totalNodes: textNodes.length + imageNodes.length
  };
}

// Handle scraper test
async function handleScraperTest(auditorUrl) {
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