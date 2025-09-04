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
     * Duplicate a Figma file to create a new copy
     */
    async duplicateFigmaFile(templateFileKey, newFileName) {
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = newFileName || `Slide Copy - ${timestamp}`;
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