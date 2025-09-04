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
declare let uiLogoDatabase: LogoItem[];
declare let uiSelectedLogos: LogoItem[];
declare let uiCurrentLayout: '3' | '4' | '6';
declare let uiIsGenerating: boolean;
declare let uiCurrentTemplate: string | null;
declare function setTemplate(): void;
declare function analyzeTemplate(): void;
declare function testScraper(): void;
declare function generateSlide(): void;
declare function loadLogoDatabase(): void;
declare function selectLayout(layout: '3' | '4' | '6'): void;
declare function toggleLogoSelection(logo: LogoItem): void;
declare function renderLogoGrid(): void;
declare function filterLogos(): void;
declare function updateLogoCounter(): void;
declare function setupFileInput(): void;
declare function uploadLogo(): void;
declare function handleLogoDrop(event: DragEvent): void;
declare function handleLogoDragOver(event: DragEvent): void;
declare function handleLogoDragLeave(event: DragEvent): void;
declare function handleLogoFile(file: File): void;
declare function deleteLogo(logoId: string): void;
declare function generateId(): string;
declare function setupCollapsibleSections(): void;
declare function showTemplateInfo(templateName: string): void;
declare function showStatus(message: string, type: 'loading' | 'success' | 'error'): void;
declare function hideStatus(): void;
declare function updateGenerateButton(disabled: boolean): void;
declare function showProgress(percent: number): void;
declare function hideProgress(): void;
declare function updateProgress(): void;
declare function displayTemplateAnalysis(analysis: any): void;
declare function displayScraperTestResult(result: any): void;
declare function displaySuccessResult(data: any): void;
