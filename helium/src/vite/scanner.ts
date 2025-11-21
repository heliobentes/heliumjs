import fs from 'fs';
import path from 'path';

import { SERVER_DIR } from './paths.js';

export interface MethodExport {
    name: string;
    filePath: string;
}

export function scanServerMethods(root: string): MethodExport[] {
    const serverDir = path.resolve(root, SERVER_DIR);
    if (!fs.existsSync(serverDir)) {
        return [];
    }

    const methods: MethodExport[] = [];

    function walk(dir: string) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith('.ts')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                // Regex to find: export const methodName = defineMethod(...)
                const regex = /export\s+const\s+(\w+)\s*=\s*defineMethod/g;
                let match;
                while ((match = regex.exec(content)) !== null) {
                    methods.push({
                        name: match[1],
                        filePath: fullPath,
                    });
                }
            }
        }
    }

    walk(serverDir);
    return methods;
}
