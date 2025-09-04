import { ImageConversionResult } from './types';

export class ImageUtils {
  static processImageUrl(url: string, baseUrl: string): string {
    // Clean up Next.js optimized URLs to get original image
    if (url.includes('/_next/image')) {
      const urlParams = new URL(url);
      const originalUrl = urlParams.searchParams.get('url');
      if (originalUrl) {
        return decodeURIComponent(originalUrl);
      }
    }
    
    // Handle relative URLs
    if (url.startsWith('/')) {
      return baseUrl + url;
    }
    
    return url;
  }

  static isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) ||
           url.includes('/_next/image') ||
           url.includes('profile') ||
           url.includes('avatar');
  }

  static async convertToBase64(imageUrl: string): Promise<ImageConversionResult> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch image: ${response.status}`
        };
      }
      
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      return {
        success: true,
        dataUrl: `data:${contentType};base64,${base64}`,
        metadata: {
          originalUrl: imageUrl,
          contentType,
          size: buffer.byteLength
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static estimateDataUrlSize(dataUrl: string): number {
    // Rough estimate: base64 encoding adds ~33% overhead
    const base64Part = dataUrl.split(',')[1];
    return base64Part ? (base64Part.length * 3) / 4 : 0;
  }
}