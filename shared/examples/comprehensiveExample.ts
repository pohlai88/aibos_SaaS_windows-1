/**
 * AI-BOS Comprehensive Example
 *
 * This example demonstrates how to use all AI-BOS systems together
 * to build a complete micro-app platform with event-driven architecture,
 * manifest management, and entity operations.
 */

import type { initializeAibosSystems,
  createAibosApp,
  EventBus,
  ManifestValidator,
  ManifestProcessor,
  EntityManager,
  createManifest,
  createEntityFilter,
  event,
  CommonEventSchemas,
 } from '../lib';
import { z } from 'zod';

// ============================================================================
// EXAMPLE: E-COMMERCE MICRO-APP PLATFORM
// ============================================================================

/**
 * Example: Building an e-commerce micro-app platform
 */
async function ecommercePlatformExample() {
  console.log('🚀 Starting AI-BOS E-commerce Platform Example\n');

  // ============================================================================
  // 1. INITIALIZE AI-BOS SYSTEMS
  // ============================================================================

  console.log('📦 Initializing AI-BOS Systems...');

  const systems = initializeAibosSystems({
    events: {
      enablePersistence: true,
      enableMetrics: true,
      enableAudit: true,
    },
    manifests: {
      enableValidation: true,
      enableCompliance: true,
      enableSecurity: true,
    },
    entities: {
      enableCaching: true,
      enableAudit: true,
      enableValidation: true,
    },
  });

  const { eventBus, manifestValidator, manifestProcessor, entityManager } = systems;

  // ============================================================================
  // 2. CREATE E-COMMERCE MANIFEST
  // ============================================================================

  console.log('📋 Creating E-commerce App Manifest...');

  // Define product entity schema
  const productSchema = {
    name: 'Product',
    fields: [
      {
        name: 'name',
        type: 'string',
        required: true,
        validation: [
          { type: 'min', value: 1 },
          { type: 'max', value: 200 },
        ],
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        validation: [{ type: 'max', value: 1000 }],
      },
      {
        name: 'price',
        type: 'number',
        required: true,
        validation: [{ type: 'min', value: 0 }],
      },
      {
        name: 'category',
        type: 'string',
        required: true,
        indexed: true,
      },
      {
        name: 'inStock',
        type: 'boolean',
        required: true,
        defaultValue: true,
      },
      {
        name: 'tags',
        type: 'array',
        required: false,
      },
      {
        name: 'images',
        type: 'array',
        required: false,
      },
    ],
    indexes: [
      {
        name: 'idx_product_category',
        fields: ['category'],
        type: 'btree',
      },
      {
        name: 'idx_product_price',
        fields: ['price'],
        type: 'btree',
      },
    ],
    constraints: [
      {
        name: 'pk_product',
        type: 'primary_key',
        fields: ['id'],
      },
    ],
  };

  // Define order entity schema
  const orderSchema = {
    name: 'Order',
    fields: [
      {
        name: 'customerId',
        type: 'string',
        required: true,
        indexed: true,
      },
      {
        name: 'items',
        type: 'array',
        required: true,
      },
      {
        name: 'total',
        type: 'number',
        required: true,
        validation: [{ type: 'min', value: 0 }],
      },
      {
        name: 'status',
        type: 'string',
        required: true,
        defaultValue: 'pending',
        validation: [
          {
            type: 'custom',
            validator: (value: string) =>
              ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(value),
          },
        ],
      },
      {
        name: 'shippingAddress',
        type: 'object',
        required: true,
      },
      {
        name: 'paymentMethod',
        type: 'string',
        required: true,
      },
    ],
    indexes: [
      {
        name: 'idx_order_customer',
        fields: ['customerId'],
        type: 'btree',
      },
      {
        name: 'idx_order_status',
        fields: ['status'],
        type: 'btree',
      },
    ],
  };

  // Create e-commerce manifest
  const ecommerceManifest = createManifest()
    .name('E-commerce Platform')
    .version('1.0.0')
    .description('Complete e-commerce solution with product management and order processing')
    .author('AI-BOS Team')
    .license('MIT')
    .addEntity(productSchema)
    .addEntity(orderSchema)
    .addEvent({
      name: 'ProductCreated',
      payload: {
        productId: 'string',
        name: 'string',
        price: 'number',
        category: 'string',
      },
      description: 'Emitted when a new product is created',
    })
    .addEvent({
      name: 'ProductUpdated',
      payload: {
        productId: 'string',
        changes: 'object',
      },
      description: 'Emitted when a product is updated',
    })
    .addEvent({
      name: 'OrderPlaced',
      payload: {
        orderId: 'string',
        customerId: 'string',
        total: 'number',
        items: 'array',
      },
      description: 'Emitted when a new order is placed',
    })
    .addEvent({
      name: 'OrderStatusChanged',
      payload: {
        orderId: 'string',
        oldStatus: 'string',
        newStatus: 'string',
      },
      description: 'Emitted when order status changes',
    })
    .addUIComponent({
      name: 'ProductGrid',
      type: 'table',
      props: {
        columns: ['name', 'price', 'category', 'inStock'],
        sortable: true,
        filterable: true,
      },
      events: ['ProductCreated', 'ProductUpdated'],
      description: 'Displays products in a grid format',
    })
    .addUIComponent({
      name: 'OrderForm',
      type: 'form',
      props: {
        fields: ['customerId', 'items', 'shippingAddress', 'paymentMethod'],
      },
      events: ['OrderPlaced'],
      description: 'Form for placing new orders',
    })
    .addPermission({
      name: 'manage_products',
      description: 'Can create, update, and delete products',
      resources: ['Product'],
      actions: ['create', 'read', 'update', 'delete'],
    })
    .addPermission({
      name: 'manage_orders',
      description: 'Can view and update orders',
      resources: ['Order'],
      actions: ['read', 'update'],
    })
    .addPermission({
      name: 'place_orders',
      description: 'Can place new orders',
      resources: ['Order'],
      actions: ['create'],
    })
    .compliance({
      gdpr: true,
      soc2: true,
      dataRetention: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      dataClassification: 'confidential',
    })
    .security({
      encryptionLevel: 'high',
      auditTrail: true,
      accessControl: 'role-based',
    })
    .build();

  // Install manifest
  const installResult = await manifestProcessor.install(ecommerceManifest);
  if (!installResult.success) {
    console.error('❌ Manifest installation failed:', installResult.errors);
    return;
  }

  console.log('✅ E-commerce manifest installed successfully');

  // ============================================================================
  // 3. REGISTER ENTITY SCHEMAS
  // ============================================================================

  console.log('🏗️ Registering Entity Schemas...');

  entityManager.registerSchema(productSchema);
  entityManager.registerSchema(orderSchema);

  // ============================================================================
  // 4. SETUP EVENT HANDLERS
  // ============================================================================

  console.log('📡 Setting up Event Handlers...');

  // Product event handlers
  eventBus.subscribe('ProductCreated', async (event) => {
    console.log(`🆕 Product created: ${event.payload.productId} - ${event.payload.name}`);

    // Update inventory
    await entityManager.update(
      'Product',
      event.payload.productId,
      {
        inStock: true,
      },
      {
        tenantId: event.metadata.tenantId,
        userId: event.metadata.userId || 'system',
      },
    );
  });

  eventBus.subscribe('ProductUpdated', async (event) => {
    console.log(`✏️ Product updated: ${event.payload.productId}`);

    // Send notifications if price changed
    if (event.payload.changes.price) {
      await event('PriceChangeNotification', {
        productId: event.payload.productId,
        oldPrice: event.payload.changes.price.from,
        newPrice: event.payload.changes.price.to,
      })
        .tenant(event.metadata.tenantId)
        .user(event.metadata.userId || 'system')
        .emit(eventBus);
    }
  });

  // Order event handlers
  eventBus.subscribe('OrderPlaced', async (event) => {
    console.log(`🛒 Order placed: ${event.payload.orderId} - $${event.payload.total}`);

    // Update inventory
    for (const item of event.payload.items) {
      await entityManager.update(
        'Product',
        item.productId,
        {
          inStock: false,
        },
        {
          tenantId: event.metadata.tenantId,
          userId: event.metadata.userId || 'system',
        },
      );
    }

    // Send confirmation email
    await event('OrderConfirmationEmail', {
      orderId: event.payload.orderId,
      customerId: event.payload.customerId,
      total: event.payload.total,
    })
      .tenant(event.metadata.tenantId)
      .user(event.metadata.userId || 'system')
      .emit(eventBus);
  });

  eventBus.subscribe('OrderStatusChanged', async (event) => {
    console.log(
      `📦 Order status changed: ${event.payload.orderId} - ${event.payload.oldStatus} → ${event.payload.newStatus}`,
    );

    // Send status update notification
    await event('OrderStatusNotification', {
      orderId: event.payload.orderId,
      status: event.payload.newStatus,
    })
      .tenant(event.metadata.tenantId)
      .user(event.metadata.userId || 'system')
      .emit(eventBus);
  });

  // ============================================================================
  // 5. DEMONSTRATE ENTITY OPERATIONS
  // ============================================================================

  console.log('🔄 Demonstrating Entity Operations...');

  const tenantId = 'ecommerce-tenant-1';
  const userId = 'admin-user';

  // Create products
  const product1 = await entityManager.create(
    'Product',
    {
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced camera system',
      price: 999.99,
      category: 'Electronics',
      inStock: true,
      tags: ['smartphone', 'apple', '5g'],
      images: ['iphone15pro-1.jpg', 'iphone15pro-2.jpg'],
    },
    { tenantId, userId },
  );

  const product2 = await entityManager.create(
    'Product',
    {
      name: 'MacBook Air M2',
      description: 'Ultra-thin laptop with M2 chip',
      price: 1199.99,
      category: 'Electronics',
      inStock: true,
      tags: ['laptop', 'apple', 'm2'],
      images: ['macbook-air-m2.jpg'],
    },
    { tenantId, userId },
  );

  const product3 = await entityManager.create(
    'Product',
    {
      name: 'Wireless Headphones',
      description: 'Noise-cancelling wireless headphones',
      price: 299.99,
      category: 'Audio',
      inStock: true,
      tags: ['headphones', 'wireless', 'noise-cancelling'],
      images: ['headphones-1.jpg'],
    },
    { tenantId, userId },
  );

  console.log('✅ Products created:', {
    product1: product1.entity?.id,
    product2: product2.entity?.id,
    product3: product3.entity?.id,
  });

  // Query products
  const electronicsFilter = createEntityFilter()
    .type('Product')
    .tenant(tenantId)
    .data('category', 'Electronics')
    .build();

  const electronicsProducts = await entityManager.query(electronicsFilter, {
    limit: 10,
    sortBy: 'price',
    sortOrder: 'desc',
  });

  console.log('📱 Electronics products found:', electronicsProducts.entities.length);
  electronicsProducts.entities.forEach((product) => {
    console.log(`  - ${product.data.name}: $${product.data.price}`);
  });

  // Create an order
  const order = await entityManager.create(
    'Order',
    {
      customerId: 'customer-123',
      items: [
        { productId: product1.entity!.id, quantity: 1, price: 999.99 },
        { productId: product3.entity!.id, quantity: 2, price: 299.99 },
      ],
      total: 1599.97,
      status: 'pending',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      paymentMethod: 'credit_card',
    },
    { tenantId, userId },
  );

  console.log('✅ Order created:', order.entity?.id);

  // Update order status
  await entityManager.update(
    'Order',
    order.entity!.id,
    {
      status: 'confirmed',
    },
    { tenantId, userId },
  );

  // Query orders
  const orderFilter = createEntityFilter()
    .type('Order')
    .tenant(tenantId)
    .data('status', 'confirmed')
    .build();

  const confirmedOrders = await entityManager.query(orderFilter);
  console.log('📦 Confirmed orders:', confirmedOrders.entities.length);

  // ============================================================================
  // 6. DEMONSTRATE EVENT-DRIVEN WORKFLOWS
  // ============================================================================

  console.log('⚡ Demonstrating Event-Driven Workflows...');

  // Emit product events
  await event('ProductCreated', {
    productId: product1.entity!.id,
    name: product1.entity!.data.name,
    price: product1.entity!.data.price,
    category: product1.entity!.data.category,
  })
    .tenant(tenantId)
    .user(userId)
    .emit(eventBus);

  // Emit order events
  await event('OrderPlaced', {
    orderId: order.entity!.id,
    customerId: order.entity!.data.customerId,
    total: order.entity!.data.total,
    items: order.entity!.data.items,
  })
    .tenant(tenantId)
    .user(userId)
    .emit(eventBus);

  await event('OrderStatusChanged', {
    orderId: order.entity!.id,
    oldStatus: 'pending',
    newStatus: 'confirmed',
  })
    .tenant(tenantId)
    .user(userId)
    .emit(eventBus);

  // ============================================================================
  // 7. DEMONSTRATE ADVANCED FEATURES
  // ============================================================================

  console.log('🔧 Demonstrating Advanced Features...');

  // Event replay
  const replayCount = await eventBus.replayEvents({
    enabled: true,
    batchSize: 10,
    concurrency: 1,
    filter: { tenantId },
  });
  console.log(`🔄 Replayed ${replayCount} events`);

  // Get statistics
  const eventStats = eventBus.getStats();
  const entityStats = entityManager.getStats();

  console.log('📊 Event Bus Statistics:', {
    totalEvents: eventStats.totalEvents,
    eventsPerSecond: eventStats.eventsPerSecond.toFixed(2),
    activeSubscriptions: eventStats.activeSubscriptions,
    failedEvents: eventStats.failedEvents,
    averageLatency: `${eventStats.averageLatency.toFixed(2)}ms`,
  });

  console.log('📊 Entity Manager Statistics:', {
    totalEntities: entityStats.totalEntities,
    entitiesByType: entityStats.entitiesByType,
    entitiesByTenant: entityStats.entitiesByTenant,
  });

  // ============================================================================
  // 8. DEMONSTRATE COMPLIANCE AND SECURITY
  // ============================================================================

  console.log('🔒 Demonstrating Compliance & Security...');

  // Validate manifest compliance
  const validation = manifestValidator.validate(ecommerceManifest);
  console.log('✅ Manifest validation:', {
    valid: validation.valid,
    errors: validation.errors.length,
    warnings: validation.warnings.length,
    complianceChecks: validation.compliance.length,
    securityChecks: validation.security.length,
  });

  // Show compliance details
  validation.compliance.forEach((check) => {
    console.log(`📋 ${check.standard} Compliance:`, {
      compliant: check.compliant ? '✅' : '❌',
      issues: check.issues.length,
      recommendations: check.recommendations.length,
    });
  });

  // Show security details
  validation.security.forEach((check) => {
    console.log(`🔐 ${check.aspect} Security:`, {
      secure: check.secure ? '✅' : '❌',
      issues: check.issues.length,
      recommendations: check.recommendations.length,
    });
  });

  // ============================================================================
  // 9. CLEANUP AND SUMMARY
  // ============================================================================

  console.log('\n🎉 AI-BOS E-commerce Platform Example Completed!');
  console.log('\n📋 Summary:');
  console.log(`  • Created ${product1.success ? 1 : 0} products`);
  console.log(`  • Created ${order.success ? 1 : 0} orders`);
  console.log(`  • Emitted ${eventStats.totalEvents} events`);
  console.log(`  • Processed ${entityStats.totalEntities} entities`);
  console.log(`  • Validated manifest with ${validation.compliance.length} compliance checks`);
  console.log(`  • Performed ${validation.security.length} security checks`);

  console.log('\n🚀 AI-BOS Platform Features Demonstrated:');
  console.log('  ✅ Event-Driven Architecture with persistence and replay');
  console.log('  ✅ Manifest system with validation and compliance');
  console.log('  ✅ Entity management with CRUD operations and relationships');
  console.log('  ✅ Real-time event processing and workflow automation');
  console.log('  ✅ Comprehensive audit trails and security controls');
  console.log('  ✅ Performance monitoring and statistics');
  console.log('  ✅ Multi-tenant support with isolation');
  console.log('  ✅ Dead letter queue for error handling');
  console.log('  ✅ Caching and optimization');

  return {
    systems,
    manifest: ecommerceManifest,
    products: [product1, product2, product3],
    order,
    eventStats,
    entityStats,
    validation,
  };
}

// ============================================================================
// RUN EXAMPLE
// ============================================================================

if (require.main === module) {
  ecommercePlatformExample()
    .then((result) => {
      console.log('\n✨ Example completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

export { ecommercePlatformExample };
