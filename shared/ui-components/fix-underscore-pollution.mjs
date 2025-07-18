#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Fix critical variable name pollution
  const fixes = [
    // Context Provider value fixes
    { from: /_value=\{/g, to: 'value={' },
    { from: /_value=/g, to: 'value=' },

    // HTML attribute fixes
    { from: /__value=/g, to: 'value=' },
    { from: /_id=/g, to: 'id=' },

    // Object property fixes
    { from: /\._value\b/g, to: '.value' },
    { from: /\.value/g, to: '.value' }, // ensure it's value not _value

    // Event target fixes
    { from: /e\.target\._value/g, to: 'e.target.value' },

    // Variable declarations (be careful)
    { from: /const _data = /g, to: 'const data = ' },
    { from: /setTestData\(_data\)/g, to: 'setTestData(data)' },

    // Option values
    { from: /option\._value/g, to: 'option.value' },
    { from: /_options/g, to: 'options' },

    // Index variables
    { from: /__index/g, to: 'index' },
    { from: /_index\b/g, to: 'index' },

    // Row variables in data grids
    { from: /_row\b/g, to: 'row' },

    // Config fixes
    { from: /_config\./g, to: 'config.' },

    // Common variable names
    { from: /_values\[/g, to: 'values[' },
    { from: /_options\?/g, to: 'options?' },
  ];

  const originalContent = content;

  fixes.forEach(({ from, to }) => {
    const beforeChange = content;
    content = content.replace(from, to);
    if (beforeChange !== content) {
      changes++;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${changes} variable pollution issues in ${path.basename(filePath)}`);
    return changes;
  }

  return 0;
};

// Process specific files with known issues
const filesToProcess = [
  'src/feedback/Toast.tsx',
  'src/forms/FormBuilder.tsx',
  'src/form-builder/FormBuilder.tsx',
  'src/data/VirtualizedDataGrid.tsx',
  'src/data/DataGrid.tsx',
  'src/data/ExcelLikeGrid.tsx',
  'src/primitives/Badge.tsx',
  'src/primitives/Progress.tsx',
  'src/job-queue/JobQueueDashboard.tsx',
  'src/job-queue/JobQueueProvider.tsx',
  'src/layout/Tabs.tsx',
  'src/theme/ThemeProvider.tsx',
  'src/theme/MultiTenantThemeManager.tsx',
  'src/theme/NestedThemeProvider.tsx',
  'src/performance/PerformanceDashboard.tsx',
  'src/utils/offlineConflictResolver.tsx',
  'src/utils/offlineSupport.tsx',
];

let totalChanges = 0;
filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    totalChanges += processFile(file);
  }
});

console.log(`\n🎯 Total: Fixed ${totalChanges} variable pollution issues`);
