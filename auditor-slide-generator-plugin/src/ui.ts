// Auditor Slide Generator - UI Script
// Handles all UI interactions and messaging with the main plugin

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

interface LogoItem {
  id: string;
  name: string;
  url: string;
  category: string;
}

// UI State Management
let uiLogoDatabase: LogoItem[] = [];
let uiSelectedLogos: LogoItem[] = [];
let uiCurrentLayout: '3' | '4' | '6' = '3';
let uiIsGenerating = false;
let uiCurrentTemplate: string | null = null;

// Initialize UI when loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Auditor Slide Generator UI loaded');
  
  // Load logo database
  loadLogoDatabase();
  
  // Set up collapsible sections
  setupCollapsibleSections();
  
  // Set up file input for logo uploads
  setupFileInput();
});

// Handle messages from plugin
window.onmessage = (event) => {
  const { type, message, data } = event.data.pluginMessage || {};

  switch (type) {
    case 'status':
      showStatus(message, 'loading');
      updateProgress();
      break;

    case 'success':
      showStatus(message, 'success');
      updateGenerateButton(false);
      showProgress(100);
      uiIsGenerating = false;
      displaySuccessResult(data);
      break;

    case 'error':
      showStatus(message, 'error');
      updateGenerateButton(false);
      hideProgress();
      uiIsGenerating = false;
      break;

    case 'template-analysis':
      displayTemplateAnalysis(data);
      hideStatus();
      break;

    case 'scraper-test-result':
      displayScraperTestResult(data);
      break;

    case 'logo-database-loaded':
      uiLogoDatabase = data;
      renderLogoGrid();
      break;

    case 'logo-saved':
      uiLogoDatabase.push(data);
      renderLogoGrid();
      showStatus('Logo saved successfully!', 'success');
      break;

    case 'logo-deleted':
      uiLogoDatabase = uiLogoDatabase.filter(logo => logo.id !== data.logoId);
      uiSelectedLogos = uiSelectedLogos.filter(logo => logo.id !== data.logoId);
      renderLogoGrid();
      updateLogoCounter();
      showStatus('Logo deleted successfully!', 'success');
      break;

    case 'template-set':
      uiCurrentTemplate = data.templateName;
      showTemplateInfo(data.templateName);
      showStatus('Template set successfully!', 'success');
      break;

    default:
      console.log('Unknown message type:', type);
  }
};

// Set template frame
function setTemplate() {
  postMessage({ type: 'set-template' });
}

// Analyze template structure
function analyzeTemplate() {
  showStatus('Analyzing template structure...', 'loading');
  postMessage({ type: 'analyze-template' });
}

// Test scraper with current URL
function testScraper() {
  const auditorUrl = (document.getElementById('auditorUrl') as HTMLInputElement).value.trim();
  if (!auditorUrl) {
    showStatus('Please enter an auditor URL first', 'error');
    return;
  }

  showStatus('Testing scraper connection...', 'loading');
  postMessage({ 
    type: 'test-scraper',
    data: { auditorUrl }
  });
}

// Generate slide
function generateSlide() {
  if (uiIsGenerating) return;

  const auditorUrl = (document.getElementById('auditorUrl') as HTMLInputElement).value.trim();
  const protocolName = (document.getElementById('protocolName') as HTMLInputElement).value.trim();

  if (!auditorUrl || !protocolName) {
    showStatus('Please fill in Auditor URL and Protocol Name', 'error');
    return;
  }

  const manualInputs = {
    subheading: (document.getElementById('subheading') as HTMLInputElement).value.trim(),
    description: (document.getElementById('description') as HTMLTextAreaElement).value.trim(),
    achievement4: (document.getElementById('achievement4') as HTMLTextAreaElement).value.trim(),
    goodfit1: (document.getElementById('goodfit1') as HTMLTextAreaElement).value.trim(),
    goodfit2: (document.getElementById('goodfit2') as HTMLTextAreaElement).value.trim(),
    goodfit3: (document.getElementById('goodfit3') as HTMLTextAreaElement).value.trim()
  };

  uiIsGenerating = true;
  updateGenerateButton(true);
  showProgress(0);

  postMessage({ 
    type: 'generate-slide',
    data: {
      auditorUrl,
      protocolName,
      manualInputs,
      uiSelectedLogos,
      logoLayout: uiCurrentLayout
    }
  });
}

// Logo management functions
function loadLogoDatabase() {
  postMessage({ type: 'load-logo-database' });
}

