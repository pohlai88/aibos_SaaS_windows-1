# 🌐 Metadata Registry Module

A hybrid metadata management system designed for enterprise governance and SaaS platform readiness. **Single Source of Truth (SSOT)** for all data structures in the AI-BOS ecosystem.

## Overview

The Metadata Registry module implements a revolutionary "hybrid method" that addresses the shortcomings of traditional rigid metadata systems by allowing immediate field usage while gradually introducing governance through smart suggestions and voluntary adoption.

**🎯 As the SSOT, all modules must comply with Metadata Registry standards during deployment.**

## Key Features

- **SSOT Architecture**: Central authority for all data structure definitions
- **AI Co-Pilot Integration**: Automatic compliance checking and correction
- **Smart Auto-Correction**: Converts non-compliant naming to registry standards
- **Hybrid Metadata Framework**: Combines flexibility with governance
- **Smart Field Suggestions**: AI-powered metadata recommendations
- **Compliance Tracking**: Built-in support for multiple compliance standards
- **Governance Metrics**: Real-time insights into metadata adoption
- **Enterprise Ready**: Designed for SaaS platform deployment

## 🚀 AI Co-Pilot Compliance Engine

### Deployment Validation Process

```typescript
// Phase 1: Pre-Deployment Analysis
interface DeploymentValidation {
  autoCorrections: {
    original: string;        // e.g., "exported_to"
    corrected: string;       // e.g., "exportedTo"
    confidence: number;      // 0.0 - 1.0
  }[];
  
  unresolved: {
    fieldName: string;
    suggestions: string[];
    action: 'register_local' | 'map_existing' | 'reject';
  }[];
}

// Phase 2: Smart Resolution Logic
// High Confidence (>90%): Auto-correct silently
// Medium Confidence (70-90%): Auto-correct with notification
// Low Confidence (<70%): Prompt for manual decision
// No Match: Offer to register as local_metadata
```

## Components

- `MetadataRegistryService`: Core service for metadata operations
- `MetadataRegistryDashboard`: 4-tab UI for metadata management
- Comprehensive ENUMs for consistent naming conventions

## Integration

This module integrates seamlessly with AI-BOS OS and provides:
- Prevention of "export" naming inconsistencies
- Foundation for future SaaS platform capabilities
- Enterprise-grade metadata governance

## Usage

```typescript
import { MetadataRegistryDashboard, MetadataRegistryService } from '@aibos/metadata-registry';

// ❌ BEFORE (Developer writes)
export { exported_to, Export_Data, export_TO }

// ✅ AFTER (AI Co-Pilot auto-corrects)
export { exportedTo, exportData, exportTo }

// ❌ FORBIDDEN - Hardcoded enums
enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

┌─ Code Submitted ─┐
│                  │
├─ AI Co-Pilot ────┤
│  Analysis        │
└──────┬───────────┘
       │
   ┌───▼───┐
   │ 100%  │ ──► Auto-Deploy ✅
   │ Match │
   └───────┘
       │
   ┌───▼───┐
   │ 70%+  │ ──► Auto-Correct + Deploy ⚡
   │ Match │     (with notification)
   └───────┘
       │
   ┌───▼───┐
   │ <70%  │ ──► Manual Review Required 🔍
   │ Match │     (suggest local_metadata)
   └───────┘
       │
   ┌───▼───┐
   │ No    │ ──► Deployment Failed ❌
   │ Match │     (register or reject)
   └───────┘


import { MetadataRegistryDashboard, MetadataRegistryService } from '@aibos/metadata-registry';

// Use in your AI-BOS OS application
<MetadataRegistryDashboard />

// For developers: Validate against registry
const isCompliant = await MetadataRegistryService.validateField('customerName');
const suggestions = await MetadataRegistryService.suggestCorrection('customer_name');



// ✅ REQUIRED - Registry-based enums
const PaymentStatus = await metadataRegistry.getEnum('payment_status');
// Returns: { PENDING: 'pending', COMPLETED: 'completed', FAILED: 'failed' }




// Use in your AI-BOS OS application
<MetadataRegistryDashboard />