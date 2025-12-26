import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';
import {
    initTelemetry,
    tracePluginLoad,
    addSpanEvent,
    setSpanAttributes,
    traceDatabaseOperation
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

const plugins = [
    { id: 'analytics', name: 'Advanced Analytics', description: 'Deep dive into user behavior', type: 'Database' },
    { id: 'security', name: 'Security Scanner', description: 'Monitor for vulnerabilities', type: 'API' },
    { id: 'perf', name: 'Performance Optimizer', description: 'Automatically tune site speed', type: 'Cache' },
    { id: 'export', name: 'Data Exporter', description: 'Export logs to S3', type: 'Storage' }
];

const pluginGrid = document.getElementById('plugin-grid');

plugins.forEach(plugin => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
        <h4>${plugin.name}</h4>
        <p>${plugin.description}</p>
        <div style="margin-top: 15px">
            <button class="demo-button primary" id="load-${plugin.id}">Load Plugin</button>
        </div>
    `;
    pluginGrid.appendChild(card);

    document.getElementById(`load-${plugin.id}`).addEventListener('click', async () => {
        await tracePluginLoad(plugin.id, plugin.name, async (span) => {
            showNotification(`🔄 Loading ${plugin.name} from DB...`, 'info');

            // Add plugin metadata to span
            span.setAttribute('plugin.type', plugin.type);
            span.setAttribute('plugin.description', plugin.description);

            // Add event for plugin load start
            addSpanEvent('plugin_load_started', {
                'plugin.id': plugin.id,
                'timestamp': new Date().toISOString()
            });

            try {
                // Trace the database operation as a nested span
                const data = await traceDatabaseOperation('query', 'demo-rum', async (dbSpan) => {
                    // Add database-specific attributes
                    dbSpan.setAttribute('db.statement', `SELECT * FROM plugins WHERE id = '${plugin.id}'`);
                    dbSpan.setAttribute('db.table', 'plugins');

                    // Add event for query start
                    addSpanEvent('db_query_started', {
                        'query': 'SELECT plugins',
                        'timestamp': new Date().toISOString()
                    });

                    // Make the API call
                    const response = await fetch(`/api/load-plugin/${plugin.id}`);
                    const result = await response.json();

                    // Add event for query complete
                    addSpanEvent('db_query_completed', {
                        'rows_returned': 1,
                        'timestamp': new Date().toISOString()
                    });

                    return result;
                });

                if (data.status === 'loaded') {
                    // Add success event
                    addSpanEvent('plugin_loaded_successfully', {
                        'plugin.name': data.name,
                        'timestamp': new Date().toISOString()
                    });

                    openobserveRum.addAction('plugin_load', {
                        plugin_id: plugin.id,
                        plugin_name: data.name,
                        database: 'demo-rum',
                        status: 'success'
                    });

                    openobserveLogs.logger.info(`Plugin ${data.name} loaded from demo-rum database`, {
                        plugin_id: plugin.id,
                        db: 'demo-rum'
                    });

                    showNotification(`✅ ${data.name} loaded from DB successfully`, 'success');
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            } catch (err) {
                // Record exception in span
                span.recordException(err);

                // Add error event
                addSpanEvent('plugin_load_failed', {
                    'error.message': err.message,
                    'timestamp': new Date().toISOString()
                });

                openobserveLogs.logger.error('Plugin loading failed', { error: err.message });
                showNotification(`❌ Error: ${err.message}`, 'error');
                throw err;
            }
        });
    });
});

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    Object.assign(notification.style, {
        position: 'fixed', top: '20px', right: '20px', padding: '1rem 1.5rem',
        borderRadius: '0.75rem', background: type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: 'white', fontWeight: '600', zIndex: '1000', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
    });
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}
