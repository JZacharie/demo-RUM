import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';
import {
    initTelemetry,
    traceAction,
    addSpanEvent,
    setSpanAttributes,
    traceApiCall,
    traceDatabaseOperation,
    createNestedSpan,
    getTracer,
    traceUserService,
    traceProductService,
    traceAnalyticsService,
    tracePaymentService,
    traceInventoryService,
    traceOrderService
} from './telemetry.js';

const options = window.RUM_CONFIG || {
    clientToken: 'rumZmfACViIKP6YzziM',
    applicationId: 'demo-rum-app',
    site: 'o2-openobserve.p.zacharie.org',
    service: 'demo-rum',
    env: 'production',
    version: '0.0.4',
    organizationIdentifier: 'default',
    insecureHTTP: false,
    apiVersion: 'v1',
};

// Initialize OpenTelemetry tracing
initTelemetry({
    serviceName: options.service,
    serviceVersion: options.version,
    environment: options.env,
    endpoint: `https://${options.site}/api/${options.organizationIdentifier}/v1/traces`,
    headers: {
        'Authorization': `Basic ${btoa(`${options.clientToken}:`)}`,
        'stream-name': 'default'
    }
});

// Initialize OpenObserve RUM
openobserveRum.init({
    applicationId: options.applicationId,
    clientToken: options.clientToken,
    site: options.site,
    organizationIdentifier: options.organizationIdentifier,
    service: options.service,
    env: options.env,
    version: options.version,
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    apiVersion: options.apiVersion,
    insecureHTTP: options.insecureHTTP,
    defaultPrivacyLevel: 'allow'
});

// Initialize OpenObserve Logs
openobserveLogs.init({
    clientToken: options.clientToken,
    site: options.site,
    organizationIdentifier: options.organizationIdentifier,
    service: options.service,
    env: options.env,
    version: options.version,
    forwardErrorsToLogs: true,
    insecureHTTP: options.insecureHTTP,
    apiVersion: options.apiVersion,
});

openobserveRum.startSessionReplayRecording();

// Statistics
let totalTraces = 0;
let totalSpans = 0;
let totalDuration = 0;

function updateStats(spanCount = 1, duration = 0) {
    totalTraces++;
    totalSpans += spanCount;
    totalDuration += duration;

    document.getElementById('total-traces').textContent = totalTraces;
    document.getElementById('total-spans').textContent = totalSpans;
    document.getElementById('avg-duration').textContent =
        totalTraces > 0 ? `${Math.round(totalDuration / totalTraces)}ms` : '0ms';
}

// Helper functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    Object.assign(notification.style, {
        position: 'fixed', top: '20px', right: '20px', padding: '1rem 1.5rem',
        borderRadius: '0.75rem',
        background: type === 'success' ? '#22c55e' :
            type === 'error' ? '#ef4444' :
                type === 'warning' ? '#f59e0b' : '#3b82f6',
        color: 'white', fontWeight: '600', zIndex: '1000',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
    });
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Simple Actions
document.getElementById('btn-simple-action').addEventListener('click', async () => {
    const startTime = performance.now();

    await traceAction('user.simple_action', async (span) => {
        span.setAttribute('action.category', 'simple');
        span.setAttribute('user.id', 'demo-user');

        await sleep(100);

        addSpanEvent('action_completed', {
            'result': 'success',
            'timestamp': new Date().toISOString()
        });

        openobserveLogs.logger.info('Simple action completed');
    }, {}, 'demo-rum-frontend');

    const duration = performance.now() - startTime;
    updateStats(1, duration);
    showNotification('✅ Simple action traced!', 'success');
});

document.getElementById('btn-api-call').addEventListener('click', async () => {
    const startTime = performance.now();

    await traceApiCall('GET', '/api/users', async (span) => {
        span.setAttribute('http.status_code', 200);
        span.setAttribute('http.response_size', 1024);

        addSpanEvent('request_sent', { 'timestamp': new Date().toISOString() });
        await sleep(200);
        addSpanEvent('response_received', { 'timestamp': new Date().toISOString() });

        openobserveLogs.logger.info('API call completed', { endpoint: '/api/users' });
    });

    const duration = performance.now() - startTime;
    updateStats(1, duration);
    showNotification('✅ API call traced!', 'success');
});

