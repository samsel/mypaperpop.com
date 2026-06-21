import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const evalDir = path.dirname(fileURLToPath(import.meta.url));
const caseFiles = fs.readdirSync(evalDir)
    .filter((fileName) => fileName.endsWith('-cases.jsonl'))
    .sort();

let failures = 0;

for (const fileName of caseFiles) {
    const filePath = path.join(evalDir, fileName);
    const lines = fs.readFileSync(filePath, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    for (const [index, line] of lines.entries()) {
        try {
            const row = JSON.parse(line) as {
                input?: unknown;
                expected?: unknown;
                metadata?: { id?: unknown };
            };

            if (!row.input || !row.expected || !row.metadata || typeof row.metadata.id !== 'string') {
                throw new Error('case must include input, expected, and metadata.id');
            }
        } catch (error) {
            failures += 1;
            console.error(`${fileName}:${index + 1} ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    console.info(`${fileName}: ${lines.length} cases`);
}

if (failures > 0) {
    process.exitCode = 1;
}
