import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';

interface FigmaFile {
  document: any;
  components: any;
  schemaVersion: number;
  styles: any;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  characters?: string;
  fills?: any[];
  [key: string]: any;
}

interface FigmaResponse {
  err?: string;
  [key: string]: any;
}

export class FigmaClient {
  private token: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor() {
    this.token = process.env.FIGMA_TOKEN || '';
    if (!this.token) {
      throw new Error('FIGMA_TOKEN environment variable is required');
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<AxiosResponse> {
    const headers: any = {
      'X-Figma-Token': this.token,
      'Content-Type': 'application/json'
    };

    if (data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }

    const config = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers,
      data
    };

    try {
      const response = await axios(config);
      return response;
    } catch (error: any) {
      console.error('Figma API request failed:', error.response?.data || error.message);
      throw new Error(`Figma API Error: ${error.response?.data?.err || error.message}`);
    }
  }

  /**
   * Get a Figma file by its key
   */
  async getFigmaFile(fileKey: string): Promise<FigmaFile> {
    const response = await this.makeRequest(`/files/${fileKey}`);
    return response.data;
  }

  /**
   * Duplicate a Figma file to create a new copy with standardized naming
   */
  async duplicateFigmaFile(templateFileKey: string, protocolName?: string, auditorName?: string): Promise<string> {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19); // 2025-09-04T14-30-45
    
    let fileName: string;
    if (protocolName && auditorName) {
      fileName = `${timestamp} ${protocolName} ${auditorName}`;
    } else {
      fileName = `${timestamp} Slide Copy`;
    }
    
    const requestBody = {
      name: fileName
    };

    const response = await this.makeRequest(`/files/${templateFileKey}/copy`, 'POST', requestBody);
    
    if (response.data.err) {
      throw new Error(`Failed to duplicate file: ${response.data.err}`);
    }
    
    return response.data.key;
  }

