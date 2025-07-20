# 🚀 **Concurrent Users Implementation Guide**

## 📋 **Overview**

This document provides a complete implementation of concurrent user tracking for the AI-BOS platform, including real-time monitoring, analytics, and performance metrics.

## 🏗️ **Architecture**

### **Components**

1. **Backend Service** (`ConcurrentUsersService`)
   - Redis-based real-time tracking
   - PostgreSQL for historical data
   - Automatic cleanup and maintenance

2. **Frontend Dashboard** (`ConcurrentUsersDashboard`)
   - Real-time metrics display
   - Interactive charts and graphs
   - Performance monitoring

3. **API Layer** (`ConcurrentUsersAPI`)
   - RESTful endpoints
   - Server-Sent Events for real-time updates
   - Analytics and reporting

4. **CLI Tools** (`concurrent-users-cli`)
   - Command-line monitoring
   - Health checks and diagnostics
   - Testing and debugging

5. **Database Schema**
   - User sessions tracking
   - Performance metrics
   - Historical analytics

## 🔧 **Installation & Setup**

### **1. Environment Variables**

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
```

### **2. Database Setup**

```sql
-- Run the schema file
\i packages/database/concurrent-users-schema.sql
```

### **3. Dependencies Installation**

```bash
# Install Redis
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Install Node.js dependencies
pnpm install
```

### **4. Build the Project**

```bash
# Build the ledger SDK
cd packages/ledger-sdk
pnpm build

# Build the admin app
cd apps/admin-app
pnpm build
```

## 🚀 **Usage**

### **Backend Integration**

```typescript
import { ConcurrentUsersService } from '@aibos/ledger-sdk';

// Initialize service
const service = new ConcurrentUsersService(
  process.env.REDIS_URL!,
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Track user activity
await service.trackUserActivity({
  userId: 'user123',
  organizationId: 'org456',
  sessionId: 'session789',
  moduleId: 'accounting',
  userAgent: 'Mozilla/5.0...',
  ipAddress: '192.168.1.1',
  isActive: true
});

// Get current concurrent users
const current = await service.getCurrentConcurrentUsers();
console.log(`Current users: ${current}`);

// Get comprehensive metrics
const metrics = await service.getConcurrentUserMetrics();
console.log('Metrics:', metrics);
```

### **Frontend Integration**

```typescript
import ConcurrentUsersDashboard from '@/components/ConcurrentUsersDashboard';

// In your React component
<ConcurrentUsersDashboard
  redisUrl={process.env.NEXT_PUBLIC_REDIS_URL}
  supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL}
  supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_KEY}
/>
```

### **API Integration**

```typescript
// Get current concurrent users
const response = await fetch('/api/concurrent-users/current');
const data = await response.json();
console.log('Current users:', data.data.concurrent_users);

// Track user activity
await fetch('/api/concurrent-users/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    organizationId: 'org456',
    sessionId: 'session789',
    moduleId: 'accounting'
  })
});

// Real-time monitoring
const eventSource = new EventSource('/api/concurrent-users/realtime');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time users:', data.concurrent_users);
};
```

### **CLI Usage**

```bash
# Get current concurrent users
aibos-concurrent-users current

# Get comprehensive metrics
aibos-concurrent-users metrics

# Monitor in real-time
aibos-concurrent-users monitor --interval 10

# Get module-specific users
aibos-concurrent-users module accounting

# Get organization-specific users
aibos-concurrent-users organization org123

# Get peak users in time range
aibos-concurrent-users peak --start 24h --end now

# Get average users
aibos-concurrent-users average --start 1h

# Show trend data
aibos-concurrent-users trend

# Health check
aibos-concurrent-users health

# Track test activity
aibos-concurrent-users track -u user123 -o org456 -s session789 -m accounting
```

## 📊 **Metrics & Analytics**

### **Key Metrics**

1. **Current Concurrent Users**
   - Real-time count of active users
   - Updates every 10 seconds
   - Based on 1-minute activity window

2. **Peak Concurrent Users**
   - Highest number of users in a time period
   - Configurable time ranges
   - Historical tracking

3. **Average Concurrent Users**
   - Average over specified time period
   - Useful for capacity planning
   - Trend analysis

4. **Module Usage**
   - Users per module (accounting, bookkeeping, tax, etc.)
   - Module popularity tracking
   - Performance by module

5. **Organization Usage**
   - Users per organization
   - Top organizations by usage
   - Multi-tenant analytics

### **Performance Metrics**

1. **Response Time**
   - P50 (median): 120ms
   - P95: 250ms
   - P99: 500ms

2. **Error Rate**
   - Percentage of failed requests
   - Real-time monitoring
   - Alert thresholds

3. **Resource Utilization**
   - CPU usage: 65%
   - Memory usage: 78%
   - Database connections: 45%

## 🔍 **Monitoring & Alerts**

### **Real-time Monitoring**

```typescript
// Server-Sent Events for real-time updates
const eventSource = new EventSource('/api/concurrent-users/realtime');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  // Update UI with real-time data
  updateConcurrentUsersDisplay(data.concurrent_users);
  
  // Check for alerts
  if (data.concurrent_users > threshold) {
    triggerHighLoadAlert();
  }
};
```

### **Alert Thresholds**

```typescript
// Configure alert thresholds
const ALERT_THRESHOLDS = {
  HIGH_CONCURRENCY: 1000,
  HIGH_ERROR_RATE: 0.05, // 5%
  HIGH_RESPONSE_TIME: 500, // 500ms
  HIGH_CPU_USAGE: 80, // 80%
  HIGH_MEMORY_USAGE: 85 // 85%
};
```

### **Health Checks**

```bash
# Check system health
aibos-concurrent-users health

