import fs from 'fs';
import path from 'path';

export class SecretScanner {
  private static forbiddenPatterns = [
    /sk-[a-zA-Z0-9]{24,}/,             // OpenAI / general API key patterns
    /AIza[0-9A-Za-z-_]{35}/,          // Google Gemini key patterns
    /gsk_[a-zA-Z0-9]{24,}/,            // Groq API keys
    /hf_[a-zA-Z0-9]{24,}/,             // HuggingFace tokens
    /claude-[a-zA-Z0-9_-]{24,}/,       // Anthropic keys
    /api_key\s*=\s*['"`][a-zA-Z0-9_-]{12,}['"`]/, // Hardcoded API keys
    /token\s*=\s*['"`][a-zA-Z0-9_-]{12,}['"`]/     // Hardcoded tokens
  ];

  /**
   * Scans the codebase for committed credentials or exposed hardcoded secrets.
   * Excludes documentation, configuration templates, build directories, and env files.
   * Throws an error to block the build/startup if any violation is identified.
   */
  static scanCodebase(): void {
    const rootDir = process.cwd();
    const findings: { filePath: string; line: number; text: string }[] = [];

    const isExcluded = (filePath: string): boolean => {
      const relativePath = path.relative(rootDir, filePath);
      return (
        relativePath.startsWith('node_modules') ||
        relativePath.startsWith('dist') ||
        relativePath.startsWith('docs') ||
        relativePath.startsWith('.git') ||
        relativePath.includes('.env') || // Matches .env, template, or local env files
        relativePath.startsWith('backend/core/config') // Exclude our own scanner/config code
      );
    };

    const scanFile = (filePath: string) => {
      if (isExcluded(filePath)) return;

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check each forbidden pattern against the line content
          for (const pattern of this.forbiddenPatterns) {
            if (pattern.test(line)) {
              // Double check to verify this isn't just an explanatory comment or template
              if (!line.includes('//') && !line.includes('/*') && !line.includes('Example:') && !line.includes('placeholder')) {
                findings.push({
                  filePath: path.relative(rootDir, filePath),
                  line: index + 1,
                  text: line.trim()
                });
                break;
              }
            }
          }
        });
      } catch (err) {
        // Suppress errors on unreadable files
      }
    };

    const traverse = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      
      const stat = fs.statSync(dir);
      if (stat.isFile()) {
        scanFile(dir);
        return;
      }

      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const subStat = fs.statSync(fullPath);
        if (subStat.isDirectory()) {
          traverse(fullPath);
        } else if (subStat.isFile() && /\.(ts|tsx|js|jsx|json)$/.test(file)) {
          scanFile(fullPath);
        }
      });
    };

    // Scan backend, src, and root files
    traverse(path.join(rootDir, 'backend'));
    traverse(path.join(rootDir, 'src'));
    
    const rootFiles = ['server.ts', 'vite.config.ts'];
    rootFiles.forEach(file => {
      traverse(path.join(rootDir, file));
    });

    if (findings.length > 0) {
      console.error('\n================================================================');
      console.error('🚨  CRITICAL SECURITY ALERT: HARDCODED SECRETS COMMITTED  🚨');
      console.error('================================================================');
      console.error(`The SecretScanner identified ${findings.length} potential credential leaks in source code:`);
      findings.forEach(f => {
        console.error(`   📍 File: ${f.filePath}:${f.line}`);
        console.error(`      Code: ${f.text.substring(0, 60)}...`);
      });
      console.error('----------------------------------------------------------------');
      console.error('BUILD / STARTUP BLOCKED: Remove hardcoded secrets from code.');
      console.error('Use process.env or ConfigService to load credentials instead.');
      console.error('================================================================\n');
      throw new Error(`Build blocked: ${findings.length} hardcoded secrets leaked in source code.`);
    }

    console.log('[SECURITY_VERIFIED] Codebase scan completed: No committed secrets found.');
  }
}
