#!/usr/bin/env node
import fs from 'fs';

// Fix the most critical remaining issues
const fixes = [
  // Fix Badge component reference issues
  {
    file: 'src/primitives/Badge.tsx',
    changes: [
      { from: /: value/, to: ': _value' },
      { from: /value}/, to: '_value}' },
    ]
  },

  // Fix Tabs duplicate ReactNode import
  {
    file: 'src/layout/Tabs.tsx',
    changes: [
      { from: /import type { ReactNode ,\s*ReactNode} from 'react';/, to: "import type { ReactNode } from 'react';" },
    ]
  },

  // Fix missing icon imports
  {
    file: 'src/layout/Tabs.tsx',
    changes: [
      { from: /import { Trash2, X, Plus } from 'lucide-react';/, to: "import { Trash2, X, Plus, Star } from 'lucide-react';" },
    ]
  },

  {
    file: 'src/performance/PerformanceDashboard.tsx',
    changes: [
      { from: /import { TrendingUp, AlertTriangle, TrendingDown, Clock } from 'lucide-react';/, to: "import { TrendingUp, AlertTriangle, TrendingDown, Clock, Zap } from 'lucide-react';" },
    ]
  },

  // Fix event data reference
  {
    file: 'src/job-queue/JobQueueProvider.tsx',
    changes: [
      { from: /JSON\.parse\(event\._data\)/, to: 'JSON.parse(event.data)' },
    ]
  },
];

let totalFixed = 0;

fixes.forEach(({ file, changes }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let fileFixed = 0;

    changes.forEach(({ from, to }) => {
      if (content.includes(from.source || from)) {
        content = content.replace(from, to);
        fileFixed++;
      }
    });

    if (fileFixed > 0) {
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed ${fileFixed} critical issues in ${file}`);
      totalFixed += fileFixed;
    }
  }
});

console.log(`\n🎯 Total critical fixes: ${totalFixed}`);