  /**
   * Find a layer/node in the Figma file by name (recursive search)
   */
  findLayer(node: FigmaNode, targetName: string): FigmaNode | null {
    // Direct name match
    if (node.name === targetName) {
      return node;
    }

    // Partial name match (case insensitive)
    if (node.name.toLowerCase().includes(targetName.toLowerCase())) {
      return node;
    }

    // Search in children
    if (node.children) {
      for (const child of node.children) {
        const found = this.findLayer(child, targetName);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  /**
   * Find multiple layers by name pattern
   */
  findLayers(node: FigmaNode, pattern: string): FigmaNode[] {
    const results: FigmaNode[] = [];
    
    const search = (currentNode: FigmaNode) => {
      if (currentNode.name.toLowerCase().includes(pattern.toLowerCase())) {
        results.push(currentNode);
      }
      
      if (currentNode.children) {
        currentNode.children.forEach(child => search(child));
      }
    };

    search(node);
    return results;
  }

  /**
   * Update text content of a text layer
   */
  async updateText(fileKey: string, nodeId: string, newText: string): Promise<boolean> {
    const requestBody = {
      [nodeId]: {
        characters: newText
      }
    };

    try {
      const response = await this.makeRequest(`/files/${fileKey}/nodes`, 'PUT', requestBody);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to update text:', error);
      return false;
    }
  }

  /**
   * Replace an image in a Figma file
   */
  async replaceImage(fileKey: string, nodeId: string, imageUrl: string): Promise<boolean> {
    try {
      // First, upload the image to Figma
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);

      const formData = new FormData();
      formData.append('image', imageBuffer, { filename: 'image.png' });

      const uploadResponse = await this.makeRequest('/images', 'POST', formData);
      
      if (!uploadResponse.data.ref) {
        throw new Error('Failed to upload image to Figma');
      }

      // Update the node with the new image reference
      const updateBody = {
        [nodeId]: {
          fills: [{
            type: 'IMAGE',
            imageRef: uploadResponse.data.ref,
            scaleMode: 'FILL'
          }]
        }
      };

      const response = await this.makeRequest(`/files/${fileKey}/nodes`, 'PUT', updateBody);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to replace image:', error);
      return false;
    }
  }

  /**
   * Get file information including node structure
   */
  async getFileNodes(fileKey: string, nodeIds?: string[]): Promise<any> {
    let endpoint = `/files/${fileKey}/nodes`;
    if (nodeIds && nodeIds.length > 0) {
      endpoint += `?ids=${nodeIds.join(',')}`;
    }

    const response = await this.makeRequest(endpoint);
    return response.data;
  }

  /**
   * Export nodes as images
   */
  async exportNodes(fileKey: string, nodeIds: string[], format: 'png' | 'jpg' | 'svg' = 'png', scale: number = 1): Promise<any> {
    const endpoint = `/images/${fileKey}?ids=${nodeIds.join(',')}&format=${format}&scale=${scale}`;
    const response = await this.makeRequest(endpoint);
    return response.data;
  }

  /**
   * Batch update multiple text nodes
   */
  async updateMultipleTexts(fileKey: string, updates: Record<string, string>): Promise<boolean> {
    const requestBody: any = {};
    
    for (const [nodeId, text] of Object.entries(updates)) {
      requestBody[nodeId] = {
        characters: text
      };
    }

    try {
      const response = await this.makeRequest(`/files/${fileKey}/nodes`, 'PUT', requestBody);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to update multiple texts:', error);
      return false;
    }
  }

  /**
   * Generate a complete slide from template with auditor data and manual inputs
   */
  async generateSlide(
    templateFileKey: string,
    auditorData: any,
    manualInputs: Record<string, string>,
    protocolName: string
  ): Promise<{ success: boolean; fileKey?: string; error?: string }> {
    try {
      // Create new slide with proper naming
      const newFileKey = await this.duplicateFigmaFile(
        templateFileKey,
        protocolName,
        auditorData.name
      );

      // Prepare text updates based on CSV mapping
      const textUpdates: Record<string, string> = {};
      
      // Auto-populated from scraper
      if (auditorData.name) textUpdates['1:9'] = auditorData.name;
      if (auditorData.achievements?.rankings) textUpdates['1:14'] = auditorData.achievements.rankings;
      if (auditorData.achievements?.earnings) textUpdates['1:62'] = auditorData.achievements.earnings;
      if (auditorData.achievements?.vulnerabilitiesSummary) textUpdates['1:64'] = auditorData.achievements.vulnerabilitiesSummary;
      
      // Manual inputs from UI
      if (manualInputs.subheading) textUpdates['1:10'] = manualInputs.subheading;
      if (manualInputs.description) textUpdates['1:11'] = manualInputs.description;
      if (manualInputs.achievement4) textUpdates['1:66'] = manualInputs.achievement4;
      if (manualInputs.goodfit1) textUpdates['1:15'] = manualInputs.goodfit1;
      if (manualInputs.goodfit2) textUpdates['1:68'] = manualInputs.goodfit2;
      if (manualInputs.goodfit3) textUpdates['1:70'] = manualInputs.goodfit3;
      
      // Protocol name replacement in title
      if (protocolName) {
        const titleText = `Why ${auditorData.name || 'Auditor'} Is a Great Fit for ${protocolName}?`;
        textUpdates['1:18'] = titleText;
      }
      
      // Update all text fields
      const textUpdateSuccess = await this.updateMultipleTexts(newFileKey, textUpdates);
      
      // Replace profile image if available
      if (auditorData.profileImageUrl) {
        await this.replaceImage(newFileKey, '1:6', auditorData.profileImageUrl);
      }
      
      return {
        success: true,
        fileKey: newFileKey
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Helper method to traverse and log file structure for debugging
   */
  logFileStructure(node: FigmaNode, indent: string = ''): void {
    console.log(`${indent}${node.name} (${node.type}) - ID: ${node.id}`);
    
    if (node.children) {
      node.children.forEach(child => {
        this.logFileStructure(child, indent + '  ');
      });
    }
  }
}

export default FigmaClient;