function selectLayout(layout: '3' | '4' | '6') {
  uiCurrentLayout = layout;
  
  // Update UI
  document.querySelectorAll('.layout-option').forEach(option => {
    option.classList.remove('selected');
  });
  document.querySelector(`[data-layout="${layout}"]`)?.classList.add('selected');
  
  // Clear selection if it exceeds new layout limit
  const maxLogos = parseInt(layout);
  if (uiSelectedLogos.length > maxLogos) {
    uiSelectedLogos = uiSelectedLogos.slice(0, maxLogos);
    renderLogoGrid();
    updateLogoCounter();
  }
}

function toggleLogoSelection(logo: LogoItem) {
  const maxLogos = parseInt(uiCurrentLayout);
  const index = uiSelectedLogos.findIndex(l => l.id === logo.id);
  
  if (index >= 0) {
    // Remove from selection
    uiSelectedLogos.splice(index, 1);
  } else if (uiSelectedLogos.length < maxLogos) {
    // Add to selection
    uiSelectedLogos.push(logo);
  } else {
    showStatus(`Maximum ${maxLogos} logos allowed for this layout`, 'error');
    return;
  }
  
  renderLogoGrid();
  updateLogoCounter();
}

function renderLogoGrid() {
  const grid = document.getElementById('logoGrid');
  if (!grid) return;

  const searchTerm = (document.getElementById('logoSearch') as HTMLInputElement).value.toLowerCase();
  const filteredLogos = uiLogoDatabase.filter(logo => 
    logo.name.toLowerCase().includes(searchTerm) ||
    logo.category.toLowerCase().includes(searchTerm)
  );

  grid.innerHTML = filteredLogos.map(logo => `
    <div class="logo-item ${uiSelectedLogos.find(l => l.id === logo.id) ? 'selected' : ''}" 
         onclick="toggleLogoSelection(${JSON.stringify(logo).replace(/"/g, '&quot;')})">
      <img src="${logo.url}" alt="${logo.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEM5LjQ5IDIwIDIwIDkuNDkgMjAgMjBaIiBmaWxsPSIjQ0NDIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSI+TG9nbzwvdGV4dD4KPHN2Zz4K'" />
      <div class="name">${logo.name}</div>
      <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); deleteLogo('${logo.id}')" style="margin-top: 4px;">
        🗑️
      </button>
    </div>
  `).join('');
}

function filterLogos() {
  renderLogoGrid();
}

function updateLogoCounter() {
  const counter = document.getElementById('logoCounter');
  if (counter) {
    counter.textContent = `${uiSelectedLogos.length} selected`;
  }
}

function setupFileInput() {
  // Create hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.png,.svg,.jpg,.jpeg';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  fileInput.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      handleLogoFile(file);
    }
  });

  // Store reference for uploadLogo function
  (window as any).fileInput = fileInput;
}

function uploadLogo() {
  (window as any).fileInput.click();
}

function handleLogoDrop(event: DragEvent) {
  event.preventDefault();
  const uploadArea = event.target as HTMLElement;
  uploadArea.classList.remove('dragover');

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    handleLogoFile(files[0]);
  }
}

function handleLogoDragOver(event: DragEvent) {
  event.preventDefault();
  const uploadArea = event.target as HTMLElement;
  uploadArea.classList.add('dragover');
}

function handleLogoDragLeave(event: DragEvent) {
  const uploadArea = event.target as HTMLElement;
  uploadArea.classList.remove('dragover');
}

function handleLogoFile(file: File) {
  if (!file.type.match(/^image\/(png|svg\+xml|jpeg)$/)) {
    showStatus('Please upload PNG, SVG, or JPEG files only', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const logoName = prompt('Enter logo name:', file.name.replace(/\.[^/.]+$/, ''));
    if (!logoName) return;

    const logoCategory = prompt('Enter logo category (e.g., DeFi, Exchange):', 'DeFi') || 'DeFi';

    const logoData: LogoItem = {
      id: generateId(),
      name: logoName,
      url: e.target?.result as string,
      category: logoCategory
    };

    postMessage({
      type: 'save-logo',
      data: logoData
    });
  };
  reader.readAsDataURL(file);
}

function deleteLogo(logoId: string) {
  if (confirm('Are you sure you want to delete this logo?')) {
    postMessage({
      type: 'delete-logo',
      data: { logoId }
    });
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Collapsible sections
function setupCollapsibleSections() {
  document.querySelectorAll('.collapsible').forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
    });
  });
}

// Template info display
function showTemplateInfo(templateName: string) {
  const info = document.getElementById('templateInfo');
  const nameSpan = document.getElementById('templateName');
  if (info && nameSpan) {
    nameSpan.textContent = templateName;
    info.classList.remove('hidden');
  }
}

