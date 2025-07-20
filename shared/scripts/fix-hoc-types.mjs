import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const hocFiles = glob.sync('ui-components/src/core/**/*.tsx');

hocFiles.forEach(file => {
  let content = readFileSync(file, 'utf8');
  
  // Fix HOC return type casting
  content = content.replace(
    /return WrappedComponent as React\.ComponentType<.*?>;/g,
    'return WrappedComponent as unknown as React.ComponentType<WithProps<P>>;'
  );
  
  // Fix forwardRef type assertions
  content = content.replace(
    /\{\.\.\.(\w+) as P\}/g,
    '{...$1 as unknown as P}'
  );
  
  writeFileSync(file, content);
  console.log(`✅ Fixed HOC types in ${file}`);
});