#!/usr/bin/env node

/**
 * 🧠 AI-BOS TODO Manifest Generator
 * Scans the entire workspace for TODO comments and generates a structured manifest
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TODOManifestGenerator {
  constructor() {
    this.todos = [];
    this.categories = {
      'ai-engine': [],
      'analytics': [],
      'integration': [],
      'workflow': [],
      'security': [],
      'performance': [],
      'testing': [],
      'documentation': [],
      'deployment': [],
      'other': []
    };
  }

  async scanWorkspace() {
    console.log('🔍 Scanning workspace for TODO comments...');

    const workspaces = [
      'railway-1/frontend/src',
      'railway-1/backend/src',
      'shared/src'
    ];

    for (const workspace of workspaces) {
      if (fs.existsSync(workspace)) {
        await this.scanDirectory(workspace);
      }
    }
  }

  async scanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (this.isCodeFile(file.name)) {
        await this.scanFile(fullPath);
      }
    }
  }

  isCodeFile(filename) {
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const todoMatch = line.match(/\/\/\s*TODO[:\s]*(.+)/i);
        if (todoMatch) {
          const todo = {
            file: filePath,
            line: index + 1,
            description: todoMatch[1].trim(),
            category: this.categorizeTodo(todoMatch[1].trim()),
            priority: this.assessPriority(todoMatch[1].trim()),
            module: this.extractModule(filePath)
          };

          this.todos.push(todo);
          this.categories[todo.category].push(todo);
        }
      });
    } catch (error) {
      console.warn(`⚠️  Could not scan file: ${filePath}`, error.message);
    }
  }

  categorizeTodo(description) {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('ai') || lowerDesc.includes('model') || lowerDesc.includes('nlp') ||
        lowerDesc.includes('vision') || lowerDesc.includes('ml') || lowerDesc.includes('prediction')) {
      return 'ai-engine';
    }

    if (lowerDesc.includes('analytics') || lowerDesc.includes('insight') || lowerDesc.includes('report') ||
        lowerDesc.includes('dashboard') || lowerDesc.includes('metric')) {
      return 'analytics';
    }

    if (lowerDesc.includes('integration') || lowerDesc.includes('api') || lowerDesc.includes('connect') ||
        lowerDesc.includes('blockchain') || lowerDesc.includes('iot') || lowerDesc.includes('edge')) {
      return 'integration';
    }

    if (lowerDesc.includes('workflow') || lowerDesc.includes('automation') || lowerDesc.includes('process')) {
      return 'workflow';
    }

    if (lowerDesc.includes('security') || lowerDesc.includes('auth') || lowerDesc.includes('permission') ||
        lowerDesc.includes('encrypt') || lowerDesc.includes('audit')) {
      return 'security';
    }

    if (lowerDesc.includes('performance') || lowerDesc.includes('optimize') || lowerDesc.includes('bundle') ||
        lowerDesc.includes('cache') || lowerDesc.includes('speed')) {
      return 'performance';
    }

    if (lowerDesc.includes('test') || lowerDesc.includes('spec') || lowerDesc.includes('coverage')) {
      return 'testing';
    }

    if (lowerDesc.includes('doc') || lowerDesc.includes('comment') || lowerDesc.includes('readme')) {
      return 'documentation';
    }

    if (lowerDesc.includes('deploy') || lowerDesc.includes('ci/cd') || lowerDesc.includes('production')) {
      return 'deployment';
    }

    return 'other';
  }

  assessPriority(description) {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('critical') || lowerDesc.includes('urgent') || lowerDesc.includes('security')) {
      return 'critical';
    }

    if (lowerDesc.includes('important') || lowerDesc.includes('production') || lowerDesc.includes('deploy')) {
      return 'high';
    }

    if (lowerDesc.includes('nice') || lowerDesc.includes('enhancement') || lowerDesc.includes('optimization')) {
      return 'low';
    }

    return 'medium';
  }

  extractModule(filePath) {
    const parts = filePath.split(path.sep);
    const srcIndex = parts.indexOf('src');
    if (srcIndex !== -1 && parts[srcIndex + 1]) {
      return parts[srcIndex + 1];
    }
    return 'unknown';
  }

  generateReport() {
    const report = {
      generated: new Date().toISOString(),
      summary: {
        total: this.todos.length,
        byCategory: Object.fromEntries(
          Object.entries(this.categories).map(([cat, todos]) => [cat, todos.length])
        ),
        byPriority: {
          critical: this.todos.filter(t => t.priority === 'critical').length,
          high: this.todos.filter(t => t.priority === 'high').length,
          medium: this.todos.filter(t => t.priority === 'medium').length,
          low: this.todos.filter(t => t.priority === 'low').length
        }
      },
      categories: this.categories,
      allTodos: this.todos
    };

    return report;
  }

  async saveReport() {
    const report = this.generateReport();
    const reportPath = 'TODO_MANIFEST.json';

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ TODO manifest saved to: ${reportPath}`);

    // Also generate a markdown report
    await this.generateMarkdownReport(report);
  }

  async generateMarkdownReport(report) {
    let markdown = `# 🧠 AI-BOS TODO Manifest Report

**Generated**: ${report.generated}
**Total TODOs**: ${report.summary.total}

## 📊 Summary

### By Category
${Object.entries(report.summary.byCategory)
  .map(([cat, count]) => `- **${cat}**: ${count}`)
  .join('\n')}

### By Priority
- **Critical**: ${report.summary.byPriority.critical}
- **High**: ${report.summary.byPriority.high}
- **Medium**: ${report.summary.byPriority.medium}
- **Low**: ${report.summary.byPriority.low}

## 🎯 Priority Action Items

### Critical Priority
${this.formatCategoryTodos(report.categories, 'critical')}

### High Priority
${this.formatCategoryTodos(report.categories, 'high')}

## 📁 Detailed Breakdown

${Object.entries(report.categories)
  .filter(([_, todos]) => todos.length > 0)
  .map(([category, todos]) => this.formatCategorySection(category, todos))
  .join('\n\n')}

## 🚀 Cleanup Recommendations

1. **Immediate Action Required** (Critical Priority)
   - Implement real AI functionality in AI engines
   - Replace placeholder implementations with actual logic
   - Add proper error handling and validation

2. **High Priority**
   - Complete integration implementations
   - Add comprehensive testing
   - Implement security hardening

3. **Medium Priority**
   - Performance optimizations
   - Documentation improvements
   - Code quality enhancements

4. **Low Priority**
   - Nice-to-have features
   - UI/UX improvements
   - Additional optimizations
`;

    fs.writeFileSync('TODO_MANIFEST.md', markdown);
    console.log('✅ Markdown report saved to: TODO_MANIFEST.md');
  }

  formatCategoryTodos(categories, priority) {
    const todos = Object.values(categories)
      .flat()
      .filter(todo => todo.priority === priority)
      .slice(0, 5); // Show top 5

    if (todos.length === 0) return '- None';

    return todos
      .map(todo => `- **${todo.module}**: ${todo.description} (${todo.file}:${todo.line})`)
      .join('\n');
  }

  formatCategorySection(category, todos) {
    if (todos.length === 0) return '';

    return `### ${category.charAt(0).toUpperCase() + category.slice(1)} (${todos.length})

${todos
  .map(todo => `- **${todo.priority.toUpperCase()}** - ${todo.description} (${todo.file}:${todo.line})`)
  .join('\n')}`;
  }

  printSummary() {
    console.log('\n📊 TODO Manifest Summary');
    console.log('========================');
    console.log(`Total TODOs: ${this.todos.length}`);

    console.log('\nBy Category:');
    Object.entries(this.categories).forEach(([cat, todos]) => {
      if (todos.length > 0) {
        console.log(`  ${cat}: ${todos.length}`);
      }
    });

    console.log('\nBy Priority:');
    const priorities = ['critical', 'high', 'medium', 'low'];
    priorities.forEach(priority => {
      const count = this.todos.filter(t => t.priority === priority).length;
      if (count > 0) {
        console.log(`  ${priority}: ${count}`);
      }
    });
  }
}

async function main() {
  const generator = new TODOManifestGenerator();

  try {
    await generator.scanWorkspace();
    generator.printSummary();
    await generator.saveReport();

    console.log('\n🎯 Next Steps:');
    console.log('1. Review TODO_MANIFEST.md for priority items');
    console.log('2. Start with critical priority items');
    console.log('3. Implement real functionality to replace placeholders');
    console.log('4. Update this manifest as items are completed');

  } catch (error) {
    console.error('❌ Error generating TODO manifest:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TODOManifestGenerator;
