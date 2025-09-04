    data: { step: 'frame-duplicated' }
    });
    
    // Step 2: Update text layers
    await updateSlideTextLayers(newSlide, data.auditorData, data.manualInputs, data.protocolName);
    
    figma.ui.postMessage({ 
      type: 'slide-progress', 
      data: { step: 'text-updated' }
    });
    
    // Step 3: Replace profile image (if provided)
    if (data.auditorData.profileImageBytes) {
      await replaceProfileImage(newSlide, data.auditorData.profileImageBytes);
      figma.ui.postMessage({ 
        type: 'slide-progress', 
        data: { step: 'profile-image-replaced' }
      });
    }
    
    // Step 4: Place logos (if provided)
    if (data.logoData && data.logoData.length > 0) {
      await placeLogosInSlide(newSlide, data.logoData);
      figma.ui.postMessage({ 
        type: 'slide-progress', 
        data: { step: 'logos-placed' }
      });
    }
    
    // Focus on new slide
    figma.viewport.scrollAndZoomIntoView([newSlide]);
    figma.currentPage.selection = [newSlide];
    
    figma.ui.postMessage({
      type: 'slide-generated',
      data: {
        success: true,
        slideName: newSlide.name,
        message: `Slide generated for ${data.auditorData.name}!`
      }
    });
    
  } catch (error) {
    figma.ui.postMessage({
      type: 'slide-generated',
      data: {
        success: false,
        error: error.message
      }
    });
  }
}

// Find template frame (selected or first frame)
function findTemplateFrame() {
  // Check selected first
  if (figma.currentPage.selection.length === 1) {
    const selected = figma.currentPage.selection[0];
    if (selected.type === 'FRAME') {
      return selected;
    }
  }
  
  // Find first frame on page
  const frames = figma.currentPage.children.filter(child => child.type === 'FRAME');
  return frames.length > 0 ? frames[0] : null;
}

// Duplicate template frame with proper naming
async function duplicateTemplateFrame(template, protocolName, auditorName) {
  const newFrame = template.clone();
  
  // Generate timestamp and name
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 16);
  newFrame.name = `${timestamp} ${protocolName} ${auditorName}`;
  
  // Position next to template
  newFrame.x = template.x + template.width + 100;
  newFrame.y = template.y;
  
  figma.currentPage.appendChild(newFrame);
  
  return newFrame;
}

// Update all text layers in slide
async function updateSlideTextLayers(slide, auditorData, manualInputs, protocolName) {
  // Build vulnerabilities summary
  const vulnParts = [];
  if (auditorData.achievements && auditorData.achievements.highsFound) vulnParts.push(`${auditorData.achievements.highsFound} highs found`);
  if (auditorData.achievements && auditorData.achievements.soloHighs) vulnParts.push(`${auditorData.achievements.soloHighs} solo highs found`);
  if (auditorData.achievements && auditorData.achievements.mediumsFound) vulnParts.push(`${auditorData.achievements.mediumsFound} mediums found`);
  if (auditorData.achievements && auditorData.achievements.soloMediums) vulnParts.push(`${auditorData.achievements.soloMediums} solo mediums found`);
  const vulnerabilitiesSummary = vulnParts.join(', ');
  
  // Text mapping based on layer names
  const textMappings = [
    { targetName: 'auditor-name', content: auditorData.name },
    { targetName: 'subheading', content: manualInputs.subheading || '' },
    { targetName: 'description', content: manualInputs.description || '' },
    { targetName: 'achievement-1', content: auditorData.achievements && auditorData.achievements.rankings || '' },
    { targetName: 'achievement-2', content: auditorData.achievements && auditorData.achievements.earnings || '' },
    { targetName: 'achievement-3', content: vulnerabilitiesSummary },
    { targetName: 'achievement-4', content: manualInputs.achievement4 || '' },
    { targetName: 'goodfit-1', content: manualInputs.goodfit1 || '' },
    { targetName: 'goodfit-2', content: manualInputs.goodfit2 || '' },
    { targetName: 'goodfit-3', content: manualInputs.goodfit3 || '' },
    { targetName: 'title', content: `Why ${auditorData.name} Is a Great Fit for ${protocolName}?` },
    { targetName: 'slide-title', content: `Why ${auditorData.name} Is a Great Fit for ${protocolName}?` }
  ];
  
  // Update each text layer
  let updatedCount = 0;
  
  for (const mapping of textMappings) {
    if (mapping.content) {
      console.log(`🎯 Trying to update "${mapping.targetName}" with: "${mapping.content}"`);
      const updated = await updateTextInNode(slide, mapping.targetName, mapping.content);
      if (updated) {
        updatedCount++;
        console.log(`✅ Successfully updated "${mapping.targetName}"`);
      } else {
        console.log(`❌ Could not find text layer for "${mapping.targetName}"`);
      }
    } else {
      console.log(`⏭️  Skipping "${mapping.targetName}" - no content provided`);
    }
  }
  
}