// Status and progress management
function showStatus(message: string, type: 'loading' | 'success' | 'error') {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.className = `status ${type}`;
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
  }
}

function hideStatus() {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.classList.add('hidden');
  }
}

function updateGenerateButton(disabled: boolean) {
  const btn = document.getElementById('generateBtn') as HTMLButtonElement;
  if (btn) {
    btn.disabled = disabled;
    btn.textContent = disabled ? '🔄 Generating...' : '🎨 Generate Slide';
  }
}

function showProgress(percent: number) {
  const container = document.getElementById('progressContainer');
  const fill = document.getElementById('progressFill');
  if (container && fill) {
    container.classList.remove('hidden');
    fill.style.width = `${percent}%`;
  }
}

function hideProgress() {
  const container = document.getElementById('progressContainer');
  if (container) {
    container.classList.add('hidden');
  }
}

function updateProgress() {
  const messages = [
    'Starting slide generation...',
    'Template validated. Fetching auditor data...',
    'Auditor data loaded',
    'Creating slide...',
    'Updating text content...',
    'Placing logos...',
    'Replacing profile image...'
  ];
  
  const currentMessage = document.getElementById('status')?.textContent || '';
  const index = messages.findIndex(msg => currentMessage.includes(msg.split('.')[0]));
  const percent = index >= 0 ? ((index + 1) / messages.length) * 90 : 50;
  
  showProgress(percent);
}

// Display functions
function displayTemplateAnalysis(analysis: any) {
  const container = document.getElementById('templateAnalysis');
  if (!container) return;
  
  let html = `
    <div class="analysis-result">
      <h4>📋 Template Analysis: ${analysis.frameName}</h4>
      
      <div style="margin: 8px 0;">
        <strong>📝 Text Layers (${analysis.textNodes.length} found):</strong>
        ${analysis.textNodes.slice(0, 6).map((node: any) => `
          <div class="analysis-item">
            <strong>${node.name}</strong><br>
            <em>"${node.content.slice(0, 40)}${node.content.length > 40 ? '...' : ''}"</em>
          </div>
        `).join('')}
        ${analysis.textNodes.length > 6 ? `<div class="field-help">...and ${analysis.textNodes.length - 6} more</div>` : ''}
      </div>
      
      <div style="margin: 8px 0;">
        <strong>🖼️ Image Containers (${analysis.imageNodes.length} found):</strong>
        ${analysis.imageNodes.slice(0, 4).map((node: any) => `
          <div class="analysis-item">
            <strong>${node.name}</strong> (${node.type})
          </div>
        `).join('')}
        ${analysis.imageNodes.length > 4 ? `<div class="field-help">...and ${analysis.imageNodes.length - 4} more</div>` : ''}
      </div>
      
      <div style="margin: 8px 0;">
        <strong>🏢 Logo Containers (${analysis.logoNodes.length} found):</strong>
        ${analysis.logoNodes.map((node: any) => `
          <div class="analysis-item">
            <strong>${node.name}</strong> (${node.type})
          </div>
        `).join('')}
      </div>
      
      <div class="field-help" style="margin-top: 8px;">
        Total nodes: ${analysis.totalNodes}. Template ready for slide generation!
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  container.classList.remove('hidden');
}

function displayScraperTestResult(result: any) {
  if (result.success) {
    const data = result.auditorData;
    showStatus(`✅ Scraper test successful! Found: ${data.name}, ${data.achievements?.earnings || 'N/A'} earnings`, 'success');
  } else {
    showStatus(`❌ Scraper test failed: ${result.error}`, 'error');
  }
}

function displaySuccessResult(data: any) {
  // Could add additional success display logic here
  updateLogoCounter();
}

// Helper function to send messages to plugin
function postMessage(message: any) {
  parent.postMessage({ pluginMessage: message }, '*');
}

// Make functions globally available
(window as any).setTemplate = setTemplate;
(window as any).analyzeTemplate = analyzeTemplate;
(window as any).testScraper = testScraper;
(window as any).generateSlide = generateSlide;
(window as any).selectLayout = selectLayout;
(window as any).toggleLogoSelection = toggleLogoSelection;
(window as any).filterLogos = filterLogos;
(window as any).uploadLogo = uploadLogo;
(window as any).handleLogoDrop = handleLogoDrop;
(window as any).handleLogoDragOver = handleLogoDragOver;
(window as any).handleLogoDragLeave = handleLogoDragLeave;
(window as any).deleteLogo = deleteLogo;