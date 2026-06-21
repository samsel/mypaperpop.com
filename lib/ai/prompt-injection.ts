export const POLICY_EVASION_REJECTION_MESSAGE =
    "I can't help with bypassing the app's safety rules. Try a normal coloring page idea instead.";

const POLICY_EVASION_PATTERNS: RegExp[] = [
    /\bignore\s+(?:all\s+)?(?:previous|prior|above|earlier|system|developer)\s+instructions?\b/i,
    /\bdisregard\s+(?:all\s+)?(?:previous|prior|above|earlier|system|developer)\s+instructions?\b/i,
    /\boverride\s+(?:the\s+)?(?:system|developer|safety|policy|rules?|instructions?)\b/i,
    /\bbypass\s+(?:the\s+)?(?:safety|policy|rules?|guardrails?|filters?|restrictions?)\b/i,
    /\b(?:disable|turn\s+off)\s+(?:the\s+)?(?:safety|policy|rules?|guardrails?|filters?|restrictions?)\b/i,
    /\bfrom\s+now\s+on\b[^.?!]*(?:no|without)\s+(?:content\s+)?(?:policy|rules?|restrictions?|limits?)\b/i,
    /\bno\s+(?:content\s+)?(?:policy|rules?|restrictions?|limits?)\s+(?:apply|applies|allowed)\b/i,
    /\breveal\s+(?:your\s+|the\s+)?(?:system|developer)\s+(?:prompt|message|instructions?)\b/i,
    /\b(?:show|print|repeat|output)\s+(?:your\s+|the\s+)?(?:system|developer)\s+(?:prompt|message|instructions?)\b/i,
    /\bpretend\s+(?:the\s+)?(?:safety|content\s+policy|policy|rules?|restrictions?)\s+(?:do|does)\s+not\s+apply\b/i,
    /\b(?:jailbreak|DAN\s+mode|do\s+anything\s+now)\b/i,
    /\b(?:system|developer)\s+message\s*:/i,
];

export function detectPolicyEvasionAttempt(text: string): boolean {
    const normalized = text
        .replace(/\s+/g, ' ')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim();

    return POLICY_EVASION_PATTERNS.some((pattern) => pattern.test(normalized));
}
