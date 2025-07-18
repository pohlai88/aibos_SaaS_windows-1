#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Define patterns for variables that should be prefixed with underscore
  const patternsToFix = [
    // Function parameters in function signatures
    { regex: /(\(.*?)(\bmessage\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\berror\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\btheme\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\btitle\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\bmodel\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\bconversationId\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\bupdates\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\bcontent\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\battachments\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\bmessageId\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\bnewContent\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\bmessages\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\bformat\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\bsettings\b)([^)]*\))/g, replacement: '$1_$2$3' },
    { regex: /(\(.*?)(\bcontext\b)([^)]*\))/g, replacement: '$1_$2$3' },

    // Variable declarations (const, let)
    { regex: /(\bconst\s+)(\bmaxMessagesPerConversation\b)/g, replacement: '$1_$2' },
    { regex: /(\blet\s+)(\bmaxMessagesPerConversation\b)/g, replacement: '$1_$2' },

    // Arrow function parameters
    { regex: /(\s*=\s*\([^)]*?)(\bmessage\b)([^)]*\)\s*=>)/g, replacement: '$1_$2$3' },
    { regex: /(\s*=\s*\([^)]*?)(\berror\b)([^)]*\)\s*=>)/g, replacement: '$1_$2$3' },
    { regex: /(\s*=\s*\([^)]*?)(\btheme\b)([^)]*\)\s*=>)/g, replacement: '$1_$2$3' },
  ];

  patternsToFix.forEach(({ regex, replacement }) => {
    const oldContent = content;
    content = content.replace(regex, replacement);
    if (oldContent !== content) changes++;
  });

  // Fix undefined variables like _data -> data
  content = content.replace(/'_data' is not defined/g, "'data' is not defined");
  content = content.replace(/\b_data\b/g, 'data');

  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${changes} issues in ${path.basename(filePath)}`);
    return changes;
  }

  return 0;
};

// Process specific problematic files
const filesToProcess = [
  './src/ai-assistant/AIAssistant.tsx',
  './src/ai-assistant/AIAssistantProvider.tsx',
];

let totalChanges = 0;
filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    totalChanges += processFile(file);
  }
});

console.log(`\n🎯 Total: Fixed ${totalChanges} issues`);
