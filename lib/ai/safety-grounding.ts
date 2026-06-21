import type { SafetyResult } from './chat';

export function isGroundedSafetyFalsePositive(
    result: Pick<SafetyResult, 'allowed' | 'categories' | 'reason'>,
    groundedVisualBrief: string | null,
): boolean {
    if (result.allowed || !groundedVisualBrief?.trim()) return false;

    const categories = new Set(result.categories);
    const ambiguousOnly = result.categories.length > 0
        && result.categories.every((category) => [
            'profanity',
            'hate_or_harassment',
            'other_child_inappropriate',
        ].includes(category));

    if (!ambiguousOnly || (!categories.has('profanity') && !categories.has('hate_or_harassment'))) {
        return false;
    }

    const reason = result.reason.toLowerCase();
    const looksLikeOnly = [
        'sounds like',
        'could potentially',
        'not a recognizable',
        'unrecognizable',
        'unknown phrase',
        'another language',
        'foreign',
        'ambiguous',
        'potential for harm',
    ].some((marker) => reason.includes(marker));

    if (!looksLikeOnly) return false;

    const brief = groundedVisualBrief.toLowerCase();
    const hasResolvedReference = /^reference type:\s*(character|creature|factual\/non-character|ordinary subject)\b/i
        .test(groundedVisualBrief.trim());
    const unsafeBriefMarkers = [
        'not appropriate',
        'inappropriate',
        'unsafe',
        'adult',
        'sexual',
        'nudity',
        'profane',
        'profanity',
        'slur',
        'hate',
        'harassment',
        'gore',
        'graphic',
        'self-harm',
        'drug',
        'alcohol',
        'tobacco',
        'scary',
        'disturbing',
    ];
    const unresolvedBriefMarkers = [
        'no known reference',
        'no clear reference',
        'does not resolve',
        'could not resolve',
        'not enough context',
        'unknown phrase',
        'unrecognized phrase',
    ];

    return hasResolvedReference
        && !unsafeBriefMarkers.some((marker) => brief.includes(marker))
        && !unresolvedBriefMarkers.some((marker) => brief.includes(marker));
}
