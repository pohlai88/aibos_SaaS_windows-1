const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for billing routes');
} catch (error) {
  console.error('❌ Failed to initialize AI Database System:', error.message);
  aiDatabaseSystem = null;
}

// Database connection
let db;
try {
  const supabaseModule = require('../utils/supabase');
  db = supabaseModule.db;
} catch (error) {
  console.error('❌ Failed to initialize Supabase for billing:', error.message);
  db = null;
}

// GET /api/billing/metrics - Get billing metrics
router.get('/metrics', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get billing data from database
    const [subscriptions, invoices, customers] = await Promise.all([
      db.listSubscriptions(req.user?.tenant_id),
      db.listInvoices(req.user?.tenant_id),
      db.listCustomers(req.user?.tenant_id)
    ]);

    // Calculate billing metrics
    const billingMetrics = {
      currentPeriodRevenue: calculateCurrentPeriodRevenue(invoices),
      previousPeriodRevenue: calculatePreviousPeriodRevenue(invoices),
      growthRate: calculateGrowthRate(invoices),
      activeSubscriptions: subscriptions.filter(sub => sub.status === 'active').length,
      totalCustomers: customers.length,
      monthlyRecurringRevenue: calculateMRR(subscriptions),
      churnRate: calculateChurnRate(subscriptions),
      averageRevenuePerUser: calculateARPU(subscriptions, customers)
    };

    console.log('💰 Billing metrics calculated:', billingMetrics);

    res.json({
      success: true,
      data: billingMetrics,
      message: 'Billing metrics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Billing metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate billing metrics'
    });
  }
});

// GET /api/billing/subscriptions - Get subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0, status, customerId } = req.query;

    // Get subscriptions from database
    const subscriptions = await db.listSubscriptions(req.user?.tenant_id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      customerId
    });

    console.log(`💰 Retrieved ${subscriptions.length} subscriptions`);

    res.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length,
      message: 'Subscriptions retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Subscriptions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subscriptions'
    });
  }
});

// POST /api/billing/subscriptions - Create subscription
router.post('/subscriptions', async (req, res) => {
  try {
    const { customerId, planId, amount, currency, billingCycle } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Create subscription
    const subscription = {
      subscription_id: uuidv4(),
      customer_id: customerId,
      plan_id: planId,
      amount,
      currency,
      billing_cycle: billingCycle,
      status: 'active',
      created_at: new Date(),
      next_billing_date: calculateNextBillingDate(billingCycle)
    };

    const result = await db.createSubscription(subscription);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create subscription'
      });
    }

    console.log('💰 Subscription created successfully');

    res.json({
      success: true,
      data: result.data,
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('❌ Create subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
});

// GET /api/billing/invoices - Get invoices
router.get('/invoices', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0, status, customerId } = req.query;

    // Get invoices from database
    const invoices = await db.listInvoices(req.user?.tenant_id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      customerId
    });

    console.log(`💰 Retrieved ${invoices.length} invoices`);

    res.json({
      success: true,
      data: invoices,
      count: invoices.length,
      message: 'Invoices retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve invoices'
    });
  }
});

// GET /api/billing/invoices/:id/download - Download invoice
router.get('/invoices/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get invoice details
    const invoice = await db.getInvoice(id);

    if (!invoice.success) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Generate PDF invoice (TODO: Implement PDF generation)
    const pdfBuffer = await generateInvoicePDF(invoice.data);

    console.log(`💰 Invoice ${id} downloaded successfully`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Download invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download invoice'
    });
  }
});

// GET /api/billing/customers - Get customers
router.get('/customers', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0 } = req.query;

    // Get customers from database
    const customers = await db.listCustomers(req.user?.tenant_id, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`💰 Retrieved ${customers.length} customers`);

    res.json({
      success: true,
      data: customers,
      count: customers.length,
      message: 'Customers retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve customers'
    });
  }
});

// GET /api/billing/payment-methods - Get payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get payment methods from database
    const paymentMethods = await db.listPaymentMethods(req.user?.tenant_id);

    console.log(`💰 Retrieved ${paymentMethods.length} payment methods`);

    res.json({
      success: true,
      data: paymentMethods,
      count: paymentMethods.length,
      message: 'Payment methods retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Payment methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment methods'
    });
  }
});

// POST /api/billing/payment-methods - Add payment method
router.post('/payment-methods', async (req, res) => {
  try {
    const { type, last4, brand, expiryMonth, expiryYear, isDefault } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Add payment method
    const paymentMethod = {
      payment_method_id: uuidv4(),
      type,
      last4,
      brand,
      expiry_month: expiryMonth,
      expiry_year: expiryYear,
      is_default: isDefault,
      created_at: new Date()
    };

    const result = await db.createPaymentMethod(paymentMethod);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to add payment method'
      });
    }

    console.log('💰 Payment method added successfully');

    res.json({
      success: true,
      data: result.data,
      message: 'Payment method added successfully'
    });

  } catch (error) {
    console.error('❌ Add payment method error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add payment method'
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

function calculateCurrentPeriodRevenue(invoices) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return invoices
    .filter(invoice => {
      const invoiceDate = new Date(invoice.created_at);
      return invoiceDate.getMonth() === currentMonth &&
             invoiceDate.getFullYear() === currentYear &&
             invoice.status === 'paid';
    })
    .reduce((sum, invoice) => sum + invoice.amount, 0);
}

function calculatePreviousPeriodRevenue(invoices) {
  const previousMonth = new Date().getMonth() - 1;
  const currentYear = new Date().getFullYear();

  return invoices
    .filter(invoice => {
      const invoiceDate = new Date(invoice.created_at);
      return invoiceDate.getMonth() === previousMonth &&
             invoiceDate.getFullYear() === currentYear &&
             invoice.status === 'paid';
    })
    .reduce((sum, invoice) => sum + invoice.amount, 0);
}

function calculateGrowthRate(invoices) {
  const current = calculateCurrentPeriodRevenue(invoices);
  const previous = calculatePreviousPeriodRevenue(invoices);

  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function calculateMRR(subscriptions) {
  return subscriptions
    .filter(sub => sub.status === 'active' && sub.billing_cycle === 'monthly')
    .reduce((sum, sub) => sum + sub.amount, 0);
}

function calculateChurnRate(subscriptions) {
  const total = subscriptions.length;
  const canceled = subscriptions.filter(sub => sub.status === 'canceled').length;

  if (total === 0) return 0;
  return (canceled / total) * 100;
}

function calculateARPU(subscriptions, customers) {
  const totalRevenue = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + sub.amount, 0);

  const activeCustomers = customers.length;

  if (activeCustomers === 0) return 0;
  return totalRevenue / activeCustomers;
}

function calculateNextBillingDate(billingCycle) {
  const now = new Date();

  switch (billingCycle) {
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case 'yearly':
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
}

async function generateInvoicePDF(invoice) {
  // TODO: Implement PDF generation
  // For now, return a mock PDF buffer
  return Buffer.from('Mock PDF content');
}

module.exports = router;
