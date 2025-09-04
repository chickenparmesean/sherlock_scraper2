export const defaultConfig = {
    defaultOptions: {
        convertToBase64: false,
        timeout: 30000,
        includeMetadata: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        enableLogging: true
    },
    selectors: {
        imageSelectors: [
            'img[alt*="profile" i]',
            'img[src*="profile" i]',
            '.profile-image img',
            '.avatar img',
            '.user-avatar img',
            'img[class*="avatar" i]',
            'img[class*="profile" i]'
        ],
        baseUrl: 'https://audits.sherlock.xyz'
    }
};
export function isValidSherlockUrl(url) {
    return url.includes('audits.sherlock.xyz/watson/');
}
