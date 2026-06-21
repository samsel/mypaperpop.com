export type ImageGenerationMode = 'fresh' | 'edit-previous' | 'redraw-from-prompt';

const REDRAW_PATTERNS = [
    /\bredr(?:aw|o|aw)\b/i,
    /\bredaw\b/i,
    /\bredraw(?:n|ing)?\b/i,
    /\bredo\b/i,
    /\bregenerate\b/i,
    /\bretry\b/i,
    /\btry again\b/i,
    /\bone more(?: time| version)?\b/i,
    /\banother version\b/i,
    /\bnew version\b/i,
    /\bstart over\b/i,
    /\bfrom scratch\b/i,
    /\bsame (?:thing|one|image|picture|drawing|page).*\bbut\b/i,
    /\bless black\b/i,
    /\btoo much black\b/i,
    /\bmore colorable\b/i,
    /\buncolorable\b/i,
    /\bcleaner\b/i,
    /\bsimpl(?:er|ify)\b/i,
    /\bperfect sketch\b/i,
    /\boutline sketch\b/i,
];

const SURGICAL_EDIT_PATTERNS = [
    /\badd\b/i,
    /\bremove\b/i,
    /\bdelete\b/i,
    /\btake out\b/i,
    /\bwithout\b/i,
    /\breplace\b/i,
    /\bchange\b/i,
    /\bmake (?:it|the|this|that|[a-z0-9 -]+) (?:bigger|smaller|larger|shorter|taller)\b/i,
    /\bmove\b/i,
    /\bput\b/i,
    /\bgive (?:it|the|this|that|[a-z0-9 -]+)\b/i,
];

const CURRENT_IMAGE_REFERENCES = [
    /\bit\b/i,
    /\bthis\b/i,
    /\bthat\b/i,
    /\bsame\b/i,
    /\bcurrent\b/i,
    /\bprevious\b/i,
    /\blast\b/i,
    /\bimage\b/i,
    /\bpicture\b/i,
    /\bdrawing\b/i,
    /\bpage\b/i,
];

export function chooseImageGenerationMode(input: {
    latestUserMessage: string;
    hasPreviousImage: boolean;
}): ImageGenerationMode {
    if (!input.hasPreviousImage) return 'fresh';

    const message = input.latestUserMessage.trim();
    if (!message) return 'edit-previous';

    if (REDRAW_PATTERNS.some((pattern) => pattern.test(message))) {
        return 'redraw-from-prompt';
    }

    if (SURGICAL_EDIT_PATTERNS.some((pattern) => pattern.test(message))) {
        return 'edit-previous';
    }

    if (looksLikeStandaloneDrawingPrompt(message)) {
        return 'fresh';
    }

    return CURRENT_IMAGE_REFERENCES.some((pattern) => pattern.test(message))
        ? 'edit-previous'
        : 'fresh';
}

function looksLikeStandaloneDrawingPrompt(message: string): boolean {
    const normalized = message.toLowerCase();
    const wordCount = normalized.split(/\s+/).filter(Boolean).length;
    if (wordCount < 4) return false;

    if (wordCount >= 6 && (
        /\bnext to\b/i.test(message) ||
        /\bin front of\b/i.test(message) ||
        /\bnear\b/i.test(message)
    )) {
        return true;
    }

    if (CURRENT_IMAGE_REFERENCES.some((pattern) => pattern.test(normalized))) {
        return false;
    }

    return (
        /\b(a|an|the)\s+[a-z0-9][a-z0-9 -]{2,}\b/i.test(message) ||
        /\bnext to\b/i.test(message) ||
        /\bwith\b/i.test(message) ||
        /\bin front of\b/i.test(message) ||
        /\bnear\b/i.test(message)
    );
}

export function buildRedrawSubject(input: {
    previousSubject: string | null;
    userInstruction: string;
    enhancedPrompt: string;
}): string {
    const instruction = input.userInstruction.trim();
    const enhanced = input.enhancedPrompt.trim();

    if (!input.previousSubject) return enhanced || instruction;

    return [
        `Same subject and setting as the previous coloring page: ${input.previousSubject}`,
        instruction
            ? `User refinement: ${instruction}`
            : 'User refinement: redraw it cleanly.',
        enhanced && enhanced !== instruction
            ? `Planner detail: ${enhanced}`
            : null,
        'Create a new drawing from scratch. Preserve the subject and setting, but do not trace, preserve, or compound artifacts from the previous rendered bitmap.',
    ].filter(Boolean).join('\n');
}
