# AI-BOS Diagrams

## 1. Mermaid.js Architecture Diagram

```mermaid
graph TD
    subgraph "Frontend: SaaS Shell"
        A[Accounting App Window]
        B[Tax App Window]
        C[Dock]
        D[Spotlight Search]
    end

    subgraph "SDK Layer"
        E[AI-BOS SDK]
        F[Event Bus Client]
    end

    subgraph "Backend: Platform Runtime"
        G[Manifest Engine]
        H[Event Bus Server]
        I[API Gateway]
        J[AI Generator]
    end

    subgraph "Database: Supabase"
        K[Entities Table]
        L[Events Log]
        M[Manifests Table]
        N[Tenants Table]
        O[Apps Table]
    end

    A -->|emitEvent(JournalPosted)| E
    B -->|listenEvent(JournalPosted)| E
    C -->|launch app| E
    D -->|search apps/data| E
    E --> F
    F --> H
    E --> I
    I --> G
    I --> J
    G --> M
    H --> L
    I --> K
    I --> N
    I --> O
    
    H -->|dispatch event| B
    G -->|validate manifest| E
    J -->|generate app| G
```

## 2. API Endpoints Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Gateway
    participant Manifest Engine
    participant Event Bus
    participant Database

    Note over User, Database: App Installation Flow
    User->>Frontend: "Add email receipt button"
    Frontend->>API Gateway: POST /api/ai/generate
    API Gateway->>Manifest Engine: generateManifest(prompt)
    Manifest Engine->>Database: validate & store manifest
    Database-->>Manifest Engine: manifest_id
    Manifest Engine-->>API Gateway: manifest
    API Gateway->>Frontend: manifest ready
    Frontend->>User: Button appears in POS

    Note over User, Database: Event Communication Flow
    User->>Frontend: Post journal entry
    Frontend->>API Gateway: POST /api/events/emit
    API Gateway->>Event Bus: emitEvent("JournalPosted")
    Event Bus->>Database: log event
    Event Bus->>API Gateway: find subscribers
    API Gateway->>Frontend: notify Tax app
    Frontend->>User: Tax calculated automatically
```

## 3. MVP Rollout Flowchart

```mermaid
flowchart TD
    A[Phase 1: Shell UI] --> B[Phase 2: Event Bus]
    B --> C[Phase 3: Entities & Data Layer]
    C --> D[Phase 4: Accounting App]
    D --> E[Phase 5: Tax App]
    E --> F[Phase 6: Micro-Dev Tools]
    F --> G[Phase 7: Marketplace]

    subgraph "Phase 1: Shell UI"
        A1[Window Manager]
        A2[Dock Component]
        A3[Basic Navigation]
        A4[User Authentication]
    end

    subgraph "Phase 2: Event Bus"
        B1[Event Emission]
        B2[Event Subscription]
        B3[Event Routing]
        B4[Event Logging]
    end

    subgraph "Phase 3: Entities & Data Layer"
        C1[Shared Entities]
        C2[Data Dictionary]
        C3[Multi-tenant Isolation]
        C4[RLS Policies]
    end

    subgraph "Phase 4: Accounting App"
        D1[Chart of Accounts]
        D2[Journal Entries]
        D3[Basic Reports]
        D4[Event Emission]
    end

    subgraph "Phase 5: Tax App"
        E1[Tax Calculations]
        E2[Event Listening]
        E3[Automatic Updates]
        E4[Tax Reports]
    end

    subgraph "Phase 6: Micro-Dev Tools"
        F1[AI App Generator]
        F2[Manifest Editor]
        F3[App Testing]
        F4[Deployment Pipeline]
    end

    subgraph "Phase 7: Marketplace"
        G1[App Discovery]
        G2[App Reviews]
        G3[Revenue Sharing]
        G4[Developer Tools]
    end

    A --> A1
    A --> A2
    A --> A3
    A --> A4
    
    B --> B1
    B --> B2
    B --> B3
    B --> B4
    
    C --> C1
    C --> C2
    C --> C3
    C --> C4
    
    D --> D1
    D --> D2
    D --> D3
    D --> D4
    
    E --> E1
    E --> E2
    E --> E3
    E --> E4
    
    F --> F1
    F --> F2
    F --> F3
    F --> F4
    
    G --> G1
    G --> G2
    G --> G3
    G --> G4
```

## 4. How Accounting & Tax Talk Automatically

```mermaid
graph LR
    subgraph "Accounting App"
        A[User posts journal]
        B[emitEvent JournalPosted]
    end

    subgraph "AI-BOS Platform"
        C[Event Bus]
        D[Manifest Engine]
        E[Shared Entities]
    end

    subgraph "Tax App"
        F[listenEvent JournalPosted]
        G[Calculate tax]
        H[Write tax entries]
    end

    A --> B
    B --> C
    C --> F
    F --> G
    G --> H
    H --> E
    E --> A

    style C fill:#e1f5fe
    style D fill:#f3e5f5
    style E fill:#e8f5e8
```

## 5. Micro-Developer Flow

```mermaid
graph TD
    A[Maria: "Add email receipt button"] --> B[AI Generator]
    B --> C[Generate Manifest]
    C --> D[Validate Manifest]
    D --> E{Valid?}
    E -->|Yes| F[Install App]
    E -->|No| G[Return Error]
    F --> H[Create UI Components]
    H --> I[Deploy to Platform]
    I --> J[Button appears in POS]
    J --> K[Maria uses new feature]

    style A fill:#fff3e0
    style B fill:#e3f2fd
    style C fill:#f3e5f5
    style D fill:#e8f5e8
    style F fill:#e8f5e8
    style J fill:#fff3e0
```

## 6. Data Flow Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js Shell]
        B[React Components]
        C[AI-BOS SDK]
    end

    subgraph "Backend Layer"
        D[Node.js API]
        E[Manifest Engine]
        F[Event Bus]
        G[AI Generator]
    end

    subgraph "Database Layer"
        H[Supabase PostgreSQL]
        I[Row Level Security]
        J[Multi-tenant Data]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    E --> H
    F --> H
    G --> H
    H --> I
    I --> J

    style A fill:#e3f2fd
    style D fill:#f3e5f5
    style H fill:#e8f5e8
```

## 7. Security & Compliance Flow

```mermaid
graph TD
    A[User Request] --> B[Authentication]
    B --> C[Tenant Isolation]
    C --> D[Permission Check]
    D --> E[Data Access]
    E --> F[RLS Enforcement]
    F --> G[Audit Logging]
    G --> H[Response]

    subgraph "Security Layers"
        B
        C
        D
        F
        G
    end

    style B fill:#ffebee
    style C fill:#fff3e0
    style D fill:#e8f5e8
    style F fill:#f3e5f5
    style G fill:#e0f2f1
```

These diagrams provide a complete visual understanding of:

1. **Architecture**: How all components connect
2. **API Flow**: How requests and events flow through the system
3. **MVP Plan**: Your step-by-step build strategy
4. **App Communication**: How Accounting and Tax talk automatically
5. **Micro-Dev Process**: How Maria builds apps with AI
6. **Data Flow**: How data moves through the platform
7. **Security**: How the platform stays secure and compliant

You can copy any of these Mermaid diagrams into:
- GitHub README files
- Documentation
- Notion pages
- Any Markdown editor that supports Mermaid 