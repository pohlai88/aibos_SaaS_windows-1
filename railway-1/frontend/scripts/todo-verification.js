#!/usr/bin/env node

/**
 * TODO Verification Script for Phase 4.4
 * Comprehensive TODO audit and tracking
 */

const fs = require('fs');
const path = require('path');

// TODO verification results
const todoResults = {
  phase: '4.4',
  timestamp: new Date().toISOString(),
  summary: {
    totalTODOs: 0,
    resolved: 0,
    pending: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    resolutionRate: 0
  },
  categories: {
    frontend: { total: 0, resolved: 0, pending: 0 },
    backend: { total: 0, resolved: 0, pending: 0 },
    shared: { total: 0, resolved: 0, pending: 0 },
    documentation: { total: 0, resolved: 0, pending: 0 },
    infrastructure: { total: 0, resolved: 0, pending: 0 }
  },
  todos: [],
  recommendations: []
};

// TODO patterns to search for
const todoPatterns = [
  /\/\/\s*TODO\s*:\s*(.+)/gi,
  /\/\/\s*TODO\s*(.+)/gi,
  /\/\*\s*TODO\s*:\s*(.+?)\s*\*\//gi,
  /\/\*\s*TODO\s*(.+?)\s*\*\//gi,
  /#\s*TODO\s*:\s*(.+)/gi,
  /#\s*TODO\s*(.+)/gi,
  /<!--\s*TODO\s*:\s*(.+?)\s*-->/gi,
  /<!--\s*TODO\s*(.+?)\s*-->/gi
];

// Priority indicators
const priorityPatterns = {
  high: /(high|critical|urgent|important|priority|blocker)/i,
  medium: /(medium|normal|standard)/i,
  low: /(low|minor|nice-to-have|optional)/i
};

function scanDirectory(dirPath, category) {
  console.log(`📁 Scanning ${category} directory: ${dirPath}`);

  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️ Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      // Skip node_modules and other build directories
      if (!['node_modules', '.next', '.turbo', 'dist', 'build', '.git'].includes(file.name)) {
        scanDirectory(fullPath, category);
      }
    } else if (file.isFile()) {
      scanFile(fullPath, category);
    }
  });
}

function scanFile(filePath, category) {
  const fileExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt',
    '.yml', '.yaml', '.html', '.css', '.scss', '.sql'
  ];

  const ext = path.extname(filePath);
  if (!fileExtensions.includes(ext)) return;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    todoPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const todoText = match[1] || match[0];
        const lineNumber = content.substring(0, match.index).split('\n').length;

        // Determine priority
        let priority = 'medium';
        if (priorityPatterns.high.test(todoText)) priority = 'high';
        else if (priorityPatterns.low.test(todoText)) priority = 'low';

        // Check if resolved (contains resolved/resolved/fixed/done)
        const isResolved = /(resolved|fixed|done|completed|implemented)/i.test(todoText);

        const todo = {
          file: relativePath,
          line: lineNumber,
          text: todoText.trim(),
          priority: priority,
          resolved: isResolved,
          category: category,
          timestamp: new Date().toISOString()
        };

        todoResults.todos.push(todo);

        // Update summary
        todoResults.summary.totalTODOs++;
        todoResults.categories[category].total++;

        if (isResolved) {
          todoResults.summary.resolved++;
          todoResults.categories[category].resolved++;
        } else {
          todoResults.summary.pending++;
          todoResults.categories[category].pending++;
        }

        // Update priority counts
        if (priority === 'high') todoResults.summary.highPriority++;
        else if (priority === 'medium') todoResults.summary.mediumPriority++;
        else todoResults.summary.lowPriority++;
      }
    });
  } catch (error) {
    console.log(`⚠️ Error reading file: ${filePath}`);
  }
}

