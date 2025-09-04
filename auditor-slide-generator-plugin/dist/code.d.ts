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
interface ManualInputs {
    subheading?: string;
    description?: string;
    achievement4?: string;
    goodfit1?: string;
    goodfit2?: string;
    goodfit3?: string;
}
interface LogoItem {
    id: string;
    name: string;
    url: string;
    category: string;
}
interface SlideGenerationRequest {
    auditorUrl: string;
    protocolName: string;
    manualInputs: ManualInputs;
    selectedLogos: LogoItem[];
    logoLayout: '3' | '4' | '6';
}
declare let pluginCurrentTemplate: FrameNode | null;
declare let pluginLogoDatabase: LogoItem[];
declare let pluginIsGenerating: boolean;
declare function handleSlideGeneration(data: SlideGenerationRequest): Promise<void>;
declare function findTemplateFrame(): FrameNode | null;
declare function duplicateTemplateFrame(template: FrameNode, protocolName: string, auditorName: string): Promise<FrameNode>;
declare function updateSlideContent(slide: FrameNode, auditorData: AuditorData, manualInputs: ManualInputs, protocolName: string): Promise<void>;
declare function updateTextInNode(node: BaseNode, targetName: string, newText: string): Promise<boolean>;
declare function placeSlideLogo(slide: FrameNode, logos: LogoItem[], layout: '3' | '4' | '6'): Promise<void>;
declare function findLogoContainers(slide: FrameNode, expectedCount: number): BaseNode[];
declare function replaceProfileImage(slide: FrameNode, imageUrl: string): Promise<void>;
declare function findImageNode(node: BaseNode, namePattern: string): BaseNode | null;
declare function fetchImageAsBytes(url: string): Promise<Uint8Array>;
declare function fetchAuditorData(auditorUrl: string): Promise<AuditorData>;
declare function extractUsernameFromUrl(url: string): string | null;
declare function getApiHost(): Promise<string>;
declare function handleTemplateAnalysis(): Promise<void>;
declare function analyzeTemplateStructure(frame: FrameNode): {
    frameName: string;
    textNodes: {
        name: string;
        content: string;
    }[];
    imageNodes: {
        name: string;
        type: string;
    }[];
    logoNodes: {
        name: string;
        type: string;
    }[];
    totalNodes: number;
};
declare function handleScraperTest(auditorUrl: string): Promise<void>;
declare function handleLoadLogoDatabase(): Promise<void>;
declare function handleSaveLogo(logoData: LogoItem): Promise<void>;
declare function handleDeleteLogo(logoId: string): Promise<void>;
declare function handleSetTemplate(): Promise<void>;
