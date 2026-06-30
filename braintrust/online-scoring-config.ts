export const ONLINE_SCORER_SLUGS = [
    'mypaperpop-trace-completed',
    'mypaperpop-generated-image-delivered',
    'mypaperpop-pipeline-spans-present',
] as const;

export const ONLINE_SCORING_RULE_NAME = 'MyPaperPop production trace scoring';

export const ONLINE_SCORING_RULE_DESCRIPTION = [
    'Scores production conversation traces for valid terminal state, required image delivery,',
    'and expected MyPaperPop pipeline span shape.',
].join(' ');
