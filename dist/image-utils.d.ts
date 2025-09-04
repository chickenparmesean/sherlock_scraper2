import { ImageConversionResult } from './types';
/**
 * Utility class for image processing operations
 */
export declare class ImageUtils {
    /**
     * Converts an image URL to a base64 data URL
     * @param imageUrl - The image URL to convert
     * @param timeout - Request timeout in milliseconds
     * @returns Promise resolving to conversion result
     */
    static convertToBase64(imageUrl: string, timeout?: number): Promise<ImageConversionResult>;
    /**
     * Processes and normalizes image URLs from HTML
     * @param src - The src attribute from an img tag
     * @param baseUrl - The base URL for resolving relative URLs
     * @returns Normalized absolute URL or null if invalid
     */
    static processImageUrl(src: string, baseUrl: string): string | null;
    /**
     * Validates if a URL points to an image
     * @param url - URL to validate
     * @returns true if URL appears to be an image
     */
    static isImageUrl(url: string): boolean;
    /**
     * Estimates the file size of a base64 data URL
     * @param dataUrl - Base64 data URL
     * @returns Estimated size in bytes
     */
    static estimateDataUrlSize(dataUrl: string): number;
}
//# sourceMappingURL=image-utils.d.ts.map