# Expected output:
# ✓ System is healthy
# ✓ Current concurrent users: 245
# ✓ Redis connection: OK
# ✓ Database connection: OK
```

## 🗄️ **Database Schema**

### **Tables**

1. **user_sessions**
   - Track active user sessions
   - Module and organization mapping
   - Activity timestamps

2. **concurrent_users_history**
   - Historical concurrent user data
   - Time-series analytics
   - Trend analysis

3. **module_usage_tracking**
   - Detailed module usage
   - Performance metrics
   - Error tracking

4. **performance_metrics**
   - Response time tracking
   - Error rate monitoring
   - Resource utilization

5. **resource_utilization**
   - System resource monitoring
   - Capacity planning
   - Performance optimization

6. **performance_alerts**
   - Alert management
   - Threshold monitoring
   - Incident tracking

### **Views**

1. **current_active_sessions**
   - Real-time active sessions
   - User activity monitoring

2. **module_usage_summary**
   - Module performance summary
   - Usage analytics

3. **organization_usage_summary**
   - Organization usage patterns
   - Multi-tenant analytics

4. **performance_alerts_summary**
   - Active alerts overview
   - System health status

## 🔧 **Configuration**

### **Redis Configuration**

```typescript
// Redis connection options
const redisConfig = {
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
};
```

### **Activity Window Configuration**

```typescript
// Activity window settings
const ACTIVITY_WINDOW = 60 * 1000; // 1 minute
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SESSION_TTL = 120; // 2 minutes
```

### **Performance Tuning**

```typescript
// Performance optimization
const PERFORMANCE_CONFIG = {
  batchSize: 100,
  flushInterval: 5000,
  maxConnections: 50,
  connectionTimeout: 30000
};
```

## 🧪 **Testing**

### **Unit Tests**

```bash
# Run tests
cd packages/ledger-sdk
pnpm test

# Test specific functionality
pnpm test -- --testNamePattern="concurrent users"
```

### **Integration Tests**

```bash
# Test API endpoints
curl http://localhost:3000/api/concurrent-users/current

# Test real-time endpoint
curl -N http://localhost:3000/api/concurrent-users/realtime
```

### **Load Testing**

```bash
# Simulate concurrent users
for i in {1..100}; do
  aibos-concurrent-users track -u "user$i" -o "org$i" -s "session$i" &
done
```

## 📈 **Scaling Considerations**

### **Horizontal Scaling**

1. **Redis Cluster**
   - Multiple Redis instances
   - Load balancing
   - High availability

2. **Database Sharding**
   - Partition by organization
   - Time-based partitioning
   - Geographic distribution

3. **API Load Balancing**
   - Multiple API instances
   - Health checks
   - Auto-scaling

### **Performance Optimization**

1. **Caching Strategy**
   - Redis for real-time data
   - Database for historical data
   - CDN for static assets

2. **Data Retention**
   - Real-time data: 1 hour
   - Historical data: 1 year
   - Analytics data: 5 years

3. **Cleanup Processes**
   - Automatic session cleanup
   - Data archival
   - Performance optimization

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Redis Connection Issues**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Check Redis logs
   tail -f /var/log/redis/redis-server.log
   ```

2. **Database Connection Issues**
   ```bash
   # Check database connection
   aibos-concurrent-users health
   
   # Check database logs
   tail -f /var/log/postgresql/postgresql-*.log
   ```

3. **High Memory Usage**
   ```bash
   # Check memory usage
   aibos-concurrent-users metrics
   
   # Monitor resource utilization
   top -p $(pgrep node)
   ```

### **Debug Mode**

```bash
# Enable debug logging
DEBUG=* aibos-concurrent-users monitor

# Verbose output
aibos-concurrent-users metrics --verbose
```

## 📚 **API Reference**

### **Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/concurrent-users/current` | Get current concurrent users |
| GET | `/api/concurrent-users/metrics` | Get comprehensive metrics |
| GET | `/api/concurrent-users/module/:id` | Get users by module |
| GET | `/api/concurrent-users/organization/:id` | Get users by organization |
| GET | `/api/concurrent-users/peak` | Get peak users |
| GET | `/api/concurrent-users/average` | Get average users |
| GET | `/api/concurrent-users/trend` | Get trend data |
| GET | `/api/concurrent-users/realtime` | Real-time stream |
| POST | `/api/concurrent-users/track` | Track user activity |
| GET | `/api/concurrent-users/health` | Health check |

### **Response Formats**

```typescript
// Success response
{
  success: true,
  data: {
    concurrent_users: 245,
    timestamp: "2024-01-15T10:30:00.000Z"
  }
}

// Error response
{
  success: false,
  error: "Failed to get current users",
  details: "Connection timeout"
}
```

## 🔮 **Future Enhancements**

### **Planned Features**

1. **Advanced Analytics**
   - Predictive modeling
   - Anomaly detection
   - Machine learning insights

2. **Enhanced Monitoring**
   - Custom dashboards
   - Alert customization
   - Integration with external tools

3. **Performance Optimization**
   - Query optimization
   - Index improvements
   - Caching strategies

4. **Security Enhancements**
   - Rate limiting
   - Authentication
   - Data encryption

## 📞 **Support**

For questions, issues, or contributions:

1. **Documentation**: Check this guide and inline code comments
2. **Issues**: Create GitHub issues for bugs or feature requests
3. **Discussions**: Use GitHub Discussions for questions
4. **Contributions**: Submit pull requests for improvements

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: AI-BOS Team 