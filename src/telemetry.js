import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';

/**
 * Initialize OpenTelemetry tracing for the browser application
 * This creates distributed traces that can be viewed in OpenObserve
 */
export function initTelemetry(config = {}) {
    const {
        serviceName = 'demo-rum',
        serviceVersion = '0.0.1',
        environment = 'production',
        endpoint = 'https://o2-openobserve.p.zacharie.org/api/default/v1/traces',
        headers = {}
    } = config;

    // Create a resource with service information
    const resource = new Resource({
        [ATTR_SERVICE_NAME]: serviceName,
        [ATTR_SERVICE_VERSION]: serviceVersion,
        'deployment.environment': environment,
        'telemetry.sdk.language': 'javascript',
        'telemetry.sdk.name': 'opentelemetry',
    });

    // Create the tracer provider
    const provider = new WebTracerProvider({
        resource: resource,
    });

    // Configure OTLP exporter to send traces to OpenObserve
    const exporter = new OTLPTraceExporter({
        url: endpoint,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
    });

    // Add batch span processor
    provider.addSpanProcessor(new BatchSpanProcessor(exporter, {
        maxQueueSize: 100,
        maxExportBatchSize: 10,
        scheduledDelayMillis: 500,
    }));

    // Register the provider
    provider.register({
        contextManager: new ZoneContextManager(),
    });

    // Register automatic instrumentations
    registerInstrumentations({
        instrumentations: [
            // Instrument fetch API calls
            new FetchInstrumentation({
                propagateTraceHeaderCorsUrls: [/.*/],
                clearTimingResources: true,
                applyCustomAttributesOnSpan: (span, request, result) => {
                    if (request instanceof Request) {
                        span.setAttribute('http.request.url', request.url);
                        span.setAttribute('http.request.method', request.method);
                    }
                    if (result instanceof Response) {
                        span.setAttribute('http.response.status_code', result.status);
                    }
                },
            }),

            // Instrument XMLHttpRequest
            new XMLHttpRequestInstrumentation({
                propagateTraceHeaderCorsUrls: [/.*/],
            }),

            // Instrument document load events
            new DocumentLoadInstrumentation(),

            // Instrument user interactions (clicks, etc.)
            new UserInteractionInstrumentation({
                eventNames: ['click', 'submit', 'dblclick', 'keydown'],
            }),
        ],
    });

    console.log('✅ OpenTelemetry initialized with service:', serviceName);

    return provider;
}

/**
 * Get the tracer instance for manual instrumentation
 */
export function getTracer(name = 'demo-rum-tracer') {
    return trace.getTracer(name);
}

/**
 * Create a custom span for tracking user actions
 */
export function createActionSpan(actionName, attributes = {}) {
    const tracer = getTracer();
    const span = tracer.startSpan(actionName, {
        attributes: {
            'action.type': 'user_action',
            'action.timestamp': new Date().toISOString(),
            ...attributes
        }
    });
    return span;
}

/**
 * Execute a function within a traced span with optional service name override
 */
export async function traceAction(actionName, fn, attributes = {}, serviceName = null) {
    const tracer = getTracer();

    return tracer.startActiveSpan(actionName, async (span) => {
        try {
            // Add service name if provided
            if (serviceName) {
                span.setAttribute('service.name', serviceName);
            }

            // Add custom attributes
            Object.entries(attributes).forEach(([key, value]) => {
                span.setAttribute(key, value);
            });

            // Execute the function
            const result = await fn(span);

            // Mark span as successful
            span.setStatus({ code: SpanStatusCode.OK });

            return result;
        } catch (error) {
            // Record the error
            span.recordException(error);
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message,
            });
            throw error;
        } finally {
            // Always end the span
            span.end();
        }
    });
}

/**
 * Add an event to the current span
 */
export function addSpanEvent(eventName, attributes = {}) {
    const currentSpan = trace.getActiveSpan();
    if (currentSpan) {
        currentSpan.addEvent(eventName, attributes);
    }
}

/**
 * Set attributes on the current span
 */
export function setSpanAttributes(attributes = {}) {
    const currentSpan = trace.getActiveSpan();
    if (currentSpan) {
        Object.entries(attributes).forEach(([key, value]) => {
            currentSpan.setAttribute(key, value);
        });
    }
}

/**
 * Create a nested span (child span)
 */
export function createNestedSpan(spanName, attributes = {}) {
    const tracer = getTracer();
    const span = tracer.startSpan(spanName, {
        attributes: {
            'span.timestamp': new Date().toISOString(),
            ...attributes
        }
    });
    return span;
}

/**
 * Trace a database operation with dedicated service name
 */
export async function traceDatabaseOperation(operation, dbName, fn) {
    return traceAction(`db.${operation}`, fn, {
        'db.system': 'postgresql',
        'db.name': dbName,
        'db.operation': operation,
        'component': 'database',
    }, 'demo-rum-database-service');
}

/**
 * Trace an API call with dedicated service name
 */
export async function traceApiCall(method, endpoint, fn) {
    return traceAction(`http.${method.toLowerCase()}`, fn, {
        'http.method': method,
        'http.url': endpoint,
        'component': 'http',
    }, 'demo-rum-api-gateway');
}

/**
 * Trace a plugin load operation with dedicated service name
 */
export async function tracePluginLoad(pluginId, pluginName, fn) {
    return traceAction('plugin.load', fn, {
        'plugin.id': pluginId,
        'plugin.name': pluginName,
        'operation': 'load',
        'component': 'plugin_manager',
    }, 'demo-rum-plugin-service');
}

/**
 * Get the current trace context
 */
export function getCurrentContext() {
    return context.active();
}

/**
 * Trace a user service operation
 */
export async function traceUserService(operation, fn, attributes = {}) {
    return traceAction(`user.${operation}`, fn, {
        'service.type': 'user-management',
        ...attributes
    }, 'demo-rum-user-service');
}

/**
 * Trace a product service operation
 */
export async function traceProductService(operation, fn, attributes = {}) {
    return traceAction(`product.${operation}`, fn, {
        'service.type': 'product-catalog',
        ...attributes
    }, 'demo-rum-product-service');
}

/**
 * Trace an analytics service operation
 */
export async function traceAnalyticsService(operation, fn, attributes = {}) {
    return traceAction(`analytics.${operation}`, fn, {
        'service.type': 'analytics',
        ...attributes
    }, 'demo-rum-analytics-service');
}

/**
 * Trace a payment service operation
 */
export async function tracePaymentService(operation, fn, attributes = {}) {
    return traceAction(`payment.${operation}`, fn, {
        'service.type': 'payment-processing',
        ...attributes
    }, 'demo-rum-payment-service');
}

/**
 * Trace an inventory service operation
 */
export async function traceInventoryService(operation, fn, attributes = {}) {
    return traceAction(`inventory.${operation}`, fn, {
        'service.type': 'inventory-management',
        ...attributes
    }, 'demo-rum-inventory-service');
}

/**
 * Trace an order service operation
 */
export async function traceOrderService(operation, fn, attributes = {}) {
    return traceAction(`order.${operation}`, fn, {
        'service.type': 'order-management',
        ...attributes
    }, 'demo-rum-order-service');
}

/**
 * Trace a notification service operation
 */
export async function traceNotificationService(operation, fn, attributes = {}) {
    return traceAction(`notification.${operation}`, fn, {
        'service.type': 'notification',
        ...attributes
    }, 'demo-rum-notification-service');
}

/**
 * Export for use in other modules
 */
export { trace, context, SpanStatusCode };
