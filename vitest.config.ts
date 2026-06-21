import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/unit',
      include: [
        'lib/ai/age-groups.ts',
        'lib/ai/image-generation-stub.ts',
        'lib/ai/image-generation-retry.ts',
        'lib/ai/prompts/image.ts',
        'lib/ai/safety-grounding.ts',
        'lib/analytics/posthog-server.ts',
        'lib/utils/download.ts',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
