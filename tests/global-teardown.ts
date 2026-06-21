import type { FullConfig } from '@playwright/test';

/**
 * Global teardown: Clean up test data after all tests complete.
 *
 * Deletes all conversations created by the test user during this run.
 * The DELETE /api/conversations/[id] endpoint cascade-deletes messages
 * and cleans up S3 images, so this is a complete cleanup.
 *
 * Uses the saved auth session from tests/.auth/user.json to authenticate.
 */
export default async function globalTeardown(config: FullConfig) {
    const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';

    // Load saved auth cookies
    const fs = await import('fs');
    const path = await import('path');
    const authFile = path.join(__dirname, '.auth/user.json');

    if (!fs.existsSync(authFile)) {
        console.log('[teardown] No auth file found — skipping cleanup.');
        return;
    }

    const authState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    const cookies = authState.cookies || [];

    // Build cookie header string
    const cookieHeader = cookies
        .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
        .join('; ');

    if (!cookieHeader) {
        console.log('[teardown] No cookies in auth file — skipping cleanup.');
        return;
    }

    try {
        // Fetch all conversations for the test user
        const listRes = await fetch(`${baseURL}/api/conversations`, {
            headers: { cookie: cookieHeader },
        });

        if (!listRes.ok) {
            console.log(`[teardown] Failed to list conversations (${listRes.status}) — skipping cleanup.`);
            return;
        }

        const data = await listRes.json();
        const conversations: { id: number }[] = data.conversations || data || [];

        if (conversations.length === 0) {
            console.log('[teardown] No conversations to clean up.');
            return;
        }

        console.log(`[teardown] Cleaning up ${conversations.length} test conversation(s)...`);

        // Delete each conversation (cascade-deletes messages + S3 images)
        let deleted = 0;
        let failed = 0;
        for (const conv of conversations) {
            try {
                const delRes = await fetch(`${baseURL}/api/conversations/${conv.id}`, {
                    method: 'DELETE',
                    headers: { cookie: cookieHeader },
                });
                if (delRes.ok) {
                    deleted++;
                } else {
                    failed++;
                    console.warn(`[teardown] Failed to delete conversation ${conv.id}: ${delRes.status}`);
                }
            } catch (err) {
                failed++;
                console.warn(`[teardown] Error deleting conversation ${conv.id}:`, err);
            }
        }

        console.log(`[teardown] Cleanup complete: ${deleted} deleted, ${failed} failed.`);
    } catch (err) {
        console.warn('[teardown] Cleanup failed:', err);
    }
}