document.getElementById('btn-db-query').addEventListener('click', async () => {
    const startTime = performance.now();

    await traceDatabaseOperation('SELECT', 'demo-rum', async (span) => {
        span.setAttribute('db.statement', 'SELECT * FROM users WHERE active = true');
        span.setAttribute('db.table', 'users');
        span.setAttribute('db.rows_affected', 42);

        addSpanEvent('query_started', { 'timestamp': new Date().toISOString() });
        await sleep(150);
        addSpanEvent('query_completed', { 'rows': 42, 'timestamp': new Date().toISOString() });

        openobserveLogs.logger.info('Database query completed', { rows: 42 });
    });

    const duration = performance.now() - startTime;
    updateStats(1, duration);
    showNotification('✅ Database query traced!', 'success');
});

// Complex Workflows
document.getElementById('btn-checkout').addEventListener('click', async () => {
    const startTime = performance.now();

    await traceAction('ecommerce.checkout', async (parentSpan) => {
        parentSpan.setAttribute('cart.items', 3);
        parentSpan.setAttribute('cart.total', 149.99);
        parentSpan.setAttribute('user.id', 'user-123');

        addSpanEvent('checkout_started', { 'timestamp': new Date().toISOString() });

        // Step 1: Validate cart (Database Service)
        await traceDatabaseOperation('SELECT', 'demo-rum', async (span) => {
            span.setAttribute('db.operation', 'validate_cart');
            span.setAttribute('db.table', 'cart_items');
            await sleep(100);
            addSpanEvent('cart_validated', { 'items': 3 });
        });

        // Step 2: Process payment (Payment Service)
        await tracePaymentService('process', async (span) => {
            span.setAttribute('payment.method', 'credit_card');
            span.setAttribute('payment.amount', 149.99);
            span.setAttribute('payment.currency', 'EUR');
            await sleep(300);
            addSpanEvent('payment_processed', { 'transaction_id': 'txn-456' });
        });

        // Step 3: Update inventory (Inventory Service)
        await traceInventoryService('update', async (span) => {
            span.setAttribute('inventory.operation', 'reserve_items');
            span.setAttribute('inventory.items_count', 3);
            await sleep(80);
            addSpanEvent('inventory_updated', { 'products': 3 });
        });

        // Step 4: Create order (Order Service)
        await traceOrderService('create', async (span) => {
            span.setAttribute('order.id', 'ord-789');
            span.setAttribute('order.total', 149.99);
            span.setAttribute('order.status', 'confirmed');
            await sleep(120);
            addSpanEvent('order_created', { 'order_id': 'ord-789' });
        });

        addSpanEvent('checkout_completed', {
            'order_id': 'ord-789',
            'timestamp': new Date().toISOString()
        });

        openobserveLogs.logger.info('Checkout completed', {
            order_id: 'ord-789',
            total: 149.99
        });
    }, {}, 'demo-rum-frontend');

    const duration = performance.now() - startTime;
    updateStats(5, duration);
    showNotification('✅ E-commerce checkout traced with 5 spans!', 'success');
});

document.getElementById('btn-data-pipeline').addEventListener('click', async () => {
    const startTime = performance.now();

    await traceAction('pipeline.process_data', async (parentSpan) => {
        parentSpan.setAttribute('pipeline.name', 'user_analytics');
        parentSpan.setAttribute('pipeline.records', 1000);

        // Step 1: Extract data
        await traceAction('pipeline.extract', async (span) => {
            span.setAttribute('source', 'postgresql');
            span.setAttribute('records_extracted', 1000);
            await sleep(200);
            addSpanEvent('extraction_complete', { 'records': 1000 });
        }, {}, 'demo-rum-etl-extract');

        // Step 2: Transform data
        await traceAction('pipeline.transform', async (span) => {
            span.setAttribute('transformations', 'normalize,enrich,aggregate');
            await sleep(300);
            addSpanEvent('transformation_complete', { 'records': 950 });
        }, {}, 'demo-rum-etl-transform');

        // Step 3: Load data
        await traceAction('pipeline.load', async (span) => {
            span.setAttribute('destination', 'data_warehouse');
            span.setAttribute('records_loaded', 950);
            await sleep(250);
            addSpanEvent('load_complete', { 'records': 950 });
        }, {}, 'demo-rum-etl-load');

        addSpanEvent('pipeline_completed', {
            'records_processed': 950,
            'timestamp': new Date().toISOString()
        });

        openobserveLogs.logger.info('Data pipeline completed', { records: 950 });
    }, {}, 'demo-rum-etl-orchestrator');

    const duration = performance.now() - startTime;
    updateStats(4, duration);
    showNotification('✅ Data pipeline traced with 4 spans!', 'success');
});

