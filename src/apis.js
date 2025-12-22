import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

const options = window.RUM_CONFIG || {
    clientToken: 'rumZmfACViIKP6YzziM',
    applicationId: 'demo-rum-app',
    site: 'o2-openobserve.p.zacharie.org',
    service: 'demo-rum',
    env: 'production',
    version: '0.0.6',
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

// HackerNews button
document.getElementById('btn-hackernews').addEventListener('click', async () => {
    showNotification('🔄 Fetching HackerNews...', 'info');

    try {
        const response = await fetch('/api/hackernews');
        const data = await response.json();

        if (data.stories && data.stories.length > 0) {
            const resultsDiv = document.getElementById('hackernews-results');
            resultsDiv.innerHTML = '<ul style="list-style: none; padding: 0;">' +
                data.stories.map((story, i) =>
                    `<li style="margin: 10px 0; padding: 10px; background: var(--bg-secondary); border-radius: 8px;">
                        <strong>${i + 1}.</strong> <a href="${story.url}" target="_blank" style="color: var(--primary)">${story.title}</a>
                    </li>`
                ).join('') +
                '</ul>';

            openobserveRum.addAction('fetch_hackernews', {
                action_type: 'external_api',
                api: 'hackernews',
                count: data.count
            });

            openobserveLogs.logger.info('HackerNews stories fetched', { count: data.count });
            showNotification(`✅ Loaded ${data.count} stories`, 'success');
        } else {
            throw new Error(data.error || 'No stories found');
        }
    } catch (err) {
        openobserveLogs.logger.error('HackerNews fetch failed', { error: err.message });
        showNotification(`❌ Error: ${err.message}`, 'error');
    }
});

// Chuck Norris button
document.getElementById('btn-chucknorris').addEventListener('click', async () => {
    showNotification('🔄 Getting Chuck Norris fact...', 'info');

    try {
        const response = await fetch('/api/chucknorris');
        const data = await response.json();

        if (data.fact) {
            const resultsDiv = document.getElementById('chucknorris-results');
            resultsDiv.innerHTML = `
                <div style="padding: 20px; background: var(--bg-secondary); border-radius: 8px; border-left: 4px solid var(--accent);">
                    <p style="font-size: 1.1rem; font-style: italic;">"${data.fact}"</p>
                    <p style="color: var(--text-muted); margin-top: 10px;">— ${data.source || 'Unknown'}</p>
                </div>
            `;

            openobserveRum.addAction('fetch_chucknorris', {
                action_type: 'external_api',
                api: 'chucknorris'
            });

            openobserveLogs.logger.info('Chuck Norris fact fetched', { source: data.source });
            showNotification('✅ Fact loaded', 'success');
        } else {
            throw new Error(data.error || 'No fact found');
        }
    } catch (err) {
        openobserveLogs.logger.error('Chuck Norris fetch failed', { error: err.message });
        showNotification(`❌ Error: ${err.message}`, 'error');
    }
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
