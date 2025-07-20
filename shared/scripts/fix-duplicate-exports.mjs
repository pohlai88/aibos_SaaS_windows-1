import { readFileSync, writeFileSync } from 'fs';

const libIndexPath = 'lib/index.ts';
let content = readFileSync(libIndexPath, 'utf8');

// Remove duplicate exports
const duplicates = ['EntityIndex', 'EntityConstraint', 'ValidationError', 'ValidationWarning', 'EventMetadata', 'EventHandler'];

duplicates.forEach(duplicate => {
  const regex = new RegExp(`export type \{[^}]*${duplicate}[^}]*\} from '[^']*';`, 'g');
  const matches = content.match(regex) || [];
  
  if (matches.length > 1) {
    // Keep only the first occurrence
    for (let i = 1; i < matches.length; i++) {
      content = content.replace(matches[i], `// Removed duplicate: ${matches[i]}`);
    }
    console.log(`✅ Removed ${matches.length - 1} duplicate exports of ${duplicate}`);
  }
});

writeFileSync(libIndexPath, content);
console.log('✅ Export cleanup completed');