document.getElementById('btn-microservices').addEventListener('click', async () => {
    const startTime = performance.now();

    await traceAction('microservices.orchestration', async (parentSpan) => {
        parentSpan.setAttribute('orchestrator', 'api_gateway');

        // Call user service
        await traceUserService('get_profile', async (span) => {
            span.setAttribute('user.id', 'user-123');
            span.setAttribute('service.version', '1.2.0');
            await sleep(120);
            addSpanEvent('user_data_fetched', { 'user_id': 'user-123' });
        });

        // Call product service
        await traceProductService('get_recommendations', async (span) => {
            span.setAttribute('user.id', 'user-123');
            span.setAttribute('service.version', '2.1.0');
            span.setAttribute('recommendations.count', 10);
            await sleep(180);
            addSpanEvent('recommendations_fetched', { 'count': 10 });
        });

        // Call analytics service
        await traceAnalyticsService('track_event', async (span) => {
            span.setAttribute('event.type', 'page_view');
            span.setAttribute('service.version', '1.0.5');
            await sleep(90);
            addSpanEvent('event_tracked', { 'event': 'page_view' });
        });

        addSpanEvent('orchestration_completed', {
            'services_called': 3,
            'timestamp': new Date().toISOString()
        });

        openobserveLogs.logger.info('Microservices orchestration completed');
    }, {}, 'demo-rum-api-gateway');

    const duration = performance.now() - startTime;
    updateStats(4, duration);
    showNotification('✅ Microservices call traced with 4 spans!', 'success');
});

// Performance Scenarios
document.getElementById('btn-fast-operation').addEventListener('click', async () => {
    const startTime = performance.now();

    await traceAction('performance.fast_operation', async (span) => {
        span.setAttribute('performance.category', 'fast');
        const delay = 50 + Math.random() * 50;
        await sleep(delay);
        span.setAttribute('operation.duration_ms', delay);
        addSpanEvent('operation_completed', { 'duration': delay });
    });

    const duration = performance.now() - startTime;
    updateStats(1, duration);
    showNotification(`⚡ Fast operation completed in ${Math.round(duration)}ms`, 'success');
});

document.getElementById('btn-slow-operation').addEventListener('click', async () => {
    const startTime = performance.now();

    await traceAction('performance.slow_operation', async (span) => {
        span.setAttribute('performance.category', 'slow');
        const delay = 2000 + Math.random() * 1000;

        addSpanEvent('operation_started', { 'expected_duration': '2-3s' });
        await sleep(delay);

        span.setAttribute('operation.duration_ms', delay);
        addSpanEvent('operation_completed', { 'duration': delay });

        openobserveLogs.logger.warn('Slow operation detected', { duration: delay });
    });

    const duration = performance.now() - startTime;
    updateStats(1, duration);
    showNotification(`🐌 Slow operation completed in ${Math.round(duration)}ms`, 'warning');
});

document.getElementById('btn-parallel-operations').addEventListener('click', async () => {
    const startTime = performance.now();

    await traceAction('performance.parallel_operations', async (parentSpan) => {
        parentSpan.setAttribute('operations.count', 3);
        parentSpan.setAttribute('execution.mode', 'parallel');

        // Execute operations in parallel
        await Promise.all([
            traceAction('operation.task_1', async (span) => {
                span.setAttribute('task.id', 1);
                await sleep(150);
                addSpanEvent('task_1_completed');
            }),
            traceAction('operation.task_2', async (span) => {
                span.setAttribute('task.id', 2);
                await sleep(200);
                addSpanEvent('task_2_completed');
            }),
            traceAction('operation.task_3', async (span) => {
                span.setAttribute('task.id', 3);
                await sleep(100);
                addSpanEvent('task_3_completed');
            })
        ]);

        addSpanEvent('all_tasks_completed', { 'timestamp': new Date().toISOString() });
    });

    const duration = performance.now() - startTime;
    updateStats(4, duration);
    showNotification(`🔀 Parallel operations completed in ${Math.round(duration)}ms`, 'success');
});

document.getElementById('btn-error-scenario').addEventListener('click', async () => {
    const startTime = performance.now();

    try {
        await traceAction('error.scenario', async (span) => {
            span.setAttribute('error.expected', true);

            addSpanEvent('operation_started', { 'timestamp': new Date().toISOString() });
            await sleep(100);

            // Simulate an error
            throw new Error('Simulated error for tracing demonstration');
        });
    } catch (error) {
        openobserveLogs.logger.error('Error scenario executed', {
            error: error.message
        });
    }

    const duration = performance.now() - startTime;
    updateStats(1, duration);
    showNotification('💥 Error scenario traced successfully!', 'warning');
});

console.log('🚀 OpenTelemetry Traces page initialized!');