// Recursively find and update text nodes
async function updateTextInNode(node, targetName, newText) {
  if (node.type === 'TEXT' && node.name.toLowerCase().includes(targetName.toLowerCase())) {
    try {
      await figma.loadFontAsync(node.fontName);
      node.characters = newText;
      return true;
    } catch (error) {
      console.error(`Failed to update text "${targetName}":`, error.message);
      return false;
    }
  }
  
  // Search children
  if ('children' in node) {
    for (const child of node.children) {
      if (await updateTextInNode(child, targetName, newText)) {
        return true;
      }
    }
  }
  
  return false;
}

// Replace profile image
async function replaceProfileImage(slide, imageBytes) {
  try {
    // Look for profile image containers with multiple name patterns
    let imageNode = findImageNode(slide, 'profile') || 
                   findImageNode(slide, 'profilepicture') ||
                   findImageNode(slide, 'auditor-image') ||
                   findImageNode(slide, 'photo');
    
    if (!imageNode) {
      console.log('⚠️ Profile image container not found. Looking for any rectangle/ellipse to use...');
      imageNode = findFirstImageContainer(slide);
    }
    
    if (!imageNode) {
      console.log('❌ No suitable image container found for profile picture');
      return;
    }
    
    const imageHash = figma.createImage(imageBytes).hash;
    
    if (imageNode.type === 'RECTANGLE' || imageNode.type === 'ELLIPSE') {
      imageNode.fills = [{
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: imageHash
      }];
      console.log(`✅ Profile image updated in "${imageNode.name}"`);
    }
  } catch (error) {
    console.error('❌ Failed to replace profile image:', error);
  }
}

// Place logos in slide
async function placeLogosInSlide(slide, logoData) {
  try {
    const logoContainers = findLogoContainers(slide, logoData.length);
    
    for (let i = 0; i < Math.min(logoData.length, logoContainers.length); i++) {
      const container = logoContainers[i];
      const logo = logoData[i];
      
      if (logo.imageBytes) {
        const imageHash = figma.createImage(logo.imageBytes).hash;
        
        if (container.type === 'RECTANGLE' || container.type === 'ELLIPSE') {
          container.fills = [{
            type: 'IMAGE',
            scaleMode: 'FIT',
            imageHash: imageHash
          }];
        }
      }
    }
    
    console.log(`✅ Placed ${Math.min(logoData.length, logoContainers.length)} logos`);
  } catch (error) {
    console.error('❌ Failed to place logos:', error);
  }
}

// Find image node by name pattern
function findImageNode(node, namePattern) {
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

// Find first suitable image container if specific ones aren't found
function findFirstImageContainer(node) {
  if ((node.type === 'RECTANGLE' || node.type === 'ELLIPSE') && 
      node.width > 50 && node.height > 50) { // Reasonable size for profile pic
    return node;
  }
  
  if ('children' in node) {
    for (const child of node.children) {
      const found = findFirstImageContainer(child);
      if (found) return found;
    }
  }
  
  return null;
}

// Find logo containers
function findLogoContainers(slide, maxCount) {
  const containers = [];
  
  function searchForLogos(node) {
    if (node.name.toLowerCase().includes('logo')) {
      containers.push(node);
    }
    
    if ('children' in node) {
      for (const child of node.children) {
        searchForLogos(child);
      }
    }
  }
  
  searchForLogos(slide);
  
  // Sort by position
  containers.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 10) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
  
  return containers.slice(0, maxCount);
}

// Analyze template structure
function analyzeTemplateStructure(frame) {
  const textNodes = [];
  const imageNodes = [];
  const logoNodes = [];
  
  function traverseNode(node) {
    if (node.type === 'TEXT') {
      textNodes.push({
        name: node.name,
        content: node.characters
      });
    } else if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
      if (node.name.toLowerCase().includes('logo')) {
        logoNodes.push({
          name: node.name,
          type: node.type
        });
      } else {
        const fills = node.fills;
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