"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigmaClient = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
class FigmaClient {
    constructor() {
        this.baseUrl = 'https://api.figma.com/v1';
        this.token = process.env.FIGMA_TOKEN || '';
        if (!this.token) {
            throw new Error('FIGMA_TOKEN environment variable is required');
        }
    }
    async makeRequest(endpoint, method = 'GET', data) {
        const headers = {
            'X-Figma-Token': this.token,
            'Content-Type': 'application/json'
        };
        if (data instanceof form_data_1.default) {
            headers['Content-Type'] = 'multipart/form-data';
        }
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers,
            data
        };
        try {
            const response = await (0, axios_1.default)(config);
            return response;
        }
        catch (error) {
            console.error('Figma API request failed:', error.response?.data || error.message);
            throw new Error(`Figma API Error: ${error.response?.data?.err || error.message}`);
        }
    }
    /**
     * Get a Figma file by its key
     */
    async getFigmaFile(fileKey) {
        const response = await this.makeRequest(`/files/${fileKey}`);
        return response.data;
    }
    /**
     * Note: File duplication is not supported by Figma REST API
     * Only Plugin API supports creating/duplicating files
     * Working directly with template file instead
     */
    /**
     * Find a layer/node in the Figma file by name (recursive search)
     */
    findLayer(node, targetName) {
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
    findLayers(node, pattern) {
        const results = [];
        const search = (currentNode) => {
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
    async updateText(fileKey, nodeId, newText) {
        const requestBody = {
            [nodeId]: {
                characters: newText
            }
        };
        try {
            const response = await this.makeRequest(`/files/${fileKey}/nodes`, 'PUT', requestBody);
            return response.status === 200;
        }
        catch (error) {
            console.error('Failed to update text:', error);
            return false;
        }
    }
    /**
     * Replace an image in a Figma file
     */
    async replaceImage(fileKey, nodeId, imageUrl) {
        try {
            // First, upload the image to Figma
            const imageResponse = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data);
            const formData = new form_data_1.default();
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
        }
        catch (error) {
            console.error('Failed to replace image:', error);
            return false;
        }
    }
    /**
     * Get file information including node structure
     */
    async getFileNodes(fileKey, nodeIds) {
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
    async exportNodes(fileKey, nodeIds, format = 'png', scale = 1) {
        const endpoint = `/images/${fileKey}?ids=${nodeIds.join(',')}&format=${format}&scale=${scale}`;
        const response = await this.makeRequest(endpoint);
        return response.data;
    }
    /**
     * Batch update multiple text nodes
     */
    async updateMultipleTexts(fileKey, updates) {
        const requestBody = {};
        for (const [nodeId, text] of Object.entries(updates)) {
            requestBody[nodeId] = {
                characters: text
            };
        }
        try {
            const response = await this.makeRequest(`/files/${fileKey}/nodes`, 'PUT', requestBody);
            return response.status === 200;
        }
        catch (error) {
            console.error('Failed to update multiple texts:', error);
            return false;
        }
    }
    /**
     * Update slide content directly in template file
     * Note: REST API cannot duplicate files, so we work with existing template
     */
    async updateSlideContent(templateFileKey, auditorData, manualInputs, protocolName) {
        try {
            // Prepare text updates based on CSV mapping
            const textUpdates = {};
            // Auto-populated from scraper
            if (auditorData.name)
                textUpdates['1:9'] = auditorData.name;
            if (auditorData.achievements?.rankings)
                textUpdates['1:14'] = auditorData.achievements.rankings;
            if (auditorData.achievements?.earnings)
                textUpdates['1:62'] = auditorData.achievements.earnings;
            // Build vulnerabilities summary
            const vulnParts = [];
            if (auditorData.achievements?.highsFound)
                vulnParts.push(`${auditorData.achievements.highsFound} highs found`);
            if (auditorData.achievements?.soloHighs)
                vulnParts.push(`${auditorData.achievements.soloHighs} solo highs found`);
            if (auditorData.achievements?.mediumsFound)
                vulnParts.push(`${auditorData.achievements.mediumsFound} mediums found`);
            if (auditorData.achievements?.soloMediums)
                vulnParts.push(`${auditorData.achievements.soloMediums} solo mediums found`);
            if (vulnParts.length > 0)
                textUpdates['1:64'] = vulnParts.join(', ');
            // Manual inputs from UI
            if (manualInputs.subheading)
                textUpdates['1:10'] = manualInputs.subheading;
            if (manualInputs.description)
                textUpdates['1:11'] = manualInputs.description;
            if (manualInputs.achievement4)
                textUpdates['1:66'] = manualInputs.achievement4;
            if (manualInputs.goodfit1)
                textUpdates['1:15'] = manualInputs.goodfit1;
            if (manualInputs.goodfit2)
                textUpdates['1:68'] = manualInputs.goodfit2;
            if (manualInputs.goodfit3)
                textUpdates['1:70'] = manualInputs.goodfit3;
            // Protocol name replacement in title
            if (protocolName) {
                const titleText = `Why ${auditorData.name || 'Auditor'} Is a Great Fit for ${protocolName}?`;
                textUpdates['1:18'] = titleText;
            }
            console.log('🎯 Updating text layers:', Object.keys(textUpdates).length, 'updates');
            console.log('📝 Text updates:', textUpdates);
            // Update all text fields in the template
            const textUpdateSuccess = await this.updateMultipleTexts(templateFileKey, textUpdates);
            if (!textUpdateSuccess) {
                throw new Error('Failed to update text layers');
            }
            // Replace profile image if available
            if (auditorData.profileImageUrl) {
                console.log('🖼️ Replacing profile image:', auditorData.profileImageUrl);
                await this.replaceImage(templateFileKey, '1:6', auditorData.profileImageUrl);
            }
            return {
                success: true,
                fileKey: templateFileKey // Return the template file key since we're working with it directly
            };
        }
        catch (error) {
            console.error('❌ Slide update failed:', error);
            return {
                success: false,
                fileKey: templateFileKey,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Helper method to traverse and log file structure for debugging
     */
    logFileStructure(node, indent = '') {
        console.log(`${indent}${node.name} (${node.type}) - ID: ${node.id}`);
        if (node.children) {
            node.children.forEach(child => {
                this.logFileStructure(child, indent + '  ');
            });
        }
    }
}
exports.FigmaClient = FigmaClient;
exports.default = FigmaClient;
//# sourceMappingURL=figma-client.js.map