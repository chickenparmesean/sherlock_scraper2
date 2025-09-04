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
export declare class FigmaClient {
    private token;
    private baseUrl;
    constructor();
    private makeRequest;
    /**
     * Get a Figma file by its key
     */
    getFigmaFile(fileKey: string): Promise<FigmaFile>;
    /**
     * Duplicate a Figma file to create a new copy
     */
    duplicateFigmaFile(templateFileKey: string, newFileName?: string): Promise<string>;
    /**
     * Find a layer/node in the Figma file by name (recursive search)
     */
    findLayer(node: FigmaNode, targetName: string): FigmaNode | null;
    /**
     * Find multiple layers by name pattern
     */
    findLayers(node: FigmaNode, pattern: string): FigmaNode[];
    /**
     * Update text content of a text layer
     */
    updateText(fileKey: string, nodeId: string, newText: string): Promise<boolean>;
    /**
     * Replace an image in a Figma file
     */
    replaceImage(fileKey: string, nodeId: string, imageUrl: string): Promise<boolean>;
    /**
     * Get file information including node structure
     */
    getFileNodes(fileKey: string, nodeIds?: string[]): Promise<any>;
    /**
     * Export nodes as images
     */
    exportNodes(fileKey: string, nodeIds: string[], format?: 'png' | 'jpg' | 'svg', scale?: number): Promise<any>;
    /**
     * Batch update multiple text nodes
     */
    updateMultipleTexts(fileKey: string, updates: Record<string, string>): Promise<boolean>;
    /**
     * Helper method to traverse and log file structure for debugging
     */
    logFileStructure(node: FigmaNode, indent?: string): void;
}
export default FigmaClient;
//# sourceMappingURL=figma-client.d.ts.map