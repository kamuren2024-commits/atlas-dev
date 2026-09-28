import fs from 'fs';
import path from 'path';

export class StartupValidator {
  /**
   * Scans server-side source files to verify that no runtime code references, reads, or imports '.env.example'.
   * Throws an error immediately if any references are found.
   */
  static verifyNoEnvExampleReferences(): void {
    const rootDir = process.cwd();
    const directoriesToScan = [
      path.join(rootDir, 'backend'),
      path.join(rootDir, 'server.ts')
    ];

    const violations: string[] = [];

    const scanFile = (filePath: string) => {
      // Avoid scanning files that are part of the validator or documentation itself
      const fileName = path.basename(filePath);
      if (
        fileName === 'startup-validator.ts' ||
        fileName === 'config-loader.ts' ||
        filePath.includes('docs/') ||
        filePath.includes('node_modules') ||
        filePath.includes('dist')
      ) {
        return;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Match occurrences of ".env.example"
        if (content.includes('.env.example')) {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes('.env.example')) {
              violations.push(`${filePath}:${index + 1} -> ${line.trim()}`);
            }
          });
        }
      } catch (err: any) {
        // Safe skip unreadable files
      }
    };

    const scanDirectory = (dirPath: string) => {
      if (!fs.existsSync(dirPath)) return;

      const stat = fs.statSync(dirPath);
      if (stat.isFile()) {
        scanFile(dirPath);
        return;
      }

      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const subStat = fs.statSync(fullPath);
        if (subStat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (subStat.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
          scanFile(fullPath);
        }
      });
    };

    directoriesToScan.forEach(scanPath => {
      scanDirectory(scanPath);
    });

    if (violations.length > 0) {
      console.error('\n================================================================');
      console.error('⛔ SALIENCE ATLAS V2 — CRITICAL SECURITY GOVERNANCE FAILURE ⛔');
      console.error('================================================================');
      console.error('The following source files contain illegal references to ".env.example":');
      violations.forEach(v => console.error(`  - ${v}`));
      console.error('----------------------------------------------------------------');
      console.error('.env.example is DOCUMENTATION ONLY and must not be used at runtime.');
      console.error('================================================================\n');
      throw new Error(`Startup validation failed: Illegal runtime reference to ".env.example" detected in ${violations.length} lines.`);
    }

    console.log('[SECURITY_VERIFIED] Startup check passed: No runtime references to .env.example found.');
  }
}
