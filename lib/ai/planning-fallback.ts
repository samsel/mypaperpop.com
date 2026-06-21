import type { PaperOrientation } from './prompts/image';

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

export interface EvaluateFallbackResult {
    verdict: 'GENERATE' | 'CLARIFY';
    enhancedPrompt?: string;
    paperOrientation?: PaperOrientation;
}

const CONVERSATIONAL_PATTERNS = [
    /^(hi|hello|hey|yo|thanks|thank you|nice|cool|awesome|wow|ok|okay)\b/i,
    /^(how are you|what can you do|how does this work|what'?s up)\b/i,
    /\b(i'?m bored|that looks great|looks good|i love it)\b/i,
];

const CLARIFY_PATTERNS = [
    /\b(what else|any ideas|what should|what do you think|you decide|you pick|your choice|up to you|surprise me)\b/i,
    /^(what|why|how|can you|could you|would you)\b/i,
    /^(something cool|whatever|stuff|things|i don'?t know|dunno)$/i,
    /\b(the thing|that one character|you know what i mean)\b/i,
];

const EDIT_OR_REGENERATE_PATTERN =
    /\b(add|remove|change|make|turn|replace|redo|redraw|regenerate|try again|again|one more|bigger|smaller|simpler)\b/i;

const LANDSCAPE_HINT_PATTERN =
    /\b(scene|garden|beach|city|street|forest|ocean|mountain|playground|parade|group|vehicle|car|truck|train|ship|boat|race|farm|zoo|landscape)\b/i;

const PORTRAIT_HINT_PATTERN =
    /\b(tower|building|castle|tree|rocket|statue|person|girl|boy|kid|animal|dinosaur|robot|unicorn|elephant|cat|dog|dragon|character)\b/i;

export function buildEvaluatePromptFailureFallback(
    messages: ChatMessage[],
    currentImagePrompt: string | null,
): EvaluateFallbackResult {
    const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content.trim() ?? '';
    if (!latestUserMessage) return { verdict: 'CLARIFY' };

    if (isClearlyNonGeneratingTurn(latestUserMessage)) {
        return { verdict: 'CLARIFY' };
    }

    if (currentImagePrompt && EDIT_OR_REGENERATE_PATTERN.test(latestUserMessage)) {
        return {
            verdict: 'GENERATE',
            enhancedPrompt: buildFallbackEnhancedPrompt(latestUserMessage, currentImagePrompt),
            paperOrientation: chooseFallbackPaperOrientation(latestUserMessage, currentImagePrompt),
        };
    }

    if (!looksDrawable(latestUserMessage)) {
        return { verdict: 'CLARIFY' };
    }

    return {
        verdict: 'GENERATE',
        enhancedPrompt: buildFallbackEnhancedPrompt(latestUserMessage, currentImagePrompt),
        paperOrientation: chooseFallbackPaperOrientation(latestUserMessage, currentImagePrompt),
    };
}

function isClearlyNonGeneratingTurn(message: string): boolean {
    return CONVERSATIONAL_PATTERNS.some((pattern) => pattern.test(message))
        || CLARIFY_PATTERNS.some((pattern) => pattern.test(message));
}

function looksDrawable(message: string): boolean {
    if (message.endsWith('?')) return false;
    const words = message.split(/\s+/).filter(Boolean);
    if (words.length === 0) return false;
    if (words.length === 1 && message.length < 4) return false;
    return /[a-z0-9]/i.test(message);
}

function buildFallbackEnhancedPrompt(message: string, currentImagePrompt: string | null): string {
    const cleanMessage = message.replace(/\s+/g, ' ').trim();
    if (currentImagePrompt && EDIT_OR_REGENERATE_PATTERN.test(cleanMessage)) {
        return `${currentImagePrompt}. Apply this requested change: ${cleanMessage}. Black and white clean outline coloring page for children, no shading, no colors, no filled areas.`;
    }

    return `${cleanMessage}. Black and white clean outline coloring page for children, no shading, no colors, no filled areas.`;
}

function chooseFallbackPaperOrientation(message: string, currentImagePrompt: string | null): PaperOrientation {
    const text = `${message} ${currentImagePrompt ?? ''}`;
    if (LANDSCAPE_HINT_PATTERN.test(text) && !PORTRAIT_HINT_PATTERN.test(text)) {
        return 'landscape';
    }
    return 'portrait';
}
