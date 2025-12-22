import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

const options = window.RUM_CONFIG || {
    clientToken: 'rumZmfACViIKP6YzziM',
    applicationId: 'demo-rum-app',
    site: 'o2-openobserve.p.zacharie.org',
    service: 'demo-rum',
    env: 'production',
    version: '0.0.3',
    organizationIdentifier: 'default',
    insecureHTTP: false,
    apiVersion: 'v1',
};

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
        const startTime = performance.now();
        showNotification(`🔄 Loading ${plugin.name}...`, 'info');

        // Simulate a DB Query monitored by APM (mocking fetch to a backend)
        // In a real app, this would be a fetch to an instrumented backend
        // Here we track it via RUM and OTel simulator
        try {
            const queryTime = Math.random() * 500 + 200;

            // SIMULATE BACKEND APM TRACE
            // This is what would show up in APM if we had a backend
            console.log(`[APM] TRACE: SELECT * FROM plugins WHERE id = '${plugin.id}' - DB: demo-rum - Duration: ${queryTime}ms`);

            await new Promise(resolve => setTimeout(resolve, queryTime));

            openobserveRum.addAction('plugin_load', {
                plugin_id: plugin.id,
                plugin_name: plugin.name,
                duration: queryTime,
                database: 'demo-rum',
                query: `SELECT * FROM plugins WHERE id = '${plugin.id}'`
            });

            openobserveLogs.logger.info(`Plugin ${plugin.name} loaded from demo-rum database`, {
                plugin_id: plugin.id,
                db: 'demo-rum',
                latency: queryTime
            });

            showNotification(`✅ ${plugin.name} loaded from DB in ${queryTime.toFixed(0)}ms`, 'success');
        } catch (err) {
            openobserveLogs.logger.error('Plugin loading failed', { error: err.message });
        }
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