function analyzeTODOProgress() {
  console.log('📊 Analyzing TODO progress...');

  // Calculate resolution rate
  if (todoResults.summary.totalTODOs > 0) {
    todoResults.summary.resolutionRate = (todoResults.summary.resolved / todoResults.summary.totalTODOs) * 100;
  }

  // Generate recommendations
  if (todoResults.summary.highPriority > 0) {
    todoResults.recommendations.push({
      type: 'high_priority_todos',
      description: `Address ${todoResults.summary.highPriority} high priority TODOs`,
      priority: 'high'
    });
  }

  if (todoResults.summary.resolutionRate < 50) {
    todoResults.recommendations.push({
      type: 'low_resolution_rate',
      description: `Low TODO resolution rate (${todoResults.summary.resolutionRate.toFixed(1)}%). Focus on completing pending items.`,
      priority: 'medium'
    });
  }

  // Check for TODO clusters
  const fileTodoCounts = {};
  todoResults.todos.forEach(todo => {
    if (!todo.resolved) {
      fileTodoCounts[todo.file] = (fileTodoCounts[todo.file] || 0) + 1;
    }
  });

  Object.entries(fileTodoCounts)
    .filter(([file, count]) => count >= 5)
    .forEach(([file, count]) => {
      todoResults.recommendations.push({
        type: 'todo_cluster',
        description: `File ${file} has ${count} pending TODOs - consider refactoring`,
        priority: 'medium'
      });
    });
}

function generateTODOReport() {
  console.log('\n📄 Generating TODO report...');

  // Save detailed report
  const reportPath = path.join(__dirname, '../../todo-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(todoResults, null, 2));

  console.log(`📄 TODO report saved to: ${reportPath}`);
}

// Run comprehensive TODO verification
console.log('\n📋 Phase 4.4 TODO Verification Suite\n');
console.log('=' .repeat(60));

// Scan all relevant directories
const directories = [
  { path: path.join(__dirname, '../src'), category: 'frontend' },
  { path: path.join(__dirname, '../../backend/src'), category: 'backend' },
  { path: path.join(__dirname, '../../shared/src'), category: 'shared' },
  { path: path.join(__dirname, '../'), category: 'infrastructure' },
  { path: path.join(__dirname, '../../'), category: 'documentation' }
];

directories.forEach(dir => {
  scanDirectory(dir.path, dir.category);
});

// Analyze results
analyzeTODOProgress();
generateTODOReport();

// Print TODO summary
console.log('\n' + '='.repeat(60));
console.log('📋 TODO VERIFICATION SUMMARY');
console.log('='.repeat(60));

console.log(`\nOverall TODO Status:`);
console.log(`  Total TODOs: ${todoResults.summary.totalTODOs}`);
console.log(`  Resolved: ${todoResults.summary.resolved}`);
console.log(`  Pending: ${todoResults.summary.pending}`);
console.log(`  Resolution Rate: ${todoResults.summary.resolutionRate.toFixed(1)}%`);

console.log(`\nPriority Breakdown:`);
console.log(`  High Priority: ${todoResults.summary.highPriority}`);
console.log(`  Medium Priority: ${todoResults.summary.mediumPriority}`);
console.log(`  Low Priority: ${todoResults.summary.lowPriority}`);

console.log(`\nCategory Breakdown:`);
Object.entries(todoResults.categories).forEach(([category, stats]) => {
  if (stats.total > 0) {
    const categoryRate = stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0;
    console.log(`  ${category}: ${stats.resolved}/${stats.total} (${categoryRate.toFixed(1)}%)`);
  }
});

if (todoResults.recommendations.length > 0) {
  console.log(`\n🔧 Recommendations (${todoResults.recommendations.length}):`);
  todoResults.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`);
  });
}

// Show some example TODOs
if (todoResults.todos.length > 0) {
  console.log(`\n📝 Sample TODOs:`);
  const pendingTodos = todoResults.todos.filter(todo => !todo.resolved).slice(0, 5);
  pendingTodos.forEach((todo, index) => {
    console.log(`  ${index + 1}. [${todo.priority.toUpperCase()}] ${todo.file}:${todo.line} - ${todo.text.substring(0, 60)}...`);
  });
}

// Grade assessment
let grade = 'F';
if (todoResults.summary.resolutionRate >= 90) grade = 'A';
else if (todoResults.summary.resolutionRate >= 80) grade = 'B';
else if (todoResults.summary.resolutionRate >= 70) grade = 'C';
else if (todoResults.summary.resolutionRate >= 60) grade = 'D';

console.log(`\n🏆 Phase 4.4 TODO Grade: ${grade} (${todoResults.summary.resolutionRate.toFixed(1)}/100)`);

// Exit with appropriate code
const hasHighPriorityTodos = todoResults.summary.highPriority > 0;
process.exit(hasHighPriorityTodos ? 1 : 0);
