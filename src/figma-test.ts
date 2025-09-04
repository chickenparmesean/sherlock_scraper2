import FigmaClient from './figma-client';

/**
 * Test script for Figma slide generation
 * Replace TEMPLATE_FILE_KEY with your actual Figma template file key
 */

const TEMPLATE_FILE_KEY = 'YOUR_FIGMA_TEMPLATE_FILE_KEY'; // Replace with your template file key

async function testFigmaIntegration() {
  try {
    console.log('🚀 Testing Figma API integration...');
    
    const figma = new FigmaClient();

    // Test 1: Get original template file
    console.log('\n📄 Fetching template file...');
    const templateFile = await figma.getFigmaFile(TEMPLATE_FILE_KEY);
    console.log(`Template: "${templateFile.name}" (${templateFile.version})`);

    // Test 2: Log file structure to understand layout
    console.log('\n🔍 Template file structure:');
    figma.logFileStructure(templateFile.document);

    // Test 3: Create a duplicate
    console.log('\n📋 Creating slide copy...');
    const newFileKey = await figma.duplicateFigmaFile(
      TEMPLATE_FILE_KEY, 
      `Test Slide - ${new Date().toISOString().split('T')[0]}`
    );
    console.log(`✅ New slide created with key: ${newFileKey}`);

    // Test 4: Find specific layers in the template
    console.log('\n🔎 Searching for common layer names...');
    const commonLayerNames = ['title', 'name', 'auditor', 'text', 'logo', 'profile'];
    
    for (const layerName of commonLayerNames) {
      const layer = figma.findLayer(templateFile.document, layerName);
      if (layer) {
        console.log(`Found layer: "${layer.name}" (${layer.type}) - ID: ${layer.id}`);
      } else {
        console.log(`No layer found matching: "${layerName}"`);
      }
    }

    // Test 5: Look for text layers specifically
    console.log('\n📝 Finding all text layers...');
    const textLayers = figma.findLayers(templateFile.document, '').filter(node => node.type === 'TEXT');
    if (textLayers.length > 0) {
      console.log(`Found ${textLayers.length} text layers:`);
      textLayers.forEach(layer => {
        console.log(`  - "${layer.name}" (ID: ${layer.id})`);
        if (layer.characters) {
          console.log(`    Current text: "${layer.characters}"`);
        }
      });
    } else {
      console.log('No text layers found');
    }

    // Test 6: Look for image/rectangle layers that might contain images
    console.log('\n🖼️  Finding potential image containers...');
    const imageLayers = figma.findLayers(templateFile.document, '').filter(node => 
      node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'FRAME'
    );
    console.log(`Found ${imageLayers.length} potential image containers:`);
    imageLayers.slice(0, 10).forEach(layer => { // Show first 10 to avoid spam
      console.log(`  - "${layer.name}" (${layer.type}) - ID: ${layer.id}`);
    });

    console.log('\n✅ Figma integration test completed successfully!');
    console.log(`\n📌 Next steps:`);
    console.log(`1. Update TEMPLATE_FILE_KEY in figma-test.ts with your actual template`);
    console.log(`2. Identify the specific layer IDs for text and image updates`);
    console.log(`3. Test text updates with updateText() method`);
    console.log(`4. Test image replacements with replaceImage() method`);

  } catch (error) {
    console.error('❌ Figma test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('FIGMA_TOKEN')) {
        console.log('\n💡 Make sure FIGMA_TOKEN is set in your environment variables');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.log('\n💡 Check that your Figma token has access to the file');
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log('\n💡 Verify the TEMPLATE_FILE_KEY is correct');
      }
    }
  }
}

/**
 * Example usage for slide generation workflow
 */
async function generateSlideExample() {
  try {
    const figma = new FigmaClient();
    
    // Step 1: Create new slide from template
    const newSlideKey = await figma.duplicateFigmaFile(
      TEMPLATE_FILE_KEY,
      'Auditor Slide - John Doe'
    );
    
    // Step 2: Update text content (replace with actual node IDs from your template)
    const textUpdates = {
      'AUDITOR_NAME_NODE_ID': 'John Doe',
      'EARNINGS_NODE_ID': '$520K+',
      'RANKINGS_NODE_ID': '1st place, 5x 2nd, 4x 3rd in contests',
      'HIGHS_NODE_ID': '15',
      'MEDIUMS_NODE_ID': '23'
    };
    
    await figma.updateMultipleTexts(newSlideKey, textUpdates);
    
    // Step 3: Replace profile image (replace with actual node ID)
    await figma.replaceImage(
      newSlideKey, 
      'PROFILE_IMAGE_NODE_ID', 
      'https://example.com/profile-image.png'
    );
    
    console.log(`✅ Slide generated successfully: ${newSlideKey}`);
    
  } catch (error) {
    console.error('❌ Slide generation failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testFigmaIntegration();
}

export { testFigmaIntegration, generateSlideExample };