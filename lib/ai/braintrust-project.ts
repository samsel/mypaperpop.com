export const BRAINTRUST_PRODUCTION_PROJECT_NAME = 'mypaperpop.com';
export const BRAINTRUST_DEVELOPMENT_PROJECT_NAME = 'mypaperpop.com-dev';

type BraintrustProjectEnv = {
    BRAINTRUST_PROJECT_NAME?: string;
    VERCEL_ENV?: string;
    NODE_ENV?: string;
};

export function resolveBraintrustProjectName(env: BraintrustProjectEnv = process.env): string {
    const configured = env.BRAINTRUST_PROJECT_NAME?.trim();
    if (configured) return configured;

    return isProductionBraintrustEnv(env)
        ? BRAINTRUST_PRODUCTION_PROJECT_NAME
        : BRAINTRUST_DEVELOPMENT_PROJECT_NAME;
}

function isProductionBraintrustEnv(env: BraintrustProjectEnv): boolean {
    if (env.VERCEL_ENV) return env.VERCEL_ENV === 'production';
    return env.NODE_ENV === 'production';
}
